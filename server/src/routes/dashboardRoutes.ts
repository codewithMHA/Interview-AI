import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Student dashboard is private: requires valid authenticated session
router.get('/overview', protect, getDashboardOverview);

export default router;
