import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  Code2,
  Cpu,
  Target,
  Plus,
  BookOpen,
  Bot,
  Zap,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  TrendingUp,
  X,
  Building2,
  CalendarDays,
  FileCheck2,
  Search,
  AlertTriangle,
  Lightbulb,
  Copy,
  Terminal,
  Play
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchRoadmaps,
  fetchUserActiveRoadmap,
  enrollInRoadmap,
  toggleRoadmapTask,
  generateCustomRoadmap,
  fetchCompanyInsights,
  Roadmap,
  RoadmapWeek,
  RoadmapTask,
  RoadmapDay,
  UserRoadmapProgress,
  CompanyInsight
} from '@/services/roadmapService';
import { explainConceptWithAI } from '@/services/aiService';
import { ConceptExplanationResponse } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';

export const RoadmapPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login('student@demo.com', 'password123');
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // State
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<UserRoadmapProgress | null>(null);
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'catalog'>('curriculum');

  // Expanded weeks accordion (Default all 4 weeks expanded so full 30 days are visible!)
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiSuccessBanner, setAiSuccessBanner] = useState<string | null>(null);

  // Custom AI Generator Modal
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [targetCompany, setTargetCompany] = useState<string>('Google');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [weeksCount, setWeeksCount] = useState<number>(4);
  const [dailyHours, setDailyHours] = useState<number>(2);

  // Topics: Weak topics + Custom interested topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Dynamic Programming',
    'System Design',
    'Binary Trees & Graphs',
  ]);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');

  // Company Insights
  const [companyInsight, setCompanyInsight] = useState<CompanyInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);

  // Concept Reader Modal States
  const [showConceptModal, setShowConceptModal] = useState<boolean>(false);
  const [conceptTask, setConceptTask] = useState<RoadmapTask | null>(null);
  const [conceptDay, setConceptDay] = useState<{ dayNumber: number; title: string; focusArea: string } | null>(null);
  const [conceptDetails, setConceptDetails] = useState<ConceptExplanationResponse | null>(null);
  const [isLoadingConcept, setIsLoadingConcept] = useState<boolean>(false);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);

  const popularCompanies = [
    'Google',
    'Amazon',
    'Microsoft',
    'Uber',
    'Atlassian',
    'TCS',
    'Infosys',
    'Flipkart',
    'Adobe',
    'Goldman Sachs',
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roadmapsList, activeData] = await Promise.all([
        fetchRoadmaps(),
        fetchUserActiveRoadmap().catch(() => null),
      ]);

      setAllRoadmaps(roadmapsList);
      if (activeData && activeData.roadmap) {
        setActiveRoadmap(activeData.roadmap);
        setProgress(activeData.progress);
      } else if (roadmapsList.length > 0) {
        setActiveRoadmap(roadmapsList[0]);
      }
    } catch (err) {
      console.error('Failed to load roadmap data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch company insights when modal opens or company changes
  useEffect(() => {
    if (!showAiModal) return;
    const fetchInsight = async () => {
      setIsLoadingInsight(true);
      try {
        const res = await fetchCompanyInsights(targetCompany);
        setCompanyInsight(res);
      } catch (err) {
        console.warn('Could not fetch company insights:', err);
      } finally {
        setIsLoadingInsight(false);
      }
    };

    fetchInsight();
  }, [targetCompany, showAiModal]);

  const handleToggleTask = async (task: RoadmapTask) => {
    if (!activeRoadmap) return;
    const taskId = task.id;

    // Optimistic UI update
    const prevCompleted = progress?.completedTasks || [];
    const isCurrentlyCompleted = prevCompleted.includes(taskId);
    const newCompleted = isCurrentlyCompleted
      ? prevCompleted.filter((id) => id !== taskId)
      : [...prevCompleted, taskId];

    const totalTasks = activeRoadmap.totalTasks || 60;
    const newPercentage = Math.round((newCompleted.length / totalTasks) * 100);

    setProgress((prev) =>
      prev
        ? {
            ...prev,
            completedTasks: newCompleted,
            completedCount: newCompleted.length,
            progressPercentage: Math.min(100, newPercentage),
          }
        : null
    );

    if (!isCurrentlyCompleted) {
      setToastMessage(`🎉 Completed "${task.title}"! +${task.xpReward} XP awarded.`);
      setTimeout(() => setToastMessage(null), 3500);
    }

    try {
      const res = await toggleRoadmapTask(taskId, activeRoadmap.slug);
      setProgress(res.progress);
    } catch (err) {
      console.error('Failed to toggle task:', err);
      loadData();
    }
  };

  const handleSwitchRoadmap = async (roadmapSlug: string) => {
    try {
      setIsLoading(true);
      const res = await enrollInRoadmap(roadmapSlug);
      setActiveRoadmap(res.roadmap);
      setProgress(res.progress);
      setActiveTab('curriculum');
      setToastMessage(`Switched track to: ${res.roadmap.title}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Enrollment switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;
    if (!selectedTopics.includes(trimmed)) {
      setSelectedTopics([...selectedTopics, trimmed]);
    }
    setCustomTopicInput('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topicToRemove));
  };

  const handleAddSuggestedTopic = (topic: string) => {
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await generateCustomRoadmap({
        role: targetRole,
        targetCompany,
        weeks: weeksCount,
        dailyHours,
        weakTopics: selectedTopics,
        customTopics: selectedTopics,
      });

      // Immediately activate new roadmap in state
      setActiveRoadmap(res.roadmap);
      setProgress(res.progress);
      setAllRoadmaps((prev) => [
        res.roadmap,
        ...prev.filter((r) => r.slug !== res.roadmap.slug),
      ]);
      setShowAiModal(false);
      setActiveTab('curriculum');

      // Expand all weeks so the user sees all days
      setExpandedWeeks({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });

      setAiSuccessBanner(
        `✨ Success! Your full ${res.roadmap.durationDays}-Day AI Placement Roadmap for ${targetCompany} is active and ready below.`
      );
      setToastMessage(`✨ Loaded ${res.roadmap.durationDays}-Day AI Roadmap for ${targetCompany}!`);
      setTimeout(() => setToastMessage(null), 4000);

      // Smooth scroll to curriculum
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error('Custom roadmap generation failed:', err);
      alert('Could not generate custom roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleWeekAccordion = (weekNumber: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNumber]: !prev[weekNumber],
    }));
  };

  const handleExpandAll = () => {
    if (!activeRoadmap) return;
    const allExpanded: Record<number, boolean> = {};
    activeRoadmap.weeks.forEach((w) => {
      allExpanded[w.weekNumber] = true;
    });
    setExpandedWeeks(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedWeeks({});
  };

  const handleOpenConcept = async (
    task: RoadmapTask,
    day: { dayNumber: number; title: string; focusArea: string }
  ) => {
    setConceptTask(task);
    setConceptDay(day);
    setShowConceptModal(true);
    setIsLoadingConcept(true);
    setConceptDetails(null);
    setHasCopiedCode(false);

    try {
      const data = await explainConceptWithAI({
        topic: task.title,
        focusArea: day.focusArea || day.title,
        description: task.description,
        role: activeRoadmap?.role || 'Software Engineer',
      });
      setConceptDetails(data);
    } catch (err) {
      console.warn('Concept load fallback:', err);
      setConceptDetails({
        topic: task.title,
        focusArea: day.focusArea || 'Placement Topic',
        summary: task.description,
        keyConcepts: [
          {
            title: 'Core Fundamentals',
            description: task.description,
          },
          ...(task.keyTakeaways || []).map((tip, idx) => ({
            title: `Key Takeaway ${idx + 1}`,
            description: tip,
          })),
        ],
        interviewQuestions: [
          {
            question: `Explain the fundamental concept and edge cases of "${task.title}".`,
            answer: `In campus and MNC interviews, state the definition clearly, articulate time/space complexity invariants, and demonstrate how you handle boundary/empty conditions.`,
          },
        ],
        pitfalls: ['Overlooking edge cases and empty inputs.', 'Missing time complexity trade-offs.'],
        bestPractices: ['Always state your invariants clearly.', 'Write modular code.'],
      });
    } finally {
      setIsLoadingConcept(false);
    }
  };

  const handleCopyConceptCode = () => {
    if (conceptDetails?.codeSnippet?.code) {
      navigator.clipboard.writeText(conceptDetails.codeSnippet.code);
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
    }
  };

  const getTaskBadge = (type: RoadmapTask['type']) => {
    switch (type) {
      case 'problem':
        return <Badge variant="success" size="sm">Code Challenge</Badge>;
      case 'interview':
        return <Badge variant="purple" size="sm">AI Mock Round</Badge>;
      case 'question':
        return <Badge variant="warning" size="sm">Interview Q&A</Badge>;
      case 'concept':
      default:
        return <Badge variant="brand" size="sm">Core Theory</Badge>;
    }
  };

  const getTaskActionLabel = (type: RoadmapTask['type']) => {
    switch (type) {
      case 'problem':
        return 'Practice Code →';
      case 'interview':
        return 'Start Mock →';
      case 'question':
        return 'Review Q&A →';
      default:
        return 'Read Concept →';
    }
  };

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-emerald-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-500" />;
      case 'Target':
        return <Target className="w-5 h-5 text-rose-500" />;
      case 'Layers':
      default:
        return <Layers className="w-5 h-5 text-brand-500" />;
    }
  };

  const completedSet = new Set(progress?.completedTasks || []);
  const completionPercentage = progress?.progressPercentage ?? 0;
  const completedCount = progress?.completedCount ?? 0;
  const totalTasks = activeRoadmap?.totalTasks || 60;
  const totalDays = activeRoadmap?.durationDays || 30;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-400 dark:text-brand-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI Roadmap Success Banner */}
      {aiSuccessBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                AI Roadmap Active & Loaded
              </p>
              <p className="text-sm font-semibold">{aiSuccessBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setAiSuccessBanner(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Roadmap Hero Card - Responsive to Light & Dark Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-slate-900 dark:via-brand-950 dark:to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Top Switcher & Active Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
                <Compass className="w-3.5 h-3.5 animate-spin" />
                <span>Active Track: {totalDays}-Day Sprint</span>
              </div>

              {activeRoadmap?.isCustom && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Tailored
                </span>
              )}

              {/* Direct Track Switcher Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <span>Switch:</span>
                <select
                  value={activeRoadmap?.slug || ''}
                  onChange={(e) => handleSwitchRoadmap(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {allRoadmaps.map((r) => (
                    <option key={r.slug} value={r.slug} className="bg-slate-900 text-white">
                      {r.title} ({r.durationDays} Days)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeRoadmap?.title || '30-Day Placement Sprint'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeRoadmap?.description ||
                'Milestone-based preparation plan engineered for campus placements and technical interview rounds.'}
            </p>

            {activeRoadmap?.targetCompanies && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-medium">Target Recruiters:</span>
                {activeRoadmap.targetCompanies.map((comp) => (
                  <span
                    key={comp}
                    className="px-2.5 py-0.5 rounded-md bg-white/10 text-white font-medium text-[11px] border border-white/10"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress & Stat Pill */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex-shrink-0">
            {/* Circular Progress Indicator */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold">{completionPercentage}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Done</span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div>
                <p className="text-xs text-slate-400">Total Curriculum Tasks</p>
                <p className="text-sm font-bold">
                  {completedCount} <span className="text-slate-400 font-normal">/ {totalTasks} Completed</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs pt-1 border-t border-white/10">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5" /> 7 Day Streak
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Award className="w-3.5 h-3.5" /> +{completedCount * 35} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher & AI Generator Button */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'curriculum'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Curriculum ({totalDays} Days • {activeRoadmap?.weeks?.length || 4} Weeks)
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Placement Tracks ({allRoadmaps.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAiModal(true)}
              className="border-white/20 text-white hover:bg-white/10 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Generate AI Custom Roadmap</span>
            </Button>
          </div>
        </div>
      </div>

      {/* TAB 1: CURRICULUM VIEW (SHOWING ALL 30 DAYS) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Header Controls with Expand/Collapse All */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Full Day-by-Day Placement Curriculum (All {totalDays} Days)
                </h2>
                <p className="text-xs text-slate-500">
                  Every day has specific practice problems, interview questions, and placement checkpoints.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExpandAll}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline px-2.5 py-1"
              >
                Expand All Weeks
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={handleCollapseAll}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1"
              >
                Collapse All
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {activeRoadmap?.weeks.map((week) => {
                const isExpanded = expandedWeeks[week.weekNumber] ?? false;
                const weekTasks = week.days.flatMap((d) => d.tasks);
                const weekCompleted = weekTasks.filter((t) => completedSet.has(t.id)).length;
                const isWeekFullyDone = weekTasks.length > 0 && weekCompleted === weekTasks.length;

                return (
                  <div
                    key={week.weekNumber}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all"
                  >
                    {/* Week Accordion Header */}
                    <div
                      onClick={() => toggleWeekAccordion(week.weekNumber)}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            Week {week.weekNumber} ({week.days.length} Days)
                          </span>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {week.title}
                          </h3>
                          {isWeekFullyDone && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {week.milestoneObjective}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {weekCompleted} / {weekTasks.length} Tasks
                          </p>
                          <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Week Days & Tasks Container */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 divide-y divide-slate-100 dark:divide-slate-800/60 space-y-5">
                        {week.days.map((day) => (
                          <div key={day.dayNumber} className="space-y-3 pt-5 first:pt-4">
                            <div className="flex items-center justify-between pb-1">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold font-mono">
                                  {day.dayNumber}
                                </span>
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                  Day {day.dayNumber}: {day.title}
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" /> ~{day.estimatedMinutes} mins
                              </span>
                            </div>

                            {/* Task List */}
                            <div className="grid grid-cols-1 gap-2.5">
                              {day.tasks.map((task) => {
                                const isDone = completedSet.has(task.id);
                                return (
                                  <div
                                    key={task.id}
                                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      isDone
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                                        : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-800'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={() => handleToggleTask(task)}
                                        className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                                      >
                                        {isDone ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-brand-500" />
                                        )}
                                      </button>

                                      <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          {getTaskBadge(task.type)}
                                          <span
                                            className={`font-semibold text-xs ${
                                              isDone
                                                ? 'line-through text-slate-400 dark:text-slate-500'
                                                : 'text-slate-900 dark:text-white'
                                            }`}
                                          >
                                            {task.title}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {task.description}
                                        </p>
                                        {task.keyTakeaways && task.keyTakeaways.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {task.keyTakeaways.map((tip, i) => (
                                              <span
                                                key={i}
                                                className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded"
                                              >
                                                💡 {tip}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Button & XP Reward */}
                                    <div className="flex items-center gap-3 sm:self-center self-end flex-shrink-0">
                                      <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                                        +{task.xpReward} XP
                                      </span>

                                      {task.type === 'concept' ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                                          onClick={() => handleOpenConcept(task, day)}
                                        >
                                          <BookOpen className="w-3.5 h-3.5 mr-1 text-brand-500" />
                                          Read Concept →
                                        </Button>
                                      ) : task.type === 'problem' ? (
                                        <Link
                                          onClick={() => window.scrollTo(0, 0)}
                                          to={`/practice-sandbox?taskId=${task.id}&title=${encodeURIComponent(
                                            task.title
                                          )}&focus=${encodeURIComponent(
                                            day.focusArea || day.title
                                          )}&desc=${encodeURIComponent(
                                            task.description
                                          )}&roadmap=${activeRoadmap?.slug || 'full-stack-30'}`}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                          >
                                            <Code2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                            Practice Code →
                                          </Button>
                                        </Link>
                                      ) : task.type === 'interview' ? (
                                        <Link to="/chat">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                                          >
                                            <Bot className="w-3.5 h-3.5 mr-1 text-purple-500" />
                                            Ask Mentor →
                                          </Button>
                                        </Link>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                          onClick={() => handleOpenConcept(task, day)}
                                        >
                                          <FileCheck2 className="w-3.5 h-3.5 mr-1 text-blue-500" />
                                          Review Q&A →
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Available Placement Tracks & Fast-Track Sprints
              </h2>
              <p className="text-xs text-slate-500">
                Enroll in a pre-built 30-day curriculum or generate an AI custom roadmap tailored to your dream company.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allRoadmaps.map((r) => {
              const isActive = activeRoadmap?.slug === r.slug;
              return (
                <div
                  key={r.slug}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    isActive
                      ? 'bg-brand-50/20 dark:bg-brand-950/20 border-brand-500 dark:border-brand-500 shadow-md ring-2 ring-brand-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                        {getRoleIcon(r.icon)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {r.isCustom && (
                          <Badge variant="purple" size="sm">
                            <Sparkles className="w-3 h-3 mr-0.5" /> AI Custom
                          </Badge>
                        )}
                        <Badge variant={isActive ? 'brand' : 'outline'} size="sm">
                          {isActive ? 'Active Track' : `${r.durationDays} Days`}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {r.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                        {r.description}
                      </p>
                    </div>

                    {r.targetCompanies && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {r.targetCompanies.slice(0, 4).map((c) => (
                          <span
                            key={c}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      <span className="font-bold text-slate-900 dark:text-white">{r.totalTasks || 60}</span> Tasks •{' '}
                      <span className="font-bold text-amber-500">+{r.totalXp || 2200} XP</span>
                    </div>

                    {isActive ? (
                      <Button size="sm" variant="ghost" disabled className="text-brand-600 dark:text-brand-400 font-bold">
                        <Check className="w-4 h-4 mr-1" /> Enrolled
                      </Button>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => handleSwitchRoadmap(r.slug)}>
                        Enroll Track
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Custom Roadmap Generator Modal */}
      <Modal
        isOpen={showAiModal}
        onClose={() => !isGenerating && setShowAiModal(false)}
        title="AI-Powered Personalized Placement Roadmap Generator"
        maxWidth="2xl"
      >
        <form onSubmit={handleGenerateCustom} className="space-y-5 py-2 max-h-[80vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Google Gemini analyzes your dream company's recruitment rubrics and generates a comprehensive, day-by-day curriculum targeting your exact interested topics.
          </p>

          {/* Company Selector & Popular Shortcuts */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-500" />
              Target Recruiter / Dream Company
            </label>
            <input
              type="text"
              required
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, Microsoft, TCS Digital, Atlassian, Uber, Flipkart"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick Pick:</span>
              {popularCompanies.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setTargetCompany(c)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full transition-colors ${
                    targetCompany.toLowerCase() === c.toLowerCase()
                      ? 'bg-brand-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic AI Company Intelligence Card */}
          {companyInsight && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50/60 to-indigo-50/60 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  What {companyInsight.company} Recruiter Focuses On in 2025/2026:
                </span>
                <Badge variant="purple" size="sm">{companyInsight.difficulty} Difficulty</Badge>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {companyInsight.focusSummary}
              </p>

              {/* Trending Topics Pills to 1-Click Add */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending High-Frequency Topics for {companyInsight.company} (Click to Add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {companyInsight.trendingTopics.map((topic) => {
                    const isAdded = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => handleAddSuggestedTopic(topic)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          isAdded
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3 text-brand-500" />}
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* User's Custom Interested Topics Inserter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Your Selected & Interested Topics ({selectedTopics.length})
            </label>
            <p className="text-[11px] text-slate-500">
              Type any specific topic you want to master, or pick from the trending suggestions above.
            </p>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTopic(e);
                  }
                }}
                placeholder="Insert your custom topic (e.g. Redis Caching, Next.js App Router, Segment Trees)..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddCustomTopic}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>

            {/* Selected Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                >
                  <span>{topic}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(topic)}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Role & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="SDE / Software Engineer">SDE / Software Engineer</option>
                <option value="Frontend Specialist">Frontend Specialist</option>
                <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                <option value="Core CS Campus Placement">Core CS Campus Placement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sprint Duration
              </label>
              <select
                value={weeksCount}
                onChange={(e) => setWeeksCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={4}>4 Weeks (Complete 30-Day Placement Plan) - Recommended</option>
                <option value={2}>2 Weeks (14-Day Fast-Track Sprint)</option>
                <option value={6}>6 Weeks (42-Day Deep Comprehensive Master)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daily Study Hours Available: <span className="text-brand-600 dark:text-brand-400 font-extrabold">{dailyHours} hours/day</span>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isGenerating}
              onClick={() => setShowAiModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isGenerating || selectedTopics.length === 0}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Full {weeksCount === 4 ? '30-Day' : `${weeksCount * 7}-Day`} Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Full {weeksCount === 4 ? '30-Day' : `${weeksCount * 7}-Day`} AI Roadmap</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Concept Deep-Dive Reader Modal */}
      <Modal
        isOpen={showConceptModal}
        onClose={() => setShowConceptModal(false)}
        title={conceptTask?.title || 'Concept Deep Dive & Interview Notes'}
        maxWidth="2xl"
      >
        <div className="space-y-5 py-2 max-h-[80vh] overflow-y-auto pr-1">
          {/* Subheader with topic badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {conceptDay && (
                <Badge variant="brand" size="sm">
                  Day {conceptDay.dayNumber}
                </Badge>
              )}
              {conceptDay?.focusArea && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {conceptDay.focusArea}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                +{conceptTask?.xpReward || 30} XP
              </span>
            </div>
          </div>

          {isLoadingConcept ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Synthesizing Comprehensive Concept Notes...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Preparing core theory, code implementation, and campus interview questions.
                </p>
              </div>
            </div>
          ) : conceptDetails ? (
            <div className="space-y-5">
              {/* 1. Summary & Core Intuition */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50/60 to-indigo-50/60 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200/70 dark:border-brand-900/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Concept Overview & Hiring Intuition
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {conceptDetails.summary}
                </p>
              </div>

              {/* 2. Key Architecture & Working Principles */}
              {conceptDetails.keyConcepts && conceptDetails.keyConcepts.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Key Architectural & Engineering Principles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {conceptDetails.keyConcepts.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{item.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Illustrative Code Implementation */}
              {conceptDetails.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                      Illustrative Implementation ({conceptDetails.codeSnippet.language})
                    </h4>
                    <button
                      onClick={handleCopyConceptCode}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 transition-colors"
                    >
                      {hasCopiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre border border-slate-800">
                    {conceptDetails.codeSnippet.code}
                  </pre>
                  {conceptDetails.codeSnippet.explanation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      💡 <strong>Walkthrough:</strong> {conceptDetails.codeSnippet.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* 4. Campus / MNC Technical Interview Q&A */}
              {conceptDetails.interviewQuestions && conceptDetails.interviewQuestions.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Top Campus & MNC Interview Questions & Model Answers
                  </h4>
                  <div className="space-y-3">
                    {conceptDetails.interviewQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-1.5"
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-start gap-1.5">
                          <span className="text-purple-600 dark:text-purple-400">Q{idx + 1}:</span>
                          <span>{q.question}</span>
                        </p>
                        <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/30 leading-relaxed font-sans">
                          <span className="font-semibold text-purple-700 dark:text-purple-300 block mb-0.5">
                            Model Answer:
                          </span>
                          {q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Traps, Pitfalls & Best Practices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Pitfalls */}
                {conceptDetails.pitfalls && conceptDetails.pitfalls.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Interviewer Traps & Common Pitfalls
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {conceptDetails.pitfalls.map((pitfall, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                          <span>{pitfall}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Best Practices */}
                {conceptDetails.bestPractices && conceptDetails.bestPractices.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Placement Best Practices
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {conceptDetails.bestPractices.map((practice, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Modal Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {conceptTask && (
              <div className="flex items-center gap-2">
                <Link
                  onClick={() => {
                    setShowConceptModal(false);
                    window.scrollTo(0, 0);
                  }}
                  to={`/practice-sandbox?taskId=${conceptTask.id}&title=${encodeURIComponent(
                    conceptTask.title
                  )}&focus=${encodeURIComponent(
                    conceptDay?.focusArea || conceptDay?.title || ''
                  )}&desc=${encodeURIComponent(
                    conceptTask.description
                  )}&roadmap=${activeRoadmap?.slug || 'full-stack-30'}`}
                >
                  <Button
                    size="sm"
                    variant="primary"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Practice in Coding Sandbox →</span>
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    if (conceptTask) {
                      handleToggleTask(conceptTask);
                      setShowConceptModal(false);
                    }
                  }}
                >
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Mark Learned (+{conceptTask.xpReward} XP)
                </Button>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConceptModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoadmapPage;
