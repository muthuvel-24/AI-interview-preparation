import { Router } from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/start', authenticate, interviewController.startSession);
router.post('/chat', authenticate, interviewController.sendMessage);
router.post('/complete', authenticate, interviewController.completeSession);
router.get('/history', authenticate, interviewController.getHistory);

export default router;
