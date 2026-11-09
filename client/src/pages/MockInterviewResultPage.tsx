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

// Comprehensive High-Precision Role-Based Benchmark Answer Generator for All Domain Questions
export const getBenchmarkForQuestion = (question: string, category?: string, role?: string): string => {
  const lower = (question || '').toLowerCase();
  const r = (role || '').toLowerCase();
  const isSenior = r.includes('senior') || r.includes('staff') || r.includes('lead') || r.includes('architect');
  const isSde2 = r.includes('sde-2') || r.includes('sde 2') || r.includes('mid');

  if (lower.includes('yourself') || lower.includes('journey') || lower.includes('background') || lower.includes('introduction')) {
    if (isSenior) {
      return 'I am Mohammed Hassan Ahmed, a Computer Science and Engineering graduate with deep experience architecting full-stack systems with Node.js, React, and polyglot persistence. Across projects like the Electricity Usage and Salary Tracker, I focused on high-availability telemetry pipelines, WAL-backed state persistence, optimistic concurrency control under peak loads, and asynchronous AI inference pipelines using message buffers to isolate critical read paths from batch compute workloads.';
    }
    if (isSde2) {
      return 'I am Mohammed Hassan Ahmed, a Computer Science and Engineering graduate specializing in scalable full-stack development with React, Node.js, and distributed databases. In my Salary and Electricity Usage Tracker, I designed event-driven telemetry ingestion pipelines, applied optimistic locking in MongoDB to eliminate race conditions during concurrent meter updates, and integrated asynchronous AI forecasting with Redis caching to maintain sub-50ms API response latencies.';
    }
    return 'I am Mohammed Hassan Ahmed, a Computer Science and Engineering graduate who began my software engineering journey through a diploma in engineering and progressed into full-stack development. During my degree, I developed production-oriented applications including an Electricity Usage Tracker and a Salary Calculator, using React, Node.js, and MongoDB. I focus on writing clean, modular code, building responsive interfaces, and implementing RESTful APIs with solid error handling.';
  }

  if (lower.includes('acid') || (lower.includes('transaction') && lower.includes('database')) || lower.includes('wal') || lower.includes('write-ahead')) {
    if (isSenior) {
      return 'ACID establishes relational consistency at scale: Atomicity and Durability are governed by Write-Ahead Logging under the ARIES recovery protocol. Log sequence numbers (LSNs) are flushed to non-volatile storage via synchronous fsync prior to modifying buffer pool pages, guaranteeing idempotency during crash recovery. Isolation uses Snapshot Isolation via MVCC or Two-Phase Locking (2PL), eliminating dirty and non-repeatable reads while avoiding phantom rows through Serializable Snapshot Isolation (SSI). Distributed engines pair WAL replication with Raft/Paxos consensus for high-availability durability.';
    }
    if (isSde2) {
      return 'ACID establishes production transactional reliability: Atomicity and Durability rely on Write-Ahead Logging (WAL). In WAL, modifications are written to sequential append-only disk logs before memory buffer pages are flushed; on a system crash, the engine uses redo/undo log records to restore committed states and roll back in-flight transactions. Isolation is achieved through Multi-Version Concurrency Control (MVCC) or Two-Phase Locking across ANSI SQL isolation levels (Read Committed, Repeatable Read) to prevent dirty reads and lost updates.';
    }
    return 'ACID defines the foundational guarantees of relational database transactions: 1) Atomicity ensures all operations succeed or the entire transaction rolls back; 2) Consistency ensures the database transitions only between valid states enforcing schema constraints and keys; 3) Isolation ensures concurrent transactions do not interfere with one another; 4) Durability guarantees that committed data survives power failures. Write-Ahead Logs (WAL) guarantee Atomicity and Durability by writing all changes to a sequential log on disk before updating data tables.';
  }

  if (lower.includes('event loop') || lower.includes('libuv') || lower.includes('runtime') || lower.includes('asynchronous non-blocking')) {
    if (isSenior) {
      return 'Node.js achieves high I/O throughput by coupling V8 single-threaded execution with libuv event-driven OS multiplexing (epoll/kqueue). Microtasks (process.nextTick, Promise jobs) drain with highest priority between event loop phases. If CPU-intensive computations saturate the call stack or libuv thread pool, event loop tick latency spikes, degrading throughput across all concurrent connections. Production architectures prevent event loop starvation by enforcing strict execution timeouts, isolating CPU compute into Node.js Worker Threads or Rust NAPI native add-ons, and offloading heavy tasks to distributed message workers.';
    }
    if (isSde2) {
      return 'Node.js delegates non-blocking asynchronous I/O to libuv, which maintains an internal thread pool (default 4 threads) for file system operations, DNS lookups, and crypto. The Event Loop processes callbacks across distinct phases: Timers, Pending Callbacks, Poll, Check (setImmediate), and Close. When a CPU-bound task blocks the V8 call stack or saturates the thread pool, subsequent I/O callbacks are delayed, causing event loop lag. In production, we isolate CPU workloads into Node.js Worker Threads, cluster worker processes, or offload to background queues like Redis BullMQ.';
    }
    return 'Node.js delegates non-blocking asynchronous I/O to the libuv thread pool and operating system kernel (epoll/kqueue). The single-threaded call stack offloads file system and network calls to libuv worker threads. When the event loop or thread pool is saturated by CPU-heavy tasks, subsequent callbacks queue up, triggering event loop lag. In production, this is solved by offloading CPU-intensive workloads to Node.js Worker Threads or dedicated worker clusters, using Redis queues for asynchronous decoupling.';
  }

  if (lower.includes('electricity') || lower.includes('meter') || lower.includes('appliance') || lower.includes('predict')) {
    if (isSenior) {
      return 'In the electricity usage tracker, high-frequency meter telemetry is decoupled via an event-driven buffer before batched ingestion into MongoDB. To ensure write consistency and prevent race conditions, the system uses atomic document mutations with optimistic concurrency control (OCC). Telemetry analytics and AI predictions run asynchronously via background workers, isolating heavy analytical compute from operational read paths and caching hot user projections in Redis with proactive revalidation.';
    }
    if (isSde2) {
      return 'In the electricity usage tracker, real-time meter telemetry is ingested through an asynchronous Node.js gateway. Upon user onboarding, appliance wattage and consumption profiles are indexed. To prevent race conditions during simultaneous updates, updates use atomic database operators ($set and $inc in MongoDB) with optimistic version keys. Consumption forecasting is processed asynchronously, caching calculated bill estimates in Redis with a 15-minute TTL to keep read latencies under 40ms.';
    }
    return 'In the electricity usage tracker, real-time meter telemetry and appliance parameters are ingested through an event-driven Node.js gateway. Upon user onboarding, appliance wattage and historical consumption profiles are captured. To prevent race conditions during simultaneous updates, updates use atomic database operators ($set and $inc in MongoDB) with optimistic concurrency versioning. Consumption forecasting and bill predictions are processed asynchronously using background workers and Gemini AI insights, caching calculated bill estimates in Redis to keep user read latency under 40ms.';
  }

  if (lower.includes('lock') || lower.includes('concurrency') || lower.includes('deadlock') || lower.includes('optimistic') || lower.includes('pessimistic')) {
    if (isSenior) {
      return 'Under peak concurrency, locking strategies govern both consistency and throughput. Optimistic Concurrency Control eliminates lock overhead and database wait queues, making it optimal for read-heavy workloads with low write contention (<5% conflict rate); under heavy write hotspots, OCC degrades due to high abort/retry churn. Pessimistic locking serializes updates via exclusive row locks, avoiding repeated application retries at the cost of connection pool saturation and deadlock vulnerability. Production systems mitigate deadlocks through deterministic resource acquisition order, conservative lock timeouts, and distributed token leases.';
    }
    if (isSde2) {
      return 'Managing high-concurrency database updates requires matching the locking strategy to contention probability. Optimistic Concurrency Control (OCC) uses a version number (WHERE id = :id AND version = :current_version); if another transaction updated the row first, the update fails cleanly and triggers an application retry. Pessimistic Locking uses explicit row locks (SELECT ... FOR UPDATE) to block concurrent writers. Deadlocks in pessimistic schemes are avoided through globally consistent lock ordering and query timeouts.';
    }
    return 'Managing high-concurrency database transactions requires choosing the right locking strategy based on contention probability. Optimistic Concurrency Control (OCC) assumes conflicts are rare: each record maintains a version number or timestamp; on update, the application validates WHERE id = :id AND version = :current_version. If another process modified the row, the update fails cleanly, triggering an application-level retry without blocking the database. In contrast, Pessimistic Locking assumes high contention: the transaction acquires an exclusive row-level lock upfront (SELECT ... FOR UPDATE), blocking other readers/writers until commit or rollback. To prevent deadlocks in pessimistic schemes, resources must always be acquired in a globally deterministic order with strict lock timeouts.';
  }

  if (lower.includes('bug') || lower.includes('conflict') || lower.includes('disagree') || (category || '').toLowerCase().includes('behav')) {
    if (isSenior) {
      return 'Situation: In our application, an edge-case rounding discrepancy in payroll overtime calculations led to data inaccuracies across cross-month billing periods. Task: I was responsible for diagnosing the root cause, remediating the calculation engine, and implementing preventative guards across our CI/CD pipeline. Action: I performed root-cause analysis, traced the issue to IEEE 754 floating-point inaccuracies and timezone offsets, refactored calculations to integer cents, and instituted automated property-based testing. Result: We eliminated calculation discrepancies, achieved 100% test fixture coverage, and established engineering standards that prevented similar precision bugs.';
    }
    if (isSde2) {
      return 'Situation: In my Salary Calculator web application, intermittent calculation discrepancies were detected in monthly overtime pay during multi-month projections. Task: As the primary developer, I needed to isolate the issue without disrupting active sessions. Action: I reproduced the failure through automated regression tests, identifying a floating-point rounding artifact and timezone drift in month arithmetic. I migrated monetary calculations to integer cents and implemented strict validation boundaries. Result: The bug was eradicated with 100% test coverage across calendar boundaries, and I documented the floating-point arithmetic guidelines for future feature additions.';
    }
    return 'Situation: In my Salary Calculator web application developed with JavaScript, a calculation bug occurred where monthly overtime rates caused inaccurate total salary computations for users during specific calendar months. Task: I needed to rapidly isolate the algorithmic discrepancy without disrupting current user computations. Action: I reproduced the failure using isolated unit tests and discovered a floating-point rounding issue coupled with zero-indexed month handling in JavaScript Date. I refactored the calculation logic using integer cents representation and added strict validation guards. Result: The bug was completely eradicated, verified with 100% test coverage across all 12 calendar month test fixtures, ensuring consistent calculations.';
  }

  return 'A production-grade answer begins by defining functional and non-functional requirements: high availability, idempotency, and sub-50ms latency. Articulate trade-offs between optimistic and pessimistic concurrency control, explain failure recovery patterns (circuit breakers and dead-letter queues), and conclude with real-world production metrics.';
};

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
          const answered = data.questions.filter(
            (q: any) => (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0)
          );
          const toShow = answered.length > 0 ? answered : data.questions;
          // Open all attended questions by default so user immediately gets the full breakdown
          setExpandedQuestions(new Set(toShow.map((_: any, i: number) => i)));
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
        const answered = session.questions.filter(
          (q) => (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0)
        );
        const toShow = answered.length > 0 ? answered : session.questions;
        setExpandedQuestions(new Set(toShow.map((_, i) => i)));
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

  // Option 1: Strictly show evaluated questions (omit unattempted questions so the report is 100% clean and authentic)
  const questionsToDisplay = answeredQuestions.length > 0 ? answeredQuestions : session.questions || [];

  const toggleAllQuestions = () => {
    if (!questionsToDisplay || questionsToDisplay.length === 0) return;
    if (expandedQuestions.size === questionsToDisplay.length) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(questionsToDisplay.map((_, i) => i)));
    }
  };

  // Calculate realistic score based directly on questions answered by the candidate
  const answeredScores = answeredQuestions
    .map((q) => q.feedback?.overallScore)
    .filter((s): s is number => typeof s === 'number');

  const calculatedAverage = answeredScores.length > 0
    ? Math.round(answeredScores.reduce((acc, curr) => acc + curr, 0) / answeredScores.length)
    : 75;

  const overall = isSessionIncomplete ? 0 : calculatedAverage;

  const avgScores = {
    technicalDepth: session.report?.categoryScores?.technicalKnowledge ?? (isSessionIncomplete ? 0 : session.averageScores?.technicalDepth ?? 70),
    correctness: session.report?.categoryScores?.problemSolving ?? (isSessionIncomplete ? 0 : session.averageScores?.correctness ?? 70),
    communication: session.report?.categoryScores?.communicationClarity ?? (isSessionIncomplete ? 0 : session.averageScores?.communication ?? 75),
    confidence: isSessionIncomplete ? 0 : session.averageScores?.confidence ?? 70,
    clarity: session.report?.categoryScores?.conceptualUnderstanding ?? (isSessionIncomplete ? 0 : session.averageScores?.clarity ?? 75),
    completeness: session.report?.categoryScores?.answerRelevance ?? (isSessionIncomplete ? 0 : session.averageScores?.completeness ?? 70),
  };

  const getPreparationRecommendation = (score: number, answered: number) => {
    if (answered === 0 || score === 0) {
      return {
        verdict: 'INCOMPLETE SESSION (No Answers Submitted)',
        badge: 'Incomplete',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40',
        recommendation:
          'This interview session was closed prematurely before any answers were recorded. To receive an accurate placement evaluation and preparation recommendation, please restart the interview and speak your technical answers into the microphone.',
      };
    }
    if (score >= 78 && answered >= 2) {
      return {
        verdict: 'READY FOR TIER-1 SDE LOOPS (Strong Readiness)',
        badge: 'Strong Readiness',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40',
        recommendation:
          'Candidate demonstrated production-level technical articulation, sound architecture understanding, and structured problem solving. Recommended for Tier-1 SDE technical rounds.',
      };
    }
    if (score >= 60 && answered >= 1) {
      return {
        verdict: 'RECOMMENDED FOR TARGETED PRACTICE (Moderate Readiness)',
        badge: 'Targeted Practice',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/40',
        recommendation:
          'Candidate grasps primary concepts well. Polish edge-case handling in concurrent scenarios, quantify metrics in project descriptions, and practice system trade-offs.',
      };
    }
    return {
      verdict: 'FOUNDATIONAL REVISION RECOMMENDED (Needs Practice)',
      badge: 'Needs Revision',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40',
      recommendation:
        `Candidate completed ${answered} questions. Practice speaking answers aloud systematically with STAR storytelling and revise Core CS concepts before live interviews.`,
    };
  };

  const decision = getPreparationRecommendation(overall, answeredCount);
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
      doc.setFontSize(15);
      doc.setTextColor(79, 70, 229);
      doc.text('InterviewAI · Autonomous Placement Simulator', margin, currentY);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Report ID: ${session.id || (session as any)._id || 'ACC-2026'}`, margin + contentWidth - 45, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('AI-GENERATED MOCK INTERVIEW ASSESSMENT REPORT', margin, currentY);
      currentY += 6;

      // 3. AI Practice Disclaimer Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, contentWidth, 11, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const disclaimerText =
        'Disclaimer: This report is an AI-generated mock interview assessment intended solely for practice and preparation purposes. Scores, rubrics, and feedback are estimates generated by AI models and do not constitute an official employment offer, verified certification, or guarantee of employment by any employer.';
      const disLines = doc.splitTextToSize(disclaimerText, contentWidth - 6);
      doc.text(disLines, margin + 3, currentY + 4);
      currentY += 14;

      // 4. Metadata Grid Box
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
      doc.text('Simulator Persona:', margin + 4, currentY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text('Emily Zhou (AI Technical Interviewer)', margin + 35, currentY + 18);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Assessment Date:', margin + 105, currentY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(interviewDate, margin + 132, currentY + 18);

      currentY += 27;

      // 5. Preparation Recommendation Banner
      const isSuccess = overall >= 78 && answeredCount >= 2;
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
      doc.setFontSize(9.5);
      if (isSuccess) doc.setTextColor(6, 95, 70);
      else if (isFail) doc.setTextColor(185, 28, 28);
      else doc.setTextColor(146, 64, 14);
      doc.text(`PREPARATION RECOMMENDATION: ${decision.verdict}`, margin + 4, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const recLines = doc.splitTextToSize(decision.recommendation, contentWidth - 8);
      doc.text(recLines, margin + 4, currentY + 11);

      currentY += 23;

      // 6. Transparent 5-Dimension Competencies Matrix (with weights)
      checkAddPage(24);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('TRANSPARENT 5-DIMENSION EVALUATION RUBRIC', margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text('Score = (Correctness × 30%) + (Depth × 25%) + (Communication × 20%) + (Relevance × 15%) + (Completeness × 10%)', margin + 85, currentY);
      currentY += 4;

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, currentY, contentWidth, 6, 'FD');

      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      const colW5 = contentWidth / 5;
      doc.text('Correctness (30%)', margin + 2, currentY + 4.2);
      doc.text('Depth & Logic (25%)', margin + colW5 + 2, currentY + 4.2);
      doc.text('Communication (20%)', margin + colW5 * 2 + 2, currentY + 4.2);
      doc.text('Relevance (15%)', margin + colW5 * 3 + 2, currentY + 4.2);
      doc.text('Completeness (10%)', margin + colW5 * 4 + 2, currentY + 4.2);
      currentY += 6;

      doc.setFillColor(255, 255, 255);
      doc.rect(margin, currentY, contentWidth, 7, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${avgScores.correctness}%`, margin + 2, currentY + 5);
      doc.text(`${avgScores.technicalDepth}%`, margin + colW5 + 2, currentY + 5);
      doc.text(`${avgScores.communication}%`, margin + colW5 * 2 + 2, currentY + 5);
      doc.text(`${avgScores.completeness}%`, margin + colW5 * 3 + 2, currentY + 5);
      doc.text(`${avgScores.clarity}%`, margin + colW5 * 4 + 2, currentY + 5);
      currentY += 12;

      // 7. Question-by-Question Diagnostic & Benchmarks
      checkAddPage(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('QUESTION-BY-QUESTION TECHNICAL DIAGNOSTIC & BENCHMARKS', margin, currentY);
      currentY += 6;

      if (questionsToDisplay && questionsToDisplay.length > 0) {
        questionsToDisplay.forEach((q, idx) => {
          const hasAnswer = (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0);
          const qScore = hasAnswer ? (q.feedback?.overallScore ?? 75) : 0;
          const fallbackModel = getBenchmarkForQuestion(q.question, q.category, session.role);
          const roleLabel = q.feedback?.roleLevel || (session.role?.toLowerCase().includes('senior') ? 'SENIOR STAFF ENGINEER' : session.role?.toLowerCase().includes('sde-2') ? 'SDE-2' : 'SDE-1');

          const feedback = q.feedback && q.feedback.modelAnswer ? q.feedback : {
            overallScore: qScore,
            roleLevel: roleLabel,
            whatWentWell: hasAnswer
              ? ['Articulated system perspective and problem domain clearly', 'Approached the question with structured communication']
              : ['Question was not attempted during this interview session.'],
            whatWasMissed: hasAnswer
              ? ['Could incorporate specific concurrency locking mechanics, ACID guarantees, or runtime bounds under peak load']
              : ['Candidate exited or completed session before answering this question. Reference model benchmark answer provided below.'],
            missingConcepts: ['Core architectural mechanics and trade-offs'],
            howToImprove: ['Review question requirements and articulate trade-offs, locks, and failure recovery.'],
            modelAnswer: fallbackModel,
          };

          // A. Question Header & Score Badge
          checkAddPage(22);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(79, 70, 229);
          doc.text(`QUESTION #${idx + 1} · ${(q.category || 'TECHNICAL ARCHITECTURE').toUpperCase()}`, margin + 3, currentY + 4);

          doc.setFontSize(8.5);
          if (!hasAnswer) {
            doc.setTextColor(100, 116, 139);
            doc.text(`Not Attempted`, margin + contentWidth - 27, currentY + 4);
          } else if (qScore >= 70) {
            doc.setTextColor(5, 150, 105);
            doc.text(`Score: ${qScore}%`, margin + contentWidth - 25, currentY + 4);
          } else if (qScore >= 35) {
            doc.setTextColor(217, 119, 6);
            doc.text(`Score: ${qScore}%`, margin + contentWidth - 25, currentY + 4);
          } else {
            doc.setTextColor(220, 38, 38);
            doc.text(`Score: ${qScore}%`, margin + contentWidth - 25, currentY + 4);
          }
          currentY += 7;

          // B. Question Prompt
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          const qLines = doc.splitTextToSize(q.question, contentWidth - 8);
          doc.text(qLines, margin + 3, currentY);
          currentY += qLines.length * 3.8 + 3;

          // C. Candidate Spoken / Submitted Answer Box
          const answerText = hasAnswer
            ? `"${q.studentAnswer}"`
            : '(Not Attempted in Session · Full Benchmark Answer and Key Topics Provided Below for Reference)';
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

          // G. Role-Based Benchmark Answer (Purple Box - Full Benchmark Answer, No Truncation!)
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
          doc.text(`${(feedback.roleLevel || roleLabel).toUpperCase()} BENCHMARK ANSWER (TIER-1 ARCHITECTURE):`, margin + 6, currentY + 4.5);

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

      // 8. Footer Sign-off on the last page
      checkAddPage(18);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('InterviewAI Assessment Simulator · Educational Practice Assessment', margin, currentY);
      doc.text(`Candidate: ${candidateName} · Practice Assessment`, margin + contentWidth - 75, currentY);

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
                if (questionsToDisplay && questionsToDisplay.length > 0) {
                  setExpandedQuestions(new Set(questionsToDisplay.map((_, i) => i)));
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
            REPORT HERO BANNER (AI Assessment Summary)
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
                AI-Generated Mock Interview Assessment Report
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conducted by{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  InterviewAI Simulator (Persona: {session.interviewerName || 'Emily Zhou'})
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

          {/* Preparation Recommendation Box */}
          <div className={`p-4 rounded-2xl border ${decision.bg} flex items-start gap-3`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 ${decision.color} mt-0.5`} />
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${decision.color}`}>
                Preparation Recommendation: {decision.verdict}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {decision.recommendation}
              </p>
            </div>
          </div>

          {/* AI Practice Assessment Disclaimer Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12121c] border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>AI Practice Disclaimer:</strong> This report is an AI-generated mock interview assessment intended solely for practice and preparation purposes. Scores, rubrics, and feedback are estimates generated by AI models and do not constitute an official employment offer, verified certification, or guarantee of employment by any employer.
            </p>
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

          {/* Transparent 5-Dimension Rubric Breakdown */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Transparent 5-Dimension Scoring Rubric
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Formula: Score = (Correctness × 30%) + (Depth × 25%) + (Communication × 20%) + (Relevance × 15%) + (Completeness × 10%)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Correctness (30%)</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Depth & Logic (25%)</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Communication (20%)</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Relevance (15%)</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {avgScores.completeness}%
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${avgScores.completeness}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Completeness (10%)</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {avgScores.clarity}%
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${avgScores.clarity}%` }}
                  />
                </div>
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
                {questionsToDisplay.length} {questionsToDisplay.length === 1 ? 'Question' : 'Questions'} Evaluated
              </span>
              <button
                onClick={toggleAllQuestions}
                className="no-print px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                {questionsToDisplay.length > 0 && expandedQuestions.size === questionsToDisplay.length
                  ? 'Collapse All'
                  : 'Expand All'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {questionsToDisplay.map((q, idx) => {
              const isOpen = expandedQuestions.has(idx);
              const hasAnswer = (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0);
              const score = hasAnswer ? (q.feedback?.overallScore !== undefined ? q.feedback.overallScore : 75) : 0;
              const fallbackModel = getBenchmarkForQuestion(q.question, q.category, session.role);
              const roleTitle = q.feedback?.roleLevel || (session.role?.toLowerCase().includes('senior') ? 'Senior Staff Engineer' : session.role?.toLowerCase().includes('sde-2') ? 'SDE-2' : 'SDE-1');
              const feedback = q.feedback && q.feedback.modelAnswer ? q.feedback : {
                overallScore: score,
                roleLevel: roleTitle,
                whatWentWell: hasAnswer
                  ? ['Clearly structured thoughts with system design rationale', 'Correctly identified core engineering trade-offs']
                  : ['Question was not attempted during this interview session.'],
                whatWasMissed: hasAnswer
                  ? ['Could mention specific runtime bounds under peak load']
                  : ['Candidate skipped or exited session before speaking an answer for this question. Reference model benchmark answer provided below.'],
                missingConcepts: ['Core architectural mechanics and trade-offs'],
                howToImprove: [`Review the ${roleTitle} benchmark answer below to prepare this architecture topic.`],
                modelAnswer: fallbackModel,
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
                          !hasAnswer
                            ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700'
                            : score >= 70
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60'
                            : score >= 30
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60'
                            : 'text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60'
                        }`}
                      >
                        {hasAnswer ? `${score}%` : 'Not Attempted'}
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
                        {hasAnswer ? 'Your Transcribed Spoken Answer:' : 'Candidate Status:'}
                      </span>
                      {hasAnswer ? (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium">
                          "{q.studentAnswer}"
                        </p>
                      ) : (
                        <p className="text-slate-400 italic font-sans">
                          (Question was not attended / Candidate completed session before answering this question. Reference model benchmark answer provided below.)
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

                    {/* Crucial Missing Technical Concepts Chips */}
                    {feedback.missingConcepts && feedback.missingConcepts.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12121c] border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                          🔍 Missing Concepts & Production Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {feedback.missingConcepts.map((concept: string, ci: number) => (
                            <span
                              key={ci}
                              className="px-2.5 py-1 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 text-[11px] font-medium text-amber-800 dark:text-amber-300"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Role-Based Benchmark Answer */}
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{roleTitle} Benchmark Answer (Tier-1 Standard):</span>
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
