import mongoose, { Document, Schema, Model } from 'mongoose';

export type QuestionCategory =
  | 'Data Structures & Algorithms'
  | 'Programming'
  | 'Web Development'
  | 'Database'
  | 'Computer Science';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface IQuestion extends Document {
  title: string;
  category: QuestionCategory;
  topic: string;
  difficulty: QuestionDifficulty;
  question: string;
  answer: string;
  explanation: string;
  interviewTips: string[];
  companies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Data Structures & Algorithms', 'Programming', 'Web Development', 'Database', 'Computer Science'],
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    interviewTips: {
      type: [String],
      default: [],
    },
    companies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Text search index for question title, topic, and question content
QuestionSchema.index({ title: 'text', topic: 'text', question: 'text' });

export const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

