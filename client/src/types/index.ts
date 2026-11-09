export type Role = 'student' | 'admin';

export type TargetRole = 
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Software Engineer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI/ML Engineer';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  profilePicture?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  targetRole?: TargetRole;
  experienceLevel?: ExperienceLevel;
  programmingLanguages: string[];
  skills: string[];
  githubProfile?: string;
  linkedinProfile?: string;
  preparationScore: number;
  streakCount: number;
  xpPoints: number;
  level: number;
  isOnboarded?: boolean;
}

export interface Question {
  _id: string;
  title: string;
  category: 'Data Structures & Algorithms' | 'Programming' | 'Web Development' | 'Database' | 'Computer Science';
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answer: string;
  explanation: string;
  interviewTips: string[];
  companies?: string[];
  isBookmarked?: boolean;
  isCompleted?: boolean;
}

export interface ProblemTestCase {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
}

export interface CodingProblemListItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptanceRate: number;
  companies: string[];
  isSolved?: boolean;
}

export interface ProblemSolution {
  slug: string;
  timeComplexity: string;
  spaceComplexity: string;
  approach: string;
  explanation: string;
  solutions: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
}

export interface CodingProblem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  testCases: ProblemTestCase[];
  acceptanceRate: number;
  companies: string[];
  hints: string[];
  solution?: ProblemSolution;
  isSolved?: boolean;
}

export interface TestCaseExecutionResult {
  testCaseIndex: number;
  status: 'Passed' | 'Failed' | 'Error';
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  executionTime: number;
  memory: number;
  error?: string;
  isHidden?: boolean;
}

export interface CodeExecutionResponse {
  status:
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Compilation Error'
    | 'Runtime Error';
  totalRuntime: number;
  peakMemory: number;
  testCasesPassed: number;
  totalTestCases: number;
  testResults: TestCaseExecutionResult[];
  error?: string;
  isAccepted?: boolean;
  xpEarned?: number;
}

export interface SubmissionHistoryItem {
  _id: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  status:
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Compilation Error'
    | 'Runtime Error';
  runtime: number;
  memory: number;
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: string;
}

export interface CodeAnalysisResponse {
  timeComplexity: string;
  timeComplexityExplanation?: string;
  spaceComplexity: string;
  spaceComplexityExplanation?: string;
  correctnessAssessment: string;
  codeQualityScore: number;
  qualityBreakdown?: {
    strengths: string[];
    areasForImprovement: string[];
  };
  potentialBugs: string[];
  optimizations: string[];
  placementTips: string[];
  interviewerPitch?: string;
  verdictSummary: string;
}

export interface CodeExplanationStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: string;
  plainEnglishMeaning?: string;
}

export interface CodeExplanationResponse {
  overview: string;
  approachType?: string;
  dryRunExample?: {
    sampleInput: string;
    executionTrace: Array<{
      iteration: string;
      currentState: string;
      actionTaken: string;
    }>;
    finalOutput: string;
  };
  steps: CodeExplanationStep[];
  keyTakeaways: string[];
  interviewerFollowUps?: string[];
}

export interface ConceptExplanationResponse {
  topic: string;
  focusArea: string;
  summary: string;
  keyConcepts: {
    title: string;
    description: string;
  }[];
  codeSnippet?: {
    language: string;
    code: string;
    explanation: string;
  };
  interviewQuestions: {
    question: string;
    answer: string;
  }[];
  pitfalls: string[];
  bestPractices: string[];
}

export interface MockQuestionFeedback {
  overallScore: number;
  scores: {
    correctness: number;
    technicalDepth: number;
    clarity: number;
    confidence: number;
    completeness: number;
    communication: number;
  };
  whatWentWell: string[];
  whatWasMissed: string[];
  howToImprove: string[];
  modelAnswer: string;
  recommendedTopics: string[];
  rubricBreakdown?: {
    technicalCorrectness: number;
    problemSolving: number;
    communication: number;
    relevance: number;
    completeness: number;
    scoringFormula: string;
  };
  missingConcepts?: string[];
  roleLevel?: string;
}

export interface MockInterviewQuestionItem {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  stage?: 'introduction' | 'main' | 'followup' | 'scenario' | 'wrapup';
  expectedPoints: string[];
  sampleFollowUp?: string;
  studentAnswer?: string;
  studentCode?: string;
  codeLanguage?: string;
  codeExecutionResult?: any;
  answeredAt?: string;
  feedback?: MockQuestionFeedback;
}

export interface InterviewCodingProblem {
  title: string;
  description: string;
  difficulty: string;
  constraints: string[];
  starterCode: Record<string, string>;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
}

export interface InterviewReport {
  overallScore: number;
  completionStatus: 'completed' | 'abandoned';
  questionsAnswered: number;
  questionsSkipped: number;
  totalDurationMinutes: number;
  categoryScores: {
    technicalKnowledge: number;
    communicationClarity: number;
    problemSolving: number;
    answerRelevance: number;
    conceptualUnderstanding: number;
  };
  detailedFeedback: {
    strongAnswers: string[];
    weakAnswers: string[];
    missedConcepts: string[];
    areasToImprove: string[];
  };
  answerImprovements: Array<{
    questionId: string;
    question: string;
    studentAnswer: string;
    studentCode?: string;
    whatWasGood: string;
    whatWasMissing: string;
    suggestedAnswer: string;
  }>;
  recommendations: {
    preparationLevel: 'Beginner' | 'Intermediate' | 'Placement Ready' | 'Advanced';
    recommendedTopics: string[];
    suggestedNextInterview: string;
  };
}

export interface ResumeTopicItem {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'not_yet' | 'discussing' | 'discussed';
  discussedAt?: string;
}

export interface MockInterviewDetailedSession {
  _id: string;
  id?: string;
  userId: string;
  title?: string;
  interviewType: string;
  type?: string;
  role: string;
  experienceLevel?: 'Fresher' | 'Student' | 'Experienced' | string;
  company?: string;
  customTopics?: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: number;
  numberOfQuestions?: number;
  mode?: 'text' | 'voice' | 'mixed';
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  currentStage?: 'introduction' | 'main' | 'followup' | 'scenario' | 'wrapup' | 'completed';
  questions: MockInterviewQuestionItem[];
  codingProblem?: InterviewCodingProblem | CodingProblem;
  overallScore?: number;
  averageScores?: {
    correctness: number;
    technicalDepth: number;
    clarity: number;
    confidence: number;
    completeness: number;
    communication: number;
  };
  report?: InterviewReport;
  summaryFeedback?: string;
  xpEarned?: number;
  resumeText?: string;
  jobDescription?: string;
  targetJD?: string;
  candidateNotes?: string;
  interviewerName?: string;
  interviewerRole?: string;
  interviewerAvatar?: string;
  resumeTopics?: ResumeTopicItem[];
  roundType?: string;
  startedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MockInterviewSession {
  _id: string;
  targetRole: string;
  interviewType: 'Technical' | 'HR' | 'Behavioral' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  status: 'in-progress' | 'completed';
  overallScore?: number;
  createdAt: string;
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
}

