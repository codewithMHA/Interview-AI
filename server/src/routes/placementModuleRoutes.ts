import { Router } from 'express';
import { getAllModules, getModuleById } from '../controllers/placementModuleController.js';

const router = Router();

// Publicly readable or accessible within app
router.get('/', getAllModules);
router.get('/:id', getModuleById);

export default router;

