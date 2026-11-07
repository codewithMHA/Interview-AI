import bcrypt from 'bcryptjs';
import { SEED_QUESTIONS, SeedQuestion } from '../data/seedQuestions.js';
import { SEED_PROBLEMS, SeedProblem } from '../data/seedProblems.js';
import { SEED_ROADMAPS, SeedRoadmap } from '../data/seedRoadmaps.js';

export interface DevUser {
  id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'student' | 'admin';
  createdAt: Date;
}

export interface DevProfile {
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  targetRole?: string;
  experienceLevel?: string;
  programmingLanguages: string[];
  skills: string[];
  githubProfile?: string;
  linkedinProfile?: string;
  preparationScore: number;
  technicalScore?: number;
  hrScore?: number;
  streakCount: number;
  xpPoints: number;
  level: number;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevQuestion extends SeedQuestion {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevUserQuestionStatus {
  userId: string;
  questionId: string;
  isBookmarked: boolean;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface DevCodingProblem extends SeedProblem {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevSubmission {
  _id: string;
  userId: string;
  problemId: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  code: string;
  status:
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Compilation Error'
    | 'Runtime Error';
  runtime: number;
  memory: number;
  testCasesPassed: number;
  totalTestCases: number;
  testResults: any[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevConversation {
  _id: string;
  userId: string;
  title: string;
  summary?: string;
  topic?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevMessage {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

class DevStore {
  private users: Map<string, DevUser> = new Map();
  private profiles: Map<string, DevProfile> = new Map();
  private questions: Map<string, DevQuestion> = new Map();
  private userQuestionStatuses: Map<string, DevUserQuestionStatus> = new Map();
  private problems: Map<string, DevCodingProblem> = new Map();
  private submissions: Map<string, DevSubmission> = new Map();
  private userSolvedProblems: Map<string, Set<string>> = new Map();
  private roadmaps: Map<string, any> = new Map();
  private userRoadmapProgress: Map<string, any> = new Map();
  private userActiveRoadmapId: Map<string, string> = new Map();
  private conversations: Map<string, DevConversation> = new Map();
  private conversationMessages: Map<string, DevMessage[]> = new Map();

  constructor() {
    this.seedDefaultUser();
    this.seedQuestions();
    this.seedProblems();
    this.seedRoadmaps();
    this.seedDemoActivity();
  }

  private seedDemoActivity() {
    const demoId = '65f1a2b3c4d5e6f7a8b9c0d1';
    const now = new Date();

    // 1. Seed two accepted coding submissions for the demo student
    const sub1Id = 'sub-demo-1';
    this.submissions.set(sub1Id, {
      _id: sub1Id,
      userId: demoId,
      problemId: 'two-sum',
      language: 'javascript',
      code: 'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }',
      status: 'Accepted',
      runtime: 52,
      memory: 42.1,
      testCasesPassed: 3,
      totalTestCases: 3,
      testResults: [],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    const sub2Id = 'sub-demo-2';
    this.submissions.set(sub2Id, {
      _id: sub2Id,
      userId: demoId,
      problemId: 'valid-parentheses',
      language: 'javascript',
      code: 'function isValid(s) { const stack = []; const map = { ")": "(", "}": "{", "]": "[" }; for (const ch of s) { if (!map[ch]) stack.push(ch); else if (stack.pop() !== map[ch]) return false; } return stack.length === 0; }',
      status: 'Accepted',
      runtime: 48,
      memory: 41.8,
      testCasesPassed: 3,
      totalTestCases: 3,
      testResults: [],
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    });

    // Mark solved problems in userSolvedProblems
    this.userSolvedProblems.set(demoId, new Set(['two-sum', 'valid-parentheses']));

    // 2. Auto-enroll in full-stack-30 roadmap with initial completed tasks
    this.userActiveRoadmapId.set(demoId, 'full-stack-30');
    this.userRoadmapProgress.set(`${demoId}:full-stack-30`, {
      userId: demoId,
      roadmapId: 'full-stack-30',
      roadmapTitle: 'Full-Stack Developer 30-Day Sprint',
      enrolledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      completedTasks: ['fs-d1-t1', 'fs-d1-t2', 'fs-d2-t1'],
      totalTasks: 30,
      completedCount: 3,
      progressPercentage: 10,
      lastActiveAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    });
  }

  private seedRoadmaps() {
    for (const r of SEED_ROADMAPS) {
      this.roadmaps.set(r.slug, { ...r, _id: r.id });
      this.roadmaps.set(r.id, { ...r, _id: r.id });
    }
  }

  private seedDefaultUser() {
    const demoId = '65f1a2b3c4d5e6f7a8b9c0d1';
    const hashedPassword = bcrypt.hashSync('Placement2026!', 10);
    this.users.set('student@placement.edu', {
      id: demoId,
      name: 'Mohammed Farooq',
      email: 'student@placement.edu',
      password: hashedPassword,
      role: 'student',
      createdAt: new Date(),
    });

    this.profiles.set(demoId, {
      userId: demoId,
      name: 'Mohammed Farooq',
      email: 'student@placement.edu',
      college: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      graduationYear: 2026,
      targetRole: 'Software Engineer',
      experienceLevel: 'Intermediate',
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
      skills: ['Data Structures', 'Algorithms', 'React', 'Node.js', 'MongoDB', 'System Design'],
      githubProfile: 'https://github.com/mohammed-farooq',
      linkedinProfile: 'https://linkedin.com/in/mohammed-farooq',
      preparationScore: 78,
      streakCount: 2,
      xpPoints: 820,
      level: 4,
      isOnboarded: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private seedQuestions() {
    SEED_QUESTIONS.forEach((q, idx) => {
      const id = `q-${idx + 1}`;
      this.questions.set(id, {
        ...q,
        _id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed some initial completions & bookmarks for demo user
    this.userQuestionStatuses.set('65f1a2b3c4d5e6f7a8b9c0d1_q-1', {
      userId: '65f1a2b3c4d5e6f7a8b9c0d1',
      questionId: 'q-1',
      isBookmarked: true,
      isCompleted: true,
      completedAt: new Date(),
    });
    this.userQuestionStatuses.set('65f1a2b3c4d5e6f7a8b9c0d1_q-2', {
      userId: '65f1a2b3c4d5e6f7a8b9c0d1',
      questionId: 'q-2',
      isBookmarked: false,
      isCompleted: true,
      completedAt: new Date(),
    });
    this.userQuestionStatuses.set('65f1a2b3c4d5e6f7a8b9c0d1_q-8', {
      userId: '65f1a2b3c4d5e6f7a8b9c0d1',
      questionId: 'q-8',
      isBookmarked: true,
      isCompleted: false,
    });
  }

  async findUserByEmail(email: string): Promise<DevUser | null> {
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  async findUserById(id: string): Promise<DevUser | null> {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  async createUser(data: { name: string; email: string; password: string; role?: 'student' | 'admin' }): Promise<DevUser> {
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user: DevUser = {
      id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role || 'student',
      createdAt: new Date(),
    };
    this.users.set(user.email, user);

    const profile: DevProfile = {
      userId: id,
      name: user.name,
      email: user.email,
      college: '',
      degree: 'B.Tech in Computer Science',
      graduationYear: new Date().getFullYear() + 1,
      targetRole: 'Software Engineer',
      experienceLevel: 'Beginner',
      programmingLanguages: ['JavaScript', 'Python'],
      skills: ['Data Structures', 'Algorithms', 'React'],
      preparationScore: 45,
      streakCount: 1,
      xpPoints: 100,
      level: 1,
      isOnboarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.set(id, profile);

    return user;
  }

  async getProfile(userId: string): Promise<DevProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, updates: Partial<DevProfile>): Promise<DevProfile | null> {
    const existing = this.profiles.get(userId);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  // --- Questions Methods ---
  async getQuestions(
    userId?: string,
    filters?: {
      search?: string;
      category?: string;
      topic?: string;
      difficulty?: string;
      company?: string;
      bookmarked?: boolean;
      completed?: boolean;
    }
  ): Promise<any[]> {
    let list = Array.from(this.questions.values());

    if (filters?.category && filters.category !== 'All') {
      list = list.filter((q) => q.category === filters.category);
    }

    if (filters?.difficulty && filters.difficulty !== 'All') {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }

    if (filters?.company && filters.company !== 'All') {
      const cLower = filters.company.toLowerCase().trim();
      list = list.filter((q) =>
        Array.isArray(q.companies) && q.companies.some((c: string) => c.toLowerCase().includes(cLower))
      );
    }

    if (filters?.topic && filters.topic !== 'All') {
      const tLower = filters.topic.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.topic.toLowerCase() === tLower ||
          q.topic.toLowerCase().includes(tLower) ||
          tLower.includes(q.topic.toLowerCase())
      );
    }

    if (filters?.search && filters.search.trim()) {
      const qLower = filters.search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(qLower) ||
          q.question.toLowerCase().includes(qLower) ||
          q.topic.toLowerCase().includes(qLower) ||
          q.answer.toLowerCase().includes(qLower) ||
          (Array.isArray(q.companies) && q.companies.some((c: string) => c.toLowerCase().includes(qLower)))
      );
    }

    // Attach user status if userId is provided
    return list.map((q) => {
      const statusKey = `${userId}_${q._id}`;
      const status = userId ? this.userQuestionStatuses.get(statusKey) : null;
      return {
        ...q,
        isBookmarked: status?.isBookmarked || false,
        isCompleted: status?.isCompleted || false,
      };
    }).filter((q) => {
      if (filters?.bookmarked && !q.isBookmarked) return false;
      if (filters?.completed !== undefined) {
        if (filters.completed && !q.isCompleted) return false;
      }
      return true;
    });
  }

  async getQuestionById(id: string, userId?: string): Promise<any | null> {
    const q = this.questions.get(id);
    if (!q) return null;
    const statusKey = `${userId}_${q._id}`;
    const status = userId ? this.userQuestionStatuses.get(statusKey) : null;
    return {
      ...q,
      isBookmarked: status?.isBookmarked || false,
      isCompleted: status?.isCompleted || false,
    };
  }

  async toggleBookmark(userId: string, questionId: string): Promise<boolean> {
    const key = `${userId}_${questionId}`;
    const existing = this.userQuestionStatuses.get(key) || {
      userId,
      questionId,
      isBookmarked: false,
      isCompleted: false,
    };
    existing.isBookmarked = !existing.isBookmarked;
    this.userQuestionStatuses.set(key, existing);
    return existing.isBookmarked;
  }

  async toggleComplete(userId: string, questionId: string): Promise<boolean> {
    const key = `${userId}_${questionId}`;
    const existing = this.userQuestionStatuses.get(key) || {
      userId,
      questionId,
      isBookmarked: false,
      isCompleted: false,
    };
    existing.isCompleted = !existing.isCompleted;
    existing.completedAt = existing.isCompleted ? new Date() : undefined;
    this.userQuestionStatuses.set(key, existing);

    // Update profile preparationScore and XP points
    const profile = this.profiles.get(userId);
    if (profile) {
      if (existing.isCompleted) {
        profile.xpPoints += 15;
        profile.preparationScore = Math.min(100, profile.preparationScore + 2);
      } else {
        profile.xpPoints = Math.max(0, profile.xpPoints - 15);
        profile.preparationScore = Math.max(0, profile.preparationScore - 2);
      }
      profile.level = Math.floor(profile.xpPoints / 200) + 1;
      this.profiles.set(userId, profile);
    }

    return existing.isCompleted;
  }

  async getUserCompletedQuestionsCount(userId: string): Promise<number> {
    let count = 0;
    for (const status of this.userQuestionStatuses.values()) {
      if (status.userId === userId && status.isCompleted) {
        count++;
      }
    }
    return count;
  }

  private seedProblems() {
    SEED_PROBLEMS.forEach((prob, idx) => {
      const id = `prob-${idx + 1}`;
      this.problems.set(id, {
        ...prob,
        _id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async getProblems(
    userId?: string,
    filter?: { category?: string; difficulty?: string; search?: string; company?: string }
  ) {
    let list = Array.from(this.problems.values());

    if (filter?.category && filter.category !== 'All') {
      list = list.filter(
        (p) => p.category.toLowerCase() === filter.category!.toLowerCase()
      );
    }

    if (filter?.difficulty && filter.difficulty !== 'All') {
      list = list.filter(
        (p) => p.difficulty.toLowerCase() === filter.difficulty!.toLowerCase()
      );
    }

    if (filter?.company && filter.company !== 'All') {
      const comp = filter.company.toLowerCase().trim();
      list = list.filter((p) =>
        Array.isArray(p.companies) && p.companies.some((c) => c.toLowerCase().includes(comp))
      );
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const term = filter.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.companies.some((c) => c.toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => a.order - b.order);

    const userSolved = userId
      ? this.userSolvedProblems.get(userId) || new Set()
      : new Set();

    return list.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      difficulty: p.difficulty,
      acceptanceRate: p.acceptanceRate,
      companies: p.companies,
      isSolved: userSolved.has(p._id) || userSolved.has(p.slug),
    }));
  }

  async getProblemByIdOrSlug(idOrSlug: string, userId?: string) {
    let prob = this.problems.get(idOrSlug);
    if (!prob) {
      prob = Array.from(this.problems.values()).find((p) => p.slug === idOrSlug);
    }
    if (!prob) return null;

    const userSolved = userId
      ? this.userSolvedProblems.get(userId) || new Set()
      : new Set();

    return {
      ...prob,
      isSolved: userSolved.has(prob._id) || userSolved.has(prob.slug),
    };
  }

  async createSubmission(
    data: Omit<DevSubmission, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<DevSubmission> {
    const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const submission: DevSubmission = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.submissions.set(id, submission);

    if (data.status === 'Accepted') {
      let solved = this.userSolvedProblems.get(data.userId);
      if (!solved) {
        solved = new Set();
        this.userSolvedProblems.set(data.userId, solved);
      }
      solved.add(data.problemId);

      // Award XP to user profile
      const profile = this.profiles.get(data.userId);
      if (profile) {
        const prob = this.problems.get(data.problemId);
        const xpGain =
          prob?.difficulty === 'Hard'
            ? 150
            : prob?.difficulty === 'Medium'
            ? 100
            : 50;
        profile.xpPoints += xpGain;
        profile.preparationScore = Math.min(100, profile.preparationScore + 3);
        profile.level = Math.floor(profile.xpPoints / 200) + 1;
        this.profiles.set(data.userId, profile);
      }
    }

    return submission;
  }

  async getSubmissions(
    userId: string,
    problemId: string
  ): Promise<DevSubmission[]> {
    return Array.from(this.submissions.values())
      .filter((s) => s.userId === userId && s.problemId === problemId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserSubmissions(userId: string): Promise<DevSubmission[]> {
    return Array.from(this.submissions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDashboardOverview(userId: string): Promise<any> {
    const profile = await this.getProfile(userId);
    const questions = await this.getQuestions(userId);
    const completedQuestions = questions.filter((q) => q.isCompleted);
    const bookmarkedQuestions = questions.filter((q) => q.isBookmarked);
    const submissions = await this.getUserSubmissions(userId);
    const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted');
    const interviews = await this.getUserMockInterviews(userId);
    const completedInterviews = interviews.filter((i) => i.status === 'completed');
    const activeRoadmap = await this.getUserActiveRoadmap(userId);
    const completedTasksCount = activeRoadmap?.progress?.completedTasks?.length || 0;

    // Genuine Readiness Score calculation (0 to 100%, strictly 0% for new user)
    const codeScore = Math.min(35, Math.round((acceptedSubmissions.length / 20) * 35));
    let interviewScore = 0;
    if (completedInterviews.length > 0) {
      const avgScore =
        completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
        completedInterviews.length;
      interviewScore = Math.min(35, Math.round((avgScore / 100) * 35));
    }
    const roadmapScore = Math.min(
      30,
      Math.round(((completedTasksCount + completedQuestions.length) / 25) * 30)
    );
    const preparationScore = codeScore + interviewScore + roadmapScore;

    // Real Technical & HR scores from completed mock interviews (0 if no interview yet)
    let technicalScore = 0;
    let hrScore = 0;
    if (completedInterviews.length > 0) {
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
    }

    // Real recent activity (empty for new user)
    const realActivities: any[] = [];
    submissions.slice(0, 3).forEach((s) => {
      const prob = this.problems.get(s.problemId);
      realActivities.push({
        id: `sub-${s._id}`,
        title: prob?.title || 'Coding Problem',
        type: `Coding Challenge (${s.language || 'Code'})`,
        timestamp: s.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: s.status === 'Accepted' ? 'Accepted ✓' : s.status,
        rawDate: s.createdAt.getTime(),
      });
    });

    completedInterviews.slice(0, 3).forEach((i) => {
      const dateObj = new Date(i.completedAt || i.createdAt || Date.now());
      realActivities.push({
        id: `mock-${i._id || i.id}`,
        title: `${i.role || 'Placement'} Mock Round`,
        type: 'Mock Interview',
        timestamp: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: `${i.overallScore || 0}/100`,
        rawDate: dateObj.getTime(),
      });
    });

    realActivities.sort((a, b) => b.rawDate - a.rawDate);
    const recentActivity = realActivities.slice(0, 4);

    const xpPoints = profile?.xpPoints ?? 0;
    const level = Math.floor(xpPoints / 200) + 1;
    const targetRole = profile?.targetRole || 'Software Engineer';
    const streakCount = profile?.streakCount ?? (realActivities.length > 0 ? 1 : 0);

    const accuracyRate =
      submissions.length > 0
        ? Math.round((acceptedSubmissions.length / submissions.length) * 100)
        : 0;

    const categoryScores = {
      codingAndAlgorithms: Math.min(100, Math.round((codeScore / 35) * 100)),
      systemDesignAndArchitecture: technicalScore > 0
        ? Math.round(technicalScore * 0.7 + completedTasksCount * 4)
        : Math.min(100, completedTasksCount * 8),
      databaseAndSQL: Math.min(100, Math.round((completedQuestions.length / 12) * 100)),
      problemSolvingAndLogic: accuracyRate > 0
        ? Math.min(100, Math.round(accuracyRate * 0.5 + acceptedSubmissions.length * 5))
        : acceptedSubmissions.length > 0 ? Math.min(100, acceptedSubmissions.length * 10) : 0,
      communicationAndViva: hrScore > 0 ? hrScore : 0,
    };

    const companyReadiness = [
      {
        company: 'Amazon',
        role: 'SDE-1',
        readinessScore: Math.min(
          100,
          Math.round((acceptedSubmissions.length / 8) * 50) +
          (completedInterviews.length > 0 ? Math.round(((completedInterviews[0].overallScore || 70) / 70) * 30) : 0) +
          Math.min(20, Math.round((completedQuestions.length / 15) * 20))
        ),
      },
      {
        company: 'Google',
        role: 'Software Engineer',
        readinessScore: Math.min(
          100,
          Math.round((acceptedSubmissions.length / 10) * 50) +
          (completedInterviews.length > 0 ? Math.round(((completedInterviews[0].overallScore || 70) / 80) * 30) : 0) +
          Math.min(20, Math.round((completedQuestions.length / 15) * 20))
        ),
      },
      {
        company: 'TCS Digital',
        role: 'Prime Associate',
        readinessScore: Math.min(
          100,
          Math.round((acceptedSubmissions.length / 5) * 50) +
          (completedInterviews.length > 0 ? Math.round(((completedInterviews[0].overallScore || 70) / 60) * 30) : 0) +
          Math.min(20, Math.round((completedQuestions.length / 15) * 20))
        ),
      },
    ];

    return {
      preparationScore,
      streakCount,
      xpPoints,
      level,
      targetRole,
      experienceLevel: profile?.experienceLevel || 'Beginner',
      metrics: {
        totalQuestions: questions.length,
        completedQuestions: completedQuestions.length,
        bookmarkedQuestions: bookmarkedQuestions.length,
        codingProgress: acceptedSubmissions.length,
        technicalScore,
        hrScore,
        mockInterviewsCompleted: completedInterviews.length,
      },
      codingPerformance: {
        totalSolved: acceptedSubmissions.length,
        accuracyRate,
      },
      categoryScores,
      companyReadiness,
      nextRecommendedActivity: {
        title: `Start ${targetRole} Core Placement Preparation`,
        topic: 'DSA & Algorithms',
        category: 'Programming',
        estimatedMinutes: 20,
        type: 'coding',
      },
      aiRecommendation: {
        title: 'Master Core Coding & System Architecture',
        reason: 'Solving verified coding challenges and practice questions will increase your placement readiness score up to 100%.',
        suggestedQuestion: 'How does Hash Map handle collisions under the hood?',
        topic: 'DSA',
      },
      recentActivity,
    };
  }

  // ==========================================
  // MOCK INTERVIEWS (In-Memory Fallback)
  // ==========================================
  private mockInterviews: Map<string, any> = new Map();

  async createMockInterview(data: any): Promise<any> {
    const id = `interview-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const session = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockInterviews.set(id, session);
    return session;
  }

  async getMockInterview(id: string): Promise<any | null> {
    return this.mockInterviews.get(id) || null;
  }

  async updateMockInterview(id: string, updates: any): Promise<any | null> {
    const existing = this.mockInterviews.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.mockInterviews.set(id, updated);

    // If completed and has XP, award to profile
    if (updates.status === 'completed' && updates.xpEarned && updated.userId) {
      const profile = this.profiles.get(updated.userId);
      if (profile) {
        profile.xpPoints = (profile.xpPoints || 0) + updates.xpEarned;
        profile.preparationScore = Math.min(99, (profile.preparationScore || 50) + 5);
        profile.level = Math.floor(profile.xpPoints / 200) + 1;
        this.profiles.set(updated.userId, profile);
      }
    }

    return updated;
  }

  async getUserMockInterviews(userId: string): Promise<any[]> {
    return Array.from(this.mockInterviews.values())
      .filter((i) => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteMockInterview(id: string): Promise<boolean> {
    return this.mockInterviews.delete(id);
  }

  // ==========================================
  // ROADMAPS & CURRICULUM (In-Memory Fallback)
  // ==========================================
  async getRoadmaps(): Promise<any[]> {
    const list: any[] = [];
    const seen = new Set<string>();
    for (const r of this.roadmaps.values()) {
      if (!seen.has(r.slug)) {
        seen.add(r.slug);
        list.push(r);
      }
    }
    return list;
  }

  async getRoadmapByIdOrSlug(idOrSlug: string): Promise<any | null> {
    return this.roadmaps.get(idOrSlug) || null;
  }

  async saveRoadmap(roadmapData: any): Promise<any> {
    const id = roadmapData.id || `roadmap-${Date.now()}`;
    const slug = roadmapData.slug || `custom-${Date.now()}`;
    const full = {
      ...roadmapData,
      id,
      slug,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roadmaps.set(id, full);
    this.roadmaps.set(slug, full);
    return full;
  }

  async getUserActiveRoadmap(userId: string): Promise<any | null> {
    let roadmapId = this.userActiveRoadmapId.get(userId);
    if (!roadmapId) {
      // Default to full-stack-30
      roadmapId = 'full-stack-30';
      this.userActiveRoadmapId.set(userId, roadmapId);
    }

    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return null;

    const progressKey = `${userId}:${roadmap.slug}`;
    let progress = this.userRoadmapProgress.get(progressKey);

    if (!progress) {
      // Auto-enroll
      progress = {
        userId,
        roadmapId: roadmap.slug,
        roadmapTitle: roadmap.title,
        enrolledAt: new Date(),
        completedTasks: [],
        totalTasks: roadmap.totalTasks || 30,
        completedCount: 0,
        progressPercentage: 0,
        lastActiveAt: new Date(),
      };
      this.userRoadmapProgress.set(progressKey, progress);
    }

    return {
      progress,
      roadmap,
    };
  }

  async enrollUserRoadmap(userId: string, roadmapIdOrSlug: string): Promise<any> {
    const roadmap = this.roadmaps.get(roadmapIdOrSlug);
    if (!roadmap) {
      throw new Error(`Roadmap '${roadmapIdOrSlug}' not found.`);
    }

    this.userActiveRoadmapId.set(userId, roadmap.slug);
    const progressKey = `${userId}:${roadmap.slug}`;

    let progress = this.userRoadmapProgress.get(progressKey);
    if (!progress) {
      progress = {
        userId,
        roadmapId: roadmap.slug,
        roadmapTitle: roadmap.title,
        enrolledAt: new Date(),
        completedTasks: [],
        totalTasks: roadmap.totalTasks || 30,
        completedCount: 0,
        progressPercentage: 0,
        lastActiveAt: new Date(),
      };
      this.userRoadmapProgress.set(progressKey, progress);
    }

    return {
      progress,
      roadmap,
    };
  }

  async toggleRoadmapTask(userId: string, roadmapSlug: string, taskId: string): Promise<any> {
    const roadmap = this.roadmaps.get(roadmapSlug);
    if (!roadmap) throw new Error(`Roadmap '${roadmapSlug}' not found.`);

    const progressKey = `${userId}:${roadmap.slug}`;
    let progress = this.userRoadmapProgress.get(progressKey);

    if (!progress) {
      progress = {
        userId,
        roadmapId: roadmap.slug,
        roadmapTitle: roadmap.title,
        enrolledAt: new Date(),
        completedTasks: [],
        totalTasks: roadmap.totalTasks || 30,
        completedCount: 0,
        progressPercentage: 0,
        lastActiveAt: new Date(),
      };
    }

    const completedSet = new Set<string>(progress.completedTasks || []);
    let isNowCompleted = false;

    // Find task to get XP reward
    let taskXp = 35;
    for (const week of roadmap.weeks || []) {
      for (const day of week.days || []) {
        for (const task of day.tasks || []) {
          if (task.id === taskId) {
            taskXp = task.xpReward || 35;
            break;
          }
        }
      }
    }

    if (completedSet.has(taskId)) {
      completedSet.delete(taskId);
      isNowCompleted = false;
    } else {
      completedSet.add(taskId);
      isNowCompleted = true;

      // Award XP to user profile
      const profile = this.profiles.get(userId);
      if (profile) {
        profile.xpPoints = (profile.xpPoints || 0) + taskXp;
        profile.preparationScore = Math.min(99, (profile.preparationScore || 50) + 2);
        profile.level = Math.floor(profile.xpPoints / 200) + 1;
        this.profiles.set(userId, profile);
      }
    }

    const completedTasks = Array.from(completedSet);
    const totalTasks = roadmap.totalTasks || 30;
    const progressPercentage = Math.round((completedTasks.length / totalTasks) * 100);

    progress.completedTasks = completedTasks;
    progress.completedCount = completedTasks.length;
    progress.progressPercentage = Math.min(100, progressPercentage);
    progress.lastActiveAt = new Date();

    this.userRoadmapProgress.set(progressKey, progress);

    return {
      progress,
      isCompleted: isNowCompleted,
      xpAwarded: isNowCompleted ? taskXp : 0,
    };
  }

  // ==========================================
  // AI Conversational Memory & Persistence
  // ==========================================

  public createConversation(
    userId: string = 'guest',
    title: string = 'New Conversation',
    topic: string = 'General'
  ): DevConversation {
    const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const conv: DevConversation = {
      _id: id,
      userId,
      title,
      summary: '',
      topic,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conv);
    this.conversationMessages.set(id, []);
    return conv;
  }

  public getConversations(userId: string = 'guest'): DevConversation[] {
    const list: DevConversation[] = [];
    for (const conv of this.conversations.values()) {
      if (conv.userId === userId || userId === 'guest') {
        list.push(conv);
      }
    }
    return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public getConversation(id: string): DevConversation | undefined {
    return this.conversations.get(id);
  }

  public updateConversation(
    id: string,
    updates: Partial<DevConversation>
  ): DevConversation | undefined {
    const conv = this.conversations.get(id);
    if (!conv) return undefined;
    const updated = {
      ...conv,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  public deleteConversation(id: string): boolean {
    const existed = this.conversations.delete(id);
    this.conversationMessages.delete(id);
    return existed;
  }

  public addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    data?: any
  ): DevMessage {
    let conv = this.conversations.get(conversationId);
    if (!conv) {
      conv = this.createConversation('guest', 'New Conversation');
      conversationId = conv._id;
    }

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const msg: DevMessage = {
      _id: msgId,
      conversationId,
      role,
      content,
      data: data || null,
      createdAt: now,
      updatedAt: now,
    };

    const messages = this.conversationMessages.get(conversationId) || [];
    messages.push(msg);
    this.conversationMessages.set(conversationId, messages);

    // Update conversation metadata
    conv.messageCount = messages.length;
    conv.updatedAt = now;
    if (conv.title === 'New Conversation' && role === 'user') {
      conv.title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
    }
    this.conversations.set(conversationId, conv);

    return msg;
  }

  public getMessages(conversationId: string, limit: number = 30): DevMessage[] {
    const list = this.conversationMessages.get(conversationId) || [];
    if (limit && list.length > limit) {
      return list.slice(-limit);
    }
    return [...list];
  }

  // ==========================================
  // RESUME SCANS (In-Memory Fallback)
  // ==========================================
  private resumeScans: Map<string, any> = new Map();

  public createResumeScan(data: any): any {
    const id = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const scan = {
      _id: id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.resumeScans.set(id, scan);
    return scan;
  }

  public getUserResumeScans(userId: string): any[] {
    const list: any[] = [];
    for (const scan of this.resumeScans.values()) {
      if (scan.userId === userId) {
        list.push(scan);
      }
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getResumeScanById(id: string): any | null {
    return this.resumeScans.get(id) || null;
  }
}

export const devStore = new DevStore();
