'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet } from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  userName: string;
  userEmail: string;
  overallScore: number;
  mcqScore: number;
  codingScore: number;
  interviewScore: number;
  resumeScore: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await apiGet<{ status: string; data: LeaderboardEntry[] }>('/analytics/leaderboard');
      if (res.ok && res.data?.data) {
        setEntries(res.data.data);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span>🏆</span> Global Student Leaderboard
          </h1>
          <p className="text-sm text-slate-400">
            Compare your overall preparation rating across all modules with CSE peers.
          </p>
        </div>

        {/* Leaderboard Table Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">ATS Resume</th>
                  <th className="px-6 py-4 text-center">MCQs</th>
                  <th className="px-6 py-4 text-center">Coding</th>
                  <th className="px-6 py-4 text-center">AI Mock</th>
                  <th className="px-6 py-4 text-right">Overall Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="transition hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${
                            entry.rank === 1
                              ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-300'
                              : entry.rank === 2
                              ? 'bg-slate-300 text-slate-950 font-extrabold'
                              : entry.rank === 3
                              ? 'bg-amber-700 text-white font-extrabold'
                              : 'bg-white/5 text-slate-400 border border-white/10'
                          }`}
                        >
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="font-bold text-white">{entry.userName}</p>
                        <p className="text-xs text-slate-500">{entry.userEmail}</p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-center font-mono text-purple-400 font-semibold">
                      {entry.resumeScore}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center font-mono text-emerald-400 font-semibold">
                      {entry.mcqScore}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center font-mono text-indigo-400 font-semibold">
                      {entry.codingScore}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center font-mono text-amber-400 font-semibold">
                      {entry.interviewScore}%
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="inline-block rounded-xl bg-purple-500/20 px-3 py-1 text-base font-extrabold text-purple-300 border border-purple-500/30">
                        {entry.overallScore}%
                      </span>
                    </td>
                  </tr>
                ))}

                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-500">
                      No leaderboard entries yet. Take a test or upload a resume to compete!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
