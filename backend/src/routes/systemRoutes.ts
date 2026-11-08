import express from 'express';
import { exportStaffData, flushSystemCache, getSystemStatus, importStaffData, setEmergencyLockdown } from '../controllers/systemController';
import { authorize, protect } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = express.Router();
const backupUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 25 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => {
		if (file.mimetype !== 'application/json' && !file.originalname.toLowerCase().endsWith('.json')) {
			return callback(new Error('Backup must be a JSON file.'));
		}
		callback(null, true);
	}
});
router.use(protect, authorize('Admin'));
router.get('/status', getSystemStatus);
router.post('/cache/flush', flushSystemCache);
router.get('/staff/export', exportStaffData);
router.post('/staff/import', backupUpload.single('backup'), importStaffData);
router.put('/emergency-lockdown', setEmergencyLockdown);

export default router;