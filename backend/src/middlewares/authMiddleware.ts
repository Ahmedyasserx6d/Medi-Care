import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({ message: 'Not authorized: No user context found' });
    }
    
    // Case-insensitive role comparison for maximum compatibility
    const hasRole = roles.some(role => role.toLowerCase() === req.user!.role.toLowerCase());
    
    if (!hasRole) {
      return res.status(403).json({ message: `Access Denied: ${req.user.role} role is not authorized for this action.` });
    }
    next();
  };
};
