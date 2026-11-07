import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IStarterCode {
  javascript: string;
  python: string;
  java: string;
  cpp: string;
}

export interface ICodingProblem extends Document {
  title: string;
  slug: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: IExample[];
  constraints: string[];
  starterCode: IStarterCode;
  testCases: ITestCase[];
  acceptanceRate: number;
  companies: string[];
  hints: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const TestCaseSchema = new Schema<ITestCase>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const StarterCodeSchema = new Schema<IStarterCode>(
  {
    javascript: { type: String, required: true },
    python: { type: String, required: true },
    java: { type: String, required: true },
    cpp: { type: String, required: true },
  },
  { _id: false }
);

const CodingProblemSchema = new Schema<ICodingProblem>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      required: true,
      index: true,
      enum: [
        'Arrays',
        'Strings',
        'Linked Lists',
        'Stack',
        'Queue',
        'Trees',
        'Graphs',
        'Recursion',
        'Sorting',
        'Searching',
        'Dynamic Programming',
        'Two Pointers',
        'Sliding Window',
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      index: true,
    },
    description: { type: String, required: true },
    examples: { type: [ExampleSchema], required: true },
    constraints: { type: [String], default: [] },
    starterCode: { type: StarterCodeSchema, required: true },
    testCases: { type: [TestCaseSchema], required: true },
    acceptanceRate: { type: Number, default: 75 },
    companies: { type: [String], default: [] },
    hints: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound text search index
CodingProblemSchema.index({ title: 'text', description: 'text', category: 'text' });

export const CodingProblem: Model<ICodingProblem> =
  mongoose.models.CodingProblem ||
  mongoose.model<ICodingProblem>('CodingProblem', CodingProblemSchema);

