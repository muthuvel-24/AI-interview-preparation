'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export default function Home() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiGet<HealthCheckResponse>('/health');
        if (response.ok) {
          setHealth(response.data);
        } else {
          setError('Backend returned an error');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to connect to backend'
        );
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 font-sans min-h-screen">
      <main className="flex flex-col items-center gap-10 p-8">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-75 blur-lg animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-4xl">
              🎯
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            AI Interview Prep
          </h1>
          <p className="max-w-md text-center text-lg text-slate-300">
            Your AI-powered platform to ace technical interviews — resume
            analysis, coding tests, MCQs, and mock interviews.
          </p>
        </div>

        {/* Health Check Card */}
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            System Status
          </h2>

          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
              <span className="text-slate-300">
                Connecting to backend...
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 border border-red-500/20">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-medium text-red-400">
                  Connection Failed
                </p>
                <p className="text-sm text-red-300/70">{error}</p>
              </div>
            </div>
          )}

          {health && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-emerald-400">
                    Backend Connected
                  </p>
                  <p className="text-sm text-emerald-300/70">
                    All systems operational
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="mt-1 font-mono text-sm text-emerald-400 font-semibold">
                    {health.status}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Uptime
                  </p>
                  <p className="mt-1 font-mono text-sm text-purple-400 font-semibold">
                    {Math.floor(health.uptime)}s
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Server Time
                </p>
                <p className="mt-1 font-mono text-sm text-slate-300">
                  {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feature preview badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            '📄 Resume Analysis',
            '💻 Coding Tests',
            '📝 MCQ Quizzes',
            '🤖 AI Mock Interviews',
            '📊 Analytics',
            '🏆 Leaderboard',
          ].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-400 transition-colors hover:border-purple-500/40 hover:text-white"
            >
              {feature}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
