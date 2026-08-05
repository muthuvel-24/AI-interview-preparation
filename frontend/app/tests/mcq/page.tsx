'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPost } from '@/lib/api';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
}

interface ResultSummary {
  id: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  details: {
    questionId: string;
    question: string;
    selectedOption: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export default function MCQExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultSummary | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, result, timeLeft]);

  const fetchQuestions = async () => {
    try {
      const res = await apiGet<{ status: string; data: Question[] }>('/tests/mcq');
      if (res.ok && res.data?.data) {
        setQuestions(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const qId = questions[currentIndex].id;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    setSubmitting(true);

    const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));

    try {
      const res = await apiPost<{ status: string; data: ResultSummary }>('/tests/mcq/submit', {
        answers: formattedAnswers,
        timeSpent: 600 - timeLeft,
      });

      if (res.ok && res.data?.data) {
        setResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <div className="mx-auto max-w-5xl px-4 py-8">
        {result ? (
          /* Results View */
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-xl shadow-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/20 text-4xl border border-purple-500/30">
                🏆
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white">Quiz Result</h1>
              <div className="mt-4 flex justify-center gap-6">
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Score</p>
                  <p className="text-4xl font-extrabold text-purple-400 mt-1">{Math.round(result.score)}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Correct Answers</p>
                  <p className="text-4xl font-extrabold text-emerald-400 mt-1">
                    {result.correctAnswers} / {result.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Time Spent</p>
                  <p className="text-4xl font-extrabold text-indigo-400 mt-1">{result.timeSpent}s</p>
                </div>
              </div>
            </div>

            {/* Answer Breakdown */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Question Breakdown & Explanations</h2>
              {result.details.map((d, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-5 ${
                    d.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold text-slate-200">
                      {idx + 1}. {d.question}
                    </p>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${d.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {d.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-300">
                    <span className="font-bold text-slate-400">Explanation: </span>
                    {d.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Quiz Interface */
          <div className="space-y-6">
            {/* Top Bar: Timer + Navigator */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-6 py-4 backdrop-blur-xl">
              <div>
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <p className="text-sm font-medium text-slate-300">
                  Topic: {questions[currentIndex]?.category}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 px-4 py-2 border border-purple-500/20">
                  <span className="text-lg">⏱️</span>
                  <span className="font-mono text-base font-bold text-purple-300">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>

            {/* Question Box */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">
                {questions[currentIndex]?.question}
              </h2>

              <div className="space-y-3">
                {questions[currentIndex]?.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[questions[currentIndex].id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/10'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {isSelected && <span className="text-purple-400 text-lg">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigator */}
            <div className="flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="flex gap-1.5 overflow-x-auto py-2">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                        isCurrent
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
