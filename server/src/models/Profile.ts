import mongoose, { Document, Schema, Model } from 'mongoose';

export type TargetRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Software Engineer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI/ML Engineer';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profilePicture?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  targetRole?: TargetRole;
  experienceLevel?: ExperienceLevel;
  programmingLanguages: string[];
  skills: string[];
  githubProfile?: string;
  linkedinProfile?: string;
  preparationScore: number;
  streakCount: number;
  lastActiveDate: Date;
  xpPoints: number;
  level: number;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    degree: {
      type: String,
      trim: true,
      default: 'B.Tech / B.E. in Computer Science',
    },
    graduationYear: {
      type: Number,
      default: new Date().getFullYear() + 1,
    },
    targetRole: {
      type: String,
      enum: [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Software Engineer',
        'Data Analyst',
        'Data Scientist',
        'AI/ML Engineer',
      ],
      default: 'Software Engineer',
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    programmingLanguages: {
      type: [String],
      default: ['JavaScript', 'Python'],
    },
    skills: {
      type: [String],
      default: ['Data Structures', 'Algorithms', 'React', 'Node.js'],
    },
    githubProfile: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinProfile: {
      type: String,
      trim: true,
      default: '',
    },
    preparationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    streakCount: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    xpPoints: {
      type: Number,
      default: 120,
    },
    level: {
      type: Number,
      default: 1,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

