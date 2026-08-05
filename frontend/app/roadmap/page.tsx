'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet } from '@/lib/api';

interface CompanyRoadmap {
  id: string;
  name: string;
  logo: string;
  targetRole: string;
  difficulty: string;
  matchPercentage: number;
  requiredSkills: string[];
  matchedSkills: string[];
  skillGap: string[];
  rounds: { name: string; description: string }[];
  roadmapSteps: { title: string; duration: string; topics: string[] }[];
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<CompanyRoadmap[]>([]);
  const [activeCompany, setActiveCompany] = useState<CompanyRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await apiGet<{ status: string; data: CompanyRoadmap[] }>('/analytics/roadmap');
      if (res.ok && res.data?.data) {
        setRoadmaps(res.data.data);
        if (res.data.data.length > 0) {
          setActiveCompany(res.data.data[0]);
        }
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
            <span>🗺️</span> Company-Wise Preparation Roadmaps
          </h1>
          <p className="text-sm text-slate-400">
            Target specific companies with tailored skill-gap analysis, interview format details, and study roadmaps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Company Selector Tabs */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Target Company</h2>
            {roadmaps.map((comp) => {
              const isSelected = activeCompany?.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => setActiveCompany(comp)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 text-white shadow-xl shadow-purple-500/10'
                      : 'border-white/10 bg-slate-900/60 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{comp.logo}</span>
                    <div className="text-left">
                      <p className="font-bold text-white">{comp.name}</p>
                      <p className="text-xs text-slate-400">{comp.targetRole}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-purple-400">{comp.matchPercentage}% Match</span>
                    <p className="text-[10px] text-slate-500">{comp.difficulty} Tier</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Company Detailed Roadmap View */}
          <div className="lg:col-span-8">
            {activeCompany && (
              <div className="space-y-6">
                {/* Overview Header */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl border border-white/10">
                        {activeCompany.logo}
                      </span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{activeCompany.name}</h2>
                        <p className="text-xs text-purple-400 font-medium">Role: {activeCompany.targetRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Skill Match</span>
                        <p className="text-xl font-extrabold text-purple-300">{activeCompany.matchPercentage}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Skill Gap Pills */}
                  <div className="mt-6 space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase">Your Matched Skills:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {activeCompany.matchedSkills.map((s, idx) => (
                          <span key={idx} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300 font-medium">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-amber-400 uppercase">Required Skills to Learn:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {activeCompany.skillGap.map((s, idx) => (
                          <span key={idx} className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-300 font-medium">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Format Rounds */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                  <h3 className="text-base font-bold text-white mb-4">Interview Process & Round Breakdown</h3>
                  <div className="space-y-3">
                    {activeCompany.rounds.map((r, idx) => (
                      <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="font-bold text-purple-300 text-sm">{r.name}</p>
                        <p className="text-xs text-slate-300 mt-1">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation Roadmap Timeline */}
                <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 backdrop-blur-xl">
                  <h3 className="text-base font-bold text-white mb-4">Step-by-Step Preparation Roadmap</h3>
                  <div className="space-y-4">
                    {activeCompany.roadmapSteps.map((step, idx) => (
                      <div key={idx} className="relative flex gap-4 rounded-xl border border-white/5 bg-slate-950 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="font-bold text-white text-sm">{step.title}</h4>
                            <span className="text-xs text-purple-400 font-semibold">{step.duration}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {step.topics.map((t, tidx) => (
                              <span key={tidx} className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
