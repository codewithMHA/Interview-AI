import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IConversation extends Document {
  userId?: string;
  title: string;
  summary?: string;
  topic?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: String,
      index: true,
      default: 'guest',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: 'New Chat',
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    topic: {
      type: String,
      trim: true,
      default: 'General',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

