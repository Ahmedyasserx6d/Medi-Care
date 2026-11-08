import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionItem {
  medicineId: mongoose.Types.ObjectId;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface IMedicalRecord extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  diagnosis: string;
  prescriptions: IPrescriptionItem[];
  attachments?: string[]; // URLs
  notes?: string;
}

const MedicalRecordSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true },
    prescriptions: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine' },
        dosage: { type: String },
        duration: { type: String },
        instructions: { type: String },
      }
    ],
    attachments: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
