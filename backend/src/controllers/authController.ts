import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ firstName, lastName, email, passwordHash, role: 'Patient', phone });
    const token = generateToken(user.id, user.role);

    res.status(201).json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role, email: user.email, imageUrl: user.imageUrl, avatar: user.avatar }, token });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const setupKey = process.env.ADMIN_SETUP_KEY;
    if (!setupKey || req.get('x-admin-setup-key') !== setupKey) {
      return res.status(403).json({ message: 'Invalid or missing admin setup key' });
    }

    if (await User.exists({ role: 'Admin' })) {
      return res.status(409).json({ message: 'The single admin account has already been created' });
    }

    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, passwordHash, role: 'Admin' });
    res.status(201).json({ message: 'Single admin account created successfully' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'The single admin account has already been created' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, phone, specialty, degree, experience, imageUrl } = req.body;
    
    if (!['Doctor', 'Receptionist'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for staff creation' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ firstName, lastName, email, passwordHash, role, phone, specialty, degree, experience, imageUrl });

    res.status(201).json({ message: `${role} created successfully`, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    // Robust search for both capitalized and lowercase roles to ensure no data is missed
    const staff = await User.find({ 
      role: { $in: ['Doctor', 'Receptionist', 'doctor', 'receptionist'] } 
    }).select('-passwordHash');
    res.status(200).json(staff);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await User.find({ 
      role: { $in: ['Doctor', 'doctor'] } 
    }).select('-passwordHash');
    res.status(200).json(doctors);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    if (staff.role === 'Admin') return res.status(403).json({ message: 'Admin account cannot be edited here' });

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'specialty', 'degree', 'experience', 'imageUrl', 'avatar'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in req.body) updates[field] = req.body[field];
    }
    
    if (typeof req.body.password === 'string' && req.body.password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(req.body.password, salt);
      updates.mustSetPassword = false;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-passwordHash');

    res.status(200).json({ message: 'Staff updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id, role: { $ne: 'Admin' } });
    if (!user) return res.status(404).json({ message: 'Staff member not found' });
    res.status(200).json({ message: 'Staff account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.mustSetPassword) return res.status(403).json({ message: 'An administrator must set your password before you can sign in.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    res.status(200).json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role, email: user.email, imageUrl: user.imageUrl, avatar: user.avatar }, token });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


