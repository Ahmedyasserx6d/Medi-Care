import mongoose from 'mongoose';

export const DEFAULT_WORKING_DAYS = [
  { day: 'Saturday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Sunday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', isAvailable: false, startTime: '09:00', endTime: '17:00' }
];

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  workingDays: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    isAvailable: { type: Boolean, default: true }
  }],
  offDays: [{ type: Date }], // Specific dates the doctor is away
  slotDuration: { type: Number, default: 30 }, // minutes per patient
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DoctorSchedule', doctorScheduleSchema);
