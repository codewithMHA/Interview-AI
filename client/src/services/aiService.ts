import { apiClient } from './api';
import {
  CodeAnalysisResponse,
  CodeExplanationResponse,
  ConceptExplanationResponse,
  MockInterviewDetailedSession,
  MockQuestionFeedback,
} from '@/types';

export const analyzeCodeWithAI = async (params: {
  problemTitle: string;
  language: string;
  userCode: string;
  problemDescription?: string;
}): Promise<CodeAnalysisResponse> => {
  const response = await apiClient.post('/ai/analyze-code', params);
  return response.data.data;
};

export const explainCodeWithAI = async (params: {
  problemTitle: string;
  language: string;
  userCode: string;
}): Promise<CodeExplanationResponse> => {
  const response = await apiClient.post('/ai/explain-code', params);
  return response.data.data;
};

export const explainConceptWithAI = async (params: {
  topic: string;
  focusArea?: string;
  description?: string;
  role?: string;
}): Promise<ConceptExplanationResponse> => {
  const response = await apiClient.post('/ai/explain-concept', params);
  return response.data.data;
};

export interface ChatConversationContext {
  topic?: string;
  isFollowUp?: boolean;
  usedPreviousContext?: boolean;
}

export interface DoubtSolverResponse {
  doubt?: string;
  directAnswer: string;
  keyPoints: string[];
  codeSnippet?: {
    language: string;
    code: string;
    explanation?: string;
  } | null;
  interviewTip: string;
  suggestedFollowUps: string[];
  conversationContext?: ChatConversationContext;
  conversationId?: string;
  messageId?: string;
}

export interface ConversationSummaryItem {
  _id: string;
  title: string;
  topic?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const solveDoubtWithAI = async (params: {
  doubt: string;
  conversationId?: string;
  history?: Array<{ sender: 'user' | 'ai'; message: string }>;
  topic?: string;
  role?: string;
}): Promise<DoubtSolverResponse> => {
  const response = await apiClient.post('/ai/solve-doubt', params);
  return response.data.data;
};

export const sendChatMessage = async (params: {
  message: string;
  conversationId?: string;
  topic?: string;
  role?: string;
}): Promise<DoubtSolverResponse> => {
  const response = await apiClient.post('/ai/chat', {
    doubt: params.message,
    conversationId: params.conversationId,
    topic: params.topic,
    role: params.role,
  });
  return response.data.data;
};

export const fetchConversations = async (): Promise<ConversationSummaryItem[]> => {
  const response = await apiClient.get('/ai/conversations');
  return response.data.data;
};

export const fetchConversationMessages = async (
  conversationId: string
): Promise<{ conversation: any; messages: any[] }> => {
  const response = await apiClient.get(`/ai/conversations/${conversationId}`);
  return response.data.data;
};

export const createNewConversation = async (
  title?: string,
  topic?: string
): Promise<{ id: string; title: string }> => {
  const response = await apiClient.post('/ai/conversations', { title, topic });
  return response.data.data;
};

export const deleteConversationById = async (
  conversationId: string
): Promise<boolean> => {
  const response = await apiClient.delete(`/ai/conversations/${conversationId}`);
  return response.data.data.deleted;
};

export interface StartMockInterviewParams {
  title?: string;
  interviewType?: string;
  type?: string;
  role: string;
  experienceLevel?: string;
  company?: string;
  skills?: string[];
  customTopics?: string[];
  difficulty: string;
  duration?: number;
  numberOfQuestions?: number;
  questionCount?: number;
  mode?: 'text' | 'voice' | 'mixed';
  resumeText?: string;
  jobDescription?: string;
  targetJD?: string;
  roundType?: 'project_deep_dive' | 'behavioral' | 'hiring_manager' | 'technical_stack' | 'general' | string;
  interviewerName?: string;
  interviewerRole?: string;
  interviewerAvatar?: string;
  candidateNotes?: string;
  resumeTopics?: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    status: 'not_yet' | 'discussing' | 'discussed';
  }>;
}

export const startMockInterview = async (
  params: StartMockInterviewParams
): Promise<MockInterviewDetailedSession> => {
  const response = await apiClient.post('/mock-interviews/start', params);
  return response.data.data;
};

export const saveCandidateNotes = async (
  interviewId: string,
  notes: string
): Promise<{ notes: string }> => {
  const response = await apiClient.post(`/mock-interviews/${interviewId}/notes`, { notes });
  return response.data;
};

export const updateTopicStatus = async (
  interviewId: string,
  topicId: string,
  status: 'not_yet' | 'discussing' | 'discussed'
): Promise<{ topics: any[] }> => {
  const response = await apiClient.post(`/mock-interviews/${interviewId}/topics/${topicId}`, { status });
  return response.data;
};

export const getMockInterview = async (
  id: string
): Promise<MockInterviewDetailedSession> => {
  const response = await apiClient.get(`/mock-interviews/${id}`);
  return response.data.data;
};

export const submitMockAnswer = async (
  interviewId: string,
  questionId: string,
  answer: string,
  questionIndex?: number,
  code?: string,
  language?: string
): Promise<{
  questionId: string;
  feedback: MockQuestionFeedback;
  nextQuestion?: any;
  interviewerSpeech?: string;
  isCompleted?: boolean;
}> => {
  const response = await apiClient.post(
    `/mock-interviews/${interviewId}/submit-answer`,
    { questionId, questionIndex, answer, code, language }
  );
  return response.data.data;
};

export const runInterviewCode = async (
  interviewId: string,
  code: string,
  language: string
): Promise<{ stdout: string; stderr: string; time: string; memory: number; exitCode: number }> => {
  const response = await apiClient.post(`/mock-interviews/${interviewId}/run-code`, {
    code,
    language,
  });
  return response.data?.data || response.data;
};

export const deleteMockInterview = async (id: string): Promise<boolean> => {
  const response = await apiClient.delete(`/mock-interviews/${id}`);
  return response.data?.success ?? true;
};

export const completeMockInterview = async (
  interviewId: string
): Promise<MockInterviewDetailedSession> => {
  const response = await apiClient.post(
    `/mock-interviews/${interviewId}/complete`
  );
  return response.data.data;
};

export const getMockInterviewHistory = async (): Promise<
  MockInterviewDetailedSession[]
> => {
  const response = await apiClient.get('/mock-interviews');
  return response.data.data;
};

