'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPost } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewSession {
  id: string;
  type: 'HR' | 'TECHNICAL';
  companyName: string;
  roleName: string;
  status: string;
  score?: number;
  transcript: Message[];
  feedback?: {
    overallScore: number;
    communicationRating: number;
    technicalAccuracy: number;
    strengths: string[];
    areasForImprovement: string[];
  };
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

  // Voice Mode states
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchHistory();
    setupSpeechRecognition();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Speak AI response if voice mode is enabled
    if (voiceMode && activeSession?.transcript.length) {
      const lastMsg = activeSession.transcript[activeSession.transcript.length - 1];
      if (lastMsg.role === 'assistant') {
        speakText(lastMsg.content);
      }
    }
  }, [activeSession?.transcript, voiceMode]);

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
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

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

    const userText = inputMessage;
    setInputMessage('');

    const updatedTranscript: Message[] = [
      ...activeSession.transcript,
      { role: 'user', content: userText },
    ];

    setActiveSession({
      ...activeSession,
      transcript: updatedTranscript,
    });

    setLoading(true);

    try {
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!activeSession) return;
    setLoading(true);

    try {
      const res = await apiPost<{ status: string; data: { score: number; feedback: any } }>('/interview/complete', {
        sessionId: activeSession.id,
      });

      if (res.ok && res.data?.data) {
        const completed = {
          ...activeSession,
          status: 'COMPLETED',
          score: res.data.data.score,
          feedback: res.data.data.feedback,
        };
        setActiveSession(completed);
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
              Practice HR and Technical interviews tailored for top companies with turn-by-turn speech feedback.
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
                  onClick={() => setActiveSession(s)}
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
                <p className="text-xs text-slate-500 text-center py-6">No past sessions. Click "Start New Interview" above.</p>
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
                    {/* Voice Mode Toggle Button */}
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

                    {activeSession.status === 'IN_PROGRESS' && (
                      <button
                        onClick={handleCompleteInterview}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                      >
                        End & Get Score Report
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

                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white/10 p-4 text-xs text-slate-400 flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                        AI Interviewer is thinking...
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
                  Select an existing session from the left sidebar or click "Start New Interview" at the top to practice with the AI interviewer using text or voice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
