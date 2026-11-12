import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MockInterview, IMockInterview } from '../models/MockInterview.js';
import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { devStore } from '../services/devStore.js';
import { AIService } from '../services/aiService.js';
import { Judge0Service } from '../services/judge0Service.js';
import { AuthenticatedRequest } from '../types/index.js';

// Helper to resolve valid MongoDB or string user ID
const resolveUserId = async (authReq: AuthenticatedRequest, isConnected: boolean): Promise<any> => {
  const userId = authReq.user?.userId;
  if (!isConnected) return userId || 'guest-user';

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return userId;
  }
  if (authReq.user?.email) {
    const u = await User.findOne({ email: authReq.user.email.toLowerCase().trim() });
    if (u) return u._id.toString();
  }
  const demo = await User.findOne({ email: 'student@placement.edu' });
  return demo ? demo._id.toString() : '65f1a2b3c4d5e6f7a8b9c0d1';
};

// Shared helper to load a session and verify caller ownership (returns null after writing 404/403)
const loadOwnedInterview = async (
  id: string,
  req: Request,
  res: Response,
  isConnected: boolean
): Promise<any | null> => {
  let interview: any = null;
  if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
    interview = await MockInterview.findById(id);
  }
  if (!interview) {
    interview = await devStore.getMockInterview(id);
  }

  if (!interview) {
    res.status(404).json({
      success: false,
      error: 'Mock interview session not found.',
      timestamp: new Date().toISOString(),
    });
    return null;
  }

  const authReq = req as AuthenticatedRequest;
  const resolvedUid = await resolveUserId(authReq, isConnected);
  const ownerStr = interview.userId ? interview.userId.toString() : '';
  const isOwner =
    (ownerStr !== '' &&
      (ownerStr === resolvedUid ||
        (authReq.user?.userId && ownerStr === authReq.user.userId))) ||
    authReq.user?.role === 'admin';

  if (!isOwner) {
    res.status(403).json({
      success: false,
      error: 'Unauthorized: you do not have access to this interview session.',
      timestamp: new Date().toISOString(),
    });
    return null;
  }

  return interview;
};

// =========================================================================
// 1. START INTERVIEW SESSION
// =========================================================================
export const startInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to start a mock interview.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const {
      interviewType = req.body.type || 'Technical',
      role = 'Software Development Engineer',
      difficulty = 'Intermediate',
      experienceLevel = 'Fresher',
      duration = 30,
      numberOfQuestions = req.body.questionCount || 5,
      company = '',
      skills = [],
      jobDescription = req.body.targetJD || '',
      resumeText = '',
      mode = 'mixed',
      title = '',
      interviewerName = 'Emily Zhou',
      interviewerRole = 'Senior Engineering Interviewer',
      interviewerAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&auto=format&fit=crop&crop=faces,center&q=85',
      resumeTopics,
      roundType = '',
    } = req.body;

    const count = Math.min(15, Math.max(3, Number(numberOfQuestions) || 5));
    const isConnected = mongoose.connection.readyState === 1;
    const resolvedUid = await resolveUserId(authReq, isConnected);

    // Convert skills to array if passed as string
    const skillsList = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const isCodingInterview = interviewType === 'Coding' || interviewType.toLowerCase().includes('code');
    const safeResumeText =
      typeof resumeText === 'string' ? resumeText.replace(/\0/g, '').slice(0, 6000) : '';

    // Pick a varied coding challenge upfront for Coding interviews so Question 2+ can reference it cleanly
    const codingProblem = isCodingInterview
      ? AIService.getCodingProblemTemplate(difficulty, skillsList, safeResumeText)
      : undefined;

    // Build structured resume topics dynamically from uploaded resume/skills if not pre-parsed by client
    let formattedTopics = resumeTopics;
    if (!formattedTopics && safeResumeText) {
      const highlights = AIService.extractResumeHighlights(safeResumeText, skillsList);
      const stackSummary = highlights.skills.length > 0 ? highlights.skills.join(', ') : interviewType;
      const primaryProject = highlights.projects[0] || `${interviewType} Project Implementation`;
      formattedTopics = [
        { id: 't1', title: 'Candidate Profile & Background', category: 'Profile', description: `${role} · ${experienceLevel}`, status: 'discussing' },
        { id: 't2', title: `${interviewType} Foundations`, category: 'TRACK', description: `Core concepts and problem solving for ${interviewType}`, status: 'not_yet' },
        { id: 't3', title: primaryProject, category: 'PROJECT', description: `Architecture, key components, and design choices (${stackSummary})`, status: 'not_yet' },
        { id: 't4', title: 'Technical Stack & Internals', category: 'STACK', description: stackSummary, status: 'not_yet' },
        { id: 't5', title: 'Performance, Edge Cases & Trade-offs', category: 'DEPTH', description: 'Latency, memory, concurrency, and failure handling', status: 'not_yet' },
        { id: 't6', title: 'Behavioral & Ownership (STAR)', category: 'BEHAVIORAL', description: 'Problem debugging, teamwork, and delivery ownership', status: 'not_yet' },
      ];
    }

    // Generate track-specific & resume-aware initial questions (preserve exact interviewType!)
    const generatedQuestions = await AIService.generateMockQuestions({
      title: title || `${company ? company + ' ' : ''}${role} ${interviewType} Interview`,
      role,
      experienceLevel,
      company: company || 'General Tech',
      customTopics: skillsList,
      difficulty,
      type: interviewType,
      questionCount: count,
      candidateSkills: skillsList,
      resumeText: safeResumeText,
      targetJD: jobDescription || '',
      roundType: roundType || interviewType.toLowerCase().replace(/\s+/g, '_'),
      codingProblemTitle: codingProblem?.title,
    });

    // Assign stages (Stage 1: Intro, Stage 2: Main, Stage 3: Followup, Stage 4: Scenario, Stage 5: Wrapup)
    const stages: Array<'introduction' | 'main' | 'followup' | 'scenario' | 'wrapup'> = [
      'introduction',
      'main',
      'followup',
      'scenario',
      'wrapup',
    ];

    const questionsWithStages = generatedQuestions.map((q: any, idx: number) => ({
      id: q.id || `q-${idx + 1}-${Date.now().toString(36)}`,
      question: q.question,
      category: q.category || interviewType,
      difficulty: q.difficulty || difficulty,
      stage: stages[idx] || (idx >= 4 ? 'wrapup' : 'main'),
      requiresCode: Boolean(q.requiresCode),
      expectedPoints: q.expectedPoints || ['Clear conceptual breakdown', 'Real-world engineering trade-offs'],
      sampleFollowUp: q.sampleFollowUp || 'Can you walk me through the trade-offs of this approach?',
      studentAnswer: undefined,
      answeredAt: undefined,
      feedback: undefined,
    }));

    const sessionData: any = {
      userId: resolvedUid,
      title: title || `${company ? company + ' ' : ''}${role} · ${interviewType}`,
      interviewType,
      roundType: roundType || interviewType.toLowerCase().replace(/\s+/g, '_'),
      role,
      experienceLevel,
      company: company || '',
      customTopics: skillsList,
      difficulty,
      duration: Number(duration) || 30,
      numberOfQuestions: count,
      mode,
      status: 'in_progress',
      currentStage: 'introduction',
      questions: questionsWithStages,
      codingProblem,
      resumeText: safeResumeText,
      jobDescription,
      candidateNotes: '',
      resumeTopics: formattedTopics || [],
      interviewerName,
      interviewerRole,
      interviewerAvatar,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    if (isConnected) {
      const interview = new MockInterview(sessionData);
      await interview.save();
      res.status(201).json({
        success: true,
        data: interview,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // DevStore in-memory fallback
    const interview = await devStore.createMockInterview(sessionData);
    res.status(201).json({
      success: true,
      data: interview,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 2. SUBMIT CANDIDATE ANSWER (Live Evaluation & Contextual Follow-up)
// =========================================================================
export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { questionId, questionIndex, answer, code, codeLanguage } = req.body;
    const selectedCodeLang = codeLanguage || req.body.language;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if ((!answer || typeof answer !== 'string' || answer.trim().length === 0) && !code) {
      res.status(400).json({
        success: false,
        error: 'Answer text or code submission is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    let qIndex = -1;
    if (typeof questionIndex === 'number' && questionIndex >= 0 && questionIndex < interview.questions.length) {
      qIndex = questionIndex;
    } else if (questionId) {
      qIndex = interview.questions.findIndex((q: any) => q.id === questionId);
    }

    if (qIndex === -1) {
      res.status(404).json({
        success: false,
        error: `Question '${questionId || questionIndex}' not found in this interview session.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const targetQuestion = interview.questions[qIndex];
    const cleanAnswer = (answer || '').trim();

    // If candidate submitted code in Coding interview, test/execute it via Judge0
    let codeExecutionResult: any = undefined;
    if (code && typeof code === 'string') {
      try {
        codeExecutionResult = await Judge0Service.executePlayground({
          code,
          language: selectedCodeLang || 'javascript',
          stdin: '',
        });
      } catch (err: any) {
        codeExecutionResult = { status: 'Error', error: err?.message || 'Execution failed' };
      }
    }

    // Concurrently evaluate candidate answer AND generate live next question in parallel
    const hasNextQuestion = qIndex + 1 < interview.questions.length;
    const combinedResponse = cleanAnswer + (code ? `\n\nSubmitted Code Implementation (${selectedCodeLang || 'code'}):\n${code}` : '');
    const conversationHistory = interview.questions
      .slice(0, qIndex + 1)
      .flatMap((qItem: any, idx: number) => {
        const turns: Array<{ role: 'interviewer' | 'candidate'; text: string }> = [
          { role: 'interviewer', text: qItem.question },
        ];
        const candidateText = idx === qIndex ? combinedResponse : qItem.studentAnswer;
        if (candidateText) {
          turns.push({ role: 'candidate', text: String(candidateText).slice(0, 800) });
        }
        return turns;
      });

    const [evalResult, nextTurnResult] = await Promise.allSettled([
      AIService.evaluateMockAnswer({
        role: interview.role,
        question: targetQuestion.question,
        answer: combinedResponse,
        category: targetQuestion.category,
        difficulty: targetQuestion.difficulty,
      }),
      hasNextQuestion
        ? AIService.generateLiveNextQuestion({
            role: interview.role,
            company: interview.company,
            roundType: interview.interviewType,
            subRoundType: interview.roundType,
            difficulty: interview.difficulty,
            customTopics: interview.customTopics || [],
            resumeText: (interview.resumeText || '').slice(0, 2500),
            questionNumber: qIndex + 2,
            totalQuestions: interview.questions.length,
            currentQuestion: targetQuestion.question,
            candidateAnswer: combinedResponse,
            upcomingPlannedQuestion: interview.questions[qIndex + 1],
            conversationHistory,
          })
        : Promise.resolve(null),
    ]);

    const evaluation =
      evalResult.status === 'fulfilled'
        ? evalResult.value
        : AIService.fallbackAnswerEvaluation(
            targetQuestion.question,
            combinedResponse,
            targetQuestion.category,
            interview.role
          );

    targetQuestion.studentAnswer = cleanAnswer;
    targetQuestion.studentCode = code;
    targetQuestion.codeLanguage = selectedCodeLang;
    targetQuestion.codeExecutionResult = codeExecutionResult;
    targetQuestion.answeredAt = new Date();
    targetQuestion.feedback = evaluation;

    let nextQuestionData: any = null;
    let interviewerSpeech = '';

    if (hasNextQuestion) {
      if (nextTurnResult.status === 'fulfilled' && nextTurnResult.value) {
        const nextTurn = nextTurnResult.value;
        const nextQ = interview.questions[qIndex + 1];
        nextQ.question = nextTurn.nextQuestion;
        nextQ.category = nextTurn.category;
        nextQ.expectedPoints = nextTurn.expectedPoints;
        nextQ.sampleFollowUp = nextTurn.sampleFollowUp;
        nextQ.requiresCode = Boolean(nextTurn.requiresCode);

        // Advance stage
        const stages: Array<'introduction' | 'main' | 'followup' | 'scenario' | 'wrapup'> = [
          'introduction',
          'main',
          'followup',
          'scenario',
          'wrapup',
        ];
        interview.currentStage = stages[qIndex + 1] || 'main';

        nextQuestionData = nextQ;
        interviewerSpeech = `${nextTurn.interviewerLeadIn} ${nextTurn.nextQuestion}`;
      } else {
        console.warn('Fallback next question applied due to network or empty response');
        const nextQ = interview.questions[qIndex + 1];
        nextQuestionData = nextQ;
        interviewerSpeech = `Alright. ${nextQ.question}`;
      }
    } else {
      // Completed all questions
      interview.status = 'completed';
      interview.currentStage = 'completed';
      interview.completedAt = new Date();
      interviewerSpeech = `Thank you so much. That concludes all questions for our interview session today. I am generating your AI mock interview assessment report now.`;

      // Generate the complete performance report & average breakdown
      const report = generateComprehensiveReport(interview);
      interview.report = report;
      interview.overallScore = report.overallScore;
      interview.averageScores = report.averageScores;
    }

    if (isConnected) {
      interview.markModified('questions');
      if (interview.report) interview.markModified('report');
      if (interview.averageScores) interview.markModified('averageScores');
      await interview.save();
    } else {
      await devStore.updateMockInterview(id, {
        questions: interview.questions,
        status: interview.status,
        currentStage: interview.currentStage,
        completedAt: interview.completedAt,
        report: interview.report,
        overallScore: interview.overallScore,
        averageScores: interview.averageScores,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        questionId,
        feedback: evaluation,
        nextQuestion: nextQuestionData,
        interviewerSpeech,
        isCompleted: !hasNextQuestion,
        currentStage: interview.currentStage,
        codeExecutionResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 3. EXECUTE CODE IN CODING INTERVIEW SANDBOX
// =========================================================================
export const runCodingInterviewCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { code, language = 'javascript', input = '' } = req.body;
    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Code string is required for sandbox execution.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const hasStandaloneEntry =
      /\b(public\s+static\s+void\s+main|int\s+main\s*\(|void\s+main\s*\(|__name__\s*==\s*['"]__main__['"])/.test(
        code
      ) || /\b(console\.log|print)\s*\(/.test(code);

    const codingProblem = interview.codingProblem;
    const sampleCases = Array.isArray(codingProblem?.testCases) && codingProblem.testCases.length > 0
      ? codingProblem.testCases.slice(0, 3)
      : codingProblem?.sampleInput !== undefined && codingProblem?.sampleOutput !== undefined
      ? [{ input: String(codingProblem.sampleInput), expectedOutput: String(codingProblem.sampleOutput) }]
      : [];

    if (!hasStandaloneEntry && sampleCases.length > 0) {
      const problemSlug = String(codingProblem?.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const execResult = await Judge0Service.executeCode({
        code,
        language: language as any,
        testCases: sampleCases,
        problemSlug,
      });

      const lines = (execResult.testResults || []).map(
        (tc) =>
          `Case ${tc.testCaseIndex + 1}: ${tc.status === 'Passed' ? 'PASS' : 'FAIL'} | Input: ${tc.input} | Output: ${
            tc.actualOutput || '(empty)'
          }${tc.status === 'Passed' ? '' : ` | Expected: ${tc.expectedOutput}`}`
      );
      const caseErrors = (execResult.testResults || [])
        .map((tc) => tc.error)
        .filter(Boolean)
        .join('\n');

      res.status(200).json({
        success: true,
        data: {
          stdout:
            lines.length > 0
              ? `Passed ${execResult.testCasesPassed}/${execResult.totalTestCases} test cases\n${lines.join('\n')}`
              : execResult.status,
          stderr: execResult.error || caseErrors || '',
          time: `${execResult.totalRuntime || 0}ms`,
          executionTime: execResult.totalRuntime || 0,
          memory: execResult.peakMemory || 0,
          exitCode: execResult.status === 'Accepted' ? 0 : 1,
          status: execResult.status,
          testResults: execResult.testResults,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await Judge0Service.executePlayground({
      code,
      language,
      stdin: input || '',
    });

    res.status(200).json({
      success: true,
      data: {
        ...result,
        stderr: result.stderr || '',
        time: `${result.executionTime || 0}ms`,
        memory: 0,
        exitCode: result.status === 'Success' ? 0 : 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 4. COMPLETE INTERVIEW SESSION & GENERATE REPORT (Section 9)
// =========================================================================
export const completeInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    interview.status = 'completed';
    interview.currentStage = 'completed';
    interview.completedAt = new Date();

    // Populate authentic model benchmark answers for any unanswered / skipped questions so candidate has complete study material
    if (Array.isArray(interview.questions)) {
      for (const q of interview.questions) {
        if (!q.feedback) {
          const benchmarkEval = AIService.fallbackAnswerEvaluation(q.question, '', q.category, interview.role);
          q.feedback = {
            overallScore: 0,
            scores: {
              correctness: 0,
              technicalDepth: 0,
              clarity: 0,
              confidence: 0,
              completeness: 0,
              communication: 0,
            },
            rubricBreakdown: {
              technicalCorrectness: 0,
              problemSolving: 0,
              communication: 0,
              relevance: 0,
              completeness: 0,
              scoringFormula: 'Score = (Correctness * 0.30) + (ProblemSolving * 0.25) + (Communication * 0.20) + (Relevance * 0.15) + (Completeness * 0.10)',
            },
            roleLevel: interview.role?.toLowerCase().includes('senior') ? 'Senior Engineer' : interview.role?.toLowerCase().includes('sde-2') ? 'SDE-2' : 'SDE-1',
            whatWentWell: ['Question not attempted in this interview session.'],
            whatWasMissed: [
              'Candidate exited or completed session before answering this question.',
              ...(benchmarkEval.whatWasMissed || []).slice(0, 2),
            ],
            missingConcepts: benchmarkEval.missingConcepts || [],
            howToImprove: benchmarkEval.howToImprove,
            modelAnswer: benchmarkEval.modelAnswer,
            recommendedTopics: benchmarkEval.recommendedTopics,
          };
        }
      }
    }

    // Generate comprehensive performance report
    const report = generateComprehensiveReport(interview);
    interview.report = report;
    interview.overallScore = report.overallScore;
    interview.averageScores = report.averageScores;

    if (isConnected) {
      interview.markModified('questions');
      interview.markModified('report');
      interview.markModified('averageScores');
      await interview.save();
    } else {
      await devStore.updateMockInterview(id, {
        questions: interview.questions,
        status: 'completed',
        currentStage: 'completed',
        completedAt: interview.completedAt,
        report,
        overallScore: report.overallScore,
        averageScores: report.averageScores,
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 5. GET INTERVIEW DETAILS BY ID
// =========================================================================
export const getInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    res.status(200).json({
      success: true,
      data: interview,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 6. GET USER INTERVIEW HISTORY & PERFORMANCE STATS (Section 10 & 11)
// =========================================================================
export const getInterviewHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const isConnected = mongoose.connection.readyState === 1;
    const resolvedUid = await resolveUserId(authReq, isConnected);

    let interviews: any[] = [];
    if (isConnected) {
      const uidStr = authReq.user?.userId;
      const query =
        uidStr && uidStr !== resolvedUid
          ? { $or: [{ userId: resolvedUid }, { userId: uidStr }] }
          : { userId: resolvedUid };

      interviews = await MockInterview.find(query)
        .select(
          '_id title role company interviewType difficulty experienceLevel status overallScore mode interviewerName duration numberOfQuestions createdAt startedAt completedAt averageScores'
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    } else {
      interviews = await devStore.getUserMockInterviews(resolvedUid);
    }

    // Calculate aggregated dashboard metrics
    const completed = interviews.filter((i) => i.status === 'completed');
    const totalCompleted = completed.length;
    const scores = completed.map((i) => i.overallScore || 0).filter((s) => s > 0);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    res.status(200).json({
      success: true,
      data: interviews,
      stats: {
        totalCompleted,
        averageScore,
        bestScore,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 7. DELETE INTERVIEW SESSION (Session Ownership Protected)
// =========================================================================
export const deleteInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await MockInterview.findByIdAndDelete(id);
    } else {
      await devStore.deleteMockInterview(id);
    }

    res.status(200).json({
      success: true,
      message: 'Interview session deleted successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await MockInterview.findByIdAndUpdate(id, { candidateNotes: notes });
    } else {
      await devStore.updateMockInterview(id, { candidateNotes: notes });
    }

    res.status(200).json({ success: true, message: 'Notes saved' });
  } catch (error) {
    next(error);
  }
};

export const updateTopicStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, topicId } = req.params;
    const { status } = req.body;
    const isConnected = mongoose.connection.readyState === 1;
    const interview = await loadOwnedInterview(id, req, res, isConnected);
    if (!interview) return;

    if (interview.resumeTopics) {
      interview.resumeTopics = interview.resumeTopics.map((t: any) =>
        t.id === topicId ? { ...t, status: status || 'discussed' } : t
      );
      if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
        await interview.save();
      } else {
        await devStore.updateMockInterview(id, { resumeTopics: interview.resumeTopics });
      }
    }
    res.status(200).json({ success: true, message: 'Topic updated' });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// HELPER: GENERATE COMPREHENSIVE FINAL REPORT (Section 9)
// =========================================================================
function generateComprehensiveReport(interview: any): any {
  const totalQuestions = interview.questions?.length || 5;
  const answered = interview.questions.filter((q: any) => {
    const spoken = (q.studentAnswer || '').trim();
    const code = (q.studentCode || '').trim();
    return spoken.length > 0 || code.length > 0;
  });
  const answeredCount = answered.length;

  // Handle case where candidate exits or ends session without providing answers
  if (answeredCount === 0) {
    const zeroAverages = {
      correctness: 0,
      technicalDepth: 0,
      clarity: 0,
      confidence: 0,
      completeness: 0,
      communication: 0,
      relevance: 0,
    };
    return {
      overallScore: 0,
      averageAnsweredScore: 0,
      completionStatus: 'incomplete',
      questionsAnswered: 0,
      questionsSkipped: totalQuestions,
      totalDurationMinutes: interview.duration || 30,
      averageScores: zeroAverages,
      categoryScores: {
        technicalKnowledge: 0,
        communicationClarity: 0,
        problemSolving: 0,
        answerRelevance: 0,
        conceptualUnderstanding: 0,
        completeness: 0,
      },
      detailedFeedback: {
        strongAnswers: [],
        weakAnswers: ['The interview was ended before any technical questions were answered.'],
        missedConcepts: ['No technical responses were recorded for evaluation.'],
        areasToImprove: ['Speak your technical answers clearly into the microphone or submit code in the workspace.'],
      },
      answerImprovements: interview.questions.map((q: any) => ({
        questionId: q.id,
        question: q.question,
        studentAnswer: 'No answer recorded (Session ended prematurely)',
        studentCode: q.studentCode,
        whatWasGood: 'N/A',
        whatWasMissing: 'Candidate did not speak or submit an answer for this question.',
        suggestedAnswer: q.feedback?.modelAnswer || 'A production-grade answer articulates core requirements, concurrency trade-offs, and failure recovery.',
      })),
      recommendations: {
        preparationLevel: 'Did Not Complete (Incomplete)',
        recommendedTopics: [
          'Enable microphone permissions and practice speaking technical answers aloud',
          'Review Core CS fundamentals and Project Architecture',
        ],
        suggestedNextInterview: 'Restart AI Mock Interview and complete all questions',
      },
    };
  }

  let totalScore = 0;
  const totals = {
    correctness: 0,
    technicalDepth: 0,
    clarity: 0,
    confidence: 0,
    completeness: 0,
    communication: 0,
    relevance: 0,
  };

  const strongAnswers: string[] = [];
  const weakAnswers: string[] = [];
  const missedConcepts: string[] = [];
  const areasToImprove: string[] = [];
  const answerImprovements: any[] = [];

  for (const q of interview.questions) {
    const fb = q.feedback;
    const hasAnswer = (q.studentAnswer && q.studentAnswer.trim().length > 0) || (q.studentCode && q.studentCode.trim().length > 0);

    if (fb && hasAnswer) {
      const qCorrectness = fb.rubricBreakdown?.technicalCorrectness ?? fb.scores?.correctness ?? 0;
      const qDepth = fb.rubricBreakdown?.problemSolving ?? fb.scores?.technicalDepth ?? 0;
      const qComm = fb.rubricBreakdown?.communication ?? fb.scores?.communication ?? 0;
      const qRel = fb.rubricBreakdown?.relevance ?? fb.scores?.completeness ?? 0;
      const qComp = fb.rubricBreakdown?.completeness ?? fb.scores?.completeness ?? 0;
      const qClarity = fb.scores?.clarity ?? qComm;
      const qConfidence = fb.scores?.confidence ?? qComm;

      totalScore += fb.overallScore || 0;
      totals.correctness += qCorrectness;
      totals.technicalDepth += qDepth;
      totals.clarity += qClarity;
      totals.confidence += qConfidence;
      totals.completeness += qComp;
      totals.communication += qComm;
      totals.relevance += qRel;

      if (fb.overallScore >= 75) {
        strongAnswers.push(`Question: "${q.question}" - Strong explanation of core mechanics.`);
      } else {
        weakAnswers.push(`Question: "${q.question}" - Lacked depth or omitted edge case trade-offs.`);
      }

      if (Array.isArray(fb.whatWasMissed)) {
        missedConcepts.push(...fb.whatWasMissed.slice(0, 2));
      }
      if (Array.isArray(fb.howToImprove)) {
        areasToImprove.push(...fb.howToImprove.slice(0, 2));
      }

      answerImprovements.push({
        questionId: q.id,
        question: q.question,
        studentAnswer: q.studentAnswer || 'No verbal answer recorded',
        studentCode: q.studentCode,
        whatWasGood: fb.whatWentWell?.[0] || 'Clear delivery attempt',
        whatWasMissing: fb.whatWasMissed?.[0] || 'Omitted edge case failure modes',
        suggestedAnswer: fb.modelAnswer || 'A production-grade answer articulates requirements, trade-offs, and failure recovery.',
      });
    } else {
      // Unanswered question counted as 0
      weakAnswers.push(`Question: "${q.question}" - Skipped or unattempted in session.`);
      const benchmarkEval = q.feedback?.modelAnswer
        ? q.feedback
        : AIService.fallbackAnswerEvaluation(q.question, '', q.category, interview.role);
      answerImprovements.push({
        questionId: q.id,
        question: q.question,
        studentAnswer: 'Unanswered / Skipped (Not attempted in session)',
        studentCode: q.studentCode,
        whatWasGood: 'N/A (Question not attempted)',
        whatWasMissing: 'Candidate exited or skipped this question before answering.',
        suggestedAnswer: benchmarkEval.modelAnswer,
      });
    }
  }

  // Normalize performance metrics based on answered questions
  const divisor = Math.max(1, answeredCount);
  const averageAnsweredScore = Math.round(totalScore / divisor);

  // Overall score blends performance on answered questions with completion factor
  // If all questions were completed, overallScore equals averageAnsweredScore.
  // If session ended early, completion ratio scales it transparently without inflating partial attempts.
  const completionRatio = answeredCount / Math.max(1, totalQuestions);
  const overallScore = Math.min(100, Math.max(0, Math.round(averageAnsweredScore * (0.55 + 0.45 * completionRatio))));

  const avgCorrectness = Math.min(100, Math.round(totals.correctness / divisor));
  const avgDepth = Math.min(100, Math.round(totals.technicalDepth / divisor));
  const avgComm = Math.min(100, Math.round(totals.communication / divisor));
  const avgRel = Math.min(100, Math.round(totals.relevance / divisor));
  const avgComp = Math.min(100, Math.round(totals.completeness / divisor));
  const avgClarity = Math.min(100, Math.round(totals.clarity / divisor));
  const avgConfidence = Math.min(100, Math.round(totals.confidence / divisor));

  // Category scores (out of 100) aligned directly with the 5-dimension evaluation rubric
  const categoryScores = {
    technicalKnowledge: avgDepth,
    communicationClarity: avgComm,
    problemSolving: avgCorrectness,
    answerRelevance: avgRel,
    conceptualUnderstanding: avgClarity,
    completeness: avgComp,
  };

  const averageScores = {
    correctness: avgCorrectness,
    technicalDepth: avgDepth,
    clarity: avgClarity,
    confidence: avgConfidence,
    completeness: avgComp,
    communication: avgComm,
    relevance: avgRel,
  };

  const prepLevel =
    overallScore >= 78 && answeredCount >= 3
      ? 'Ready for SDE Technical Loops (Tier-1 Standard)'
      : overallScore >= 55 && answeredCount >= 2
      ? 'Recommended for Targeted Practice (Moderate Readiness)'
      : 'Foundational Revision Recommended (Needs Practice)';

  const defaultTopics = [
    'Concurrency & Distributed Locks (ACID / Redis / DB Locks)',
    'Event Loop & Asynchronous I/O Internals',
    'Circuit Breaker Pattern & Cascading Failure Triage',
    'STAR Storytelling for Behavioral Leadership Questions',
  ];

  return {
    overallScore,
    averageAnsweredScore,
    completionStatus: answeredCount === totalQuestions ? 'completed' : 'partially_completed',
    questionsAnswered: answeredCount,
    questionsSkipped: Math.max(0, totalQuestions - answeredCount),
    totalDurationMinutes: interview.duration || 30,
    averageScores,
    categoryScores,
    detailedFeedback: {
      strongAnswers: strongAnswers.slice(0, 3),
      weakAnswers: weakAnswers.slice(0, 3),
      missedConcepts: Array.from(new Set(missedConcepts)).slice(0, 4),
      areasToImprove: Array.from(new Set(areasToImprove)).slice(0, 4),
    },
    answerImprovements,
    recommendations: {
      preparationLevel: prepLevel,
      recommendedTopics: defaultTopics,
      suggestedNextInterview:
        interview.interviewType === 'Technical'
          ? 'Coding Interview with Monaco Sandbox'
          : 'Full Stack Developer Interview',
    },
  };
}
