import { Request, Response } from 'express';
import Service from '../models/Service';

export const createService = async (req: Request, res: Response) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    let query = {};
    if (req.query.clinicId) {
      query = { clinicId: req.query.clinicId };
    }
    const services = await Service.find(query);
    res.status(200).json(services);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(service);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating service', error: error.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};
