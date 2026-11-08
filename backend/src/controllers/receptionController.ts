import { Request, Response } from 'express';
import Appointment from '../models/Appointment';

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );
    
    res.json({ message: 'Payment status updated', appointment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};
