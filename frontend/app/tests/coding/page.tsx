'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPost } from '@/lib/api';

interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: {
    javascript: string;
    python: string;
  };
  testCases: { input: string; expectedOutput: string }[];
}

interface TestRunResult {
  score: number;
  passedCount: number;
  totalTestCases: number;
  results: { input: string; expected: string; actual: string; passed: boolean; error?: string }[];
}

export default function CodingWorkspacePage() {
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<CodingChallenge | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await apiGet<{ status: string; data: CodingChallenge[] }>('/tests/coding');
      if (res.ok && res.data?.data) {
        setChallenges(res.data.data);
        if (res.data.data.length > 0) {
          selectChallenge(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectChallenge = (c: CodingChallenge) => {
    setActiveChallenge(c);
    setCode(c.starterCode[language] || c.starterCode.javascript);
    setTestResult(null);
    setSubmitted(false);
  };

  const handleLanguageChange = (lang: 'javascript' | 'python') => {
    setLanguage(lang);
    if (activeChallenge) {
      setCode(activeChallenge.starterCode[lang] || '');
    }
  };

  const handleRunCode = async () => {
    if (!activeChallenge) return;
    setRunning(true);
    setTestResult(null);

    try {
      const res = await apiPost<{ status: string; data: TestRunResult }>('/tests/coding/run', {
        challengeId: activeChallenge.id,
        language,
        code,
      });

      if (res.ok && res.data?.data) {
        setTestResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!activeChallenge) return;
    setRunning(true);

    try {
      const res = await apiPost<{ status: string; data: TestRunResult }>('/tests/coding/submit', {
        challengeId: activeChallenge.id,
        language,
        code,
      });

      if (res.ok && res.data?.data) {
        setTestResult(res.data.data);
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-73px)] flex-col bg-slate-950 overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-white flex items-center gap-2">
              <span>💻</span> Coding Sandbox
            </span>

            {/* Challenge Selector */}
            <select
              value={activeChallenge?.id || ''}
              onChange={(e) => {
                const found = challenges.find((c) => c.id === e.target.value);
                if (found) selectChallenge(found);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => handleLanguageChange('javascript')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  language === 'javascript' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                JavaScript
              </button>
              <button
                onClick={() => handleLanguageChange('python')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  language === 'python' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
            </div>

            <button
              onClick={handleRunCode}
              disabled={running}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {running ? 'Running...' : '▶ Run Code'}
            </button>

            <button
              onClick={handleSubmitCode}
              disabled={running}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
            >
              Submit Solution
            </button>
          </div>
        </div>

        {/* Main Content Workspace Split Panel */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Problem Description Panel */}
          <div className="md:col-span-5 flex flex-col border-r border-white/10 bg-slate-900/40 p-6 overflow-y-auto">
            {activeChallenge && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">{activeChallenge.title}</h2>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        activeChallenge.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : activeChallenge.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {activeChallenge.difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-purple-400">{activeChallenge.category}</p>
                </div>

                <div className="prose prose-invert text-xs text-slate-300">
                  <p>{activeChallenge.description}</p>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h3>
                  {activeChallenge.examples.map((ex, idx) => (
                    <div key={idx} className="rounded-xl border border-white/5 bg-slate-950 p-3 text-xs font-mono space-y-1">
                      <p className="text-slate-400">Input: <span className="text-slate-200">{ex.input}</span></p>
                      <p className="text-slate-400">Output: <span className="text-emerald-400">{ex.output}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Code Editor + Test Case Output Split */}
          <div className="md:col-span-7 flex flex-col overflow-hidden bg-slate-950">
            {/* Editor Area */}
            <div className="flex-1 flex flex-col border-b border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Code Editor</span>
                <span className="text-[10px] text-slate-500">Auto-evaluator enabled</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full rounded-xl border border-white/10 bg-slate-900/90 p-4 font-mono text-sm text-emerald-300 focus:border-purple-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Test Results Output Drawer */}
            <div className="h-48 border-t border-white/10 bg-slate-900/60 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Test Case Results
                </span>
                {testResult && (
                  <span className={`text-xs font-extrabold ${testResult.score === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {testResult.passedCount} / {testResult.totalTestCases} Passed ({Math.round(testResult.score)}%)
                  </span>
                )}
              </div>

              {submitted && testResult?.score === 100 && (
                <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 font-semibold text-center">
                  🎉 Challenge Completed & Score Saved to Leaderboard!
                </div>
              )}

              {testResult ? (
                <div className="space-y-2">
                  {testResult.results.map((r, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-mono ${
                        r.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                      }`}
                    >
                      <div>
                        <span className="text-slate-400">Test {idx + 1}: </span>
                        <span className="text-slate-300">{r.input}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">Exp: {r.expected}</span>
                        <span className={r.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          Got: {r.actual}
                        </span>
                        <span>{r.passed ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Click "Run Code" or "Submit Solution" to execute test cases against your code.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
