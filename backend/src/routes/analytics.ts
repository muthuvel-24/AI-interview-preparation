import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, analyticsController.getDashboardAnalytics);
router.get('/roadmap', authenticate, analyticsController.getCompanyRoadmaps);
router.get('/leaderboard', analyticsController.getLeaderboard);

export default router;
