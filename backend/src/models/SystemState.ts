import mongoose, { Schema } from 'mongoose';

const SystemStateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  enabled: { type: Boolean, required: true, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('SystemState', SystemStateSchema);