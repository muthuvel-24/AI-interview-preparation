'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet } from '@/lib/api';

interface DashboardData {
  overallScore: number;
  moduleScores: {
    resumeScore: number;
    mcqScore: number;
    codingScore: number;
    interviewScore: number;
  };
  counts: {
    resumesAnalyzed: number;
    mcqTestsTaken: number;
    codingChallengesSolved: number;
    mockInterviewsCompleted: number;
  };
  recentActivity: { type: string; title: string; score: number; date: string }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await apiGet<{ status: string; data: DashboardData }>('/analytics/dashboard');
      if (res.ok && res.data?.data) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span>📊</span> Student Performance Analytics
            </h1>
            <p className="text-sm text-slate-400">
              Track your preparation progress across Resume, MCQ Quizzes, Coding, and AI Interviews.
            </p>
          </div>

          {data && (
            <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-6 py-3 border-purple-500/30">
              <span className="text-xs uppercase text-slate-300 font-bold">Overall Prep Rating</span>
              <span className="text-3xl font-extrabold text-purple-300">{data.overallScore}%</span>
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-8">
            {/* Module Breakdown Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Resume */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📄</span>
                  <span className="text-xs font-bold text-slate-400">ATS Resume</span>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-white">{data.moduleScores.resumeScore}%</p>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${data.moduleScores.resumeScore}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400">{data.counts.resumesAnalyzed} Resumes Evaluated</p>
              </div>

              {/* MCQ */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📝</span>
                  <span className="text-xs font-bold text-slate-400">MCQ Quizzes</span>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-white">{data.moduleScores.mcqScore}%</p>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${data.moduleScores.mcqScore}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400">{data.counts.mcqTestsTaken} Tests Completed</p>
              </div>

              {/* Coding */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💻</span>
                  <span className="text-xs font-bold text-slate-400">Coding Challenges</span>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-white">{data.moduleScores.codingScore}%</p>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${data.moduleScores.codingScore}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400">{data.counts.codingChallengesSolved} Challenges Solved</p>
              </div>

              {/* Interview */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs font-bold text-slate-400">Mock Interviews</span>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-white">{data.moduleScores.interviewScore}%</p>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${data.moduleScores.interviewScore}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400">{data.counts.mockInterviewsCompleted} Interviews Conducted</p>
              </div>
            </div>

            {/* Activity History */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-4">Recent Prep Activity</h2>
              {data.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {data.recentActivity.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {act.type === 'MCQ' ? '📝' : act.type === 'CODING' ? '💻' : '🤖'}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{act.title}</p>
                          <p className="text-xs text-slate-400">{new Date(act.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-bold text-purple-400">{Math.round(act.score)}% Score</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  No recent activities recorded yet. Complete quizzes or mock interviews to see history.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
