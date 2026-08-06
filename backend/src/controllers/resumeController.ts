import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { generatePresignedUploadUrl } from '../services/s3Service.js';
import { analyzeResumeContent, rephraseResumeBullet, matchResumeToJD } from '../services/aiService.js';
import { prisma } from '../prisma/client.js';

const uploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
});

const analyzeSchema = z.object({
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileName: z.string().default('resume.pdf'),
  resumeText: z.string().min(10, 'Resume content must be at least 10 characters long'),
  targetRole: z.string().default('Software Development Engineer'),
});

const rephraseSchema = z.object({
  bullet: z.string().min(5, 'Bullet text must be at least 5 characters long'),
  targetRole: z.string().default('Software Development Engineer'),
});

const jdMatchSchema = z.object({
  resumeText: z.string().min(10, 'Resume text is required'),
  jobDescription: z.string().min(10, 'Job Description is required'),
});

export const getUploadUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fileName, fileType } = uploadUrlSchema.parse(req.body);
    const presignedData = await generatePresignedUploadUrl(fileName, fileType);
    res.json({
      status: 'success',
      data: presignedData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { fileUrl, fileName, resumeText, targetRole } = analyzeSchema.parse(req.body);

    const analysis = await analyzeResumeContent(resumeText, targetRole);

    const savedResume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        fileUrl: fileUrl || `http://localhost:5000/uploads/${fileName}`,
        fileName,
        atsScore: analysis.atsScore,
        strengths: JSON.stringify(analysis.strengths),
        gaps: JSON.stringify(analysis.gaps),
        suggestions: JSON.stringify(analysis.suggestions),
        parsedData: JSON.stringify(analysis.parsedData),
      },
    });

    const currentLeaderboard = await prisma.leaderboardEntry.findUnique({
      where: { userId: req.user.id },
    });

    if (currentLeaderboard) {
      const newResumeScore = Math.max(currentLeaderboard.resumeScore, analysis.atsScore);
      const overall =
        (currentLeaderboard.mcqScore +
          currentLeaderboard.codingScore +
          currentLeaderboard.interviewScore +
          newResumeScore) / 4;

      await prisma.leaderboardEntry.update({
        where: { userId: req.user.id },
        data: {
          resumeScore: newResumeScore,
          overallScore: overall,
        },
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        id: savedResume.id,
        fileName: savedResume.fileName,
        atsScore: savedResume.atsScore,
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        suggestions: analysis.suggestions,
        parsedData: analysis.parsedData,
        createdAt: savedResume.createdAt,
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

export const rephraseBullet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bullet, targetRole } = rephraseSchema.parse(req.body);
    const result = await rephraseResumeBullet(bullet, targetRole);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const matchJobDescription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescription } = jdMatchSchema.parse(req.body);
    const result = await matchResumeToJD(resumeText, jobDescription);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const getMyResumes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = resumes.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      fileUrl: r.fileUrl,
      atsScore: r.atsScore,
      strengths: JSON.parse(r.strengths),
      gaps: JSON.parse(r.gaps),
      suggestions: JSON.parse(r.suggestions),
      parsedData: JSON.parse(r.parsedData),
      createdAt: r.createdAt,
    }));

    res.json({
      status: 'success',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const mockUpload = async (req: AuthRequest, res: Response) => {
  res.json({ status: 'success', message: 'File uploaded locally to mock storage' });
};
