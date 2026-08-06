import { Router } from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/start', authenticate, aiRateLimiter, interviewController.startSession);
router.post('/chat', authenticate, aiRateLimiter, interviewController.sendMessage);
router.post('/chat-stream', authenticate, aiRateLimiter, interviewController.streamMessage);
router.post('/complete', authenticate, interviewController.completeSession);
router.get('/history', authenticate, interviewController.getHistory);

export default router;
