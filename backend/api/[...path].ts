import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import app from '../src/server';

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectToDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured for this deployment.');
  }

  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
};

export default async function handler(req: Request, res: Response) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Serverless API initialization failed:', error);
    return res.status(503).json({ message: 'API is unavailable. Check backend database configuration.' });
  }
}