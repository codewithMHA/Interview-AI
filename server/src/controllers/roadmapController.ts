import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Roadmap } from '../models/Roadmap.js';
import { UserRoadmapProgress } from '../models/UserRoadmapProgress.js';
import { Profile } from '../models/Profile.js';
import { devStore } from '../services/devStore.js';
import { AIService } from '../services/aiService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { SEED_ROADMAPS } from '../data/seedRoadmaps.js';

export const getRoadmaps = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      let roadmaps = await Roadmap.find().sort({ durationDays: 1 });
      if (roadmaps.length === 0 || roadmaps.some((r) => (r.totalTasks || 0) < 50)) {
        // Seed or upgrade to full 30-day curriculum
        for (const seed of SEED_ROADMAPS) {
          await Roadmap.updateOne({ slug: seed.slug }, { $set: seed }, { upsert: true });
        }
        roadmaps = await Roadmap.find().sort({ durationDays: 1 });
      }

      res.status(200).json({
        success: true,
        count: roadmaps.length,
        data: roadmaps,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const roadmaps = await devStore.getRoadmaps();
    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmapByIdOrSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const roadmap = isObjectId
        ? await Roadmap.findById(idOrSlug)
        : await Roadmap.findOne({ slug: idOrSlug });

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: `Roadmap '${idOrSlug}' not found.`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: roadmap,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const roadmap = await devStore.getRoadmapByIdOrSlug(idOrSlug);
    if (!roadmap) {
      res.status(404).json({
        success: false,
        error: `Roadmap '${idOrSlug}' not found.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: roadmap,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserActiveRoadmap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      let progress = await UserRoadmapProgress.findOne({ userId }).sort({ lastActiveAt: -1 });
      let roadmap: any = null;

      if (progress) {
        roadmap = await Roadmap.findOne({ slug: progress.roadmapId });
      }

      if (!progress || !roadmap) {
        // Auto enroll in default roadmap
        const defaultRoadmap = await Roadmap.findOne({ slug: 'full-stack-30' }) || (await Roadmap.findOne());
        if (defaultRoadmap) {
          progress = await UserRoadmapProgress.create({
            userId,
            roadmapId: defaultRoadmap.slug,
            roadmapTitle: defaultRoadmap.title,
            enrolledAt: new Date(),
            completedTasks: [],
            totalTasks: defaultRoadmap.totalTasks || 30,
            completedCount: 0,
            progressPercentage: 0,
            lastActiveAt: new Date(),
          });
          roadmap = defaultRoadmap;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          progress,
          roadmap,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const activeData = await devStore.getUserActiveRoadmap(userId);
    res.status(200).json({
      success: true,
      data: activeData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInRoadmap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { roadmapIdOrSlug } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!roadmapIdOrSlug) {
      res.status(400).json({
        success: false,
        error: 'roadmapIdOrSlug is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(roadmapIdOrSlug);
      const roadmap = isObjectId
        ? await Roadmap.findById(roadmapIdOrSlug)
        : await Roadmap.findOne({ slug: roadmapIdOrSlug });

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: `Roadmap '${roadmapIdOrSlug}' not found.`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let progress = await UserRoadmapProgress.findOne({ userId, roadmapId: roadmap.slug });
      if (!progress) {
        progress = await UserRoadmapProgress.create({
          userId,
          roadmapId: roadmap.slug,
          roadmapTitle: roadmap.title,
          enrolledAt: new Date(),
          completedTasks: [],
          totalTasks: roadmap.totalTasks || 30,
          completedCount: 0,
          progressPercentage: 0,
          lastActiveAt: new Date(),
        });
      } else {
        progress.lastActiveAt = new Date();
        await progress.save();
      }

      res.status(200).json({
        success: true,
        message: `Enrolled successfully in ${roadmap.title}`,
        data: {
          progress,
          roadmap,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const enrolled = await devStore.enrollUserRoadmap(userId, roadmapIdOrSlug);
    res.status(200).json({
      success: true,
      message: `Enrolled successfully in ${enrolled.roadmap.title}`,
      data: enrolled,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { taskId } = req.params;
    const { roadmapSlug } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!taskId) {
      res.status(400).json({
        success: false,
        error: 'taskId parameter is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const roadmap = await Roadmap.findOne({ slug: roadmapSlug });
      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: `Roadmap '${roadmapSlug}' not found.`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let progress = await UserRoadmapProgress.findOne({ userId, roadmapId: roadmap.slug });
      if (!progress) {
        progress = new UserRoadmapProgress({
          userId,
          roadmapId: roadmap.slug,
          roadmapTitle: roadmap.title,
          enrolledAt: new Date(),
          completedTasks: [],
          totalTasks: roadmap.totalTasks || 30,
          completedCount: 0,
          progressPercentage: 0,
          lastActiveAt: new Date(),
        });
      }

      const completedSet = new Set<string>(progress.completedTasks || []);
      let isCompletedNow = false;

      // Find task XP
      let taskXp = 35;
      for (const w of roadmap.weeks) {
        for (const d of w.days) {
          for (const t of d.tasks) {
            if (t.id === taskId) {
              taskXp = t.xpReward || 35;
              break;
            }
          }
        }
      }

      if (completedSet.has(taskId)) {
        completedSet.delete(taskId);
        isCompletedNow = false;
      } else {
        completedSet.add(taskId);
        isCompletedNow = true;

        // Award XP to user profile
        const profile = await Profile.findOne({ user: userId });
        if (profile) {
          profile.xpPoints += taskXp;
          profile.preparationScore = Math.min(99, profile.preparationScore + 2);
          profile.level = Math.floor(profile.xpPoints / 200) + 1;
          await profile.save();
        }
      }

      const completedTasks = Array.from(completedSet);
      progress.completedTasks = completedTasks;
      progress.completedCount = completedTasks.length;
      progress.progressPercentage = Math.round((completedTasks.length / (roadmap.totalTasks || 30)) * 100);
      progress.lastActiveAt = new Date();
      await progress.save();

      res.status(200).json({
        success: true,
        data: {
          progress,
          isCompleted: isCompletedNow,
          xpAwarded: isCompletedNow ? taskXp : 0,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const targetSlug = roadmapSlug || 'full-stack-30';
    const result = await devStore.toggleRoadmapTask(userId, targetSlug, taskId);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const generateCustomRoadmap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { role, targetCompany, weeks, dailyHours, weakTopics, customTopics } = req.body;

    if (!role || !targetCompany) {
      res.status(400).json({
        success: false,
        error: 'Target role and target dream company are required to generate a personalized AI roadmap.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const customPlan = await AIService.generateCustomRoadmap({
      role,
      targetCompany,
      weeks: Number(weeks) || 4,
      dailyHours: Number(dailyHours) || 2,
      weakTopics: Array.isArray(weakTopics) ? weakTopics : [],
      customTopics: Array.isArray(customTopics) ? customTopics : [],
    });

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const roadmapDoc = new Roadmap({
        ...customPlan,
        isCustom: true,
        userId,
      });
      await roadmapDoc.save();

      let progress: any = null;
      if (userId) {
        progress = await UserRoadmapProgress.create({
          userId,
          roadmapId: roadmapDoc.slug,
          roadmapTitle: roadmapDoc.title,
          enrolledAt: new Date(),
          completedTasks: [],
          totalTasks: roadmapDoc.totalTasks || 60,
          completedCount: 0,
          progressPercentage: 0,
          lastActiveAt: new Date(),
        });
      }

      res.status(201).json({
        success: true,
        message: 'Personalized AI Placement Roadmap generated and enrolled successfully!',
        data: {
          roadmap: roadmapDoc,
          progress,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const saved = await devStore.saveRoadmap({
      ...customPlan,
      isCustom: true,
      userId,
    });

    let progress: any = null;
    if (userId) {
      const enrollResult = await devStore.enrollUserRoadmap(userId, saved.slug);
      progress = enrollResult.progress;
    }

    res.status(201).json({
      success: true,
      message: 'Personalized AI Placement Roadmap generated and enrolled successfully!',
      data: {
        roadmap: saved,
        progress,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { company } = req.query;
    const insights = AIService.getCompanyInsights((company as string) || 'Google');
    res.status(200).json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

