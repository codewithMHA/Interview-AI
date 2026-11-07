import mongoose, { Document, Schema, Model } from 'mongoose';
import { SeedRoadmap } from '../data/seedRoadmaps.js';

export interface IRoadmapDocument extends Document, Omit<SeedRoadmap, 'id'> {
  isCustom?: boolean;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapTaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['concept', 'problem', 'question', 'interview', 'project'],
      default: 'concept',
    },
    targetUrl: { type: String },
    estimatedMinutes: { type: Number, default: 30 },
    xpReward: { type: Number, default: 30 },
    description: { type: String, required: true },
    keyTakeaways: [{ type: String }],
  },
  { _id: false }
);

const RoadmapDaySchema = new Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    focusArea: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 60 },
    tasks: [RoadmapTaskSchema],
  },
  { _id: false }
);

const RoadmapWeekSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    focusArea: { type: String, required: true },
    milestoneObjective: { type: String, required: true },
    days: [RoadmapDaySchema],
  },
  { _id: false }
);

const RoadmapSchema = new Schema<IRoadmapDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    role: { type: String, required: true },
    durationDays: { type: Number, default: 30 },
    level: {
      type: String,
      enum: ['Beginner to Intermediate', 'Intermediate to Advanced', 'All Levels'],
      default: 'All Levels',
    },
    description: { type: String, required: true },
    targetCompanies: [{ type: String }],
    icon: { type: String, default: 'Compass' },
    badgeColor: { type: String, default: 'brand' },
    totalTasks: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    isCustom: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    weeks: [RoadmapWeekSchema],
  },
  {
    timestamps: true,
  }
);

export const Roadmap: Model<IRoadmapDocument> =
  mongoose.models.Roadmap || mongoose.model<IRoadmapDocument>('Roadmap', RoadmapSchema);

