import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  toggleBookmark,
  toggleComplete,
} from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Allow reading questions publicly or with user context
router.get('/', (req, res, next) => {
  // If authorization header present, decode user; otherwise proceed
  if (req.headers.authorization) {
    protect(req as any, res, () => getQuestions(req as any, res, next));
  } else {
    getQuestions(req as any, res, next);
  }
});

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    protect(req as any, res, () => getQuestionById(req as any, res, next));
  } else {
    getQuestionById(req as any, res, next);
  }
});

// Bookmark & Complete require active user login
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/complete', protect, toggleComplete);

export default router;

