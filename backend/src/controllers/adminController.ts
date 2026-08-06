import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';

const questionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['MCQ', 'CODING', 'INTERVIEW_PROMPT']),
  category: z.string().min(1, 'Category is required'),
  company: z.string().optional(),
  content: z.string().min(5, 'Content payload is required'),
});

export const getBatchMetrics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalStudents, testResults, resumes, interviews, leaderboardEntries] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.testResult.findMany(),
      prisma.resume.findMany(),
      prisma.interviewSession.findMany({ where: { status: 'COMPLETED' } }),
      prisma.leaderboardEntry.findMany(),
    ]);

    const avgAtsScore = resumes.length > 0
      ? Math.round(resumes.reduce((acc, curr) => acc + curr.atsScore, 0) / resumes.length)
      : 0;

    const codingTests = testResults.filter((t) => t.testType === 'CODING');
    const passedCoding = codingTests.filter((t) => t.score >= 70).length;
    const codingCompletionRate = codingTests.length > 0
      ? Math.round((passedCoding / codingTests.length) * 100)
      : 0;

    // Aggregate skill gaps from resumes
    const gapMap: Record<string, number> = {
      'SQL & DBMS': 0,
      'System Design': 0,
      'AWS & Cloud': 0,
      'Docker & DevOps': 0,
      'Data Structures & Algorithms': 0,
    };

    resumes.forEach((r) => {
      try {
        const gaps: string[] = JSON.parse(r.gaps);
        gaps.forEach((g) => {
          const lower = g.toLowerCase();
          if (lower.includes('sql') || lower.includes('dbms') || lower.includes('database')) gapMap['SQL & DBMS']++;
          else if (lower.includes('system design') || lower.includes('architecture')) gapMap['System Design']++;
          else if (lower.includes('aws') || lower.includes('cloud')) gapMap['AWS & Cloud']++;
          else if (lower.includes('docker') || lower.includes('devops')) gapMap['Docker & DevOps']++;
          else gapMap['Data Structures & Algorithms']++;
        });
      } catch {}
    });

    const totalGapsCount = Math.max(resumes.length, 1);
    const skillGaps = Object.entries(gapMap).map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.min(Math.round((count / totalGapsCount) * 100), 100),
    }));

    res.json({
      status: 'success',
      data: {
        totalStudents: Math.max(totalStudents, 1),
        avgAtsScore,
        totalInterviews: interviews.length,
        codingCompletionRate,
        leaderboardEntriesCount: leaderboardEntries.length,
        skillGaps,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportStudentsCSV = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        leaderboardEntry: true,
        resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    let csvContent = 'Student Name,Email,Overall Score,ATS Score,MCQ Score,Coding Score,Interview Score,Streak Count,Badges,Joined Date\n';

    students.forEach((s) => {
      const lb = s.leaderboardEntry;
      const latestResume = s.resumes[0];
      const ats = latestResume ? latestResume.atsScore : 0;

      const overall = lb ? Math.round(lb.overallScore) : 0;
      const mcq = lb ? Math.round(lb.mcqScore) : 0;
      const coding = lb ? Math.round(lb.codingScore) : 0;
      const interview = lb ? Math.round(lb.interviewScore) : 0;

      let badgesStr = '';
      try {
        badgesStr = JSON.parse(s.badges).join('; ');
      } catch {
        badgesStr = s.badges;
      }

      csvContent += `"${s.name}","${s.email}",${overall},${ats},${mcq},${coding},${interview},${s.streakCount},"${badgesStr}","${new Date(s.createdAt).toLocaleDateString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cohort_readiness_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const createAdminQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { title, type, category, company, content } = questionSchema.parse(req.body);

    const question = await prisma.adminQuestion.create({
      data: {
        title,
        type,
        category,
        company: company || 'General',
        content,
        createdById: req.user.id,
      },
    });

    res.status(201).json({
      status: 'success',
      data: question,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      return;
    }
    next(error);
  }
};

export const getAdminQuestions = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const questions = await prisma.adminQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({
      status: 'success',
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};
