import express from 'express';
import { getAppointments, createAppointment, updateAppointmentNotes, createWalkInAppointment, updateAppointmentStatus } from '../controllers/appointmentController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, createAppointment);
router.post('/walkin', protect, authorize('Receptionist', 'Admin'), createWalkInAppointment);
router.get('/', protect, getAppointments);
router.put('/:id/notes', protect, authorize('Doctor'), updateAppointmentNotes);
router.put('/:id/status', protect, authorize('Admin', 'Receptionist'), updateAppointmentStatus);

export default router;
