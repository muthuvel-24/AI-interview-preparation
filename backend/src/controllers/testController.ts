import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import * as testService from '../services/testService.js';
import { generateCodingHint, analyzeCodeComplexity } from '../services/aiService.js';

const mcqSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number(),
    })
  ),
  timeSpent: z.number().default(0),
});

const codeExecuteSchema = z.object({
  challengeId: z.string(),
  language: z.string().default('javascript'),
  code: z.string().min(1, 'Code cannot be empty'),
});

const hintSchema = z.object({
  challengeId: z.string(),
  code: z.string().default(''),
});

const complexitySchema = z.object({
  code: z.string().min(1, 'Code cannot be empty'),
  language: z.string().default('javascript'),
});

export const getMCQs = (req: Request, res: Response) => {
  const category = req.query.category as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const questions = testService.getMCQQuestions(category, limit);
  res.json({ status: 'success', data: questions });
};

export const submitMCQ = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    const { answers, timeSpent } = mcqSubmitSchema.parse(req.body);
    const result = await testService.submitMCQAnswers(req.user.id, answers, timeSpent);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const getCodingList = (_req: Request, res: Response) => {
  const challenges = testService.getCodingChallenges();
  res.json({ status: 'success', data: challenges });
};

export const getCodingDetail = (req: Request, res: Response) => {
  const challenge = testService.getCodingChallengeById(req.params.id);
  if (!challenge) {
    res.status(404).json({ status: 'error', message: 'Challenge not found' });
    return;
  }
  res.json({ status: 'success', data: challenge });
};

export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { challengeId, language, code } = codeExecuteSchema.parse(req.body);
    const evalResult = await testService.executeCode(challengeId, language, code);
    res.json({ status: 'success', data: evalResult });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const submitCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    const { challengeId, language, code } = codeExecuteSchema.parse(req.body);
    const result = await testService.submitCodingTest(req.user.id, challengeId, language, code);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const getHint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { challengeId, code } = hintSchema.parse(req.body);
    const challenge = testService.getCodingChallengeById(challengeId);
    const hint = await generateCodingHint(challenge?.title || challengeId, code);
    res.json({ status: 'success', data: { hint } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const analyzeComplexity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, language } = complexitySchema.parse(req.body);
    const analysis = await analyzeCodeComplexity(code, language);
    res.json({ status: 'success', data: analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};
