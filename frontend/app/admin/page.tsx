'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminRoute from '@/components/AdminRoute';
import { apiGet } from '@/lib/api';

interface BatchMetrics {
  totalStudents: number;
  avgAtsScore: number;
  totalInterviews: number;
  codingCompletionRate: number;
  skillGaps: { skill: string; count: number; percentage: number }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<BatchMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await apiGet<{ status: string; data: BatchMetrics }>('/admin/metrics');
      if (res.ok && res.data?.data) {
        setMetrics(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    fetch(`${apiUrl}/admin/export-students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cohort_readiness_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('CSV Export failed', err));
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 mb-2">
              🛡️ Placement Officer Portal
            </span>
            <h1 className="text-3xl font-bold text-white">Cohort Batch Analytics & Oversight</h1>
            <p className="text-sm text-slate-400">
              Monitor student readiness, export CSV reports, and manage custom interview prompts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              📥 Export Cohort CSV Report
            </button>

            <Link
              href="/admin/questions"
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-500 shadow-lg shadow-purple-600/30"
            >
              + Question & Prompt Builder
            </Link>
          </div>
        </div>

        {metrics && (
          <div className="space-y-8">
            {/* Batch Metrics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs uppercase text-slate-400 font-semibold">Enrolled Students</span>
                <p className="mt-3 text-3xl font-extrabold text-white">{metrics.totalStudents}</p>
                <p className="mt-1 text-[10px] text-slate-500">Active Batch Size</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs uppercase text-slate-400 font-semibold">Cohort Avg ATS Score</span>
                <p className="mt-3 text-3xl font-extrabold text-purple-400">{metrics.avgAtsScore}%</p>
                <p className="mt-1 text-[10px] text-slate-500">Resume Quality Baseline</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs uppercase text-slate-400 font-semibold">Total Mock Interviews</span>
                <p className="mt-3 text-3xl font-extrabold text-emerald-400">{metrics.totalInterviews}</p>
                <p className="mt-1 text-[10px] text-slate-500">Completed Sessions</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs uppercase text-slate-400 font-semibold">Coding Pass Rate</span>
                <p className="mt-3 text-3xl font-extrabold text-indigo-400">{metrics.codingCompletionRate}%</p>
                <p className="mt-1 text-[10px] text-slate-500">Benchmark Solved</p>
              </div>
            </div>

            {/* Skill Gap Distribution */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-2">Cohort Skill Gap Distribution</h2>
              <p className="text-xs text-slate-400 mb-6">
                Percentage of students requiring additional training or practice in specific domains.
              </p>

              <div className="space-y-4">
                {metrics.skillGaps.map((sg, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200">{sg.skill}</span>
                      <span className="text-purple-300 font-bold">{sg.percentage}% Need Improvement ({sg.count} Students)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.max(sg.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
