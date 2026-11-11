import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/index.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Question } from '../models/Question.js';
import { UserQuestionStatus } from '../models/UserQuestionStatus.js';
import { Submission } from '../models/Submission.js';
import { MockInterview } from '../models/MockInterview.js';
import { CodingProblem } from '../models/CodingProblem.js';
import { UserRoadmapProgress } from '../models/UserRoadmapProgress.js';
import { getDBStatus } from '../config/db.js';
import { devStore } from '../services/devStore.js';
import { autoSeedDatabase } from '../utils/autoSeed.js';

export const getDashboardOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const isMongo = getDBStatus().isConnected;

    let profile: any = null;
    let submissions: any[] = [];
    let interviews: any[] = [];
    let roadmapProgress: any = null;
    let completedCount = 0;
    let bookmarkedCount = 0;
    let totalQuestions = 0;
    let allProblems: any[] = [];
    let completedQuestionsList: any[] = [];

    if (isMongo) {
      totalQuestions = await Question.countDocuments();
      let problemCount = await CodingProblem.countDocuments();

      if (totalQuestions === 0 || problemCount === 0) {
        await autoSeedDatabase();
        totalQuestions = await Question.countDocuments();
      }

      let resolvedUserId = userId;
      if (!mongoose.Types.ObjectId.isValid(userId) && req.user?.email) {
        const u = await User.findOne({ email: req.user.email.toLowerCase().trim() });
        if (u) {
          resolvedUserId = u._id.toString();
        }
      }

      if (mongoose.Types.ObjectId.isValid(resolvedUserId)) {
        profile = await Profile.findOne({ user: resolvedUserId });
        const questionStatuses = await UserQuestionStatus.find({
          user: resolvedUserId,
          isCompleted: true,
        }).populate('question');
        completedCount = questionStatuses.length;
        completedQuestionsList = questionStatuses.map((qs: any) => qs.question).filter(Boolean);
        bookmarkedCount = await UserQuestionStatus.countDocuments({
          user: resolvedUserId,
          isBookmarked: true,
        });
        submissions = await Submission.find({ userId: resolvedUserId }).sort({ createdAt: -1 }).limit(200).lean();
        interviews = await MockInterview.find(
          { userId: resolvedUserId },
          'role category interviewType status overallScore createdAt completedAt'
        )
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();
        roadmapProgress = await UserRoadmapProgress.findOne({ userId: resolvedUserId }).sort({ lastActiveAt: -1 });
        allProblems = await CodingProblem.find({}, 'title slug category difficulty companies');
      } else {
        profile = await devStore.getProfile(userId);
        const allQuestions = await devStore.getQuestions(userId);
        totalQuestions = allQuestions.length;
        completedQuestionsList = allQuestions.filter((q) => q.isCompleted);
        completedCount = completedQuestionsList.length;
        bookmarkedCount = allQuestions.filter((q) => q.isBookmarked).length;
        submissions = await devStore.getUserSubmissions(userId);
        interviews = await devStore.getUserMockInterviews(userId);
        const active = await devStore.getUserActiveRoadmap(userId);
        roadmapProgress = active?.progress || null;
        allProblems = await devStore.getProblems(userId);
      }
    } else {
      profile = await devStore.getProfile(userId);
      const allQuestions = await devStore.getQuestions(userId);
      totalQuestions = allQuestions.length;
      completedQuestionsList = allQuestions.filter((q) => q.isCompleted);
      completedCount = completedQuestionsList.length;
      bookmarkedCount = allQuestions.filter((q) => q.isBookmarked).length;
      submissions = await devStore.getUserSubmissions(userId);
      interviews = await devStore.getUserMockInterviews(userId);
      const active = await devStore.getUserActiveRoadmap(userId);
      roadmapProgress = active?.progress || null;
      allProblems = await devStore.getProblems(userId);
    }

    const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted');
    const completedInterviews = interviews.filter((i) => i.status === 'completed');
    const completedTasksCount = roadmapProgress?.completedTasks?.length || 0;

    // Coding Performance Breakdown
    const solvedProblemSlugs = new Set<string>();
    acceptedSubmissions.forEach((s) => {
      if (s.problemId) solvedProblemSlugs.add(s.problemId);
      if (s.problemSlug) solvedProblemSlugs.add(s.problemSlug);
    });

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    const countedProblems = new Set<string>();

    allProblems.forEach((p: any) => {
      const pId = p._id?.toString() || p.id;
      const pSlug = p.slug;
      const isSolved =
        p.isSolved ||
        (pId && solvedProblemSlugs.has(pId)) ||
        (pSlug && solvedProblemSlugs.has(pSlug));

      if (isSolved && !countedProblems.has(pSlug || pId)) {
        countedProblems.add(pSlug || pId);
        const diff = (p.difficulty || 'Easy').toLowerCase();
        if (diff === 'hard') hardSolved++;
        else if (diff === 'medium') mediumSolved++;
        else easySolved++;
      }
    });

    const totalSolved = easySolved + mediumSolved + hardSolved;
    const totalSubmissions = submissions.length;
    const accuracyRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100)
        : 0;

    // Dynamic Coding Score (Max 35 pts)
    let codeScore = 0;
    if (totalSolved > 0) {
      const accuracyMultiplier = 0.75 + 0.25 * (accuracyRate / 100);
      const rawCodingPoints =
        (easySolved * 1.5 + mediumSolved * 2.8 + hardSolved * 4.5) * accuracyMultiplier;
      codeScore = Math.min(35, Math.max(0, Math.round(rawCodingPoints)));
    }

    // Mock Interview Evaluation (Max 35 pts)
    let interviewScore = 0;
    let technicalScore = 0;
    let hrScore = 0;
    let evaluatedAvg = 0;

    if (completedInterviews.length > 0) {
      const count = completedInterviews.length;
      evaluatedAvg = Math.round(
        completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / count
      );

      const techInterviews = completedInterviews.filter(
        (i) => i.category === 'Technical' || i.category === 'System Design' || !i.category
      );
      if (techInterviews.length > 0) {
        technicalScore = Math.round(
          techInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            techInterviews.length
        );
      }

      const hrInterviews = completedInterviews.filter(
        (i) => i.category === 'HR' || i.category === 'Behavioral'
      );
      if (hrInterviews.length > 0) {
        hrScore = Math.round(
          hrInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            hrInterviews.length
        );
      }

      const roundsMultiplier = Math.min(1.0, 0.75 + 0.25 * ((count - 1) / 1));
      interviewScore = Math.min(
        35,
        Math.max(0, Math.round((evaluatedAvg / 100) * 35 * roundsMultiplier))
      );
    }

    // Roadmap & Theory (Max 30 pts)
    const roadmapScore = Math.min(
      30,
      Math.round(((completedTasksCount + completedCount) / 25) * 30)
    );

    // Overall Genuine Placement Readiness Score (0 to 100%)
    const preparationScore = Math.min(100, codeScore + interviewScore + roadmapScore);

    // Dynamic Category Scores
    const categoryScores = {
      codingAndAlgorithms: Math.min(100, Math.round((codeScore / 35) * 100)),
      systemDesignAndArchitecture: technicalScore > 0
        ? Math.round(technicalScore * 0.7 + completedTasksCount * 4)
        : Math.min(100, completedTasksCount * 8),
      databaseAndSQL: Math.min(100, Math.round((completedCount / 12) * 100)),
      problemSolvingAndLogic: accuracyRate > 0
        ? Math.min(100, Math.round(accuracyRate * 0.5 + totalSolved * 5))
        : totalSolved > 0 ? Math.min(100, totalSolved * 10) : 0,
      communicationAndViva: hrScore > 0 ? hrScore : 0,
    };

    // Quick Company Readiness for Amazon & Google & TCS
    const companyReadiness = [
      {
        company: 'Amazon',
        role: 'SDE-1',
        readinessScore: Math.min(
          100,
          Math.round((totalSolved / 8) * 50) +
          (completedInterviews.length > 0 ? Math.round((evaluatedAvg / 70) * 30) : 0) +
          Math.min(20, Math.round((completedCount / 15) * 20))
        ),
      },
      {
        company: 'Google',
        role: 'Software Engineer',
        readinessScore: Math.min(
          100,
          Math.round((totalSolved / 10) * 50) +
          (completedInterviews.length > 0 ? Math.round((evaluatedAvg / 80) * 30) : 0) +
          Math.min(20, Math.round((completedCount / 15) * 20))
        ),
      },
      {
        company: 'TCS Digital',
        role: 'Prime Associate',
        readinessScore: Math.min(
          100,
          Math.round((totalSolved / 5) * 50) +
          (completedInterviews.length > 0 ? Math.round((evaluatedAvg / 60) * 30) : 0) +
          Math.min(20, Math.round((completedCount / 15) * 20))
        ),
      },
    ];

    // Build real recent activity list from actual user actions (empty array if brand new user)
    const realActivities: any[] = [];
    submissions.slice(0, 3).forEach((s) => {
      const prob = allProblems.find(
        (p: any) => p._id === s.problemId || p.slug === s.problemId
      );
      const dateObj = new Date(s.createdAt);
      realActivities.push({
        id: `sub-${s._id || s.id}`,
        title: prob?.title || s.problemTitle || s.problemSlug || 'Coding Problem',
        type: `Coding Sandbox (${s.language || 'Code'})`,
        timestamp: !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : 'Recently',
        score: s.status === 'Accepted' ? 'Accepted ✓' : s.status,
        rawDate: dateObj.getTime() || 0,
      });
    });

    completedInterviews.slice(0, 3).forEach((i) => {
      const dateObj = new Date(i.completedAt || i.createdAt);
      realActivities.push({
        id: `mock-${i._id || i.id}`,
        title: `${i.role || 'Placement'} Mock Round`,
        type: 'Mock Interview',
        timestamp: !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : 'Recently',
        score: `${i.overallScore || 0}/100`,
        rawDate: dateObj.getTime() || 0,
      });
    });

    realActivities.sort((a, b) => b.rawDate - a.rawDate);
    const recentActivity = realActivities.slice(0, 4);

    const targetRole = profile?.targetRole || 'Software Engineer';
    const streakCount = profile?.streakCount ?? (realActivities.length > 0 ? 1 : 0);
    const xpPoints = profile?.xpPoints ?? 0;
    const level = Math.floor(xpPoints / 200) + 1;

    res.status(200).json({
      success: true,
      data: {
        preparationScore,
        streakCount,
        xpPoints,
        level,
        targetRole,
        experienceLevel: profile?.experienceLevel || 'Beginner',
        metrics: {
          totalQuestions,
          completedQuestions: completedCount,
          bookmarkedQuestions: bookmarkedCount,
          codingProgress: totalSolved,
          technicalScore,
          hrScore,
          mockInterviewsCompleted: completedInterviews.length,
        },
        codingPerformance: {
          easySolved,
          mediumSolved,
          hardSolved,
          totalSolved,
          accuracyRate,
        },
        categoryScores,
        companyReadiness,
        nextRecommendedActivity: {
          title: `Start ${targetRole} Core Placement Preparation`,
          topic: 'DSA & Algorithms',
          category: 'Technical',
          estimatedMinutes: 20,
          type: 'question',
        },
        aiRecommendation: {
          title: 'Master Core Coding & System Architecture',
          reason: `Sharpening your DSA patterns and technical interview answers will directly increase your placement readiness score up to 100%.`,
          suggestedQuestion: 'How does Hash Map handle collisions under the hood?',
          topic: 'DSA',
        },
        recentActivity,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
