import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Brain,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Play,
  Terminal,
  Zap,
  ShieldCheck,
  Target,
  Flame,
  Award,
  ChevronRight,
  ChevronLeft,
  Compass,
  Cpu,
  Layers,
  FileCheck,
  Building,
  GraduationCap,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Check,
  Lightbulb,
  Briefcase,
  TrendingUp,
  RotateCcw,
  Bot,
  FileText,
  Star,
  Calendar as CalendarIcon,
  HelpCircle,
  ChevronDown,
  Clock,
  Radio,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';
import { InterviewStreakCalendar } from '@/components/common/LeetCodeStreakCalendar';

// Sample code snippets for live Monaco runner teaser
const CODE_SNIPPETS = {
  two_sum: {
    title: 'Two Sum (Hash Map)',
    difficulty: 'Easy',
    company: 'Google, Amazon',
    language: 'javascript',
    code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test Run:
const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input:", nums, "Target:", target);
console.log("Indices:", twoSum(nums, target));`,
    testOutput: `Input: [ 2, 7, 11, 15 ] Target: 9
Indices: [ 0, 1 ]
[PASSED] Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0,1]
[PASSED] Test Case 2: nums=[3,2,4], target=6 -> Output: [1,2]
[PASSED] Test Case 3: nums=[3,3], target=6 -> Output: [0,1]
All 3/3 Test Cases Passed!`,
    timeComplexity: 'O(N) Linear Time',
    spaceComplexity: 'O(N) Linear Space',
    complexityDetails: 'Single pass iteration through the array with O(1) hash map lookups. Space used is proportional to unique elements stored in the Map.'
  },
  binary_search: {
    title: 'Binary Search (Sorted Array)',
    difficulty: 'Easy',
    company: 'Microsoft, Apple',
    language: 'javascript',
    code: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Test Run:
const arr = [-1, 0, 3, 5, 9, 12];
console.log("Array:", arr);
console.log("Target 9 found at index:", binarySearch(arr, 9));`,
    testOutput: `Array: [ -1, 0, 3, 5, 9, 12 ]
Target 9 found at index: 4
[PASSED] Test Case 1: target=9 -> index 4
[PASSED] Test Case 2: target=2 -> index -1 (Not found)
All 2/2 Test Cases Passed!`,
    timeComplexity: 'O(log N) Logarithmic Time',
    spaceComplexity: 'O(1) Constant Space',
    complexityDetails: 'Halves the search space on each iteration by comparing the target with the median element. Requires no additional heap memory.'
  },
  valid_parentheses: {
    title: 'Valid Parentheses (Stack)',
    difficulty: 'Easy',
    company: 'Uber, Swiggy, Meta',
    language: 'javascript',
    code: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}

// Test Run:
console.log("is '()[]{}' valid?", isValid("()[]{}"));
console.log("is '(]' valid?", isValid("(]"));`,
    testOutput: `is '()[]{}' valid? true
is '(]' valid? false
[PASSED] Test Case 1: "()[]{}" -> true
[PASSED] Test Case 2: "(]" -> false
[PASSED] Test Case 3: "([{}])" -> true
All 3/3 Test Cases Passed!`,
    timeComplexity: 'O(N) Linear Time',
    spaceComplexity: 'O(N) Linear Space (Stack)',
    complexityDetails: 'Processes each character exactly once. In the worst case, the stack stores all opening brackets if validly nested.'
  }
};

const SHOWCASE_SLIDES = [
  { id: 'monaco', label: 'Monaco Code Runner', icon: Code2, badge: 'Judge0 Sandbox' },
  { id: 'calendar', label: 'InterviewAI Streak Calendar', icon: CalendarIcon, badge: 'Daily Challenge' },
  { id: 'resume', label: 'ATS Resume Optimizer', icon: FileText, badge: 'Google X-Y-Z' },
  { id: 'calculator', label: 'Tier & Compensation Explorer', icon: TrendingUp, badge: 'Market CTC' }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Sliding Showcase Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // 1. Live Code Sandbox State
  const [selectedCodeKey, setSelectedCodeKey] = useState<'two_sum' | 'binary_search' | 'valid_parentheses'>('two_sum');
  const [codeContent, setCodeContent] = useState(CODE_SNIPPETS.two_sum.code);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [showComplexity, setShowComplexity] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // 2. Placement Readiness Calculator State
  const [targetRole, setTargetRole] = useState<'Full Stack SDE' | 'Backend Engineer' | 'Frontend Engineer' | 'Data / AI'>('Full Stack SDE');
  const [targetTier, setTargetTier] = useState<'Tier 1 FAANG (₹20-45 LPA)' | 'Unicorns (₹14-25 LPA)' | 'IT Giants (₹7-12 LPA)'>('Tier 1 FAANG (₹20-45 LPA)');
  const [dsaExperience, setDsaExperience] = useState<'Beginner (<30 Qs)' | 'Intermediate (30-100 Qs)' | 'Advanced (100+ Qs)'>('Intermediate (30-100 Qs)');
  const [dailyCommitment, setDailyCommitment] = useState<'1-2 hrs/day' | '3-4 hrs/day' | '5+ hrs/day'>('3-4 hrs/day');

  // 3. Company Explorer Tab
  const [companyTab, setCompanyTab] = useState<'faang' | 'unicorns' | 'service'>('faang');

  // 4. FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Sync selected code snippet when user switches tabs
  useEffect(() => {
    setCodeContent(CODE_SNIPPETS[selectedCodeKey].code);
    setTerminalOutput(null);
    setShowComplexity(false);
  }, [selectedCodeKey]);

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTerminalOutput('Compiling code via Judge0 Sandbox...\nLinking runtime libraries...\n');
    setTimeout(() => {
      setTerminalOutput(CODE_SNIPPETS[selectedCodeKey].testOutput);
      setIsRunningCode(false);
    }, 450);
  };

  // Readiness Score Calculation
  const calculatePredictedReadiness = () => {
    let score = 50;
    if (dsaExperience === 'Advanced (100+ Qs)') score += 30;
    else if (dsaExperience === 'Intermediate (30-100 Qs)') score += 18;
    else score += 5;

    if (dailyCommitment === '5+ hrs/day') score += 15;
    else if (dailyCommitment === '3-4 hrs/day') score += 10;
    else score += 4;

    return Math.min(96, score);
  };

  const predictedScore = calculatePredictedReadiness();

  const getEstimatedCTC = () => {
    if (targetTier.includes('FAANG')) return '₹24 - 42 LPA';
    if (targetTier.includes('Unicorns')) return '₹16 - 28 LPA';
    return '₹8 - 14 LPA';
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060609] text-slate-900 dark:text-slate-100 transition-colors selection:bg-emerald-500 selection:text-white dark:selection:text-black">
      {/* =========================================================================
          1. HERO SECTION: ATTRACTIVE IN LIGHT & OBSIDIAN IN DARK MODE
          ========================================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Glow ambient background effects - tuned for both high-end light and obsidian dark */}
        <div className="absolute top-0 inset-x-0 h-[650px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.14),rgba(99,102,241,0.08),transparent)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-indigo-500/15 to-purple-500/15 dark:from-emerald-500/15 dark:via-indigo-600/20 dark:to-purple-600/15 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/6 w-[400px] h-[350px] bg-emerald-400/15 dark:bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/6 w-[450px] h-[350px] bg-indigo-400/15 dark:bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-8 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>The Autonomous Placement Operating System · 2026 Batch</span>
            </div>

            {/* Signature Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-8 text-slate-900 dark:text-white">
              The future of campus placements is <br />
              <span className="inline-block bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-xs">
                student + AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
              Master technical rounds with our Monaco & Judge0 multi-language code sandbox, 149+ curated CSE problem bank, 24/7 AI placement mentor, daily consistency tracking, and ATS resume intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-9 py-4 text-sm font-extrabold shadow-lg shadow-emerald-500/25 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-400 dark:hover:to-teal-400 text-white dark:text-slate-950 border-0"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Preparing Free
                </Button>
              </Link>

              <Link to="/questions" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-sm font-semibold rounded-2xl border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Explore Question Bank (149+ Qs)
                </Button>
              </Link>
            </div>

            {/* Floating Live Badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
              {/* Badge 1: 24/7 AI Mentor */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121218]/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>AI Placement Mentor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">24/7 Doubt Solver</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Instant Voice & Code</p>
              </div>

              {/* Badge 2: Daily Streak */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121218]/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Consistency Engine</span>
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                </div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Daily Streak Tracker</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">365-Day Activity Grid</p>
              </div>

              {/* Badge 3: Target Role Benchmark */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121218]/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Target Benchmark</span>
                  <Award className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Tier-1 SDE Standards</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono">149+ Curated Core Qs</p>
              </div>

              {/* Badge 4: Code Assertions */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121218]/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Judge0 Sandbox</span>
                  <Code2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Multi-Language Code</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">C++, Java, Python, JS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. THE SIGNATURE SLIDING SHOWCASE FLOW (HORIZONTAL CAROUSEL)
          ========================================================================= */}
      <section id="interactive-suite" className="pb-24 -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Slider Navigation Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-2">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Interactive Studio Stage
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Experience the InterviewAI Studio Flow
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Slide across the 5 core modules to test real-time AI scoring, code compilation, and streak tracking.
              </p>
            </div>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevSlide}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-[#222230] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-[#222230] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide Tab Navigator Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {SHOWCASE_SLIDES.map((slide, idx) => {
              const Icon = slide.icon;
              const isActive = currentSlideIndex === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${isActive
                      ? 'bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-indigo-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/50 shadow-xs'
                      : 'bg-white dark:bg-[#121218] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{slide.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${isActive ? 'bg-emerald-500 text-white dark:text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                  >
                    {slide.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Showcase Stage Container */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0d0d12]/95 backdrop-blur-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-all relative">
            {/* Top Mac Window Bar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-[#13131a]/80">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  InterviewAI Live Studio Flow · Slide {currentSlideIndex + 1} of {SHOWCASE_SLIDES.length}
                </span>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {SHOWCASE_SLIDES.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlideIndex === i ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Stage Body */}
            <div className="p-6 md:p-8">
              {/* SLIDE 1: MONACO CODE RUNNER */}
              {currentSlideIndex === 0 && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Monaco Algorithm Studio (Judge0 Sandbox)
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Live code compiler with test assertions & automated Big-O complexity analysis.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {(Object.keys(CODE_SNIPPETS) as Array<keyof typeof CODE_SNIPPETS>).map((key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedCodeKey(key)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedCodeKey === key
                              ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                              : 'bg-slate-100 dark:bg-[#181822] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                          {CODE_SNIPPETS[key].title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Code Editor */}
                    <div className="lg:col-span-7 bg-white dark:bg-[#14141c] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2 text-xs">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{CODE_SNIPPETS[selectedCodeKey].title}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Asked at: {CODE_SNIPPETS[selectedCodeKey].company}</span>
                      </div>
                      <textarea
                        rows={11}
                        value={codeContent}
                        onChange={(e) => setCodeContent(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0f] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-emerald-300 focus:outline-hidden resize-none leading-relaxed shadow-inner"
                      />
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRunCode}
                            disabled={isRunningCode}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isRunningCode ? 'Running...' : 'Run Code'}</span>
                          </button>
                          <button
                            onClick={() => setShowComplexity(!showComplexity)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1e1e2a] dark:hover:bg-[#252536] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/60"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            <span>Big-O Analysis</span>
                          </button>
                        </div>
                        <Link to="/coding" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                          <span>31+ Problems</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Terminal Output */}
                    <div className="lg:col-span-5 bg-slate-950 dark:bg-[#0a0a0f] rounded-2xl p-4 border border-slate-800 flex flex-col justify-between font-mono text-xs shadow-inner text-slate-100">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Terminal Console
                          </span>
                          <span className="text-emerald-400 font-semibold">Judge0 Sandbox</span>
                        </div>
                        <div className="py-3">
                          {terminalOutput ? (
                            <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed font-mono text-xs">
                              {terminalOutput}
                            </pre>
                          ) : (
                            <p className="text-slate-500 italic py-6 text-center">
                              Click "Run Code" to compile and execute 3 test assertions.
                            </p>
                          )}
                        </div>
                      </div>

                      {showComplexity && (
                        <div className="p-3 rounded-xl bg-slate-900 dark:bg-[#14141c] border border-slate-800 space-y-1.5 mt-2 animate-slide-up shadow-sm">
                          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Algorithmic Complexity</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-black/60 border border-slate-800">
                              <p className="text-[9px] text-slate-400">Time</p>
                              <p className="font-bold text-emerald-400">{CODE_SNIPPETS[selectedCodeKey].timeComplexity}</p>
                            </div>
                            <div className="p-2 rounded bg-black/60 border border-slate-800">
                              <p className="text-[9px] text-slate-400">Space</p>
                              <p className="font-bold text-indigo-400">{CODE_SNIPPETS[selectedCodeKey].spaceComplexity}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Multi-Language: C++, Java, Python, JS</span>
                        <span className="text-emerald-400 font-bold">0 Memory Leaks</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: INTERVIEWAI STREAK & CALENDAR */}
              {currentSlideIndex === 1 && (
                <div className="animate-fade-in max-w-xl mx-auto space-y-4">
                  <div className="text-center mb-2">
                    <Badge variant="purple" className="mb-1">Interactive Feature Demo</Badge>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Daily Placement Challenge & Streak Calendar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Stay disciplined with real-time countdown timer, daily streak multiplier, and 365-day heatmap.
                    </p>
                  </div>

                  <InterviewStreakCalendar
                    currentStreak={12}
                    bestStreak={19}
                    activityMap={{
                      '2026-11-01': 2,
                      '2026-11-02': 3,
                      '2026-11-03': 1,
                      '2026-11-04': 4,
                      '2026-11-05': 2,
                      '2026-11-06': 3
                    }}
                    showAnnualToggle={true}
                  />
                </div>
              )}

              {/* SLIDE 3: ATS RESUME SCANNER PREVIEW */}
              {currentSlideIndex === 2 && (
                <div className="animate-fade-in max-w-2xl mx-auto space-y-4">
                  <div className="text-center mb-2">
                    <Badge variant="brand" className="mb-1">InterviewAI Resume Engine</Badge>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Instant ATS Score & Google X-Y-Z Bullet Point Rewrites
                    </h3>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#14141c] border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Applicant Tracking Match:</span>
                        <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">88 / 100 · High Recruiter Match</p>
                      </div>
                      <Badge variant="success">FAANG Ready</Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Google X-Y-Z Rewrite Example:</p>
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300">
                        <span className="font-semibold block text-[10px] uppercase">Original Weak Bullet:</span>
                        "Worked on e-commerce backend and built checkout APIs."
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                        <span className="font-semibold block text-[10px] uppercase">AI Optimized (Google X-Y-Z Formula):</span>
                        "Architected concurrent checkout microservice in Node.js & PostgreSQL, reducing checkout latency by 42% and handling 10,000+ peak requests with zero transaction deadlocks."
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Scan your complete resume text in &lt; 2 seconds</span>
                      <Link to="/resume-scanner" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                        Launch Resume Scanner →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: PLACEMENT READINESS & CTC CALCULATOR */}
              {currentSlideIndex === 3 && (
                <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
                  <div className="text-center">
                    <Badge variant="brand" className="mb-1">Industry Benchmark Tool</Badge>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Target Tier & Compensation Bracket Explorer
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#14141c] border border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Engineering Role</label>
                        <select
                          value={targetRole}
                          onChange={(e: any) => setTargetRole(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d0d14] text-xs font-medium text-slate-800 dark:text-slate-200"
                        >
                          <option>Full Stack SDE</option>
                          <option>Backend Engineer</option>
                          <option>Frontend Engineer</option>
                          <option>Data / AI</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Hiring Tier</label>
                        <select
                          value={targetTier}
                          onChange={(e: any) => setTargetTier(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d0d14] text-xs font-medium text-slate-800 dark:text-slate-200"
                        >
                          <option>Tier 1 FAANG (₹20-45 LPA)</option>
                          <option>Unicorns (₹14-25 LPA)</option>
                          <option>IT Giants (₹7-12 LPA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Current DSA Preparation Level</label>
                        <select
                          value={dsaExperience}
                          onChange={(e: any) => setDsaExperience(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d0d14] text-xs font-medium text-slate-800 dark:text-slate-200"
                        >
                          <option>Beginner (&lt;30 Qs)</option>
                          <option>Intermediate (30-100 Qs)</option>
                          <option>Advanced (100+ Qs)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Daily Study Commitment</label>
                        <select
                          value={dailyCommitment}
                          onChange={(e: any) => setDailyCommitment(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d0d14] text-xs font-medium text-slate-800 dark:text-slate-200"
                        >
                          <option>1-2 hrs/day</option>
                          <option>3-4 hrs/day</option>
                          <option>5+ hrs/day</option>
                        </select>
                      </div>
                    </div>

                    {/* Results Box */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-800/80 via-teal-800/60 to-slate-900 border border-emerald-500/30 text-white flex flex-col justify-between shadow-xl">
                      <div>
                        <p className="text-xs uppercase font-bold text-emerald-300 tracking-wider">Estimated Placement Index</p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-4xl sm:text-5xl font-black text-emerald-300">{predictedScore}%</span>
                          <span className="text-xs text-emerald-200 font-semibold">Readiness Score</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${predictedScore}%` }} />
                        </div>
                      </div>

                      <div className="my-4 p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-emerald-500/20 space-y-1">
                        <p className="text-[10px] text-emerald-300 uppercase font-semibold">Standard Industry Hiring Compensation Bracket</p>
                        <p className="text-xl font-extrabold text-white">{getEstimatedCTC()}</p>
                        <p className="text-[9px] text-emerald-200/70 pt-0.5">*Standard industry campus recruitment compensation range.</p>
                      </div>

                      <Link to="/roadmap" className="w-full block">
                        <Button size="md" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-0" rightIcon={<ArrowRight className="w-4 h-4 text-slate-950" />}>
                          Unlock Your 30-Day Plan →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CURATED TECH COMPANY TRACKS (Clean Static Showcase - No Flowing Line)
          ========================================================================= */}
      <section className="py-10 border-y border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#09090e]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              Curated Technical Question Sets & Interview Patterns For Leading Tech Giants
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {[
              { name: 'Google', color: 'hover:text-blue-500 hover:border-blue-500/40' },
              { name: 'Amazon', color: 'hover:text-amber-500 hover:border-amber-500/40' },
              { name: 'Microsoft', color: 'hover:text-cyan-500 hover:border-cyan-500/40' },
              { name: 'Uber', color: 'hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400' },
              { name: 'Atlassian', color: 'hover:text-blue-400 hover:border-blue-500/40' },
              { name: 'Flipkart', color: 'hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-500/40' },
              { name: 'Oracle', color: 'hover:text-rose-500 hover:border-rose-500/40' },
              { name: 'Adobe', color: 'hover:text-red-500 hover:border-red-500/40' },
              { name: 'Swiggy', color: 'hover:text-orange-500 hover:border-orange-500/40' },
              { name: 'Razorpay', color: 'hover:text-blue-600 hover:border-blue-600/40' },
            ].map((company) => (
              <div
                key={company.name}
                className={`px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12131e] text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs transition-all cursor-default ${company.color}`}
              >
                <span>{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. MODERN BENTO GRID ARCHITECTURE (RAMOTION STYLE)
          ========================================================================= */}
      <section className="py-24 bg-slate-50/50 dark:bg-[#08080c] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="brand" className="mb-2">Unified Placement OS</Badge>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Next-Gen Placement Architecture
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Six synchronized engines working together to accelerate your interview readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: AI Resume-Driven Voice Interview (thita.ai Engine) */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-indigo-500/50 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Interactive AI Interview
                </h3>
                <Badge variant="brand" size="sm">Voice AI</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Select target role (e.g. SDE-1 at Amazon) and enter a live voice-to-voice simulation where the interviewer probes your actual projects, architecture, and code decisions.
              </p>
              <div className="pt-2">
                <Link to="/ai-interview" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                  <span>Start AI Interview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: Monaco & Judge0 Coding Sandbox */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-indigo-500/50 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Monaco & Judge0 Multi-Language Sandbox
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Write production code in C++, Java, Python, and JavaScript with 31+ curated challenges, memory leak checks, and automated Big-O complexity intuition.
              </p>
              <div className="pt-2">
                <Link to="/coding" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                  <span>Open Coding Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 3: InterviewAI Consistency Engine */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-amber-500/50 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                InterviewAI Streak Consistency Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay motivated with the daily countdown timer, calendar heatmap, XP progression, and level badges calibrated strictly to your real submissions.
              </p>
              <div className="pt-2">
                <Link to="/analytics" className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1">
                  <span>View Consistency Heatmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 4: Structured 30-Day Placement Roadmap */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-purple-500/50 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Adaptive 30-Day Placement Roadmap
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Follow a step-by-step daily sprint from Arrays & Two Pointers to Dynamic Programming, Core OS/DBMS, and Final System Design walkthroughs.
              </p>
              <div className="pt-2">
                <Link to="/roadmap" className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1">
                  <span>Explore Curriculum</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 5: AI Resume & ATS Placement Scanner */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-teal-500/50 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Resume & ATS Optimization
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detect keyword gaps against top tech job descriptions and convert passive bullet points into high-impact Google X-Y-Z formula achievements.
              </p>
              <div className="pt-2">
                <Link to="/resume-scanner" className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1">
                  <span>Audit Your Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 6: 24/7 Placement AI Mentor */}
            <div className="p-7 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-rose-500/50 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                24/7 Bilingual AI Placement Mentor
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stuck on recursion or system design? Ask questions in Hinglish or English and get intuitive analogies, code walkthroughs, and audio explanations.
              </p>
              <div className="pt-2">
                <Link to="/chat" className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1">
                  <span>Chat with AI Mentor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. TARGET COMPANY HIRING PATTERNS
          ========================================================================= */}
      <section id="company-intelligence" className="py-20 bg-white dark:bg-[#060609] border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="brand" className="mb-2">Targeted Company Intelligence</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Calibrated for Top Recruiter Standards
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Explore interview rounds, compensation benchmarks, and frequently asked topics across hiring tiers.
            </p>

            <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#14141c] border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setCompanyTab('faang')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${companyTab === 'faang'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                FAANG & Tier-1 (Google, Amazon, Microsoft)
              </button>
              <button
                onClick={() => setCompanyTab('unicorns')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${companyTab === 'unicorns'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                FinTech & Unicorns (Swiggy, Razorpay, Zomato)
              </button>
              <button
                onClick={() => setCompanyTab('service')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${companyTab === 'service'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Enterprise IT (TCS Digital, Infosys, Accenture)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyTab === 'faang' && (
              <>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Google SDE-1</span>
                    <Badge variant="purple">Standard CTC: ₹35 - 48 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Algorithmic efficiency, Big-O bounds, Trees/Graphs, Dynamic Programming, and Googleyness behavioral rounds.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Top Focus:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge size="sm">Dynamic Programming</Badge>
                      <Badge size="sm">Trie</Badge>
                      <Badge size="sm">Concurrency</Badge>
                    </div>
                  </div>
                  <Link to="/coding" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Practice Google Questions</Button>
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Amazon SDE-1</span>
                    <Badge variant="purple">Standard CTC: ₹28 - 44 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    DSA (Arrays, HashMaps, BFS/DFS) and strict evaluation against the 16 Amazon Leadership Principles.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Top Focus:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge size="sm">STAR Behavioral</Badge>
                      <Badge size="sm">Binary Trees</Badge>
                      <Badge size="sm">LRU Cache</Badge>
                    </div>
                  </div>
                  <Link to="/questions" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Practice Amazon Track</Button>
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Microsoft SWE</span>
                    <Badge variant="purple">Standard CTC: ₹26 - 42 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Clean OOP architecture, linked lists, string manipulation, system fundamentals, and growth mindset.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Top Focus:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge size="sm">OOP Design</Badge>
                      <Badge size="sm">Strings / Arrays</Badge>
                      <Badge size="sm">OS Deadlocks</Badge>
                    </div>
                  </div>
                  <Link to="/questions" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Explore Microsoft Track</Button>
                  </Link>
                </div>
              </>
            )}

            {companyTab === 'unicorns' && (
              <>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Swiggy / Zomato</span>
                    <Badge variant="brand">Standard CTC: ₹18 - 30 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    High concurrency, Redis caching, microservices architecture, and real-time order tracking simulations.
                  </p>
                  <Link to="/coding" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Practice Real-World LLD</Button>
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Razorpay / CRED</span>
                    <Badge variant="brand">Standard CTC: ₹20 - 32 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Idempotent APIs, distributed transactions, database ACID guarantees, and security hygiene.
                  </p>
                  <Link to="/coding" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Practice Backend Track</Button>
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Flipkart SDE</span>
                    <Badge variant="brand">Standard CTC: ₹22 - 34 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Machine coding rounds (Low-Level Design), clean extensible OOP, and algorithmic speed.
                  </p>
                  <Link to="/questions" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Machine Coding Qs</Button>
                  </Link>
                </div>
              </>
            )}

            {companyTab === 'service' && (
              <>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">TCS Digital</span>
                    <Badge variant="warning">Standard CTC: ₹7.5 - 9 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Advanced coding problems, SQL subqueries, DBMS normalization, and fundamental OOP concepts.
                  </p>
                  <Link to="/questions" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">TCS Digital Prep</Button>
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Infosys Specialist Programmer</span>
                    <Badge variant="warning">Standard CTC: ₹9.5 - 11 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Competitive programming (HackWithInfy track), greedy algorithms, bit manipulation, and graphs.
                  </p>
                  <Link to="/coding" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Practice Greedy Algorithms</Button>
                  </Link>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Accenture Advanced ASE</span>
                    <Badge variant="warning">Standard CTC: ₹6.5 - 8 LPA</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cognitive assessment, pseudo-code analysis, core networking & OS, and technical interview round.
                  </p>
                  <Link to="/questions" className="block pt-2">
                    <Button size="sm" variant="outline" className="w-full">Study Core CS Bank</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. COMPARISON MATRIX: WHY INTERVIEWAI OUTPERFORMS TRADITIONAL PREP
          ========================================================================= */}
      <section className="py-20 bg-slate-50/50 dark:bg-[#09090e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="purple" className="mb-2">Platform Comparison</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Why InterviewAI Outperforms Traditional Preparation
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              See how InterviewAI unites every critical dimension of modern tech hiring.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111118] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#161622] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4 sm:p-5">Feature</th>
                    <th className="p-4 text-center">Grinding LeetCode Alone</th>
                    <th className="p-4 text-center">YouTube Videos</th>
                    <th className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold border-x border-emerald-300 dark:border-emerald-500/30">
                      InterviewAI OS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">24/7 AI Placement Mentor & Code Explainer</td>
                    <td className="p-4 text-center text-rose-500">❌ Paid extra / generic</td>
                    <td className="p-4 text-center text-rose-500">❌ Static videos</td>
                    <td className="p-4 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-x border-emerald-300 dark:border-emerald-500/30">
                      ✅ Interactive & Bilingual
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Multi-Language Monaco & Judge0 Compiler</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400">✅ Available</td>
                    <td className="p-4 text-center text-rose-500">❌ None</td>
                    <td className="p-4 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-x border-emerald-300 dark:border-emerald-500/30">
                      ✅ Integrated (C++, Java, Python, JS)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Daily Streak Countdown Calendar & Heatmap</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400">✅ Available</td>
                    <td className="p-4 text-center text-rose-500">❌ None</td>
                    <td className="p-4 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-x border-emerald-300 dark:border-emerald-500/30">
                      ✅ Built-In + 365 Grid
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">ATS Resume Scanner & Google X-Y-Z Rewrites</td>
                    <td className="p-4 text-center text-rose-500">❌ None</td>
                    <td className="p-4 text-center text-rose-500">❌ None</td>
                    <td className="p-4 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-x border-emerald-300 dark:border-emerald-500/30">
                      ✅ Automated AI Fixes
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Structured 30-Day Campus Curriculum</td>
                    <td className="p-4 text-center text-amber-500">⚠️ Unstructured list</td>
                    <td className="p-4 text-center text-amber-500">⚠️ Fragmented playlists</td>
                    <td className="p-4 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-x border-emerald-300 dark:border-emerald-500/30">
                      ✅ Day-by-Day Milestone Plan
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Target Tier Company Intelligence</td>
                    <td className="p-4 text-center text-rose-500">❌ Generic problems</td>
                    <td className="p-4 text-center text-amber-500">⚠️ Outdated</td>
                    <td className="p-4 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-x border-emerald-300 dark:border-emerald-500/30">
                      ✅ FAANG & Unicorn CTC Benchmarks
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CORE PREPARATION TRACKS (ENGINEERED FOR COMPUTER SCIENCE STUDENTS)
          ========================================================================= */}
      <section className="py-20 bg-white dark:bg-[#060609] border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="purple" className="mb-2">Syllabus & Competency</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Core Pillars of Placement Engineering
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Standardized syllabus mapped directly to Tier-1 campus placement requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <Badge variant="brand">DSA & Algorithms</Badge>
                <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Algorithmic Patterns & Complexity
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Master 14 core patterns: Two Pointers, Sliding Window, Monotonic Stacks, Binary Trees, Graph BFS/DFS, and Dynamic Programming with instant Big-O runtime analysis.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>31+ Curated Problems</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Judge0 Sandbox</span>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <Badge variant="purple">Backend & Systems</Badge>
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Distributed Systems & Low-Level Design
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Database indexing, B-Trees, transaction isolation, REST API design, concurrent deadlocks, and clean object-oriented architecture for machine coding rounds.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Machine Coding Track</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">LLD & Schema</span>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all">
              <div className="flex items-center justify-between">
                <Badge variant="success">Core CS & Viva</Badge>
                <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Operating Systems, DBMS & Viva Prep
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Process scheduling, virtual memory, threads, synchronization semaphores, TCP/IP handshakes, and SQL normalization questions frequently asked in viva rounds.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>149+ Question Bank</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">Interactive Q&A</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)
          ========================================================================= */}
      <section className="py-20 bg-slate-50/50 dark:bg-[#09090e] border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="brand" className="mb-2">Got Questions?</Badge>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Everything you need to know about preparing for software engineering campus placements.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How is InterviewAI different from traditional coding sites?',
                a: 'Traditional coding websites only test algorithmic syntax. Real engineering interviews test communication, trade-off discussions, system architecture, and Core CS (OS, DBMS, Networks). InterviewAI combines Judge0 code execution with daily streak tracking, 24/7 AI mentoring, and ATS resume optimization all in one unified ecosystem.'
              },
              {
                q: 'How does the 24/7 AI Placement Mentor help me prepare?',
                a: 'Our AI Mentor is tuned for technical campus placements. It explains subtle algorithmic edge cases, reviews code complexity, answers tricky Core CS viva questions, and guides your interview answers in both English and Hinglish.'
              },
              {
                q: 'Can I write code in multiple languages like C++, Java, and Python?',
                a: 'Yes! The Monaco Code Sandbox is powered by Judge0 and supports C++17, Java 17, Python 3.10, and JavaScript (Node.js). You can run test cases, inspect console output, and view instant Big-O complexity intuition.'
              },
              {
                q: 'How does the 30-Day Placement Roadmap work?',
                a: 'Once you select your target role and company tier, the platform generates a structured daily curriculum: Days 1-10 cover Core DSA Patterns, Days 11-20 cover Operating Systems & SQL, and Days 21-30 cover System Design & Comprehensive Placement Diagnostics.'
              },
              {
                q: 'Is InterviewAI free to start?',
                a: 'Yes, students can register and immediately explore the Question Bank, Monaco Code Sandbox, and AI Placement Mentor for free.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111118] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. HIGH-CONVERTING FINAL CALL TO ACTION (RESPONSIVE TO BOTH THEMES)
          ========================================================================= */}
      <section className="py-24 bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-950 dark:from-emerald-950 dark:via-[#0d0d16] dark:to-[#050508] text-white relative overflow-hidden border-t border-emerald-500/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Start Your Placement Preparation Today
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Ready to Clear Your Dream Software Engineering Offer?
          </h2>
          <p className="text-emerald-100 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Create your account in seconds, configure your target stack, and experience the full power of AI-driven interview preparation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-9 py-4 bg-white text-slate-950 hover:bg-slate-100 font-black shadow-xl rounded-2xl border-0"
                rightIcon={<ArrowRight className="w-4 h-4 text-slate-950" />}
              >
                Start Preparing Free
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-9 py-4 text-white border-white/30 hover:bg-white/10 rounded-2xl"
              >
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
