import { apiClient } from './api';

export interface VisualAnimationStep {
  step: number;
  label: string;
  visualDesc: string;
  badge?: string;
}

export interface VisualDiagramAnimation {
  title: string;
  description: string;
  steps: VisualAnimationStep[];
}

export interface ModuleItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  questionPrompt: string;
  conceptSummary: string;
  detailedAnswer: string;
  visualDiagramAnimation?: VisualDiagramAnimation;
  codeSnippet?: {
    language: string;
    code: string;
  };
  complexityAnalysis?: {
    time: string;
    space: string;
    explanation: string;
  };
  interviewerRubric: {
    whatInterviewersLookFor: string[];
    commonMistakes: string[];
    followUpQuestions?: string[];
  };
}

export interface PlacementModule {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  gradient: string;
  description: string;
  importanceRating: string;
  items?: ModuleItem[];
  itemsCount?: number;
}

export const fetchPlacementModules = async (): Promise<PlacementModule[]> => {
  const response = await apiClient.get('/placement-modules');
  return response.data?.data || [];
};

export const fetchPlacementModuleById = async (id: string): Promise<PlacementModule> => {
  const response = await apiClient.get(`/placement-modules/${id}`);
  return response.data?.data;
};

