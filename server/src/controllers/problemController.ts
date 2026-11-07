import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CodingProblem } from '../models/CodingProblem.js';
import { Submission } from '../models/Submission.js';
import { devStore } from '../services/devStore.js';
import { Judge0Service } from '../services/judge0Service.js';
import { PROBLEM_SOLUTIONS } from '../data/problemSolutions.js';
import { AuthenticatedRequest } from '../types/index.js';
import { autoSeedDatabase } from '../utils/autoSeed.js';

export const getProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, difficulty, search, company } = req.query;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      // Self-heal: ensure MongoDB has seed coding problems if newly created or empty
      const totalInDb = await CodingProblem.countDocuments();
      if (totalInDb === 0) {
        await autoSeedDatabase();
      }

      const query: any = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (difficulty && difficulty !== 'All') {
        query.difficulty = difficulty;
      }
      if (company && company !== 'All') {
        query.companies = { $in: [new RegExp((company as string).trim(), 'i')] };
      }
      if (search && typeof search === 'string' && search.trim().length > 0) {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { category: { $regex: search.trim(), $options: 'i' } },
          { companies: { $in: [new RegExp(search.trim(), 'i')] } },
        ];
      }

      const problems = await CodingProblem.find(query)
        .select('title slug category difficulty acceptanceRate companies order')
        .sort({ order: 1 });

      // If query returned 0 and no search filter was active, self-heal with devStore
      if (problems.length === 0 && (!search || !(search as string).trim()) && (!category || category === 'All') && (!difficulty || difficulty === 'All') && (!company || company === 'All')) {
        const fallbackProblems = await devStore.getProblems(userId);
        res.status(200).json({
          success: true,
          count: fallbackProblems.length,
          data: fallbackProblems,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let solvedProblemIds = new Set<string>();
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const userAcceptedSubs = await Submission.find({
          userId,
          status: 'Accepted',
        }).select('problemId');
        solvedProblemIds = new Set(userAcceptedSubs.map((s) => s.problemId.toString()));
      }

      const result = problems.map((p) => ({
        _id: p._id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        difficulty: p.difficulty,
        acceptanceRate: p.acceptanceRate,
        companies: p.companies,
        isSolved: solvedProblemIds.has(p._id.toString()),
      }));

      res.status(200).json({
        success: true,
        count: result.length,
        data: result,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Fallback to devStore
    const result = await devStore.getProblems(userId, {
      category: category as string,
      difficulty: difficulty as string,
      company: company as string,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getProblemDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const problem = isObjectId
        ? await CodingProblem.findById(idOrSlug)
        : await CodingProblem.findOne({ slug: idOrSlug });

      if (!problem) {
        const fallback = await devStore.getProblemByIdOrSlug(idOrSlug, userId);
        if (fallback) {
          res.status(200).json({
            success: true,
            data: fallback,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        res.status(404).json({
          success: false,
          error: `Coding problem '${idOrSlug}' not found.`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let isSolved = false;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const accepted = await Submission.findOne({
          userId,
          problemId: problem._id,
          status: 'Accepted',
        });
        isSolved = !!accepted;
      }

      // Return only sample/visible test cases to client
      const visibleTestCases = problem.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc, index) => ({
          testCaseIndex: index + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }));

      res.status(200).json({
        success: true,
        data: {
          _id: problem._id,
          title: problem.title,
          slug: problem.slug,
          category: problem.category,
          difficulty: problem.difficulty,
          description: problem.description,
          examples: problem.examples,
          constraints: problem.constraints,
          starterCode: problem.starterCode,
          testCases: visibleTestCases,
          acceptanceRate: problem.acceptanceRate,
          companies: problem.companies,
          hints: problem.hints,
          solution: PROBLEM_SOLUTIONS[problem.slug] || null,
          isSolved,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Fallback to devStore
    const problem = await devStore.getProblemByIdOrSlug(idOrSlug, userId);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: `Coding problem '${idOrSlug}' not found.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const visibleTestCases = problem.testCases
      .filter((tc) => !tc.isHidden)
      .map((tc, index) => ({
        testCaseIndex: index + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));

    res.status(200).json({
      success: true,
      data: {
        ...problem,
        testCases: visibleTestCases,
        solution: PROBLEM_SOLUTIONS[problem.slug] || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const runSandboxPlayground = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { language, code, stdin } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Source code is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await Judge0Service.executePlayground({
      language: language || 'javascript',
      code,
      stdin,
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const runCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const { language, code, customTestCases } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Source code is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!language || !['javascript', 'python', 'java', 'cpp'].includes(language)) {
      res.status(400).json({
        success: false,
        error: 'Valid language (javascript, python, java, cpp) is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Load problem to get sample test cases
    const isConnected = mongoose.connection.readyState === 1;
    let problem: any = null;

    if (isConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      problem = isObjectId
        ? await CodingProblem.findById(idOrSlug)
        : await CodingProblem.findOne({ slug: idOrSlug });
    }

    if (!problem) {
      problem = await devStore.getProblemByIdOrSlug(idOrSlug);
    }

    if (!problem) {
      res.status(404).json({
        success: false,
        error: `Coding problem '${idOrSlug}' not found.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    let testCasesToRun: Array<{ input: string; expectedOutput: string; isHidden?: boolean }> = [];
    if (customTestCases && Array.isArray(customTestCases) && customTestCases.length > 0) {
      testCasesToRun = customTestCases;
    } else {
      testCasesToRun = problem.testCases.filter((tc: any) => !tc.isHidden);
    }

    const executionResult = await Judge0Service.executeCode({
      language,
      code,
      testCases: testCasesToRun,
      problemSlug: problem.slug || idOrSlug,
    });

    res.status(200).json({
      success: true,
      data: executionResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const submitCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const { language, code } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: authentication required to submit solution.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Source code is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!language || !['javascript', 'python', 'java', 'cpp'].includes(language)) {
      res.status(400).json({
        success: false,
        error: 'Valid language (javascript, python, java, cpp) is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Load problem with ALL test cases (visible + hidden)
    const isConnected = mongoose.connection.readyState === 1;
    let problem: any = null;

    if (isConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      problem = isObjectId
        ? await CodingProblem.findById(idOrSlug)
        : await CodingProblem.findOne({ slug: idOrSlug });
    }

    if (!problem) {
      problem = await devStore.getProblemByIdOrSlug(idOrSlug, userId);
    }

    if (!problem) {
      res.status(404).json({
        success: false,
        error: `Coding problem '${idOrSlug}' not found.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Execute against all test cases
    const executionResult = await Judge0Service.executeCode({
      language,
      code,
      testCases: problem.testCases,
      problemSlug: problem.slug || idOrSlug,
    });

    const isAccepted = executionResult.status === 'Accepted';

    // Save submission
    if (isConnected) {
      const submission = new Submission({
        userId,
        problemId: problem._id,
        language,
        code,
        status: executionResult.status,
        runtime: executionResult.totalRuntime,
        memory: executionResult.peakMemory,
        testCasesPassed: executionResult.testCasesPassed,
        totalTestCases: executionResult.totalTestCases,
        testResults: executionResult.testResults,
        error: executionResult.error,
      });

      await submission.save();

      res.status(201).json({
        success: true,
        data: {
          submissionId: submission._id,
          status: executionResult.status,
          runtime: executionResult.totalRuntime,
          memory: executionResult.peakMemory,
          testCasesPassed: executionResult.testCasesPassed,
          totalTestCases: executionResult.totalTestCases,
          testResults: executionResult.testResults,
          isAccepted,
          xpEarned: isAccepted ? (problem.difficulty === 'Hard' ? 150 : problem.difficulty === 'Medium' ? 100 : 50) : 0,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Save in devStore
    const devSub = await devStore.createSubmission({
      userId,
      problemId: problem._id,
      language,
      code,
      status: executionResult.status,
      runtime: executionResult.totalRuntime,
      memory: executionResult.peakMemory,
      testCasesPassed: executionResult.testCasesPassed,
      totalTestCases: executionResult.totalTestCases,
      testResults: executionResult.testResults,
      error: executionResult.error,
    });

    res.status(201).json({
      success: true,
      data: {
        submissionId: devSub._id,
        status: executionResult.status,
        runtime: executionResult.totalRuntime,
        memory: executionResult.peakMemory,
        testCasesPassed: executionResult.testCasesPassed,
        totalTestCases: executionResult.totalTestCases,
        testResults: executionResult.testResults,
        isAccepted,
        xpEarned: isAccepted ? (problem.difficulty === 'Hard' ? 150 : problem.difficulty === 'Medium' ? 100 : 50) : 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: authentication required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      let problemId = idOrSlug;
      if (!mongoose.Types.ObjectId.isValid(idOrSlug)) {
        const prob = await CodingProblem.findOne({ slug: idOrSlug }).select('_id');
        if (prob) problemId = prob._id.toString();
      }

      const isUserObjId = mongoose.Types.ObjectId.isValid(userId);
      const submissions = isUserObjId
        ? await Submission.find({
            userId,
            problemId,
          })
            .sort({ createdAt: -1 })
            .limit(20)
        : [];

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    let problemId = idOrSlug;
    const prob = await devStore.getProblemByIdOrSlug(idOrSlug);
    if (prob) problemId = prob._id;

    const submissions = await devStore.getSubmissions(userId, problemId);

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

