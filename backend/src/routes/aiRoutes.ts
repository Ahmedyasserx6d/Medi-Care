import express from 'express';
import { chatWithAI } from '../controllers/aiController';
import { protect } from '../middlewares/authMiddleware';
const router = express.Router();

router.post('/chat', protect, chatWithAI);

// Keep the old analyze route for backward compatibility if needed, or refactor it
router.post('/analyze', protect, chatWithAI); 

export default router;
