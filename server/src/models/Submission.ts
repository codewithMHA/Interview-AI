import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITestResultItem {
  testCaseIndex: number;
  status: 'Passed' | 'Failed' | 'Error';
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  executionTime?: number;
  memory?: number;
  error?: string;
}

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId | string;
  problemId: mongoose.Types.ObjectId | string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  code: string;
  status:
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Compilation Error'
    | 'Runtime Error';
  runtime: number; // in milliseconds
  memory: number; // in KB
  testCasesPassed: number;
  totalTestCases: number;
  testResults: ITestResultItem[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultItemSchema = new Schema<ITestResultItem>(
  {
    testCaseIndex: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Passed', 'Failed', 'Error'] },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    actualOutput: { type: String },
    executionTime: { type: Number },
    memory: { type: Number },
    error: { type: String },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    problemId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'java', 'cpp'],
    },
    code: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Compilation Error',
        'Runtime Error',
      ],
      index: true,
    },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    testResults: { type: [TestResultItemSchema], default: [] },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

export const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema);

