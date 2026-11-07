import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Flame,
  Code2,
  Zap,
  Compass,
  Sparkles,
  Bot,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  BrainCircuit,
  BarChart3,
  RefreshCw,
  Terminal,
  Target,
  Database,
  Cpu,
  Network,
  AlertTriangle,
  Building2,
  Briefcase,
  Activity,
  Check,
  Lightbulb
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  fetchAnalyticsDashboard,
  AnalyticsDashboardData,
  BadgeItem
} from '@/services/analyticsService';
import { InterviewStreakCalendar } from '@/components/common/LeetCodeStreakCalendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    try {
      await login('student@demo.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchAnalyticsDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load analytics dashboard:', err);
      setErrorMessage(
        err?.response?.data?.error || 'Failed to load your placement analytics dashboard.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond':
        return 'border-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-500';
      case 'platinum':
        return 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-500';
      case 'gold':
        return 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 text-amber-500';
      case 'silver':
        return 'border-slate-300 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400';
      case 'bronze':
      default:
        return 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/30 text-orange-500';
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 3:
        return 'bg-brand-600 dark:bg-brand-500 text-white';
      case 2:
        return 'bg-brand-400 dark:bg-brand-600 text-white';
      case 1:
        return 'bg-brand-200 dark:bg-brand-900 text-brand-900 dark:text-brand-200';
      case 0:
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500';
    }
  };

  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-4 h-4 text-cyan-500" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-emerald-500" />;
      case 'Network':
        return <Network className="w-4 h-4 text-purple-500" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'Code2':
      default:
        return <Code2 className="w-4 h-4 text-brand-500" />;
    }
  };

  const getCompanyStatusBadge = (status: string) => {
    switch (status) {
      case 'High Probability':
        return (
          <Badge variant="success" size="sm">
            High Probability
          </Badge>
        );
      case 'Competitive':
        return (
          <Badge variant="purple" size="sm">
            Competitive
          </Badge>
        );
      case 'Building Profile':
        return (
          <Badge variant="warning" size="sm">
            Building Profile
          </Badge>
        );
      case 'Needs Preparation':
      default:
        return (
          <Badge variant="outline" size="sm" className="text-slate-400 border-slate-700">
            Needs Preparation
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Could Not Load Placement Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {errorMessage ||
            'Something went wrong while retrieving your analytics profile. Please check your connection and try again.'}
        </p>
        <div className="pt-2">
          <Button onClick={loadAnalytics} variant="primary" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry Loading Analytics
          </Button>
        </div>
      </div>
    );
  }

  const {
    placementReadinessScore,
    readinessTier,
    targetRole,
    streak,
    bestStreak = data.streak,
    activityMap = {},
    annualHeatmap = [],
    xpPoints,
    level,
    nextLevelXp,
    xpToNextLevel,
    levelPercentage,
    metrics,
    codingPerformance,
    mockInterviewEvaluation,
    coreCSTracks,
    weeklyProgress,
    weakAreas,
    companyReadiness,
    categoryScores,
    topicMastery,
    skillBreakdown,
    interviewerFeedback,
    heatmap,
    badges,
    recentActivities,
  } = data;

  const problemsTarget = metrics.problemsTarget || 20;
  const interviewsTarget = metrics.interviewsTarget || 5;
  const roadmapTarget = metrics.roadmapTasksTarget || 25;

  const problemsPercentage = Math.min(
    100,
    Math.round((metrics.problemsSolved / problemsTarget) * 100)
  );
  const interviewsPercentage = Math.min(
    100,
    Math.round((metrics.interviewsCompleted / interviewsTarget) * 100)
  );
  const roadmapPercentage = Math.min(
    100,
    Math.round((metrics.roadmapTasksCompleted / roadmapTarget) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Hero Banner - Responsive to Light & Dark Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-950 dark:via-slate-900 dark:to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Placement Intelligence & Activity Tracking Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dynamic Placement Analytics & Evaluation
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Real-time multi-dimensional scoring calibrated strictly to your database activity across{' '}
              <span className="text-brand-400 font-bold">{targetRole || 'Software Engineering'}</span> hiring bars.
            </p>
          </div>

          {/* Gamification Level & XP Progress Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex-shrink-0">
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-extrabold">
                  {level}
                </span>
                <span className="text-sm font-extrabold text-white">{xpPoints} XP</span>
              </div>

              <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-brand-500 to-indigo-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelPercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 pt-0.5">
                {xpToNextLevel} XP needed for Level {level + 1}
              </p>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Streak</p>
                <p className="text-base font-extrabold text-white">{streak} Days 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic Placement Readiness */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Placement Readiness
              </p>
              <Badge variant="purple" size="sm">Dynamic</Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {placementReadinessScore}%
              </span>
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {readinessTier || 'Active'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${placementReadinessScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coding Challenges Solved */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Coding Solved
              </p>
              <span className="text-[11px] font-bold text-emerald-500">
                {codingPerformance?.accuracyRate ?? 0}% Acc
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {metrics.problemsSolved}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ {problemsTarget} Target</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${problemsPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Mock Interviews */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mock Rounds
              </p>
              <span className="text-[11px] font-bold text-purple-500">
                {mockInterviewEvaluation?.evaluatedAvg ?? 0}% Avg
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {metrics.interviewsCompleted}
              </span>
              <span className="text-xs text-purple-500 font-semibold">/ {interviewsTarget} Target</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${interviewsPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Core CS & Roadmap */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Core CS & Tasks
              </p>
              <span className="text-[11px] font-bold text-amber-500">
                {metrics.questionsBankCompleted ?? 0} Qs Bank
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {metrics.roadmapTasksCompleted}
              </span>
              <span className="text-xs text-amber-500 font-semibold">/ {roadmapTarget} Finished</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${roadmapPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Placement Readiness Calculation Transparency Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Dynamic Score Engine
                <Badge variant="purple" size="sm">100% Genuine Activity</Badge>
              </h3>
              <p className="text-xs text-slate-400">
                Evaluated in real-time from your actual database submissions, STAR mock rubrics, and curriculum tasks.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-brand-300 bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-800/40">
            Total Score: {placementReadinessScore}% / 100%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Pillar 1: Coding (35%) */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> 1. Coding & Accuracy (35%)
              </span>
              <span className="font-bold text-emerald-300">
                {codingPerformance?.weightedCodingScore ?? data.readinessBreakdown?.codeScore ?? 0} / 35 Pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Based on Easy ({codingPerformance?.easySolved ?? 0}), Med ({codingPerformance?.mediumSolved ?? 0}), Hard ({codingPerformance?.hardSolved ?? 0}) with <strong>{codingPerformance?.accuracyRate ?? 0}%</strong> submission accuracy.
            </p>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (((codingPerformance?.weightedCodingScore ?? data.readinessBreakdown?.codeScore ?? 0) / 35) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Pillar 2: Mock Interviews (35%) */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> 2. AI Mock Interview Skills (35%)
              </span>
              <span className="font-bold text-purple-300">
                {mockInterviewEvaluation?.weightedInterviewScore ?? data.readinessBreakdown?.interviewScore ?? 0} / 35 Pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {metrics.interviewsCompleted > 0
                ? `Evaluates technical depth (${mockInterviewEvaluation?.technicalDepthScore ?? 0}%), correctness (${mockInterviewEvaluation?.problemSolvingScore ?? 0}%), and articulation (${mockInterviewEvaluation?.communicationScore ?? 0}%).`
                : 'Complete an AI Mock Interview round to unlock up to 35 pts with STAR evaluation.'}
            </p>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (((mockInterviewEvaluation?.weightedInterviewScore ?? data.readinessBreakdown?.interviewScore ?? 0) / 35) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Pillar 3: Roadmap & Question Bank (30%) */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> 3. Core CS & Roadmap (30%)
              </span>
              <span className="font-bold text-amber-300">
                {data.readinessBreakdown?.roadmapScore ?? 0} / 30 Pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Earned across 5 Core CS tracks (DSA, DBMS, OS, CN, OOPs) from <strong>{metrics.roadmapTasksCompleted}</strong> roadmap tasks and <strong>{metrics.questionsBankCompleted ?? 0}</strong> theory topics.
            </p>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (((data.readinessBreakdown?.roadmapScore ?? 0) / 30) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Weekly Progress Improvement Chart (Point 5) */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Weekly Progress & Growth Trajectory
              </CardTitle>
              <CardDescription className="text-xs">
                Candidate growth tracked across the last 4 weeks showing placement readiness compounding over time.
              </CardDescription>
            </div>
            <Badge variant="success" size="sm">
              Continuous Improvement
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {weeklyProgress && weeklyProgress.length > 0 ? (
            <div className="space-y-4">
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyProgress} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="weekLabel"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(val: any, name: string) => {
                        if (name === 'readinessScore') return [`${val}%`, 'Placement Readiness'];
                        return [val, name];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="readinessScore"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#readinessGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Stats Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {weeklyProgress.map((wp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1"
                  >
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {wp.weekLabel}
                    </p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {wp.readinessScore}%
                    </p>
                    <p className="text-[10px] text-slate-400">
                      +{wp.problemsSolved} Code · +{wp.mockInterviews} Mocks
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              Weekly improvement graph will populate automatically as you practice.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 5. Coding Performance & Mock Interview Evaluation Cards Row (Points 2 & 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coding Performance Breakdown Card */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  Coding Performance & Difficulty Tiers
                </CardTitle>
                <CardDescription className="text-xs">
                  Not just raw counts: evaluated by difficulty weightings, accuracy rate, and edge case resilience.
                </CardDescription>
              </div>
              <Badge variant="success" size="sm">
                Accuracy: {codingPerformance?.accuracyRate ?? 0}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Difficulty breakdown pills */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                  Easy (1.5x)
                </span>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {codingPerformance?.easySolved ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block">Solved</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                  Medium (2.8x)
                </span>
                <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300">
                  {codingPerformance?.mediumSolved ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block">Solved</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
                  Hard (4.5x)
                </span>
                <span className="text-xl font-extrabold text-rose-700 dark:text-rose-300">
                  {codingPerformance?.hardSolved ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block">Solved</span>
              </div>
            </div>

            {/* Accuracy & Submissions Meter */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Submission Accuracy Rate
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {codingPerformance?.acceptedSubmissions ?? 0} / {codingPerformance?.totalSubmissions ?? 0} Accepted ({codingPerformance?.accuracyRate ?? 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${codingPerformance?.accuracyRate ?? 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Weighted Coding Contribution: <strong>{codingPerformance?.weightedCodingScore ?? 0} / 35 Pts</strong>
              </span>
              <Link to="/coding">
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  <span>Solve Problems</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Mock Interview Evaluation Card (Multi-Skill Rubric) */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  Mock Interview Multi-Skill Evaluation
                </CardTitle>
                <CardDescription className="text-xs">
                  Scores evaluated on performance, technical depth, problem-solving, and communication.
                </CardDescription>
              </div>
              <Badge variant="purple" size="sm">
                {mockInterviewEvaluation?.status || 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {/* 4 Skill evaluation meters */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Technical Depth & Architecture Trade-Offs
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {mockInterviewEvaluation?.technicalDepthScore ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mockInterviewEvaluation?.technicalDepthScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Problem Solving & Algorithmic Correctness
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {mockInterviewEvaluation?.problemSolvingScore ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mockInterviewEvaluation?.problemSolvingScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Verbal Articulation & STAR Structure
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {mockInterviewEvaluation?.communicationScore ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mockInterviewEvaluation?.communicationScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Confidence & Completeness
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {mockInterviewEvaluation?.confidenceScore ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mockInterviewEvaluation?.confidenceScore ?? 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Interview Contribution: <strong>{mockInterviewEvaluation?.weightedInterviewScore ?? 0} / 35 Pts</strong>
              </span>
              <Link to="/mock-interview">
                <Button size="sm" variant="primary" className="text-xs gap-1">
                  <span>Start Mock Round</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Core CS Multi-Track Progress (Point 4) */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-500" />
                Core CS Multi-Track Progress
              </CardTitle>
              <CardDescription className="text-xs">
                Individual tracking across DSA, DBMS & SQL, Operating Systems, Computer Networks, and OOPs & Design.
              </CardDescription>
            </div>
            <Link
              to="/placement-modules"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {coreCSTracks &&
              coreCSTracks.map((track) => (
                <div
                  key={track.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getTrackIcon(track.icon)}
                    </div>
                    <Badge
                      variant={
                        track.status === 'Mastered'
                          ? 'success'
                          : track.status === 'Proficient'
                          ? 'purple'
                          : track.status === 'In Progress'
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                      className="text-[9px]"
                    >
                      {track.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      {track.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {track.completedCount} / {track.totalTarget} benchmark topics
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <span>Completion</span>
                      <span>{track.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${track.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 7. Weak Areas & AI Diagnosis (Point 6) */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Automatically Identified Weak Areas & Targeted Action Plan
              </CardTitle>
              <CardDescription className="text-xs">
                Intelligently detected from failed test runs, low accuracy topics, and unverified mock interview areas.
              </CardDescription>
            </div>
            <Badge variant="warning" size="sm">
              AI Actionable
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {weakAreas && weakAreas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {weakAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
                        {area.domain}
                      </span>
                      <Badge
                        variant={area.priority === 'High' ? 'danger' : 'warning'}
                        size="sm"
                        className="text-[9px]"
                      >
                        {area.priority} Priority
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {area.topic}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {area.reason}
                    </p>
                  </div>

                  <Link to={area.actionUrl}>
                    <Button size="sm" variant="outline" className="w-full text-xs justify-between group">
                      <span>{area.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No Critical Weak Areas Detected!
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your practice accuracy and curriculum coverage are well-balanced. Continue taking mock rounds to keep fine-tuning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 8. Company-Wise Placement Readiness (Point 7) */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Company-Wise Placement Readiness
              </CardTitle>
              <CardDescription className="text-xs">
                Preparation matched against specific hiring bars of Amazon, Google, Microsoft, Walmart, and TCS Digital.
              </CardDescription>
            </div>
            <Badge variant="brand" size="sm">
              Role Calibrated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {companyReadiness &&
              companyReadiness.map((comp) => (
                <div
                  key={comp.company}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {comp.company}
                      </span>
                      {getCompanyStatusBadge(comp.status)}
                    </div>
                    <p className="text-[11px] text-slate-400">{comp.role}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Readiness</span>
                      <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                        {comp.readinessScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${comp.readinessScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {comp.matchedSolved} / {comp.requiredBenchmark} benchmark problems
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {comp.topTags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 9. Individual Category Scores & Topic Mastery Radar (Point 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Mastery Radar (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200 dark:border-slate-800 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Topic Mastery Radar
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Multi-dimensional balance across DSA, System Design, Core CS, and Communication.
                  </CardDescription>
                </div>
                <Badge variant="brand" size="sm">
                  Dynamic Model
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-72 sm:h-80 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={topicMastery}>
                    <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      stroke="#94a3b8"
                      opacity={0.2}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Radar
                      name="Candidate Mastery"
                      dataKey="score"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5 Individual Category Breakdown Scores (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Individual Category Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Precise skill scores to identify where to target your next practice session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Coding & Algorithms
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {categoryScores?.codingAndAlgorithms ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${categoryScores?.codingAndAlgorithms ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      System Design & Architecture
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {categoryScores?.systemDesignAndArchitecture ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${categoryScores?.systemDesignAndArchitecture ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Database & SQL Engine
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {categoryScores?.databaseAndSQL ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${categoryScores?.databaseAndSQL ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Problem Solving & Logic
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {categoryScores?.problemSolvingAndLogic ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${categoryScores?.problemSolvingAndLogic ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Communication & Viva
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {categoryScores?.communicationAndViva ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${categoryScores?.communicationAndViva ?? 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Dynamic Interviewer Feedback Box */}
            <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Interviewer Rubric Insight:</span>
                <span className="text-[10px] font-normal text-slate-400 ml-auto">
                  {interviewerFeedback?.source || 'Placement Engine'}
                </span>
              </div>
              <p className="leading-relaxed">{interviewerFeedback?.highlight}</p>
              {interviewerFeedback?.actionableAdvice && (
                <p className="text-brand-600 dark:text-brand-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-800">
                  🎯 Next Focus: {interviewerFeedback.actionableAdvice}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 10. InterviewAI Daily Consistency Engine & Activity Heatmap (Consistency Tracker) */}
      <InterviewStreakCalendar
        currentStreak={streak}
        bestStreak={bestStreak}
        activityMap={activityMap}
        heatmap={heatmap}
        showAnnualToggle={true}
      />

      {/* 11. Recent Placement Activities Timeline */}
      {recentActivities && recentActivities.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Recent Practice & Interview Log
            </CardTitle>
            <CardDescription className="text-xs">
              Live history of your recent code sandbox submissions and AI interview evaluations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        act.type === 'problem'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                      }`}
                    >
                      {act.type === 'problem' ? (
                        <Code2 className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{act.title}</p>
                      <p className="text-[11px] text-slate-400">{act.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {act.score && (
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {act.score}
                      </span>
                    )}
                    <Badge
                      variant={
                        act.status === 'Accepted' || act.status === 'Completed'
                          ? 'success'
                          : 'default'
                      }
                      size="sm"
                    >
                      {act.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 12. Achievement Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Placement Achievement Badges
            </h2>
            <p className="text-xs text-slate-500">
              Unlock prestigious badges by demonstrating consistency, code quality, and interview readiness.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
            {badges.filter((b) => b.isUnlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-brand-400'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 flex-shrink-0 ${getTierColor(
                  badge.tier
                )}`}
              >
                {badge.isUnlocked ? (
                  getBadgeIcon(badge.icon)
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {badge.title}
                  </h4>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                      badge.tier === 'Diamond'
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                        : badge.tier === 'Platinum'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : badge.tier === 'Gold'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {badge.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {badge.description}
                </p>
                {badge.isUnlocked && badge.unlockedAt && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block pt-0.5">
                    ✓ Unlocked {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
