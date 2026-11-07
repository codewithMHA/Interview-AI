import { apiClient } from './api';
import { Question } from '@/types';

export interface QuestionFilters {
  search?: string;
  category?: string;
  topic?: string;
  difficulty?: string;
  company?: string;
  bookmarked?: boolean;
  completed?: boolean;
}

export const fetchQuestions = async (filters?: QuestionFilters): Promise<Question[]> => {
  const params: any = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.category && filters.category !== 'All') params.category = filters.category;
  if (filters?.topic && filters.topic !== 'All') params.topic = filters.topic;
  if (filters?.difficulty && filters.difficulty !== 'All') params.difficulty = filters.difficulty;
  if (filters?.company && filters.company !== 'All') params.company = filters.company;
  if (filters?.bookmarked) params.bookmarked = 'true';
  if (filters?.completed) params.completed = 'true';

  const response = await apiClient.get('/questions', { params });
  return response.data?.data || [];
};

export const fetchQuestionById = async (id: string): Promise<Question> => {
  const response = await apiClient.get(`/questions/${id}`);
  return response.data?.data;
};

export const toggleBookmarkQuestion = async (id: string): Promise<boolean> => {
  const response = await apiClient.post(`/questions/${id}/bookmark`);
  return response.data?.isBookmarked;
};

export const toggleCompleteQuestion = async (id: string): Promise<boolean> => {
  const response = await apiClient.post(`/questions/${id}/complete`);
  return response.data?.isCompleted;
};

