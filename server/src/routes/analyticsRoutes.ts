import { Router } from 'express';
import { getAnalyticsDashboard } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Analytics is private: requires student authentication to view personal telemetry
router.use(protect);

router.get('/dashboard', getAnalyticsDashboard);
router.get('/', getAnalyticsDashboard);

export default router;
