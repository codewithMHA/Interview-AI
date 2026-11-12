import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Building,
  Lightbulb,
  Award,
  Terminal,
  BookOpen,
  History,
  Check,
  Zap,
  HelpCircle,
  Cpu,
  Flame,
  CheckCircle,
  MessageSquare,
  Target,
} from 'lucide-react';
import {
  fetchProblemById,
  runCode,
  submitCode,
  fetchProblemSubmissions,
} from '@/services/problemService';
import {
  analyzeCodeWithAI,
  explainCodeWithAI,
} from '@/services/aiService';
import {
  CodingProblem,
  CodeExecutionResponse,
  SubmissionHistoryItem,
  CodeAnalysisResponse,
  CodeExplanationResponse,
} from '@/types';
import { PROBLEM_SOLUTIONS } from '@/data/problemSolutions';
import { CodeEditor, SupportedLanguage } from '@/components/coding/CodeEditor';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const ProblemWorkspacePage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [codePerLanguage, setCodePerLanguage] = useState<Record<SupportedLanguage, string>>({
    javascript: '',
    python: '',
    java: '',
    cpp: '',
  });

  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions' | 'hints' | 'solution'>('description');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustomCase, setIsCustomCase] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResponse | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'console' | 'result'>('console');
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // AI Assistance states
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResponse | null>(null);
  const [explanationResult, setExplanationResult] = useState<CodeExplanationResponse | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set([0]));

  // Load problem details
  useEffect(() => {
    if (!idOrSlug) return;
    const loadData = async () => {
      setIsLoading(true);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      try {
        const prob = await fetchProblemById(idOrSlug);
        setProblem(prob);

        // Initialize editor with starter templates so candidates solve before viewing reference solutions
        setCodePerLanguage({
          javascript: prob.starterCode?.javascript || '',
          python: prob.starterCode?.python || '',
          java: prob.starterCode?.java || '',
          cpp: prob.starterCode?.cpp || '',
        });

        if (prob.testCases && prob.testCases.length > 0) {
          setCustomInput(prob.testCases[0].input);
        }
      } catch (err) {
        console.error('Failed to load coding problem:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [idOrSlug]);

  // Load submissions history if authenticated
  const loadSubmissions = async () => {
    if (!idOrSlug || !user) return;
    try {
      const history = await fetchProblemSubmissions(idOrSlug);
      setSubmissions(history);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  useEffect(() => {
    if (activeLeftTab === 'submissions') {
      loadSubmissions();
    }
  }, [activeLeftTab]);

  const currentCode = codePerLanguage[selectedLanguage];

  const handleCodeChange = (newCode: string) => {
    setCodePerLanguage((prev) => ({
      ...prev,
      [selectedLanguage]: newCode,
    }));
  };

  const handleResetCode = () => {
    if (!problem) return;
    if (window.confirm('Reset code to original starter template for this language?')) {
      setCodePerLanguage((prev) => ({
        ...prev,
        [selectedLanguage]: problem.starterCode[selectedLanguage] || '',
      }));
      setToastMessage('Reset to practice template');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleLoadSolution = () => {
    if (!problem) return;
    const solData = problem.solution || PROBLEM_SOLUTIONS[problem.slug];
    const solutionCode = solData?.solutions?.[selectedLanguage];
    if (solutionCode) {
      setCodePerLanguage((prev) => ({
        ...prev,
        [selectedLanguage]: solutionCode,
      }));
      setToastMessage(`Loaded optimal ${selectedLanguage.toUpperCase()} solution! Click "Run Code" to test.`);
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage('Reference solution is being prepared.');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Run Code against sample test cases
  const handleRunCode = async () => {
    if (!problem || !idOrSlug) return;
    setIsRunning(true);
    setActiveResultTab('result');

    // Smoothly scroll down so user immediately sees results panel
    setTimeout(() => {
      resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);

    try {
      const customCases = isCustomCase
        ? [{ input: customInput, expectedOutput: '' }]
        : undefined;

      const result = await runCode(
        idOrSlug,
        selectedLanguage,
        currentCode,
        customCases
      );
      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult({
        status: 'Runtime Error',
        totalRuntime: 0,
        peakMemory: 0,
        testCasesPassed: 0,
        totalTestCases: 0,
        testResults: [],
        error: err?.data?.error || err?.response?.data?.error || err?.message || 'Execution error',
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  // Submit Code against all test cases
  const handleSubmitCode = async () => {
    if (!problem || !idOrSlug) return;
    if (!user) {
      alert('Please log in to submit your solution and record placement points.');
      return;
    }

    setIsSubmitting(true);
    setActiveResultTab('result');

    // Smoothly scroll down to results panel
    setTimeout(() => {
      resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);

    try {
      const result = await submitCode(idOrSlug, selectedLanguage, currentCode);
      setExecutionResult(result);

      if (result.isAccepted || result.status === 'Accepted') {
        setShowSuccessModal(true);
        loadSubmissions();
      }
    } catch (err: any) {
      setExecutionResult({
        status: 'Runtime Error',
        totalRuntime: 0,
        peakMemory: 0,
        testCasesPassed: 0,
        totalTestCases: 0,
        testResults: [],
        error: err?.data?.error || err?.response?.data?.error || err?.message || 'Submission error',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  // AI Code Analysis
  const handleAIAnalysis = async () => {
    if (!currentCode.trim() || !problem) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeCodeWithAI({
        problemTitle: problem.title,
        language: selectedLanguage,
        userCode: currentCode,
        problemDescription: problem.description,
      });
      setAnalysisResult(res);
      setShowAnalysisModal(true);
    } catch (err: any) {
      console.error('Failed to analyze code:', err);
      setToastMessage('Could not analyze code. Please try again.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Explain Code Walkthrough
  const handleExplainCode = async () => {
    if (!currentCode.trim() || !problem) return;
    setIsExplaining(true);
    try {
      const res = await explainCodeWithAI({
        problemTitle: problem.title,
        language: selectedLanguage,
        userCode: currentCode,
      });
      setExplanationResult(res);
      setShowExplanationModal(true);
    } catch (err: any) {
      console.error('Failed to explain code:', err);
      setToastMessage('Could not explain code. Please try again.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsExplaining(false);
    }
  };

  if (isLoading || !problem) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-500">Initializing Monaco Sandbox Workspace...</p>
      </div>
    );
  }

  const visibleTestCases = problem.testCases || [];

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4 min-h-[calc(100vh-4rem)]">
      {/* Top Breadcrumb Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          <Link
            to="/coding"
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Practice Problems
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
            {problem.title}
          </span>
          <Badge
            variant={
              problem.difficulty === 'Easy'
                ? 'success'
                : problem.difficulty === 'Medium'
                ? 'warning'
                : 'danger'
            }
            size="sm"
          >
            {problem.difficulty}
          </Badge>
          {problem.isSolved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
        </div>

        {/* Action Buttons: Explain, AI Analysis, Run & Submit */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExplainCode}
            isLoading={isExplaining}
            disabled={!currentCode.trim()}
            leftIcon={<BookOpen className="w-3.5 h-3.5 text-indigo-500" />}
            className="border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
          >
            Explain Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAIAnalysis}
            isLoading={isAnalyzing}
            disabled={!currentCode.trim()}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            className="border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-medium"
          >
            AI Analysis
          </Button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunCode}
            isLoading={isRunning}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            Run Code
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitCode}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* ================================================================= */}
        {/* LEFT PANE: Description, Examples, Constraints, Submissions */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* Left Tabs Bar */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`flex items-center gap-1.5 px-3 py-2.5 font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'description'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`flex items-center gap-1.5 px-3 py-2.5 font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'submissions'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`flex items-center gap-1.5 px-3 py-2.5 font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'hints'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hints ({problem.hints?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('solution')}
              className={`flex items-center gap-1.5 px-3 py-2.5 font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'solution'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Solution</span>
            </button>
          </div>

          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-800 dark:text-slate-200 max-h-[calc(100vh-14rem)]">
            {activeLeftTab === 'description' && (
              <>
                {/* Header Title */}
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {problem.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {problem.category}
                    </span>
                    <span className="text-slate-400">Acceptance: {problem.acceptanceRate}%</span>
                    {problem.companies && problem.companies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> Asked in:
                        </span>
                        {problem.companies.map((comp) => (
                          <Link
                            key={comp}
                            to={`/coding?company=${encodeURIComponent(comp)}`}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            {comp}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Body */}
                <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Examples
                  </h3>
                  {problem.examples.map((ex, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs font-mono"
                    >
                      <div className="text-slate-500 dark:text-slate-400 font-semibold font-sans">
                        Example {index + 1}:
                      </div>
                      <div>
                        <span className="text-slate-400 select-none">Input: </span>
                        <span className="text-slate-900 dark:text-slate-200 font-bold">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 select-none">Output: </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-600 dark:text-slate-400 font-sans text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation: </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                      Constraints
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeLeftTab === 'submissions' && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Past Submissions
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No submissions recorded yet for this problem. Click "Submit Solution" to run all test cases.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((sub) => {
                      const isAcc = sub.status === 'Accepted';
                      return (
                        <div
                          key={sub._id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {isAcc ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                            <div>
                              <span
                                className={`font-bold ${
                                  isAcc
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {sub.status}
                              </span>
                              <div className="text-[11px] text-slate-400 capitalize">
                                {sub.language} • {new Date(sub.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-[11px] text-slate-500 font-mono">
                            <div>{sub.runtime} ms</div>
                            <div>{Math.round(sub.memory)} KB</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'hints' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Algorithmic Clues & Placement Hints
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Progressive hints to guide you toward the optimal campus placement solution without spoiling it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const hintsCount = (problem.hints && problem.hints.length > 0) ? problem.hints.length : 3;
                      const allIndices = new Set(Array.from({ length: hintsCount }, (_, i) => i));
                      setRevealedHints(allIndices);
                    }}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Reveal All
                  </button>
                </div>

                {/* List of hints */}
                {(() => {
                  const hintsList =
                    problem.hints && problem.hints.length > 0
                      ? problem.hints
                      : [
                          'Start by analyzing the input constraints and edge cases (e.g. empty or single element input, negative numbers).',
                          'Can you precompute or store previously seen elements using a Hash Table or Set to reduce search time from O(n) to O(1)?',
                          'Check your space-time trade-off: Is it possible to use Two Pointers or in-place swapping to achieve O(1) auxiliary space?',
                        ];

                  return (
                    <div className="space-y-3">
                      {hintsList.map((hint, idx) => {
                        const isRevealed = revealedHints.has(idx);
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                Hint {idx + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  setRevealedHints((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(idx)) next.delete(idx);
                                    else next.add(idx);
                                    return next;
                                  });
                                }}
                                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                              >
                                {isRevealed ? (
                                  <>
                                    <ChevronUp className="w-3.5 h-3.5" /> Hide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3.5 h-3.5" /> Reveal Hint
                                  </>
                                )}
                              </button>
                            </div>

                            {isRevealed ? (
                              <p className="mt-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans border-t border-slate-200/60 dark:border-slate-800/60 pt-2 animate-in fade-in">
                                {hint}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-400 italic">
                                Hint is hidden. Click "Reveal Hint" to inspect this algorithmic clue.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* AI Hint Prompt Card */}
                <div className="p-4 rounded-xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    Still Stuck on This Problem?
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    You can click <strong>"Explain Code"</strong> in the top action bar to inspect your current draft line-by-line, or check the <strong>"Solution"</strong> tab to see the optimal verified campus algorithm.
                  </p>
                </div>
              </div>
            )}

            {activeLeftTab === 'solution' && (
              <div className="space-y-4">
                {(() => {
                  const solData = problem.solution || PROBLEM_SOLUTIONS[problem.slug];
                  if (!solData) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        Solution guide is currently being updated for this problem.
                      </div>
                    );
                  }

                  const activeSolCode = solData.solutions[selectedLanguage] || solData.solutions.javascript;

                  return (
                    <>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {solData.approach}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Optimal algorithm verified for campus placement rounds
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleLoadSolution}
                          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                        >
                          Load into Editor
                        </Button>
                      </div>

                      {/* Complexity Badges */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold block text-[10px] uppercase">
                            Time Complexity
                          </span>
                          <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                            {solData.timeComplexity}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs">
                          <span className="text-indigo-700 dark:text-indigo-400 font-semibold block text-[10px] uppercase">
                            Space Complexity
                          </span>
                          <span className="font-mono font-bold text-indigo-800 dark:text-indigo-200 text-sm">
                            {solData.spaceComplexity}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 leading-relaxed">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          Algorithmic Breakdown:
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{solData.explanation}</p>
                      </div>

                      {/* Reference Code Snippet */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold uppercase tracking-wider text-[10px]">
                            {selectedLanguage.toUpperCase()} Reference Code
                          </span>
                          <button
                            onClick={handleLoadSolution}
                            className="text-brand-600 dark:text-brand-400 hover:underline text-xs flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Insert into editor
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre">
                          {activeSolCode}
                        </pre>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANE: Monaco Editor + Test Cases & Execution Drawer */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-3 relative">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-2 right-4 z-30 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top: Monaco Editor Box */}
          <div className="flex-1 min-h-[460px] h-[55vh]">
            <CodeEditor
              language={selectedLanguage}
              code={currentCode}
              onChange={handleCodeChange}
              onReset={handleResetCode}
              onLoadSolution={handleLoadSolution}
              onLanguageChange={setSelectedLanguage}
              isDarkTheme={isDarkTheme}
            />
          </div>

          {/* Bottom: Interactive Test Console & Output Drawer */}
          <div ref={resultsPanelRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[260px]">
            {/* Console Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveResultTab('console')}
                  className={`font-semibold px-3 py-1 rounded-md transition-all ${
                    activeResultTab === 'console'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setActiveResultTab('result')}
                  className={`font-semibold px-3 py-1 rounded-md flex items-center gap-1 transition-all ${
                    activeResultTab === 'result'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>Test Results</span>
                  {executionResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        executionResult.status === 'Accepted'
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              {isRunning && (
                <span className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Running tests...
                </span>
              )}
              {isSubmitting && (
                <span className="flex items-center gap-1.5 text-xs text-brand-500 font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Verifying all test cases...
                </span>
              )}
            </div>

            {/* Console Body */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[220px]">
              {activeResultTab === 'console' ? (
                <div className="space-y-3">
                  {/* Case Tabs */}
                  <div className="flex items-center gap-2">
                    {visibleTestCases.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTestCaseIndex(idx);
                          setIsCustomCase(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          !isCustomCase && activeTestCaseIndex === idx
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustomCase(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isCustomCase
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      + Custom Input
                    </button>
                  </div>

                  {/* Input & Output boxes */}
                  {!isCustomCase && visibleTestCases[activeTestCaseIndex] && (
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase font-sans mb-1">
                          Input
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre">
                          {visibleTestCases[activeTestCaseIndex].input}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase font-sans mb-1">
                          Expected Output
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 whitespace-pre">
                          {visibleTestCases[activeTestCaseIndex].expectedOutput}
                        </div>
                      </div>
                    </div>
                  )}

                  {isCustomCase && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase font-sans">
                        Custom Test Input (Format line by line)
                      </div>
                      <textarea
                        rows={3}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter arguments line by line..."
                        className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Result View */
                <div>
                  {!executionResult ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Click "Run Code" or "Submit Solution" to inspect compiler output and test results.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Status Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          {executionResult.status === 'Accepted' || (isCustomCase && executionResult.testCasesPassed > 0) ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                          <div>
                            <span
                              className={`font-bold text-sm ${
                                executionResult.status === 'Accepted' || (isCustomCase && executionResult.testCasesPassed > 0)
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isCustomCase && executionResult.status === 'Accepted'
                                ? 'Executed Successfully'
                                : executionResult.status}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-mono">
                              {isCustomCase
                                ? '(Custom Input Evaluated)'
                                : `(${executionResult.testCasesPassed} / ${executionResult.totalTestCases} test cases passed)`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {executionResult.totalRuntime} ms
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-3.5 h-3.5" />
                            {executionResult.peakMemory} KB
                          </span>
                        </div>
                      </div>

                      {/* Helpful Placement Diagnostic / Load Solution Suggestion */}
                      {executionResult.status !== 'Accepted' && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span>
                              {executionResult.testResults.some((tr) => tr.actualOutput?.includes('undefined'))
                                ? 'Function returned undefined. Make sure to return your answer (e.g. return ans;).'
                                : 'Need guidance? Inspect the optimal campus placement algorithm.'}
                            </span>
                          </div>
                          <button
                            onClick={handleLoadSolution}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs whitespace-nowrap shadow-sm transition-all flex items-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Load Optimal Solution
                          </button>
                        </div>
                      )}

                      {/* Error Diagnostic box */}
                      {executionResult.error && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-mono text-rose-700 dark:text-rose-300 whitespace-pre-wrap">
                          {executionResult.error}
                        </div>
                      )}

                      {/* Test Case Cards */}
                      {executionResult.testResults && executionResult.testResults.length > 0 && (
                        <div className="space-y-2">
                          {executionResult.testResults.map((tr) => (
                            <div
                              key={tr.testCaseIndex}
                              className={`p-2.5 rounded-lg border text-xs font-mono ${
                                tr.status === 'Passed'
                                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                                  : 'border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 font-sans">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {tr.expectedOutput === '(Custom Input)' || isCustomCase
                                    ? 'Custom Test Case'
                                    : `Test Case ${tr.testCaseIndex}`} {tr.isHidden ? '(Hidden)' : ''}
                                </span>
                                <Badge
                                  variant={tr.status === 'Passed' ? 'success' : 'danger'}
                                  size="sm"
                                >
                                  {tr.expectedOutput === '(Custom Input)' || isCustomCase
                                    ? (tr.status === 'Passed' ? 'Executed' : tr.status)
                                    : tr.status}
                                </Badge>
                              </div>

                              {!tr.isHidden && (
                                <div className="space-y-1.5 mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px]">
                                  {tr.input && (
                                    <div className="text-[11px]">
                                      <span className="text-slate-400">Input: </span>
                                      <span className="text-slate-700 dark:text-slate-300 font-mono">
                                        {tr.input}
                                      </span>
                                    </div>
                                  )}
                                  <div className={`grid ${tr.expectedOutput && tr.expectedOutput !== '(Custom Input)' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2`}>
                                    {tr.expectedOutput && tr.expectedOutput !== '(Custom Input)' && (
                                      <div>
                                        <span className="text-slate-400">Expected: </span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                          {tr.expectedOutput}
                                        </span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-slate-400">Your Output: </span>
                                      <span
                                        className={`font-bold ${
                                          tr.status === 'Passed'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                      >
                                        {tr.actualOutput?.includes('undefined') ? (
                                          <span className="text-amber-600 dark:text-amber-400 font-mono">
                                            undefined (no return value)
                                          </span>
                                        ) : (
                                          tr.actualOutput || 'None'
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accepted Celebration Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Accepted! 🎉 Problem Solved"
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto border-4 border-emerald-500/20 shadow-lg">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              All Test Cases Passed Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your solution to <strong>{problem.title}</strong> has been verified and recorded to your CSE placement profile.
            </p>
          </div>

          {executionResult && (
            <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400">Runtime: </span>
                <span className="font-bold text-emerald-500">{executionResult.totalRuntime} ms</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <div>
                <span className="text-slate-400">Memory: </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{executionResult.peakMemory} KB</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <div>
                <span className="text-slate-400">Points: </span>
                <span className="font-bold text-amber-500">
                  +{problem.difficulty === 'Hard' ? 150 : problem.difficulty === 'Medium' ? 100 : 50} XP
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuccessModal(false)}
            >
              Continue Practicing
            </Button>
            <Link to="/coding">
              <Button variant="primary" size="sm">
                Next Challenge →
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* AI Code Analysis Modal */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title="AI Code Complexity & Quality Inspector"
        maxWidth="2xl"
      >
        {analysisResult && (
          <div className="space-y-5 py-2 max-h-[75vh] overflow-y-auto pr-1">
            {/* Top Stat Row: Time, Space, Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Time Complexity
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-800 dark:text-emerald-200">
                    {analysisResult.timeComplexity}
                  </span>
                </div>
                {analysisResult.timeComplexityExplanation && (
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 mt-2 font-sans leading-relaxed border-t border-emerald-200/50 dark:border-emerald-900/40 pt-1.5">
                    💡 <strong>Intuition:</strong> {analysisResult.timeComplexityExplanation}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                    Space Complexity
                  </span>
                  <span className="text-base font-mono font-bold text-indigo-800 dark:text-indigo-200">
                    {analysisResult.spaceComplexity}
                  </span>
                </div>
                {analysisResult.spaceComplexityExplanation && (
                  <p className="text-[11px] text-indigo-700/90 dark:text-indigo-300/90 mt-2 font-sans leading-relaxed border-t border-indigo-200/50 dark:border-indigo-900/40 pt-1.5">
                    💡 <strong>Intuition:</strong> {analysisResult.spaceComplexityExplanation}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Code Quality Score
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                      {analysisResult.codeQualityScore}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">/ 10</span>
                  </div>
                </div>
                <div className="w-full bg-amber-200 dark:bg-amber-900/60 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (analysisResult.codeQualityScore / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Candidate Verbal Pitch Script */}
            {analysisResult.interviewerPitch && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50/80 to-indigo-50/80 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-900/60 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                  Interview Verbal Pitch (How to explain this to the interviewer)
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic">
                  "{analysisResult.interviewerPitch}"
                </p>
              </div>
            )}

            {/* Verdict Summary */}
            {analysisResult.verdictSummary && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white mr-1.5">Evaluation Verdict:</span>
                {analysisResult.verdictSummary}
              </div>
            )}

            {/* Correctness & Algorithmic Structure */}
            {analysisResult.correctnessAssessment && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Correctness & Algorithmic Structure
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {analysisResult.correctnessAssessment}
                </p>
              </div>
            )}

            {/* Strengths & Improvement Areas */}
            {analysisResult.qualityBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Code Strengths
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.qualityBreakdown.strengths?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Areas for Improvement
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.qualityBreakdown.areasForImprovement?.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Potential Bugs / Edge Cases */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Edge Cases & Placement Verification
              </h4>
              {analysisResult.potentialBugs && analysisResult.potentialBugs.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.potentialBugs.map((bug: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span>{bug}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No critical bugs or edge cases identified. Code looks resilient!
                </p>
              )}
            </div>

            {/* Optimization Suggestions */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5 mb-2.5">
                <Zap className="w-3.5 h-3.5" />
                Optimization Suggestions
              </h4>
              {analysisResult.optimizations && analysisResult.optimizations.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.optimizations.map((opt: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Code logic is already well structured for its current algorithmic class.
                </p>
              )}
            </div>

            {/* Interviewer Perspective & Placement Tips */}
            {analysisResult.placementTips && analysisResult.placementTips.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/30 border border-brand-200 dark:border-brand-900/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Placement Interviewer Insights
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.placementTips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysisModal(false)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Explain Code Modal */}
      <Modal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
        title="Code Walkthrough & Step-by-Step Logic"
        maxWidth="2xl"
      >
        {explanationResult && (
          <div className="space-y-5 py-2 max-h-[75vh] overflow-y-auto pr-1">
            {/* Overview & Approach Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                  Algorithmic Overview
                </h4>
                {explanationResult.approachType && (
                  <Badge variant="purple" size="sm">
                    {explanationResult.approachType}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {explanationResult.overview}
              </p>
            </div>

            {/* Dry Run / Sample Execution Trace */}
            {explanationResult.dryRunExample && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Dry Run Walkthrough (Sample Trace)
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200/60">
                    {explanationResult.dryRunExample.sampleInput}
                  </span>
                </div>

                <div className="space-y-2">
                  {explanationResult.dryRunExample.executionTrace?.map((trace, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/30 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span className="text-emerald-700 dark:text-emerald-400">{trace.iteration}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        <strong>State:</strong> {trace.currentState}
                      </p>
                      <p className="text-slate-700 dark:text-slate-200 text-[11px]">
                        <strong>Action:</strong> {trace.actionTaken}
                      </p>
                    </div>
                  ))}
                </div>

                {explanationResult.dryRunExample.finalOutput && (
                  <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                    <span>Final Computed Output:</span>
                    <span className="font-mono">{explanationResult.dryRunExample.finalOutput}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step-by-Step Logic Flow */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Code Breakdown ({explanationResult.steps?.length || 0} Stages)
              </h4>
              <div className="space-y-2.5">
                {explanationResult.steps?.map((step: any) => (
                  <div
                    key={step.stepNumber}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {step.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                        {step.description}
                      </p>
                      {step.codeSnippet && (
                        <pre className="p-2 rounded bg-slate-950 text-emerald-400 text-[11px] font-mono mt-1 overflow-x-auto whitespace-pre border border-slate-800">
                          {step.codeSnippet}
                        </pre>
                      )}
                      {step.plainEnglishMeaning && (
                        <div className="text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50/70 dark:bg-brand-950/30 p-2 rounded-lg border border-brand-100 dark:border-brand-900/40">
                          💡 <strong>In Plain English:</strong> {step.plainEnglishMeaning}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interviewer Follow-Up Questions */}
            {explanationResult.interviewerFollowUps && explanationResult.interviewerFollowUps.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Common Interview Follow-Up Questions
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {explanationResult.interviewerFollowUps.map((q: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Takeaways & Placement Concepts */}
            {explanationResult.keyTakeaways && explanationResult.keyTakeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Key Takeaways for Placement Rounds
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {explanationResult.keyTakeaways.map((concept: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanationModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
