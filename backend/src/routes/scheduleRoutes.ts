import express from 'express';
import { getMySchedule, updateSchedule } from '../controllers/scheduleController';
import { protect, authorize } from '../middlewares/authMiddleware';
import DoctorSchedule, { DEFAULT_WORKING_DAYS } from '../models/DoctorSchedule';

const router = express.Router();

router.get('/my-schedule', protect, authorize('Doctor'), getMySchedule);
router.put('/update', protect, authorize('Doctor'), updateSchedule);

// Public route for patients
router.get('/:doctorId', async (req, res) => {
  try {
    let schedule = await DoctorSchedule.findOne({ doctorId: req.params.doctorId });
    if (!schedule) {
      schedule = {
        doctorId: req.params.doctorId,
        slotDuration: 30,
        workingDays: DEFAULT_WORKING_DAYS
      } as any;
    }
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctor schedule' });
  }
});

export default router;

