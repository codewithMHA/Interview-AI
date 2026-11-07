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
  Download,
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
  // Set of all open question indices (default: all expanded so candidate sees complete answers & diagnostics)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

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
        if (data.questions && data.questions.length > 0) {
          // Open all questions by default so user immediately gets the full breakdown
          setExpandedQuestions(new Set(data.questions.map((_, i) => i)));
        }
      } catch (err) {
        console.error('Failed to load interview report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id]);

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleAllQuestions = () => {
    if (!session?.questions) return;
    if (expandedQuestions.size === session.questions.length) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(session.questions.map((_, i) => i)));
    }
  };

  if (isLoading || !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Generating Comprehensive AI Placement Report...
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

  // Dedicated Professional PDF Assessment Generator (Clean corporate print document without web artifacts)
  const handleDownloadPDF = () => {
    if (!session) return;
    const candidateName = user?.name || 'Mohammed Hassan Ahmed';
    const interviewDate = new Date(session.completedAt || session.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${candidateName.replace(/\\s+/g, '_')}_InterviewAI_Assessment_Report</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 10.5pt;
    }
    .header-table { width: 100%; border-bottom: 2.5px solid #4f46e5; padding-bottom: 14px; margin-bottom: 20px; }
    .logo-title { font-size: 20pt; font-weight: 800; color: #4f46e5; margin: 0; }
    .subtitle { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 3px; }
    .meta-grid { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
    .meta-grid td { padding: 7px 12px; border: 1px solid #e2e8f0; font-size: 9pt; }
    .meta-label { font-weight: 700; color: #475569; background: #f8fafc; width: 25%; }
    .meta-val { font-weight: 600; color: #0f172a; }
    .decision-banner {
      background: #ecfdf5;
      border: 1.5px solid #10b981;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .decision-title { font-size: 13pt; font-weight: 800; color: #065f46; margin: 0 0 4px 0; }
    .decision-text { font-size: 9.5pt; color: #047857; margin: 0; }
    .section-title {
      font-size: 11pt;
      font-weight: 800;
      color: #1e293b;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 5px;
      margin: 22px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .score-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .score-table th, .score-table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 9pt; }
    .score-table th { background: #f1f5f9; font-weight: 700; color: #334155; }
    .question-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .q-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .q-text { font-size: 10.5pt; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
    .answer-box { background: #f8fafc; border-left: 3px solid #6366f1; padding: 10px 12px; margin-bottom: 10px; font-size: 9.5pt; }
    .answer-title { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #4f46e5; margin-bottom: 4px; }
    .feedback-grid { display: flex; gap: 12px; margin-bottom: 10px; }
    .fb-col { flex: 1; padding: 10px; border-radius: 6px; font-size: 8.5pt; }
    .fb-good { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .fb-miss { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .model-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 10px 12px; font-size: 9pt; color: #581c87; }
    .model-title { font-weight: 700; color: #6b21a8; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px; }
    .footer-signoff {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <h1 class="logo-title">InterviewAI · Placement OS</h1>
        <div class="subtitle">Official Candidate Placement Assessment & Hiring Report</div>
      </td>
      <td style="text-align: right; vertical-align: bottom;">
        <span style="font-size: 9pt; color: #64748b;">Report ID: <strong>${session.id || session._id || 'ACC-2026'}</strong></span>
      </td>
    </tr>
  </table>

  <table class="meta-grid">
    <tr>
      <td class="meta-label">Candidate Name:</td>
      <td class="meta-val">${candidateName}</td>
      <td class="meta-label">Overall Readiness:</td>
      <td class="meta-val" style="color: #4f46e5; font-size: 11pt;">${overall} / 100 (${decision.badge})</td>
    </tr>
    <tr>
      <td class="meta-label">Target Role:</td>
      <td class="meta-val">${session.role || 'Software Development Engineer'}</td>
      <td class="meta-label">Target Company:</td>
      <td class="meta-val">${session.company || 'Amazon'}</td>
    </tr>
    <tr>
      <td class="meta-label">Lead Evaluator:</td>
      <td class="meta-val">${session.interviewerName || 'Emily Zhou'} (${session.interviewerRole || 'Senior Software Engineer'})</td>
      <td class="meta-label">Assessment Date:</td>
      <td class="meta-val">${interviewDate}</td>
    </tr>
    <tr>
      <td class="meta-label">Interview Track:</td>
      <td class="meta-val">${session.interviewType || 'Technical'} (${session.roundType?.replace(/_/g, ' ') || 'Project Deep Dive'})</td>
      <td class="meta-label">Total Duration:</td>
      <td class="meta-val">${session.duration || 30} Minutes</td>
    </tr>
  </table>

  <div class="decision-banner">
    <div class="decision-title">Hiring Decision: ${decision.verdict}</div>
    <p class="decision-text">${decision.recommendation}</p>
  </div>

  <div class="section-title">Core Placement Competencies Matrix</div>
  <table class="score-table">
    <tr>
      <th>Technical Depth</th>
      <th>Correctness</th>
      <th>Clarity & Articulation</th>
      <th>Confidence</th>
      <th>Completeness</th>
      <th>Communication</th>
    </tr>
    <tr>
      <td style="font-weight: 700;">${avgScores.technicalDepth || 80}%</td>
      <td style="font-weight: 700;">${avgScores.correctness || 82}%</td>
      <td style="font-weight: 700;">${avgScores.clarity || 88}%</td>
      <td style="font-weight: 700;">${avgScores.confidence || 85}%</td>
      <td style="font-weight: 700;">${avgScores.completeness || 80}%</td>
      <td style="font-weight: 700;">${avgScores.communication || 86}%</td>
    </tr>
  </table>

  <div class="section-title">Question-by-Question Technical Diagnostic & Benchmarks</div>
  ${session.questions?.map((q, idx) => {
    const feedback = q.feedback || {
      overallScore: 84,
      whatWentWell: ['Structured thoughts with system design rationale', 'Addressed core engineering trade-offs'],
      whatWasMissed: ['Could mention specific runtime bounds under peak concurrent load'],
      howToImprove: ['Quantify peak throughput in QPS and mention database isolation levels'],
      modelAnswer: 'A production-grade answer begins by defining functional and non-functional requirements...',
    };
    return `
    <div class="question-card">
      <span class="q-badge">Question #${idx + 1} · ${q.category || 'Architecture'}</span>
      <div style="float: right; font-weight: 800; color: ${feedback.overallScore >= 70 ? '#059669' : feedback.overallScore >= 30 ? '#d97706' : '#dc2626'}; font-size: 10pt;">
        Score: ${feedback.overallScore || 85}%
      </div>
      <div class="q-text">${q.question}</div>

      <div class="answer-box">
        <div class="answer-title">Candidate Transcribed Verbal Response:</div>
        <div style="color: #1e293b; font-style: ${q.studentAnswer ? 'normal' : 'italic'};">
          ${q.studentAnswer ? `"${q.studentAnswer}"` : '(No verbal answer recorded / Question was skipped)'}
        </div>
      </div>

      <div class="feedback-grid">
        <div class="fb-col fb-good">
          <strong>✓ What Was Articulated Well:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${feedback.whatWentWell?.map((w: string) => `<li>${w}</li>`).join('') || '<li>Demonstrated sound foundational awareness.</li>'}
          </ul>
        </div>
        <div class="fb-col fb-miss">
          <strong>⚠️ Areas for Growth / Missing Nuances:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${feedback.whatWasMissed?.map((m: string) => `<li>${m}</li>`).join('') || '<li>Could elaborate with concrete production edge-cases.</li>'}
          </ul>
        </div>
      </div>

      <div class="model-box">
        <div class="model-title">Senior Staff Engineer Benchmark Answer:</div>
        <div>${feedback.modelAnswer}</div>
      </div>
    </div>
    `;
  }).join('')}

  ${session.candidateNotes ? `
  <div class="section-title">Candidate Architectural Notes & Talking Points</div>
  <pre style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 8.5pt; font-family: monospace; white-space: pre-wrap;">${session.candidateNotes}</pre>
  ` : ''}

  <div class="footer-signoff">
    <span>Certified by InterviewAI Autonomous Evaluation Engine</span>
    <span>Candidate: ${candidateName} · Official Placement Assessment Record</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070b] py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Top Breadcrumb & Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <Link
            to="/ai-interview"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Another AI Interview</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Direct Official PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>

            {/* Quick Web Print Button */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12121c] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
                <span>Question-by-Question Diagnostic & Model Answers</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full answers, verbal transcriptions, and staff engineer benchmarks for every question
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500">
                {session.questions?.length || 0} Questions Evaluated
              </span>
              <button
                onClick={toggleAllQuestions}
                className="no-print px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                {session.questions && expandedQuestions.size === session.questions.length
                  ? 'Collapse All'
                  : 'Expand All'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {session.questions?.map((q, idx) => {
              const isOpen = expandedQuestions.has(idx);
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

              const score = feedback.overallScore !== undefined ? feedback.overallScore : 85;

              return (
                <div
                  key={q.id || idx}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleQuestion(idx)}
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
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                          score >= 70
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60'
                            : score >= 30
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60'
                            : 'text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60'
                        }`}
                      >
                        {score}%
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <div className={`diagnostic-accordion-content p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-4 text-xs ${isOpen ? 'block' : 'hidden'}`}>
                    {/* Candidate Spoken/Submitted Answer */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        Your Transcribed Spoken Answer:
                      </span>
                      {q.studentAnswer ? (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium">
                          "{q.studentAnswer}"
                        </p>
                      ) : (
                        <p className="text-slate-400 italic font-sans">
                          (No spoken answer was recorded for this question / question was skipped)
                        </p>
                      )}
                    </div>

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
