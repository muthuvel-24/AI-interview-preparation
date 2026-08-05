'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TestsHubPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Mock Assessments & Testing Engine</h1>
          <p className="text-sm text-slate-400">
            Practice real technical round MCQs and solve sandboxed coding challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* MCQ Test Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/60 p-8 backdrop-blur-xl transition hover:border-purple-500/50">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-3xl border border-purple-500/30">
                📝
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">Multiple Choice (MCQ) Quizzes</h2>
              <p className="mt-2 text-sm text-slate-300">
                Test your knowledge across Data Structures, Algorithms, OS, DBMS, Networks, and System Design with timed quizzes.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks'].map((tag) => (
                  <span key={tag} className="rounded-lg bg-white/5 px-3 py-1 text-xs font-medium text-purple-300 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Timed 15-minute exams • Instant scoring</span>
              <Link
                href="/tests/mcq"
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition"
              >
                Start MCQ Quiz →
              </Link>
            </div>
          </div>

          {/* Coding Challenge Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-900/60 p-8 backdrop-blur-xl transition hover:border-indigo-500/50">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-3xl border border-indigo-500/30">
                💻
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">Sandboxed Coding Challenges</h2>
              <p className="mt-2 text-sm text-slate-300">
                Solve LeetCode-style algorithmic coding problems. Run test cases instantly and submit solutions in JavaScript or Python.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Two Sum', 'Valid Palindrome', 'Array Reversing', 'Dynamic Programming'].map((tag) => (
                  <span key={tag} className="rounded-lg bg-white/5 px-3 py-1 text-xs font-medium text-indigo-300 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Sandboxed evaluation • Test case breakdown</span>
              <Link
                href="/tests/coding"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
              >
                Open Code Workspace →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
