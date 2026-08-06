'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminRoute from '@/components/AdminRoute';
import { apiGet, apiPost } from '@/lib/api';

interface AdminQuestion {
  id: string;
  title: string;
  type: 'MCQ' | 'CODING' | 'INTERVIEW_PROMPT';
  category: string;
  company?: string;
  content: string;
  createdAt: string;
  createdBy: { name: string; email: string };
}

export default function CustomQuestionBuilderPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'MCQ' | 'CODING' | 'INTERVIEW_PROMPT'>('INTERVIEW_PROMPT');
  const [category, setCategory] = useState('System Design');
  const [company, setCompany] = useState('Google');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await apiGet<{ status: string; data: AdminQuestion[] }>('/admin/questions');
      if (res.ok && res.data?.data) {
        setQuestions(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setCreating(true);
    setMessage('');

    try {
      const res = await apiPost<{ status: string; data: AdminQuestion }>('/admin/questions', {
        title,
        type,
        category,
        company,
        content,
      });

      if (res.ok && res.data?.data) {
        setQuestions([res.data.data, ...questions]);
        setMessage('✅ Custom question/prompt created successfully!');
        setTitle('');
        setContent('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs font-bold text-purple-400 hover:text-purple-300">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-1">Custom Question & Prompt Builder</h1>
            <p className="text-sm text-slate-400">
              Create company-specific MCQ sets, custom interview prompts, and coding challenges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Create Form Panel */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-4">Add New Question / Prompt</h2>

              {message && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                  {message}
                </div>
              )}

              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='e.g. "Google L4 System Design - Rate Limiter Prompt"'
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="INTERVIEW_PROMPT">Interview Prompt</option>
                      <option value="MCQ">MCQ Question</option>
                      <option value="CODING">Coding Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Company
                    </label>
                    <select
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="Google">Google</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Meta">Meta</option>
                      <option value="TCS / Infosys">TCS / Infosys</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. System Design, OS, DBMS"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Content / System Prompt Payload
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter prompt instructions, question options, or test cases..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-xl bg-purple-600 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Save Question / Prompt'}
                </button>
              </form>
            </div>
          </div>

          {/* List Panel */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-white">Active Custom Admin Questions & Prompts ({questions.length})</h2>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{q.title}</span>
                      <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                        {q.type} • {q.company}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono line-clamp-2">{q.content}</p>
                    <p className="text-[10px] text-slate-500">Created by {q.createdBy.name} on {new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-8">No custom questions created yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
