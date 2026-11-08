import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  price: number;
  duration: number;
  specialty: string;
  description?: string;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    specialty: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
