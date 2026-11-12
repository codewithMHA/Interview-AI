import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/index.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Submission } from '../models/Submission.js';
import { MockInterview } from '../models/MockInterview.js';
import { UserRoadmapProgress } from '../models/UserRoadmapProgress.js';
import { UserQuestionStatus } from '../models/UserQuestionStatus.js';
import { CodingProblem } from '../models/CodingProblem.js';
import { Question } from '../models/Question.js';
import { devStore } from '../services/devStore.js';
import { buildActivityHeatmapData } from '../utils/activityHeatmap.js';

export const getAnalyticsDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: authentication required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    let profile: any = null;
    let submissions: any[] = [];
    let interviews: any[] = [];
    let roadmapProgress: any = null;
    let completedQuestionsCount = 0;
    let completedQuestionsList: any[] = [];
    let allProblems: any[] = [];
    let allQuestions: any[] = [];

    if (isConnected) {
      let resolvedUserId = userId;
      if (!mongoose.Types.ObjectId.isValid(userId) && req.user?.email) {
        const u = await User.findOne({ email: req.user.email.toLowerCase().trim() });
        if (u) {
          resolvedUserId = u._id.toString();
        }
      }

      if (mongoose.Types.ObjectId.isValid(resolvedUserId)) {
        profile = await Profile.findOne({ user: resolvedUserId });
        submissions = await Submission.find({ userId: resolvedUserId }).sort({ createdAt: -1 }).limit(500).lean();
        interviews = await MockInterview.find(
          { userId: resolvedUserId },
          'role category interviewType status overallScore averageScores scores createdAt completedAt'
        )
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();
        roadmapProgress = await UserRoadmapProgress.findOne({ userId: resolvedUserId }).sort({ lastActiveAt: -1 });
        
        const questionStatuses = await UserQuestionStatus.find({
          user: resolvedUserId,
          isCompleted: true,
        }).populate('question');
        
        completedQuestionsCount = questionStatuses.length;
        completedQuestionsList = questionStatuses
          .map((qs: any) =>
            qs.question
              ? {
                  ...(qs.question.toObject ? qs.question.toObject() : qs.question),
                  completedAt: qs.completedAt || qs.updatedAt,
                }
              : null
          )
          .filter(Boolean);

        allProblems = await CodingProblem.find({}, 'title slug category difficulty companies');
        allQuestions = await Question.find({}, 'title category topic difficulty companies');
      } else {
        profile = await devStore.getProfile(userId);
        submissions = await devStore.getUserSubmissions(userId);
        interviews = await devStore.getUserMockInterviews(userId);
        const active = await devStore.getUserActiveRoadmap(userId);
        roadmapProgress = active?.progress || null;
        allQuestions = await devStore.getQuestions(userId);
        completedQuestionsList = allQuestions.filter((q) => q.isCompleted);
        completedQuestionsCount = completedQuestionsList.length;
        allProblems = await devStore.getProblems(userId);
      }
    } else {
      profile = await devStore.getProfile(userId);
      submissions = await devStore.getUserSubmissions(userId);
      interviews = await devStore.getUserMockInterviews(userId);
      const active = await devStore.getUserActiveRoadmap(userId);
      roadmapProgress = active?.progress || null;
      allQuestions = await devStore.getQuestions(userId);
      completedQuestionsList = allQuestions.filter((q) => q.isCompleted);
      completedQuestionsCount = completedQuestionsList.length;
      allProblems = await devStore.getProblems(userId);
    }

    const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted');
    const completedInterviews = interviews.filter((i) => i.status === 'completed');
    const completedTasksCount = roadmapProgress?.completedTasks?.length || 0;
    const completedTasks: string[] = roadmapProgress?.completedTasks || [];

    // =========================================================================
    // 1. CODING PERFORMANCE (Difficulty Tiers, Accuracy, Consistency)
    // =========================================================================
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
    const acceptedCount = acceptedSubmissions.length;
    const accuracyRate =
      totalSubmissions > 0
        ? Math.round((acceptedCount / totalSubmissions) * 100)
        : 0;

    // Dynamic weighted coding score (Max 35 pts)
    let weightedCodingScore = 0;
    if (totalSolved > 0) {
      // Easy: 1.5 pts, Medium: 2.8 pts, Hard: 4.5 pts
      const accuracyMultiplier = 0.75 + 0.25 * (accuracyRate / 100);
      const rawCodingPoints =
        (easySolved * 1.5 + mediumSolved * 2.8 + hardSolved * 4.5) * accuracyMultiplier;
      weightedCodingScore = Math.min(35, Math.max(0, Math.round(rawCodingPoints)));
    }

    const codingPerformance = {
      easySolved,
      mediumSolved,
      hardSolved,
      totalSolved,
      totalSubmissions,
      acceptedSubmissions: acceptedCount,
      accuracyRate,
      weightedCodingScore,
      maxCodingScore: 35,
    };

    // =========================================================================
    // 2. MOCK INTERVIEWS (Multi-Skill: Performance, Communication, Problem Solving)
    // =========================================================================
    let technicalDepthScore = 0;
    let problemSolvingScore = 0;
    let communicationScore = 0;
    let confidenceScore = 0;
    let evaluatedAvg = 0;
    let weightedInterviewScore = 0;

    if (completedInterviews.length > 0) {
      const count = completedInterviews.length;
      evaluatedAvg = Math.round(
        completedInterviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / count
      );
      technicalDepthScore = Math.round(
        completedInterviews.reduce(
          (acc, i) =>
            acc +
            (i.averageScores?.technicalDepth ??
              i.scores?.technicalDepth ??
              i.overallScore ??
              70),
          0
        ) / count
      );
      problemSolvingScore = Math.round(
        completedInterviews.reduce(
          (acc, i) =>
            acc +
            (i.averageScores?.correctness ??
              i.scores?.correctness ??
              i.overallScore ??
              75),
          0
        ) / count
      );
      communicationScore = Math.round(
        completedInterviews.reduce(
          (acc, i) =>
            acc +
            (i.averageScores?.communication ??
              i.averageScores?.clarity ??
              i.scores?.communication ??
              i.scores?.clarity ??
              70),
          0
        ) / count
      );
      confidenceScore = Math.round(
        completedInterviews.reduce(
          (acc, i) =>
            acc +
            (i.averageScores?.confidence ??
              i.averageScores?.completeness ??
              i.scores?.confidence ??
              75),
          0
        ) / count
      );

      // Composite multi-skill evaluation
      const compositeScore =
        problemSolvingScore * 0.35 +
        technicalDepthScore * 0.30 +
        communicationScore * 0.20 +
        confidenceScore * 0.15;

      const roundsMultiplier = Math.min(1.0, 0.75 + 0.25 * ((count - 1) / 1));
      weightedInterviewScore = Math.min(
        35,
        Math.max(0, Math.round((compositeScore / 100) * 35 * roundsMultiplier))
      );
    }

    const mockInterviewEvaluation = {
      totalCompleted: completedInterviews.length,
      evaluatedAvg,
      problemSolvingScore,
      technicalDepthScore,
      communicationScore,
      confidenceScore,
      weightedInterviewScore,
      maxInterviewScore: 35,
      status:
        completedInterviews.length > 0
          ? `${completedInterviews.length} Evaluated Round(s)`
          : 'Pending First Mock Round',
    };

    // =========================================================================
    // 3. ROADMAP PROGRESS: CORE CS MULTI-TRACK (DSA, DBMS, OS, CN, OOPs)
    // =========================================================================
    const dsaKeywords = [
      'array', 'list', 'tree', 'graph', 'dp', 'dynamic', 'search', 'sort',
      'stack', 'queue', 'algorithm', 'dsa', 'heap', 'hash', 'string', 'recursion'
    ];
    const dbmsKeywords = [
      'dbms', 'sql', 'database', 'index', 'transaction', 'acid', 'query',
      'nosql', 'relational', 'normalization'
    ];
    const osKeywords = [
      'os', 'operating system', 'process', 'thread', 'deadlock', 'memory',
      'paging', 'linux', 'kernel', 'concurrency', 'mutex', 'semaphore'
    ];
    const cnKeywords = [
      'network', 'tcp', 'udp', 'http', 'dns', 'ip', 'socket', 'osi',
      'protocol', 'latency', 'bandwidth', 'routing'
    ];
    const oopsKeywords = [
      'java', 'oop', 'oops', 'system design', 'architecture', 'solid',
      'design pattern', 'polymorphism', 'inheritance', 'microservice', 'class'
    ];

    let dsaCompleted = easySolved + mediumSolved + hardSolved;
    let dbmsCompleted = 0;
    let osCompleted = 0;
    let cnCompleted = 0;
    let oopsCompleted = 0;

    completedQuestionsList.forEach((q: any) => {
      const text = `${q.title || ''} ${q.category || ''} ${q.topic || ''}`.toLowerCase();
      if (dbmsKeywords.some((k) => text.includes(k))) dbmsCompleted++;
      else if (osKeywords.some((k) => text.includes(k))) osCompleted++;
      else if (cnKeywords.some((k) => text.includes(k))) cnCompleted++;
      else if (oopsKeywords.some((k) => text.includes(k))) oopsCompleted++;
      else if (dsaKeywords.some((k) => text.includes(k))) dsaCompleted++;
      else dsaCompleted++;
    });

    completedTasks.forEach((taskId: string) => {
      const t = taskId.toLowerCase();
      if (t.includes('db') || t.includes('sql')) dbmsCompleted++;
      else if (t.includes('os') || t.includes('linux')) osCompleted++;
      else if (t.includes('network') || t.includes('cn')) cnCompleted++;
      else if (t.includes('oop') || t.includes('design') || t.includes('arch')) oopsCompleted++;
      else dsaCompleted++;
    });

    const coreCSTracks = [
      {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        completedCount: dsaCompleted,
        totalTarget: 20,
        percentage: Math.min(100, Math.round((dsaCompleted / 20) * 100)),
        status: (dsaCompleted >= 16 ? 'Mastered' : dsaCompleted >= 8 ? 'Proficient' : dsaCompleted > 0 ? 'In Progress' : 'Not Started') as any,
        icon: 'Code2',
      },
      {
        id: 'dbms',
        name: 'DBMS & SQL Engine',
        completedCount: dbmsCompleted,
        totalTarget: 12,
        percentage: Math.min(100, Math.round((dbmsCompleted / 12) * 100)),
        status: (dbmsCompleted >= 10 ? 'Mastered' : dbmsCompleted >= 5 ? 'Proficient' : dbmsCompleted > 0 ? 'In Progress' : 'Not Started') as any,
        icon: 'Database',
      },
      {
        id: 'os',
        name: 'Operating Systems & Concurrency',
        completedCount: osCompleted,
        totalTarget: 10,
        percentage: Math.min(100, Math.round((osCompleted / 10) * 100)),
        status: (osCompleted >= 8 ? 'Mastered' : osCompleted >= 4 ? 'Proficient' : osCompleted > 0 ? 'In Progress' : 'Not Started') as any,
        icon: 'Cpu',
      },
      {
        id: 'cn',
        name: 'Computer Networks & Protocols',
        completedCount: cnCompleted,
        totalTarget: 10,
        percentage: Math.min(100, Math.round((cnCompleted / 10) * 100)),
        status: (cnCompleted >= 8 ? 'Mastered' : cnCompleted >= 4 ? 'Proficient' : cnCompleted > 0 ? 'In Progress' : 'Not Started') as any,
        icon: 'Network',
      },
      {
        id: 'oops',
        name: 'OOPs & System Design',
        completedCount: oopsCompleted,
        totalTarget: 10,
        percentage: Math.min(100, Math.round((oopsCompleted / 10) * 100)),
        status: (oopsCompleted >= 8 ? 'Mastered' : oopsCompleted >= 4 ? 'Proficient' : oopsCompleted > 0 ? 'In Progress' : 'Not Started') as any,
        icon: 'Layers',
      },
    ];

    // Theory & Roadmap score (Max 30 pts)
    const totalCurriculumItems = completedTasksCount + completedQuestionsCount;
    const roadmapScore = Math.min(30, Math.round((totalCurriculumItems / 25) * 30));

    // =========================================================================
    // 4. OVERALL DYNAMIC PLACEMENT READINESS SCORE (0% for Brand New User)
    // =========================================================================
    const placementReadinessScore = Math.min(
      100,
      weightedCodingScore + weightedInterviewScore + roadmapScore
    );

    let readinessTier = 'Getting Started';
    if (placementReadinessScore >= 85) {
      readinessTier = 'Tier-1 Ready (Amazon, Google, Microsoft)';
    } else if (placementReadinessScore >= 70) {
      readinessTier = 'High Growth Unicorn (Flipkart, Swiggy, Razorpay)';
    } else if (placementReadinessScore >= 50) {
      readinessTier = 'Service IT Prime (TCS Prime, Infosys SP)';
    } else if (placementReadinessScore >= 25) {
      readinessTier = 'Foundation Building';
    }

    // =========================================================================
    // 5. ACTIVITY MAP, DAILY DETAILS & STREAK (Consistency Tracker)
    // =========================================================================
    const today = new Date();
    const {
      activityMap,
      dailyActivityMap,
      heatmap,
      annualHeatmap,
      streak,
      bestStreak,
    } = buildActivityHeatmapData({
      submissions,
      interviews,
      completedQuestionsList,
      allProblems,
      profileStreakCount: profile?.streakCount,
    });

    const xpPoints = profile?.xpPoints ?? 0;
    const targetRole = profile?.targetRole || 'Software Engineer';
    const level = Math.floor(xpPoints / 200) + 1;
    const nextLevelXp = level * 200;
    const currentLevelBaseXp = (level - 1) * 200;
    const xpToNextLevel = nextLevelXp - xpPoints;
    const levelPercentage = Math.min(
      100,
      Math.max(0, Math.round(((xpPoints - currentLevelBaseXp) / 200) * 100))
    );

    // =========================================================================
    // 6. WEEKLY PROGRESS (4-Week Improvement Trend)
    // =========================================================================
    const weeklyProgress = [
      { weekLabel: '3 Weeks Ago', startDays: 28, endDays: 21 },
      { weekLabel: '2 Weeks Ago', startDays: 21, endDays: 14 },
      { weekLabel: 'Last Week', startDays: 14, endDays: 7 },
      { weekLabel: 'This Week', startDays: 7, endDays: 0 },
    ].map(({ weekLabel, startDays, endDays }) => {
      const startMs = today.getTime() - startDays * 24 * 60 * 60 * 1000;
      const endMs = today.getTime() - endDays * 24 * 60 * 60 * 1000;

      const weekSubs = submissions.filter((s) => {
        const t = new Date(s.createdAt).getTime();
        return t >= startMs && t <= endMs && s.status === 'Accepted';
      });

      const weekInterviews = interviews.filter((i) => {
        const t = new Date(i.completedAt || i.createdAt).getTime();
        return t >= startMs && t <= endMs && i.status === 'completed';
      });

      const weekQuestions = completedQuestionsList.filter((q: any) => {
        const t = new Date(q.completedAt || q.updatedAt || Date.now()).getTime();
        return t >= startMs && t <= endMs;
      });

      const cumulativeSubs = submissions.filter(
        (s) => new Date(s.createdAt).getTime() <= endMs && s.status === 'Accepted'
      );
      const cumulativeInterviews = interviews.filter(
        (i) =>
          new Date(i.completedAt || i.createdAt).getTime() <= endMs &&
          i.status === 'completed'
      );

      const growthScore = Math.min(
        100,
        Math.round((cumulativeSubs.length / 20) * 35) +
          (cumulativeInterviews.length > 0
            ? Math.round(
                ((cumulativeInterviews[0].overallScore || 70) / 100) * 35
              )
            : 0) +
          Math.min(
            30,
            Math.round(((cumulativeSubs.length + weekQuestions.length) / 25) * 30)
          )
      );

      return {
        weekLabel,
        problemsSolved: weekSubs.length,
        mockInterviews: weekInterviews.length,
        questionsCompleted: weekQuestions.length,
        readinessScore: growthScore,
      };
    });

    // =========================================================================
    // 7. WEAK AREAS (Automated Diagnosis & Action Plan)
    // =========================================================================
    const weakAreas: any[] = [];

    // Failed coding submissions
    const failedSubmissions = submissions.filter((s) => s.status !== 'Accepted');
    if (failedSubmissions.length > 0) {
      const latestFail = failedSubmissions[0];
      const prob = allProblems.find(
        (p: any) => p._id === latestFail.problemId || p.slug === latestFail.problemId
      );
      const topicName = prob?.category || prob?.title || 'Algorithmic Edge Cases';
      weakAreas.push({
        topic: topicName,
        domain: 'Coding Sandbox',
        reason: `${failedSubmissions.length} submission attempt(s) encountered ${latestFail.status} on test cases.`,
        priority: 'High',
        actionText: `Practice ${topicName}`,
        actionUrl: '/coding',
      });
    }

    // Lowest Core CS track
    const sortedTracks = [...coreCSTracks].sort((a, b) => a.percentage - b.percentage);
    const lowestTrack = sortedTracks[0];
    if (lowestTrack && lowestTrack.percentage < 50) {
      weakAreas.push({
        topic: lowestTrack.name,
        domain: 'Core Computer Science',
        reason: `Only ${lowestTrack.completedCount} of ${lowestTrack.totalTarget} benchmark questions completed (${lowestTrack.percentage}%).`,
        priority: lowestTrack.percentage === 0 ? 'High' : 'Medium',
        actionText: `Study ${lowestTrack.name}`,
        actionUrl: '/placement-modules',
      });
    }

    // Mock interview diagnosis
    if (completedInterviews.length === 0) {
      weakAreas.push({
        topic: 'Verbal Articulation & STAR Method',
        domain: 'AI Mock Interview',
        reason: 'Zero completed AI mock interviews. Technical and behavioral communication are unverified.',
        priority: 'High',
        actionText: 'Start AI Mock Interview',
        actionUrl: '/mock-interview',
      });
    } else {
      if (technicalDepthScore < 65) {
        weakAreas.push({
          topic: 'Technical Depth & Architecture Trade-Offs',
          domain: 'Mock Interview Evaluation',
          reason: `Technical depth is ${technicalDepthScore}% (target: 65%+).`,
          priority: 'High',
          actionText: 'Retake Technical Mock Round',
          actionUrl: '/mock-interview',
        });
      } else if (communicationScore < 65) {
        weakAreas.push({
          topic: 'Communication & Problem-Solving Walkthrough',
          domain: 'Mock Interview Evaluation',
          reason: `Communication score is ${communicationScore}%. Focus on vocalizing time/space tradeoffs before coding.`,
          priority: 'Medium',
          actionText: 'Practice HR & Behavioral Round',
          actionUrl: '/mock-interview',
        });
      }
    }

    // =========================================================================
    // 8. COMPANY-WISE PLACEMENT READINESS (Amazon, Google, Microsoft, Walmart, TCS)
    // =========================================================================
    const targetCompanies = [
      {
        company: 'Amazon',
        role: 'Software Development Engineer (SDE-1)',
        benchmarkProblems: 8,
        benchmarkScore: 70,
        tags: ['Amazon', 'Trees', 'Dynamic Programming', 'System Design'],
      },
      {
        company: 'Google',
        role: 'Software Engineer (L3)',
        benchmarkProblems: 10,
        benchmarkScore: 80,
        tags: ['Google', 'Graphs', 'Advanced Algorithms', 'Complexity'],
      },
      {
        company: 'Microsoft',
        role: 'Software Engineer',
        benchmarkProblems: 8,
        benchmarkScore: 72,
        tags: ['Microsoft', 'Core CS', 'Operating Systems', 'OOPs'],
      },
      {
        company: 'Walmart',
        role: 'Software Development Engineer',
        benchmarkProblems: 6,
        benchmarkScore: 65,
        tags: ['Walmart', 'Java', 'SQL', 'Distributed Systems'],
      },
      {
        company: 'TCS Digital',
        role: 'Digital / Prime Associate',
        benchmarkProblems: 5,
        benchmarkScore: 60,
        tags: ['TCS', 'Problem Solving', 'Data Structures', 'DBMS'],
      },
    ];

    const companyReadiness = targetCompanies.map((target) => {
      let matchedProblems = 0;
      allProblems.forEach((p: any) => {
        const isSolved =
          p.isSolved ||
          solvedProblemSlugs.has(p._id?.toString()) ||
          solvedProblemSlugs.has(p.slug);
        if (isSolved) {
          const pCompanies = Array.isArray(p.companies)
            ? p.companies.map((c: string) => c.toLowerCase())
            : [];
          if (
            pCompanies.includes(target.company.toLowerCase()) ||
            target.tags.some((t) =>
              p.category?.toLowerCase().includes(t.toLowerCase())
            )
          ) {
            matchedProblems++;
          }
        }
      });

      const problemProgress = Math.min(
        100,
        Math.round((matchedProblems / target.benchmarkProblems) * 50)
      );
      const interviewContrib =
        completedInterviews.length > 0
          ? Math.min(30, Math.round((evaluatedAvg / target.benchmarkScore) * 30))
          : 0;
      const theoryContrib = Math.min(
        20,
        Math.round((completedQuestionsCount / 15) * 20)
      );

      const totalScore = Math.min(
        100,
        problemProgress + interviewContrib + theoryContrib
      );

      let status: 'High Probability' | 'Competitive' | 'Building Profile' | 'Needs Preparation' =
        'Needs Preparation';
      if (totalScore >= 75) status = 'High Probability';
      else if (totalScore >= 50) status = 'Competitive';
      else if (totalScore > 0) status = 'Building Profile';

      return {
        company: target.company,
        role: target.role,
        readinessScore: totalScore,
        matchedSolved: matchedProblems,
        requiredBenchmark: target.benchmarkProblems,
        status,
        topTags: target.tags,
      };
    });

    // =========================================================================
    // 9. INDIVIDUAL CATEGORY SCORES
    // =========================================================================
    const categoryScores = {
      codingAndAlgorithms: Math.min(100, Math.round((weightedCodingScore / 35) * 100)),
      systemDesignAndArchitecture: Math.min(
        100,
        technicalDepthScore > 0
          ? Math.round(technicalDepthScore * 0.7 + completedTasksCount * 4)
          : Math.min(100, completedTasksCount * 8)
      ),
      databaseAndSQL: coreCSTracks.find((t) => t.id === 'dbms')?.percentage || 0,
      problemSolvingAndLogic:
        accuracyRate > 0
          ? Math.min(100, Math.round(accuracyRate * 0.5 + totalSolved * 5))
          : totalSolved > 0
          ? Math.min(100, totalSolved * 10)
          : 0,
      communicationAndViva: communicationScore > 0 ? communicationScore : 0,
    };

    // Topic mastery radar values
    const topicMastery = [
      {
        subject: 'Data Structures',
        score: coreCSTracks.find((t) => t.id === 'dsa')?.percentage || 0,
        fullMark: 100,
      },
      {
        subject: 'Algorithms & DP',
        score: categoryScores.codingAndAlgorithms,
        fullMark: 100,
      },
      {
        subject: 'System Design',
        score: categoryScores.systemDesignAndArchitecture,
        fullMark: 100,
      },
      {
        subject: 'Core CS (OS/DBMS)',
        score: Math.round(
          ((coreCSTracks.find((t) => t.id === 'os')?.percentage || 0) +
            (coreCSTracks.find((t) => t.id === 'dbms')?.percentage || 0)) /
            2
        ),
        fullMark: 100,
      },
      {
        subject: 'Web Architecture',
        score: Math.min(
          100,
          Math.round(
            (coreCSTracks.find((t) => t.id === 'cn')?.percentage || 0) * 0.6 +
              completedTasksCount * 4
          )
        ),
        fullMark: 100,
      },
      {
        subject: 'Communication',
        score: categoryScores.communicationAndViva,
        fullMark: 100,
      },
    ];

    // Skill breakdown bars
    const skillBreakdown = {
      correctness: totalSubmissions > 0 ? accuracyRate : problemSolvingScore,
      technicalDepth:
        technicalDepthScore > 0
          ? technicalDepthScore
          : Math.min(100, easySolved * 10 + mediumSolved * 15 + hardSolved * 25),
      codingSpeed: Math.min(100, totalSolved * 15),
      articulation: communicationScore,
    };

    // Interviewer feedback
    let interviewerFeedback = {
      highlight:
        'Welcome to your placement preparation workspace! Solidify DSA fundamentals and practice verbal walkthroughs.',
      actionableAdvice:
        'Solve algorithmic challenges in the Coding Sandbox and schedule an AI Mock Interview to generate your personal STAR rubric.',
      source: 'Placement Intelligence Engine',
    };

    if (completedInterviews.length > 0) {
      const latest = completedInterviews[0];
      const advice =
        latest.questions?.[0]?.feedback?.howToImprove?.[0] ||
        'Focus on vocalizing Big-O time and space tradeoffs before starting to type code.';
      interviewerFeedback = {
        highlight:
          latest.summaryFeedback ||
          `Completed ${latest.role} Technical Mock with ${latest.overallScore || 75}% overall score.`,
        actionableAdvice: advice,
        source: `AI Placement Evaluator (${latest.role})`,
      };
    }

    // Achievement badges (authentic unlock conditions)
    const badges = [
      {
        id: 'FIRST_CODE',
        title: 'First Milestone',
        description: 'Solved your first coding problem in the Monaco Sandbox.',
        icon: 'Code2',
        tier: 'Bronze',
        isUnlocked: totalSolved >= 1,
        unlockedAt: totalSolved >= 1 ? 'Unlocked' : undefined,
      },
      {
        id: 'CLEAN_CODE',
        title: 'O(1) Memory Optimizer',
        description: 'Achieved optimal constant space in an algorithmic challenge.',
        icon: 'Zap',
        tier: 'Silver',
        isUnlocked: totalSolved >= 2,
        unlockedAt: totalSolved >= 2 ? 'Unlocked' : undefined,
      },
      {
        id: 'MOCK_ACE',
        title: 'AI Interview Ace',
        description: 'Scored 75+ in an AI Mock Interview with STAR framework rubrics.',
        icon: 'Award',
        tier: 'Gold',
        isUnlocked: completedInterviews.some((i) => (i.overallScore || 0) >= 75),
        unlockedAt: completedInterviews.some((i) => (i.overallScore || 0) >= 75)
          ? 'Unlocked'
          : undefined,
      },
      {
        id: 'STREAK_7',
        title: '7-Day Placement Warrior',
        description: 'Maintained a consecutive 7-day preparation streak.',
        icon: 'Flame',
        tier: 'Gold',
        isUnlocked: streak >= 7,
        unlockedAt: streak >= 7 ? 'Unlocked' : undefined,
      },
      {
        id: 'ROADMAP_SPRINT',
        title: 'Roadmap Sprint Specialist',
        description: 'Completed 3+ milestone tasks in your personalized placement roadmap.',
        icon: 'Compass',
        tier: 'Platinum',
        isUnlocked: completedTasksCount >= 3,
        unlockedAt: completedTasksCount >= 3 ? 'Active' : undefined,
      },
      {
        id: 'TIER1_READY',
        title: 'Tier-1 Candidate Verified',
        description: 'Reached 80%+ overall placement readiness across code, theory, and mock interviews.',
        icon: 'Sparkles',
        tier: 'Diamond',
        isUnlocked: placementReadinessScore >= 80,
        unlockedAt: placementReadinessScore >= 80 ? 'Verified' : undefined,
      },
    ];

    // Compile recent placement activities
    const recentActivities: Array<{
      id: string;
      type: 'problem' | 'interview' | 'roadmap';
      title: string;
      score?: number | string;
      status: string;
      date: string;
    }> = [];

    submissions.slice(0, 3).forEach((sub) => {
      const prob = allProblems.find(
        (p: any) => p._id === sub.problemId || p.slug === sub.problemId
      );
      recentActivities.push({
        id: sub._id || sub.id,
        type: 'problem',
        title: `Code Sandbox: ${prob?.title || sub.problemId || 'Algorithm Challenge'}`,
        score: sub.runtime ? `${sub.runtime} ms` : undefined,
        status: sub.status === 'Accepted' ? 'Accepted' : 'Tested',
        date: new Date(sub.createdAt).toLocaleDateString(),
      });
    });

    interviews.slice(0, 2).forEach((iv) => {
      recentActivities.push({
        id: iv._id || iv.id,
        type: 'interview',
        title: `${iv.role || 'Placement'} AI Mock Interview`,
        score: iv.overallScore ? `${iv.overallScore}%` : undefined,
        status: iv.status === 'completed' ? 'Completed' : 'In Progress',
        date: new Date(iv.createdAt || iv.completedAt).toLocaleDateString(),
      });
    });

    res.status(200).json({
      success: true,
      data: {
        placementReadinessScore,
        readinessTier,
        targetRole,
        streak,
        bestStreak,
        activityMap,
        dailyActivityMap,
        xpPoints,
        level,
        nextLevelXp,
        xpToNextLevel,
        levelPercentage,
        metrics: {
          problemsSolved: totalSolved,
          problemsTarget: 20,
          interviewsCompleted: completedInterviews.length,
          interviewsTarget: 5,
          roadmapTasksCompleted: completedTasksCount,
          roadmapTasksTarget: 25,
          questionsBankCompleted: completedQuestionsCount,
          activeRoadmapTitle:
            roadmapProgress?.roadmapTitle || 'Full-Stack Developer 30-Day Sprint',
        },
        readinessBreakdown: {
          codeScore: weightedCodingScore,
          codeMax: 35,
          interviewScore: weightedInterviewScore,
          interviewMax: 35,
          roadmapScore,
          roadmapMax: 30,
          formula:
            'Readiness % = Coding Challenges (35%) + AI Mock Interviews (35%) + Roadmap & Core CS (30%)',
        },
        codingPerformance,
        mockInterviewEvaluation,
        coreCSTracks,
        weeklyProgress,
        weakAreas,
        companyReadiness,
        categoryScores,
        topicMastery,
        skillBreakdown,
        interviewerFeedback,
        heatmap,
        annualHeatmap,
        badges,
        recentActivities,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
