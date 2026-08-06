'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export default function Home() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiGet<HealthCheckResponse>('/health');
        if (response.ok) {
          setHealth(response.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 font-sans min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 flex flex-col gap-10 w-full">
        {/* User Welcome & Gamification Banner */}
        {user ? (
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👋</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Welcome back, {user.name}!
                  </h2>
                </div>
                <p className="mt-1 text-xs md:text-sm text-slate-300">
                  Target CSE Placement Preparation • Active Batch Student
                </p>
              </div>

              {/* Gamification Flame & Badges Widget */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Flame Streak Widget */}
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 border-amber-500/20">
                  <span className="text-3xl animate-bounce">🔥</span>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300">
                      Daily Streak
                    </span>
                    <p className="text-xl font-extrabold text-white">{user.streakCount || 1} Days Active</p>
                  </div>
                </div>

                {/* Badges Showcase */}
                <div className="flex flex-col rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-300 mb-1">
                    🏅 Earned Badges
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(user.badges && user.badges.length > 0 ? user.badges : ['Welcome Rookie']).map((b, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[11px] font-bold text-purple-200"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-75 blur-lg animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-4xl border border-white/10">
                🎯
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              AI Interview Preparation Platform
            </h1>
            <p className="max-w-xl text-sm sm:text-lg text-slate-300">
              The ultimate platform for CSE students — ATS resume studio, MCQ quizzes, sandboxed coding, AI voice mock interviews, and placement analytics.
            </p>

            <div className="flex gap-4 mt-2">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition"
              >
                Get Started Free →
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
              >
                Log In
              </Link>
            </div>
          </div>
        )}

        {/* Feature Navigation Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/resume"
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-purple-500/50 hover:bg-purple-500/5 shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl border border-purple-500/30">
              📄
            </span>
            <h3 className="mt-4 text-xl font-bold text-white group-hover:text-purple-300">AI Resume Studio</h3>
            <p className="mt-2 text-xs text-slate-400">
              Upload resume, get instant ATS score, missing keywords gap, and STAR bullet rephraser.
            </p>
          </Link>

          <Link
            href="/tests"
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-indigo-500/50 hover:bg-indigo-500/5 shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl border border-indigo-500/30">
              💻
            </span>
            <h3 className="mt-4 text-xl font-bold text-white group-hover:text-indigo-300">Mock Tests & Coding</h3>
            <p className="mt-2 text-xs text-slate-400">
              Timed MCQ quizzes across core CS topics and sandboxed Monaco coding challenges with AI hints.
            </p>
          </Link>

          <Link
            href="/interview"
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-pink-500/50 hover:bg-pink-500/5 shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20 text-2xl border border-pink-500/30">
              🎙️
            </span>
            <h3 className="mt-4 text-xl font-bold text-white group-hover:text-pink-300">AI Voice Mock Interview</h3>
            <p className="mt-2 text-xs text-slate-400">
              Practice HR & Technical interviews with Web Speech voice recognition and real-time audio replies.
            </p>
          </Link>

          <Link
            href="/roadmap"
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-cyan-500/50 hover:bg-cyan-500/5 shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-2xl border border-cyan-500/30">
              🗺️
            </span>
            <h3 className="mt-4 text-xl font-bold text-white group-hover:text-cyan-300">Company Roadmaps</h3>
            <p className="mt-2 text-xs text-slate-400">
              Skill gap analysis against Google, Amazon, Microsoft, TCS formats with study milestones.
            </p>
          </Link>

          <Link
            href="/analytics"
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-emerald-500/50 hover:bg-emerald-500/5 shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl border border-emerald-500/30">
              📊
            </span>
            <h3 className="mt-4 text-xl font-bold text-white group-hover:text-emerald-300">Analytics Dashboard</h3>
            <p className="mt-2 text-xs text-slate-400">
              Track overall preparation rating, progress bars across modules, and activity history.
            </p>
          </Link>

          <Link
            href="/leaderboard"
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition hover:border-amber-500/50 hover:bg-amber-500/5 shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-2xl border border-amber-500/30">
              🏆
            </span>
            <h3 className="mt-4 text-xl font-bold text-white group-hover:text-amber-300">Peer Leaderboard</h3>
            <p className="mt-2 text-xs text-slate-400">
              Compare your scores and rank against CSE peers across the college network.
            </p>
          </Link>
        </div>

        {/* System Health Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">System Operational Status</p>
              <p className="text-xs text-slate-400">Connected to Express API Server & PostgreSQL Prisma ORM</p>
            </div>
          </div>

          {health && (
            <div className="flex gap-4 text-xs font-mono text-slate-300">
              <span>Status: <strong className="text-emerald-400">{health.status}</strong></span>
              <span>Uptime: <strong className="text-purple-300">{Math.floor(health.uptime)}s</strong></span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
