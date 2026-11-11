import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMockQuestionFeedback {
  overallScore: number;
  scores: {
    correctness: number;
    technicalDepth: number;
    clarity: number;
    confidence: number;
    completeness: number;
    communication: number;
  };
  rubricBreakdown?: {
    technicalCorrectness: number;
    problemSolving: number;
    communication: number;
    relevance: number;
    completeness: number;
    scoringFormula: string;
  };
  roleLevel?: string;
  whatWentWell: string[];
  whatWasMissed: string[];
  missingConcepts?: string[];
  howToImprove: string[];
  modelAnswer: string;
  recommendedTopics: string[];
}

export interface IMockInterviewQuestionItem {
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
  answeredAt?: Date;
  feedback?: IMockQuestionFeedback;
}

export interface ICodingProblem {
  title: string;
  description: string;
  difficulty: string;
  constraints: string[];
  starterCode: Record<string, string>;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
}

export interface IInterviewReport {
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
    preparationLevel: string;
    recommendedTopics: string[];
    suggestedNextInterview: string;
  };
}

export interface IMockInterview extends Document {
  userId: mongoose.Types.ObjectId | string;
  title?: string;
  interviewType: string; // 'HR' | 'Technical' | 'Coding' | 'Java' | 'Python' | 'Frontend Developer' | 'Backend Developer' | 'Full Stack Developer' | 'AI/ML' | 'Database' | 'Custom'
  role: string;
  experienceLevel: 'Fresher' | 'Student' | 'Experienced';
  company?: string;
  customTopics?: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes (10, 15, 30, 45)
  numberOfQuestions: number;
  mode: 'text' | 'voice' | 'mixed';
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  currentStage: 'introduction' | 'main' | 'followup' | 'scenario' | 'wrapup' | 'completed';
  questions: IMockInterviewQuestionItem[];
  codingProblem?: ICodingProblem;
  overallScore?: number;
  averageScores?: {
    correctness: number;
    technicalDepth: number;
    clarity: number;
    confidence: number;
    completeness: number;
    communication: number;
  };
  report?: IInterviewReport;
  summaryFeedback?: string;
  xpEarned?: number;
  resumeText?: string;
  jobDescription?: string;
  candidateNotes?: string;
  resumeTopics?: Array<{
    id: string;
    title: string;
    category: string;
    description?: string;
    status: 'discussing' | 'discussed' | 'not_yet';
  }>;
  interviewerName?: string;
  interviewerRole?: string;
  interviewerAvatar?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MockQuestionFeedbackSchema = new Schema<IMockQuestionFeedback>(
  {
    overallScore: { type: Number, required: true },
    scores: {
      correctness: { type: Number, default: 75 },
      technicalDepth: { type: Number, default: 75 },
      clarity: { type: Number, default: 75 },
      confidence: { type: Number, default: 75 },
      completeness: { type: Number, default: 75 },
      communication: { type: Number, default: 75 },
    },
    rubricBreakdown: {
      technicalCorrectness: { type: Number },
      problemSolving: { type: Number },
      communication: { type: Number },
      relevance: { type: Number },
      completeness: { type: Number },
      scoringFormula: { type: String },
    },
    roleLevel: { type: String },
    whatWentWell: { type: [String], default: [] },
    whatWasMissed: { type: [String], default: [] },
    missingConcepts: { type: [String], default: [] },
    howToImprove: { type: [String], default: [] },
    modelAnswer: { type: String, default: '' },
    recommendedTopics: { type: [String], default: [] },
  },
  { _id: false }
);

const MockInterviewQuestionItemSchema = new Schema<IMockInterviewQuestionItem>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    category: { type: String, default: 'Technical' },
    difficulty: { type: String, default: 'Intermediate' },
    stage: {
      type: String,
      enum: ['introduction', 'main', 'followup', 'scenario', 'wrapup'],
      default: 'main',
    },
    expectedPoints: { type: [String], default: [] },
    sampleFollowUp: { type: String },
    studentAnswer: { type: String },
    studentCode: { type: String },
    codeLanguage: { type: String },
    codeExecutionResult: { type: Schema.Types.Mixed },
    answeredAt: { type: Date },
    feedback: { type: MockQuestionFeedbackSchema },
  },
  { _id: false }
);

const MockInterviewSchema = new Schema<IMockInterview>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    title: { type: String, default: '' },
    interviewType: {
      type: String,
      default: 'Technical',
      index: true,
    },
    role: { type: String, required: true },
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Student', 'Experienced'],
      default: 'Fresher',
    },
    company: { type: String, default: '' },
    customTopics: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    duration: { type: Number, default: 30 },
    numberOfQuestions: { type: Number, default: 5 },
    mode: {
      type: String,
      enum: ['text', 'voice', 'mixed'],
      default: 'mixed',
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
      default: 'in_progress',
      index: true,
    },
    currentStage: {
      type: String,
      enum: ['introduction', 'main', 'followup', 'scenario', 'wrapup', 'completed'],
      default: 'introduction',
    },
    questions: { type: [MockInterviewQuestionItemSchema], default: [] },
    codingProblem: {
      title: { type: String },
      description: { type: String },
      difficulty: { type: String },
      constraints: { type: [String], default: [] },
      starterCode: { type: Schema.Types.Mixed, default: {} },
      sampleInput: { type: String },
      sampleOutput: { type: String },
      testCases: { type: [Schema.Types.Mixed], default: [] },
    },
    overallScore: { type: Number },
    averageScores: {
      correctness: { type: Number },
      technicalDepth: { type: Number },
      clarity: { type: Number },
      confidence: { type: Number },
      completeness: { type: Number },
      communication: { type: Number },
    },
    report: { type: Schema.Types.Mixed },
    summaryFeedback: { type: String },
    xpEarned: { type: Number, default: 0 },
    resumeText: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    candidateNotes: { type: String, default: '' },
    resumeTopics: { type: [Schema.Types.Mixed], default: [] },
    interviewerName: { type: String, default: 'Alex Morgan' },
    interviewerRole: { type: String, default: 'Lead Technical Interviewer' },
    interviewerAvatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

MockInterviewSchema.index({ userId: 1, createdAt: -1 });

export const MockInterview: Model<IMockInterview> =
  mongoose.models.MockInterview ||
  mongoose.model<IMockInterview>('MockInterview', MockInterviewSchema);
