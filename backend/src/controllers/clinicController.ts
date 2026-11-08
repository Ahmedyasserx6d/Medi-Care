import { Request, Response } from 'express';
import Clinic from '../models/Clinic';

export const getClinic = async (req: Request, res: Response) => {
  try {
    const clinic = await Clinic.findOne();
    if (!clinic) return res.status(404).json({ message: 'Clinic info not found' });
    res.status(200).json(clinic);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateClinic = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    let clinic = await Clinic.findOne();
    
    if (!clinic) {
      clinic = await Clinic.create(updates);
    } else {
      clinic = await Clinic.findByIdAndUpdate(clinic._id, updates, { new: true });
    }

    res.status(200).json({ message: 'Clinic info updated', clinic });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
