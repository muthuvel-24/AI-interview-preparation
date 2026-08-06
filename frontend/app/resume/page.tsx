'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiPost } from '@/lib/api';

interface AnalysisReport {
  id: string;
  fileName: string;
  atsScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  parsedData: {
    skillsFound: string[];
    missingKeywords: string[];
    experienceLevel: string;
    targetRoleFit: string;
  };
}

interface JDMatchResult {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  fitLevel: string;
  summary: string;
}

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'jd_matcher' | 'rephraser'>('analyzer');

  // Analyzer States
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('My_Resume.pdf');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState('');

  // JD Matcher States
  const [jobDescription, setJobDescription] = useState('');
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);
  const [jdLoading, setJdLoading] = useState(false);

  // Bullet Rephraser States
  const [rawBullet, setRawBullet] = useState('');
  const [rephraseSuggestions, setRephraseSuggestions] = useState<string[]>([]);
  const [rephraseLoading, setRephraseLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text || file.name);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || resumeText.length < 10) {
      setError('Please enter or paste your resume content (at least 10 characters).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiPost<{ status: string; data: AnalysisReport }>('/resume/analyze', {
        fileName,
        resumeText,
        targetRole,
      });

      if (res.ok && res.data?.data) {
        setReport(res.data.data);
      } else {
        setError('Failed to analyze resume. Please try again.');
      }
    } catch {
      setError('An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleJDMatch = async () => {
    if (!resumeText || !jobDescription) return;
    setJdLoading(true);

    try {
      const res = await apiPost<{ status: string; data: JDMatchResult }>('/resume/match-jd', {
        resumeText,
        jobDescription,
      });

      if (res.ok && res.data?.data) {
        setJdResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJdLoading(false);
    }
  };

  const handleRephraseBullet = async () => {
    if (!rawBullet) return;
    setRephraseLoading(true);

    try {
      const res = await apiPost<{ status: string; data: { suggestions: string[] } }>('/resume/rephrase-bullet', {
        bullet: rawBullet,
        targetRole,
      });

      if (res.ok && res.data?.data) {
        setRephraseSuggestions(res.data.data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRephraseLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-2xl border border-purple-500/30">
              📄
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Resume Studio</h1>
              <p className="text-sm text-slate-400">
                ATS evaluation, live Job Description matching, and AI STAR bullet point optimizer.
              </p>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex rounded-xl border border-white/10 bg-slate-900/60 p-1.5 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'analyzer'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ATS Score & Analysis
            </button>
            <button
              onClick={() => setActiveTab('jd_matcher')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'jd_matcher'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live JD Matcher
            </button>
            <button
              onClick={() => setActiveTab('rephraser')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'rephraser'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Bullet Rephraser
            </button>
          </div>
        </div>

        {/* TAB 1: ATS ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-4">Upload or Paste Resume</h2>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAnalyze} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Target Role
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
                      <option value="Frontend Developer">Frontend Developer (React/Next.js)</option>
                      <option value="Backend Developer">Backend Developer (Node.js/Java)</option>
                      <option value="Full Stack Engineer">Full Stack Engineer</option>
                      <option value="Data Engineer / AI Engineer">Data Engineer / AI Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Upload Resume File
                    </label>
                    <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/5 p-6 text-center transition hover:border-purple-500/50 hover:bg-white/10">
                      <input
                        type="file"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      <span className="text-3xl mb-2">📁</span>
                      <p className="text-sm font-medium text-slate-200">
                        {fileName !== 'My_Resume.pdf' ? fileName : 'Click or Drag & Drop file here'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Or Paste Resume Text directly
                    </label>
                    <textarea
                      rows={8}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your education, skills, projects, and work experience text here..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Analyzing with AI...' : 'Analyze Resume'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              {report ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          ATS Resume Match Score
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-1">{report.fileName}</h2>
                        <p className="text-xs text-purple-400 font-medium">Target: {targetRole}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-purple-500/30 bg-purple-500/10">
                          <span className="text-3xl font-extrabold text-white">{report.atsScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                      <h3 className="flex items-center gap-2 text-base font-bold text-emerald-400 mb-3">
                        <span>✅</span> Key Strengths
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {report.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                      <h3 className="flex items-center gap-2 text-base font-bold text-amber-400 mb-3">
                        <span>⚠️</span> Identified Gaps
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {report.gaps.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-8 text-center">
                  <span className="text-5xl mb-4 opacity-60">📊</span>
                  <h3 className="text-lg font-bold text-white">No Analysis Report Yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Paste your resume text or upload your file to generate your ATS report.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE JD MATCHER */}
        {activeTab === 'jd_matcher' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase text-slate-300 mb-3">1. Resume Text</h3>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste candidate resume text here..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />

                <h3 className="text-sm font-bold uppercase text-slate-300 mt-4 mb-3">2. Target Job Description</h3>
                <textarea
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste company Job Description (JD) text here..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />

                <button
                  onClick={handleJDMatch}
                  disabled={jdLoading || !resumeText || !jobDescription}
                  className="mt-4 w-full rounded-xl bg-purple-600 py-3 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                >
                  {jdLoading ? 'Matching with AI...' : 'Calculate JD Match Score'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              {jdResult ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl text-center">
                    <span className="text-xs uppercase font-bold text-slate-400">Match Percentage</span>
                    <div className="mt-2 text-5xl font-extrabold text-purple-400">{jdResult.matchPercentage}%</div>
                    <p className="mt-1 text-xs font-bold text-emerald-400">{jdResult.fitLevel}</p>
                    <p className="mt-3 text-xs text-slate-300">{jdResult.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <h4 className="font-bold text-emerald-400 text-xs uppercase mb-2">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {jdResult.matchedKeywords.map((k, idx) => (
                          <span key={idx} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300 font-medium">
                            ✓ {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                      <h4 className="font-bold text-red-400 text-xs uppercase mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {jdResult.missingKeywords.map((k, idx) => (
                          <span key={idx} className="rounded-md bg-red-500/20 px-2 py-0.5 text-[11px] text-red-300 font-medium">
                            ✗ {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-8 text-center">
                  <span className="text-5xl mb-4 opacity-60">🎯</span>
                  <h3 className="text-lg font-bold text-white">Compare Resume Against Any Job Description</h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Paste the resume text and the Target Job Description on the left to analyze keyword overlap and suitability match.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AI BULLET REPHRASER */}
        {activeTab === 'rephraser' && (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase text-slate-300">Paste Weak Resume Bullet Point</h3>
              <input
                type="text"
                value={rawBullet}
                onChange={(e) => setRawBullet(e.target.value)}
                placeholder='e.g. "Built a website for class project using react"'
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-purple-500 focus:outline-none"
              />

              <button
                onClick={handleRephraseBullet}
                disabled={rephraseLoading || !rawBullet}
                className="w-full rounded-xl bg-purple-600 py-3 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {rephraseLoading ? 'Optimizing with AI...' : 'Rephrase with Action Verbs & STAR Metrics'}
              </button>
            </div>

            {rephraseSuggestions.length > 0 && (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4">
                <h3 className="text-sm font-bold text-purple-300">AI-Optimized STAR Bullet Points</h3>
                <div className="space-y-3">
                  {rephraseSuggestions.map((sug, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/90 p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium mt-0.5">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
