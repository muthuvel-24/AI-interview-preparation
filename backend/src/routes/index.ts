import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import resumeRouter from './resume.js';
import testRouter from './test.js';
import interviewRouter from './interview.js';
import analyticsRouter from './analytics.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/resume', resumeRouter);
router.use('/tests', testRouter);
router.use('/interview', interviewRouter);
router.use('/analytics', analyticsRouter);
