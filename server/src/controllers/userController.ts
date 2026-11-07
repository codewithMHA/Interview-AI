import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { Roadmap } from '../models/Roadmap.js';
import { UserRoadmapProgress } from '../models/UserRoadmapProgress.js';
import { getDBStatus } from '../config/db.js';
import { devStore } from '../services/devStore.js';
import { AuthenticatedRequest } from '../types/index.js';

const resolveMongoUserId = async (rawId?: string, email?: string): Promise<string | null> => {
  if (!rawId) return null;
  if (mongoose.Types.ObjectId.isValid(rawId)) return rawId;
  if (email) {
    const u = await User.findOne({ email: email.toLowerCase().trim() });
    if (u) return u._id.toString();
  }
  return null;
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      const validMongoId = await resolveMongoUserId(userId, req.user?.email);

      if (validMongoId) {
        let profile = await Profile.findOne({ user: validMongoId });
        if (!profile) {
          // Fallback: create default if missing
          const user = await User.findById(validMongoId);
          if (user) {
            profile = await Profile.create({
              user: user._id,
              name: user.name,
              email: user.email,
            });
          }
        }

        if (profile) {
          res.status(200).json({
            success: true,
            data: profile,
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      // Fallback for legacy devStore ID
      const profile = await devStore.getProfile(userId);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Profile not found.' });
        return;
      }
      res.status(200).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } else {
      const profile = await devStore.getProfile(userId);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Profile not found.' });
        return;
      }
      res.status(200).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const {
      name,
      college,
      degree,
      graduationYear,
      targetRole,
      experienceLevel,
      programmingLanguages,
      skills,
      githubProfile,
      linkedinProfile,
      profilePicture,
    } = req.body;

    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      const validMongoId = await resolveMongoUserId(userId, req.user?.email);

      if (validMongoId) {
        let profile = await Profile.findOne({ user: validMongoId });
        if (!profile) {
          const u = await User.findById(validMongoId);
          if (u) {
            profile = await Profile.create({
              user: u._id,
              name: u.name,
              email: u.email,
            });
          }
        }

        if (profile) {
          if (name) {
            profile.name = name.trim();
            await User.findByIdAndUpdate(validMongoId, { name: name.trim() });
          }
          if (college !== undefined) profile.college = college;
          if (degree !== undefined) profile.degree = degree;
          if (graduationYear !== undefined) profile.graduationYear = Number(graduationYear);
          if (targetRole !== undefined) profile.targetRole = targetRole;
          if (experienceLevel !== undefined) profile.experienceLevel = experienceLevel;
          if (programmingLanguages !== undefined) profile.programmingLanguages = programmingLanguages;
          if (skills !== undefined) profile.skills = skills;
          if (githubProfile !== undefined) profile.githubProfile = githubProfile;
          if (linkedinProfile !== undefined) profile.linkedinProfile = linkedinProfile;
          if (profilePicture !== undefined) profile.profilePicture = profilePicture;

          await profile.save();

          res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: profile,
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const updated = await devStore.updateProfile(userId, {
        ...(name && { name }),
        ...(college !== undefined && { college }),
        ...(degree !== undefined && { degree }),
        ...(graduationYear !== undefined && { graduationYear: Number(graduationYear) }),
        ...(targetRole !== undefined && { targetRole }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(programmingLanguages !== undefined && { programmingLanguages }),
        ...(skills !== undefined && { skills }),
        ...(githubProfile !== undefined && { githubProfile }),
        ...(linkedinProfile !== undefined && { linkedinProfile }),
        ...(profilePicture !== undefined && { profilePicture }),
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } else {
      const updated = await devStore.updateProfile(userId, {
        ...(name && { name }),
        ...(college !== undefined && { college }),
        ...(degree !== undefined && { degree }),
        ...(graduationYear !== undefined && { graduationYear: Number(graduationYear) }),
        ...(targetRole !== undefined && { targetRole }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(programmingLanguages !== undefined && { programmingLanguages }),
        ...(skills !== undefined && { skills }),
        ...(githubProfile !== undefined && { githubProfile }),
        ...(linkedinProfile !== undefined && { linkedinProfile }),
        ...(profilePicture !== undefined && { profilePicture }),
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const careerSetup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { targetRole, experienceLevel, skills, programmingLanguages } = req.body;

    if (!targetRole || !experienceLevel) {
      res.status(400).json({
        success: false,
        error: 'Target role and experience level are required to complete career setup.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isMongo = getDBStatus().isConnected;

    // Automatically resolve matching 30-day curriculum roadmap
    let matchingSlug = 'full-stack-30';
    const roleLower = (targetRole || '').toLowerCase();
    if (roleLower.includes('frontend')) {
      matchingSlug = 'frontend-30';
    } else if (roleLower.includes('backend') || roleLower.includes('cloud')) {
      matchingSlug = 'backend-30';
    } else if (roleLower.includes('ai') || roleLower.includes('data') || roleLower.includes('machine')) {
      matchingSlug = 'ai-ml-30';
    } else {
      matchingSlug = 'full-stack-30';
    }

    if (isMongo) {
      const validMongoId = await resolveMongoUserId(userId, req.user?.email);

      if (validMongoId) {
        let profile = await Profile.findOne({ user: validMongoId });
        if (!profile) {
          const u = await User.findById(validMongoId);
          if (u) {
            profile = await Profile.create({
              user: u._id,
              name: u.name,
              email: u.email,
            });
          }
        }

        if (profile) {
          profile.targetRole = targetRole;
          profile.experienceLevel = experienceLevel;
          if (skills && Array.isArray(skills)) profile.skills = skills;
          if (programmingLanguages && Array.isArray(programmingLanguages)) {
            profile.programmingLanguages = programmingLanguages;
          }
          profile.isOnboarded = true;
          profile.xpPoints += 50; // XP reward for completing career onboarding!

          await profile.save();

          // Ensure user is enrolled into the matching 30-day placement roadmap
          const targetRoadmap = (await Roadmap.findOne({ slug: matchingSlug })) || (await Roadmap.findOne());
          let activeRoadmapTitle = 'Full-Stack Developer 30-Day Sprint';
          if (targetRoadmap) {
            activeRoadmapTitle = targetRoadmap.title;
            await UserRoadmapProgress.findOneAndUpdate(
              { userId: validMongoId, roadmapId: targetRoadmap.slug },
              {
                $setOnInsert: {
                  userId: validMongoId,
                  roadmapId: targetRoadmap.slug,
                  roadmapTitle: targetRoadmap.title,
                  enrolledAt: new Date(),
                  completedTasks: [],
                  totalTasks: targetRoadmap.totalTasks || 30,
                  completedCount: 0,
                  progressPercentage: 0,
                },
                $set: {
                  lastActiveAt: new Date(),
                },
              },
              { upsert: true, new: true }
            );
          }

          res.status(200).json({
            success: true,
            message: 'Career setup completed successfully! Welcome to your personalized placement roadmap.',
            data: profile,
            activeRoadmap: {
              slug: matchingSlug,
              title: activeRoadmapTitle,
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const existing = await devStore.getProfile(userId);
      const updated = await devStore.updateProfile(userId, {
        targetRole,
        experienceLevel,
        skills: skills || existing?.skills || [],
        programmingLanguages: programmingLanguages || existing?.programmingLanguages || [],
        isOnboarded: true,
        xpPoints: (existing?.xpPoints || 100) + 50,
      });

      const enrolled = await devStore.enrollUserRoadmap(userId, matchingSlug);

      res.status(200).json({
        success: true,
        message: 'Career setup completed successfully! Welcome to your personalized placement roadmap.',
        data: updated,
        activeRoadmap: {
          slug: matchingSlug,
          title: enrolled?.roadmap?.title || 'Full-Stack Developer 30-Day Sprint',
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      const existing = await devStore.getProfile(userId);
      const updated = await devStore.updateProfile(userId, {
        targetRole,
        experienceLevel,
        skills: skills || existing?.skills || [],
        programmingLanguages: programmingLanguages || existing?.programmingLanguages || [],
        isOnboarded: true,
        xpPoints: (existing?.xpPoints || 100) + 50,
      });

      const enrolled = await devStore.enrollUserRoadmap(userId, matchingSlug);

      res.status(200).json({
        success: true,
        message: 'Career setup completed successfully! Welcome to your personalized placement roadmap.',
        data: updated,
        activeRoadmap: {
          slug: matchingSlug,
          title: enrolled?.roadmap?.title || 'Full-Stack Developer 30-Day Sprint',
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

