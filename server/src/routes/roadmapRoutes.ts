import { Router } from 'express';
import {
  getRoadmaps,
  getRoadmapByIdOrSlug,
  getUserActiveRoadmap,
  enrollInRoadmap,
  toggleTask,
  generateCustomRoadmap,
  getCompanyInsights,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Public curriculum catalog and company insights
router.get('/', getRoadmaps);
router.get('/company-insights', getCompanyInsights);
router.get('/:idOrSlug', getRoadmapByIdOrSlug);

// User-protected personal active roadmap, enrollment, and progress tracking
router.get('/my/active', protect, getUserActiveRoadmap);
router.post('/enroll', protect, enrollInRoadmap);
router.post('/generate-custom', protect, generateCustomRoadmap);
router.patch('/tasks/:taskId/toggle', protect, toggleTask);

export default router;
