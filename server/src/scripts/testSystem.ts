import { createApp } from '../app.js';
import { EventEmitter } from 'events';
import express from 'express';
import { AIService } from '../services/aiService.js';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

const runTest = async (
  suite: string,
  name: string,
  fn: () => Promise<void>
): Promise<void> => {
  const start = Date.now();
  try {
    await fn();
    results.push({
      suite,
      name,
      passed: true,
      durationMs: Date.now() - start,
    });
    console.log(`  ✅ [PASS] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({
      suite,
      name,
      passed: false,
      durationMs: Date.now() - start,
      details: err?.message || String(err),
    });
    console.error(`  ❌ [FAIL] ${name} (${Date.now() - start}ms)`);
    console.error(`     Error: ${err?.message || err}`);
  }
};

const makeRequest = (
  app: express.Express,
  method: string,
  url: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any; headers: Record<string, string> }> => {
  return new Promise((resolve) => {
    const [pathPart, queryPart] = url.split('?');
    const parsedQuery: Record<string, string> = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        parsedQuery[key] = val;
      });
    }

    const req: any = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.path = pathPart;
    req.headers = {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };
    req.body = body || {};
    req.query = parsedQuery;
    req.params = {};
    req.socket = { remoteAddress: '127.0.0.1' };

    const resHeaders: Record<string, string> = {};
    const res: any = new EventEmitter();
    res.statusCode = 200;
    res.setHeader = (k: string, v: string) => {
      resHeaders[k.toLowerCase()] = v;
    };
    res.getHeader = (k: string) => resHeaders[k.toLowerCase()];
    res.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data: any) {
      resolve({ status: this.statusCode, data, headers: resHeaders });
    };
    res.send = function (data: any) {
      let parsed = data;
      try {
        if (typeof data === 'string') parsed = JSON.parse(data);
      } catch {}
      resolve({ status: this.statusCode, data: parsed, headers: resHeaders });
    };
    res.end = function (data: any) {
      let parsed = data;
      try {
        if (typeof data === 'string') parsed = JSON.parse(data);
      } catch {}
      resolve({ status: this.statusCode, data: parsed, headers: resHeaders });
    };

    app(req, res);
  });
};

export const runFullSystemVerification = async (): Promise<boolean> => {
  console.log('\n===============================================================');
  console.log('🚀 Phase 9: Automated System Verification & Integration Suite');
  console.log('===============================================================\n');

  const app = createApp();
  let authToken = '';

  // 1. Health & Security Headers Suite
  console.log('📦 Suite 1: Health, Gateway & Security Hardening');
  await runTest('Gateway', 'Health Check endpoint returns 200 OK', async () => {
    const res = await makeRequest(app, 'GET', '/api/health');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Expected status 200 & success: true, got ${res.status}`);
    }
  });

  await runTest('Security', 'Server sends required security headers (nosniff, sameorigin)', async () => {
    const res = await makeRequest(app, 'GET', '/api/health');
    if (res.headers['x-content-type-options'] !== 'nosniff') {
      throw new Error('Missing or invalid X-Content-Type-Options header');
    }
    if (res.headers['x-frame-options'] !== 'SAMEORIGIN') {
      throw new Error('Missing or invalid X-Frame-Options header');
    }
  });

  // 2. Authentication & User Profile Suite
  console.log('\n📦 Suite 2: Authentication & Profile Operations');
  await runTest('Auth', 'Login with student credentials generates valid JWT', async () => {
    const res = await makeRequest(app, 'POST', '/api/auth/login', {
      email: 'student@placement.edu',
      password: 'Placement2026!',
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Login failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    authToken = res.data.token;
  });

  await runTest('Auth', 'Protected /api/auth/me returns authenticated student identity', async () => {
    const res = await makeRequest(app, 'GET', '/api/auth/me', undefined, authToken);
    if (res.status !== 200 || !res.data.user) {
      throw new Error(`Auth me failed with status ${res.status}`);
    }
  });

  await runTest('Profile', 'Get profile details returns career onboarding state', async () => {
    const res = await makeRequest(app, 'GET', '/api/users/profile', undefined, authToken);
    if (res.status !== 200 || !res.data.data?.userId) {
      throw new Error(`Fetch profile failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 3. Question Bank Suite
  console.log('\n📦 Suite 3: Curated Question Bank & Search');
  await runTest('Questions', 'Fetch question bank with filtering and pagination', async () => {
    const res = await makeRequest(app, 'GET', '/api/questions?page=1&limit=5', undefined, authToken);
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error(`Question bank returned empty or failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 4. Coding Practice & Sandbox Suite
  console.log('\n📦 Suite 4: Coding Practice, Monaco & Judge0 Sandbox');
  await runTest('Coding', 'Fetch coding problem list and specific problem detail', async () => {
    const res = await makeRequest(app, 'GET', '/api/problems', undefined, authToken);
    if (res.status !== 200 || !res.data.data?.length) {
      throw new Error('Problems list empty or failed');
    }
  });

  await runTest('Coding', 'Run sandbox code execution test in JavaScript', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/problems/sandbox-run',
      {
        language: 'javascript',
        code: 'console.log("Sandbox execution test successful");',
        stdin: '',
      },
      authToken
    );
    if (res.status !== 200 || !res.data.data?.stdout?.includes('Sandbox execution test successful')) {
      throw new Error(`Sandbox execution failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 5. AI Services Suite
  console.log('\n📦 Suite 5: AI Code Analysis & Explain Code');
  await runTest('AI', 'AI Code Analysis returns Big-O intuition & interview pitch', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/ai/analyze-code',
      {
        problemTitle: 'Two Sum',
        problemDescription: 'Find two numbers that add up to target',
        language: 'javascript',
        userCode:
          'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }',
      },
      authToken
    );

    if (res.status !== 200 || !res.data.data?.timeComplexity) {
      throw new Error(`AI Code Analysis failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.data?.interviewerPitch) {
      throw new Error('AI Code Analysis missing interviewerPitch');
    }
  });

  await runTest('AI', 'AI Explain Code returns dry run trace & plain English logic', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/ai/explain-code',
      {
        problemTitle: 'Two Sum',
        language: 'javascript',
        userCode:
          'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }',
      },
      authToken
    );

    if (res.status !== 200 || !res.data.data?.overview) {
      throw new Error(`AI Explain Code failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.data?.dryRunExample) {
      throw new Error('AI Explain Code missing dryRunExample');
    }
  });

  await runTest('AI', 'AI Solve Doubt resolves student question with key takeaways & tips', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/ai/solve-doubt',
      {
        doubt: 'Why does HashMap have a default load factor of 0.75 in Java?',
        topic: 'Data Structures & Algorithms',
      },
      authToken
    );

    if (res.status !== 200 || !res.data.data?.directAnswer) {
      throw new Error(`AI Solve Doubt failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.data?.keyPoints || res.data.data.keyPoints.length === 0) {
      throw new Error('AI Solve Doubt missing keyPoints');
    }
  });

  await runTest('AI', 'AI Solve Doubt handles Islamic greetings respectfully (Salam -> Wa alaikum assalam)', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/ai/solve-doubt',
      {
        doubt: 'as salamu alaikum',
        topic: 'All / General Placement',
      },
      authToken
    );

    if (res.status !== 200 || !res.data.data?.directAnswer) {
      throw new Error(`AI Solve Doubt Greeting failed: ${JSON.stringify(res.data)}`);
    }
    const ans = res.data.data.directAnswer.toLowerCase();
    if (!ans.includes('wa alaikum') && !ans.includes('walaikum')) {
      throw new Error(`AI Solve Doubt expected Islamic greeting response, got: ${res.data.data.directAnswer}`);
    }
    if (ans.includes('namaste')) {
      throw new Error(`AI Solve Doubt should not contain namaste in response to salam`);
    }
  });

  await runTest('AI', 'AI Solve Doubt answers general coding questions without forcing placement examiner text', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/ai/solve-doubt',
      {
        doubt: 'Python kya hai aur kahan use hota hai?',
        topic: 'Programming',
      },
      authToken
    );

    if (res.status !== 200 || !res.data.data?.directAnswer) {
      throw new Error(`AI Solve Doubt Python failed: ${JSON.stringify(res.data)}`);
    }
    const ans = res.data.data.directAnswer.toLowerCase();
    if (!ans.includes('python')) {
      throw new Error(`AI Solve Doubt response should explain python`);
    }
    if (ans.includes('examiner ye dekhta hai')) {
      throw new Error(`AI Solve Doubt should not force robotic examiner text on general questions`);
    }
  });

  await runTest('AI', 'AI Conversational Memory maintains continuity across follow-up turns', async () => {
    // Turn 1: Ask about REST API
    const turn1 = await makeRequest(
      app,
      'POST',
      '/api/ai/solve-doubt',
      {
        doubt: 'What is REST API?',
        topic: 'Web Development',
      },
      authToken
    );

    if (turn1.status !== 200 || !turn1.data.data?.directAnswer || !turn1.data.data?.conversationId) {
      throw new Error(`Turn 1 failed: ${JSON.stringify(turn1.data)}`);
    }
    const convId = turn1.data.data.conversationId;

    // Turn 2: Follow-up question "What about authentication?" using the conversationId
    const turn2 = await makeRequest(
      app,
      'POST',
      '/api/ai/solve-doubt',
      {
        doubt: 'What about authentication?',
        conversationId: convId,
      },
      authToken
    );

    if (turn2.status !== 200 || !turn2.data.data?.directAnswer) {
      throw new Error(`Turn 2 failed: ${JSON.stringify(turn2.data)}`);
    }

    const t2Answer = turn2.data.data.directAnswer.toLowerCase();
    // Must understand that authentication is specifically in the context of REST APIs (JWT / stateless)
    if (!t2Answer.includes('jwt') && !t2Answer.includes('token') && !t2Answer.includes('rest') && !t2Answer.includes('stateless')) {
      throw new Error(`Turn 2 did not maintain REST context: ${turn2.data.data.directAnswer}`);
    }

    // Turn 3: Verify Process vs Thread conceptual clarity
    const threadRes = await makeRequest(
      app,
      'POST',
      '/api/ai/solve-doubt',
      {
        doubt: 'explain diff bte thread and the processes',
        topic: 'Operating Systems & Linux',
      },
      authToken
    );

    if (threadRes.status !== 200 || !threadRes.data.data?.directAnswer) {
      throw new Error(`Thread vs Process query failed: ${JSON.stringify(threadRes.data)}`);
    }
    const tAns = threadRes.data.data.directAnswer.toLowerCase();
    if (!tAns.includes('process') || !tAns.includes('thread') || !tAns.includes('memory')) {
      throw new Error(`Thread vs Process answer incomplete: ${threadRes.data.data.directAnswer}`);
    }

    // Verify Conversation List endpoint
    const listRes = await makeRequest(app, 'GET', '/api/ai/conversations', undefined, authToken);
    if (listRes.status !== 200 || !Array.isArray(listRes.data.data)) {
      throw new Error(`List conversations failed: ${JSON.stringify(listRes.data)}`);
    }

    // Verify Conversation Details endpoint
    const detailRes = await makeRequest(app, 'GET', `/api/ai/conversations/${convId}`, undefined, authToken);
    if (detailRes.status !== 200 || !detailRes.data.data?.messages || detailRes.data.data.messages.length < 2) {
      throw new Error(`Get conversation messages failed: ${JSON.stringify(detailRes.data)}`);
    }
  });

  // 6. Placement Roadmap Suite
  console.log('\n📦 Suite 6: 30-Day Placement Roadmap Curriculum');
  await runTest('Roadmap', 'Fetch active roadmap returns full curriculum and milestone tasks', async () => {
    const res = await makeRequest(app, 'GET', '/api/roadmaps/my/active', undefined, authToken);
    if (res.status !== 200 || !res.data.data?.roadmap) {
      throw new Error(`Active roadmap failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 7. AI Mock Interviews Suite
  console.log('\n📦 Suite 7: AI Mock Interview Engine & Question Tracks');
  await runTest('Interview', 'Fetch candidate interview history', async () => {
    const res = await makeRequest(app, 'GET', '/api/interviews', undefined, authToken);
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Interview history failed: ${JSON.stringify(res.data)}`);
    }
  });

  await runTest('Interview', 'Initialize role-specific mock interview session', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/interviews/start',
      {
        role: 'Full Stack Developer',
        difficulty: 'Intermediate',
        type: 'Technical',
      },
      authToken
    );
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Mock interview creation failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.data?.questions || res.data.data.questions.length === 0) {
      throw new Error('Mock interview has no questions generated');
    }
    const q1 = res.data.data.questions[0];
    if (q1.studentAnswer) {
      throw new Error('New interview must start with zero questions answered');
    }
  });

  await runTest('Interview', 'Submit answer evaluates accurately and isolates question state', async () => {
    // 1. Create session
    const startRes = await makeRequest(
      app,
      'POST',
      '/api/interviews/start',
      { role: 'Full Stack Developer', difficulty: 'Intermediate', type: 'Technical' },
      authToken
    );
    const session = startRes.data.data;
    const interviewId = session._id || session.id;
    const q0 = session.questions[0];

    const relevantAnswer =
      q0.expectedPoints && q0.expectedPoints.length > 0
        ? `Regarding ${q0.question}: ${q0.expectedPoints.join('. ')}. This ensures optimal runtime performance and strict constraint compliance.`
        : `To explain ${q0.question}: the system architecture decomposes this problem to maintain time and space efficiency while handling edge-case trade-offs.`;

    // 2. Submit answer to question 0
    const submitRes = await makeRequest(
      app,
      'POST',
      `/api/interviews/${interviewId}/submit-answer`,
      {
        questionId: q0.id,
        questionIndex: 0,
        answer: relevantAnswer,
      },
      authToken
    );

    if (submitRes.status !== 200 || !submitRes.data.data?.feedback) {
      throw new Error(`Submit answer failed: ${JSON.stringify(submitRes.data)}`);
    }

    const fb = submitRes.data.data.feedback;
    if (typeof fb.overallScore !== 'number' || fb.overallScore < 50) {
      throw new Error(`Expected solid score for substantive answer, got: ${fb.overallScore}`);
    }
    if (!fb.modelAnswer || fb.modelAnswer.length < 50) {
      throw new Error('Model answer is empty or incomplete');
    }

    // 3. Verify question 1 remains unanswered and clean
    const getRes = await makeRequest(app, 'GET', `/api/interviews/${interviewId}`, undefined, authToken);
    const updated = getRes.data.data;
    if (!updated.questions[0].studentAnswer) {
      throw new Error('Question 0 should have studentAnswer stored');
    }
    if (updated.questions[1].studentAnswer) {
      throw new Error('Question 1 must remain clean and unanswered');
    }
  });

  await runTest('Interview', 'Verify thita.ai voice resume interview lifecycle (Amazon SDE-1, Emily Zhou, 8 topics, live notes)', async () => {
    // 1. Start session with thita.ai parameters
    const startRes = await makeRequest(
      app,
      'POST',
      '/api/mock-interviews',
      {
        title: 'Amazon · PROJECT DEEP DIVE',
        role: 'SDE-1 at amazon',
        company: 'Amazon',
        experienceLevel: 'Fresher / SDE-1',
        difficulty: 'Intermediate',
        type: 'Technical',
        questionCount: 5,
        resumeText: 'Mohammed Hassan Ahmed\nComputer Science Engineering | Web Development 9482364185\nCollege Email LinkedIn | GitHub\nProject: Cloud Microservices Platform with Node.js, React, and MongoDB',
        targetJD: 'SDE-1 at amazon',
        roundType: 'project_deep_dive',
        interviewerName: 'Emily Zhou',
        interviewerRole: 'Senior Software Engineer',
        interviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        resumeTopics: [
          { id: 't1', title: 'Mohammed Hassan Ahmed', category: 'Profile', description: 'Undergraduate student', status: 'discussing' },
          { id: 't2', title: 'Undergraduate Engineering Profile', category: 'PROFILE', description: 'Web development & problem solving', status: 'not_yet' },
          { id: 't3', title: 'Core Project Architecture & Design', category: 'PROJECT', description: 'Microservices & event streams', status: 'not_yet' },
          { id: 't4', title: 'Concurrency, Data Consistency & Scale', category: 'PROJECT', description: 'ACID guarantees and DB locks', status: 'not_yet' },
          { id: 't5', title: 'Technical Stack & Language Internals', category: 'STACK', description: 'JavaScript event loop & Node.js I/O', status: 'not_yet' },
          { id: 't6', title: 'Data Structures & Algorithmic Trade-offs', category: 'ALGORITHMS', description: 'Time and space complexity', status: 'not_yet' },
          { id: 't7', title: 'STAR Behavioral Scenarios', category: 'BEHAVIORAL', description: 'Leadership principles and delivery', status: 'not_yet' },
          { id: 't8', title: 'Production Reliability & System Design', category: 'SYSTEM DESIGN', description: 'Zero downtime and rate limiting', status: 'not_yet' },
        ],
      },
      authToken
    );

    if (startRes.status !== 201 && startRes.status !== 200) {
      throw new Error(`thita.ai interview creation failed: ${JSON.stringify(startRes.data)}`);
    }
    const session = startRes.data.data;
    const interviewId = session._id || session.id;

    if (session.interviewerName !== 'Emily Zhou') {
      throw new Error(`Expected interviewer Emily Zhou, got: ${session.interviewerName}`);
    }
    if (!session.resumeTopics || session.resumeTopics.length !== 8) {
      throw new Error(`Expected 8 resume topics, got: ${session.resumeTopics?.length}`);
    }

    // 2. Update candidate notes (Photo 4 Notepad)
    const notesRes = await makeRequest(
      app,
      'POST',
      `/api/mock-interviews/${interviewId}/notes`,
      { notes: '- Architectural trade-offs: Redis caching layer + PostgreSQL ACID transactions' },
      authToken
    );
    if (notesRes.status !== 200) {
      throw new Error(`Update candidate notes failed: ${JSON.stringify(notesRes.data)}`);
    }

    // 3. Update topic status (flip topic 1 to discussed)
    const topicRes = await makeRequest(
      app,
      'POST',
      `/api/mock-interviews/${interviewId}/topics/t1`,
      { status: 'discussed' },
      authToken
    );
    if (topicRes.status !== 200) {
      throw new Error(`Update topic status failed: ${JSON.stringify(topicRes.data)}`);
    }

    // 4. Complete interview session
    const completeRes = await makeRequest(
      app,
      'POST',
      `/api/mock-interviews/${interviewId}/complete`,
      {},
      authToken
    );
    if (completeRes.status !== 200) {
      throw new Error(`Complete interview failed: ${JSON.stringify(completeRes.data)}`);
    }
    if (completeRes.data.data.status !== 'completed') {
      throw new Error(`Expected completed status, got: ${completeRes.data.data.status}`);
    }
  });

  await runTest('Interview', 'Distinct interview types (Coding, Technical, HR, Python) generate unique non-coding vs coding questions & stay in-track on follow-ups', async () => {
    const [codingRes, techRes, hrRes, pyRes] = await Promise.all([
      makeRequest(
        app,
        'POST',
        '/api/mock-interviews/start',
        {
          interviewType: 'Coding',
          role: 'Software Development Engineer',
          difficulty: 'Intermediate',
          questionCount: 4,
        },
        authToken
      ),
      makeRequest(
        app,
        'POST',
        '/api/mock-interviews/start',
        {
          interviewType: 'Technical',
          role: 'Software Development Engineer',
          difficulty: 'Intermediate',
          questionCount: 4,
          resumeText: 'Mohammed Hassan Ahmed\nProjects:\n1. FinTech Ledger API built with PostgreSQL and Redis',
        },
        authToken
      ),
      makeRequest(
        app,
        'POST',
        '/api/mock-interviews/start',
        {
          interviewType: 'HR',
          role: 'Software Development Engineer',
          difficulty: 'Beginner',
          questionCount: 4,
        },
        authToken
      ),
      makeRequest(
        app,
        'POST',
        '/api/mock-interviews/start',
        {
          interviewType: 'Python',
          role: 'Python Engineer',
          difficulty: 'Intermediate',
          questionCount: 4,
        },
        authToken
      ),
    ]);

    const coding = codingRes.data.data;
    const tech = techRes.data.data;
    const hr = hrRes.data.data;
    const py = pyRes.data.data;

    if (!coding?.codingProblem?.title) {
      throw new Error('Coding interview must attach a codingProblem');
    }
    if (tech?.codingProblem || hr?.codingProblem || py?.codingProblem) {
      throw new Error('Non-Coding interviews must not pre-attach global codingProblem');
    }
    if (coding.questions[0]?.requiresCode) {
      throw new Error('Coding Question 1 intro should show Talking Points (requiresCode=false) before coding tasks');
    }
    if (!coding.questions[1]?.requiresCode) {
      throw new Error('Coding Question 2+ should enable the Coding IDE (requiresCode=true)');
    }
    if (hr.questions.some((q: any) => q.requiresCode)) {
      throw new Error('HR questions must never trigger the Coding IDE');
    }

    const codingSet = new Set(coding.questions.slice(1).map((q: any) => q.question));
    const techSet = new Set(tech.questions.slice(1).map((q: any) => q.question));
    const hrSet = new Set(hr.questions.slice(1).map((q: any) => q.question));
    const pySet = new Set(py.questions.slice(1).map((q: any) => q.question));

    for (const qText of codingSet) {
      if (techSet.has(qText) || hrSet.has(qText) || pySet.has(qText)) {
        throw new Error(`Duplicate question across different interview tracks: ${qText}`);
      }
    }

    // Verify HR submit-answer stays purely HR/Behavioral (never injects Node.js/microservices trivia)
    const hrId = hr._id || hr.id;
    const hrNext = await makeRequest(
      app,
      'POST',
      `/api/mock-interviews/${hrId}/submit-answer`,
      {
        questionId: hr.questions[0].id,
        questionIndex: 0,
        answer: 'I completed my CSE degree and built a campus placement portal while leading a team of three students.',
      },
      authToken
    );
    const nextHrQ = String(hrNext.data.data?.nextQuestion?.question || '').toLowerCase();
    if (!nextHrQ || nextHrQ.includes('event loop') || nextHrQ.includes('pessimistic locking') || hrNext.data.data?.nextQuestion?.requiresCode) {
      throw new Error(`HR next question leaked technical/coding trivia: ${nextHrQ}`);
    }
  });

  // 8. Placement Analytics & Gamification Suite
  console.log('\n📦 Suite 8: Analytics Intelligence, Radar & Gamification');
  await runTest('Analytics', 'Fetch analytics & dashboard heatmaps return synchronized per-date activity details', async () => {
    const res = await makeRequest(app, 'GET', '/api/analytics/dashboard', undefined, authToken);
    if (res.status !== 200 || !res.data.data?.placementReadinessScore) {
      throw new Error(`Analytics dashboard failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.data?.topicMastery || res.data.data.topicMastery.length < 5) {
      throw new Error('Analytics missing multi-dimensional topic mastery radar items');
    }
    if (!res.data.data?.heatmap || res.data.data.heatmap.length !== 30) {
      throw new Error('Analytics missing 30-day activity heatmap');
    }
    if (!res.data.data?.annualHeatmap || res.data.data.annualHeatmap.length !== 365) {
      throw new Error('Analytics missing 365-day annual heatmap');
    }
    if (!res.data.data?.dailyActivityMap || typeof res.data.data.dailyActivityMap !== 'object') {
      throw new Error('Analytics missing dailyActivityMap details');
    }
    if (!res.data.data?.badges || res.data.data.badges.length < 4) {
      throw new Error('Analytics missing achievement badges');
    }

    const dashRes = await makeRequest(app, 'GET', '/api/dashboard/overview', undefined, authToken);
    if (dashRes.status !== 200 || !dashRes.data.data) {
      throw new Error(`Dashboard overview failed: ${JSON.stringify(dashRes.data)}`);
    }
    if (!dashRes.data.data.heatmap || dashRes.data.data.heatmap.length !== 30) {
      throw new Error('Dashboard overview missing 30-day activity heatmap');
    }
    if (!dashRes.data.data.annualHeatmap || dashRes.data.data.annualHeatmap.length !== 365) {
      throw new Error('Dashboard overview missing 365-day annual heatmap');
    }
    if (!dashRes.data.data.dailyActivityMap || Object.keys(dashRes.data.data.dailyActivityMap).length === 0) {
      throw new Error('Dashboard overview missing populated dailyActivityMap breakdown');
    }
  });

  // 9. AI Resume & ATS Placement Scanner Suite
  console.log('\n📦 Suite 9: AI Resume & ATS Placement Scanner');
  let scanId = '';
  await runTest('Resume', 'AI Resume Scanner analyzes text, ATS score, skills gap & Google X-Y-Z rewrites', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/resume/scan',
      {
        resumeText:
          'MOHAMMED FAROOQ - B.Tech CSE. Skills: React, Node.js, TypeScript, SQL, Git. Projects: Built full stack e-commerce web app using React and Node.js. Optimized database queries and handled 5000 users.',
        targetRole: 'Software Engineer',
        targetCompany: 'Amazon',
      },
      authToken
    );

    if (res.status !== 200 || !res.data.data?.overallScore) {
      throw new Error(`Resume scan failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.data?.skillsAnalysis?.matchedSkills || res.data.data.skillsAnalysis.matchedSkills.length === 0) {
      throw new Error('Resume scan missing matchedSkills');
    }
    if (!res.data.data?.bulletImprovements || res.data.data.bulletImprovements.length === 0) {
      throw new Error('Resume scan missing Google X-Y-Z bullet rewrites');
    }
    if (!res.data.data?.companyAlignment?.company) {
      throw new Error('Resume scan missing companyAlignment');
    }
    scanId = res.data.data._id || res.data.data.id;
  });

  await runTest('Resume', 'Fetch candidate resume scan history and detail by ID', async () => {
    const historyRes = await makeRequest(app, 'GET', '/api/resume/history', undefined, authToken);
    if (historyRes.status !== 200 || !Array.isArray(historyRes.data.data) || historyRes.data.data.length === 0) {
      throw new Error(`Resume scan history failed: ${JSON.stringify(historyRes.data)}`);
    }

    if (scanId) {
      const detailRes = await makeRequest(app, 'GET', `/api/resume/${scanId}`, undefined, authToken);
      if (detailRes.status !== 200 || !detailRes.data.data?.overallScore) {
        throw new Error(`Resume scan detail failed: ${JSON.stringify(detailRes.data)}`);
      }
    }
  });

  await runTest('Resume', 'Resume scan rejects invalid short input under 30 characters', async () => {
    const res = await makeRequest(
      app,
      'POST',
      '/api/resume/scan',
      {
        resumeText: 'Too short',
      },
      authToken
    );
    if (res.status !== 400 || res.data.success) {
      throw new Error(`Expected status 400 for short text, got ${res.status}`);
    }
  });

  // =========================================================================
  // SUITE 10: AI MOCK EVALUATION PRECISION & SCORING RIGOR (10 Requirements)
  // =========================================================================
  console.log('\n📦 Suite 10: AI Mock Evaluation Precision, Archetypes & Scoring Rigor');

  await runTest('Evaluation', '1. Correct technical answer receives high score (80-95%) with transparent formula', async () => {
    const evalRes = AIService.fallbackAnswerEvaluation(
      'What are the ACID properties in database management systems, and how do write-ahead logs (WAL) guarantee Atomicity and Durability?',
      'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity guarantees all-or-nothing execution via rollback and write-ahead logs. Consistency maintains schema integrity and foreign keys. Isolation prevents dirty reads and concurrency anomalies using MVCC or two-phase locking. Durability ensures committed transactions survive power failures and crashes by writing changes to non-volatile WAL logs on disk before committing.',
      'Technical',
      'SDE-1'
    );

    if (evalRes.overallScore < 80 || evalRes.overallScore > 95) {
      throw new Error(`Expected score between 80-95%, got ${evalRes.overallScore}`);
    }
    if (evalRes.scores.correctness < 85) {
      throw new Error(`Expected correctness >= 85, got ${evalRes.scores.correctness}`);
    }
    if (!evalRes.rubricBreakdown || !evalRes.rubricBreakdown.scoringFormula) {
      throw new Error('Missing transparent rubric breakdown or scoring formula');
    }
    const expectedCalc = Math.round(
      evalRes.scores.correctness * 0.30 +
      evalRes.scores.technicalDepth * 0.25 +
      evalRes.scores.communication * 0.20 +
      evalRes.rubricBreakdown.relevance * 0.15 +
      evalRes.scores.completeness * 0.10
    );
    if (evalRes.overallScore !== expectedCalc) {
      throw new Error(`Formula mismatch: overallScore ${evalRes.overallScore} !== calculated ${expectedCalc}`);
    }
  });

  await runTest('Evaluation', '2. Partially correct answer receives balanced score (45-68%) with missing concepts flagged', async () => {
    const evalRes = AIService.fallbackAnswerEvaluation(
      'What are the ACID properties in database management systems, and how do write-ahead logs (WAL) guarantee Atomicity and Durability?',
      'ACID properties are Atomicity and Durability where Atomicity rolls back changes if failure occurs and Durability writes logs so data is safe on disk.',
      'Technical',
      'SDE-1'
    );

    if (evalRes.overallScore < 45 || evalRes.overallScore > 68) {
      throw new Error(`Expected partially correct score between 45-68%, got ${evalRes.overallScore}`);
    }
    if (!evalRes.whatWasMissed || evalRes.whatWasMissed.length === 0) {
      throw new Error('Expected omissions to be detailed in whatWasMissed');
    }
    if (!evalRes.missingConcepts || evalRes.missingConcepts.length === 0) {
      throw new Error('Expected missing concepts to be populated');
    }
  });

  await runTest('Evaluation', '3. Incorrect technical answer receives low score (15-35%) and flags misconceptions', async () => {
    const evalRes = AIService.fallbackAnswerEvaluation(
      'Explain the difference between REST API and GraphQL specifications.',
      'REST only uses POST requests and cannot be cached anywhere. GraphQL only uses GET requests and stores all data inside magnetic tape backups.',
      'Technical',
      'SDE-1'
    );

    if (evalRes.overallScore < 15 || evalRes.overallScore > 35) {
      throw new Error(`Expected incorrect technical score between 15-35%, got ${evalRes.overallScore}`);
    }
    if (evalRes.scores.correctness > 40) {
      throw new Error(`Expected correctness to be penalized, got ${evalRes.scores.correctness}`);
    }
  });

  await runTest('Evaluation', '4. Irrelevant / off-topic answer strictly penalized (10-22%) without unearned marks', async () => {
    // Exact user transcript where candidate introduced themselves when asked about database ACID & WAL
    const evalRes = AIService.fallbackAnswerEvaluation(
      'What are the ACID properties in database management systems, and how do write-ahead logs (WAL) guarantee Atomicity and Durability?',
      'my name is mothers and Ahmed friend Computer Science and Engineering I have developed salary and electricity uses tracker I started my software journey through diploma and current',
      'Technical',
      'SDE-1'
    );

    if (evalRes.overallScore < 10 || evalRes.overallScore > 22) {
      throw new Error(`Expected off-topic answer score between 10-22%, got ${evalRes.overallScore}`);
    }
    if (evalRes.rubricBreakdown && evalRes.rubricBreakdown.relevance > 15) {
      throw new Error(`Expected relevance <= 15 for off-topic response, got ${evalRes.rubricBreakdown.relevance}`);
    }
    const offTopicNoted = evalRes.whatWasMissed.some((m) => m.toLowerCase().includes('off-topic') || m.toLowerCase().includes('personal background'));
    if (!offTopicNoted) {
      throw new Error('whatWasMissed must explicitly state that the response is off-topic');
    }
  });

  await runTest('Evaluation', '5. Unclear / fragmented transcript evaluated strictly (10-22%) without assumed knowledge', async () => {
    // Exact user transcript where speech-to-text had fragmented words
    const evalRes = AIService.fallbackAnswerEvaluation(
      'Let’s look at runtime internals. In your core stack (such as Node.js or Java), how does the runtime handle asynchronous non-blocking I/O, and what happens when the event loop or thread pool is exhausted by a CPU-heavy task?',
      'runtime internals are not there\'s has connected to server with JavaScript runs the code in bite so that it can handles as synchronise non blocking in food',
      'Technical',
      'SDE-1'
    );

    if (evalRes.overallScore < 10 || evalRes.overallScore > 22) {
      throw new Error(`Expected fragmented transcript score between 10-22%, got ${evalRes.overallScore}`);
    }
    const fragmentedNoted = evalRes.whatWasMissed.some((m) => m.toLowerCase().includes('fragmented') || m.toLowerCase().includes('unclear'));
    if (!fragmentedNoted) {
      throw new Error('whatWasMissed must note that the transcript is fragmented or unclear');
    }
  });

  await runTest('Evaluation', '6. Behavioral question evaluated strictly via STAR framework (Situation, Task, Action, Result)', async () => {
    const starAnswer =
      'Situation: In my Salary Calculator web application, overtime computations caused calculation discrepancies for users across specific months. ' +
      'Task: My responsibility was to isolate the bug and ensure accurate computations without breaking live users. ' +
      'Action: I reproduced the failure using automated unit tests, discovered a floating-point rounding issue coupled with month index handling in JavaScript, and refactored the math using integer cents with validation guards. ' +
      'Result: The bug was completely eradicated with 100% test coverage across all calendar fixtures, ensuring verified calculation accuracy.';

    const evalRes = AIService.fallbackAnswerEvaluation(
      'Tell me about a time you encountered a severe production bug or technical disagreement in a project and how you resolved it.',
      starAnswer,
      'Behavioral',
      'SDE-1'
    );

    if (evalRes.overallScore < 80 || evalRes.overallScore > 95) {
      throw new Error(`Expected complete STAR score between 80-95%, got ${evalRes.overallScore}`);
    }
    const articulatedSTAR = evalRes.whatWentWell.some((w) => w.toLowerCase().includes('star'));
    if (!articulatedSTAR) {
      throw new Error('whatWentWell must explicitly recognize the STAR components');
    }
  });

  await runTest('Evaluation', '7. Role-based benchmark answers generated for SDE-1 vs Senior levels', async () => {
    const sde1Eval = AIService.fallbackAnswerEvaluation(
      'What are the ACID properties in database management systems, and how do write-ahead logs (WAL) guarantee Atomicity and Durability?',
      '',
      'Technical',
      'SDE-1'
    );
    const seniorEval = AIService.fallbackAnswerEvaluation(
      'What are the ACID properties in database management systems, and how do write-ahead logs (WAL) guarantee Atomicity and Durability?',
      '',
      'Technical',
      'Senior Software Engineer'
    );

    if (sde1Eval.roleLevel !== 'SDE-1') {
      throw new Error(`Expected roleLevel SDE-1, got ${sde1Eval.roleLevel}`);
    }
    if (seniorEval.roleLevel !== 'Senior Engineer') {
      throw new Error(`Expected roleLevel Senior Engineer, got ${seniorEval.roleLevel}`);
    }
    if (!seniorEval.modelAnswer.includes('ARIES') && !seniorEval.modelAnswer.includes('consensus') && !seniorEval.modelAnswer.includes('Snapshot')) {
      throw new Error('Senior model answer must include senior-level architecture concepts (ARIES/MVCC/consensus)');
    }
  });

  await runTest('Evaluation', '8. Mock interview report uses updated terminology (Preparation Recommendation & Assessment Report)', async () => {
    const historyRes = await makeRequest(app, 'GET', '/api/mock-interviews', undefined, authToken);
    if (historyRes.status !== 200 || !Array.isArray(historyRes.data.data) || historyRes.data.data.length === 0) {
      throw new Error('No interview sessions found to verify report terminology');
    }

    const testSessionId = historyRes.data.data[0]._id || historyRes.data.data[0].id;
    const completeRes = await makeRequest(app, 'POST', `/api/mock-interviews/${testSessionId}/complete`, {}, authToken);
    if (completeRes.status !== 200 || !completeRes.data.data?.report) {
      throw new Error('Complete interview report failed');
    }

    const report = completeRes.data.data.report;
    const prepLevel = report.recommendations?.preparationLevel || '';
    if (!prepLevel.includes('Ready') && !prepLevel.includes('Recommended') && !prepLevel.includes('Revision') && !prepLevel.includes('Incomplete')) {
      throw new Error(`Unexpected preparation level terminology: ${prepLevel}`);
    }
  });

  // =========================================================================
  // SUITE 11: P0/P1 HARDENING, MULTI-USER ISOLATION, C++ SANDBOX & XP
  // =========================================================================
  console.log('\n📦 Suite 11: P0/P1 Hardening, Multi-User Isolation, C++ Execution & XP Persistence');

  await runTest('P0-Report', 'Report persists answerRelevance, completeness & averageScores accurately', async () => {
    const startRes = await makeRequest(
      app,
      'POST',
      '/api/mock-interviews/start',
      {
        interviewType: 'Technical',
        role: 'Backend Developer',
        experienceLevel: 'Beginner',
        difficulty: 'Medium',
        numberOfQuestions: 3,
      },
      authToken
    );
    const session = startRes.data?.data;
    if (startRes.status !== 201 || !session?._id) {
      throw new Error('Failed to create interview session for report check');
    }

    const q = session.questions[0];
    await makeRequest(
      app,
      'POST',
      `/api/mock-interviews/${session._id}/submit-answer`,
      {
        questionId: q._id || 'q-0',
        questionIndex: 0,
        answer: 'Indexing creates B-Tree lookup structures to avoid full table scans and reduce query latency, trading off extra write amplification and storage overhead.',
      },
      authToken
    );

    const completeRes = await makeRequest(app, 'POST', `/api/mock-interviews/${session._id}/complete`, {}, authToken);
    if (completeRes.status !== 200) {
      throw new Error(`Complete interview failed with ${completeRes.status}`);
    }

    const detailRes = await makeRequest(app, 'GET', `/api/mock-interviews/${session._id}`, undefined, authToken);
    const saved = detailRes.data?.data;
    const cats = saved?.report?.categoryScores;
    if (
      typeof cats?.answerRelevance !== 'number' ||
      typeof cats?.completeness !== 'number' ||
      typeof saved?.report?.averageAnsweredScore !== 'number' ||
      typeof saved?.averageScores?.completeness !== 'number'
    ) {
      throw new Error(`Missing rubric/completeness fields on saved report: ${JSON.stringify(cats)}`);
    }
  });

  await runTest('P0-Auth', 'Unknown email + demo password rejected & cross-user mock interview/mentor access returns 403', async () => {
    const hijackRes = await makeRequest(app, 'POST', '/api/auth/login', {
      email: `nonexistent.${Date.now()}@example.com`,
      password: 'Placement2026!',
    });
    if (hijackRes.status === 200) {
      throw new Error('Unknown email logged in via demo bypass!');
    }

    const peerEmail = `peer.isolation.${Date.now()}@example.com`;
    const regRes = await makeRequest(app, 'POST', '/api/auth/register', {
      name: 'Isolation Peer',
      email: peerEmail,
      password: 'PeerPassword2026!',
    });
    const peerToken = regRes.data?.token;
    if (!peerToken) {
      throw new Error(`Peer registration failed (${regRes.status})`);
    }

    const histRes = await makeRequest(app, 'GET', '/api/mock-interviews', undefined, authToken);
    const ownerInterviewId = histRes.data?.data?.[0]?._id;
    if (!ownerInterviewId) {
      throw new Error('Missing owner interview to test cross-user isolation');
    }

    const foreignInterviewGet = await makeRequest(app, 'GET', `/api/mock-interviews/${ownerInterviewId}`, undefined, peerToken);
    if (foreignInterviewGet.status !== 403) {
      throw new Error(`Expected 403 reading another user mock interview, got ${foreignInterviewGet.status}`);
    }

    const convCreate = await makeRequest(
      app,
      'POST',
      '/api/ai/conversations',
      { title: 'Owner Private Chat' },
      authToken
    );
    const ownerConvId = convCreate.data?.data?._id || convCreate.data?.conversation?._id || convCreate.data?.data?.id;
    if (ownerConvId) {
      const foreignConvGet = await makeRequest(app, 'GET', `/api/ai/conversations/${ownerConvId}`, undefined, peerToken);
      if (foreignConvGet.status !== 403) {
        throw new Error(`Expected 403 accessing another user conversation, got ${foreignConvGet.status}`);
      }
    }

    const peerConvsRes = await makeRequest(app, 'GET', '/api/ai/conversations', undefined, peerToken);
    const peerConvs = peerConvsRes.data?.data || peerConvsRes.data?.conversations || [];
    if (Array.isArray(peerConvs) && peerConvs.some((c: any) => c.userId === 'guest')) {
      throw new Error('Authenticated peer user received guest conversations in list!');
    }

    const ownerScans = await makeRequest(app, 'GET', '/api/resume/history', undefined, authToken);
    const ownerScanId = ownerScans.data?.data?.[0]?._id;
    if (ownerScanId) {
      const foreignScanGet = await makeRequest(app, 'GET', `/api/resume/${ownerScanId}`, undefined, peerToken);
      if (foreignScanGet.status !== 403) {
        throw new Error(`Expected 403 accessing another user resume scan, got ${foreignScanGet.status}`);
      }
    }
  });

  await runTest('P1-Judge', 'Python executes natively, C++ either executes via g++ or reports unavailability honestly without faking pass', async () => {
    const validPy = await makeRequest(app, 'POST', '/api/problems/sandbox-run', {
      language: 'python',
      code: 'print(6 * 7)',
    });
    if (validPy.status !== 200 || validPy.data?.data?.status !== 'Success' || !String(validPy.data?.data?.stdout).includes('42')) {
      throw new Error(`Native Python playground failed: ${JSON.stringify(validPy.data)}`);
    }

    const validCpp = await makeRequest(app, 'POST', '/api/problems/sandbox-run', {
      language: 'cpp',
      code: '#include <iostream>\nint main() { std::cout << (6 * 7); return 0; }\n',
    });
    const cppRes = validCpp.data?.data;
    if (cppRes?.status === 'Success') {
      if (!String(cppRes.stdout).includes('42')) {
        throw new Error(`Native C++ succeeded without real output 42: ${JSON.stringify(validCpp.data)}`);
      }
    } else if (cppRes?.status === 'Runtime Error') {
      const errMsg = String(cppRes.stderr || '').toLowerCase();
      if (errMsg.includes('spawn unknown') || errMsg === 'fetch failed' || !errMsg.includes('not available')) {
        throw new Error(`Unexpected C++ unavailability error: ${JSON.stringify(validCpp.data)}`);
      }
    } else {
      throw new Error(`Unexpected C++ playground response: ${JSON.stringify(validCpp.data)}`);
    }

    const brokenCpp = await makeRequest(app, 'POST', '/api/problems/sandbox-run', {
      language: 'cpp',
      code: '#include <iostream>\nint main() { int x = ; return 0; }\n',
    });
    if (brokenCpp.data?.data?.status !== 'Runtime Error') {
      throw new Error(`Broken C++ must report Runtime Error, got ${JSON.stringify(brokenCpp.data)}`);
    }

    const javaFakeCheck = await makeRequest(app, 'POST', '/api/problems/two-sum/run', {
      language: 'java',
      code: 'class Solution { public int[] twoSum(int[] nums, int target) { for(int i=0;i<1;i++){} return new int[]{}; } }',
    });
    if (javaFakeCheck.data?.data?.status === 'Accepted' || (javaFakeCheck.data?.data?.testCasesPassed ?? 0) > 0) {
      throw new Error(`Java class-only run without javac/working remote Judge0 must not fake Accepted: ${JSON.stringify(javaFakeCheck.data)}`);
    }
  });

  await runTest('P1-XP', 'Question toggleComplete persists XP delta to user profile and restores cleanly on untoggle', async () => {
    const beforeProf = await makeRequest(app, 'GET', '/api/users/profile', undefined, authToken);
    const beforeXp = beforeProf.data?.data?.xpPoints ?? 0;

    const qRes = await makeRequest(app, 'GET', '/api/questions?page=1&limit=1', undefined, authToken);
    const qId = qRes.data?.data?.[0]?._id;
    if (!qId) {
      throw new Error('No question found to toggle completion');
    }

    const toggle1 = await makeRequest(app, 'POST', `/api/questions/${qId}/complete`, {}, authToken);
    if (toggle1.status !== 200) {
      throw new Error(`toggleComplete failed with ${toggle1.status}`);
    }
    const midProf = await makeRequest(app, 'GET', '/api/users/profile', undefined, authToken);
    const midXp = midProf.data?.data?.xpPoints ?? 0;
    const expectedDelta = toggle1.data?.isCompleted ? 15 : -15;
    if (midXp !== Math.max(0, beforeXp + expectedDelta)) {
      throw new Error(`Expected XP ${Math.max(0, beforeXp + expectedDelta)} after toggle, got ${midXp} (before ${beforeXp})`);
    }

    // Restore original state cleanly
    await makeRequest(app, 'POST', `/api/questions/${qId}/complete`, {}, authToken);
  });

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  console.log('\n===============================================================');
  console.log(`📊 Verification Summary: ${passedCount} / ${totalCount} Passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log(`⏱️ Total Test Execution Time: ${results.reduce((acc, r) => acc + r.durationMs, 0)}ms`);
  console.log(`🏆 Status: ${allPassed ? 'ALL SYSTEMS OPERATIONAL & VERIFIED' : 'FAILURES DETECTED'}`);
  console.log('===============================================================\n');

  return allPassed;
};

// Execute if run directly
runFullSystemVerification().then((success) => {
  process.exit(success ? 0 : 1);
});
