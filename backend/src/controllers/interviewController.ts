import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';
import { generateInterviewResponse } from '../services/aiService.js';

const startSessionSchema = z.object({
  type: z.enum(['HR', 'TECHNICAL']),
  companyName: z.string().default('Google'),
  roleName: z.string().default('Software Development Engineer'),
});

const sendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1, 'Message cannot be empty'),
});

export const startSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { type, companyName, roleName } = startSessionSchema.parse(req.body);

    const initialAiResponse = await generateInterviewResponse(type, roleName, companyName, []);

    const initialTranscript = [
      { role: 'assistant', content: initialAiResponse.reply },
    ];

    const session = await prisma.interviewSession.create({
      data: {
        userId: req.user.id,
        type,
        companyName,
        roleName,
        status: 'IN_PROGRESS',
        transcript: JSON.stringify(initialTranscript),
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: session.id,
        type: session.type,
        companyName: session.companyName,
        roleName: session.roleName,
        status: session.status,
        transcript: initialTranscript,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { sessionId, message } = sendMessageSchema.parse(req.body);

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== req.user.id) {
      res.status(404).json({ status: 'error', message: 'Session not found' });
      return;
    }

    const transcript: { role: 'user' | 'assistant'; content: string }[] = JSON.parse(session.transcript);

    // Append user message
    transcript.push({ role: 'user', content: message });

    // Generate AI response
    const aiRes = await generateInterviewResponse(
      session.type as 'HR' | 'TECHNICAL',
      session.roleName,
      session.companyName,
      transcript
    );

    // Append AI reply
    transcript.push({ role: 'assistant', content: aiRes.reply });

    // Save updated transcript to DB
    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { transcript: JSON.stringify(transcript) },
    });

    res.json({
      status: 'success',
      data: {
        sessionId: updated.id,
        reply: aiRes.reply,
        transcript,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const completeSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { sessionId } = req.body;
    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });

    if (!session || session.userId !== req.user.id) {
      res.status(404).json({ status: 'error', message: 'Session not found' });
      return;
    }

    const transcript: { role: 'user' | 'assistant'; content: string }[] = JSON.parse(session.transcript);
    const userMsgCount = transcript.filter((t) => t.role === 'user').length;

    const baseScore = Math.min(70 + userMsgCount * 6, 95);

    const feedback = {
      overallScore: baseScore,
      communicationRating: Math.min(baseScore + 2, 98),
      technicalAccuracy: session.type === 'TECHNICAL' ? baseScore : baseScore - 3,
      strengths: [
        'Clear problem explanation and structured response style',
        'Good enthusiasm and engagement during the interview conversation',
      ],
      areasForImprovement: [
        'Elaborate more on real-world project tradeoffs and performance metrics',
        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
      ],
    };

    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        score: baseScore,
        feedback: JSON.stringify(feedback),
      },
    });

    // Update leaderboard score for interview module
    const currentLeaderboard = await prisma.leaderboardEntry.findUnique({
      where: { userId: req.user.id },
    });

    if (currentLeaderboard) {
      const newInterviewScore = Math.max(currentLeaderboard.interviewScore, baseScore);
      const overall =
        (currentLeaderboard.mcqScore +
          currentLeaderboard.codingScore +
          newInterviewScore +
          currentLeaderboard.resumeScore) / 4;

      await prisma.leaderboardEntry.update({
        where: { userId: req.user.id },
        data: {
          interviewScore: newInterviewScore,
          overallScore: overall,
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        sessionId: updated.id,
        score: baseScore,
        feedback,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      type: s.type,
      companyName: s.companyName,
      roleName: s.roleName,
      status: s.status,
      score: s.score,
      transcript: JSON.parse(s.transcript),
      feedback: s.feedback ? JSON.parse(s.feedback) : null,
      createdAt: s.createdAt,
    }));

    res.json({ status: 'success', data: formatted });
  } catch (error) {
    next(error);
  }
};
