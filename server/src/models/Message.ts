import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: {
    directAnswer?: string;
    keyPoints?: string[];
    codeSnippet?: {
      language: string;
      code: string;
      explanation?: string;
    } | null;
    interviewTip?: string;
    suggestedFollowUps?: string[];
    conversationContext?: {
      topic?: string;
      isFollowUp?: boolean;
      usedPreviousContext?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

