'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPost } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewFeedback {
  overallScore: number;
  communicationRating: number;
  technicalAccuracy: number;
  problemSolvingRating?: number;
  relevanceRating?: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback?: string;
}

interface InterviewSession {
  id: string;
  type: 'HR' | 'TECHNICAL';
  companyName: string;
  roleName: string;
  status: string;
  score?: number;
  transcript: Message[];
  feedback?: InterviewFeedback;
  createdAt: string;
}

export default function InterviewPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'HR' | 'TECHNICAL'>('TECHNICAL');
  const [companyName, setCompanyName] = useState('Google');
  const [roleName, setRoleName] = useState('Software Development Engineer');
  const [showScorecard, setShowScorecard] = useState(false);

  // Voice Mode states
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchHistory();
    setupSpeechRecognition();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Speak AI response if voice mode is enabled
    if (voiceMode && activeSession?.transcript.length && !loading) {
      const lastMsg = activeSession.transcript[activeSession.transcript.length - 1];
      if (lastMsg.role === 'assistant') {
        speakText(lastMsg.content);
      }
    }
  }, [activeSession?.transcript, voiceMode, loading]);

  const setupSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcriptText = event.results[0][0].transcript;
          setInputMessage(transcriptText);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiGet<{ status: string; data: InterviewSession[] }>('/interview/history');
      if (res.ok && res.data?.data) {
        setSessions(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewSession = async () => {
    setLoading(true);
    setShowScorecard(false);
    try {
      const res = await apiPost<{ status: string; data: InterviewSession }>('/interview/start', {
        type,
        companyName,
        roleName,
      });

      if (res.ok && res.data?.data) {
        const newSession = res.data.data;
        setSessions((prev) => [newSession, ...prev]);
        setActiveSession(newSession);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeSession || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const updatedTranscript: Message[] = [
      ...activeSession.transcript,
      { role: 'user', content: userText },
    ];

    // Optimistically update transcript
    setActiveSession({
      ...activeSession,
      transcript: updatedTranscript,
    });

    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/interview/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          message: userText,
        }),
      });

      if (!response.ok || !response.body) {
        // Fallback to standard chat
        const res = await apiPost<{ status: string; data: { reply: string; transcript: Message[] } }>('/interview/chat', {
          sessionId: activeSession.id,
          message: userText,
        });

        if (res.ok && res.data?.data) {
          setActiveSession({
            ...activeSession,
            transcript: res.data.data.transcript,
          });
        }
        return;
      }

      // Stream incoming tokens
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedAssistantText = '';
      let buffer = '';

      // Append assistant placeholder
      setActiveSession({
        ...activeSession,
        transcript: [...updatedTranscript, { role: 'assistant', content: '' }],
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                streamedAssistantText += parsed.chunk;
                setActiveSession((prev) => {
                  if (!prev) return null;
                  const cur = [...prev.transcript];
                  cur[cur.length - 1] = { role: 'assistant', content: streamedAssistantText };
                  return { ...prev, transcript: cur };
                });
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!activeSession) return;
    setLoading(true);

    try {
      const res = await apiPost<{ status: string; data: { score: number; feedback: InterviewFeedback } }>('/interview/complete', {
        sessionId: activeSession.id,
      });

      if (res.ok && res.data?.data) {
        const completed: InterviewSession = {
          ...activeSession,
          status: 'COMPLETED',
          score: res.data.data.score,
          feedback: res.data.data.feedback,
        };
        setActiveSession(completed);
        setShowScorecard(true);
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span>🤖</span> AI Mock Interview Chatbots
            </h1>
            <p className="text-sm text-slate-400">
              Practice HR & Technical interviews evaluated against a weighted 4-dimension engineering rubric.
            </p>
          </div>

          {!activeSession && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/10 backdrop-blur-xl">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'HR' | 'TECHNICAL')}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              >
                <option value="TECHNICAL">Technical Round</option>
                <option value="HR">HR Behavioral Round</option>
              </select>

              <select
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              >
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Meta">Meta</option>
                <option value="TCS / Infosys">TCS / Infosys</option>
              </select>

              <button
                onClick={startNewSession}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500"
              >
                Start New Interview
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar: Past Sessions History */}
          <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl max-h-[70vh] overflow-y-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">
              Recent Interview Sessions
            </h2>

            <div className="space-y-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSession(s);
                    if (s.status === 'COMPLETED') setShowScorecard(true);
                  }}
                  className={`flex w-full flex-col gap-1 rounded-xl border p-3.5 text-left transition ${
                    activeSession?.id === s.id
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">
                      {s.companyName} • {s.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        s.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {s.status === 'COMPLETED' ? `${s.score}%` : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{s.roleName}</p>
                </button>
              ))}

              {sessions.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No past sessions. Click &quot;Start New Interview&quot; above.</p>
              )}
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl h-[70vh] overflow-hidden">
            {activeSession ? (
              <div className="flex flex-1 flex-col h-full overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/40 px-6 py-4">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {activeSession.companyName} — {activeSession.type} Interview
                    </h3>
                    <p className="text-xs text-slate-400">Target Role: {activeSession.roleName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setVoiceMode(!voiceMode);
                        if (voiceMode && typeof window !== 'undefined') window.speechSynthesis?.cancel();
                      }}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        voiceMode
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/30'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{voiceMode ? '🔊 Voice Mode ON' : '🔇 Voice Mode OFF'}</span>
                    </button>

                    {activeSession.status === 'COMPLETED' && activeSession.feedback && (
                      <button
                        onClick={() => setShowScorecard(true)}
                        className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-3.5 py-1.5 text-xs font-bold text-purple-300 transition hover:bg-purple-500/20"
                      >
                        📊 View Scorecard ({activeSession.score}%)
                      </button>
                    )}

                    {activeSession.status === 'IN_PROGRESS' && (
                      <button
                        onClick={handleCompleteInterview}
                        disabled={loading}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        End & Get Rubric Score
                      </button>
                    )}

                    <button
                      onClick={() => setActiveSession(null)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeSession.transcript.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-600/20'
                            : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 opacity-60 text-[10px] uppercase font-bold">
                          <span>{msg.role === 'user' ? 'You' : 'AI Interviewer'}</span>
                          {msg.role === 'assistant' && (
                            <button
                              onClick={() => speakText(msg.content)}
                              className="text-purple-300 hover:text-white"
                              title="Listen to response"
                            >
                              🔊 Play
                            </button>
                          )}
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {loading && !activeSession.transcript[activeSession.transcript.length - 1]?.content && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white/10 p-4 text-xs text-slate-400 flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                        AI Interviewer is evaluating and generating question...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                {activeSession.status === 'IN_PROGRESS' && (
                  <form onSubmit={handleSendMessage} className="border-t border-white/10 bg-slate-950/40 p-4 flex gap-3">
                    <button
                      type="button"
                      onClick={toggleMicListening}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg transition ${
                        isListening
                          ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                      title={isListening ? 'Listening...' : 'Click to speak'}
                    >
                      🎙️
                    </button>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={isListening ? 'Listening to your voice...' : 'Type or speak your answer...'}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={loading || !inputMessage.trim()}
                      className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <span className="text-5xl mb-3 opacity-60">🎙️</span>
                <h3 className="text-xl font-bold text-white">Select or Start an Interview Session</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Select an existing session from the left sidebar or click &quot;Start New Interview&quot; at the top to practice with the AI interviewer using text or voice.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COMPREHENSIVE RUBRIC SCORECARD MODAL */}
        {showScorecard && activeSession?.feedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Engineering Evaluation Scorecard
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {activeSession.companyName} • {activeSession.type}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400">Weighted Score</span>
                    <span className="text-3xl font-extrabold text-emerald-400">
                      {activeSession.feedback.overallScore}%
                    </span>
                  </div>
                  <button
                    onClick={() => setShowScorecard(false)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 4-Dimension Rubric Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400">4-Dimension Rubric Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Technical Accuracy (35%) */}
                  <div className="rounded-xl border border-white/5 bg-slate-950 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Technical Accuracy (35%)</span>
                      <span className="text-purple-400 font-bold">{activeSession.feedback.technicalAccuracy}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${activeSession.feedback.technicalAccuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Problem Solving & Depth (25%) */}
                  <div className="rounded-xl border border-white/5 bg-slate-950 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Problem Solving & Depth (25%)</span>
                      <span className="text-cyan-400 font-bold">{activeSession.feedback.problemSolvingRating || 75}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${activeSession.feedback.problemSolvingRating || 75}%` }}
                      />
                    </div>
                  </div>

                  {/* Communication & Articulation (25%) */}
                  <div className="rounded-xl border border-white/5 bg-slate-950 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Communication & Clarity (25%)</span>
                      <span className="text-emerald-400 font-bold">{activeSession.feedback.communicationRating}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${activeSession.feedback.communicationRating}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Relevance & STAR (15%) */}
                  <div className="rounded-xl border border-white/5 bg-slate-950 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Relevance & Structure (15%)</span>
                      <span className="text-amber-400 font-bold">{activeSession.feedback.relevanceRating || 80}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${activeSession.feedback.relevanceRating || 80}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h4 className="text-xs font-bold uppercase text-emerald-400 mb-2">✅ Identified Strengths</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeSession.feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <h4 className="text-xs font-bold uppercase text-amber-400 mb-2">⚠️ Areas for Growth</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeSession.feedback.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {activeSession.feedback.detailedFeedback && (
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-slate-300 italic">
                  &quot;{activeSession.feedback.detailedFeedback}&quot;
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowScorecard(false)}
                  className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-purple-500"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
