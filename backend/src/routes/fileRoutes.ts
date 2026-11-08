import express from 'express';
import multer from 'multer';
import path from 'path';
import PatientFile from '../models/PatientFile';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const newFile = await PatientFile.create({
      patientId: (req as any).user.userId,
      fileName: req.file?.originalname,
      fileUrl: `/uploads/${req.file?.filename}`,
      fileType: req.body.fileType || 'Other'
    });
    res.status(201).json(newFile);
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Dedicated standalone endpoint for uploading staff photos / public avatar images directly
router.post('/upload-image', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided for upload' });
    }
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const absoluteUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl: absoluteUrl, relativeUrl: `/uploads/${req.file.filename}` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading image asset', error: error.message });
  }
});

router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    // Access control check: Patients can only access their own files
    if (req.user?.role === 'Patient' && req.user.userId !== req.params.patientId) {
      return res.status(403).json({ message: "Access Denied: You are not authorized to view this patient's files." });
    }

    const files = await PatientFile.find({ patientId: req.params.patientId });
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await PatientFile.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

export default router;
