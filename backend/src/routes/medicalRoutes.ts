import express from 'express';
import { getFullPatientHistory } from '../controllers/medicalController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/history/:patientId', protect, getFullPatientHistory);

export default router;
