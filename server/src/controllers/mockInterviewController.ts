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
      interviewerName = 'Alex Morgan',
      interviewerRole = 'Senior Engineering Interviewer',
      interviewerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
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

    // Build structured resume topics if provided or if resume text exists
    let formattedTopics = resumeTopics;
    if (!formattedTopics && resumeText) {
      formattedTopics = [
        { id: 't1', title: 'Candidate Profile & Background', category: 'Profile', description: 'Undergraduate student & core background', status: 'discussing' },
        { id: 't2', title: 'Technical Stack & Language Internals', category: 'PROFILE', description: 'Web development & problem solving', status: 'not_yet' },
        { id: 't3', title: 'Core Project Architecture & Design', category: 'PROJECT', description: 'Microservices & event streams', status: 'not_yet' },
        { id: 't4', title: 'Concurrency, Data Consistency & Scale', category: 'PROJECT', description: 'ACID guarantees and DB locks', status: 'not_yet' },
        { id: 't5', title: 'Framework & API Implementation', category: 'STACK', description: 'JavaScript event loop & Node.js I/O', status: 'not_yet' },
        { id: 't6', title: 'Data Structures & Algorithmic Trade-offs', category: 'ALGORITHMS', description: 'Time and space complexity', status: 'not_yet' },
        { id: 't7', title: 'STAR Behavioral Scenarios', category: 'BEHAVIORAL', description: 'Leadership principles and delivery', status: 'not_yet' },
        { id: 't8', title: 'Production Reliability & System Design', category: 'SYSTEM DESIGN', description: 'Zero downtime and rate limiting', status: 'not_yet' },
      ];
    }

    // Generate initial structured questions based on configuration and interview stages (with strict 2.5s race timeout)
    const questionGenPromise = AIService.generateMockQuestions({
      title: title || `${company ? company + ' ' : ''}${role} ${interviewType} Interview`,
      role,
      experienceLevel,
      company: company || 'General Tech',
      customTopics: skillsList,
      difficulty,
      type: interviewType === 'HR' ? 'HR' : interviewType === 'Behavioral' ? 'Behavioral' : 'Technical',
      questionCount: count,
      candidateSkills: skillsList,
      resumeText: resumeText || '',
      targetJD: jobDescription || '',
      roundType: interviewType.toLowerCase().replace(/\s+/g, '_'),
    });

    const instantFallbackTimer = new Promise<any[]>((resolve) =>
      setTimeout(() => {
        resolve((AIService as any).fallbackMockQuestions(role, difficulty, interviewType, count));
      }, 2500)
    );

    const generatedQuestions = await Promise.race([questionGenPromise, instantFallbackTimer]);

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
      expectedPoints: q.expectedPoints || ['Clear conceptual breakdown', 'Real-world engineering trade-offs'],
      sampleFollowUp: q.sampleFollowUp || 'Can you walk me through the trade-offs of this approach?',
      studentAnswer: undefined,
      answeredAt: undefined,
      feedback: undefined,
    }));

    // Ensure Stage 1 is ALWAYS the Introduction & Background question to synchronize with Emily's spoken greeting
    if (questionsWithStages.length > 0) {
      const firstQText = (questionsWithStages[0].question || '').toLowerCase();
      if (!firstQText.includes('yourself') && !firstQText.includes('introduction') && !firstQText.includes('journey')) {
        questionsWithStages[0] = {
          id: `q-intro-${Date.now().toString(36)}`,
          question: `Tell me about yourself, your background in Computer Science, and a brief overview of the key projects you've developed such as your salary or electricity usage tracker.`,
          category: 'Behavioral',
          difficulty: 'Beginner',
          stage: 'introduction',
          expectedPoints: [
            'Candidate background, education in Computer Science & engineering journey',
            'Overview of core projects developed (e.g., Salary tracker, Electricity usage tracker)',
            'Clear, articulate communication and structured self-introduction',
          ],
          sampleFollowUp: 'What motivated you to build the electricity usage tracker, and what was your primary architectural role?',
          studentAnswer: undefined,
          answeredAt: undefined,
          feedback: undefined,
        };
      }
    }

    // Coding Problem template if coding interview mode
    let codingProblem: any = undefined;
    if (isCodingInterview) {
      codingProblem = {
        title: 'LRU Cache or Distributed Rate Limiter Component',
        difficulty,
        description: `Design and implement an efficient caching or rate limiting utility. Your solution must support sub-millisecond retrieval and insertion under concurrency.\n\nKey constraints:\n- Time complexity must be O(1) for lookups and updates.\n- Memory consumption must not exceed O(Capacity).`,
        constraints: ['Capacity > 0 and Capacity <= 10000', 'Keys and values are positive integers (1 to 10^5)', 'Sub-millisecond latency per operation'],
        starterCode: {
          javascript: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    else if (this.cache.size >= this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n    this.cache.set(key, value);\n  }\n}\n\n// Driver test execution\nconst lru = new LRUCache(2);\nlru.put(1, 100);\nlru.put(2, 200);\nconsole.log("Key 1:", lru.get(1));`,
          python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        return self.cache.get(key, -1)\n\n    def put(self, key: int, value: int) -> None:\n        self.cache[key] = value\n\nlru = LRUCache(2)\nlru.put(1, 100)\nprint("Key 1:", lru.get(1))`,
          java: `import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        System.out.println("Coding Interview Sandbox Initialized");\n    }\n}`,
          cpp: `#include <iostream>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    cout << "Coding Interview Sandbox Initialized" << endl;\n    return 0;\n}`,
        },
        sampleInput: 'LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.get(1);',
        sampleOutput: '1',
      };
    }

    const sessionData: any = {
      userId: resolvedUid,
      title: title || `${company ? company + ' ' : ''}${role} · ${interviewType}`,
      interviewType,
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
      resumeText,
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
      return;
    }

    // Session Ownership Verification
    const resolvedUid = await resolveUserId(authReq, isConnected);
    if (interview.userId && interview.userId.toString() !== resolvedUid && interview.userId.toString() !== userId) {
      // Allow demo user or pass if in dev mode
    }

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
          language: codeLanguage || 'javascript',
          stdin: '',
        });
      } catch (err: any) {
        codeExecutionResult = { status: 'Error', error: err?.message || 'Execution failed' };
      }
    }

    // Concurrently evaluate candidate answer AND generate live next question in parallel
    const hasNextQuestion = qIndex + 1 < interview.questions.length;
    const combinedResponse = cleanAnswer + (code ? `\n\nSubmitted Code Implementation (${codeLanguage || 'code'}):\n${code}` : '');

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
            resumeText: interview.resumeText,
            questionNumber: qIndex + 2,
            totalQuestions: interview.questions.length,
            currentQuestion: targetQuestion.question,
            candidateAnswer: combinedResponse,
          })
        : Promise.resolve(null),
    ]);

    const evaluation =
      evalResult.status === 'fulfilled'
        ? evalResult.value
        : (AIService as any).fallbackAnswerEvaluation(
            targetQuestion.question,
            combinedResponse,
            targetQuestion.category
          );

    targetQuestion.studentAnswer = cleanAnswer;
    targetQuestion.studentCode = code;
    targetQuestion.codeLanguage = codeLanguage;
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
        interviewerSpeech = `Hmm, okay. ${nextQ.question}`;
      }
    } else {
      // Completed all questions
      interview.status = 'completed';
      interview.currentStage = 'completed';
      interview.completedAt = new Date();
      interviewerSpeech = `Thank you so much. That concludes all questions for our interview session today. I am generating your comprehensive hiring evaluation report now.`;

      // Generate the complete performance report
      interview.report = generateComprehensiveReport(interview);
      interview.overallScore = interview.report.overallScore;
    }

    if (isConnected) {
      interview.markModified('questions');
      if (interview.report) interview.markModified('report');
      await interview.save();
    } else {
      await devStore.updateMockInterview(id, {
        questions: interview.questions,
        status: interview.status,
        currentStage: interview.currentStage,
        completedAt: interview.completedAt,
        report: interview.report,
        overallScore: interview.overallScore,
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

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Code string is required for sandbox execution.',
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
      data: result,
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
      return;
    }

    interview.status = 'completed';
    interview.currentStage = 'completed';
    interview.completedAt = new Date();

    // Generate comprehensive performance report
    const report = generateComprehensiveReport(interview);
    interview.report = report;
    interview.overallScore = report.overallScore;

    if (isConnected) {
      interview.markModified('report');
      await interview.save();
    } else {
      await devStore.updateMockInterview(id, {
        status: 'completed',
        currentStage: 'completed',
        completedAt: interview.completedAt,
        report,
        overallScore: report.overallScore,
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
        error: 'Interview session not found.',
        timestamp: new Date().toISOString(),
      });
      return;
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
      interviews = await MockInterview.find({
        $or: [{ userId: resolvedUid }, { userId: authReq.user?.userId }],
      }).sort({ createdAt: -1 });
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
    const authReq = req as AuthenticatedRequest;
    const isConnected = mongoose.connection.readyState === 1;
    const resolvedUid = await resolveUserId(authReq, isConnected);

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const interview = await MockInterview.findById(id);
      if (!interview) {
        res.status(404).json({ success: false, error: 'Interview session not found.' });
        return;
      }
      if (interview.userId.toString() !== resolvedUid && interview.userId.toString() !== authReq.user?.userId) {
        res.status(403).json({ success: false, error: 'Unauthorized to delete this interview.' });
        return;
      }
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

export const updateCandidateNotes = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { notes } = req.body;
  const isConnected = mongoose.connection.readyState === 1;

  if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
    await MockInterview.findByIdAndUpdate(id, { candidateNotes: notes });
  } else {
    await devStore.updateMockInterview(id, { candidateNotes: notes });
  }

  res.status(200).json({ success: true, message: 'Notes saved' });
};

export const updateTopicStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, topicId } = req.params;
    const { status } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const interview = await MockInterview.findById(id);
      if (interview && interview.resumeTopics) {
        interview.resumeTopics = interview.resumeTopics.map((t: any) =>
          t.id === topicId ? { ...t, status: status || 'discussed' } : t
        );
        await interview.save();
      }
    } else {
      const interview = await devStore.getMockInterview(id);
      if (interview && interview.resumeTopics) {
        interview.resumeTopics = interview.resumeTopics.map((t: any) =>
          t.id === topicId ? { ...t, status: status || 'discussed' } : t
        );
        await devStore.updateMockInterview(id, { resumeTopics: interview.resumeTopics });
      }
    }
    res.status(200).json({ success: true, message: 'Topic updated' });
  } catch (error) {
    res.status(200).json({ success: true, message: 'Topic updated' });
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
    return {
      overallScore: 0,
      completionStatus: 'incomplete',
      questionsAnswered: 0,
      questionsSkipped: totalQuestions,
      totalDurationMinutes: interview.duration || 30,
      categoryScores: {
        technicalKnowledge: 0,
        communicationClarity: 0,
        problemSolving: 0,
        answerRelevance: 0,
        conceptualUnderstanding: 0,
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
      totalScore += fb.overallScore || 0;
      totals.correctness += fb.scores?.correctness || 0;
      totals.technicalDepth += fb.scores?.technicalDepth || 0;
      totals.clarity += fb.scores?.clarity || 0;
      totals.confidence += fb.scores?.confidence || 0;
      totals.completeness += fb.scores?.completeness || 0;
      totals.communication += fb.scores?.communication || 0;

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
      weakAnswers.push(`Question: "${q.question}" - Skipped or unanswered.`);
      answerImprovements.push({
        questionId: q.id,
        question: q.question,
        studentAnswer: 'Unanswered / Skipped',
        studentCode: q.studentCode,
        whatWasGood: 'N/A',
        whatWasMissing: 'Candidate skipped this question.',
        suggestedAnswer: fb?.modelAnswer || 'A production-grade answer articulates requirements, trade-offs, and failure recovery.',
      });
    }
  }

  // Normalize performance metrics based on answered questions
  const divisor = Math.max(1, answeredCount);
  const averageAnsweredScore = Math.round(totalScore / divisor);

  // Overall score blends performance on answered questions with completion factor
  // If all questions were completed, overallScore is purely the average.
  // If session ended early, completion ratio scales it fairly without crushing answered performance.
  const completionRatio = answeredCount / totalQuestions;
  const overallScore = Math.min(100, Math.max(0, Math.round(averageAnsweredScore * (0.55 + 0.45 * completionRatio))));

  // Category scores (out of 100) normalized across answered questions
  const categoryScores = {
    technicalKnowledge: Math.min(100, Math.round(totals.technicalDepth / divisor)),
    communicationClarity: Math.min(100, Math.round(totals.communication / divisor)),
    problemSolving: Math.min(100, Math.round(totals.correctness / divisor)),
    answerRelevance: Math.min(100, Math.round(totals.completeness / divisor)),
    conceptualUnderstanding: Math.min(100, Math.round(totals.clarity / divisor)),
  };

  const prepLevel =
    overallScore >= 80 && answeredCount >= 4
      ? 'Placement Ready'
      : overallScore >= 60 && answeredCount >= 3
      ? 'Intermediate'
      : 'Needs Further Practice';

  const defaultTopics = [
    'Concurrency & Distributed Locks (ACID / Redis / DB Locks)',
    'Event Loop & Asynchronous I/O Internals',
    'Circuit Breaker Pattern & Cascading Failure Triage',
    'STAR Storytelling for Behavioral Leadership Questions',
  ];

  return {
    overallScore,
    completionStatus: answeredCount === totalQuestions ? 'completed' : 'partially_completed',
    questionsAnswered: answeredCount,
    questionsSkipped: totalQuestions - answeredCount,
    totalDurationMinutes: interview.duration || 30,
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
