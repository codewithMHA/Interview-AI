import { Router } from 'express';
import { getProfile, updateProfile, careerSetup } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/career-setup', careerSetup);

export default router;

