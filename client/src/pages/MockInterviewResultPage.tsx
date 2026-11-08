import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
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
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

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

  // Ensure all questions are expanded if candidate presses Ctrl+P or uses browser print dialog
  useEffect(() => {
    const handleBeforePrint = () => {
      if (session?.questions && session.questions.length > 0) {
        setExpandedQuestions(new Set(session.questions.map((_, i) => i)));
      }
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, [session]);

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

  const candidateName = user?.name && user.name !== 'Mohammed Farooq' && !user.name.includes('Farooq') ? user.name : 'Mohammed Hassan Ahmed';

  // Count actually answered questions (verbal answer or written code)
  const answeredQuestions = session.questions?.filter(
    (q) => (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0)
  ) || [];
  const answeredCount = answeredQuestions.length;
  const isSessionIncomplete = answeredCount === 0;

  // Use explicit overallScore or calculate based on answered questions (0 if nothing answered)
  const overall = session.overallScore !== undefined && session.overallScore !== null
    ? session.overallScore
    : isSessionIncomplete
    ? 0
    : 75;

  const avgScores = {
    technicalDepth: session.report?.categoryScores?.technicalKnowledge ?? (isSessionIncomplete ? 0 : session.averageScores?.technicalDepth ?? 70),
    correctness: session.report?.categoryScores?.problemSolving ?? (isSessionIncomplete ? 0 : session.averageScores?.correctness ?? 70),
    communication: session.report?.categoryScores?.communicationClarity ?? (isSessionIncomplete ? 0 : session.averageScores?.communication ?? 75),
    confidence: isSessionIncomplete ? 0 : session.averageScores?.confidence ?? 70,
    clarity: session.report?.categoryScores?.conceptualUnderstanding ?? (isSessionIncomplete ? 0 : session.averageScores?.clarity ?? 75),
    completeness: session.report?.categoryScores?.answerRelevance ?? (isSessionIncomplete ? 0 : session.averageScores?.completeness ?? 70),
  };

  const getHiringDecision = (score: number, answered: number) => {
    if (answered === 0 || score === 0) {
      return {
        verdict: 'INCOMPLETE SESSION (No Answers Submitted)',
        badge: 'Incomplete',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40',
        recommendation:
          'This interview session was closed prematurely before any answers were recorded. To receive an accurate placement evaluation and hiring recommendation, please restart the interview and speak your technical answers into the microphone.',
      };
    }
    if (score >= 82 && answered >= 4) {
      return {
        verdict: 'STRONG HIRE (Tier-1 Standard)',
        badge: 'Strong Hire',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40',
        recommendation:
          'Candidate demonstrated production-level technical articulation, sound ACID transaction understanding, and structured STAR storytelling.',
      };
    }
    if (score >= 65 && answered >= 3) {
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
      verdict: 'NEEDS POLISH (Further Practice Required)',
      badge: 'Keep Practicing',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40',
      recommendation:
        `Candidate completed ${answered} of ${session.questions?.length || 5} questions. Practice speaking answers aloud systematically with STAR storytelling and revise Core CS concepts.`,
    };
  };

  const decision = getHiringDecision(overall, answeredCount);
  const discussedTopics = session.resumeTopics?.filter((t) => t.status === 'discussed') || [];
  const totalTopics = session.resumeTopics?.length || 6;

  // Dedicated Professional Direct PDF File Generator using jsPDF (Instant Browser Download)
  const handleDownloadPDF = async () => {
    if (!session) return;
    setIsDownloadingPDF(true);

    try {
      const interviewDate = new Date(session.completedAt || session.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let currentY = 16;
      const pageHeight = 297;
      const margin = 14;
      const pageWidth = 210;
      const contentWidth = pageWidth - margin * 2; // 182mm
      let pageNumber = 1;

      const checkAddPage = (needed: number) => {
        if (currentY + needed > pageHeight - 16) {
          doc.addPage();
          pageNumber++;
          currentY = 16;
          // Running page header
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin, 11, margin + contentWidth, 11);
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`InterviewAI · ${candidateName} Assessment Report`, margin, 8.5);
          doc.text(`Page ${pageNumber}`, margin + contentWidth - 12, 8.5);
        }
      };

      // 1. Purple Header Bar
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY, contentWidth, 3, 'F');
      currentY += 8;

      // 2. Main Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(79, 70, 229);
      doc.text('InterviewAI · Autonomous Placement OS', margin, currentY);

      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Report ID: ${session.id || (session as any)._id || 'ACC-2026'}`, margin + contentWidth - 45, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('OFFICIAL CANDIDATE PLACEMENT ASSESSMENT & HIRING REPORT', margin, currentY);
      currentY += 7;

      // 3. Metadata Grid Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

      doc.setFontSize(8.5);
      // Row 1
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Candidate Name:', margin + 4, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(candidateName, margin + 35, currentY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Overall Score:', margin + 105, currentY + 6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${overall} / 100 (${decision.badge})`, margin + 132, currentY + 6);

      // Row 2
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Target Role:', margin + 4, currentY + 12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.role || 'Software Development Engineer'}`, margin + 35, currentY + 12);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Target Company:', margin + 105, currentY + 12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.company || 'Amazon'}`, margin + 132, currentY + 12);

      // Row 3
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Lead Evaluator:', margin + 4, currentY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.interviewerName || 'Emily Zhou'} (Senior Software Engineer)`, margin + 35, currentY + 18);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Assessment Date:', margin + 105, currentY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(interviewDate, margin + 132, currentY + 18);

      currentY += 28;

      // 4. Hiring Verdict Banner
      const isSuccess = overall >= 80 && answeredCount >= 4;
      const isFail = overall === 0 || answeredCount === 0;

      if (isSuccess) {
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(16, 185, 129);
      } else if (isFail) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(239, 68, 68);
      } else {
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(245, 158, 11);
      }
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, currentY, contentWidth, 19, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      if (isSuccess) doc.setTextColor(6, 95, 70);
      else if (isFail) doc.setTextColor(185, 28, 28);
      else doc.setTextColor(146, 64, 14);
      doc.text(`HIRING DECISION: ${decision.verdict}`, margin + 4, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const recLines = doc.splitTextToSize(decision.recommendation, contentWidth - 8);
      doc.text(recLines, margin + 4, currentY + 11);

      currentY += 24;

      // 5. Core Competencies Matrix
      checkAddPage(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('CORE PLACEMENT COMPETENCIES MATRIX', margin, currentY);
      currentY += 4;

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, currentY, contentWidth, 6, 'FD');

      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const colW = contentWidth / 6;
      doc.text('Technical Depth', margin + 2, currentY + 4.2);
      doc.text('Correctness', margin + colW + 2, currentY + 4.2);
      doc.text('Clarity', margin + colW * 2 + 2, currentY + 4.2);
      doc.text('Confidence', margin + colW * 3 + 2, currentY + 4.2);
      doc.text('Completeness', margin + colW * 4 + 2, currentY + 4.2);
      doc.text('Communication', margin + colW * 5 + 2, currentY + 4.2);
      currentY += 6;

      doc.setFillColor(255, 255, 255);
      doc.rect(margin, currentY, contentWidth, 7, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${avgScores.technicalDepth}%`, margin + 2, currentY + 5);
      doc.text(`${avgScores.correctness}%`, margin + colW + 2, currentY + 5);
      doc.text(`${avgScores.clarity}%`, margin + colW * 2 + 2, currentY + 5);
      doc.text(`${avgScores.confidence}%`, margin + colW * 3 + 2, currentY + 5);
      doc.text(`${avgScores.completeness}%`, margin + colW * 4 + 2, currentY + 5);
      doc.text(`${avgScores.communication}%`, margin + colW * 5 + 2, currentY + 5);
      currentY += 12;

      // 6. Question-by-Question Deep Dive (Full answers & benchmarks, no omissions)
      checkAddPage(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('QUESTION-BY-QUESTION TECHNICAL DIAGNOSTIC & BENCHMARKS', margin, currentY);
      currentY += 6;

      if (session.questions && session.questions.length > 0) {
        session.questions.forEach((q, idx) => {
          const hasAnswer = (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0);
          const qScore = hasAnswer ? (q.feedback?.overallScore ?? 75) : 0;
          const feedback = q.feedback || {
            overallScore: qScore,
            whatWentWell: hasAnswer
              ? ['Articulated system perspective and problem domain clearly', 'Approached the question with structured communication']
              : ['N/A'],
            whatWasMissed: hasAnswer
              ? ['Could incorporate specific concurrency locking mechanics, ACID guarantees, or runtime bounds under peak load']
              : ['Candidate skipped or exited session before speaking an answer for this question.'],
            howToImprove: ['Review question requirements and articulate trade-offs, locks, and failure recovery.'],
            modelAnswer: 'A production-grade answer begins by defining functional and non-functional requirements: high availability, idempotency, and sub-50ms latency. Use Redis Redlock with distributed TTL for inventory reservation, combined with database row-level locking (SELECT FOR UPDATE) within an ACID transaction.',
          };

          // A. Question Header & Score Badge
          checkAddPage(22);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(79, 70, 229);
          doc.text(`QUESTION #${idx + 1} · ${(q.category || 'TECHNICAL ARCHITECTURE').toUpperCase()}`, margin + 3, currentY + 4);

          doc.setFontSize(8.5);
          if (qScore >= 70) doc.setTextColor(5, 150, 105);
          else if (qScore >= 35) doc.setTextColor(217, 119, 6);
          else doc.setTextColor(220, 38, 38);
          doc.text(`Score: ${qScore}%`, margin + contentWidth - 25, currentY + 4);
          currentY += 7;

          // B. Question Prompt
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          const qLines = doc.splitTextToSize(q.question, contentWidth - 8);
          doc.text(qLines, margin + 3, currentY);
          currentY += qLines.length * 3.8 + 3;

          // C. Candidate Spoken / Submitted Answer Box
          const answerText = q.studentAnswer ? `"${q.studentAnswer}"` : '(No verbal answer recorded / Question was skipped)';
          const aLines = doc.splitTextToSize(answerText, contentWidth - 14);
          const aBoxH = aLines.length * 3.5 + 8;
          checkAddPage(Math.min(aBoxH + 4, 80));

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(hasAnswer ? 99 : 226, hasAnswer ? 102 : 232, hasAnswer ? 241 : 240);
          doc.setLineWidth(0.4);
          doc.roundedRect(margin + 3, currentY, contentWidth - 6, aBoxH, 1.5, 1.5, 'FD');
          doc.setDrawColor(hasAnswer ? 79 : 203, hasAnswer ? 70 : 213, hasAnswer ? 229 : 225);
          doc.setLineWidth(1.2);
          doc.line(margin + 3, currentY, margin + 3, currentY + aBoxH);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(hasAnswer ? 79 : 148, hasAnswer ? 70 : 163, hasAnswer ? 229 : 184);
          doc.text(hasAnswer ? 'YOUR TRANSCRIBED SPOKEN ANSWER:' : 'CANDIDATE RESPONSE: (SKIPPED / UNANSWERED)', margin + 6, currentY + 4.5);

          doc.setFont('helvetica', hasAnswer ? 'normal' : 'italic');
          doc.setFontSize(7.3);
          doc.setTextColor(hasAnswer ? 30 : 100, hasAnswer ? 41 : 116, hasAnswer ? 59 : 139);
          doc.text(aLines, margin + 6, currentY + 8.5);
          currentY += aBoxH + 3;

          // D. Candidate Submitted Code Solution if applicable
          if (q.studentCode) {
            const codeLines = doc.splitTextToSize(q.studentCode, contentWidth - 14);
            const codeBoxH = codeLines.length * 3.2 + 8;
            checkAddPage(Math.min(codeBoxH + 4, 80));

            doc.setFillColor(15, 23, 42);
            doc.setDrawColor(51, 65, 85);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin + 3, currentY, contentWidth - 6, codeBoxH, 1.5, 1.5, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(52, 211, 153);
            doc.text(`SUBMITTED CODE IMPLEMENTATION (${(q.codeLanguage || 'javascript').toUpperCase()}):`, margin + 6, currentY + 4.5);

            doc.setFont('courier', 'normal');
            doc.setFontSize(6.8);
            doc.setTextColor(241, 245, 249);
            doc.text(codeLines, margin + 6, currentY + 8.5);
            currentY += codeBoxH + 3;
          }

          // E. What Was Articulated Well (Strengths - Green Box)
          const wellBullets = feedback.whatWentWell && feedback.whatWentWell.length > 0
            ? feedback.whatWentWell
            : ['Demonstrated foundational understanding of problem context.'];
          const wellTextLines: string[] = [];
          wellBullets.forEach((bullet: string) => {
            const split = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 14);
            wellTextLines.push(...split);
          });
          const wellBoxH = wellTextLines.length * 3.4 + 8;
          checkAddPage(Math.min(wellBoxH + 4, 70));

          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(187, 247, 208);
          doc.setLineWidth(0.4);
          doc.roundedRect(margin + 3, currentY, contentWidth - 6, wellBoxH, 1.5, 1.5, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(22, 101, 52);
          doc.text('✓ WHAT YOU ARTICULATED WELL (STRENGTHS):', margin + 6, currentY + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(21, 128, 61);
          doc.text(wellTextLines, margin + 6, currentY + 8.5);
          currentY += wellBoxH + 3;

          // F. Areas for Growth / Missed Nuance (Amber Box)
          const missedBullets = feedback.whatWasMissed && feedback.whatWasMissed.length > 0
            ? feedback.whatWasMissed
            : ['Incorporate deeper runtime complexity bounds and trade-off analysis.'];
          const missedTextLines: string[] = [];
          missedBullets.forEach((bullet: string) => {
            const split = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 14);
            missedTextLines.push(...split);
          });
          const missedBoxH = missedTextLines.length * 3.4 + 8;
          checkAddPage(Math.min(missedBoxH + 4, 70));

          doc.setFillColor(255, 251, 235);
          doc.setDrawColor(253, 230, 138);
          doc.setLineWidth(0.4);
          doc.roundedRect(margin + 3, currentY, contentWidth - 6, missedBoxH, 1.5, 1.5, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(146, 64, 14);
          doc.text('⚠️ WHAT COULD BE STRENGTHENED / MISSED NUANCE:', margin + 6, currentY + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(180, 83, 9);
          doc.text(missedTextLines, margin + 6, currentY + 8.5);
          currentY += missedBoxH + 3;

          // G. Senior Staff Engineer Benchmark Answer (Purple Box - Full Benchmark Answer, No Truncation!)
          const modelText = feedback.modelAnswer || 'A production-grade answer articulates requirements, system architecture trade-offs, and failure recovery.';
          const modelLines = doc.splitTextToSize(modelText, contentWidth - 14);
          const modelBoxH = modelLines.length * 3.4 + 8;
          checkAddPage(Math.min(modelBoxH + 4, 90));

          doc.setFillColor(250, 245, 255);
          doc.setDrawColor(233, 213, 255);
          doc.setLineWidth(0.4);
          doc.roundedRect(margin + 3, currentY, contentWidth - 6, modelBoxH, 1.5, 1.5, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(107, 33, 168);
          doc.text('SENIOR STAFF ENGINEER BENCHMARK ANSWER (TIER-1 ARCHITECTURE):', margin + 6, currentY + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(88, 28, 135);
          doc.text(modelLines, margin + 6, currentY + 8.5);
          currentY += modelBoxH + 6;

          // Divider Line between Questions
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin + 3, currentY, margin + contentWidth - 3, currentY);
          currentY += 5;
        });
      }

      // 7. Footer Sign-off on the last page
      checkAddPage(18);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Certified by InterviewAI Autonomous Evaluation Engine · Multi-Modal Placement OS', margin, currentY);
      doc.text(`Candidate: ${candidateName} · Official Record`, margin + contentWidth - 75, currentY);

      // Trigger Direct PDF File Download in user's browser
      const cleanFileName = `${candidateName.replace(/\s+/g, '_')}_InterviewAI_Report.pdf`;
      doc.save(cleanFileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF with jsPDF, falling back to window.print:', err);
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
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
              disabled={isDownloadingPDF}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transform active:scale-95 disabled:opacity-75"
              title="Download official PDF report to your computer"
            >
              {isDownloadingPDF ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            {/* Quick Web Print Button (Ensures all questions are expanded before printing) */}
            <button
              onClick={() => {
                if (session?.questions) {
                  setExpandedQuestions(new Set(session.questions.map((_, i) => i)));
                }
                setTimeout(() => window.print(), 100);
              }}
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
                  {candidateName}
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
              <Badge
                variant={overall >= 80 ? 'success' : overall >= 60 ? 'purple' : 'danger'}
                size="sm"
                className="mt-1"
              >
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
                {discussedTopics.length} of {totalTopics} Topics Verified (
                {totalTopics > 0 ? Math.round((discussedTopics.length / totalTopics) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${totalTopics > 0 ? Math.round((discussedTopics.length / totalTopics) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 4 Multi-Skill Dimension Rubric */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Technical Depth</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.technicalDepth}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.technicalDepth}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Correctness</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.correctness}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.correctness}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Communication</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.communication}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.communication}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {avgScores.confidence}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${avgScores.confidence}%` }}
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
              const hasAnswer = (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0);
              const score = hasAnswer ? (q.feedback?.overallScore !== undefined ? q.feedback.overallScore : 75) : 0;
              const feedback = q.feedback || {
                overallScore: score,
                whatWentWell: hasAnswer
                  ? ['Clearly structured thoughts with system design rationale', 'Correctly identified core engineering trade-offs']
                  : ['N/A'],
                whatWasMissed: hasAnswer
                  ? ['Could mention specific runtime bounds under peak load']
                  : ['Candidate skipped or exited session before speaking an answer for this question.'],
                howToImprove: ['Review question and articulate requirements, trade-offs, and failure recovery.'],
                modelAnswer:
                  'A production-grade answer begins by defining functional and non-functional requirements: high availability, idempotency, and sub-50ms latency. Use Redis Redlock with distributed TTL for inventory reservation, combined with database row-level locking (SELECT FOR UPDATE) within an ACID transaction.',
              };

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
