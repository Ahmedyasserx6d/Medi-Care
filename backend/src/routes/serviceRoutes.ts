import express from 'express';
import { createService, getServices, updateService, deleteService } from '../controllers/serviceController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getServices);
router.post('/', protect, authorize('Admin'), createService);
router.put('/:id', protect, authorize('Admin'), updateService);
router.delete('/:id', protect, authorize('Admin'), deleteService);

export default router;
