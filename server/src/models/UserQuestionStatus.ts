import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserQuestionStatus extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  isBookmarked: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserQuestionStatusSchema = new Schema<IUserQuestionStatus>(
  {
    user: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    question: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 status record per user-question pair
UserQuestionStatusSchema.index({ user: 1, question: 1 }, { unique: true });

export const UserQuestionStatus: Model<IUserQuestionStatus> =
  mongoose.models.UserQuestionStatus ||
  mongoose.model<IUserQuestionStatus>('UserQuestionStatus', UserQuestionStatusSchema);

