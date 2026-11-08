import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'Patient' | 'Doctor' | 'Admin' | 'Receptionist';
  phone?: string;
  specialty?: string;
  degree?: string;
  experience?: string;
  avatar?: string;
  imageUrl?: string;
  bio?: string;
  mustSetPassword?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Patient', 'Doctor', 'Admin', 'Receptionist'], default: 'Patient' },
  phone: { type: String },
  specialty: { type: String },
  degree: { type: String },
  experience: { type: String },
  bio: { type: String },
  avatar: { type: String },
  imageUrl: { type: String },
  mustSetPassword: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

UserSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: 'Admin' } }
);

export default mongoose.model<IUser>('User', UserSchema);
