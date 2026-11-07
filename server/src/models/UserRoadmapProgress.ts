import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserRoadmapProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: string; // Roadmap slug or ObjectId
  roadmapTitle: string;
  enrolledAt: Date;
  completedTasks: string[]; // array of completed task IDs
  totalTasks: number;
  completedCount: number;
  progressPercentage: number;
  lastActiveAt: Date;
  customNotes?: Record<string, string>; // taskId -> student notes
}

const UserRoadmapProgressSchema = new Schema<IUserRoadmapProgress>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    roadmapId: { type: String, required: true, index: true },
    roadmapTitle: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
    completedTasks: [{ type: String }],
    totalTasks: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    customNotes: { type: Map, of: String, default: {} },
  },
  {
    timestamps: true,
  }
);

// One active progress tracking per user & roadmap
UserRoadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

export const UserRoadmapProgress: Model<IUserRoadmapProgress> =
  mongoose.models.UserRoadmapProgress ||
  mongoose.model<IUserRoadmapProgress>('UserRoadmapProgress', UserRoadmapProgressSchema);

