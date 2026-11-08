import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  description?: string;
  icon?: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  location?: {
    lat: number;
    lng: number;
  };
  gallery?: string[]; // URLs to images
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    address: { type: String },
    phone: { type: String },
    workingHours: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    gallery: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IClinic>('Clinic', ClinicSchema);
