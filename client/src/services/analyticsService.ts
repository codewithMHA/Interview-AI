import { apiClient } from './api';

export interface TopicMasteryItem {
  subject: string;
  score: number;
  fullMark: number;
}

export interface SkillBreakdown {
  correctness: number;
  technicalDepth: number;
  codingSpeed: number;
  articulation: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface DailyActivityItem {
  type: 'problem' | 'attempt' | 'interview' | 'question';
  title: string;
  detail?: string;
  difficulty?: string;
  status?: string;
}

export interface SolvedProblemDetail {
  id: string;
  title: string;
  slug?: string;
  difficulty?: string;
  language?: string;
}

export interface DailyActivitySummary {
  date: string;
  totalCount: number;
  problemsSolvedCount: number;
  submissionsCount: number;
  interviewsCount: number;
  questionsCount: number;
  solvedProblems: SolvedProblemDetail[];
  activities: DailyActivityItem[];
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'problem' | 'interview' | 'roadmap';
  title: string;
  score?: number | string;
  status: string;
  date: string;
}

export interface InterviewerFeedbackItem {
  highlight: string;
  actionableAdvice: string;
  source: string;
}

export interface CodingPerformance {
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  accuracyRate: number;
  weightedCodingScore: number;
  maxCodingScore: number;
}

export interface MockInterviewEvaluation {
  totalCompleted: number;
  evaluatedAvg: number;
  problemSolvingScore: number;
  technicalDepthScore: number;
  communicationScore: number;
  confidenceScore: number;
  weightedInterviewScore: number;
  maxInterviewScore: number;
  status: string;
}

export interface CoreCSTrack {
  id: string;
  name: string;
  completedCount: number;
  totalTarget: number;
  percentage: number;
  status: 'Mastered' | 'Proficient' | 'In Progress' | 'Not Started';
  icon: string;
}

export interface WeeklyProgressItem {
  weekLabel: string;
  problemsSolved: number;
  mockInterviews: number;
  questionsCompleted: number;
  readinessScore: number;
}

export interface WeakAreaItem {
  topic: string;
  domain: string;
  reason: string;
  priority: 'High' | 'Medium';
  actionText: string;
  actionUrl: string;
}

export interface CompanyReadinessItem {
  company: string;
  role: string;
  readinessScore: number;
  matchedSolved: number;
  requiredBenchmark: number;
  status: 'High Probability' | 'Competitive' | 'Building Profile' | 'Needs Preparation';
  topTags: string[];
}

export interface CategoryScores {
  codingAndAlgorithms: number;
  systemDesignAndArchitecture: number;
  databaseAndSQL: number;
  problemSolvingAndLogic: number;
  communicationAndViva: number;
}

export interface AnalyticsDashboardData {
  placementReadinessScore: number;
  readinessTier?: string;
  targetRole?: string;
  streak: number;
  bestStreak?: number;
  activityMap?: Record<string, number>;
  dailyActivityMap?: Record<string, DailyActivitySummary>;
  xpPoints: number;
  level: number;
  nextLevelXp: number;
  xpToNextLevel: number;
  levelPercentage: number;
  metrics: {
    problemsSolved: number;
    problemsTarget?: number;
    interviewsCompleted: number;
    interviewsTarget?: number;
    roadmapTasksCompleted: number;
    roadmapTasksTarget?: number;
    questionsBankCompleted?: number;
    activeRoadmapTitle: string;
  };
  readinessBreakdown?: {
    codeScore: number;
    codeMax: number;
    interviewScore: number;
    interviewMax: number;
    roadmapScore: number;
    roadmapMax: number;
    formula: string;
  };
  codingPerformance?: CodingPerformance;
  mockInterviewEvaluation?: MockInterviewEvaluation;
  coreCSTracks?: CoreCSTrack[];
  weeklyProgress?: WeeklyProgressItem[];
  weakAreas?: WeakAreaItem[];
  companyReadiness?: CompanyReadinessItem[];
  categoryScores?: CategoryScores;
  topicMastery: TopicMasteryItem[];
  skillBreakdown: SkillBreakdown;
  interviewerFeedback?: InterviewerFeedbackItem;
  heatmap: HeatmapDay[];
  annualHeatmap?: HeatmapDay[];
  badges: BadgeItem[];
  recentActivities?: RecentActivityItem[];
}

export const fetchAnalyticsDashboard = async (): Promise<AnalyticsDashboardData> => {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data.data;
};
