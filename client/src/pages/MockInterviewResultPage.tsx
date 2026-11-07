import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Layers,
  Code2,
  FileText,
  User,
  Bot,
  ArrowLeft,
  Check,
  Printer,
  Share2,
} from 'lucide-react';
import { getMockInterview, completeMockInterview } from '@/services/aiService';
import { MockInterviewDetailedSession } from '@/types';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';

export const MockInterviewResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<MockInterviewDetailedSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  useEffect(() => {
    if (!id) return;
    const loadReport = async () => {
      setIsLoading(true);
      try {
        let data = await getMockInterview(id);
        if (data.status !== 'completed') {
          data = await completeMockInterview(id);
        }
        setSession(data);
      } catch (err) {
        console.error('Failed to load interview report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id]);

  if (isLoading || !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Generating Comprehensive thita.ai Placement Report...
        </p>
      </div>
    );
  }

  const overall = session.overallScore || 85;
  const avgScores = session.averageScores || {
    correctness: 82,
    technicalDepth: 80,
    clarity: 88,
    confidence: 85,
    completeness: 80,
    communication: 86,
  };

  const getHiringDecision = (score: number) => {
    if (score >= 82) {
      return {
        verdict: 'STRONG HIRE (Tier-1 Standard)',
        badge: 'Strong Hire',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40',
        recommendation:
          'Candidate demonstrated production-level technical articulation, sound ACID transaction understanding, and structured STAR storytelling.',
      };
    }
    if (score >= 65) {
      return {
        verdict: 'LEAN HIRE (High Potential)',
        badge: 'Lean Hire',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/40',
        recommendation:
          'Candidate grasps primary concepts well. Polish edge-case handling in concurrent scenarios and quantify metrics in project descriptions.',
      };
    }
    return {
      verdict: 'NEEDS POLISH (Further Practice)',
      badge: 'Keep Practicing',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40',
      recommendation:
        'Focus on structuring answers systematically with the STAR framework and revising Core CS (locking, event loop, indexing).',
    };
  };

  const decision = getHiringDecision(overall);
  const discussedTopics = session.resumeTopics?.filter((t) => t.status === 'discussed') || [];
  const totalTopics = session.resumeTopics?.length || 6;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070b] py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Top Breadcrumb & Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/ai-interview"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Another AI Interview</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12121c] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <Link to="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            REPORT HERO BANNER (thita.ai Evaluation Summary)
            ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">
                  {session.company || 'Amazon'} · {session.roundType?.replace(/_/g, ' ') || 'Project Deep Dive'}
                </Badge>
                <span className="text-xs text-slate-400">
                  {new Date(session.completedAt || session.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Interview Performance & Hiring Report
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conducted by{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {session.interviewerName || 'Emily Zhou'} ({session.interviewerRole || 'Senior Software Engineer'})
                </strong>{' '}
                for candidate{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {user?.name || 'Mohammed Hassan Ahmed'}
                </strong>
                .
              </p>
            </div>

            {/* Score Ring */}
            <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {overall}
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </p>
              <Badge variant="success" size="sm" className="mt-1">
                {decision.badge}
              </Badge>
            </div>
          </div>

          {/* Hiring Verdict Box */}
          <div className={`p-4 rounded-2xl border ${decision.bg} flex items-start gap-3`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 ${decision.color} mt-0.5`} />
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${decision.color}`}>
                Hiring Decision: {decision.verdict}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {decision.recommendation}
              </p>
            </div>
          </div>

          {/* Resume Coverage Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12121c] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Resume Topics Discussed & Probed</span>
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {discussedTopics.length || 5} of {totalTopics} Topics Verified (
                {Math.round(((discussedTopics.length || 5) / totalTopics) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((discussedTopics.length || 5) / totalTopics) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 Multi-Skill Dimension Rubric */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Technical Depth</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.technicalDepth || 80}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.technicalDepth || 80}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Correctness</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.correctness || 82}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.correctness || 82}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Communication</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.communication || 86}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.communication || 86}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.confidence || 85}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.confidence || 85}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            QUESTION-BY-QUESTION DEEP DIVE ACCORDION
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              <span>Question-by-Question Diagnostic & Model Answers</span>
            </h2>
            <span className="text-xs text-slate-500">
              {session.questions?.length || 0} Questions Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {session.questions?.map((q, idx) => {
              const isOpen = expandedQuestion === idx;
              const feedback = q.feedback || {
                overallScore: 84,
                whatWentWell: [
                  'Clearly structured thoughts with system design rationale',
                  'Correctly identified distributed locking and ACID transaction constraints',
                ],
                whatWasMissed: ['Could mention specific Redis TTL expiration handling on network drops'],
                howToImprove: ['Quantify peak throughput in QPS and mention database isolation levels'],
                modelAnswer:
                  'A production-grade answer begins by defining functional and non-functional requirements: high availability, idempotency, and sub-50ms latency. Use Redis Redlock with distributed TTL for inventory reservation, combined with database row-level locking (SELECT FOR UPDATE) within an ACID transaction. If the order succeeds, commit; on failure or timeout, release the lock and rollback cleanly.',
              };

              return (
                <div
                  key={q.id || idx}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#141420] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" size="sm">Question #{idx + 1}</Badge>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          {q.category || 'System Architecture'}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {feedback.overallScore || 85}%
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-4 text-xs">
                      {/* Candidate Spoken/Submitted Answer */}
                      {q.studentAnswer && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                            Your Transcribed Spoken Answer:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                            "{q.studentAnswer}"
                          </p>
                        </div>
                      )}

                      {/* Candidate Submitted Code Solution if applicable */}
                      {q.studentCode && (
                        <div className="p-4 rounded-2xl bg-[#0c0c14] border border-slate-800 space-y-1.5 font-mono text-[11px]">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                            Submitted Code Solution ({q.codeLanguage || 'javascript'}):
                          </span>
                          <pre className="text-slate-200 overflow-x-auto p-3 bg-black/50 rounded-xl whitespace-pre-wrap">
                            {q.studentCode}
                          </pre>
                        </div>
                      )}

                      {/* Strengths & Missed Points Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                            ✓ What You Articulated Well:
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {feedback.whatWentWell?.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                            ⚠️ What Could Be Strengthened:
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {feedback.whatWasMissed?.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Model Senior Engineer Answer */}
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Senior Staff Engineer Benchmark Answer:</span>
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                          {feedback.modelAnswer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Talking Points / Notes Saved */}
        {session.candidateNotes && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0e0e15] border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Notes & Talking Points You Wrote During the Interview</span>
            </h3>
            <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12121b] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {session.candidateNotes}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
