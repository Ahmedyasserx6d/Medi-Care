import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import mongoose from 'mongoose';
import routes from './routes';
import { enforceEmergencyLockdown } from './middlewares/emergencyLockdownMiddleware';

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-setup-key']
}));
app.options('*', cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', enforceEmergencyLockdown);
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.get('/health', (req, res) => res.send('API is running...'));

if (require.main === module) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing. Check the project-root .env file.');
    process.exit(1);
  }

  mongoose.connect(mongoUri)
    .then(() => {
      console.log('MongoDB Connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error(err));
}

export default app;
