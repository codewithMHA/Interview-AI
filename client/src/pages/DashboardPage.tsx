import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Award,
  CheckCircle2,
  Code2,
  Brain,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Target,
  RefreshCw,
  Building2,
  Database,
  Cpu,
  Layers,
  BarChart3,
  FileText,
  Bot
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardOverview, DashboardOverview } from '@/services/dashboardService';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { InterviewStreakCalendar } from '@/components/common/LeetCodeStreakCalendar';
import { Zap } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleDemoLogin = async () => {
    try {
      await login('student@demo.com', 'password123');
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const studentName = user?.name ? user.name.split(' ')[0] : 'Student';
  const roleTitle = overview?.targetRole || profile?.targetRole || 'Full Stack Developer';
  const streak = overview?.streakCount ?? profile?.streakCount ?? 0;
  const xp = overview?.xpPoints ?? profile?.xpPoints ?? 0;
  const level = overview?.level ?? profile?.level ?? 1;
  const prepScore = overview?.preparationScore ?? profile?.preparationScore ?? 0;
  const techScore = overview?.metrics?.technicalScore ?? 0;
  const hrScore = overview?.metrics?.hrScore ?? 0;
  const completedQuestions = overview?.metrics?.completedQuestions ?? 0;
  const totalQuestions = overview?.metrics?.totalQuestions ?? 20;
  const codingProgress = overview?.metrics?.codingProgress ?? 0;
  const accuracyRate = overview?.codingPerformance?.accuracyRate ?? 0;
  const categoryScores = overview?.categoryScores;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner - Responsive to Light (Vibrant Emerald-Indigo Gradient) & Dark (Obsidian Glass) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-[#0d0d16] dark:via-[#121222] dark:to-[#0a0a12] border border-emerald-500/20 dark:border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {roleTitle} Placement Track
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Good day, {studentName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {prepScore > 0
              ? `You're on day ${streak} with a dynamic placement readiness score of ${prepScore}%. Keep pushing forward!`
              : 'Welcome to your placement preparation hub! Solve your first problem or practice a question to start your score.'}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-slate-300 leading-tight">Streak</p>
              <p className="text-sm font-bold text-white">{streak} Days 🔥</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-300 leading-tight">Level {level}</p>
              <p className="text-sm font-bold text-white">{xp} XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Placement Readiness Score */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Placement Readiness
              </p>
              <Badge variant="purple" size="sm">Dynamic</Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {prepScore}%
              </span>
              {prepScore > 0 ? (
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">New Student</span>
              )}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${prepScore}%` }}
              ></div>
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
              <span className="text-[10px] font-bold text-emerald-500">
                {accuracyRate > 0 ? `${accuracyRate}% Acc` : '0% Acc'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {codingProgress}
              </span>
              <span className="text-xs text-slate-400">/ 20 Target</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (codingProgress / 20) * 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Score */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Technical Score
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {techScore}%
              </span>
              {techScore > 0 ? (
                <Badge variant="purple" size="sm">Mock Evaluated</Badge>
              ) : (
                <Badge variant="outline" size="sm" className="text-slate-400 border-slate-700">
                  Pending Mock
                </Badge>
              )}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${techScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* HR / Behavioral */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              HR & Articulation
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {hrScore}%
              </span>
              {hrScore > 0 ? (
                <Badge variant="warning" size="sm">STAR Evaluated</Badge>
              ) : (
                <Badge variant="outline" size="sm" className="text-slate-400 border-slate-700">
                  Pending Mock
                </Badge>
              )}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${hrScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Scores Breakdown Strip */}
      {categoryScores && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Category Skill Breakdown
              </h3>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics Radar & Badges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span>Coding</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {categoryScores.codingAndAlgorithms}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${categoryScores.codingAndAlgorithms}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span>System Design</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {categoryScores.systemDesignAndArchitecture}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${categoryScores.systemDesignAndArchitecture}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span>DBMS & SQL</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {categoryScores.databaseAndSQL}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{ width: `${categoryScores.databaseAndSQL}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span>Problem Solving</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {categoryScores.problemSolvingAndLogic}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${categoryScores.problemSolvingAndLogic}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span>Viva & Articulation</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {categoryScores.communicationAndViva}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${categoryScores.communicationAndViva}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Continue Preparation & Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Next Priority Task & Placement Core Hubs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Continue Activity Card */}
          <Card className="border-2 border-brand-500/30 dark:border-brand-500/40 bg-brand-50/20 dark:bg-brand-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="purple">Next Priority Task</Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{overview?.nextRecommendedActivity?.estimatedMinutes || 20} mins estimated
                </span>
              </div>
              <CardTitle className="mt-2 text-xl">
                {overview?.nextRecommendedActivity?.title || 'Complete JavaScript Arrays & Two-Pointer Methods'}
              </CardTitle>
              <CardDescription>
                Milestone task: Consolidate core interview patterns and review sample company explanations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/roadmap">
                  <Button
                    size="md"
                    variant="primary"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue 30-Day Roadmap
                  </Button>
                </Link>
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => navigate('/coding')}
                >
                  Coding Sandbox
                </Button>
                <Link to="/resume-scanner">
                  <Button size="md" variant="secondary" className="gap-1.5">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    AI Resume ATS
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="ghost" size="md">
                    Analytics & Badges →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Placement Modules Quick Access Hub */}
          <div className="p-5 rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-gradient-to-r from-brand-50/50 via-indigo-50/30 to-slate-50 dark:from-brand-950/40 dark:via-indigo-950/20 dark:to-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Placement Modules Hub
                </h3>
              </div>
              <Link
                to="/placement-modules"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View All 7 Modules (96 Qs)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
              {[
                { title: 'AI Interview', href: '/ai-interview', badge: 'Voice AI' },
                { title: 'DSA Sandbox', href: '/coding', badge: '15 Qs' },
                { title: 'Complexity', href: '/practice-sandbox', badge: '15 Qs' },
                { title: 'ATS Scanner', href: '/resume-scanner', badge: 'AI ATS' },
                { title: '30-Day Sprint', href: '/roadmap', badge: '8 Tasks' },
                { title: 'AI Mentor Chat', href: '/chat', badge: '24/7 AI' },
                { title: 'CN & System Design', href: '/placement-modules', badge: '14 Qs' },
              ].map((m) => (
                <Link
                  key={m.title}
                  to={m.href}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 hover:shadow-sm transition-all text-center group"
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
                    {m.title}
                  </p>
                  <span className="text-[9px] font-semibold text-brand-600 dark:text-brand-400 block mt-1 uppercase">
                    {m.badge}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Core Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              hoverEffect
              className="cursor-pointer border-brand-500/30"
              onClick={() => navigate('/questions')}
            >
              <CardContent className="p-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Question Bank</h4>
                  <Badge variant="info" size="sm">{overview?.metrics?.totalQuestions || 20} Qs</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Review 20+ verified computer science placement topics.
                </p>
              </CardContent>
            </Card>

            <Card
              hoverEffect
              className="cursor-pointer"
              onClick={() => navigate('/coding')}
            >
              <CardContent className="p-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Coding Practice</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Solve DSA problems with Judge0 execution & Monaco.
                </p>
              </CardContent>
            </Card>

            <Card
              hoverEffect
              className="cursor-pointer border-indigo-500/30"
              onClick={() => navigate('/ai-interview')}
            >
              <CardContent className="p-5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">AI Interview</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Live voice call interview probing your skills and projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (4 cols): AI Recommendation & Activity */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Placement Recommendation</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {overview?.aiRecommendation?.title || 'Focus on Dynamic Programming & B-Tree Indexing'}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {overview?.aiRecommendation?.reason ||
                  'Based on your target role, mastering indexing and memoization will boost your placement score.'}
              </p>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span>Suggested Topic:</span>
                  <Badge variant="purple" size="sm">{overview?.aiRecommendation?.topic || 'DBMS'}</Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 italic">
                  "{overview?.aiRecommendation?.suggestedQuestion || 'When should you choose a Clustered Index over a Non-Clustered Index?'}"
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-full mt-2"
                onClick={() => navigate('/questions?search=Index')}
              >
                Practice Recommended Questions
              </Button>
            </CardContent>
          </Card>

          {/* InterviewAI Daily Challenge & Streak Calendar */}
          <InterviewStreakCalendar
            currentStreak={streak}
            bestStreak={Math.max(streak, 5)}
            showAnnualToggle={false}
          />

          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Practice Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.recentActivity && overview.recentActivity.length > 0 ? (
                overview.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[160px]">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{act.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{act.score}</span>
                      <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center space-y-2">
                  <div className="w-9 h-9 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No activity recorded yet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] mx-auto">
                    Solve a coding challenge or practice a question to earn your first placement points.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 text-xs"
                    onClick={() => navigate('/coding')}
                  >
                    Start First Problem →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
