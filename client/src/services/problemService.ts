import { apiClient } from './api';
import {
  CodingProblemListItem,
  CodingProblem,
  CodeExecutionResponse,
  SubmissionHistoryItem,
} from '@/types';

export interface ProblemFilterParams {
  category?: string;
  difficulty?: string;
  search?: string;
  company?: string;
}

export const fetchProblems = async (
  params?: ProblemFilterParams
): Promise<CodingProblemListItem[]> => {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') {
    query.append('category', params.category);
  }
  if (params?.difficulty && params.difficulty !== 'All') {
    query.append('difficulty', params.difficulty);
  }
  if (params?.company && params.company !== 'All') {
    query.append('company', params.company);
  }
  if (params?.search && params.search.trim().length > 0) {
    query.append('search', params.search.trim());
  }

  const queryString = query.toString();
  const url = queryString ? `/problems?${queryString}` : '/problems';
  const response = await apiClient.get(url);
  return response.data.data;
};

export const fetchProblemById = async (
  idOrSlug: string
): Promise<CodingProblem> => {
  const response = await apiClient.get(`/problems/${idOrSlug}`);
  return response.data.data;
};

export const runCode = async (
  idOrSlug: string,
  language: string,
  code: string,
  customTestCases?: Array<{ input: string; expectedOutput: string }>
): Promise<CodeExecutionResponse> => {
  const response = await apiClient.post(`/problems/${idOrSlug}/run`, {
    language,
    code,
    customTestCases,
  });
  return response.data.data;
};

export const submitCode = async (
  idOrSlug: string,
  language: string,
  code: string
): Promise<CodeExecutionResponse> => {
  const response = await apiClient.post(`/problems/${idOrSlug}/submit`, {
    language,
    code,
  });
  return response.data.data;
};

export const fetchProblemSubmissions = async (
  idOrSlug: string
): Promise<SubmissionHistoryItem[]> => {
  const response = await apiClient.get(`/problems/${idOrSlug}/submissions`);
  return response.data.data;
};

export const runSandboxPlayground = async (
  language: string,
  code: string,
  stdin?: string
): Promise<{
  stdout: string;
  stderr?: string;
  executionTime: number;
  status: 'Success' | 'Runtime Error';
}> => {
  const response = await apiClient.post('/problems/sandbox-run', {
    language,
    code,
    stdin,
  });
  return response.data.data;
};
