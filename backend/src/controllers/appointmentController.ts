import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role } = (req as any).user!;

    if (role !== 'Admin' && role !== 'Receptionist') {
      return res.status(403).json({ message: 'Not authorized to change status' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: 'Status updated successfully', appointment });
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, clinicId, date, timeSlot, amount, type } = req.body;
    const patientId = (req as any).user?.userId;

    if (!patientId) return res.status(401).json({ message: 'Session expired' });
    if (!doctorId || !date || !timeSlot) return res.status(400).json({ message: 'Missing fields' });

    if (req.body.paymentMethod && !['Cash', 'Cash at Clinic'].includes(req.body.paymentMethod)) {
      return res.status(400).json({ message: 'Online payments are unavailable. Pay at the clinic for now.' });
    }

    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'Cancelled' } });
    if (existing) return res.status(409).json({ message: 'Slot already taken' });

    const newApp = await Appointment.create({
      doctorId, patientId, clinicId: clinicId || null, date, timeSlot, amount,
      type: type || 'Examination',
      status: 'Confirmed',
      paymentStatus: 'Pending'
    });

    res.status(201).json({ message: 'Confirmed ✅', appointment: newApp });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createWalkInAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, date, timeSlot, amount, patientName, patientPhone, type } = req.body;
    const userRole = (req as any).user?.role;

    if (userRole !== 'Receptionist' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized for walk-in bookings' });
    }

    if (!doctorId || !date || !timeSlot || !patientName || !patientPhone) {
      return res.status(400).json({ message: 'Missing required fields for walk-in booking' });
    }

    // Check if slot is taken
    const existingApp = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'Cancelled' } });
    if (existingApp) return res.status(409).json({ message: 'Slot already taken by another patient' });

    // Find or create patient
    let patient = await User.findOne({ phone: patientPhone, role: 'Patient' });
    if (!patient) {
      const parts = patientName.split(' ');
      const firstName = parts[0] || 'WalkIn';
      const lastName = parts.slice(1).join(' ') || 'WalkIn';
      const passwordHash = await bcrypt.hash(`WalkIn-${patientPhone}`, 10);
      
      patient = await User.create({
        firstName,
        lastName,
        email: `${patientPhone}@walkin.medicare.com`,
        phone: patientPhone,
        passwordHash,
        role: 'Patient'
      });
    }

    const newApp = await Appointment.create({
      doctorId, 
      patientId: patient._id, 
      date: new Date(date), 
      timeSlot, 
      type: type || 'Examination',
      amount: amount || 0,
      status: 'Confirmed',
      paymentStatus: 'Pending' 
    });

    res.status(201).json({ message: 'Walk-in Confirmed ✅', appointment: newApp });
  } catch (error: any) {
    console.error("🔥 ERROR IN WALK-IN BOOKING:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message, error: error.message });
  }
};

export const updateAppointmentNotes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { doctorNotes } = req.body;
    const { userId, role } = (req as any).user!;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    if (role !== 'Admin' && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    appointment.doctorNotes = doctorNotes;
    appointment.status = 'Completed';
    await appointment.save();

    res.status(200).json({ message: 'Completed' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { userId, role } = (req as any).user!;
    let query: any = {};

    if (role === 'Doctor') query.doctorId = userId;
    else if (role === 'Patient') query.patientId = userId;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email specialty')
      .sort({ date: 1, timeSlot: 1 });
    res.status(200).json(appointments);
  } catch (err: any) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
