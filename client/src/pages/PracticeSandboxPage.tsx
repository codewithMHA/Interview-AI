import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Cpu,
  Zap,
  Code2,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  Lightbulb,
  Check,
  Award,
  MessageSquare,
  HelpCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { runSandboxPlayground } from '@/services/problemService';
import {
  analyzeCodeWithAI,
  explainCodeWithAI,
} from '@/services/aiService';
import { CodeAnalysisResponse, CodeExplanationResponse } from '@/types';
import { toggleRoadmapTask } from '@/services/roadmapService';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

// Starter templates for common languages
const STARTER_CODE_TEMPLATES: Record<string, string> = {
  javascript: `// Free Practice Sandbox (JavaScript Node.js)
// Custom input entered in "Custom Input (stdin)" is automatically passed!

const rawInput = typeof stdin !== 'undefined' && stdin ? stdin.trim() : "2 7 11 15";
console.log("Input received:", rawInput);

function solve(input) {
  // Write your logic here
  return "Optimal result computed for: " + input;
}

const result = solve(rawInput);
console.log("Output:", result);
`,
  python: `# Free Practice Sandbox (Python 3)
# Custom input entered in "Custom Input (stdin)" is automatically passed!
import sys

raw_input = sys.stdin.read().strip()
input_data = raw_input if raw_input else "2 7 11 15"
print(f"Input received: {input_data}")

def solve(data):
    # Write your logic here
    return f"Optimal result computed for: {data}"

print("Output:", solve(input_data))
`,
  java: `// Free Practice Sandbox (Java)
public class Main {
    public static void main(String[] args) {
        System.out.println("Executing Java Algorithm Sandbox...");
        int[] nums = {2, 7, 11, 15};
        System.out.println("Target array length: " + nums.length);
    }
}
`,
  cpp: `// Free Practice Sandbox (C++)
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    cout << "Executing C++ Algorithm Sandbox..." << endl;
    vector<int> nums = {2, 7, 11, 15};
    cout << "Target array size: " << nums.size() << endl;
    return 0;
}
`,
};

export const PracticeSandboxPage: React.FC = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query params passed from Roadmap
  const taskId = searchParams.get('taskId') || '';
  const taskTitle = searchParams.get('title') || 'Free Practice Coding Sandbox';
  const taskFocus = searchParams.get('focus') || 'Algorithms & Data Structures';
  const taskDesc =
    searchParams.get('desc') ||
    'Write, execute, and inspect your algorithm with live console output and AI Big-O complexity analysis.';
  const roadmapSlug = searchParams.get('roadmap') || 'full-stack-30';

  // Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [codePerLanguage, setCodePerLanguage] = useState<Record<string, string>>(STARTER_CODE_TEMPLATES);
  const [customStdin, setCustomStdin] = useState<string>('');

  // Terminal & execution states
  const terminalPanelRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('Click "Run Code" to execute in the sandbox.');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'stdin'>('output');

  // AI Modal states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResponse | null>(null);

  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [explanationResult, setExplanationResult] = useState<CodeExplanationResponse | null>(null);

  // Roadmap check-off feedback
  const [isMarkedDone, setIsMarkedDone] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Always start at the top of the editor page when opened from roadmap or navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 60);
    return () => clearTimeout(timer);
  }, [taskId]);

  const currentCode = codePerLanguage[selectedLanguage] || '';

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
  };

  const handleCodeChange = (val: string | undefined) => {
    setCodePerLanguage((prev) => ({
      ...prev,
      [selectedLanguage]: val || '',
    }));
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter boilerplate?')) {
      setCodePerLanguage((prev) => ({
        ...prev,
        [selectedLanguage]: STARTER_CODE_TEMPLATES[selectedLanguage] || '',
      }));
    }
  };

  const handleRunCode = async () => {
    if (!currentCode.trim()) return;
    setIsRunning(true);
    setActiveBottomTab('output');
    setTerminalOutput('Executing code in sandbox...');

    // Smoothly scroll down so user immediately sees execution progress
    setTimeout(() => {
      terminalPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);

    try {
      const res = await runSandboxPlayground(selectedLanguage, currentCode, customStdin);
      if (res.status === 'Runtime Error') {
        setTerminalOutput(`[Runtime Error]\n${res.stderr || res.stdout}`);
      } else {
        setTerminalOutput(res.stdout);
      }
      setExecutionTime(res.executionTime);
    } catch (err: any) {
      setTerminalOutput(`[Execution Error]: ${err.message || 'Failed to execute code'}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        terminalPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  const handleAIAnalysis = async () => {
    if (!currentCode.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeCodeWithAI({
        problemTitle: taskTitle,
        problemDescription: taskDesc,
        language: selectedLanguage,
        userCode: currentCode,
      });
      setAnalysisResult(res);
      setShowAnalysisModal(true);
    } catch (err: any) {
      console.error('AI code analysis error:', err);
      setToastMessage('⚠️ AI code analysis could not complete. Please check code or try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExplainCode = async () => {
    if (!currentCode.trim()) return;
    setIsExplaining(true);
    try {
      const res = await explainCodeWithAI({
        problemTitle: taskTitle,
        language: selectedLanguage,
        userCode: currentCode,
      });
      setExplanationResult(res);
      setShowExplanationModal(true);
    } catch (err: any) {
      console.error('AI code explanation error:', err);
      setToastMessage('⚠️ AI code explanation could not complete. Please check code or try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleMarkTaskComplete = async () => {
    if (!taskId) return;
    try {
      await toggleRoadmapTask(taskId, roadmapSlug);
      setIsMarkedDone(true);
      setToastMessage('🎉 Milestone task marked complete on your placement roadmap! (+35 XP)');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.warn('Could not auto-mark task complete:', err);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4 min-h-[calc(100vh-4rem)]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-400 dark:text-brand-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          <Link
            to="/roadmap"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Roadmap
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {taskTitle}
          </span>
          <Badge variant="purple" size="sm">Dedicated Sandbox</Badge>
        </div>

        {taskId && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isMarkedDone ? 'ghost' : 'outline'}
              onClick={handleMarkTaskComplete}
              disabled={isMarkedDone}
              className={isMarkedDone ? 'text-emerald-600 font-bold' : ''}
            >
              {isMarkedDone ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-emerald-500" />
                  Milestone Completed (+35 XP)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1 text-slate-400" />
                  Mark Task Complete on Roadmap
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Info Brief (40%) | Right Monaco Editor & Terminal (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* LEFT PANEL: Topic Info & Challenge Brief (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex-1">
            <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {taskFocus}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Practice Workspace</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {taskTitle}
              </h2>
            </div>

            {/* Task Objectives */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-500" />
                Practice Goal & Instructions
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {taskDesc}
              </p>
            </div>

            {/* Target Efficiency & Complexity */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Target Efficiency & Best Practices
              </span>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span>Aim for optimal Big-O time (e.g. O(n) or O(log n)) avoiding brute-force O(n²).</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span>Keep auxiliary memory in-place (O(1)) whenever practical.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span>Test empty arrays, edge cases, and boundary constraints.</span>
                </li>
              </ul>
            </div>

            {/* Placement Interview Tips */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Placement Interview Strategy
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Before implementing your solution, click <strong>"AI Analysis"</strong> to verify complexity trade-offs or <strong>"Explain Code"</strong> to check step-by-step logic clarity.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Monaco Editor & Terminal Console (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-[580px]">
          {/* Editor Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Language:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: AI Analysis, Explain Code, Run */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="text-xs gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExplainCode}
                disabled={isExplaining}
                className="text-xs gap-1 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isExplaining ? 'Explaining...' : 'Explain Code'}</span>
              </Button>

              <button
                onClick={handleResetCode}
                title="Reset Code Template"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleRunCode}
                disabled={isRunning}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner min-h-[350px]">
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              value={currentCode}
              onChange={handleCodeChange}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Panel: Interactive Terminal / Output */}
          <div ref={terminalPanelRef} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveBottomTab('output')}
                  className={`text-xs font-bold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                    activeBottomTab === 'output'
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Terminal Output
                </button>
                <button
                  onClick={() => setActiveBottomTab('stdin')}
                  className={`text-xs font-bold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                    activeBottomTab === 'stdin'
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Custom Input (stdin)
                </button>
              </div>

              {executionTime !== null && (
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-500" /> {executionTime} ms
                </span>
              )}
            </div>

            <div className="p-3.5 min-h-[120px] max-h-[200px] overflow-y-auto font-mono text-xs">
              {activeBottomTab === 'output' ? (
                <pre className="whitespace-pre-wrap text-slate-800 dark:text-emerald-400 font-mono">
                  {terminalOutput}
                </pre>
              ) : (
                <textarea
                  value={customStdin}
                  onChange={(e) => setCustomStdin(e.target.value)}
                  placeholder="Pass custom input to your code (e.g. 5 or [2, 7, 11, 15])..."
                  className="w-full h-24 p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>

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
                    Quality Score
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

            {/* Edge Cases & Verification */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Edge Cases & Placement Verification
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {analysisResult.potentialBugs?.map((bug: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span>{bug}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concrete Optimizations */}
            {analysisResult.optimizations && analysisResult.optimizations.length > 0 && (
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Target Optimizations & Speedups
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.optimizations.map((opt: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Placement Interview Tips */}
            {analysisResult.placementTips && analysisResult.placementTips.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  MNC Recruiter & Placement Tips
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
              <Button variant="outline" size="sm" onClick={() => setShowAnalysisModal(false)}>
                Close
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

            {/* Key Takeaways */}
            {explanationResult.keyTakeaways && explanationResult.keyTakeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Key Placement Takeaways
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {explanationResult.keyTakeaways.map((takeaway: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowExplanationModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PracticeSandboxPage;
