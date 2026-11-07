import { Router } from 'express';
import {
  startInterview,
  getInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  updateCandidateNotes,
  updateTopicStatus,
  runCodingInterviewCode,
  deleteInterview,
} from '../controllers/mockInterviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', startInterview);
router.post('/start', startInterview);
router.get('/', getInterviewHistory);
router.get('/:id', getInterview);
router.delete('/:id', deleteInterview);
router.post('/:id/submit-answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.post('/:id/run-code', runCodingInterviewCode);
router.post('/:id/notes', updateCandidateNotes);
router.post('/:id/topics/:topicId', updateTopicStatus);

export default router;
