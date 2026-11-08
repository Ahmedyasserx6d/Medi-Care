import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  clinicId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  type: 'Examination' | 'Consultation';
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  amount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  doctorNotes?: string;
  rating?: number;
}

const AppointmentSchema: Schema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' }, 
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    type: { type: String, enum: ['Examination', 'Consultation'], default: 'Examination' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    doctorNotes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
