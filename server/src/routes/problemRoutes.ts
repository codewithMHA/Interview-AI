import { Router } from 'express';
import {
  getProblems,
  getProblemDetail,
  runCode,
  submitCode,
  getSubmissions,
  runSandboxPlayground,
} from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Freeform practice sandbox execution (for playground & roadmap drills)
router.post('/sandbox-run', runSandboxPlayground);

// Problem list (with optional auth to show isSolved)
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    protect(req as any, res, () => getProblems(req as any, res, next));
  } else {
    getProblems(req as any, res, next);
  }
});

// Problem detail
router.get('/:idOrSlug', (req, res, next) => {
  if (req.headers.authorization) {
    protect(req as any, res, () => getProblemDetail(req as any, res, next));
  } else {
    getProblemDetail(req as any, res, next);
  }
});

// Run code against sample/custom test cases (Open for fast interactive trial)
router.post('/:idOrSlug/run', runCode);

// Submit code against all test cases (Records official submission & XP)
router.post('/:idOrSlug/submit', protect, submitCode);

// Get submission history for a problem
router.get('/:idOrSlug/submissions', protect, getSubmissions);

export default router;

