import { Router } from 'express';
import {
  scanResume,
  getScanHistory,
  getScanById,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All resume scan endpoints require authentication
router.use(protect);

// Scan resume with AI
router.post('/scan', aiRateLimiter, scanResume);

// Get scan history
router.get('/history', getScanHistory);

// Get specific scan detail
router.get('/:id', getScanById);

export default router;
