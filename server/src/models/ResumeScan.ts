import mongoose, { Document, Schema } from 'mongoose';

export interface IBulletImprovement {
  original: string;
  improved: string;
  formula: string;
  reason: string;
}

export interface IChecklistItem {
  item: string;
  status: 'passed' | 'warning' | 'failed';
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ICompanyAlignment {
  company: string;
  alignmentScore: number;
  feedback: string;
  keyTraitsDetected: string[];
  missingCompanyKeywords: string[];
}

export interface IResumeScan extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  targetCompany: string;
  resumeSnippet: string;
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
  bulletImprovements: IBulletImprovement[];
  companyAlignment: ICompanyAlignment;
  checklist: IChecklistItem[];
  summaryFeedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const BulletImprovementSchema = new Schema<IBulletImprovement>(
  {
    original: { type: String, required: true },
    improved: { type: String, required: true },
    formula: { type: String, default: 'Google X-Y-Z' },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    item: { type: String, required: true },
    status: {
      type: String,
      enum: ['passed', 'warning', 'failed'],
      required: true,
    },
    recommendation: { type: String, required: true },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
  },
  { _id: false }
);

const CompanyAlignmentSchema = new Schema<ICompanyAlignment>(
  {
    company: { type: String, required: true },
    alignmentScore: { type: Number, required: true },
    feedback: { type: String, required: true },
    keyTraitsDetected: { type: [String], default: [] },
    missingCompanyKeywords: { type: [String], default: [] },
  },
  { _id: false }
);

const ResumeScanSchema = new Schema<IResumeScan>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      default: 'Software Engineer',
    },
    targetCompany: {
      type: String,
      required: true,
      default: 'General Tier-1',
    },
    resumeSnippet: {
      type: String,
      required: true,
    },
    fileInfo: {
      fileName: { type: String },
      fileType: { type: String },
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    skillsAnalysis: {
      matchedSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      matchPercentage: { type: Number, default: 0 },
    },
    atsCompatibility: {
      score: { type: Number, default: 75 },
      readability: { type: String, default: 'High' },
      quantifiableMetricsPresent: { type: Boolean, default: true },
      actionVerbsScore: { type: Number, default: 80 },
      contactInfoComplete: { type: Boolean, default: true },
    },
    bulletImprovements: {
      type: [BulletImprovementSchema],
      default: [],
    },
    companyAlignment: {
      type: CompanyAlignmentSchema,
      required: true,
    },
    checklist: {
      type: [ChecklistItemSchema],
      default: [],
    },
    summaryFeedback: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeScan = mongoose.model<IResumeScan>('ResumeScan', ResumeScanSchema);

