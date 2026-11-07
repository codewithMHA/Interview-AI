import { apiClient } from './api';
import { CategoryScores, CompanyReadinessItem } from './analyticsService';

export interface DashboardOverview {
  preparationScore: number;
  streakCount: number;
  xpPoints: number;
  level: number;
  targetRole: string;
  experienceLevel: string;
  metrics: {
    totalQuestions: number;
    completedQuestions: number;
    bookmarkedQuestions: number;
    codingProgress: number;
    technicalScore: number;
    hrScore: number;
    mockInterviewsCompleted: number;
  };
  codingPerformance?: {
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    totalSolved: number;
    accuracyRate: number;
  };
  categoryScores?: CategoryScores;
  companyReadiness?: Array<{
    company: string;
    role: string;
    readinessScore: number;
  }>;
  nextRecommendedActivity: {
    title: string;
    topic: string;
    category: string;
    estimatedMinutes: number;
    type: string;
  };
  aiRecommendation: {
    title: string;
    reason: string;
    suggestedQuestion: string;
    topic: string;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    timestamp: string;
    score: string;
  }>;
}

export const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get('/dashboard/overview');
  return response.data?.data;
};
