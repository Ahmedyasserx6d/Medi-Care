import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  activeIngredient?: string;
  type?: string; // e.g. Tablet, Syrup
  description?: string;
}

const MedicineSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    activeIngredient: { type: String },
    type: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);
