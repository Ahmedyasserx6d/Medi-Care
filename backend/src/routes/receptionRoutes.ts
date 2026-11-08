import express from 'express';
import { updatePaymentStatus } from '../controllers/receptionController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.put('/payment/:id', protect, authorize('Receptionist', 'Admin'), updatePaymentStatus);

export default router;
