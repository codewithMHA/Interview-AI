import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/index.js';
import { Question } from '../models/Question.js';
import { UserQuestionStatus } from '../models/UserQuestionStatus.js';
import { Profile } from '../models/Profile.js';
import { getDBStatus } from '../config/db.js';
import { devStore } from '../services/devStore.js';
import { autoSeedDatabase } from '../utils/autoSeed.js';

export const getQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { category, topic, difficulty, search, bookmarked, completed, company } = req.query;

    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      // Self-heal: ensure MongoDB has seed questions if newly created or empty
      const totalInDb = await Question.countDocuments();
      if (totalInDb === 0) {
        await autoSeedDatabase();
      }

      const query: any = {};
      if (category && category !== 'All') query.category = category;
      if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
      if (company && company !== 'All') {
        query.companies = { $in: [new RegExp((company as string).trim(), 'i')] };
      }
      if (topic && topic !== 'All') {
        query.topic = { $regex: (topic as string).trim(), $options: 'i' };
      }

      if (search && typeof search === 'string' && search.trim()) {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { question: { $regex: search.trim(), $options: 'i' } },
          { topic: { $regex: search.trim(), $options: 'i' } },
          { answer: { $regex: search.trim(), $options: 'i' } },
          { companies: { $in: [new RegExp(search.trim(), 'i')] } },
        ];
      }

      let questions = await Question.find(query).sort({ createdAt: -1 });

      // If query returned 0 and no search filter was active, self-heal with devStore
      if (questions.length === 0 && (!search || !(search as string).trim()) && (!category || category === 'All') && (!difficulty || difficulty === 'All') && (!topic || topic === 'All') && (!company || company === 'All')) {
        const fallbackQuestions = await devStore.getQuestions(userId);
        res.status(200).json({
          success: true,
          count: fallbackQuestions.length,
          data: fallbackQuestions,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let userStatuses: any[] = [];
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        userStatuses = await UserQuestionStatus.find({ user: userId });
      }

      const statusMap = new Map();
      userStatuses.forEach((st) => statusMap.set(st.question.toString(), st));

      let result = questions.map((q) => {
        const st = statusMap.get(q._id.toString());
        return {
          ...q.toObject(),
          isBookmarked: st ? st.isBookmarked : false,
          isCompleted: st ? st.isCompleted : false,
        };
      });

      if (bookmarked === 'true') {
        result = result.filter((q) => q.isBookmarked);
      }
      if (completed === 'true') {
        result = result.filter((q) => q.isCompleted);
      }

      res.status(200).json({
        success: true,
        count: result.length,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } else {
      const result = await devStore.getQuestions(userId, {
        category: category as string,
        topic: topic as string,
        difficulty: difficulty as string,
        company: company as string,
        search: search as string,
        bookmarked: bookmarked === 'true',
        completed: completed === 'true',
      });

      res.status(200).json({
        success: true,
        count: result.length,
        data: result,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const isMongo = getDBStatus().isConnected;

    if (isMongo) {
      let question: any = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        question = await Question.findById(id);
      } else {
        question = await Question.findOne({ $or: [{ title: id }, { topic: id }] });
      }

      if (!question) {
        const fallback = await devStore.getQuestionById(id, userId);
        if (fallback) {
          res.status(200).json({
            success: true,
            data: fallback,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        res.status(404).json({ success: false, error: 'Question not found' });
        return;
      }

      let isBookmarked = false;
      let isCompleted = false;

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const st = await UserQuestionStatus.findOne({ user: userId, question: id });
        if (st) {
          isBookmarked = st.isBookmarked;
          isCompleted = st.isCompleted;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          ...question.toObject(),
          isBookmarked,
          isCompleted,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      const question = await devStore.getQuestionById(id, userId);
      if (!question) {
        res.status(404).json({ success: false, error: 'Question not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: question,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const isMongo = getDBStatus().isConnected;
    const isObjId = mongoose.Types.ObjectId.isValid(userId);

    if (isMongo && isObjId) {
      let status = await UserQuestionStatus.findOne({ user: userId, question: id });
      if (!status) {
        status = new UserQuestionStatus({
          user: userId,
          question: id,
          isBookmarked: true,
          isCompleted: false,
        });
      } else {
        status.isBookmarked = !status.isBookmarked;
      }
      await status.save();

      res.status(200).json({
        success: true,
        message: status.isBookmarked ? 'Question bookmarked' : 'Bookmark removed',
        isBookmarked: status.isBookmarked,
        timestamp: new Date().toISOString(),
      });
    } else {
      const isBookmarked = await devStore.toggleBookmark(userId, id);
      res.status(200).json({
        success: true,
        message: isBookmarked ? 'Question bookmarked' : 'Bookmark removed',
        isBookmarked,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const toggleComplete = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const isMongo = getDBStatus().isConnected;
    const isObjId = mongoose.Types.ObjectId.isValid(userId);

    if (isMongo && isObjId) {
      let status = await UserQuestionStatus.findOne({ user: userId, question: id });
      if (!status) {
        status = new UserQuestionStatus({
          user: userId,
          question: id,
          isBookmarked: false,
          isCompleted: true,
          completedAt: new Date(),
        });
      } else {
        status.isCompleted = !status.isCompleted;
        status.completedAt = status.isCompleted ? new Date() : undefined;
      }
      await status.save();

      const profile = await Profile.findOne({ user: userId });
      if (profile) {
        if (status.isCompleted) {
          profile.xpPoints = (profile.xpPoints || 0) + 15;
          profile.preparationScore = Math.min(100, (profile.preparationScore || 0) + 2);
        } else {
          profile.xpPoints = Math.max(0, (profile.xpPoints || 0) - 15);
          profile.preparationScore = Math.max(0, (profile.preparationScore || 0) - 2);
        }
        profile.level = Math.floor(profile.xpPoints / 200) + 1;
        await profile.save();
      }

      res.status(200).json({
        success: true,
        message: status.isCompleted ? 'Marked as completed (+15 XP)' : 'Marked as incomplete',
        isCompleted: status.isCompleted,
        xpPoints: profile?.xpPoints,
        level: profile?.level,
        timestamp: new Date().toISOString(),
      });
    } else {
      const isCompleted = await devStore.toggleComplete(userId, id);
      const profile = await devStore.getProfile(userId);
      res.status(200).json({
        success: true,
        message: isCompleted ? 'Marked as completed (+15 XP)' : 'Marked as incomplete',
        isCompleted,
        xpPoints: profile?.xpPoints,
        level: profile?.level,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
};

