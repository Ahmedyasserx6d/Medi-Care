import mongoose, { Schema, Document } from 'mongoose';

export interface IVitals extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  measuredAt: Date;
}

const VitalsSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bloodPressure: { type: String },
    heartRate: { type: Number },
    temperature: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    measuredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IVitals>('Vitals', VitalsSchema);
