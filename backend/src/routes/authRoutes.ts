import express from 'express';
import { 
  register, 
  setupAdmin,
  login, 
  createStaff, 
  getDoctors, 
  updateStaff, 
  deleteStaff, 
  getStaff 
} from '../controllers/authController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/setup-admin', setupAdmin);
router.post('/login', login);
router.get('/doctors', getDoctors); // Public

// Protected Admin Routes
router.get('/staff', protect, authorize('Admin'), getStaff);
router.post('/create-staff', protect, authorize('Admin'), createStaff);
router.put('/staff/:id', protect, authorize('Admin'), updateStaff);
router.delete('/staff/:id', protect, authorize('Admin'), deleteStaff);

export default router;
