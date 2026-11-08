import { Request, Response } from 'express';
import DoctorSchedule, { DEFAULT_WORKING_DAYS } from '../models/DoctorSchedule';


export const getMySchedule = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.userId;
    if (!doctorId) return res.status(401).json({ message: 'No doctor ID found in token' });

    console.log("Attempting to find schedule for:", doctorId);
    let schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      console.log("Creating default schedule...");
      schedule = new DoctorSchedule({
        doctorId,
        workingDays: DEFAULT_WORKING_DAYS
      });
      await schedule.save();
    }
    res.json(schedule);
  } catch (error: any) {
    // Write error to a file so I can see exactly what is happening
    console.error(`[${new Date().toISOString()}] Schedule Fetch Error:`, error);
    res.status(500).json({ message: 'Error fetching schedule', error: error.message });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.userId;
    const { workingDays, offDays, slotDuration } = req.body;

    await DoctorSchedule.findOneAndUpdate(
      { doctorId },
      { workingDays, offDays, slotDuration, updatedAt: Date.now() },
      { upsert: true }
    );

    res.json({ message: 'Schedule saved' });
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Schedule Save Error:`, error);
    res.status(500).json({ message: 'Save Error', error: error.message });
  }
};
