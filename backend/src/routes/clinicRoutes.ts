import express from 'express';
import { getClinic, updateClinic } from '../controllers/clinicController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getClinic);
router.put('/', protect, authorize('Admin'), updateClinic);

export default router;
