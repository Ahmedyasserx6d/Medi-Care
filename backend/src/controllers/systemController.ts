import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import SystemState from '../models/SystemState';
import User from '../models/User';
import DoctorSchedule from '../models/DoctorSchedule';
import { clearRuntimeCache } from '../services/runtimeCache';

const LOCKDOWN_KEY = 'emergency-lockdown';

const STAFF_ROLES = ['Doctor', 'Receptionist'] as const;
const STAFF_PROFILE_FIELDS = ['role', 'firstName', 'lastName', 'email', 'phone', 'specialty', 'degree', 'experience', 'bio', 'avatar', 'imageUrl'] as const;
const MAX_STAFF_RECORDS = 2_000;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateStaffRecord = (record: any) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return 'Each staff record must be an object.';
  if (!STAFF_ROLES.includes(record.role)) return 'Only Doctor and Receptionist records can be imported.';
  if (typeof record.firstName !== 'string' || !record.firstName.trim() || record.firstName.length > 120) return 'Each staff member needs a valid first name.';
  if (typeof record.lastName !== 'string' || !record.lastName.trim() || record.lastName.length > 120) return 'Each staff member needs a valid last name.';
  if (typeof record.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email) || record.email.length > 254) return 'Each staff member needs a valid email address.';

  for (const field of ['phone', 'specialty', 'degree', 'experience', 'bio', 'avatar', 'imageUrl']) {
    if (record[field] !== undefined && record[field] !== null && (typeof record[field] !== 'string' || record[field].length > 2_000)) {
      return `Invalid ${field} value.`;
    }
  }

  if (record.schedule !== undefined && record.schedule !== null) {
    const schedule = record.schedule;
    if (record.role !== 'Doctor' || !Array.isArray(schedule.workingDays) || schedule.workingDays.length > 7) return 'Doctor schedule data is invalid.';
    const validDays = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    if (schedule.workingDays.some((day: any) =>
      !day || !validDays.has(day.day) ||
      typeof day.isAvailable !== 'boolean' ||
      typeof day.startTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.startTime) ||
      typeof day.endTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.endTime)
    )) return 'Doctor working days contain invalid values.';
    if (schedule.slotDuration !== undefined && (!Number.isInteger(schedule.slotDuration) || schedule.slotDuration < 5 || schedule.slotDuration > 240)) return 'Doctor slot duration is invalid.';
    if (schedule.offDays !== undefined && (!Array.isArray(schedule.offDays) || schedule.offDays.length > 500 || schedule.offDays.some((date: unknown) => typeof date !== 'string' || Number.isNaN(Date.parse(date))))) return 'Doctor off days contain invalid dates.';
  }

  return null;
};

export const getSystemStatus = async (_req: Request, res: Response) => {
  try {
    const state = await SystemState.findOne({ key: LOCKDOWN_KEY }).select('enabled').lean();
    res.status(200).json({
      emergencyLockdown: Boolean(state?.enabled)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Could not read system status', error: error.message });
  }
};

export const setEmergencyLockdown = async (req: Request, res: Response) => {
  try {
    if (typeof req.body.enabled !== 'boolean') return res.status(400).json({ message: 'enabled must be a boolean' });
    const state = await SystemState.findOneAndUpdate(
      { key: LOCKDOWN_KEY },
      { enabled: req.body.enabled, updatedBy: req.user?.userId },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.status(200).json({ emergencyLockdown: state.enabled });
  } catch (error: any) {
    res.status(500).json({ message: 'Could not update emergency lockdown', error: error.message });
  }
};

export const flushSystemCache = (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Application cache cleared', clearedEntries: clearRuntimeCache() });
};

export const exportStaffData = async (_req: Request, res: Response) => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES } })
      .select(STAFF_PROFILE_FIELDS.join(' '))
      .sort({ role: 1, email: 1 })
      .lean();
    const doctors = staff.filter(member => member.role === 'Doctor');
    const schedules = await DoctorSchedule.find({ doctorId: { $in: doctors.map(doctor => doctor._id) } }).lean();
    const schedulesByDoctorId = new Map(schedules.map(schedule => [String(schedule.doctorId), schedule]));

    const staffRecords = staff.map(member => {
      const { _id, ...profile } = member;
      const schedule = schedulesByDoctorId.get(String(_id));
      if (!schedule) return profile;
      return {
        ...profile,
        schedule: {
          workingDays: schedule.workingDays,
          offDays: schedule.offDays.map(day => new Date(day).toISOString()),
          slotDuration: schedule.slotDuration
        }
      };
    });

    const filename = `medical-center-staff-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      format: 'medical-center-staff-v1',
      exportedAt: new Date().toISOString(),
      staff: staffRecords
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Staff export failed', error: error.message });
  }
};

export const importStaffData = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a JSON staff backup file.' });

  let backup: any;
  try {
    backup = JSON.parse(req.file.buffer.toString('utf8'));
  } catch {
    return res.status(400).json({ message: 'The selected file is not valid JSON.' });
  }

  if (backup?.format !== 'medical-center-staff-v1' || !Array.isArray(backup.staff)) {
    return res.status(400).json({ message: 'Unsupported file. Choose a Medical Center staff JSON export.' });
  }
  if (backup.staff.length > MAX_STAFF_RECORDS) {
    return res.status(413).json({ message: `A staff backup can contain at most ${MAX_STAFF_RECORDS} records.` });
  }

  const seenEmails = new Set<string>();
  for (const record of backup.staff) {
    const validationError = validateStaffRecord(record);
    if (validationError) return res.status(400).json({ message: validationError });
    const normalizedEmail = record.email.trim().toLowerCase();
    if (seenEmails.has(normalizedEmail)) return res.status(400).json({ message: `The backup contains duplicate email: ${normalizedEmail}` });
    seenEmails.add(normalizedEmail);
  }

  const importPlan: Array<{ record: any; existingUser: any | null }> = [];
  for (const record of backup.staff) {
    const emailPattern = new RegExp(`^${escapeRegex(record.email.trim())}$`, 'i');
    const existingUser = await User.findOne({ email: emailPattern }).select('_id role email');
    if (existingUser && existingUser.role !== 'Doctor' && existingUser.role !== 'Receptionist') {
      return res.status(409).json({ message: `Email ${record.email} already belongs to a non-staff account; no records were imported.` });
    }
    if (existingUser && existingUser.role !== record.role) {
      return res.status(409).json({ message: `Email ${record.email} already has a different staff role; no records were imported.` });
    }
    importPlan.push({ record, existingUser });
  }

  try {
    let created = 0;
    let updated = 0;
    let schedulesImported = 0;

    for (const { record, existingUser } of importPlan) {
      const profile: Record<string, unknown> = {};
      for (const field of STAFF_PROFILE_FIELDS) {
        if (typeof record[field] === 'string') {
          profile[field] = field === 'email' ? record[field].trim().toLowerCase() : record[field].trim();
        }
      }

      let staffUser;
      if (existingUser) {
        staffUser = await User.findByIdAndUpdate(existingUser._id, { $set: profile }, { new: true, runValidators: true }).select('_id role');
        updated += 1;
      } else {
        const unusableInitialPassword = randomBytes(32).toString('hex');
        staffUser = await User.create({
          ...profile,
          passwordHash: await bcrypt.hash(unusableInitialPassword, 10),
          mustSetPassword: true
        });
        created += 1;
      }

      if (record.role === 'Doctor' && record.schedule && staffUser) {
        await DoctorSchedule.findOneAndUpdate(
          { doctorId: staffUser._id },
          {
            doctorId: staffUser._id,
            workingDays: record.schedule.workingDays,
            offDays: record.schedule.offDays || [],
            slotDuration: record.schedule.slotDuration ?? 30,
            updatedAt: new Date()
          },
          { upsert: true, new: true, runValidators: true }
        );
        schedulesImported += 1;
      }
    }

    clearRuntimeCache();
    return res.status(200).json({
      message: 'Staff data imported. Patient records, appointments, and other collections were not changed.',
      created,
      updated,
      schedulesImported,
      accountsRequiringPasswordSetup: created
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Import encountered a database write error. No unrelated collections were changed; you can safely retry this staff import.', error: error.message });
  }
};