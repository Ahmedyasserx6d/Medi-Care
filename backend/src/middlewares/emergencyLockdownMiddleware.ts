import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import SystemState from '../models/SystemState';

export const enforceEmergencyLockdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await SystemState.findOne({ key: 'emergency-lockdown' }).select('enabled').lean();
    if (!state?.enabled || req.path === '/auth/login') return next();

    const authorization = req.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET || 'fallback_secret') as { role?: string };
        if (decoded.role?.toLowerCase() === 'admin') return next();
      } catch {
        // Expired or invalid tokens are treated as non-admin during lockdown.
      }
    }

    return res.status(503).json({ message: 'The medical center is temporarily in emergency lockdown. Please contact the center.' });
  } catch {
    return res.status(500).json({ message: 'Could not verify emergency lockdown status' });
  }
};