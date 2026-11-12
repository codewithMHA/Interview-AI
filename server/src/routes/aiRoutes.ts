import { Router } from 'express';
import {
  analyzeCode,
  explainCode,
  explainConcept,
  solveDoubt,
  chatWithMentor,
  listConversations,
  getConversation,
  createConversation,
  deleteConversation,
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(optionalAuth);

router.post('/analyze-code', analyzeCode);
router.post('/explain-code', explainCode);
router.post('/explain-concept', explainConcept);
router.post('/solve-doubt', solveDoubt);
router.post('/chat', chatWithMentor);

// Conversational Memory & Session Management
router.get('/conversations', listConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

export default router;

