import { apiClient } from './api';

export interface RoadmapTask {
  id: string;
  title: string;
  type: 'concept' | 'problem' | 'question' | 'interview' | 'project';
  targetUrl?: string;
  estimatedMinutes: number;
  xpReward: number;
  description: string;
  keyTakeaways?: string[];
}

export interface RoadmapDay {
  dayNumber: number;
  title: string;
  focusArea: string;
  estimatedMinutes: number;
  tasks: RoadmapTask[];
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  focusArea: string;
  milestoneObjective: string;
  days: RoadmapDay[];
}

export interface Roadmap {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  role: string;
  durationDays: number;
  level: string;
  description: string;
  targetCompanies: string[];
  icon: string;
  badgeColor: string;
  totalTasks: number;
  totalXp: number;
  isCustom?: boolean;
  weeks: RoadmapWeek[];
}

export interface UserRoadmapProgress {
  userId: string;
  roadmapId: string;
  roadmapTitle: string;
  enrolledAt: string;
  completedTasks: string[];
  totalTasks: number;
  completedCount: number;
  progressPercentage: number;
  lastActiveAt: string;
}

export interface ActiveRoadmapResponse {
  roadmap: Roadmap;
  progress: UserRoadmapProgress;
}

export interface CompanyInsight {
  company: string;
  focusSummary: string;
  trendingTopics: string[];
  interviewFormat: string;
  difficulty: string;
}

export interface GenerateRoadmapPayload {
  role: string;
  targetCompany: string;
  weeks?: number;
  dailyHours?: number;
  weakTopics?: string[];
  customTopics?: string[];
}

export const fetchCompanyInsights = async (company: string): Promise<CompanyInsight> => {
  const response = await apiClient.get('/roadmaps/company-insights', {
    params: { company },
  });
  return response.data.data;
};

export const fetchRoadmaps = async (): Promise<Roadmap[]> => {
  const response = await apiClient.get('/roadmaps');
  return response.data.data || [];
};

export const fetchRoadmapByIdOrSlug = async (idOrSlug: string): Promise<Roadmap> => {
  const response = await apiClient.get(`/roadmaps/${idOrSlug}`);
  return response.data.data;
};

export const fetchUserActiveRoadmap = async (): Promise<ActiveRoadmapResponse> => {
  const response = await apiClient.get('/roadmaps/my/active');
  return response.data.data;
};

export const enrollInRoadmap = async (roadmapIdOrSlug: string): Promise<ActiveRoadmapResponse> => {
  const response = await apiClient.post('/roadmaps/enroll', { roadmapIdOrSlug });
  return response.data.data;
};

export const toggleRoadmapTask = async (
  taskId: string,
  roadmapSlug: string
): Promise<{ progress: UserRoadmapProgress; isCompleted: boolean; xpAwarded: number }> => {
  const response = await apiClient.patch(`/roadmaps/tasks/${taskId}/toggle`, { roadmapSlug });
  return response.data.data;
};

export const generateCustomRoadmap = async (
  payload: GenerateRoadmapPayload
): Promise<ActiveRoadmapResponse> => {
  const response = await apiClient.post('/roadmaps/generate-custom', payload);
  return response.data.data;
};
