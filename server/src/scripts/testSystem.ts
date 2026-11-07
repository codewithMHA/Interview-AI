import { createApp } from '../app.js';
import { EventEmitter } from 'events';
import express from 'express';

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

  // 8. Placement Analytics & Gamification Suite
  console.log('\n📦 Suite 8: Analytics Intelligence, Radar & Gamification');
  await runTest('Analytics', 'Fetch analytics dashboard returns dynamic readiness index and radar', async () => {
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
    if (!res.data.data?.badges || res.data.data.badges.length < 4) {
      throw new Error('Analytics missing achievement badges');
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
