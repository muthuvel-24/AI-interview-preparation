import { Router } from 'express';
import * as testController from '../controllers/testController.js';
import { authenticate } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/mcq', testController.getMCQs);
router.post('/mcq/submit', authenticate, testController.submitMCQ);

router.get('/coding', testController.getCodingList);
router.get('/coding/:id', testController.getCodingDetail);
router.post('/coding/run', testController.runCode);
router.post('/coding/submit', authenticate, testController.submitCode);
router.post('/coding/hint', aiRateLimiter, testController.getHint);
router.post('/coding/complexity', testController.analyzeComplexity);

export default router;
