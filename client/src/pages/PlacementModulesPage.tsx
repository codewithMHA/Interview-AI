import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Code2,
  Cpu,
  MessageSquare,
  Compass,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building,
  Lightbulb,
  AlertTriangle,
  Flame,
  ArrowRight,
  BookOpen,
  Award,
  Database,
  Network,
  Play,
  Pause,
  Layers,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  fetchPlacementModules,
  fetchPlacementModuleById,
  PlacementModule,
  ModuleItem,
  VisualDiagramAnimation
} from '@/services/placementModuleService';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot: Bot,
  Code2: Code2,
  Cpu: Cpu,
  MessageSquare: MessageSquare,
  Compass: Compass,
  Database: Database,
  Network: Network,
};

// =========================================================================
// SUBCOMPONENT: INTERACTIVE ANIMATED CONCEPT STEPPER
// =========================================================================
const VisualDiagramStepper: React.FC<{ animation: VisualDiagramAnimation }> = ({ animation }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const steps = animation.steps;
  const currentStep = steps[activeStepIndex] || steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3.5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
              Interactive Concept Animation
            </span>
            <h5 className="text-sm font-semibold text-slate-100">{animation.title}</h5>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play Flow'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStepIndex(0);
            }}
            title="Restart flow"
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{animation.description}</p>

      {/* Step Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {steps.map((st, idx) => {
          const isActive = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;
          return (
            <button
              key={st.step}
              onClick={() => {
                setIsPlaying(false);
                setActiveStepIndex(idx);
              }}
              className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md ring-2 ring-brand-400/50 scale-105'
                  : isPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}
            >
              <span className="font-bold">#{st.step}</span>
              <span className="hidden sm:inline font-normal opacity-90 truncate max-w-[120px]">{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/30 text-brand-300 border border-brand-500/30">
              Step {currentStep.step} of {steps.length}
            </span>
            <span className="text-xs font-bold text-slate-200">{currentStep.label}</span>
          </div>
          {currentStep.badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {currentStep.badge}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-mono">
          {currentStep.visualDesc}
        </p>

        {/* Stepper Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            disabled={activeStepIndex === 0}
            onClick={() => {
              setIsPlaying(false);
              setActiveStepIndex((prev) => Math.max(0, prev - 1));
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="text-[11px] text-slate-400">
            {activeStepIndex + 1} / {steps.length}
          </span>
          <button
            disabled={activeStepIndex === steps.length - 1}
            onClick={() => {
              setIsPlaying(false);
              setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white flex items-center gap-1 transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================
export const PlacementModulesPage: React.FC = () => {
  const [modules, setModules] = useState<PlacementModule[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>('ai-mock-interviews');
  const [activeModule, setActiveModule] = useState<PlacementModule | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(true);
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set(['mock-1', 'dsa-1', 'opt-1', 'hr-1', 'dbms-1', 'net-1', 'roadmap-week-1']));
  const detailSectionRef = useRef<HTMLDivElement>(null);

  const scrollToDetailSection = () => {
    setTimeout(() => {
      if (detailSectionRef.current) {
        const yOffset = -80;
        const y = detailSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 70);
  };

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    scrollToDetailSection();
  };
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('interviewai_mastered_modules');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Load module overview list
  useEffect(() => {
    const loadModules = async () => {
      setIsLoadingList(true);
      try {
        const data = await fetchPlacementModules();
        setModules(data);
        if (data.length > 0 && !activeModuleId) {
          setActiveModuleId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load placement modules:', err);
      } finally {
        setIsLoadingList(false);
      }
    };
    loadModules();
  }, []);

  // Load detailed active module
  useEffect(() => {
    if (!activeModuleId) return;
    const loadDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const detail = await fetchPlacementModuleById(activeModuleId);
        setActiveModule(detail);
      } catch (err) {
        console.error('Failed to load module details:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    loadDetail();
  }, [activeModuleId]);

  const toggleExpand = (id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('interviewai_mastered_modules', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <Badge variant="success" size="sm">Easy</Badge>;
      case 'Medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'Hard':
        return <Badge variant="danger" size="sm">Hard</Badge>;
      default:
        return <Badge size="sm">{difficulty}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Hero Banner - Responsive to Light & Dark Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> High-Impact Placement Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Placement Modules Master Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            In-depth placement-level questions, model solutions, architectural blueprints, interactive animated concept flows, and HR STAR scripts calibrated for Tier-1 on-campus recruitment.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            <p className="text-xs text-slate-300">Mastered Concepts</p>
            <p className="text-sm font-bold text-emerald-400">{masteredIds.size} Completed</p>
          </div>
        </div>
      </div>

      {/* 7 PLACEMENT MODULE SELECTION CARDS ON TOP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            Core Placement Modules (Select to Practice)
          </h2>
          <span className="text-xs text-slate-400">{modules.length || 7} Specialized Placement Streams</span>
        </div>

        {isLoadingList ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3.5">
            {modules.map((mod) => {
              const Icon = MODULE_ICONS[mod.iconName] || BookOpen;
              const isSelected = activeModuleId === mod.id;

              return (
                <div
                  key={mod.id}
                  onClick={() => handleSelectModule(mod.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 dark:border-brand-500 shadow-md -translate-y-0.5'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${mod.gradient} text-white flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant={isSelected ? 'purple' : 'outline'} size="sm">
                        {mod.badge}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {mod.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {mod.itemsCount ? `${mod.itemsCount} Questions` : ''}
                    </span>
                    <span className={`font-semibold flex items-center gap-0.5 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-brand-600'}`}>
                      {isSelected ? 'Viewing ↓' : 'Open →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIVE MODULE DETAILED CONTENT */}
      <div ref={detailSectionRef} id="module-content-feed" className="scroll-mt-20">
        {isLoadingDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : activeModule ? (
          <div className="space-y-6">
            {/* Module Banner Description */}
            <div className="p-5 rounded-xl border border-brand-200 dark:border-brand-900/40 bg-brand-50/30 dark:bg-brand-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeModule.title}
                  </h3>
                  <Badge variant="purple">{activeModule.badge}</Badge>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="ml-auto text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 font-medium transition-colors"
                    title="Back to Top / Modules Grid"
                  >
                    <ChevronUp className="w-3.5 h-3.5" /> Modules Grid
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {activeModule.description}
                </p>
              </div>
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5 shrink-0">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{activeModule.importanceRating}</span>
              </div>
              {(activeModule.id === 'ai-mock-interviews' || activeModule.id === 'hr-behavioral-evaluator') && (
                <Link to="/chat">
                  <Button size="sm" variant="primary" leftIcon={<Bot className="w-3.5 h-3.5" />}>
                    Consult AI Mentor
                  </Button>
                </Link>
              )}
              {(activeModule.id === 'dsa-coding-sandbox' || activeModule.id === 'code-complexity-optimization') && (
                <Link to="/coding">
                  <Button size="sm" variant="primary" leftIcon={<Code2 className="w-3.5 h-3.5" />}>
                    Open Coding Workspace
                  </Button>
                </Link>
              )}
              {(activeModule.id === 'dbms-os-core' || activeModule.id === 'computer-networks-system-design') && (
                <Link to="/questions">
                  <Button size="sm" variant="primary" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                    Browse CSE Question Bank
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Placement Questions Feed for Selected Module */}
          <div className="space-y-4">
            {activeModule.items?.map((item, idx) => {
              const isExpanded = expandedItemIds.has(item.id);
              const isMastered = masteredIds.has(item.id);

              return (
                <Card
                  key={item.id}
                  className={`border transition-all ${
                    isMastered
                      ? 'border-emerald-500/40 bg-emerald-500/[0.02] dark:border-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Top Row: Category, Difficulty, Tags, and Mastered Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" size="sm">{item.category}</Badge>
                        {getDifficultyBadge(item.difficulty)}
                        <span className="text-xs text-slate-400 font-mono">Q#{idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMastered(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isMastered
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isMastered ? 'Mastered' : 'Mark as Mastered (+20 XP)'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Title & Prompt */}
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        "{item.questionPrompt}"
                      </p>
                    </div>

                    {/* Concept Summary & Company Tags */}
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <strong className="text-slate-800 dark:text-slate-200">Concept Tested: </strong>
                        {item.conceptSummary}
                      </p>

                      {item.companyTags && item.companyTags.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>Asked at:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.companyTags.map((comp) => (
                              <span
                                key={comp}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion Toggle */}
                    <div className="pt-2">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <span>{isExpanded ? 'Hide Detailed Solution & Rubric' : 'View Verified Model Answer, Architecture & Senior Rubric'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-slide-up">
                        {/* Interactive Concept Visual Animation (if available) */}
                        {item.visualDiagramAnimation && (
                          <VisualDiagramStepper animation={item.visualDiagramAnimation} />
                        )}

                        {/* Verified Model Answer */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Placement Model Answer
                          </span>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                            {item.detailedAnswer}
                          </div>
                        </div>

                        {/* Code Snippet (if available) */}
                        {item.codeSnippet && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                                Optimal Code Template ({item.codeSnippet.language})
                              </span>
                            </div>
                            <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                              <pre>{item.codeSnippet.code}</pre>
                            </div>
                          </div>
                        )}

                        {/* Complexity Analysis (if available) */}
                        {item.complexityAnalysis && (
                          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 space-y-1">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5" /> Time & Space Complexity Proof
                            </span>
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <span>Time: {item.complexityAnalysis.time}</span>
                              <span>Space: {item.complexityAnalysis.space}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                              {item.complexityAnalysis.explanation}
                            </p>
                          </div>
                        )}

                        {/* Senior Interviewer Rubrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                          {/* What interviewers look for */}
                          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" /> What Interviewers Look For
                            </span>
                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                              {item.interviewerRubric.whatInterviewersLookFor.map((tip, idx) => (
                                <li key={idx} className="leading-relaxed">{tip}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Common mistakes */}
                          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Common Traps & Red Flags
                            </span>
                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                              {item.interviewerRubric.commonMistakes.map((mistake, idx) => (
                                <li key={idx} className="leading-relaxed">{mistake}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Follow up questions */}
                        {item.interviewerRubric.followUpQuestions && item.interviewerRubric.followUpQuestions.length > 0 && (
                          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-brand-600 dark:text-brand-400">
                              Interviewer Follow-Up Probes:
                            </span>
                            <ul className="mt-1 list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                              {item.interviewerRubric.followUpQuestions.map((q, idx) => (
                                <li key={idx}>"{q}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Module Navigation */}
          <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Viewing all <strong>{activeModule.items?.length || 0} questions</strong> in {activeModule.title}.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              leftIcon={<ChevronUp className="w-4 h-4" />}
            >
              Back to Top / Select Another Module
            </Button>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
};
