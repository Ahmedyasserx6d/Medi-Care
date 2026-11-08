import express from 'express';
import authRoutes from './authRoutes';
import appointmentRoutes from './appointmentRoutes';
import clinicRoutes from './clinicRoutes';
import serviceRoutes from './serviceRoutes';
import medicalRoutes from './medicalRoutes';
import scheduleRoutes from './scheduleRoutes';
import receptionRoutes from './receptionRoutes';
import aiRoutes from './aiRoutes';
import fileRoutes from './fileRoutes';
import passwordRoutes from './passwordRoutes';
import systemRoutes from './systemRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/clinic', clinicRoutes);
router.use('/services', serviceRoutes);
router.use('/medical', medicalRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/reception', receptionRoutes);
router.use('/ai', aiRoutes);
router.use('/files', fileRoutes);
router.use('/password', passwordRoutes);
router.use('/system', systemRoutes);

export default router;
