import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';
import { COMPANIES_DATA } from '../data/companyBank.js';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    const [leaderboard, testResults, resumes, interviews] = await Promise.all([
      prisma.leaderboardEntry.findUnique({ where: { userId } }),
      prisma.testResult.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.resume.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.interviewSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const latestResume = resumes[0];
    const resumeScore = latestResume ? latestResume.atsScore : 0;

    const mcqResults = testResults.filter((t) => t.testType === 'MCQ');
    const codingResults = testResults.filter((t) => t.testType === 'CODING');

    const avgMcq = mcqResults.length > 0 ? mcqResults.reduce((acc, curr) => acc + curr.score, 0) / mcqResults.length : 0;
    const avgCoding = codingResults.length > 0 ? codingResults.reduce((acc, curr) => acc + curr.score, 0) / codingResults.length : 0;
    const avgInterview = interviews.length > 0 ? interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / interviews.length : 0;

    const overallScore = Math.round((resumeScore + avgMcq + avgCoding + avgInterview) / 4);

    res.json({
      status: 'success',
      data: {
        overallScore,
        moduleScores: {
          resumeScore: Math.round(resumeScore),
          mcqScore: Math.round(avgMcq),
          codingScore: Math.round(avgCoding),
          interviewScore: Math.round(avgInterview),
        },
        counts: {
          resumesAnalyzed: resumes.length,
          mcqTestsTaken: mcqResults.length,
          codingChallengesSolved: codingResults.length,
          mockInterviewsCompleted: interviews.filter((i) => i.status === 'COMPLETED').length,
        },
        recentActivity: [
          ...testResults.slice(0, 3).map((t) => ({ type: t.testType, title: t.title, score: t.score, date: t.createdAt })),
          ...interviews.slice(0, 3).map((i) => ({ type: 'INTERVIEW', title: `${i.companyName} (${i.type})`, score: i.score || 0, date: i.createdAt })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyRoadmaps = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const userSkills: string[] = latestResume ? JSON.parse(latestResume.parsedData)?.skillsFound || [] : ['Java', 'Data Structures', 'Git'];

    const roadmaps = COMPANIES_DATA.map((company) => {
      const matched = company.requiredSkills.filter((s) =>
        userSkills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
      );

      const skillGap = company.requiredSkills.filter((s) => !matched.includes(s));
      const matchPercentage = Math.round((matched.length / company.requiredSkills.length) * 100);

      return {
        ...company,
        matchPercentage,
        matchedSkills: matched,
        skillGap,
      };
    });

    res.json({
      status: 'success',
      data: roadmaps,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      include: {
        user: {
          select: { name: true, email: true, avatar: true },
        },
      },
      orderBy: { overallScore: 'desc' },
      take: 50,
    });

    const formatted = entries.map((e, index) => ({
      rank: index + 1,
      userName: e.user.name,
      userEmail: e.user.email,
      overallScore: Math.round(e.overallScore),
      mcqScore: Math.round(e.mcqScore),
      codingScore: Math.round(e.codingScore),
      interviewScore: Math.round(e.interviewScore),
      resumeScore: Math.round(e.resumeScore),
    }));

    res.json({
      status: 'success',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
