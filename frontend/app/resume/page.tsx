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

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('My_Resume.pdf');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState('');

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

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-2xl border border-purple-500/30">
              📄
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Resume Analyzer</h1>
              <p className="text-sm text-slate-400">
                Get instant ATS score, keyword gap analysis, and tailored recommendations for top CSE roles.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Upload & Form Section */}
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

                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Upload Resume File (PDF / TXT / DOCX)
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
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, TXT, DOCX files</p>
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

          {/* Analysis Feedback Report Section */}
          <div className="lg:col-span-7">
            {report ? (
              <div className="space-y-6">
                {/* Score Card */}
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

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Experience Level</p>
                      <p className="text-xs font-bold text-slate-200 mt-1">{report.parsedData.experienceLevel}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Role Fit</p>
                      <p className="text-xs font-bold text-emerald-400 mt-1">{report.parsedData.targetRoleFit}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Skills Detected</p>
                      <p className="text-xs font-bold text-purple-400 mt-1">{Array.isArray(report.parsedData.skillsFound) ? report.parsedData.skillsFound.length : 8} Skills</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">Keywords Gap</p>
                      <p className="text-xs font-bold text-amber-400 mt-1">{Array.isArray(report.parsedData.missingKeywords) ? report.parsedData.missingKeywords.length : 3} Missing</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Breakdown */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Strengths */}
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

                  {/* Gaps */}
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

                {/* AI Improvement Suggestions */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                  <h3 className="flex items-center gap-2 text-base font-bold text-purple-300 mb-3">
                    <span>💡</span> Actionable ATS Recommendations
                  </h3>
                  <div className="space-y-3">
                    {report.suggestions.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-900/40 p-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-300">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 mt-0.5">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-8 text-center">
                <span className="text-5xl mb-4 opacity-60">📊</span>
                <h3 className="text-lg font-bold text-white">No Analysis Report Yet</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Paste your resume text or upload your resume file on the left to generate your AI-powered ATS evaluation report.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
