import { apiClient } from './api';

export interface BulletImprovement {
  original: string;
  improved: string;
  formula: string;
  reason: string;
}

export interface ChecklistItem {
  item: string;
  status: 'passed' | 'warning' | 'failed';
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface CompanyAlignment {
  company: string;
  alignmentScore: number;
  feedback: string;
  keyTraitsDetected: string[];
  missingCompanyKeywords: string[];
}

export interface ResumeScanData {
  _id?: string;
  targetRole: string;
  targetCompany: string;
  resumeSnippet?: string;
  fileInfo?: {
    fileName?: string;
    fileType?: string;
  };
  overallScore: number;
  skillsAnalysis: {
    matchedSkills: string[];
    missingSkills: string[];
    matchPercentage: number;
  };
  atsCompatibility: {
    score: number;
    readability: string;
    quantifiableMetricsPresent: boolean;
    actionVerbsScore: number;
    contactInfoComplete: boolean;
  };
  bulletImprovements: BulletImprovement[];
  companyAlignment: CompanyAlignment;
  checklist: ChecklistItem[];
  summaryFeedback: string;
  createdAt?: string;
}

export interface ScanResumePayload {
  resumeText?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  targetRole?: string;
  targetCompany?: string;
}

export const scanResume = async (
  payload: ScanResumePayload
): Promise<ResumeScanData> => {
  const response = await apiClient.post('/resume/scan', payload);
  return response.data.data;
};

export const fetchResumeScanHistory = async (): Promise<ResumeScanData[]> => {
  const response = await apiClient.get('/resume/history');
  return response.data.data || [];
};

export const fetchResumeScanById = async (
  id: string
): Promise<ResumeScanData> => {
  const response = await apiClient.get(`/resume/${id}`);
  return response.data.data;
};

