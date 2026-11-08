import { Request, Response } from 'express';
import Appointment from '../models/Appointment';

export const getFullPatientHistory = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { userId, role } = (req as any).user!;
    
    // SECURITY: Validate access rights
    if (role === 'Patient' && userId !== patientId) {
      return res.status(403).json({ message: 'Access denied to other patients history' });
    }

    const history = await Appointment.find({ 
      patientId, 
      status: 'Completed' 
    })
    .populate('doctorId', 'firstName lastName specialty')
    .sort({ date: -1 });

    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};
