import mongoose from 'mongoose';

const patientFileSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String }, // 'Scan', 'Lab Test', 'Other'
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('PatientFile', patientFileSchema);
