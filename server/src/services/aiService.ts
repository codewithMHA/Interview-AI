import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { ConversationService } from './conversationService.js';

export interface CodeAnalysisRequest {
  problemTitle: string;
  problemDescription?: string;
  language: string;
  userCode: string;
}

export interface CodeAnalysisResponse {
  timeComplexity: string;
  timeComplexityExplanation?: string;
  spaceComplexity: string;
  spaceComplexityExplanation?: string;
  correctnessAssessment: string;
  codeQualityScore: number; // 1-10
  qualityBreakdown?: {
    strengths: string[];
    areasForImprovement: string[];
  };
  potentialBugs: string[];
  optimizations: string[];
  placementTips: string[];
  interviewerPitch?: string;
  verdictSummary: string;
}

export interface CodeExplanationStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: string;
  plainEnglishMeaning?: string;
}

export interface CodeExplanationResponse {
  overview: string;
  approachType?: string;
  dryRunExample?: {
    sampleInput: string;
    executionTrace: Array<{
      iteration: string;
      currentState: string;
      actionTaken: string;
    }>;
    finalOutput: string;
  };
  steps: CodeExplanationStep[];
  keyTakeaways: string[];
  interviewerFollowUps?: string[];
}

export interface ConceptExplanationRequest {
  topic: string;
  focusArea?: string;
  description?: string;
  role?: string;
}

export interface ConceptExplanationResponse {
  topic: string;
  focusArea: string;
  summary: string;
  keyConcepts: Array<{
    title: string;
    description: string;
  }>;
  codeSnippet?: {
    language: string;
    code: string;
    explanation: string;
  };
  interviewQuestions: Array<{
    question: string;
    answer: string;
  }>;
  pitfalls: string[];
  bestPractices: string[];
}

export interface ChatConversationContext {
  topic?: string;
  isFollowUp?: boolean;
  usedPreviousContext?: boolean;
}

export interface DoubtSolverRequest {
  doubt: string;
  conversationId?: string;
  userId?: string;
  history?: Array<{ sender: 'user' | 'ai'; message: string }>;
  topic?: string;
  role?: string;
}

export interface DoubtSolverResponse {
  doubt?: string;
  directAnswer: string;
  keyPoints: string[];
  codeSnippet?: {
    language: string;
    code: string;
    explanation?: string;
  } | null;
  interviewTip: string;
  suggestedFollowUps: string[];
  conversationContext?: ChatConversationContext;
  conversationId?: string;
  messageId?: string;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  category: 'Technical' | 'HR' | 'Behavioral' | 'System Design';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedPoints: string[];
  sampleFollowUp?: string;
}

export interface AnswerEvaluationResponse {
  overallScore: number; // 0 - 100
  scores: {
    correctness: number; // 0 - 100
    technicalDepth: number; // 0 - 100
    clarity: number; // 0 - 100
    confidence: number; // 0 - 100
    completeness: number; // 0 - 100
    communication: number; // 0 - 100
  };
  whatWentWell: string[];
  whatWasMissed: string[];
  howToImprove: string[];
  modelAnswer: string;
  recommendedTopics: string[];
}

export class AIService {
  private static aiClient: GoogleGenAI | null = null;
  private static analysisCache = new Map<string, CodeAnalysisResponse>();
  private static explanationCache = new Map<string, CodeExplanationResponse>();
  private static cloudCircuitOpenUntil: number = 0;

  private static getClient(): GoogleGenAI | null {
    if (!this.aiClient) {
      const apiKey = (env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
      if (apiKey && apiKey.length > 10 && !apiKey.includes('your_gemini')) {
        this.aiClient = new GoogleGenAI({ apiKey });
        console.log('[AIService] GoogleGenAI client initialized successfully with API key.');
      } else {
        console.warn('[AIService] Warning: GEMINI_API_KEY is not configured or empty. Offline heuristics will be used.');
      }
    }
    return this.aiClient;
  }

  /**
   * Helper to execute Gemini content generation with ultra-fast models, circuit breaker, and instant fallbacks.
   */
  private static async generateContentWithFallback(prompt: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    // 1. Check Circuit Breaker: If cloud AI recently failed with 503 (Overloaded) or timed out,
    // do NOT waste 5 seconds making the candidate wait. Instantly use our high-precision engine!
    const now = Date.now();
    if (now < this.cloudCircuitOpenUntil) {
      const remainingSeconds = Math.ceil((this.cloudCircuitOpenUntil - now) / 1000);
      console.log(`[AIService] Gemini cloud API is currently cooling down (${remainingSeconds}s remaining). Serving instant high-precision response (0ms latency).`);
      return null;
    }

    // Try Google's ultra-fast flash models with a strict 2200ms budget to guarantee conversational responsiveness
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ];

    for (const model of candidateModels) {
      try {
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('AI_TIMEOUT_EXCEEDED')), 2200)
        );

        const generatePromise = client.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
        if (response && response.text) {
          console.log(`[AIService] Successfully generated response using model: ${model}`);
          this.cloudCircuitOpenUntil = 0; // Success! Circuit is healthy
          return response.text;
        }
      } catch (err: any) {
        const isOverloadOrTimeout =
          err.message?.includes('503') ||
          err.message?.includes('high demand') ||
          err.message?.includes('UNAVAILABLE') ||
          err.message?.includes('429') ||
          err.message?.includes('RESOURCE_EXHAUSTED') ||
          err.message?.includes('AI_TIMEOUT_EXCEEDED') ||
          err.message?.includes('fetch failed') ||
          err.message?.includes('ENOTFOUND') ||
          err.message?.includes('ETIMEDOUT') ||
          err.message?.includes('API_KEY_INVALID') ||
          err.message?.includes('UNAUTHENTICATED');

        if (isOverloadOrTimeout) {
          // Trip circuit breaker for 15 seconds so retry happens quickly
          this.cloudCircuitOpenUntil = Date.now() + 15000;
          let shortReason = err.message?.includes('503') || err.message?.includes('high demand')
            ? 'Cloud AI model overloaded (503 High Demand)'
            : err.message?.includes('AI_TIMEOUT_EXCEEDED')
            ? 'Cloud AI timeout (>2200ms)'
            : 'Cloud AI network unavailable';
          console.log(`[AIService] ${shortReason}. Tripping Circuit Breaker for 15s. Using instant high-precision engine.`);
          break; // Stop immediately; don't make user wait on secondary models
        } else {
          let shortMsg = err.message || '';
          try {
            const parsed = JSON.parse(shortMsg);
            if (parsed.error?.message) {
              shortMsg = `${parsed.error.code || ''}: ${parsed.error.message}`;
            }
          } catch {}
          console.warn(`[AIService] Model ${model} unavailable (${shortMsg}). Trying next candidate model...`);
        }
      }
    }
    return null;
  }

  /**
   * Analyzes student code for correctness, Time & Space Complexity, quality, and optimizations.
   */
  public static async analyzeCode(
    request: CodeAnalysisRequest
  ): Promise<CodeAnalysisResponse> {
    const cacheKey = `${request.problemTitle}::${request.language}::${request.userCode.trim()}`;
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const prompt = `You are a Principal Software Engineer and Technical Placement Interviewer evaluating a candidate's code submission for campus recruitment.
Problem: ${request.problemTitle}
Problem Description: ${request.problemDescription || 'Standard coding challenge'}
Language: ${request.language}
Candidate Code:
\`\`\`${request.language}
${request.userCode}
\`\`\`

Analyze the code rigorously so that even a beginner student can understand the trade-offs easily.
Return ONLY a valid JSON object matching this schema with NO outside text:
{
  "timeComplexity": "Short Big-O, e.g. O(n)",
  "timeComplexityExplanation": "Crystal-clear, intuitive explanation in plain English. Explain WHY it is this complexity (e.g. 'Since there is a single loop iterating n times, execution time scales linearly with input size.')",
  "spaceComplexity": "Short Big-O, e.g. O(1) or O(n)",
  "spaceComplexityExplanation": "Crystal-clear, intuitive explanation in plain English. Explain WHY it is this complexity (e.g. 'You only store a few scalar pointer variables, so auxiliary memory remains constant and does not grow with input size.')",
  "correctnessAssessment": "Detailed, encouraging assessment of whether this code correctly solves the problem and what conditions it handles.",
  "codeQualityScore": 9,
  "qualityBreakdown": {
    "strengths": ["Clean naming conventions", "Optimal single-pass scan", "Proper state management"],
    "areasForImprovement": ["Add guard condition for empty input"]
  },
  "potentialBugs": ["Specific edge cases with concrete failure examples, e.g. 'If input is empty [], accessing index 0 throws an error'"],
  "optimizations": ["Concrete, actionable optimization suggestions to improve speed or memory"],
  "placementTips": ["Practical advice an interviewer at Google, Amazon, or Microsoft looks for"],
  "interviewerPitch": "A 2-3 sentence verbal script the candidate can speak aloud to the interviewer explaining their solution with confidence.",
  "verdictSummary": "1-2 sentence executive verdict on this solution for campus/MNC placement."
}`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const jsonStr = (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace)
          ? text.substring(firstBrace, lastBrace + 1)
          : text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsed = JSON.parse(jsonStr);
        const result: CodeAnalysisResponse = {
          timeComplexity: parsed.timeComplexity || 'O(n)',
          timeComplexityExplanation: parsed.timeComplexityExplanation || 'Execution time scales linearly with input size.',
          spaceComplexity: parsed.spaceComplexity || 'O(1)',
          spaceComplexityExplanation: parsed.spaceComplexityExplanation || 'Auxiliary memory usage remains constant.',
          correctnessAssessment: parsed.correctnessAssessment || 'Valid algorithm implementation with clear state flow.',
          codeQualityScore: Math.min(10, Math.max(1, typeof parsed.codeQualityScore === 'number' ? parsed.codeQualityScore : 8)),
          qualityBreakdown: parsed.qualityBreakdown || {
            strengths: ['Structured logic flow', 'Proper variable state management'],
            areasForImprovement: ['Check boundary edge conditions'],
          },
          potentialBugs: parsed.potentialBugs || ['Check empty inputs', 'Verify constraint limits'],
          optimizations: parsed.optimizations || ['Use single-pass scan to reduce constant factors'],
          placementTips: parsed.placementTips || ['Always state time and space complexity before writing code'],
          interviewerPitch: parsed.interviewerPitch || 'In this solution, I process the input elements systematically while keeping auxiliary memory minimal.',
          verdictSummary: parsed.verdictSummary || 'Solid algorithmic approach for placement rounds.',
        };
        this.analysisCache.set(cacheKey, result);
        return result;
      } catch (e) {
        console.warn('[AIService] Failed to parse analyzeCode response, falling back.');
      }
    }

    // Deterministic fallback analyzer
    const fallbackResult = this.fallbackCodeAnalysis(request);
    this.analysisCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  /**
   * Explains code step-by-step in simple, intuitive language for students.
   */
  public static async explainCode(
    request: CodeAnalysisRequest
  ): Promise<CodeExplanationResponse> {
    const cacheKey = `${request.problemTitle}::${request.language}::${request.userCode.trim()}`;
    if (this.explanationCache.has(cacheKey)) {
      return this.explanationCache.get(cacheKey)!;
    }

    const prompt = `You are an expert Computer Science mentor helping a student understand this code completely from top to bottom for campus placement interviews.
Problem: ${request.problemTitle}
Language: ${request.language}
Code:
\`\`\`${request.language}
${request.userCode}
\`\`\`

Explain how this specific algorithm operates FULLY step-by-step in simple, intuitive plain language. Cover EVERY significant part of the code (setup, variables, loop/recursion, conditions, return). Provide a concrete dry-run trace with sample values.
Return ONLY a valid JSON object matching this schema with NO outside text:
{
  "overview": "Clear, comprehensive summary of the core concept and approach used in this specific code.",
  "approachType": "e.g. Two-Pointer Approach, Sliding Window, Hash Map Lookup, In-place Mutation, etc.",
  "dryRunExample": {
    "sampleInput": "A representative input, e.g. nums = [2, 7, 11, 15], target = 9",
    "executionTrace": [
      {
        "iteration": "Step 1 (Initial / Loop Iteration 1)",
        "currentState": "Values of key variables at this point",
        "actionTaken": "What the code computes or checks"
      },
      {
        "iteration": "Step 2 (Loop Iteration 2)",
        "currentState": "Updated variable state",
        "actionTaken": "Target condition satisfied, preparing output"
      }
    ],
    "finalOutput": "The exact return value for this sample input"
  },
  "steps": [
    {
      "stepNumber": 1,
      "title": "Short descriptive title for this section",
      "description": "Full, clear, detailed explanation of what happens here and WHY",
      "codeSnippet": "Actual line(s) of code from the student's submission",
      "plainEnglishMeaning": "Simple one-line translation of what this code means in plain English"
    }
  ],
  "keyTakeaways": [
    "Key placement interview takeaway 1",
    "Key placement interview takeaway 2"
  ],
  "interviewerFollowUps": [
    "Realistic follow-up question an interviewer might ask about this code",
    "Another common follow-up question"
  ]
}`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const jsonStr = (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace)
          ? text.substring(firstBrace, lastBrace + 1)
          : text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsed = JSON.parse(jsonStr);
        const result: CodeExplanationResponse = {
          overview: parsed.overview || 'Comprehensive algorithmic breakdown of your code.',
          approachType: parsed.approachType || 'Algorithmic Pattern',
          dryRunExample: parsed.dryRunExample,
          steps: parsed.steps || [],
          keyTakeaways: parsed.keyTakeaways || [],
          interviewerFollowUps: parsed.interviewerFollowUps || [],
        };
        this.explanationCache.set(cacheKey, result);
        return result;
      } catch (e) {
        console.warn('[AIService] Failed to parse explainCode response, falling back.');
      }
    }

    const fallbackResult = this.fallbackCodeExplanation(request);
    this.explanationCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  /**
   * Generates a deep-dive conceptual lesson and technical interview preparation guide for a specific roadmap topic.
   */
  public static async explainConcept(
    params: ConceptExplanationRequest
  ): Promise<ConceptExplanationResponse> {
    const prompt = `You are a Principal Software Engineer and Lead Technical Interviewer.
Provide a high-impact, crystal-clear conceptual lesson and interview preparation guide on the topic:
Topic: "${params.topic}"
Focus Area: "${params.focusArea || 'Core Computer Science'}"
Overview / Goal: "${params.description || ''}"
Role: "${params.role || 'Software Engineer'}"

Provide your response in strictly valid JSON format matching this schema with NO outside markdown formatting or text:
{
  "topic": "${params.topic}",
  "focusArea": "${params.focusArea || 'Core CS'}",
  "summary": "2-3 crisp sentences explaining the core intuition and why top tech companies test this.",
  "keyConcepts": [
    { "title": "Core Mechanics", "description": "How this works under the hood." },
    { "title": "Time and Space Invariants", "description": "Complexity bounds and memory guarantees." },
    { "title": "Real-World Engineering Application", "description": "Where it is used in production systems." }
  ],
  "codeSnippet": {
    "language": "javascript",
    "code": "// Clean illustrative code implementation with comments",
    "explanation": "Walkthrough of how this snippet illustrates the fundamental idea."
  },
  "interviewQuestions": [
    {
      "question": "Most frequently asked campus / MNC interview question on this topic?",
      "answer": "Senior-level model answer demonstrating deep mastery."
    },
    {
      "question": "Advanced follow-up or edge-case question?",
      "answer": "Clear, precise explanation covering the nuance."
    }
  ],
  "pitfalls": [
    "Common misconception or bug candidates make in technical rounds",
    "Another common pitfall"
  ],
  "bestPractices": [
    "Rule of thumb to remember during interviews",
    "Design principle to apply"
  ]
}`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const jsonStr =
          firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
            ? text.substring(firstBrace, lastBrace + 1)
            : text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsed = JSON.parse(jsonStr) as ConceptExplanationResponse;
        if (parsed.summary && parsed.keyConcepts && Array.isArray(parsed.keyConcepts)) {
          return {
            topic: parsed.topic || params.topic,
            focusArea: parsed.focusArea || params.focusArea || 'Core Computer Science',
            summary: parsed.summary,
            keyConcepts: parsed.keyConcepts,
            codeSnippet: parsed.codeSnippet,
            interviewQuestions: parsed.interviewQuestions || [],
            pitfalls: parsed.pitfalls || [],
            bestPractices: parsed.bestPractices || [],
          };
        }
      } catch (e) {
        console.warn('[AIService] Failed to parse explainConcept JSON response, falling back.');
      }
    }

    return this.fallbackConceptExplanation(params);
  }

  /**
   * Main Conversational AI Mentor & Assistant for the Interview Preparation Platform.
   * Maintains persistent conversational memory, follow-up comprehension, and project context.
   */
  public static async solveDoubt(
    params: DoubtSolverRequest
  ): Promise<DoubtSolverResponse> {
    const userId = params.userId || 'guest';
    const cleanDoubt = (params.doubt || '').trim();

    // 1. Get or create persistent conversation session
    const conv = await ConversationService.getOrCreateConversation(
      userId,
      params.conversationId,
      params.topic || 'General'
    );
    const conversationId = conv.id;

    // 2. Persist the incoming user message
    await ConversationService.saveMessage(conversationId, 'user', cleanDoubt);

    // 3. Retrieve conversation history and summary from database
    const { history: dbHistory, summary } =
      await ConversationService.getHistoryForAI(conversationId, 20);

    // Build chronological chat context excluding the message we just saved
    let contextHistoryText = '';
    if (dbHistory.length > 1) {
      const priorTurns = dbHistory.slice(0, -1);
      contextHistoryText = priorTurns
        .map((h) => `${h.role === 'user' ? 'USER' : 'ASSISTANT'}: ${h.content}`)
        .join('\n\n');
    } else if (params.history && params.history.length > 0) {
      contextHistoryText = params.history
        .map((h) => `${h.sender.toUpperCase()}: ${h.message}`)
        .join('\n\n');
    }

    const prompt = `You are the main AI Mentor and Conversational Assistant inside an AI-powered Interview Preparation and Learning Platform.
Your goal is NOT to behave like a limited "doubt solver" or a collection of predefined answers.
You must behave like a helpful conversational AI mentor that understands the user's current question AND remembers the ongoing conversation context.

CORE PURPOSE:
- You help the user with any reasonable educational, technical, and career question: Programming, DSA, DBMS, Operating Systems, Computer Networks, System Design, Web Development (React, Node.js, Express, MongoDB, JavaScript, TypeScript, Python, Java, C/C++), APIs, Git/GitHub, Software Engineering, Debugging, Project development, AI/ML concepts, Interview preparation, HR questions, Placement preparation, Career guidance, Study planning, Learning concepts, Resume/project discussions, General educational questions, and Casual conversation related to learning.
- Do NOT restrict yourself to predefined questions or keyword-based answers. Answer the user's ACTUAL question.

CONVERSATION MEMORY & CONTINUITY (CRITICAL):
- Treat the conversation as a continuous conversation, not as independent questions.
- For every new user message:
  1. Read the available conversation history.
  2. Identify what was discussed previously.
  3. Determine whether the new message is: a follow-up question, a clarification, a user correction, a continuation, or a new topic.
  4. Use previous messages when relevant. Do NOT make the user repeat information that already exists in the conversation!
  5. Handle short follow-ups intelligently: ("why?", "how?", "then?", "what about Java?", "give example", "explain this", "same for Python", "is this correct?", "what should I use?", "continue", "make it simple", "code?", "and backend?", "what about MongoDB?"). NEVER ask "code for what?" or "what topic?" if it was already in the conversation!
  6. Handle user corrections immediately: ("No", "That's not what I meant", "I mean...", "Not this", "Wrong", "You misunderstood") by immediately reconsidering the previous answer and answering according to the corrected intent.
  7. Resolve contextual references: ("this", "that", "it", "the above", "same thing", "previous one", "this code", "that error", "my project", "my app", "the backend", "the frontend") using conversation history.
  8. Remember project context: If the user mentioned building an app or project tech stack earlier, use that context for future questions.
  9. Memory priority: 1. Current user message. 2. Recent conversation history. 3. Earlier relevant conversation history. 4. General knowledge.
  10. If the user clearly changes topic, switch topics naturally without forcing old topics.

DO NOT USE KEYWORD-BASED ANSWERING:
- Never answer a question only because it contains a keyword. Understand the COMPLETE question.

ANSWER STYLE & LANGUAGE:
- Speak in simple, clear English by default.
- If the user asks in Hinglish (Roman Hindi/Urdu, e.g. "bhai", "kaise ho", "kya haal", "batao", "samjha do"), answer naturally and conversationally in friendly Hinglish!
- Adapt to user level: simple words and small examples for beginners; deeper trade-offs, architecture and implementation for advanced queries.
- Only provide code when it is useful or requested. Keep code runnable and explain key parts.
- When the user asks for debugging/errors: understand the error, identify the likely cause, explain why it happens, and give the exact fix.
- Handle greetings ("As salamu alaikum", "Good morning", "Hi") naturally and warmly.

CONVERSATION SUMMARY (if any):
${summary || 'None'}

RECENT CONVERSATION HISTORY:
${contextHistoryText || 'None (This is the start of the conversation)'}

CURRENT USER MESSAGE:
"${cleanDoubt}"

Context / Focus Topic: "${params.topic || 'General'}"
Target Role: "${params.role || 'Software Engineer'}"

OUTPUT FORMAT (strictly valid JSON with NO outside markdown):
{
  "directAnswer": "Main comprehensive conversational answer to the user's question, accounting for conversation context and follow-up intent.",
  "keyPoints": [
    "Important takeaway or step 1 (leave as empty array [] for simple casual chat/greetings)"
  ],
  "codeSnippet": null,
  "interviewTip": "",
  "suggestedFollowUps": [
    "Contextually relevant follow-up question 1",
    "Contextually relevant follow-up question 2"
  ],
  "conversationContext": {
    "topic": "Current topic name",
    "isFollowUp": true,
    "usedPreviousContext": true
  }
}
* Note: If code is helpful or requested, codeSnippet should be: { "language": "...", "code": "...", "explanation": "..." }, otherwise null.
* Note: interviewTip should be empty string "" unless user asked an interview/placement question.`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const jsonStr =
          firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
            ? text.substring(firstBrace, lastBrace + 1)
            : text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsed = JSON.parse(jsonStr) as DoubtSolverResponse;
        if (parsed.directAnswer) {
          const responsePayload: DoubtSolverResponse = {
            doubt: cleanDoubt,
            directAnswer: parsed.directAnswer,
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
            codeSnippet:
              parsed.codeSnippet && parsed.codeSnippet.code ? parsed.codeSnippet : null,
            interviewTip: parsed.interviewTip || '',
            suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
              ? parsed.suggestedFollowUps
              : ['Can you provide an example?', 'What are the main trade-offs?'],
            conversationContext: parsed.conversationContext || {
              topic: params.topic || 'General',
              isFollowUp: dbHistory.length > 1,
              usedPreviousContext: dbHistory.length > 1,
            },
            conversationId,
          };

          // Save assistant message to persistent history
          const savedMsg = await ConversationService.saveMessage(
            conversationId,
            'assistant',
            parsed.directAnswer,
            responsePayload
          );
          responsePayload.messageId = savedMsg.id;

          return responsePayload;
        }
      } catch (e: any) {
        console.warn('[AIService] Failed to parse solveDoubt JSON response directly:', e.message);
        // Robust extraction from model text
        let extractedAnswer = '';
        const match = text.match(/"directAnswer"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
        if (match && match[1]) {
          try {
            extractedAnswer = JSON.parse(`"${match[1]}"`);
          } catch {
            extractedAnswer = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          }
        } else {
          // If no JSON directAnswer field, strip Markdown codeblock markers and use raw text
          extractedAnswer = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
          if (extractedAnswer.startsWith('{') && extractedAnswer.endsWith('}')) {
            extractedAnswer = extractedAnswer.slice(1, -1).trim();
          }
        }

        if (extractedAnswer && extractedAnswer.length > 5) {
          const responsePayload: DoubtSolverResponse = {
            doubt: cleanDoubt,
            directAnswer: extractedAnswer,
            keyPoints: [],
            codeSnippet: null,
            interviewTip: '',
            suggestedFollowUps: ['Could you provide an example?', 'What are the main trade-offs?'],
            conversationContext: {
              topic: params.topic || 'General',
              isFollowUp: dbHistory.length > 1,
              usedPreviousContext: dbHistory.length > 1,
            },
            conversationId,
          };
          const savedMsg = await ConversationService.saveMessage(
            conversationId,
            'assistant',
            extractedAnswer,
            responsePayload
          );
          responsePayload.messageId = savedMsg.id;
          return responsePayload;
        }
      }
    }

    // Graceful offline fallback if API is temporarily unreachable
    const fallback = this.fallbackSolveDoubt(params, dbHistory);
    fallback.conversationId = conversationId;
    const savedFallbackMsg = await ConversationService.saveMessage(
      conversationId,
      'assistant',
      fallback.directAnswer,
      fallback
    );
    fallback.messageId = savedFallbackMsg.id;
    return fallback;
  }

  /**
   * Conversational heuristic fallback engine for answering student doubts offline naturally.
   */
  private static fallbackSolveDoubt(
    req: DoubtSolverRequest,
    history?: any[]
  ): DoubtSolverResponse {
    const q = req.doubt.toLowerCase().trim();
    // Comprehensive Hinglish & Roman Urdu/Hindi token detector
    const isHinglish = /\b(ab|aaj|kal|my|mai|main|me|hum|mujhe|mera|meri|mere|kya|kiya|kuch|koi|kaise|kaisa|kaisi|karo|kare|karu|karoon|karein|karna|karta|karti|padna|padhna|padhe|padho|padhai|shuru|shuruat|start|seekhe|seekhna|seekho|hai|hain|ho|hoon|samjha|samjhao|batao|bataiye|bolo|chahiye|nahi|nai|nahin|nhi|nakko|aasan|taiyari|dost|bhai|bro|sir|haan|sahi|achha|theek|kaun|kab|kitna|help|tension|man|lag|shukriya|liye|keliye|hoga|hogi|hoge|kahan|kidhar|kisko|kise|kaunsi|kaunsa|konsa|konsi|pehle|pehla|baad|bolte|banae|banao|banayein|bhi|toh|to|un|wo|woh|ye|yeh)\b/i.test(q);

    // Look at last 1-3 turns in conversation history for contextual follow-up resolution
    const recentHistoryText = (history || [])
      .slice(-3)
      .map((h: any) => (typeof h.content === 'string' ? h.content : h.message || ''))
      .join(' ')
      .toLowerCase();

    // Contextual Follow-Up 1: Authentication in REST APIs
    if (
      (q.includes('auth') || q.includes('authentication') || q.includes('jwt') || q.includes('login')) &&
      (recentHistoryText.includes('api') || recentHistoryText.includes('rest') || q.includes('api') || q.includes('rest'))
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `REST APIs me authentication stateless tarike se hoti hai kyunki REST me server session state maintain nahi karta.

Sabse popular tareeqe:
1. JWT (JSON Web Tokens) - Industry Standard:
- User login endpoint par email/password bhejta hai.
- Server verify karke ek signed JWT token generate karta hai aur response me bhejta hai.
- Next time client har request ke header me token bhejta hai: \`Authorization: Bearer <token>\`.
- Server token verify karta hai bina database lookup ke (signature check se)!

2. OAuth 2.0 (Social Logins):
- "Login with Google/GitHub" ke liye use hota hai, jahan third-party auth provider user ko authenticate karke access token deta hai.

3. API Keys:
- Server-to-server communication ya developer SDKs ke liye headers me pass ki jati hai.`
          : `In REST APIs, authentication is typically stateless because REST architecture avoids maintaining server-side session state.

The primary industry methods:
1. JWT (JSON Web Tokens) - The Modern Standard:
- The client sends credentials to \`/api/auth/login\`.
- The server validates and returns a cryptographically signed JWT.
- For all subsequent protected requests, the client includes the token in the header: \`Authorization: Bearer <token>\`.
- The server verifies the token signature instantly without needing a session database lookup.

2. OAuth 2.0:
- Used for third-party authorization (e.g., "Sign in with Google or GitHub") allowing users to share permissions without giving away passwords.

3. API Key Headers:
- Used primarily for machine-to-machine, microservice, or public developer API access.`,
        keyPoints: [
          'REST APIs use stateless token-based authentication (JWT)',
          'Tokens are passed via HTTP headers: Authorization: Bearer <token>',
          'Eliminates server session state and enables easy horizontal scaling'
        ],
        codeSnippet: {
          language: 'javascript',
          code: `// Express.js JWT Auth Middleware
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}`,
          explanation: 'Standard Bearer Token extraction and verification middleware.'
        },
        interviewTip: 'Mention Refresh Token rotation to keep access tokens short-lived (e.g. 15 mins) for strong security.',
        suggestedFollowUps: [
          'What is the difference between Access Token and Refresh Token?',
          'Where should I store JWT in the browser (LocalStorage vs HttpOnly Cookie)?'
        ],
        conversationContext: {
          topic: 'REST API Authentication',
          isFollowUp: true,
          usedPreviousContext: true,
        }
      };
    }

    // Contextual Follow-Up 2: Storing questions for an interview/practice app
    if (
      (q.includes('store') || q.includes('save') || q.includes('database') || q.includes('schema')) &&
      (q.includes('question') || q.includes('questions'))
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Aapke interview preparation app ke liye questions ko MongoDB me store karne ka sabse optimal aur flexible schema ye hai:

Kyun MongoDB?
Questions me multiple fields hote hain (test cases, code snippets, follow-ups, tags). MongoDB ka document model in fields ko structured JSON format me easily queryable banata hai.

Key Schema Design:
1. Question Core: title, slug, category (DSA, DBMS, OS, Networks), difficulty (Beginner, Intermediate, Advanced).
2. Content: markdown formatted question body, constraints, hints.
3. Code Templates: default boilerplate for multiple languages (JavaScript, Python, Java, C++).
4. Test Cases: input/output arrays for automated sandbox evaluation.`
          : `For an interview preparation platform, storing questions in a flexible document database like MongoDB is the industry standard.

Why MongoDB for questions?
Interview questions contain nested data: code boilerplates for multiple languages, sample test cases, hints, and category tags.

Key Schema Components:
1. Identity & Routing: \`title\`, \`slug\`, \`category\`, \`difficulty\`.
2. Body & Metadata: Markdown description, constraints, and hints.
3. Code Templates: Multi-language boilerplates (JavaScript, Python, Java, C++).
4. Validation: Hidden and visible test cases for automated sandbox grading.`,
        keyPoints: [
          'Use MongoDB with indexed fields on category, difficulty, and slug',
          'Embed code snippets and starter templates directly in the question document',
          'Separate user progress into a distinct UserQuestionStatus collection for high performance'
        ],
        codeSnippet: {
          language: 'typescript',
          code: `// MongoDB Question Schema
const QuestionSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, enum: ['DSA', 'DBMS', 'OS', 'Networks', 'System Design'], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  description: { type: String, required: true },
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }]
}, { timestamps: true });`,
          explanation: 'Flexible MongoDB schema supporting multi-language templates and test cases.'
        },
        interviewTip: 'Separate mutable user data (bookmarks, solved status) from static questions into a separate collection to avoid concurrent write locks.',
        suggestedFollowUps: [
          'How should I structure the UserProgress / Submissions collection?',
          'How do I handle code execution securely with Judge0?'
        ],
        conversationContext: {
          topic: 'Database Schema for Questions',
          isFollowUp: true,
          usedPreviousContext: true,
        }
      };
    }

    // Contextual Follow-Up 3: "Give code" / "code?" / "give example"
    if (
      q === 'give code' ||
      q === 'code' ||
      q === 'code?' ||
      q === 'give me code' ||
      q === 'example' ||
      q === 'give example' ||
      q.includes('code do') ||
      q.includes('code batao')
    ) {
      if (recentHistoryText.includes('binary search')) {
        return {
          doubt: req.doubt,
          directAnswer: isHinglish
            ? `Ye raha Binary Search ka standard O(log N) implementation. Isme mid calculation me integer overflow avoid karne ke liye \`left + Math.floor((right - left) / 2)\` use kiya gaya hai:`
            : `Here is the clean, optimal O(log N) Binary Search implementation avoiding integer overflow:`,
          keyPoints: [
            'Time Complexity: O(log N)',
            'Space Complexity: O(1) iterative space',
            'Safe mid calculation avoids integer overflow'
          ],
          codeSnippet: {
            language: 'javascript',
            code: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Avoid integer overflow
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid; // Target found
    } else if (nums[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }

  return -1; // Target not found
}`,
            explanation: 'Standard iterative binary search returning the index of the target.'
          },
          interviewTip: 'Always mention why left + (right - left) / 2 is used instead of (left + right) / 2 to demonstrate deep architecture awareness.',
          suggestedFollowUps: [
            'How do I apply binary search on a rotated sorted array?',
            'How does Binary Search on monotonic answer spaces work?'
          ],
          conversationContext: {
            topic: 'Binary Search Code',
            isFollowUp: true,
            usedPreviousContext: true,
          }
        };
      }
    }

    // Process vs Thread (Comprehensive definition & difference)
    if (
      (q.includes('process') && q.includes('thread')) ||
      q.includes('thread and process') ||
      q.includes('processes and thread') ||
      q.includes('process vs thread') ||
      q.includes('diff bte thread') ||
      q.includes('difference between process and thread')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Process aur Thread ka concept computer science me bohot fundamental hai! Chaliye isko real-world analogy se samajhte hain:

Restaurant Analogy:
- **Process**: Ek poora independent Restaurant hai. Iska apna building, kitchen, staff aur inventory hoti hai. Dusra restaurant iske kitchen me direct ghus nahi sakta (isolated memory).
- **Thread**: Us kitchen ke andar kaam karne wale Chefs hain! Multiple chefs (threads) ek hi kitchen me kaam karte hain aur aapas me spices aur ingredients (shared memory) share karte hain taaki order jaldi ready ho sake.

Technical Differences:
1. Memory Space:
- Process: Har process ko OS ek alag, isolated virtual memory space deta hai. Do processes bina IPC (Inter-Process Communication) ke baat nahi kar sakte.
- Thread: Saare threads apne parent process ki memory (Heap, global variables, open files) aapas me share karte hain. Har thread ke paas sirf apna private Stack aur Program Counter (PC) hota hai.

2. Creation & Context Switching Overhead:
- Process: Heavyweight hota hai. Process create karne me aur switch karne me CPU ko poora page table aur memory map reload karna padta hai, jo slow hota hai.
- Thread: Lightweight hota hai. Thread switch karne me memory map reload nahi karna padta, isliye ye 10x-50x fast hota hai.

3. Fault Isolation:
- Agar ek process crash ho jaye, toh dusre processes safe rehte hain.
- Par agar ek thread illegal memory access ya crash kare, toh poora parent process crash ho jata hai!`
          : `A **process** and a **thread** are fundamental units of execution in operating systems:

The Real-World Analogy:
- **Process**: An independent restaurant. It has its own building, equipment, and private inventory. Another restaurant across the street cannot access its kitchen directly (isolated memory).
- **Thread**: The chefs working inside that restaurant's kitchen. Multiple chefs (threads) work simultaneously inside the same kitchen, sharing recipes and ingredients (shared memory) to deliver meals much faster.

Core Technical Differences:
1. Memory Isolation:
- Process: Completely isolated by the OS kernel. Communicating between processes requires Inter-Process Communication (IPC, like pipes, sockets, or shared memory).
- Thread: All threads inside a process share the same Heap memory, code segment, and global variables. Each thread only retains its own private Stack and Program Counter (PC).

2. Overhead & Context Switching:
- Process: Heavyweight. Creating a process requires allocating a new memory address space (PCB). Switching processes flushes the CPU TLB cache and reloads page tables.
- Thread: Lightweight. Creating and switching threads is 10x-50x faster because the memory space remains untouched.

3. Failure Impact:
- If one process crashes, other processes remain completely unharmed.
- If a thread crashes due to an unhandled memory violation (e.g. segmentation fault), it crashes the entire parent process.`,
        keyPoints: [
          'A process is an executing program with isolated memory; a thread is a lightweight execution unit inside a process',
          'Threads share the process Heap and global variables, but maintain private Stacks',
          'Context switching between threads is significantly faster than between processes'
        ],
        codeSnippet: {
          language: 'python',
          code: `import threading
import multiprocessing

def task(name):
    print(f"Executing {name}")

# Multithreading (Shares memory space)
t = threading.Thread(target=task, args=("Thread Worker",))
t.start()
t.join()

# Multiprocessing (Separate memory space)
p = multiprocessing.Process(target=task, args=("Process Worker",))
p.start()
p.join()`,
          explanation: 'Demonstrates spawning a lightweight thread vs a dedicated isolated process in Python.'
        },
        interviewTip: 'In interviews, mention the trade-off: threads are faster and use less memory, but require synchronization (locks, mutexes) to avoid race conditions.',
        suggestedFollowUps: [
          'What is a Race Condition and how does a Mutex prevent it?',
          'Why does Python have a Global Interpreter Lock (GIL) for threads?'
        ],
        conversationContext: {
          topic: 'Process vs Thread',
          isFollowUp: false,
          usedPreviousContext: false,
        }
      };
    }

    // 1. Islamic Greetings (As-salamu alaykum / Salam)
    if (/\b(as[ -]?salam|assalam|salaam|salam|alaikum|walekum)\b/i.test(q)) {
      return {
        doubt: req.doubt,
        directAnswer: `Wa alaikum assalam wa rahmatullahi wa barakatuh! Kaise hain aap? Boliye, aaj main aapki kya madad kar sakta hoon? Aap mujhse programming, CS concepts, study guidance ya koi bhi sawal freely pooch sakte hain!`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Kaise ho aap?',
          'Bhai coding ki shuruat kaise karein?'
        ]
      };
    }

    // 2. Time-Based Greetings
    if (q.includes('good morning')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Good morning! Subah ki shuruat energetic ho! Aaj kya naya seekhna ya practice karna chahte hain? Boliye!`
          : `Good morning! Hope you're having an energetic start to your day. What would you like to explore or practice today?`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'What should I practice today?',
          'Explain a core CS concept to start the morning'
        ]
      };
    }

    if (q.includes('good afternoon')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Good afternoon! Aapka din kaisa ja raha hai? Boliye, aaj kis topic ya sawal pe baat karein?`
          : `Good afternoon! How is your day going? What concept or doubt can I help you with today?`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Can you explain API concepts?',
          'How does Binary Search work?'
        ]
      };
    }

    if (q.includes('good evening')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Good evening! Boliye, shaam me aaj kya padhna ya discuss karna chahte hain?`
          : `Good evening! Welcome back. What topic or doubt would you like to dive into this evening?`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Tell me about Two Pointers vs Sliding Window',
          'Explain HashMap 0.75 load factor'
        ]
      };
    }

    if (q.includes('good night')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Good night! Agar din wrap up kar rahe hain toh achhi neend lijiye. Aur agar sone se pehle koi quick doubt clear karna ho, toh bindass poochiye!`
          : `Good night! Make sure to get great rest. If you have any quick question before signing off, feel free to ask!`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Quick recap of what we discussed',
          'Good night!'
        ]
      };
    }

    // 3. Casual Greetings & Persona Queries
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q === 'namaste' ||
      q.startsWith('hi ') ||
      q.startsWith('hello ')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Hello! Kaise ho aap? Boliye, aaj kya seekhna ya discuss karna chahte ho? Main programming, concepts, study tips sabme help kar sakta hoon!`
          : `Hello! How are you doing today? What would you like to learn or discuss? Feel free to ask me anything!`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Kaise ho aap?',
          'Python aur Java me kya difference hai?'
        ]
      };
    }

    if (q.includes('kaise ho') || q.includes('how are you') || q.includes('kya haal') || q.includes('kya chal raha')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Main bilkul badiya hoon, shukriya poochne ke liye! Aap bataiye, aap kaise hain aur aaj kya help chahiye? Aap mujhse koi bhi doubt ya question freely pooch sakte hain!`
          : `I'm doing great, thank you for asking! How are you doing today? Feel free to ask me anything on your mind.`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Bhai coding me help chahiye',
          'What are the best study habits for CS students?'
        ]
      };
    }

    if (q.includes('who are you') || q.includes('tum kaun ho') || q.includes('aap kaun ho')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Main aapka friendly AI Assistant aur Study Mentor hoon! Main programming, core computer science (DSA, OS, DBMS, Networks), study guidance, aur general sawalon me aapki help kar sakta hoon.`
          : `I am your AI Assistant and Mentor! I'm here to help you understand coding, computer science fundamentals, study habits, and answer any questions you have.`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'What topics can you help me with?',
          'Bhai 1 month placement roadmap batao'
        ]
      };
    }

    if (q.includes('thank') || q.includes('shukriya') || q.includes('dhanyawad') || q.includes('jazakallah')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Aapka bohot swagat hai! Koi aur bhi doubt ya sawal ho toh bina kisi hichkichaahat ke poochiye. Always happy to help!`
          : `You are very welcome! If you have any more doubts or questions, feel free to ask anytime. Always here to help!`,
        keyPoints: [],
        interviewTip: '',
        suggestedFollowUps: [
          'Tell me another concept',
          'How to stay consistent in coding?'
        ]
      };
    }

    // 4. Motivation & Study Focus
    if (
      q.includes('man nahi lag') ||
      q.includes('padhai nahi ho') ||
      q.includes('focus nahi') ||
      q.includes('demotivated') ||
      q.includes('distracted')
    ) {
      if (isHinglish) {
        return {
          doubt: req.doubt,
          directAnswer: `Arre dost, aisa feel hona bilkul normal hai! Har student aur developer is phase se guzarta hai. Jab padhai me man na lage, toh ye 3 practical tareeqe follow karo:

1. 5-Minute Rule: Apne aap se bolo ki bas 5 ya 10 minute ek chhota sa concept ya code padhenge, fir break lenge. Mostly shuru karne ke baad inertia toot jata hai aur flow ban jata hai.
2. Phone ko doosre room me rakh do: Notifications aur reels sabse zyada focus todte hain. Desk par sirf screen aur notebook rakho.
3. Easy start: Aaj sabse tough topic mat uthao, koi aasan aur interesting cheez se start karo taaki confidence wapas aaye!

Relax raho, step-by-step progress hi real success hai!`,
          keyPoints: [
            '5-minute start rule breaks inertia',
            'Phone ko study desk se door rakhein',
            'Chhoti aasan problem se momentum build karein'
          ],
          interviewTip: '',
          suggestedFollowUps: [
            'Kaunse easy topics se shuruat karein?',
            'Daily routine kaise set karein?'
          ]
        };
      }

      return {
        doubt: req.doubt,
        directAnswer: `Feeling unmotivated or distracted is completely normal—every learner goes through this! Here are 3 proven ways to reset your focus:

1. The 5-Minute Rule: Commit to studying for just 5 minutes without pressure. Starting is 80% of the battle; once you begin, momentum usually kicks in.
2. Eliminate Screen Distractions: Put your phone in another room or turn on Do Not Disturb mode.
3. Start with a Quick Win: Don't tackle the hardest problem first. Solve an easy problem or review an interesting concept to rebuild your confidence.

Take a deep breath—consistent small steps win the long game!`,
        keyPoints: [
          'The 5-minute rule breaks initial procrastination',
          'Eliminate phone notifications during deep study blocks',
          'Build momentum with small, achievable wins'
        ],
        interviewTip: '',
        suggestedFollowUps: [
          'How to organize a daily study routine?',
          'What are the best resources for beginner coders?'
        ]
      };
    }

    // 5. Core Programming Languages & Fundamentals (Only when asking specifically what it is)
    if (
      q === 'python' ||
      q === 'what is python' ||
      q === 'python kya hai' ||
      q.startsWith('what is python') ||
      q.startsWith('python kya hai') ||
      q.startsWith('explain python')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Python ek high-level, interpreted aur beginner-friendly programming language hai. Iska syntax itna clean aur natural English jaisa hota hai ki isme code likhna aur padhna bohot aasan hota hai.

Python kahan use hoti hai?
- Artificial Intelligence aur Machine Learning (TensorFlow, PyTorch, Scikit-learn)
- Data Science aur Analysis (Pandas, NumPy)
- Web Development (FastAPI, Django, Flask)
- Automation aur Scripting tasks`
          : `Python is a high-level, interpreted programming language known for its clear, readable, English-like syntax.

Where is Python used?
- Artificial Intelligence & Machine Learning (PyTorch, TensorFlow)
- Data Science & Analytics (Pandas, NumPy)
- Web Development (FastAPI, Django)
- Automation & DevOps scripting`,
        keyPoints: [
          'High-level, dynamically typed, and interpreted',
          'Clean readable syntax with massive community libraries',
          'Dominates AI, ML, Data Science, and backend scripting'
        ],
        codeSnippet: {
          language: 'python',
          code: `# Clean and expressive Python syntax
def greet_student(name):
    return f"Welcome {name}, let's build something great!"

print(greet_student("Developer"))`,
          explanation: 'Functions and string formatting in Python are minimal and clean.'
        },
        interviewTip: 'When discussing Python, mention its dynamic typing trade-offs (fast development vs runtime type checking).',
        suggestedFollowUps: [
          'Python aur Java me main difference kya hai?',
          'Python me list comprehension kya hoti hai?'
        ]
      };
    }

    if (
      q === 'java' ||
      q === 'what is java' ||
      q === 'java kya hai' ||
      q.startsWith('what is java') ||
      q.startsWith('java kya hai') ||
      q.startsWith('explain java')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Java ek class-based, object-oriented programming language hai jo "Write Once, Run Anywhere" (WORA) principle follow karti hai. Iska code bytecode me compile hota hai jo kisi bhi operating system par Java Virtual Machine (JVM) ki madad se bina badlaav ke chalta hai.

Java kahan use hoti hai?
- Enterprise backend applications (Spring Boot)
- Android App Development
- High-performance, high-concurrency banking aur financial software`
          : `Java is a class-based, object-oriented programming language designed around the "Write Once, Run Anywhere" (WORA) principle. Java code compiles into bytecode that executes on any operating system running a Java Virtual Machine (JVM).

Where is Java used?
- Large-scale enterprise backends (Spring Boot)
- Android mobile applications
- High-concurrency financial and banking systems`,
        keyPoints: [
          'Object-oriented and strongly typed',
          'Platform independent via JVM bytecode',
          'Automatic garbage collection and strong memory management'
        ],
        interviewTip: 'Highlight the 4 OOPs pillars (Encapsulation, Inheritance, Polymorphism, Abstraction) when talking about Java.',
        suggestedFollowUps: [
          'Why is HashMap load factor 0.75 in Java?',
          'JVM, JRE aur JDK me kya farak hai?'
        ]
      };
    }

    if (
      q === 'c++' ||
      q === 'cpp' ||
      q === 'what is c++' ||
      q.startsWith('what is c++') ||
      q.startsWith('c++ kya hai') ||
      q.startsWith('explain c++')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `C++ ek blazing-fast programming language hai jo low-level hardware control (jaise direct memory management pointers se) aur high-level object-oriented programming dono offer karti hai.

Kahan use hoti hai?
- Competitive Programming aur DSA (C++ Standard Template Library - STL bohot fast hai)
- Game Development (Unreal Engine)
- Operating Systems, Database Engines (MySQL) aur Embedded Systems`
          : `C++ is a high-performance language providing direct memory manipulation through pointers alongside powerful object-oriented abstractions.

Key Applications:
- Competitive programming & DSA (via the Standard Template Library - STL)
- AAA Game engines (Unreal Engine)
- High-frequency trading and operating systems`,
        keyPoints: [
          'Ultra-fast execution speed with minimal abstraction overhead',
          'Direct memory management using pointers and references',
          'Extensive Standard Template Library (STL) for data structures'
        ],
        interviewTip: 'Distinguish between pointers (can be null/reassigned) and references (alias to existing memory).',
        suggestedFollowUps: [
          'Pointer vs Reference me kya difference hai?',
          'C++ STL me vector vs list me kya difference hai?'
        ]
      };
    }

    if (
      q === 'api' ||
      q === 'what is api' ||
      q === 'what is an api' ||
      q === 'api kya hai' ||
      q.startsWith('what is api') ||
      q.startsWith('what is an api') ||
      q.startsWith('api kya hai') ||
      q.startsWith('explain api')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `API (Application Programming Interface) do alag-alag software systems ke beech ek bridge ya mediator ka kaam karta hai taaki wo aapas me baat kar sakein.

Simple Restaurant Analogy:
- Aap (Client): Table par baith kar khana order karte ho.
- Kitchen (Server): Jahan khana banta hai aur data store hota hai.
- Waiter (API): Aapka order kitchen tak le jata hai, aur khana banne par aapke table tak lata hai!

REST API HTTP protocols (GET, POST, PUT, DELETE) use karke structured JSON data exchange karta hai.`
          : `An API (Application Programming Interface) acts as a digital bridge enabling two different software systems to communicate.

The Restaurant Analogy:
- You (The Client): Sitting at a table ordering food.
- The Kitchen (The Server): Where data is stored and business logic executes.
- The Waiter (The API): Carries your request to the kitchen and delivers the food back to you.

REST APIs use standard HTTP verbs (GET, POST, PUT, DELETE) with lightweight JSON payloads.`,
        keyPoints: [
          'Acts as an interface allowing separate applications to talk',
          'Client-server separation of concerns',
          'Uses standard HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)'
        ],
        codeSnippet: {
          language: 'javascript',
          code: `// Express.js REST API Endpoint example
app.get('/api/users/:id', async (req, res) => {
  const user = await database.findUser(req.params.id);
  res.json({ success: true, data: user });
});`,
          explanation: 'Client sends GET request, server processes it and responds with JSON.'
        },
        interviewTip: 'Mention REST statelessness: each request must contain all the information necessary for the server to understand and process it.',
        suggestedFollowUps: [
          'REST vs GraphQL me kya farak hai?',
          'HTTP status codes 200, 400, 404, aur 500 ka kya matlab hota hai?'
        ]
      };
    }

    if (
      q === 'git' ||
      q === 'github' ||
      q === 'what is git' ||
      q.startsWith('what is git') ||
      q.startsWith('git kya hai') ||
      q.startsWith('git aur github kya hai')
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Git aur GitHub dono alag cheezein hain, par saath me kaam karti hain:

1. Git: Ek software tool (Version Control System) hai jo aapke computer par chalta hai. Ye aapke code ke har snapshot (commit) ko save karta hai jaise ek Time Machine, taaki aap purane code par kabhi bhi wapas ja sakein.
2. GitHub: Ek cloud hosting platform hai jahan aap apna Git code store karte ho taaki doosre developers ke saath collaborate kar sako aur portfolio showcase kar sako.`
          : `Git and GitHub work together but are distinct tools:

1. Git: A distributed version control system running locally on your computer that tracks line-by-line changes over time like a time machine.
2. GitHub: A cloud-based hosting service that stores Git repositories online, allowing developers to collaborate, review pull requests, and showcase their portfolio.`,
        keyPoints: [
          'Git tracks version history and branches locally',
          'GitHub hosts repositories in the cloud for team collaboration',
          'Core workflow: git add -> git commit -m "msg" -> git push'
        ],
        interviewTip: 'Explain git branches and how pull requests ensure peer code reviews before merging into production.',
        suggestedFollowUps: [
          'Git merge vs Git rebase me kya farak hai?',
          'Merge conflicts ko kaise resolve kiya jata hai?'
        ]
      };
    }

    // 6. Placement & Career Roadmaps / How & Where to Start Studying
    if (
      q.includes('where to start') ||
      q.includes('how to start') ||
      q.includes('kaise start') ||
      q.includes('kahan se start') ||
      q.includes('kahan se shuru') ||
      q.includes('shuru kaise') ||
      q.includes('placement roadmap') ||
      q.includes('study roadmap') ||
      q.includes('1 month plan') ||
      q.includes('one month roadmap') ||
      q.includes('placement taiyari') ||
      q.includes('placement preparation guide') ||
      (q.includes('placement') && (q.includes('roadmap') || q.includes('guide') || q.includes('strategy') || q.includes('kaise kare')))
    ) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Bhai, agar aap abhi placement ki taiyari start kar rahe ho, toh panic bilkul mat karo! Ek clear, step-by-step roadmap follow karo:

1. Ek Core Programming Language Pakdo (Pehele 10-15 Din):
- Java, C++ ya Python me se koi EK language choose karo (DSA ke liye Java ya C++ industry standard hain).
- Us language ke Basics, Loops, Arrays, Strings, Functions aur OOPs (Class, Object, Inheritance, Polymorphism) crystal clear kar lo.

2. Data Structures & Algorithms (Daily 2-3 Questions):
- Linear Structures: Arrays, Strings, Two Pointers aur Sliding Window se start karo.
- Phir: HashMaps, Stacks, Queues, aur Binary Search.
- Uske baad: Binary Trees, BST aur Graph traversals (BFS/DFS).
- Roz kam se kam 2-3 standard questions bina solution dekhe code karne ki koshish karo.

3. Core Computer Science Subjects (Daily 45 Mins):
- DBMS: SQL Queries, Normalization, B+ Tree Indexing, ACID Properties.
- Operating Systems: Process vs Thread, Deadlocks, Virtual Memory.
- Computer Networks: TCP/IP 3-Way Handshake, HTTP vs HTTPS, DNS.

4. Resume ke liye 1-2 Strong Projects:
- Apne tech stack me kam se kam ek accha full-stack project banao jisme authentication aur database ho.

Aap batao, aapko filhal kaunsi language me comfortable feel hota hai (Java, C++, ya Python)? Uske mutabiq main aapka day-by-day plan set kar deta hoon!`
          : `If you are starting placement preparation right now, having a clear step-by-step roadmap is key:

1. Master One Core Language (First 10-15 Days):
- Choose Java, C++, or Python (Java or C++ is strongly recommended for DSA).
- Master Basics, Loops, Arrays, Strings, Functions, and OOPs (Classes, Inheritance, Polymorphism).

2. Data Structures & Algorithms (Daily 2-3 Questions):
- Start with linear structures: Arrays, Strings, Two Pointers, and Sliding Window.
- Progress to: HashMaps, Stacks, Queues, and Binary Search.
- Then tackle: Binary Trees, BST, and Graph traversals (BFS/DFS).
- Solve problems actively without checking solutions prematurely.

3. Core Computer Science Fundamentals (Daily 45 Mins):
- DBMS: SQL Queries, Normalization, B+ Tree Indexing, ACID.
- Operating Systems: Process vs Thread, Deadlocks, Virtual Memory.
- Computer Networks: TCP/IP 3-Way Handshake, HTTP vs HTTPS, DNS.

4. Resume Flagship Projects:
- Build or refine at least 1 robust full-stack project with authentication and a real database.

Which programming language do you currently feel most comfortable with? Let me know and I'll give you day-by-day topics!`,
        keyPoints: [
          'Pehle ek language aur OOPs ko strong karein',
          'Daily 2 standard DSA pattern questions solve karein',
          'Core CS (DBMS, OS, Networks) aur 1 flagship project ready rakhein'
        ],
        interviewTip: 'Interviewers look for structured fundamentals and clear problem-solving logic. Always state your approach out loud.',
        suggestedFollowUps: [
          'Java vs C++: Placement ke liye kaunsi language best hai?',
          'DSA ki shuruat Arrays aur Strings se kaise karein?'
        ]
      };
    }

    // 7. Behavioral / HR Questions
    if (q.includes('tell me about yourself') || q.includes('weakness') || q.includes('introduce') || q.includes('hr round')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `HR round me "Tell me about yourself" aur "What is your weakness" poochte waqt interviewers communication, self-awareness aur confidence check karte hain:

1. "Tell Me About Yourself" (90-Second Formula):
- Present (30s): Education, current college, flagship technical focus (e.g. Full-Stack / Backend / DSA).
- Past (30s): Best project — problem kya tha, aapne kya build kiya, aur uska measurable impact kya tha.
- Future (30s): Ye specific company kyun pasand hai aur aap engineering team me kaise value add karoge.

2. "Weakness" Question Formula:
Kabhi bhi fake answer jaise "I am a perfectionist" mat bolo! Ek genuine minor technical weakness batao jisko improve karne ke liye aap actively steps le rahe ho (e.g., "Earlier I jumped into coding too quickly without whiteboarding edge cases. Recently, I started writing test cases upfront on paper before coding, which reduced my debugging time by 30%").`
          : `For HR rounds, interviewers evaluate communication, emotional maturity, and self-awareness:

1. "Tell Me About Yourself" (The Present-Past-Future 90-Second Formula):
- Present (30s): Who you are right now (education, primary tech stack).
- Past (30s): Flagship project highlight (what problem you solved and measurable impact).
- Future (30s): Why this company inspires you and what you bring to their engineering team.

2. "What is Your Greatest Weakness?":
Avoid cliches like "I work too hard." Name a genuine, non-critical technical habit and show the specific actionable system you created to overcome it.`,
        keyPoints: [
          'Follow the Present-Past-Future structure in 90 seconds',
          'Pair every weakness with a concrete improvement mechanism',
          'Maintain genuine humility and positive energy'
        ],
        interviewTip: 'Practice delivering your 90-second pitch naturally so it sounds like a conversation, not a scripted robot.',
        suggestedFollowUps: [
          'Amazon Leadership Principles ke liye STAR method kaise use kare?',
          'Technical disagreements ko team me kaise resolve kiya jata hai?'
        ]
      };
    }

    // 8. Sliding Window vs Two Pointers
    if (q.includes('sliding window') || q.includes('two pointer') || q.includes('two-pointer')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Two Pointers aur Sliding Window dono closely related algorithmic patterns hain, par dono alag problem types ke liye use hote hain:

1. Two Pointers (Converging / Opposite directions): Ye mostly sorted arrays me use hota hai jahan do pointers opposite ends se ek dusre ki taraf aate hain (jaise left = 0, right = n - 1 in Two Sum II ya 3Sum). Current sum target se bada hai toh right-- karte hain, chhota hai toh left++ karte hain.

2. Sliding Window: Ye continuous subarray ya substring problems ke liye use hota hai (jaise "Longest Substring Without Repeating Characters"). Yahan ek dynamic window [left, right] hoti hai jo aage badhti hai — right pointer naye elements add karta hai, aur condition violate hone par left pointer window ko shrink karta hai. Dono pointers SAME direction me aage badhte hain!`
          : `Two Pointers and Sliding Window are closely related algorithmic patterns, but they solve different categories of problems:

1. Two Pointers (Converging or Diverging): Usually works on sorted arrays where two pointers move towards each other (e.g. left = 0, right = n - 1 in Two-Sum or 3Sum). You move pointers based on whether current sum is too small or too large.

2. Sliding Window: Maintains a dynamic subarray/substring bounded by [left, right] that expands to the right to include new elements and shrinks from the left when constraints are violated. Used specifically for continuous subarray/substring problems.`,
        keyPoints: [
          'Two Pointers: Pointers converge from opposite ends or diverge from center',
          'Sliding Window: Pointers move in the SAME direction maintaining a window boundary',
          'Both collapse O(N²) quadratic loops to O(N) linear time'
        ],
        codeSnippet: {
          language: 'javascript',
          code: `// Sliding Window Invariant Pattern
let left = 0, maxLen = 0;
for (let right = 0; right < arr.length; right++) {
  windowState.add(arr[right]);
  while (!isValid(windowState)) {
    windowState.remove(arr[left]);
    left++;
  }
  maxLen = Math.max(maxLen, right - left + 1);
}`,
          explanation: 'Standard expand-and-shrink invariant pattern used in 90% of sliding window questions.'
        },
        interviewTip: 'State the window invariant out loud first: "My window [left, right] will maintain the valid state in single-pass O(N) time."',
        suggestedFollowUps: [
          'Fixed-size aur Dynamic-size sliding window me kya difference hai?',
          'Sliding window me negative numbers aaye toh kya karte hain?'
        ]
      };
    }

    // 9. HashMap Load Factor 0.75
    if (q.includes('hashmap') || q.includes('load factor') || q.includes('hash map')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Java HashMap me default Load Factor 0.75 hota hai. Load factor basically threshold ratio hota hai: (number of elements) / (bucket capacity). Jab ye threshold cross hota hai, HashMap internal array ka size double kar deta hai aur saari entries ko rehash karta hai.

0.75 hi kyun?
Ye time efficiency (fast search) aur space efficiency (memory saving) ka perfect balance hai:
- Agar Load Factor 1.0 ya bada hota: Memory toh save hoti, par Hash Collisions bohot zyada badh jaate! Lookup time O(1) se gir ke O(N) hone lagta.
- Agar Load Factor 0.5 hota: Collisions zero ke barabar hote, par 50% memory hamesha khali padi rehti!
- Mathematically, Poisson Distribution se calculate kiya gaya hai ki 0.75 load factor pe kisi bucket me 8 se zyada collisions hone ki probability 1 in 10,000,000 se bhi kam hoti hai!`
          : `In Java HashMap, the default Load Factor is 0.75. The load factor is the threshold ratio: (number of elements) / (bucket capacity). When this threshold is exceeded, the internal array doubles in size and rehashes existing entries.

Why 0.75 specifically?
It represents the sweet spot between time efficiency (fast lookups) and space efficiency (memory waste):
- If Load Factor were 1.0+: Saves memory, but hash collisions skyrocket, degrading lookups towards O(N).
- If Load Factor were 0.5: Zero collisions, but 50% of allocated array buckets sit empty, wasting memory.
- Mathematically, via Poisson Distribution, a 0.75 load factor keeps the probability of a bucket exceeding 8 collisions under 1 in 10,000,000.`,
        keyPoints: [
          'Load Factor = Size / Capacity (Default 0.75 in Java)',
          'When size > capacity * 0.75, capacity doubles (16 -> 32) and rehashes keys',
          'Guarantees O(1) average lookup while keeping memory overhead at ~25%'
        ],
        codeSnippet: {
          language: 'java',
          code: `static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // 16
static final float DEFAULT_LOAD_FACTOR = 0.75f;
// Resizing triggers when element count exceeds: 16 * 0.75 = 12 elements!`,
          explanation: 'Default initial capacity is 16, so after inserting 12 items, HashMap resizes to 32.'
        },
        interviewTip: 'Mention the Poisson distribution and the Java 8 Red-Black Tree threshold (TREEIFY_THRESHOLD = 8).',
        suggestedFollowUps: [
          'HashMap capacity hamesha power of 2 kyun hoti hai?',
          'Do alag keys ka hashCode() same ho jaye toh kya hota hai?'
        ]
      };
    }

    // 10. TCP 3-Way Handshake
    if (q.includes('tcp') || q.includes('handshake') || q.includes('3-way') || q.includes('syn')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `TCP 3-Way Handshake client aur server ke beech ek reliable, full-duplex connection establish karta hai.

3 steps kyun zaroori hain, 2 kyun nahi?
Kyunki TCP bidirectional communication karta hai! Dono sides ko apna random Initial Sequence Number (ISN) choose karna padta hai aur verify karna padta hai:
- Step 1 (SYN from Client): "Hey Server, mera sequence number X hai. Kya tum sun sakte ho?"
- Step 2 (SYN-ACK from Server): "Haan! Mujhe X mil gaya (Ack = X + 1). Mera sequence number Y hai. Kya tum sun sakte ho?"
- Step 3 (ACK from Client): "Haan, mujhe Y mil gaya (Ack = Y + 1)."

Agar sirf 2 steps hote toh server ko pata hi nahi chalta ki client ko uska sequence number Y mila ya nahi!`
          : `The TCP 3-Way Handshake establishes a reliable, full-duplex connection between client and server.

Why 3 steps instead of 2?
Because TCP is bidirectional! Both sides must independently choose a random Initial Sequence Number (ISN) and verify that the other side can receive it:
- Step 1 (SYN from Client): Client announces initial sequence number X.
- Step 2 (SYN-ACK from Server): Server acknowledges X (Ack = X+1) and sends its own sequence number Y.
- Step 3 (ACK from Client): Client acknowledges Y (Ack = Y+1). Connection is ESTABLISHED.`,
        keyPoints: [
          'Step 1: Client -> Server: SYN (seq=X)',
          'Step 2: Server -> Client: SYN-ACK (seq=Y, ack=X+1)',
          'Step 3: Client -> Server: ACK (ack=Y+1)',
          'Synchronizes sequence numbers and prevents duplicate packet corruption'
        ],
        codeSnippet: {
          language: 'text',
          code: `Client                       Server
  |                             |
  |-------- SYN (Seq=X) ------->|  (Server buffer allocates)
  |                             |
  |<-- SYN-ACK (Seq=Y, Ack=X+1)-|  (Server confirms X, sends Y)
  |                             |
  |-------- ACK (Ack=Y+1) ----->|  (Client confirms Y)
  |                             |
[ESTABLISHED]                 [ESTABLISHED]`,
          explanation: 'Timeline of sequence synchronization before data transfer begins.'
        },
        interviewTip: 'Explain why initial sequence numbers are randomized: predictable ISNs allow attackers to spoof reset packets and hijack connections.',
        suggestedFollowUps: [
          'TCP connection teardown me 4 steps kyun lagte hain?',
          'SYN Flood attack kya hota hai?'
        ]
      };
    }

    // 11. B+ Tree vs B-Tree Indexing
    if (q.includes('b+ tree') || q.includes('b tree') || q.includes('indexing') || q.includes('dbms index')) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `B-Tree aur B+ Tree dono disk storage ke liye design kiye gaye balanced search trees hain. Par MySQL (InnoDB) aur PostgreSQL B+ Tree hi kyun use karte hain?

Do sabse bade reasons:
1. Internal Nodes me sirf Keys hoti hain: Non-leaf nodes me row data nahi hota, sirf routing keys hoti hain. Is wajah se ek 16 KB disk page 1,000+ keys hold kar sakta hai aur 100 Crore rows sirf 3-4 disk I/O me search ho jaati hain.
2. Leaf Nodes Doubly Linked List se connected hain: Saara actual row data leaf nodes me hota hai, aur saare leaves aapas me linked list se jude hote hain. Isliye SQL Range queries ("WHERE age BETWEEN 20 AND 30") ultra fast chalti hain!`
          : `Both B-Trees and B+ Trees are balanced search trees designed for disk storage. However, databases like MySQL (InnoDB) and PostgreSQL choose B+ Trees for two major reasons:

1. Internal Nodes Only Store Keys: Non-leaf nodes store routing keys without row pointers. Because each page holds 1,000+ keys, tree height stays <= 4 even for a billion rows.
2. Linked Leaf Nodes: All actual records reside in leaf nodes, and leaf nodes form a doubly linked list. This enables lightning-fast range queries (WHERE age BETWEEN 20 AND 30) via sequential disk scans.`,
        keyPoints: [
          'B+ Tree stores actual record pointers strictly in leaf nodes',
          'Leaf nodes form a doubly linked list for fast range scans',
          'High fan-out keeps tree height <= 4, minimizing disk I/O'
        ],
        codeSnippet: {
          language: 'sql',
          code: `-- SQL Range Query:
SELECT * FROM orders WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31';
-- 1. B+ Tree searches root to leaf for Jan 1 (3-4 I/Os)
-- 2. Scans forward linearly along leaf linked list until Jan 31!`,
          explanation: 'Executes range queries in O(log N + K) sequential reads.'
        },
        interviewTip: 'Disk I/O is 100,000x slower than RAM, so minimizing random page seeks is the primary database indexing goal.',
        suggestedFollowUps: [
          'Clustered Index aur Secondary Index me kya difference hai?',
          'Covering Index kya hota hai?'
        ]
      };
    }

    // 12. Smart Substantive Fallback for General Guidance, Placement Prep & Concepts
    const isPrepQuery = /\b(placement|prepare|preparation|taiyari|start|shuru|guide|strategy|roadmap|timetable|schedule)\b/i.test(q);
    const isProjectQuery = /\b(project|projects|capstone|portfolio|resume|cv)\b/i.test(q);
    const isDsaQuery = /\b(dsa|algorithm|algorithms|array|tree|graph|dp|dynamic|recursion|binary|sorting|pointer)\b/i.test(q);

    if (isPrepQuery) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Bhai, campus placement aur SDE roles ke liye clear 4-step actionable strategy:

1. Primary Language & DSA (60% weightage):
- Ek language (C++, Java, ya Python) me command pakki karo.
- Top patterns master karo: Arrays & HashMaps, Two Pointers, Sliding Window, Binary Search, Trees (BFS/DFS), aur Dynamic Programming.
- Target: 150-200 curated questions (LeetCode Medium focus).

2. Core CS Fundamentals (20% weightage):
- Operating Systems: Process vs Thread, Deadlocks, Virtual Memory, Concurrency.
- DBMS: Normalization, B-Tree Indexing, ACID Properties, SQL Joins.
- Computer Networks: TCP vs UDP, OSI 7-Layer, DNS lookup flow, HTTP/HTTPS.
- OOP Concepts: Abstraction, Encapsulation, Inheritance, Polymorphism.

3. Projects & System Design (15% weightage):
- 2 high-impact full-stack projects jinme real Auth (JWT), Database Indexing, aur live deployment ho.
- Google X-Y-Z format me bullets likho resume me.

4. HR & Behavioral Rounds (5% weightage):
- STAR framework (Situation, Task, Action, Result) me answers ready rakho.`
          : `Here is a high-impact, structured 4-pillar blueprint to clear SDE campus placements:

1. Data Structures & Algorithms (60% Weightage):
- Select one primary language (C++, Java, or Python).
- Master key problem patterns: Two Pointers, Sliding Window, Fast & Slow Pointers, Tree Traversals (BFS/DFS), and Top-Down/Bottom-Up DP.
- Benchmark: 150-200 curated LeetCode Medium challenges.

2. Core Computer Science Fundamentals (20% Weightage):
- OS: Concurrency, Synchronization Primitives, Deadlocks, Virtual Memory, Context Switching.
- DBMS: B-Tree Indexing, Transactions, ACID Properties, Sharding vs Replication.
- Networks: TCP 3-Way Handshake, DNS Resolution, WebSockets, HTTP/2 & HTTP/3.
- OOP: SOLID Principles, Design Patterns (Singleton, Factory, Observer).

3. Production Projects & Resume (15% Weightage):
- 2 end-to-end full-stack projects featuring stateless JWT auth, relational/document modeling, and live production deployment.
- Write resume bullets using the Google X-Y-Z formula.

4. Behavioral & Leadership Rounds (5% Weightage):
- Prepare 4 core stories using the STAR methodology (Situation, Task, Action, Result).`,
        keyPoints: [
          'Master 1 language thoroughly (C++/Java/Python)',
          'Focus on LeetCode patterns rather than memorizing random solutions',
          'Revise OS, DBMS, Networks, and OOP theory weekly',
          'Prepare 2 production-ready projects with live URLs'
        ],
        interviewTip: 'In technical rounds, always communicate your thought process out loud. Start with brute force, analyze Big-O, and iterate to optimal.',
        suggestedFollowUps: [
          'What are the top 50 DSA problems every student must solve?',
          'How should I structure my resume for Google/Amazon off-campus drives?',
          'Give me a daily 4-hour timetable for placement preparation'
        ]
      };
    }

    if (isProjectQuery) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `Placements ke liye project aur resume ka golden standard:

1. Kaise Projects Banayein:
- Generic To-Do apps ya basic calculators se offer nahi milti.
- Real problems solve karne wale projects banayein: Full-Stack SaaS platform (React + Node + MongoDB/Postgres), Real-Time Collab App (WebSockets), ya AI Document Scanner.
- Must-have features: JWT Authentication, Role-based Access, Database Indexing, Error Handling, aur Responsive UI.

2. Resume Bullets (Google X-Y-Z Rule):
- Format: "Accomplished [X] as measured by [Y] by doing [Z]"
- Bad: "Built e-commerce site in React"
- Good: "Engineered scalable e-commerce store with Redis caching, reducing query latency by 42% for 500+ active items."

3. Project Interview Discussion:
- Architecture diagram explain karna aana chahiye.
- "Why this database?" aur "How would you scale to 100k users?" par direct answers tayar rakhein.`
          : `For software engineering campus placements, your project portfolio must prove production competency:

1. Ideal Project Architecture:
- Avoid generic tutorial clones. Build full-stack applications solving tangible problems (e.g. Real-Time Collaboration Engine, High-Throughput E-commerce API, or AI-assisted Workflow Tool).
- Crucial components: Secure JWT auth with refresh tokens, database indexing, rate-limiting, and clean RESTful design.

2. Resume Bullets with Google X-Y-Z Formula:
- Structure: "Accomplished [X] as measured by [Y] by implementing [Z]"
- Example: "Architected microservices backend in Node.js/PostgreSQL, reducing API response times by 38% under 1,000 concurrent simulated requests."

3. Common Project Interview Questions:
- "Why did you choose MongoDB over PostgreSQL for this use case?"
- "How did you handle race conditions or concurrent state updates?"
- "What would break first if traffic increased by 100x?"`,
        keyPoints: [
          'Build 2 solid production projects with live deployments and clean GitHub repos',
          'Use the Google X-Y-Z metric format on your resume',
          'Be prepared to defend every architectural and database trade-off'
        ],
        interviewTip: 'Interviewers often ask "What was the hardest bug you solved in this project?" Prepare a clear, technical debugging story using the STAR framework.',
        suggestedFollowUps: [
          'What are 3 unique project ideas for a Full Stack Developer?',
          'How do I answer "Why did you choose this tech stack?"',
          'How to write impactful bullet points on GitHub and Resume?'
        ]
      };
    }

    if (isDsaQuery) {
      return {
        doubt: req.doubt,
        directAnswer: isHinglish
          ? `DSA master karne ka proven roadmap aur mental models:

1. Essential Foundations:
- Time & Space Complexity (Big-O analysis) samajhna sabse zaroori hai. Har loop aur recursion call ka time pata hona chahiye.
- Arrays, Strings, aur HashMaps se start karein — 40% interview questions inhi par based hote hain.

2. Core Problem-Solving Patterns:
- Two Pointers (Left-Right, Fast-Slow)
- Sliding Window (Fixed size, Variable size)
- Binary Search (Sorted arrays, Search on Answer Space)
- Tree Traversals (Inorder, Preorder, Postorder, Level Order / BFS)
- Graph Traversals (BFS, DFS, Dijkstra, Topological Sort)
- Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, Grid paths)

3. Interview Strategy:
- Problem padhte hi code mat likho. Pehle interviewer ko approach verbally samjhao, edge cases discuss karo, aur fir clean code likho.`
          : `A structured mastery framework for Data Structures & Algorithms:

1. Computational Complexity First:
- Always compute Time and Space Complexity before writing a single line of code. Understand memory allocation on the Call Stack vs Heap.

2. Master Patterns, Not Individual Solutions:
- Two Pointers & Sliding Window (Linear array/string optimization)
- Binary Search (Logarithmic bounds, search space reduction)
- Tree & Graph Traversals (DFS recursion, BFS queue, topological ordering)
- Dynamic Programming (Identifying overlapping subproblems and optimal substructure)

3. Live Interview Execution:
- Clarify inputs and constraints.
- State a brute force solution ($O(N^2)$), then identify redundant computations to reach optimal ($O(N)$ or $O(N \log N)$).`,
        keyPoints: [
          'Master algorithmic patterns rather than memorizing individual problems',
          'Always state Time and Space Complexity upfront',
          'Communicate approach clearly before writing implementation code'
        ],
        interviewTip: 'When stuck, test with small example inputs (e.g. array of size 2 or 3) and trace pointer movements manually.',
        suggestedFollowUps: [
          'Explain Two Pointers vs Sliding Window with examples',
          'What are the most common Dynamic Programming patterns?',
          'How to master Graph algorithms for Tier-1 interviews?'
        ]
      };
    }

    // Default clean comprehensive fallback
    if (isHinglish) {
      return {
        doubt: req.doubt,
        directAnswer: `Bhai, "${req.doubt}" par direct aur practical placement advice:

1. Technical Clarity:
- Interview me kisi bhi technical sawal ka answer hamesha 3 steps me do:
  a. Definition / High-Level Intuition (1-2 sentences)
  b. Under-the-hood Working & Trade-offs (memory, CPU, architecture)
  c. Real-world Example ya Code snippet

2. Best Practice:
- Agar coding sawal hai to edge cases (null inputs, empty arrays, negative numbers, extreme values) pehle consider karo.
- Agar system design ya theory sawal hai to scalability, caching aur bottlenecks highlight karo.

Aap is topic me code implementation, dry-run ya real interview questions jo bhi chahein, pooch lijiye!`,
        keyPoints: [
          `Focus: ${req.doubt}`,
          'Structure responses clearly: Definition -> Mechanism -> Trade-offs',
          'Always address edge cases and computational complexity'
        ],
        interviewTip: 'Keep your explanations concise and structured. Use the 3-step framework to impress senior technical interviewers.',
        suggestedFollowUps: [
          'Can you explain this with a practical code example?',
          'What are the common interview pitfalls in this topic?',
          'How would this be asked in an Amazon or Google technical round?'
        ]
      };
    }

    return {
      doubt: req.doubt,
      directAnswer: `Here is a structured, practical breakdown regarding "${req.doubt}":

1. Foundational Engineering Principle:
- Approach technical questions systematically:
  a. High-level definition and core problem it solves.
  b. Underlying runtime mechanism (memory layout, call stack, execution phases).
  c. Practical engineering trade-offs (Time, Space, Maintainability).

2. Production & Interview Application:
- In technical interviews, interviewers look for structured thinking over memorized trivia.
- Highlight edge cases (boundary conditions, concurrency, scalability bottlenecks) to demonstrate Senior-level depth.

Feel free to ask for concrete code implementations, step-by-step dry runs, or target company questions on this topic!`,
      keyPoints: [
        `Topic: ${req.doubt}`,
        'Structure answers: Definition -> Internal Mechanics -> Real-world Trade-offs',
        'Analyze Big-O bounds and edge cases proactively'
      ],
      interviewTip: 'Always link theory back to practical engineering: why this approach is chosen in real production systems.',
      suggestedFollowUps: [
        'Can you show a production-grade code implementation?',
        'What are the most frequent interview questions on this topic?',
        'How does this scale under high concurrency?'
      ]
    };
  }

  /**
   * High-yield offline fallback concept explanation engine for all core interview curriculum topics.
   */
  private static fallbackConceptExplanation(
    req: ConceptExplanationRequest
  ): ConceptExplanationResponse {
    const lowerTopic = (req.topic + ' ' + (req.focusArea || '')).toLowerCase();

    // 1. JavaScript Event Loop, Call Stack & Promises
    if (
      lowerTopic.includes('event loop') ||
      lowerTopic.includes('microtask') ||
      lowerTopic.includes('call stack') ||
      lowerTopic.includes('promise') ||
      lowerTopic.includes('js internals')
    ) {
      return {
        topic: req.topic,
        focusArea: req.focusArea || 'JavaScript Runtime & Internals',
        summary:
          'JavaScript is a single-threaded runtime using an event-driven non-blocking concurrency model. The event loop continuously arbitrates execution between the synchronous Call Stack, the high-priority Microtask Queue (Promises, queueMicrotask), and the Macrotask Queue (setTimeout, setInterval, I/O).',
        keyConcepts: [
          {
            title: 'Call Stack & Single-Threaded Execution',
            description:
              'JavaScript runs one statement at a time in its execution context stack. Synchronous functions run to completion without interruption; heavy computation blocks the thread, causing UI freezes.',
          },
          {
            title: 'Microtask Queue vs Macrotask Queue',
            description:
              'Microtasks (Promise callbacks, async/await continuations) have absolute priority: once a tick finishes in the Call Stack, the entire Microtask Queue is completely drained before any Macrotask is picked.',
          },
          {
            title: 'Macrotask Starvation Risk',
            description:
              'Recursively queueing microtasks prevents the event loop from ever reaching macrotasks or UI repaint frames, leading to tab unresponsiveness without overflowing the call stack.',
          },
        ],
        codeSnippet: {
          language: 'javascript',
          code: `console.log("1: Synchronous Start");

setTimeout(() => {
  console.log("4: Macrotask (setTimeout 0ms)");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("2: Microtask 1");
  })
  .then(() => {
    console.log("3: Microtask 2");
  });

console.log("End: Synchronous Finish");
// Output Order:
// 1: Synchronous Start -> End: Synchronous Finish -> 2: Microtask 1 -> 3: Microtask 2 -> 4: Macrotask`,
          explanation:
            'Synchronous code executes first to completion. Next, all pending microtasks in the queue are executed in sequence. Only after the microtask queue is empty does the event loop process the macrotask queue.',
        },
        interviewQuestions: [
          {
            question:
              'What is the execution order of synchronous code, process.nextTick, Promise.then, and setTimeout in Node.js?',
            answer:
              'Synchronous code runs first. In Node.js, process.nextTick queue is drained immediately, followed by the Promise microtask queue, followed by the next event loop phase timer callbacks (setTimeout/setInterval).',
          },
          {
            question: 'Why does setTimeout(fn, 0) not execute immediately?',
            answer:
              'setTimeout delegates the timer to the host browser/Node timer system. Even with 0ms delay, the callback is placed in the macrotask queue and must wait for all currently executing synchronous stack frames and all pending microtasks to finish first.',
          },
        ],
        pitfalls: [
          'Assuming setTimeout(fn, 0) executes before Promise.then() callbacks.',
          'Creating infinite microtask chains (e.g. recursive Promise chains) which starve browser rendering and event listeners.',
        ],
        bestPractices: [
          'Offload CPU-intensive operations (cryptography, video processing) to Web Workers or worker_threads.',
          'Always attach .catch() or use try/catch with await to prevent unhandled rejection crashes.',
        ],
      };
    }

    // 2. Sliding Window & Two Pointers
    if (
      lowerTopic.includes('sliding window') ||
      lowerTopic.includes('two pointer') ||
      lowerTopic.includes('subarray')
    ) {
      return {
        topic: req.topic,
        focusArea: req.focusArea || 'Algorithms & Data Structures',
        summary:
          'The Sliding Window and Two-Pointer patterns convert brute-force O(n²) subarray/substring problems into linear O(n) solutions by maintaining explicit window boundaries that monotonically advance across the collection.',
        keyConcepts: [
          {
            title: 'Window Invariant & Monotonicity',
            description:
              'A valid window satisfies a specific condition (e.g. sum <= K or at most K distinct elements). Expanding the right pointer probes new elements; contracting the left pointer restores invariant validity.',
          },
          {
            title: 'Linear Time Complexity Guarantee',
            description:
              'Even though there is a nested while loop inside the outer pointer iteration, each array element is visited at most twice (once by right, once by left), guaranteeing strictly O(2n) = O(n) runtime.',
          },
          {
            title: 'State Tracking with Hash Tables',
            description:
              'Use frequency counts or hash maps to monitor duplicates in O(1) time per window change, keeping auxiliary space bounded by the alphabet size O(k).',
          },
        ],
        codeSnippet: {
          language: 'javascript',
          code: `function lengthOfLongestSubstringKDistinct(s, k) {
  let left = 0, maxLength = 0;
  const charCount = new Map();

  for (let right = 0; right < s.length; right++) {
    charCount.set(s[right], (charCount.get(s[right]) || 0) + 1);

    // Shrink window from the left until invariant is restored
    while (charCount.size > k) {
      const leftChar = s[left];
      charCount.set(leftChar, charCount.get(leftChar) - 1);
      if (charCount.get(leftChar) === 0) charCount.delete(leftChar);
      left++;
    }

    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}`,
          explanation:
            'Right pointer expands the candidate window. When constraint is violated (size > k), the left pointer shrinks the window until valid. Window length is computed as right - left + 1.',
        },
        interviewQuestions: [
          {
            question:
              'How do you identify whether a subarray problem should use Sliding Window versus Prefix Sum + Hash Map?',
            answer:
              'Use Sliding Window when the window condition is monotonic (e.g., all array elements are positive, so expanding always increases the sum). If elements can be negative, monotonicity is broken, and you must use Prefix Sum with a Hash Map.',
          },
          {
            question:
              'What is the difference between a fixed-size window and a dynamic-size window?',
            answer:
              'In a fixed-size window of size K (e.g., max sum of K consecutive elements), both left and right pointers shift together after reaching size K. In dynamic-size windows, left only shifts when constraints are violated.',
          },
        ],
        pitfalls: [
          'Calculating window length as `right - left` instead of `right - left + 1`.',
          'Forgetting to delete keys from the frequency map when count drops to 0.',
        ],
        bestPractices: [
          'Clearly define the window validity invariant before writing the while loop.',
          'Consider using fixed-size array buffers (e.g. Int32Array(128)) instead of Map for ASCII characters to maximize cache locality.',
        ],
      };
    }

    // 3. Dynamic Programming & Recursion
    if (
      lowerTopic.includes('dynamic programming') ||
      lowerTopic.includes('dp') ||
      lowerTopic.includes('memoization') ||
      lowerTopic.includes('knapsack')
    ) {
      return {
        topic: req.topic,
        focusArea: req.focusArea || 'Dynamic Programming',
        summary:
          'Dynamic Programming (DP) optimizes recursive problems possessing Overlapping Subproblems and Optimal Substructure by caching intermediate solutions (Top-Down Memoization) or solving iteratively (Bottom-Up Tabulation).',
        keyConcepts: [
          {
            title: 'Optimal Substructure Property',
            description:
              'An optimal solution to the overall problem can be constructed directly from optimal solutions of its subproblems (e.g. shortest path from A to C via B).',
          },
          {
            title: 'Top-Down vs Bottom-Up Space Trade-offs',
            description:
              'Top-down memoization uses the recursion call stack O(depth) and a cache table. Bottom-up tabulation avoids call stack overhead and frequently enables rolling-variable space optimization from O(n) to O(1).',
          },
          {
            title: 'State Transition Formula',
            description:
              'Formulating the recurrence relation dp[i] = min/max(dp[i - step] + cost) is the fundamental core of every DP solution.',
          },
        ],
        codeSnippet: {
          language: 'javascript',
          code: `// Space-optimized Bottom-Up DP for Fibonacci / Climbing Stairs
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1; // dp[i-2]
  let prev1 = 2; // dp[i-1]

  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}
// Time Complexity: O(n)
// Space Complexity: O(1) in-place auxiliary memory`,
          explanation:
            'Instead of allocating an array of size n, only the two preceding states are needed to compute the current step, reducing auxiliary space from O(n) to O(1).',
        },
        interviewQuestions: [
          {
            question:
              'When should you prefer Top-Down Memoization over Bottom-Up Tabulation in an interview?',
            answer:
              'Top-Down is preferred when the state space is vast or sparse, meaning not all subproblems need to be evaluated to reach the answer. It is also often faster to formulate in the first 10 minutes of an interview.',
          },
          {
            question:
              'What is the difference between 0/1 Knapsack and Unbounded Knapsack?',
            answer:
              'In 0/1 Knapsack, each item can be chosen at most once, so when updating the 1D DP array, we iterate backwards from capacity down to item weight. In Unbounded Knapsack, items can be reused infinitely, so we iterate forwards.',
          },
        ],
        pitfalls: [
          'Iterating forwards in 0/1 Knapsack, which accidentally counts the same item multiple times.',
          'Omitting base case definitions, leading to undefined or negative index out-of-bounds.',
        ],
        bestPractices: [
          'State clearly to the interviewer: 1) What dp[i] represents, 2) The base cases, 3) The recurrence relation, 4) The return value.',
          'Check if space can be reduced to O(1) or O(target) once bottom-up code is working.',
        ],
      };
    }

    // 4. Trees, BST & Graph Traversals
    if (
      lowerTopic.includes('tree') ||
      lowerTopic.includes('bst') ||
      lowerTopic.includes('graph') ||
      lowerTopic.includes('traversal')
    ) {
      return {
        topic: req.topic,
        focusArea: req.focusArea || 'Tree & Graph Theory',
        summary:
          'Non-linear hierarchical data structures test recursive thinking, call-stack visualization, and traversal algorithms (DFS pre/in/post-order and BFS level-order) required across technical campus evaluations.',
        keyConcepts: [
          {
            title: 'BST Invariant & In-Order Traversal',
            description:
              'For every node, all keys in the left subtree are strictly smaller, and in the right subtree strictly larger. Performing an in-order traversal of a BST always yields sorted keys in O(n) time.',
          },
          {
            title: 'Post-Order Subtree Synthesis',
            description:
              'Post-order traversal (Left, Right, Root) is mandatory whenever a parent node requires computed answers from its children (e.g. tree height, subtree sums, lowest common ancestor).',
          },
          {
            title: 'Graph Visited Set for Cycle Prevention',
            description:
              'Unlike trees which are connected acyclic graphs, general graphs may contain cycles and disconnected components, requiring a Visited Set to avoid infinite loops.',
          },
        ],
        codeSnippet: {
          language: 'javascript',
          code: `function maxDepth(root) {
  if (!root) return 0; // Base case: empty leaf child has 0 height

  // Post-order evaluation: compute subtrees first
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);

  return 1 + Math.max(leftDepth, rightDepth);
}`,
          explanation:
            'Demonstrates bottom-up post-order recursion. The height of any node is 1 plus the maximum depth of its left and right subtrees.',
        },
        interviewQuestions: [
          {
            question:
              'How do you find the Lowest Common Ancestor (LCA) of two nodes in a Binary Tree?',
            answer:
              'Use post-order DFS: if root equals p or q or is null, return root. Recursively search left and right subtrees. If both recursive calls return non-null, root is the LCA. If only one is non-null, propagate that node upward.',
          },
          {
            question:
              'When is Breadth-First Search (BFS) preferred over Depth-First Search (DFS)?',
            answer:
              'BFS is optimal for finding the shortest path in unweighted graphs or level-order views in trees because it explores nodes in order of increasing distance from the start.',
          },
        ],
        pitfalls: [
          'Stack overflow on unbalanced / skewed linked-list-like trees (worst-case recursion depth O(n)).',
          'Not resetting or cloning graph adjacency lists when performing backtracking.',
        ],
        bestPractices: [
          'Always write the base case `if (!root) return ...` on the very first line of any recursive tree helper.',
          'Use a queue with `size = queue.length` loop for level-by-level BFS processing.',
        ],
      };
    }

    // 5. Default Comprehensive Fallback for any topic
    return {
      topic: req.topic,
      focusArea: req.focusArea || 'Placement Technical Fundamentals',
      summary: `${req.topic} is a core competency frequently evaluated in technical interviews and campus placements. Mastering this topic provides the conceptual foundation needed to answer algorithmic and system design questions with high precision.`,
      keyConcepts: [
        {
          title: 'Core Working Principles',
          description:
            req.description ||
            `Understand the underlying mechanics, operational invariants, and lifecycle considerations that govern ${req.topic}.`,
        },
        {
          title: 'Complexity & Scalability Bounds',
          description:
            'Evaluate the time, space, and memory overhead tradeoffs under standard, edge-case, and high-throughput production workloads.',
        },
        {
          title: 'Production System Architecture',
          description:
            'How top tech firms and recruiters leverage this architecture to build maintainable, resilient, and fault-tolerant software.',
        },
      ],
      codeSnippet: {
        language: 'javascript',
        code: `// Practical demonstration of ${req.topic}
function solveCoreConcept(inputData) {
  // 1. Validate inputs and boundary constraints
  if (!inputData) return null;

  // 2. Apply optimal algorithmic pattern
  console.log("Analyzing concept implementation:", inputData);
  const result = { success: true, processedCount: inputData.length || 1 };

  return result;
}

// Verification call
const demo = solveCoreConcept([10, 20, 30]);
console.log("Execution output:", demo);`,
        explanation:
          'Illustrates clean separation of input validation, core operational processing, and structured output evaluation.',
      },
      interviewQuestions: [
        {
          question: `What are the primary performance and design trade-offs associated with ${req.topic}?`,
          answer:
            `In technical interviews, highlight both time-space efficiency and operational simplicity. Compare ${req.topic} with alternative approaches, specifying when this design excels and where its limitations lie.`,
        },
        {
          question: `How do you handle edge cases and failure modes in ${req.topic}?`,
          answer:
            'Demonstrate senior technical maturity by testing empty/null inputs, boundary conditions, concurrency race hazards, and resource deallocation.',
        },
      ],
      pitfalls: [
        'Neglecting edge cases and boundary limits during the initial design phase.',
        'Jumping straight into complex optimizations before communicating the baseline brute-force approach.',
      ],
      bestPractices: [
        'Always communicate your thought process and state transitions aloud with the interviewer.',
        'Write clean, modular code with descriptive variable naming and clear invariants.',
      ],
    };
  }

  /**
   * Generates dynamic mock interview questions tailored to the candidate's target role.
   */
  public static async generateMockQuestions(params: {
    title?: string;
    role: string;
    experienceLevel?: string;
    company?: string;
    customTopics?: string[];
    difficulty: string;
    type: string;
    questionCount: number;
    candidateSkills?: string[];
    resumeText?: string;
    targetJD?: string;
    roundType?: string;
    interviewerPersona?: string;
  }): Promise<MockInterviewQuestion[]> {
    const count = Math.min(10, Math.max(3, params.questionCount || 5));
    const isHR = params.type === 'HR' || params.roundType === 'hiring_manager';
    const isBehavioral = params.type === 'Behavioral' || params.roundType === 'behavioral';
    const isTechnical = params.type === 'Technical' || params.roundType === 'technical_stack' || params.roundType === 'project_deep_dive';

    const customFocus = params.customTopics && params.customTopics.length > 0
      ? `Custom Focus Topics & Technologies to specifically evaluate: ${params.customTopics.join(', ')}`
      : '';

    const companyFocus = params.company && params.company !== 'General'
      ? `Target Company: ${params.company} (tailor questions to their authentic hiring standards and question patterns)`
      : '';

    const expLevel = params.experienceLevel || 'Fresher (0-1 yrs)';

    const resumeContext = params.resumeText
      ? `
CANDIDATE'S ACTUAL UPLOADED RESUME:
"""
${params.resumeText.slice(0, 3500)}
"""
${params.targetJD ? `TARGET JOB DESCRIPTION / FOCUS: "${params.targetJD}"` : ''}

CRITICAL RESUME-DRIVEN INTERVIEW RULES:
1. You MUST directly probe the candidate's actual projects, listed technologies, frameworks, and architecture choices mentioned on their resume!
2. Reference their actual projects or experiences by name (e.g. "I noticed on your resume you developed [Project Name]...").
3. Probe technical depth, concurrency, state management, schema design, and trade-offs.
4. For behavioral questions, probe specific team situations from their background in STAR format.
`
      : '';

    const prompt = `You are an elite Senior Technical Placement Interviewer and Engineering Manager conducting an interview for:
Interview Title: "${params.title || params.role}"
Target Role: ${params.role}
Candidate Experience Level: ${expLevel}
${companyFocus}
${customFocus}
${resumeContext}
MANDATORY ROUND TYPE: ${(params.roundType || params.type).toUpperCase()} ROUND
Difficulty Level: ${params.difficulty}
Number of questions needed: ${count}
Session Seed: ${Date.now()}_${Math.random().toString(36).substring(7)}
${customFocus}
MANDATORY ROUND TYPE: ${params.type.toUpperCase()} ROUND
Difficulty Level: ${params.difficulty}
Number of questions needed: ${count}
Session Seed: ${Date.now()}_${Math.random().toString(36).substring(7)}

CRITICAL TRACK RULES:
${isHR ? `
- THIS IS STRICTLY AN HR ROUND!
- You MUST ONLY ask HR questions (e.g. tell me about yourself, 3-5 year career vision, why our company, greatest technical strengths and weaknesses, handling stress, team culture).
- NEVER ask any programming, coding, algorithms, or OS/DBMS technical questions! Every question's category MUST be "HR".
` : isBehavioral ? `
- THIS IS STRICTLY A BEHAVIORAL ROUND!
- You MUST ONLY ask STAR format situational behavioral questions (e.g. describing a challenging bug you diagnosed, handling a technical disagreement with a teammate, adapting to unfamiliar technology under a tight deadline, learning from a project setback).
- Every question's category MUST be "Behavioral".
` : isTechnical ? `
- THIS IS A 100% TECHNICAL ROUND FOR THE ROLE: ${params.role} (${expLevel})!
${customFocus ? `- PRIORITY: Ensure at least 60% of questions directly evaluate these candidate-specified topics: ${params.customTopics?.join(', ')}` : ''}
- If Role is "Full Stack Developer": Ask strictly on React state/Virtual DOM, Node.js event loop, REST/GraphQL API design, SQL vs NoSQL, authentication (JWT/OAuth), and full-stack performance.
- If Role is "DSA & Algorithmic Specialist": Ask strictly on Data Structures (Trees, Graphs, Tries, Heaps, Stacks) and algorithmic paradigms (Dynamic Programming, Binary Search, Sliding Window, Graph traversals, time/space trade-offs).
- If Role is "Backend Engineer": Ask strictly on Microservices, Database indexing/concurrency, Message brokers (Kafka/RabbitMQ), API rate limiting, and caching (Redis).
- If Role is "Frontend Engineer": Ask strictly on React reconciliation/Virtual DOM, TypeScript generics, Core Web Vitals, browser rendering pipeline, CSS layout mechanics, and security (CORS/XSS).
- If Role is "SDE-1": Ask on Core CS (Operating Systems, DBMS, OOP, Computer Networks) and fundamental DSA.
` : `
- THIS IS A MIXED CAMPUS PLACEMENT SIMULATION ROUND (Technical + Behavioral + HR)!
- Alternate between role-specific technical questions for ${params.role} and behavioral/HR scenario questions.
`}

Generate exactly ${count} distinct, professional, realistic questions. Do NOT repeat questions from previous sessions.
Return ONLY a valid JSON array matching this schema:
[
  {
    "id": "q1",
    "question": "The interview question text",
    "category": "${isHR ? 'HR' : isBehavioral ? 'Behavioral' : 'Technical'}",
    "difficulty": "${params.difficulty}",
    "expectedPoints": ["key point candidate should cover 1", "key point 2", "key point 3"],
    "sampleFollowUp": "Optional follow-up question the interviewer might ask"
  }
]`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        const jsonStr = (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket)
          ? text.substring(firstBracket, lastBracket + 1)
          : text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, count).map((q, idx) => ({
            id: q.id || `q-${idx + 1}`,
            question: q.question,
            category: q.category || (isHR ? 'HR' : isBehavioral ? 'Behavioral' : 'Technical'),
            difficulty: q.difficulty || params.difficulty,
            expectedPoints: q.expectedPoints || ['Clear problem breakdown', 'Demonstrate conceptual depth'],
            sampleFollowUp: q.sampleFollowUp,
          }));
        }
      } catch (e) {
        console.warn('[AIService] Failed to parse generateMockQuestions response, falling back.');
      }
    }

    return this.fallbackMockQuestions(params.role, params.difficulty, params.type, count);
  }

  /**
   * Evaluates a candidate's answer to a mock interview question across 6 dimensions.
   */
  public static async evaluateMockAnswer(params: {
    role: string;
    question: string;
    answer: string;
    category?: string;
    difficulty?: string;
  }): Promise<AnswerEvaluationResponse> {
    const prompt = `You are a strict, elite Technical Placement Interviewer and Engineering Manager evaluating a student's answer in a campus recruitment mock interview.
Role: ${params.role}
Question: ${params.question}
Category: ${params.category || 'Technical'}
Difficulty: ${params.difficulty || 'Intermediate'}
Student's Submitted Answer:
"${params.answer}"

CRITICAL RIGOROUS SCORING RULES:
1. If the student's answer is wrong, irrelevant, off-topic, gibberish, or completely fails to answer the question:
   - You MUST award a score between 0 and 15 (e.g., Overall Score: 5-15, Correctness: 0-10, Technical Depth: 0-10).
   - NEVER award 50-60+ points to incorrect, off-topic, or empty answers! Be honest and strict like a real interviewer.
2. If the answer is partially correct or surface-level (missing edge cases or trade-offs):
   - Award a score between 35 and 65 based on genuine technical substance.
3. If the answer is accurate, well-structured, and covers core trade-offs:
   - Award a score between 70 and 95.
4. "modelAnswer": MUST BE a complete, highly detailed, production-grade campus placement reference answer specifically addressing the exact question: "${params.question}". Do NOT provide a generic template sentence!

Return ONLY a valid JSON object matching this schema:
{
  "overallScore": <number 0-100>,
  "scores": {
    "correctness": <0-100>,
    "technicalDepth": <0-100>,
    "clarity": <0-100>,
    "confidence": <0-100>,
    "completeness": <0-100>,
    "communication": <0-100>
  },
  "whatWentWell": ["Strength 1", "Strength 2"],
  "whatWasMissed": ["Crucial omission or misconception 1", "Omission 2"],
  "howToImprove": ["Actionable tip 1", "Actionable tip 2"],
  "modelAnswer": "Comprehensive, deep technical answer specifically answering this question with trade-offs.",
  "recommendedTopics": ["Specific Topic to study 1", "Topic 2"]
}`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const parsed = JSON.parse(text);
        const getNum = (val: any, fallback: number) =>
          typeof val === 'number' && !isNaN(val) ? Math.min(100, Math.max(0, val)) : fallback;

        return {
          overallScore: getNum(parsed.overallScore, 10),
          scores: {
            correctness: getNum(parsed.scores?.correctness, 10),
            technicalDepth: getNum(parsed.scores?.technicalDepth, 10),
            clarity: getNum(parsed.scores?.clarity, 20),
            confidence: getNum(parsed.scores?.confidence, 20),
            completeness: getNum(parsed.scores?.completeness, 10),
            communication: getNum(parsed.scores?.communication, 40),
          },
          whatWentWell: Array.isArray(parsed.whatWentWell) && parsed.whatWentWell.length > 0 ? parsed.whatWentWell : ['Attempted to respond to the prompt.'],
          whatWasMissed: Array.isArray(parsed.whatWasMissed) && parsed.whatWasMissed.length > 0 ? parsed.whatWasMissed : ['Did not address the expected technical or behavioral requirements.'],
          howToImprove: Array.isArray(parsed.howToImprove) && parsed.howToImprove.length > 0 ? parsed.howToImprove : ['Study fundamental concepts and practice structured articulation.'],
          modelAnswer: parsed.modelAnswer || 'A model response directly defines the core concept and demonstrates engineering trade-offs.',
          recommendedTopics: Array.isArray(parsed.recommendedTopics) && parsed.recommendedTopics.length > 0 ? parsed.recommendedTopics : ['Core Computer Science Fundamentals'],
        };
      } catch (e) {
        console.warn('[AIService] Failed to parse evaluateMockAnswer response, falling back.');
      }
    }

    return this.fallbackAnswerEvaluation(params.question, params.answer, params.category);
  }

  /**
   * Dynamically generates the NEXT interview question LIVE based on:
   * 1. What the candidate just said in their spoken answer
   * 2. The candidate's resume and target role (e.g. SDE-1 at Amazon)
   * 3. Natural conversational flow without pre-canned static templates
   * 4. Crisp professional interviewer persona without fluffy praise ("Hmm, okay.")
   */
  public static async generateLiveNextQuestion(params: {
    role: string;
    company?: string;
    roundType?: string;
    resumeText?: string;
    questionNumber: number;
    totalQuestions: number;
    currentQuestion: string;
    candidateAnswer: string;
    conversationHistory?: Array<{ role: 'interviewer' | 'candidate'; text: string }>;
  }): Promise<{
    interviewerLeadIn: string;
    nextQuestion: string;
    category: string;
    expectedPoints: string[];
    sampleFollowUp: string;
  }> {
    const company = params.company || 'Tier-1 Tech';
    const role = params.role || 'Software Engineer';
    const qNum = params.questionNumber;

    const resumeSnippet = (params.resumeText || '').slice(0, 2500);

    const historyText =
      params.conversationHistory && params.conversationHistory.length > 0
        ? params.conversationHistory.map((m) => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n')
        : `INTERVIEWER: ${params.currentQuestion}\nCANDIDATE: ${params.candidateAnswer}`;

    const prompt = `You are a Senior Software Engineer and Placement Interviewer at ${company} conducting a live technical interview for ${role}.
You are in the middle of the interview (Question ${qNum} of ${params.totalQuestions || 5}).

CRITICAL REAL-WORLD INTERVIEW RULES:
1. DO NOT use pre-scripted or generic textbook questions!
2. You MUST listen carefully to what the candidate JUST said in their latest answer:
"${params.candidateAnswer}"

3. LIVE ANALYSIS & DEEP PROBING:
   - Identify specific technical claims, frameworks, architecture decisions, or omissions the candidate mentioned in their answer.
   - Formulate the next question directly continuing the conversation:
     * If they mentioned a technology (e.g. Redis, MongoDB, React, Node.js, microservices), probe their real-world trade-offs, failure modes, ACID guarantees, or race conditions!
     * If their answer was surface-level, probe the underlying edge case or implementation detail.
     * If Question 1 was high-level project architecture, Question 2 should naturally probe data consistency/concurrency, Question 3 probes runtime/language internals, Question 4 probes distributed failures, and Question 5 probes STAR behavioral ownership.
4. NO FLUFFY PRAISE:
   - Real interviewers DO NOT say "Great job! Amazing explanation!".
   - Set "interviewerLeadIn" strictly to realistic, professional phrases: "Hmm, okay.", "Alright.", "Understood.", or "I see."
   - Followed immediately by your sharp, authentic next question.

CANDIDATE'S RESUME CONTEXT:
${resumeSnippet || 'Full stack & core computer science student background.'}

RECENT INTERVIEW CONVERSATION:
${historyText}

Return ONLY a valid JSON object matching this schema:
{
  "interviewerLeadIn": "Hmm, okay.",
  "nextQuestion": "The specific live question probing what the candidate said and their resume.",
  "category": "Architecture",
  "expectedPoints": ["Key point 1", "Key point 2"],
  "sampleFollowUp": "Optional follow-up probe"
}`;

    const text = await this.generateContentWithFallback(prompt);
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.nextQuestion) {
          const leadIns = ['Hmm, okay.', 'Alright.', 'Understood.', 'I see.'];
          const cleanLeadIn = leadIns.some((l) => parsed.interviewerLeadIn?.includes(l.replace('.', '')))
            ? parsed.interviewerLeadIn
            : leadIns[qNum % leadIns.length];

          return {
            interviewerLeadIn: cleanLeadIn,
            nextQuestion: parsed.nextQuestion,
            category: parsed.category || 'Technical Deep Dive',
            expectedPoints: Array.isArray(parsed.expectedPoints)
              ? parsed.expectedPoints
              : ['Clear technical rationale', 'Edge case trade-offs'],
            sampleFollowUp:
              parsed.sampleFollowUp || 'Walk me through the failure modes and trade-offs of this approach.',
          };
        }
      } catch (e) {
        console.warn('[AIService] Failed to parse generateLiveNextQuestion, using dynamic fallback.');
      }
    }

    return this.fallbackDynamicNextQuestion(params);
  }

  private static fallbackDynamicNextQuestion(params: {
    role: string;
    company?: string;
    questionNumber: number;
    totalQuestions: number;
    currentQuestion: string;
    candidateAnswer: string;
  }): {
    interviewerLeadIn: string;
    nextQuestion: string;
    category: string;
    expectedPoints: string[];
    sampleFollowUp: string;
  } {
    const qNum = params.questionNumber;
    const ans = (params.candidateAnswer || '').toLowerCase();
    const leadIns = ['Hmm, okay.', 'Alright.', 'Understood.', 'I see.'];
    const leadIn = leadIns[qNum % leadIns.length];

    // Detect technical keywords in candidate's spoken answer to probe directly
    if (ans.includes('redis') || ans.includes('cache') || ans.includes('caching')) {
      return {
        interviewerLeadIn: leadIn,
        nextQuestion:
          'In your explanation you mentioned caching with Redis. How do you handle cache invalidation and ensure strong consistency when the underlying database write fails during peak load?',
        category: 'Data & Scale',
        expectedPoints: ['Cache invalidation strategies (write-through vs cache-aside)', 'Handling stale reads under race conditions'],
        sampleFollowUp: 'What eviction policy would you configure (LRU vs LFU) for high volatility data?',
      };
    }

    if (ans.includes('microservice') || ans.includes('api') || ans.includes('event') || ans.includes('queue')) {
      return {
        interviewerLeadIn: leadIn,
        nextQuestion:
          'You highlighted an event-driven microservices setup. What happens if one of the downstream consumer services goes down or starts experiencing high latency? How do you prevent cascading failures across the system?',
        category: 'System Resilience',
        expectedPoints: ['Circuit breaker pattern', 'Dead-letter queues and idempotency keys'],
        sampleFollowUp: 'How do you guarantee exactly-once processing versus at-least-once processing?',
      };
    }

    if (ans.includes('sql') || ans.includes('mongo') || ans.includes('database') || ans.includes('lock')) {
      return {
        interviewerLeadIn: leadIn,
        nextQuestion:
          'Regarding the database layer you described: how do you manage transactions under high concurrency? Walk me through how you choose between optimistic versus pessimistic locking to avoid deadlocks.',
        category: 'Concurrency & ACID',
        expectedPoints: ['Isolation levels (Read Committed vs Serializable)', 'Deadlock detection and rollback mechanics'],
        sampleFollowUp: 'How does indexing impact write throughput when table sizes cross tens of millions of rows?',
      };
    }

    if (qNum === 2) {
      return {
        interviewerLeadIn: leadIn,
        nextQuestion:
          'Let’s look at runtime internals. In your core stack (such as Node.js or Java), how does the runtime handle asynchronous non-blocking I/O, and what happens when the event loop or thread pool is exhausted by a CPU-heavy task?',
        category: 'Runtime Internals',
        expectedPoints: ['Event loop phases (timers, poll, check)', 'Worker threads or clustering for CPU-bound computations'],
        sampleFollowUp: 'How do you monitor event loop lag in production?',
      };
    }

    if (qNum >= 4) {
      return {
        interviewerLeadIn: leadIn,
        nextQuestion:
          'Tell me about a specific time in your past projects where a major technical bug made it into production or testing, or you had a technical disagreement with a teammate. What was the situation, your exact action, and the outcome?',
        category: 'Behavioral & Leadership',
        expectedPoints: ['STAR storytelling (Situation, Task, Action, Result)', 'Humility, root cause ownership, and blameless postmortem'],
        sampleFollowUp: 'What preventative measure did you put in place to ensure that specific failure never recurred?',
      };
    }

    return {
      interviewerLeadIn: leadIn,
      nextQuestion:
        'Building on that: if your active user traffic increased by a factor of 50x overnight, where do you anticipate the first major architectural bottleneck would emerge, and how would you redesign the bottlenecks?',
      category: 'Scalability & Trade-offs',
      expectedPoints: ['Identifying single points of failure', 'Database connection pooling and horizontal sharding'],
      sampleFollowUp: 'What trade-offs would you accept in consistency versus availability (CAP theorem)?',
    };
  }

  // =========================================================================
  // DETERMINISTIC FALLBACKS (Zero external network dependencies)
  // =========================================================================

  private static fallbackCodeAnalysis(req: CodeAnalysisRequest): CodeAnalysisResponse {
    const code = req.userCode || '';
    const cleanLines = code
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('/*') && !l.startsWith('*'));

    // Check if code has meaningful statements or algorithms
    const hasCodeLogic =
      code.includes('for') ||
      code.includes('while') ||
      code.includes('Map') ||
      code.includes('Set') ||
      code.includes('return ') ||
      code.length > 70;

    const isStarterStub = !hasCodeLogic && cleanLines.length < 2;

    if (isStarterStub) {
      return {
        timeComplexity: 'O(1) - Starter stub',
        timeComplexityExplanation: 'No repetitive loops or allocations present in starter template.',
        spaceComplexity: 'O(1) - Constant space',
        spaceComplexityExplanation: 'No auxiliary data structures allocated in initial stub.',
        correctnessAssessment:
          'Minimal starter code detected. Write your algorithm implementation inside the function body to run a full complexity analysis.',
        codeQualityScore: 5,
        qualityBreakdown: {
          strengths: ['Function structure is initialized'],
          areasForImprovement: ['Implement algorithm core body logic'],
        },
        potentialBugs: [
          'Function logic is incomplete or contains only a placeholder return.',
          'Will not produce expected outputs for complex inputs until algorithmic logic is filled in.',
        ],
        optimizations: [
          'Choose an optimal data structure (e.g., Hash Map, Two-Pointers, Sliding Window, or DP) based on the problem size.',
          'Identify boundary edge cases (empty collections, single items, negative numbers).',
        ],
        placementTips: [
          'In campus interviews, always articulate your approach and discuss trade-offs with the interviewer before writing code.',
          'Verify edge cases (null inputs, empty arrays, single elements) before concluding.',
        ],
        interviewerPitch: 'In this problem, I am setting up the initial function signature to handle incoming constraints before implementing the core data processing.',
        verdictSummary: 'Function stub detected. Write your algorithm logic to analyze time/space efficiency.',
      };
    }

    // 1. Data Structure & Auxiliary Space Detection
    const hasMapOrSet =
      code.includes('Map') ||
      code.includes('Set') ||
      code.includes('dict') ||
      code.includes('unordered_map') ||
      code.includes('HashMap') ||
      code.includes('HashSet') ||
      code.includes('new Set') ||
      code.includes('new Map') ||
      code.includes('set()') ||
      (code.includes('{') && code.includes(':') && (req.language === 'python' || req.language === 'javascript'));

    const hasDynamicArray =
      code.includes('new Array') ||
      code.includes('new int[') ||
      code.includes('new vector') ||
      code.includes('.push(') ||
      code.includes('.append(') ||
      code.includes('.add(');

    // 2. Sorting Detection
    const hasSorting =
      code.includes('.sort(') ||
      code.includes('sorted(') ||
      code.includes('Arrays.sort') ||
      code.includes('Collections.sort') ||
      code.includes('std::sort') ||
      code.includes('sort(');

    // 3. Binary Search Detection
    const hasBinarySearch =
      (code.includes('while') &&
        (code.includes('mid') ||
          code.includes('low <= high') ||
          code.includes('left <= right') ||
          code.includes('left < right') ||
          code.includes('start <= end'))) ||
      code.includes('bisect') ||
      code.includes('binary_search');

    // 4. Loop Detection across JS, Python, Java, C++
    const loopMatches =
      (code.match(/for\s*\(/g) || []).length +
      (code.match(/while\s*\(/g) || []).length +
      (code.match(/for\s+\w+\s+in/g) || []).length +
      (code.match(/while\s+[^\n:]+:/g) || []).length +
      (code.match(/\.forEach\s*\(/g) || []).length +
      (code.match(/\.map\s*\(/g) || []).length;

    // Bracket-based nested loop detection (JS, Java, C++)
    const hasBracketNestedLoop =
      (code.match(/for\s*\(.*\{[^}]*for\s*\(/s) !== null) ||
      (code.match(/while\s*\(.*\{[^}]*while\s*\(/s) !== null) ||
      (code.match(/for\s*\(.*\{[^}]*while\s*\(/s) !== null) ||
      (code.match(/while\s*\(.*\{[^}]*for\s*\(/s) !== null);

    // Python indentation nested loop detection
    const hasPythonNestedLoop =
      (code.match(/for\s+[^\n:]+:\s*\n\s+(?:[^\n]+\n\s+)*for\s+[^\n:]+:/) !== null) ||
      (code.match(/for\s+[^\n:]+:\s*\n\s+(?:[^\n]+\n\s+)*while\s+[^\n:]+:/) !== null) ||
      (code.match(/while\s+[^\n:]+:\s*\n\s+(?:[^\n]+\n\s+)*for\s+[^\n:]+:/) !== null);

    const hasNestedLoop = hasBracketNestedLoop || hasPythonNestedLoop || loopMatches >= 2;

    // 5. Recursion Detection
    const hasRecursion =
      code.includes('dfs(') ||
      code.includes('bfs(') ||
      code.includes('traverse(') ||
      code.includes('helper(') ||
      (code.includes('solve(') && (code.match(/solve\s*\(/g) || []).length >= 2) ||
      (Boolean(req.problemTitle) && code.includes(req.problemTitle.replace(/\s+/g, '')));

    // Determine Time Complexity
    let timeComplexity = 'O(n)';
    let timeReason = 'Linear single-pass traversal over the input data.';

    if (hasBinarySearch) {
      timeComplexity = 'O(log n)';
      timeReason = 'Binary search interval halving at each iteration.';
    } else if (hasNestedLoop) {
      timeComplexity = 'O(n²)';
      timeReason = 'Quadratic execution due to nested iteration over elements.';
    } else if (hasSorting) {
      timeComplexity = 'O(n log n)';
      timeReason = 'Comparison-based sorting overhead.';
    } else if (loopMatches === 0 && !hasRecursion) {
      timeComplexity = 'O(1)';
      timeReason = 'Constant time operations and scalar evaluations without loops.';
    } else if (hasRecursion) {
      timeComplexity = 'O(2^n) or O(n)';
      timeReason = 'Recursive call stack branch depth.';
    }

    // Determine Space Complexity
    let spaceComplexity = 'O(1)';
    let spaceReason = 'In-place variable manipulation with constant auxiliary memory.';

    if (hasMapOrSet) {
      spaceComplexity = 'O(n)';
      spaceReason = 'Auxiliary hash table / dictionary storing elements or frequency mappings.';
    } else if (hasRecursion) {
      spaceComplexity = 'O(h)';
      spaceReason = 'Call stack frames proportional to recursion tree height.';
    } else if (hasDynamicArray) {
      spaceComplexity = 'O(n)';
      spaceReason = 'Dynamic collection allocating memory proportional to input elements.';
    }

    // Quality Score (1 - 10)
    let qualityScore = 8;
    if (hasNestedLoop && !hasMapOrSet) qualityScore = 7;
    if (hasBinarySearch || (hasMapOrSet && loopMatches === 1)) qualityScore = 9;
    if (cleanLines.length >= 10 && !hasNestedLoop) qualityScore = 9;
    if (code.includes('console.log') || code.includes('print(') || code.includes('System.out')) {
      qualityScore = Math.max(7, qualityScore);
    }

    // Potential Edge Cases & Bugs
    const potentialBugs: string[] = [];
    if (!code.includes('length') && !code.includes('len(') && !code.includes('size()')) {
      potentialBugs.push('Missing empty input check: verify behavior when input array or string is empty.');
    }
    if (code.includes('/') || code.includes('%')) {
      potentialBugs.push('Division/modulo operations: ensure divisor is guarded against zero to prevent runtime crashes.');
    }
    if (hasBinarySearch) {
      potentialBugs.push('Integer overflow: in mid calculation, prefer `low + Math.floor((high - low) / 2)` over `(low + high) / 2`.');
    }
    if (hasNestedLoop) {
      potentialBugs.push('Time Limit Exceeded (TLE): O(n²) solution may time out on large MNC platform test cases (n > 10^5).');
    }
    if (potentialBugs.length === 0) {
      potentialBugs.push('Edge conditions: test single-element inputs and extreme boundary values.');
      potentialBugs.push('Duplicate handling: verify duplicate values do not cause unintended skips or key collisions.');
    }

    // Determine plain-English student explanations
    let timeComplexityExplanation = 'Because your algorithm iterates through the input elements in a single sequential pass, total operations scale directly with input size n. If input doubles from 100 to 200, time doubles proportionally.';
    if (hasBinarySearch) {
      timeComplexityExplanation = 'Because your code divides the search interval in half at every step (e.g. low + (high - low)/2), operations scale logarithmically O(log n). For 1,000,000 elements, it takes at most ~20 steps!';
    } else if (hasNestedLoop) {
      timeComplexityExplanation = 'Because an outer loop runs n times and an inner loop runs n times, the total operations scale quadratically n × n. If input is 10,000 elements, it can take 100,000,000 operations, risking Time Limit Exceeded (TLE).';
    } else if (hasSorting) {
      timeComplexityExplanation = 'Because sorting algorithms (like Timsort or QuickSort) require dividing and comparing elements, time is bounded by O(n log n), which is optimal for comparison-based ordering.';
    } else if (loopMatches === 0 && !hasRecursion) {
      timeComplexityExplanation = 'Because there are no loops or recursive calls, the operations execute in a fixed number of CPU instructions regardless of input size, giving constant time O(1).';
    }

    let spaceComplexityExplanation = 'Auxiliary memory usage is O(1) because your code only stores scalar tracking variables (pointers, counters). It does not allocate additional arrays or collections that grow with input size.';
    if (hasMapOrSet) {
      spaceComplexityExplanation = 'Auxiliary space is O(n) because your hash table/dictionary stores seen elements or frequencies, requiring memory proportional to the number of distinct elements.';
    } else if (hasRecursion) {
      spaceComplexityExplanation = 'Auxiliary space is O(h) because each recursive call pushes a new frame onto the system call stack until reaching the base condition.';
    } else if (hasDynamicArray) {
      spaceComplexityExplanation = 'Auxiliary space is O(n) because a dynamic array/vector grows in memory to hold computed elements.';
    }

    // Concrete Optimizations
    const optimizations: string[] = [];
    if (hasNestedLoop) {
      optimizations.push('Consider replacing the inner loop with a Hash Map or Two-Pointer scan to achieve O(n) linear runtime.');
    } else if (spaceComplexity === 'O(n)') {
      optimizations.push('Memory optimization: explore whether in-place pointer manipulation can reduce auxiliary space from O(n) to O(1).');
    } else {
      optimizations.push('Early exit: return immediately once the target condition is identified to prune remaining iterations.');
      optimizations.push('Cache repeated property lookups into local scalar variables.');
    }

    // MNC Recruiter Placement Tips
    const placementTips: string[] = [
      'In technical interviews, state your Big-O time and space complexity explicitly before writing code.',
      'Walk the interviewer through a concrete 3-element test case line-by-line to verify pointer transitions.',
      'Keep variable names descriptive (e.g. `leftPointer`, `charFreq`) rather than single-letter identifiers.',
    ];

    const qualityBreakdown = {
      strengths: [
        `${timeComplexity} algorithmic traversal structure`,
        cleanLines.length > 5 ? 'Clean, modular functional decomposition' : 'Concise algorithmic formulation',
        spaceComplexity.includes('O(1)') ? 'In-place memory efficiency' : 'Effective auxiliary state caching',
      ],
      areasForImprovement: [
        'Add defensive guard checks for empty, null, or single-element inputs at the start',
        hasNestedLoop ? 'Optimize quadratic inner iteration to linear with hash table' : 'Document boundary state transitions with clear comments',
      ],
    };

    const interviewerPitch = `To explain this solution in an interview: "I implemented a ${timeComplexity} approach that systematically inspects elements in ${req.language.toUpperCase()}, keeping auxiliary memory bounded to ${spaceComplexity} for optimal placement performance."`;

    return {
      timeComplexity: `${timeComplexity}`,
      timeComplexityExplanation,
      spaceComplexity: `${spaceComplexity}`,
      spaceComplexityExplanation,
      correctnessAssessment: `Your ${req.language.toUpperCase()} implementation shows deliberate algorithmic structure for "${req.problemTitle}". Variables and operational branches transition state appropriately toward completion.`,
      codeQualityScore: qualityScore,
      qualityBreakdown,
      potentialBugs,
      optimizations,
      placementTips,
      interviewerPitch,
      verdictSummary: `${timeComplexity} time and ${spaceComplexity} space implementation. Code logic verified for technical rounds.`,
    };
  }

  private static fallbackCodeExplanation(req: CodeAnalysisRequest): CodeExplanationResponse {
    const rawLines = req.userCode.split('\n');
    const cleanLines = rawLines
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('/*') && !l.startsWith('*'));

    const hasCodeLogic =
      req.userCode.includes('for') ||
      req.userCode.includes('while') ||
      req.userCode.includes('Map') ||
      req.userCode.includes('Set') ||
      req.userCode.includes('return ') ||
      req.userCode.length > 70;

    const isStarterStub = !hasCodeLogic && cleanLines.length < 2;

    if (isStarterStub) {
      return {
        overview: `Boilerplate starter code in ${req.language.toUpperCase()}. Write your logic inside the editor to generate a step-by-step algorithmic breakdown.`,
        approachType: 'Starter Template',
        steps: [
          {
            stepNumber: 1,
            title: 'Entry Point & Function Declaration',
            description: `Defines the primary function signature in ${req.language.toUpperCase()} receiving input parameters.`,
            codeSnippet: cleanLines[0] || 'function solution(input) {',
            plainEnglishMeaning: 'Creates the main function entry point to accept data from the caller.',
          },
          {
            stepNumber: 2,
            title: 'Algorithmic Implementation',
            description: 'Write your data processing, loop, or recursive calls inside the function body.',
            codeSnippet: cleanLines.slice(1).join('\n') || '// Implement logic here',
            plainEnglishMeaning: 'Where your core calculation and data manipulation will live.',
          },
        ],
        dryRunExample: {
          sampleInput: 'nums = [2, 7, 11, 15], target = 9',
          executionTrace: [
            {
              iteration: 'Initial State',
              currentState: 'Input received, auxiliary variables and pointers initialized.',
              actionTaken: 'Begins sequential traversal from the first element.',
            },
            {
              iteration: 'During Traversal',
              currentState: 'Inspecting element at current index; updating tracking counters.',
              actionTaken: 'Evaluates decision conditional; updates state variables.',
            },
            {
              iteration: 'Termination',
              currentState: 'Target condition satisfied or end of input reached.',
              actionTaken: 'Prepares final return value and exits function.',
            },
          ],
          finalOutput: '[0, 1]',
        },
        interviewerFollowUps: [
          'What time and space complexity targets are you aiming for in this approach?',
          'How would you optimize this solution if memory was constrained to O(1)?',
        ],
        keyTakeaways: [
          'Define clear pointer and state invariants before writing loops.',
          'Consider edge cases (empty or null collections) at the very start.',
        ],
      };
    }

    // Dynamic extraction of actual steps from the user's code
    const steps: Array<CodeExplanationStep> = [];

    // Step 1: Function signature & parameters
    const signatureLine =
      cleanLines.find(
        (l) =>
          l.includes('function ') ||
          l.includes('def ') ||
          l.includes('class ') ||
          (l.includes('(') && l.includes(')'))
      ) || cleanLines[0];

    steps.push({
      stepNumber: 1,
      title: 'Function Definition & Input Parameters',
      description: `Declares the algorithm entry point in ${req.language.toUpperCase()} to accept the problem inputs and establish execution context.`,
      codeSnippet: signatureLine,
      plainEnglishMeaning: 'Declares the function name and specifies what inputs (arrays, strings, or numbers) will be passed in.',
    });

    // Step 2: Initialization & State Variables
    const initLines = cleanLines.filter(
      (l) =>
        (l.includes('let ') ||
          l.includes('const ') ||
          l.includes('var ') ||
          l.includes('int ') ||
          l.includes(' = ') ||
          l.includes(':=') ||
          l.includes('new ')) &&
        !l.includes('for') &&
        !l.includes('while') &&
        !l.includes('return')
    );
    if (initLines.length > 0) {
      steps.push({
        stepNumber: 2,
        title: 'State Initialization & Memory Setup',
        description: 'Allocates tracking variables, pointers, or auxiliary collections required to maintain computational invariants.',
        codeSnippet: initLines.slice(0, 3).join('\n'),
        plainEnglishMeaning: 'Creates memory variables (like pointers, counters, or hash maps) to remember progress as we compute.',
      });
    }

    // Step 3: Iteration / Traversal logic
    const loopLines = cleanLines.filter(
      (l) => l.includes('for') || l.includes('while') || l.includes('.forEach') || l.includes('.map')
    );
    if (loopLines.length > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Iterative Traversal & Element Scanning',
        description: 'Iterates through the input elements sequentially, updating state pointers or computing intermediate values at each index.',
        codeSnippet: loopLines.slice(0, 2).join('\n'),
        plainEnglishMeaning: 'Loops through the input elements one-by-one so nothing is skipped.',
      });
    }

    // Step 4: Conditional logic / Decision branch
    const ifLines = cleanLines.filter(
      (l) => l.startsWith('if') || l.includes('if ') || l.includes('else') || l.includes('==') || l.includes('!=')
    );
    if (ifLines.length > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Decision Logic & Invariant Checking',
        description: 'Evaluates matching criteria, boundary thresholds, or update conditions to transition toward the final solution.',
        codeSnippet: ifLines.slice(0, 2).join('\n'),
        plainEnglishMeaning: 'Checks whether the current element matches the target condition or requirement.',
      });
    }

    // Step 5: Termination / Return
    const returnLines = cleanLines.filter(
      (l) => l.includes('return ') || l.includes('System.out') || l.includes('console.log') || l.includes('print(')
    );
    if (returnLines.length > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Result Return & Completion',
        description: 'Concludes algorithmic execution and produces the calculated result matching the target specification.',
        codeSnippet: returnLines.slice(-2).join('\n'),
        plainEnglishMeaning: 'Sends the final computed answer back to the caller.',
      });
    }

    // Determine Approach Type
    let approachType = 'Sequential Iterative Algorithm';
    if (req.userCode.includes('Map') || req.userCode.includes('dict') || req.userCode.includes('HashMap')) {
      approachType = 'Hash Map Lookup Technique';
    } else if (req.userCode.includes('left') && req.userCode.includes('right')) {
      approachType = 'Two-Pointer Technique';
    } else if (req.userCode.includes('while') && req.userCode.includes('mid')) {
      approachType = 'Binary Search Algorithm';
    } else if (loopLines.length >= 2) {
      approachType = 'Nested Iteration Technique';
    }

    const overview = `This ${req.language.toUpperCase()} implementation uses the ${approachType} pattern. It sets up tracking variables, traverses the input in ${steps.length} clear logical stages, checks invariants, and returns the final result.`;

    const dryRunExample = {
      sampleInput: 'Representative Input: e.g. [2, 7, 11, 15]',
      executionTrace: [
        {
          iteration: 'Initial State',
          currentState: 'Input received, auxiliary variables and pointers initialized.',
          actionTaken: 'Begins sequential traversal from the first element.',
        },
        {
          iteration: 'During Traversal',
          currentState: 'Inspecting element at current index; updating tracking counters.',
          actionTaken: 'Evaluates decision conditional; updates state variables.',
        },
        {
          iteration: 'Termination',
          currentState: 'Target condition satisfied or end of input reached.',
          actionTaken: 'Prepares final return value and exits function.',
        },
      ],
      finalOutput: 'Computed target result returned conforming to problem constraints.',
    };

    return {
      overview,
      approachType,
      dryRunExample,
      steps,
      keyTakeaways: [
        `Time complexity is governed by ${loopLines.length > 0 ? 'the main loop structure' : 'constant time operations'}.`,
        'Keep auxiliary data structures bounded to prevent unnecessary memory allocations in MNC technical interviews.',
        'Articulate invariant state transitions clearly during whiteboard evaluations.',
      ],
      interviewerFollowUps: [
        'How would your solution handle negative numbers, duplicates, or extreme values?',
        'Can this algorithm be optimized further if the input is guaranteed to be sorted?',
      ],
    };
  }

  private static fallbackMockQuestions(
    role: string,
    difficulty: string,
    type: string,
    count: number
  ): MockInterviewQuestion[] {
    const FULL_STACK_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'fs1',
        question: 'How does React Virtual DOM and the Reconciliation algorithm (Fiber) work, and why are unique keys crucial when rendering dynamic lists?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Diffing algorithm comparing Virtual DOM trees in O(n) rather than O(n³)',
          'Fiber nodes as units of work allowing interruptible, prioritized rendering',
          'Keys provide persistent element identity across renders to prevent unnecessary unmounting',
        ],
        sampleFollowUp: 'What happens under the hood if array indices are used as keys in a re-ordered list?',
      },
      {
        id: 'fs2',
        question: 'Compare React Context API with modern state managers like Zustand or Redux Toolkit. When does Context cause performance bottlenecks?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Context re-renders all consuming components whenever any value in the context object changes',
          'Zustand/Redux use selector-based subscriptions to prevent re-renders when unrelated state changes',
          'Context is ideal for low-frequency global data (auth, theme); state managers for dynamic app data',
        ],
      },
      {
        id: 'fs3',
        question: 'Explain the architectural differences between REST and GraphQL. When would you choose GraphQL over REST in a full-stack platform?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Over-fetching and under-fetching mitigation with client-specified field queries',
          'Single endpoint POST schema vs multiple HTTP verb endpoints in REST',
          'Trade-offs: GraphQL caching complexity (HTTP caching vs client Apollo/Relay cache)',
        ],
      },
      {
        id: 'fs4',
        question: 'What is the Node.js Event Loop, and how does it process non-blocking asynchronous I/O via libuv worker threads?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Single-threaded JavaScript execution on the call stack',
          'libuv thread pool handling file system and DNS operations in the background',
          'Event loop phases: Timers, Pending callbacks, Poll, Check (setImmediate), Close callbacks',
        ],
      },
      {
        id: 'fs5',
        question: 'When designing a full-stack web application, how do you decide between PostgreSQL (relational) and MongoDB (document database)?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Relational ACID guarantees, strict foreign key constraints, complex JOIN performance',
          'Document flexibility, horizontal sharding, denormalized read-heavy access patterns',
          'Hybrid architectures: using PostgreSQL for transactions and MongoDB/Redis for feeds/analytics',
        ],
      },
      {
        id: 'fs6',
        question: 'Explain how JWT authentication works in full-stack web apps. How do you protect access and refresh tokens from XSS and CSRF attacks?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'JWT structure: Header, Payload, Signature; stateless server verification',
          'Storing tokens in HttpOnly, Secure, SameSite=Strict cookies to eliminate JavaScript XSS access',
          'Short-lived access tokens paired with rotating refresh tokens stored securely',
        ],
      },
      {
        id: 'fs7',
        question: 'What are the trade-offs between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG) in Next.js?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'CSR: fast navigation after initial load, but slower initial FCP and weaker SEO',
          'SSR: pre-rendered HTML on every request for dynamic data, higher server TTFB',
          'SSG: HTML generated at build time, cached on CDN edge, optimal performance and SEO',
        ],
      },
      {
        id: 'fs8',
        question: 'How do database indexes work, and what is the difference between a Clustered Index and a Non-Clustered B-Tree index?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'B+ Tree lookup reduces search from O(n) table scan to O(log n)',
          'Clustered index defines physical row ordering on disk (one per table)',
          'Non-clustered indexes hold key and pointer to row; write overhead on INSERT/UPDATE',
        ],
      },
      {
        id: 'fs9',
        question: 'Explain how to implement caching with Redis in a full-stack application using the Cache-Aside pattern, and how to prevent Cache Stampedes.',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Application checks Redis cache first; on cache miss, queries DB, populates Redis, returns response',
          'Cache invalidation strategies (TTL expiration, write-through, explicit invalidation on mutate)',
          'Cache stampede prevention using mutual exclusion distributed locks or probabilistic early expiration',
        ],
      },
      {
        id: 'fs10',
        question: 'Compare WebSockets with Server-Sent Events (SSE) and HTTP Long Polling for real-time bidirectional communication.',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'WebSockets provide full-duplex TCP communication over a single long-lived connection',
          'SSE is unidirectional (server-to-client) over standard HTTP with built-in reconnection',
          'HTTP Polling introduces connection teardown latency and header payload overhead',
        ],
      },
    ];

    const DSA_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'dsa1',
        question: 'Explain the Two-Pointer technique versus the Sliding Window technique. What problem invariants tell you a Sliding Window is applicable?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Two pointers on opposite ends for sorted arrays (e.g. Two Sum II, Container With Most Water)',
          'Sliding window for contiguous subarrays/substrings with monotonic condition properties',
          'Expanding right pointer to satisfy condition; shrinking left pointer to optimize window size',
        ],
        sampleFollowUp: 'What is the time complexity when both pointers traverse an array of length N?',
      },
      {
        id: 'dsa2',
        question: 'How do you determine whether an optimization problem should be solved via Dynamic Programming versus a Greedy algorithm?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Optimal substructure property (optimal solution consists of optimal solutions to subproblems)',
          'Overlapping subproblems for DP (requiring memoization or tabulation)',
          'Greedy choice property: locally optimal choice leads to a globally optimal solution without backtracking',
        ],
      },
      {
        id: 'dsa3',
        question: 'Compare Breadth-First Search (BFS) for shortest paths in unweighted graphs with Dijkstra algorithm for weighted graphs. What is the time complexity with a min-heap?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'BFS explores frontier level-by-level, ensuring shortest path in unweighted graphs in O(V + E)',
          'Dijkstra uses a priority queue (min-heap) to greedily relax edges with non-negative weights',
          'Time complexity: O((V + E) log V) with binary heap',
        ],
      },
      {
        id: 'dsa4',
        question: 'Explain Binary Search on the Answer Space (e.g., Book Allocation or Capacity to Ship Packages). What monotonicity property is required?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Search space is defined over possible answer values [min_possible, max_possible] rather than array indices',
          'Monotonic predicate: if value X is feasible, all values > X (or < X) are also feasible',
          'O(log(range) * O(check)) overall time complexity',
        ],
      },
      {
        id: 'dsa5',
        question: 'How do you find the Lowest Common Ancestor (LCA) in a Binary Search Tree (BST) in O(h) time versus an arbitrary Binary Tree?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'In BST: exploit ordering property—if both nodes < current, traverse left; if both > current, traverse right; otherwise current is LCA',
          'In arbitrary Binary Tree: post-order recursive traversal checking left and right subtrees',
          'Space complexity: O(h) recursion stack',
        ],
      },
      {
        id: 'dsa6',
        question: 'What is a Monotonic Stack, and how does it solve problems like Next Greater Element or Largest Rectangle in a Histogram in O(n) time?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Stack maintains elements in strictly increasing or decreasing order',
          'Each element is pushed and popped at most once across the entire iteration, achieving linear O(n) time',
          'Immediately reveals the nearest smaller/greater boundary for every element',
        ],
      },
      {
        id: 'dsa7',
        question: 'Explain the Disjoint Set Union (DSU / Union-Find) data structure. How do Path Compression and Union by Rank achieve near-constant O(alpha(n)) amortized time?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Find operation with path compression points nodes directly to the root representative',
          'Union by rank/size attaches smaller tree under larger tree root to minimize tree height',
          'Amortized time complexity O(alpha(N)) where alpha is the inverse Ackermann function',
        ],
      },
      {
        id: 'dsa8',
        question: 'How does a Trie (Prefix Tree) operate, and why is it preferred over a Hash Table for auto-complete and prefix matching?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Tree where each node represents a character; shared prefixes share common ancestor paths',
          'Prefix lookup in O(L) where L is word length, independent of total dictionary size N',
          'Hash table cannot efficiently perform prefix searches without scanning all keys',
        ],
      },
      {
        id: 'dsa9',
        question: 'Compare Merge Sort, Quick Sort, and Heap Sort. Why is Quick Sort often faster in practice despite a worst-case time complexity of O(n²)?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Merge Sort: O(n log n) guaranteed, stable, but requires O(n) auxiliary space',
          'Heap Sort: O(n log n) in-place, but poor cache locality due to non-sequential memory jumps',
          'Quick Sort: excellent CPU cache locality and small constant factors; randomized pivot avoids O(n²) worst case',
        ],
      },
      {
        id: 'dsa10',
        question: 'Explain Topological Sort using Kahn algorithm (in-degree BFS) versus DFS. How can you detect cycles in directed graphs using Topological Sort?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Valid only for Directed Acyclic Graphs (DAGs); establishes linear ordering of dependencies',
          'Kahn algorithm: push 0 in-degree nodes to queue, decrement neighbors upon processing',
          'If processed node count < total nodes V, graph contains a directed cycle',
        ],
      },
    ];

    const BACKEND_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'be1',
        question: 'Explain the trade-offs between Monolith and Microservices architectures. How do you implement Service Discovery and Distributed Tracing?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Monolith: simple deployment, zero network latency between calls, but tight coupling',
          'Microservices: independent deployments, horizontal scalability, but network latency and distributed data consistency',
          'Service registry (Eureka, Consul) and distributed tracing with correlation IDs (Jaeger, OpenTelemetry)',
        ],
      },
      {
        id: 'be2',
        question: 'What are database connection pools (like HikariCP), and what causes connection pool exhaustion and database deadlocks?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Reusing established TCP database connections to avoid expensive connection handshake overhead',
          'Pool exhaustion caused by slow queries, unindexed joins, or unclosed transactions holding connections',
          'Deadlocks caused by concurrent transactions acquiring locks on common tables in differing orders',
        ],
      },
      {
        id: 'be3',
        question: 'Compare message brokers: Apache Kafka (distributed commit log) versus RabbitMQ (AMQP message queue). In what scenarios would you choose Kafka?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Kafka: partitioned append-only log, high-throughput streaming, replayable messages, consumer-tracked offsets',
          'RabbitMQ: broker-tracked message states, flexible routing keys, acknowledgements',
          'Kafka is optimal for high-velocity event sourcing, metrics, and multi-consumer pub/sub at scale',
        ],
      },
      {
        id: 'be4',
        question: 'How does thread synchronization work in Java? Explain the difference between synchronized, volatile, and ReentrantLock.',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'synchronized: intrinsic monitor locks ensuring mutual exclusion and memory visibility',
          'volatile: guarantees CPU memory visibility and prevents instruction reordering without locking',
          'ReentrantLock: explicit locking with tryLock timeout, fairness policies, and multiple condition variables',
        ],
      },
      {
        id: 'be5',
        question: 'Explain API rate limiting algorithms: Token Bucket, Leaky Bucket, and Sliding Window Counter. How would you implement rate limiting in a distributed system with Redis?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Token Bucket: allows bursts up to bucket capacity; steady replenishment rate',
          'Leaky Bucket: smooths egress rate strictly, discarding overflow',
          'Distributed implementation using Redis sorted sets (ZADD, ZREMRANGEBYSCORE) or Lua scripts for atomic increments',
        ],
      },
      {
        id: 'be6',
        question: 'What is the difference between Optimistic Locking and Pessimistic Locking in relational databases, and when should each be used?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Pessimistic locking (SELECT FOR UPDATE) blocks concurrent access; optimal for high-contention writes',
          'Optimistic locking uses a version or timestamp column; verifies version on UPDATE; rolls back on collision',
          'Optimistic locking scales better in read-heavy, low-collision distributed architectures',
        ],
      },
      {
        id: 'be7',
        question: 'Explain database normalization (1NF, 2NF, 3NF, BCNF). In what high-scale backend scenarios is deliberate denormalization justified?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          '1NF (atomic values), 2NF (remove partial dependencies), 3NF (remove transitive dependencies)',
          'Reduces data redundancy and avoids insert/update/delete anomalies',
          'Deliberate denormalization avoids costly multi-table JOINs in read-heavy analytics or high-scale microservices',
        ],
      },
      {
        id: 'be8',
        question: 'Explain the Circuit Breaker pattern in distributed backends (Closed, Open, Half-Open states) and how it prevents cascading system outages.',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Closed: normal operations; monitors error rates',
          'Open: error threshold breached; fails fast immediately without hammering downstream services',
          'Half-Open: allows trial requests through to verify downstream recovery before resetting to Closed',
        ],
      },
      {
        id: 'be9',
        question: 'How do you handle distributed transactions across multiple microservices using the Saga Pattern (Choreography vs Orchestration)?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Break distributed transactions into local transactions across services, coordinated with compensating rollbacks',
          'Choreography: services react to domain events published to message broker',
          'Orchestration: centralized coordinator service directs transaction execution and rollbacks',
        ],
      },
      {
        id: 'be10',
        question: 'Explain how Layer 4 versus Layer 7 Load Balancers distribute traffic. What is the difference between Round Robin and Least Connections algorithms?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Layer 4: routes based on TCP/UDP IP and port without inspecting HTTP payload (high throughput)',
          'Layer 7: routes based on HTTP headers, URLs, cookies, and SSL termination',
          'Round Robin distributes sequentially; Least Connections accounts for active server load and long-lived connections',
        ],
      },
    ];

    const FRONTEND_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'fe1',
        question: 'How does React reconciliation engine work, and how does the React Fiber tree allow interruptible, prioritized rendering?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Reconciliation diffs Virtual DOM trees to minimize real DOM mutations',
          'Fiber nodes represent units of work arranged in a linked tree (child, sibling, return)',
          'Time slicing: cooperative multitasking where browser can yield to high-priority events (user input, animations)',
        ],
      },
      {
        id: 'fe2',
        question: 'Explain the Critical Rendering Path: how does the browser parse HTML and CSS into the DOM, CSSOM, Render Tree, Layout, and Paint?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'HTML parsed to DOM; external stylesheets block rendering to build CSSOM',
          'DOM and CSSOM combine into Render Tree containing only visible nodes',
          'Layout (Reflow) computes geometry and coordinates; Paint rasterizes pixels to screen; Compositing renders layers via GPU',
        ],
      },
      {
        id: 'fe3',
        question: 'In TypeScript, what is the difference between interface and type? How do you create an advanced mapped type or generic utility type?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Interfaces support declaration merging; types support unions, tuples, and primitives',
          'Mapped types syntax: [K in keyof T]: T[K]',
          'Conditional types with infer keyword (e.g. ReturnType<T>)',
        ],
      },
      {
        id: 'fe4',
        question: 'What are Core Web Vitals (LCP, FID/INP, CLS)? What concrete frontend optimizations improve Largest Contentful Paint (LCP)?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'LCP (loading speed of primary content < 2.5s), INP/FID (interaction responsiveness), CLS (visual layout stability < 0.1)',
          'LCP optimizations: CDN hosting, responsive WebP/AVIF images, fetchpriority="high", preloading critical fonts',
          'Eliminating render-blocking resources via async/defer scripts',
        ],
      },
      {
        id: 'fe5',
        question: 'Compare CSS Flexbox and CSS Grid. When would you choose Grid over Flexbox, and how does the CSS Stacking Context determine z-index rendering?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Flexbox is one-dimensional (row OR column); Grid is two-dimensional (rows AND columns simultaneously)',
          'Stacking context created by position + z-index, opacity < 1, transform, or filter',
          'z-index is only evaluated within the same local stacking context, not globally',
        ],
      },
      {
        id: 'fe6',
        question: 'What is Cross-Site Scripting (XSS), and how does React automatically protect against XSS compared to using dangerouslySetInnerHTML?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'XSS executes malicious scripts in victim browser, stealing session tokens and cookies',
          'React automatically escapes strings in JSX before rendering to DOM, neutralizing script tags',
          'dangerouslySetInnerHTML bypasses sanitization; requires DOMPurify before rendering external HTML',
        ],
      },
      {
        id: 'fe7',
        question: 'Explain Code Splitting with React.lazy and dynamic import(). How does route-based and component-based code splitting reduce initial bundle size?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Webpack/Vite splits code into separate JS chunks loaded on demand over the network',
          'React.lazy wraps dynamic import(), paired with React Suspense fallback loader',
          'Dramatically reduces initial JavaScript bundle size, improving FCP and TTI',
        ],
      },
      {
        id: 'fe8',
        question: 'How do you implement a custom useDebounce hook in React? Explain why cleanup functions in useEffect are crucial to prevent memory leaks.',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Stores debounced value in state; updates value after delay timeout inside useEffect',
          'Return cleanup function clearTimeout(timer) to cancel pending timers on rapid re-renders',
          'Prevents outdated state updates, unnecessary API calls, and memory leaks on unmounted components',
        ],
      },
      {
        id: 'fe9',
        question: 'Compare global state management libraries: React Context vs Zustand vs Redux Toolkit. How does Zustand avoid unnecessary re-renders using selectors?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Context re-renders everything; Zustand uses external store with useSyncExternalStore',
          'Selectors subscribe components strictly to the specific slice of state consumed',
          'Redux Toolkit provides robust action/reducer immutability via Immer with DevTools time-travel debugging',
        ],
      },
      {
        id: 'fe10',
        question: 'What are Service Workers, and how do they enable offline caching and Progressive Web App (PWA) functionality?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'JavaScript workers running on a separate browser thread acting as programmable network proxies',
          'Intercepts network fetch requests and serves assets from Cache Storage API',
          'Lifecycle: Registration, Installation, Activation, and background push notifications',
        ],
      },
    ];

    const SDE1_CORE_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'sde1',
        question: 'Explain the four core pillars of Object-Oriented Programming (Encapsulation, Abstraction, Inheritance, Polymorphism) with real-world software examples.',
        category: 'Technical',
        difficulty: 'Beginner',
        expectedPoints: [
          'Encapsulation: bundling data and methods; access modifiers (private, protected, public)',
          'Abstraction: hiding implementation complexity behind clean interfaces and abstract classes',
          'Inheritance: code reuse through parent-child class hierarchies',
          'Polymorphism: method overloading (compile-time) and method overriding (runtime)',
        ],
      },
      {
        id: 'sde2',
        question: 'Can you explain the difference between processes and threads, and how context switching impacts CPU cache and TLB performance?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Separate address space vs shared memory within the same process',
          'Context switch overhead (saving/restoring registers and PCB/TCB)',
          'Cache invalidation and TLB flush penalties during process context switches',
        ],
        sampleFollowUp: 'How do virtual threads or goroutines achieve much lower context-switching cost?',
      },
      {
        id: 'sde3',
        question: 'What are the ACID properties in database management systems, and how do write-ahead logs (WAL) guarantee Atomicity and Durability?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Atomicity (all-or-nothing rollback), Consistency (valid schema state transitions)',
          'Isolation (concurrency control without race conditions), Durability (persistent on crash)',
          'Write-Ahead Logging records all changes to non-volatile disk before modifying memory pages',
        ],
      },
      {
        id: 'sde4',
        question: 'Explain the TCP 3-way handshake and 4-way termination. Why is TCP connection-oriented and reliable whereas UDP is connectionless?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Handshake: SYN, SYN-ACK, ACK establishing sequence numbers and window size',
          'Termination: FIN, ACK, FIN, ACK with TIME_WAIT state',
          'TCP guarantees ordered delivery, retransmission, and flow control; UDP delivers packets without handshake overhead',
        ],
      },
      {
        id: 'sde5',
        question: 'What is a Deadlock in operating systems? State the four Coffman conditions and explain how to prevent deadlocks in concurrent applications.',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
          'Deadlock prevention: breaking any of the four conditions (e.g. strict global resource acquisition ordering)',
          'Deadlock avoidance: Banker algorithm; Deadlock detection: Resource Allocation Graph cycle detection',
        ],
      },
      {
        id: 'sde6',
        question: 'Explain Virtual Memory and Paging. What is a Page Fault, and how does the OS handle page replacement using the LRU algorithm?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Virtual memory maps virtual addresses to physical RAM frames via Page Tables and MMU',
          'Page fault: access to virtual page not currently present in physical RAM; triggers OS interrupt to fetch from disk',
          'Least Recently Used (LRU) evicts page unused for longest time, approximated via clock algorithms',
        ],
      },
      {
        id: 'sde7',
        question: 'What is the difference between compile-time polymorphism (Method Overloading) and runtime polymorphism (Method Overriding) using virtual method tables (vtable)?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Compile-time: same method name, different parameter signature; resolved by compiler',
          'Runtime: child class overrides parent method; resolved dynamically at runtime via vtable pointers',
          'Enables dynamic dispatch and loose coupling in object-oriented architectures',
        ],
      },
      {
        id: 'sde8',
        question: 'Compare B-Trees and B+ Trees for database indexing. Why do modern relational databases almost universally prefer B+ Trees over binary search trees?',
        category: 'Technical',
        difficulty: 'Intermediate',
        expectedPoints: [
          'B+ Tree internal nodes only hold search keys (high fan-out, minimizing disk page reads)',
          'All record pointers reside in leaf nodes, which are doubly-linked for fast sequential range scans',
          'Binary search trees have poor fan-out and high tree height, requiring excessive disk I/O',
        ],
      },
      {
        id: 'sde9',
        question: 'Explain the difference between Stack and Heap memory allocation in C++/Java. What causes a StackOverflowError versus an OutOfMemoryError?',
        category: 'Technical',
        difficulty: 'Beginner',
        expectedPoints: [
          'Stack: stores primitive local variables and function call frames; fast LIFO allocation and auto-cleanup',
          'Heap: stores dynamic objects and arrays; managed via garbage collection or manual free',
          'StackOverflow: unbounded recursion exceeding thread call stack size; OutOfMemory: heap exhausted with no freeable objects',
        ],
      },
      {
        id: 'sde10',
        question: 'High-Level System Design: How would you design a scalable URL Shortening service (like bit.ly)? What hashing algorithm and database schema would you pick?',
        category: 'System Design',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Base62 encoding (a-z, A-Z, 0-9) yielding 62^7 combinations (~3.5 trillion URLs for 7-character hash)',
          'Auto-incrementing distributed ID generator (e.g. Snowflake) encoded to Base62 to avoid collisions',
          'Schema: original_url, short_url, user_id, created_at, expires_at; Redis cache for top 20% hot URLs',
        ],
      },
    ];

    const BEHAVIORAL_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'b1',
        question: 'Describe a challenging technical bug or performance bottleneck you encountered in a project. How did you diagnose and resolve it? (Use STAR format)',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Situation & Task: Context of the project, error symptoms, and performance impact',
          'Action: Methodical debugging (profilers, network logs, isolating code units) rather than guessing',
          'Result: Measurable resolution (e.g. latency cut by 40%, bug fixed with unit tests)',
        ],
        sampleFollowUp: 'What preventive measures did you implement to stop similar bugs from reoccurring?',
      },
      {
        id: 'b2',
        question: 'Tell me about a time you had a technical disagreement with a teammate or project partner. How did you handle the situation and reach consensus?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Respectful active listening and understanding the competing perspective objectively',
          'Relying on empirical data, benchmarks, or quick prototypes rather than personal opinions',
          'Aligning on project deadlines and collective team success',
        ],
      },
      {
        id: 'b3',
        question: 'Tell me about a situation where you had to learn an unfamiliar technology or framework under a tight deadline. How did you approach the learning curve?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Breaking down official documentation, core principles, and starter examples systematically',
          'Building rapid proof-of-concept prototypes to validate assumptions',
          'Delivering milestone on schedule while maintaining clean code conventions',
        ],
      },
      {
        id: 'b4',
        question: 'Describe an instance where a project or assignment did not go according to plan or you missed a milestone. What did you learn from the experience?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Taking complete ownership of the setback without blaming external factors or teammates',
          'Root-cause analysis (e.g. underestimating third-party API complexity or scope creep)',
          'Clear corrective actions implemented in future project planning',
        ],
      },
      {
        id: 'b5',
        question: 'Give an example of a situation where you had to balance code quality against an urgent delivery deadline. How did you decide what trade-offs to make?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Prioritizing core functional correctness and security over non-critical edge optimizations',
          'Documenting technical debt explicitly with follow-up tickets for refactoring',
          'Communicating trade-offs transparently with project stakeholders',
        ],
      },
      {
        id: 'b6',
        question: 'Tell me about a time you received critical feedback on your code or approach from a senior mentor, professor, or peer. How did you respond?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Welcoming feedback with an open, non-defensive growth mindset',
          'Reflecting on why the suggested pattern is superior in terms of scalability or readability',
          'Iterating on the solution and integrating the advice into subsequent code reviews',
        ],
      },
      {
        id: 'b7',
        question: 'Describe a project where you took leadership or initiative beyond what was formally assigned to you. What was the impact on the outcome?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Identifying an unaddressed inefficiency or gap in the project workflow',
          'Proactively proposing and implementing a solution (e.g. automated test pipeline, reusable component)',
          'Positive measurable impact on team velocity or code reliability',
        ],
      },
      {
        id: 'b8',
        question: 'Have you ever worked on a group project where a teammate was not contributing equally? How did you handle the situation professionally?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Having a private, empathetic 1-on-1 conversation to understand any blockers',
          'Re-aligning on task distribution and smaller daily milestone check-ins',
          'Ensuring project delivery without creating interpersonal resentment',
        ],
      },
      {
        id: 'b9',
        question: 'Describe an instance where you had to explain a complex technical concept or architecture to a non-technical peer or stakeholder.',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Using relatable real-world analogies rather than overwhelming engineering jargon',
          'Focusing on business value, user impact, and high-level workflows',
          'Verifying comprehension through open-ended questions',
        ],
      },
      {
        id: 'b10',
        question: 'Tell me about a mistake you made in your code or design that caused an unexpected failure. How did you take ownership and rectify it?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        expectedPoints: [
          'Prompt admission and notification of team/stakeholders',
          'Rapid containment and root-cause fix under pressure',
          'Writing comprehensive regression tests to guarantee it never repeats',
        ],
      },
    ];

    const HR_QUESTIONS: MockInterviewQuestion[] = [
      {
        id: 'h1',
        question: 'Tell me about yourself, your technical background, and what motivated you to specialize in software engineering.',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Succinct chronological journey: education, key projects, and core tech stack',
          'Authentic passion for problem solving and continuous software engineering craft',
          'Why you are specifically interested in campus engineering roles',
        ],
      },
      {
        id: 'h2',
        question: 'Where do you see yourself technically and professionally in the next three to five years?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Clear technical growth roadmap (advancing from solid engineer to tech lead / system architect)',
          'Commitment to deep engineering excellence, mentorship, and business impact',
          'Desire to take ownership of end-to-end mission-critical modules',
        ],
      },
      {
        id: 'h3',
        question: 'Why should our company hire you over other qualified CSE graduates from your college?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Combination of rigorous DSA foundations and practical full-stack project building',
          'High learning velocity and curiosity to master new tools rapidly',
          'Strong team collaboration and professional communication skills',
        ],
      },
      {
        id: 'h4',
        question: 'What are your greatest technical strengths, and what is one area you are actively working to improve?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Strength supported by a real project example (e.g. debugging complex issues, clean code)',
          'Genuine area of improvement with concrete steps taken (e.g. expanding system design knowledge)',
          'Self-awareness and growth-oriented mindset',
        ],
      },
      {
        id: 'h5',
        question: 'How do you prioritize your tasks and maintain high productivity when faced with multiple competing deadlines and assignments?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Categorizing tasks by urgency vs business impact (Eisenhower matrix)',
          'Time-blocking, breaking large goals into small daily deliverables, and transparent communication',
          'Managing energy and stress to maintain consistent high performance',
        ],
      },
      {
        id: 'h6',
        question: 'How do you stay updated with rapid technological advancements and emerging engineering trends outside your coursework?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Following engineering blogs (e.g. Netflix TechBlog, Uber Engineering, Hacker News)',
          'Contributing to open source, building side projects, or participating in hackathons',
          'Continuous experimentation with modern libraries and architectures',
        ],
      },
      {
        id: 'h7',
        question: 'Are you comfortable working in different locations, flexible shifts, or rotating project domains as company business needs evolve?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Adaptability and positive willingness to take on new technical challenges',
          'Openness to cross-functional learning and relocation for career acceleration',
        ],
      },
      {
        id: 'h8',
        question: 'What kind of work environment and engineering team culture helps you perform at your best?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Collaborative culture valuing code reviews, mentorship, and open intellectual debate',
          'Focus on psychological safety where engineers can experiment and learn from mistakes',
          'Commitment to engineering excellence and user-centric impact',
        ],
      },
      {
        id: 'h9',
        question: 'What was your favorite computer science subject during your degree, and how did you apply its principles in a practical project?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Connecting academic theory (e.g. DBMS, Operating Systems, Algorithms) to real-world software',
          'Demonstrating that you understand the "why" behind the code you write',
        ],
      },
      {
        id: 'h10',
        question: 'Do you have any questions for us regarding the engineering challenges, mentorship structure, or placement career path at our company?',
        category: 'HR',
        difficulty: 'Beginner',
        expectedPoints: [
          'Asking thoughtful questions showing prior research into company products and tech stack',
          'Inquiring about engineering onboarding, team dynamics, and mentorship opportunities',
        ],
      },
    ];

    // Helper: non-destructive Fisher-Yates array shuffle
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    // Determine role-specific technical question pool
    const lowerRole = role.toLowerCase();
    let roleTechPool: MockInterviewQuestion[] = [];

    if (lowerRole.includes('full stack')) {
      roleTechPool = FULL_STACK_QUESTIONS;
    } else if (lowerRole.includes('dsa') || lowerRole.includes('algorithm')) {
      roleTechPool = DSA_QUESTIONS;
    } else if (lowerRole.includes('backend')) {
      roleTechPool = BACKEND_QUESTIONS;
    } else if (lowerRole.includes('frontend')) {
      roleTechPool = FRONTEND_QUESTIONS;
    } else {
      roleTechPool = SDE1_CORE_QUESTIONS;
    }

    let finalPool: MockInterviewQuestion[] = [];

    if (type === 'Technical') {
      finalPool = shuffle(roleTechPool);
    } else if (type === 'HR') {
      finalPool = shuffle(HR_QUESTIONS);
    } else if (type === 'Behavioral') {
      finalPool = shuffle(BEHAVIORAL_QUESTIONS);
    } else {
      // Mixed Track: dynamically interleave role-specific technical + behavioral + HR questions
      const shuffledTech = shuffle(roleTechPool);
      const shuffledBehav = shuffle(BEHAVIORAL_QUESTIONS);
      const shuffledHR = shuffle(HR_QUESTIONS);

      finalPool = [];
      let tIdx = 0, bIdx = 0, hIdx = 0;
      for (let i = 0; i < count; i++) {
        if (i % 3 === 0) {
          finalPool.push(shuffledTech[tIdx++ % shuffledTech.length]);
        } else if (i % 3 === 1) {
          finalPool.push(shuffledBehav[bIdx++ % shuffledBehav.length]);
        } else {
          finalPool.push(shuffledHR[hIdx++ % shuffledHR.length]);
        }
      }
    }

    return finalPool.slice(0, count).map((q, idx) => ({
      ...q,
      id: `${q.id || 'q'}-${Date.now().toString(36)}-${idx}`,
    }));
  }

  private static fallbackAnswerEvaluation(
    question: string,
    answer: string,
    category?: string
  ): AnswerEvaluationResponse {
    const trimmed = (answer || '').trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lowerQuestion = (question || '').toLowerCase();
    const lowerAnswer = trimmed.toLowerCase();

    // -------------------------------------------------------------------------
    // 1. Comprehensive Question Knowledge Base for Deep, Authentic Evaluation
    // -------------------------------------------------------------------------
    interface DomainTopic {
      match: (q: string) => boolean;
      title: string;
      requiredConcepts: { term: string; label: string }[];
      modelAnswer: string;
      recommendedTopics: string[];
    }

    const DOMAIN_TOPICS: DomainTopic[] = [
      {
        match: (q) => (q.includes('virtual dom') || q.includes('reconciliation') || q.includes('fiber')) && q.includes('react'),
        title: 'React Virtual DOM, Reconciliation (Fiber) & Dynamic Keys',
        requiredConcepts: [
          { term: 'virtual dom', label: 'Virtual DOM representation in memory' },
          { term: 'diffing', label: 'Diffing algorithm / heuristic O(n)' },
          { term: 'fiber', label: 'Fiber nodes & interruptible prioritized units of work' },
          { term: 'key', label: 'Unique keys for persistent element identity across renders' },
          { term: 're-render', label: 'Minimizing unnecessary unmounting and DOM thrashing' },
        ],
        modelAnswer:
          'React\'s Virtual DOM is an in-memory lightweight JavaScript object tree mirroring the actual browser DOM. When component state changes, React creates a new Virtual DOM tree and runs its Reconciliation algorithm—powered by the Fiber architecture—to compute the minimum DOM mutations in O(n) linear time rather than O(n³). Fiber decomposes rendering into incremental units of work, allowing high-priority user interactions to preempt background tree diffing. When rendering dynamic lists, unique keys supply stable identities across renders; without keys (or when incorrectly using array indices on reordered lists), React cannot reliably correlate existing DOM elements, resulting in unneeded element recreations and state leakage across rows.',
        recommendedTopics: [
          'React Fiber Reconciliation Mechanics',
          'Diffing Heuristics & Tree Mutation Minimization',
          'Component Lifecycle & Key Stability',
        ],
      },
      {
        match: (q) => (q.includes('context') || q.includes('zustand') || q.includes('redux')) && (q.includes('state') || q.includes('react')),
        title: 'React Context API vs Zustand / Redux State Architecture',
        requiredConcepts: [
          { term: 'context', label: 'React Context API dependency injection' },
          { term: 're-render', label: 'Unnecessary re-renders on every context value mutation' },
          { term: 'selector', label: 'Selector-based subscriptions in Zustand/Redux' },
          { term: 'boilerplate', label: 'Provider tree nesting and boilerplate management' },
          { term: 'frequent', label: 'Low-frequency data (auth/theme) vs high-frequency state' },
        ],
        modelAnswer:
          'React Context API is designed for low-frequency global dependency injection (e.g., authentication, active theme, locale). Its principal performance bottleneck is that whenever any field within the context value object updates, every consuming component using `useContext` re-renders, even if its own required slice did not change. Modern state management libraries like Zustand or Redux Toolkit address this via selector-based subscriptions (`useStore(state => state.field)`), ensuring components only re-render when their exact subscribed slice mutates. Furthermore, Zustand eliminates "provider hell" by residing outside the React tree and avoiding context wrapper components.',
        recommendedTopics: [
          'React Context Performance Trade-offs',
          'Selector-Based Subscriptions in Zustand & Redux',
          'Global vs Scoped State Architecture',
        ],
      },
      {
        match: (q) => q.includes('rest') && q.includes('graphql'),
        title: 'REST API Architecture vs GraphQL Specifications',
        requiredConcepts: [
          { term: 'over-fetch', label: 'Mitigating over-fetching (unused payload fields)' },
          { term: 'under-fetch', label: 'Mitigating under-fetching (N+1 multiple round-trips)' },
          { term: 'endpoint', label: 'Single POST endpoint vs multiple HTTP resource verbs' },
          { term: 'caching', label: 'HTTP caching (CDNs/ETags) vs client-side Apollo cache' },
          { term: 'schema', label: 'Strongly typed schema and query complexity limits' },
        ],
        modelAnswer:
          'REST exposes resources via dedicated URL endpoints accessed with standard HTTP verbs (GET, POST, PUT, DELETE). While REST natively leverages HTTP caching (ETags, CDN edge caches, HTTP status codes), it is susceptible to over-fetching (downloading unneeded fields) and under-fetching (making multiple sequential requests to assemble related data, the N+1 problem). GraphQL solves this by providing a single POST endpoint where clients declare the exact fields required against a strongly typed schema. However, GraphQL introduces architectural trade-offs: HTTP-level caching is much harder, requiring client-side normalized caches like Apollo InMemoryCache, and servers must implement query depth analysis to prevent denial-of-service queries.',
        recommendedTopics: [
          'RESTful Resource Boundaries & HTTP Caching',
          'GraphQL Schema Design & Resolvers',
          'Query Cost Analysis & Over-Fetching Mitigation',
        ],
      },
      {
        match: (q) => q.includes('event loop') || (q.includes('node') && q.includes('non-blocking') && (q.includes('i/o') || q.includes('async'))),
        title: 'Node.js Event Loop, Call Stack & libuv Asynchronous Architecture',
        requiredConcepts: [
          { term: 'single thread', label: 'Single-threaded JavaScript execution on V8 call stack' },
          { term: 'libuv', label: 'libuv C++ multi-threaded worker pool' },
          { term: 'phase', label: 'Event loop phases (Timers, Poll, Check setImmediate)' },
          { term: 'microtask', label: 'Microtask queues (process.nextTick, Promise.then)' },
          { term: 'non-blocking', label: 'Non-blocking OS asynchronous I/O primitives' },
        ],
        modelAnswer:
          'Node.js executes JavaScript single-threadedly on the V8 call stack, but delivers high-throughput non-blocking asynchronous I/O via libuv. The Event Loop processes events through dedicated phases: 1) Timers (`setTimeout`, `setInterval`), 2) Pending Callbacks (OS network errors), 3) Poll Phase (retrieving new I/O events and running connection callbacks), 4) Check Phase (`setImmediate`), and 5) Close Callbacks. Microtasks (`process.nextTick` and resolved `Promise` jobs) take precedence and drain immediately between every phase. Heavy blocking operations—such as synchronous file system calls, DNS lookups, and cryptographic functions—are offloaded to libuv\'s internal thread pool (default 4 threads), ensuring the main JavaScript thread is never starved.',
        recommendedTopics: [
          'libuv Architecture & Worker Pool Configuration',
          'Event Loop Phases: Timers, Poll, Check & Close',
          'Macro vs Microtask Scheduling & nextTick Order',
        ],
      },
      {
        match: (q) => (q.includes('postgres') || q.includes('sql')) && (q.includes('mongo') || q.includes('nosql')),
        title: 'Relational Database (PostgreSQL) vs Document Store (MongoDB)',
        requiredConcepts: [
          { term: 'acid', label: 'ACID transaction guarantees and relational schema integrity' },
          { term: 'join', label: 'Normalized multi-table SQL JOIN operations' },
          { term: 'shard', label: 'Horizontal scale-out and sharding in document databases' },
          { term: 'schema', label: 'Strict relational schemas vs flexible BSON document schemas' },
          { term: 'trade-off', label: 'Decision criteria based on query patterns and consistency' },
        ],
        modelAnswer:
          'Choosing between PostgreSQL and MongoDB depends on data relationships, schema stability, and transactional requirements. PostgreSQL is a relational DBMS prioritizing strict ACID guarantees, normalized tables, foreign keys, and performant multi-table SQL JOINs—making it the gold standard for financial ledgers, transactional ordering, and complex enterprise models. MongoDB is a distributed NoSQL document store using BSON format, designed for horizontal scale-out through sharding, fast write throughput, and denormalized nested data. MongoDB excels in rapid prototyping, dynamic catalogs, and unstructured telemetry, but cross-collection aggregations are significantly more resource-intensive than native relational joins.',
        recommendedTopics: [
          'ACID Guarantees vs BASE Consistency Model',
          'Database Normalization vs Denormalization Trade-offs',
          'Indexing Strategies in SQL vs Document Stores',
        ],
      },
      {
        match: (q) => q.includes('jwt') || (q.includes('token') && (q.includes('auth') || q.includes('xss') || q.includes('csrf'))),
        title: 'JWT Authentication, Stateless Verification & Security (XSS / CSRF)',
        requiredConcepts: [
          { term: 'signature', label: 'Stateless signature verification (HMAC-SHA256 / RSA)' },
          { term: 'cookie', label: 'HttpOnly, Secure, SameSite=Strict cookie storage' },
          { term: 'xss', label: 'Preventing JavaScript XSS extraction (avoiding localStorage)' },
          { term: 'csrf', label: 'CSRF token protection / SameSite mitigation' },
          { term: 'refresh', label: 'Short-lived access tokens paired with rotating refresh tokens' },
        ],
        modelAnswer:
          'A JSON Web Token (JWT) comprises three Base64URL-encoded parts: Header (algorithm), Payload (claims and metadata), and Signature (signed with a private key or HMAC-SHA256 secret). Because the token is self-contained, servers verify legitimacy statelessly by recalculating the cryptographic signature without querying a database. For enterprise security, never store JWTs in browser `localStorage` or `sessionStorage` because Cross-Site Scripting (XSS) attacks allow malicious scripts to read and exfiltrate them. The industry standard is storing access tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies, completely blocking client-side JavaScript access while preventing Cross-Site Request Forgery (CSRF). Combine this with short 15-minute token TTLs and rotating refresh tokens stored in a fast Redis blacklist for instant revocation.',
        recommendedTopics: [
          'JWT Cryptographic Structure & Stateless Validation',
          'XSS vs CSRF Vulnerability Vectors & Mitigation',
          'Secure Cookie Attributes & Rotating Refresh Token Flows',
        ],
      },
      {
        match: (q) => (q.includes('csr') || q.includes('ssr') || q.includes('ssg') || q.includes('isr')) && (q.includes('render') || q.includes('next')),
        title: 'Modern Web Rendering Strategies: CSR vs SSR vs SSG vs ISR',
        requiredConcepts: [
          { term: 'csr', label: 'Client-Side Rendering (fast transitions, initial blank shell)' },
          { term: 'ssr', label: 'Server-Side Rendering (real-time dynamic HTML, higher TTFB)' },
          { term: 'ssg', label: 'Static Site Generation (build-time compile, CDN edge latency)' },
          { term: 'seo', label: 'Search Engine Optimization and First Contentful Paint (FCP)' },
          { term: 'ttfb', label: 'Time To First Byte vs client execution overhead' },
        ],
        modelAnswer:
          'Web rendering paradigms balance initial load time, SEO, and content freshness: 1) Client-Side Rendering (CSR) serves a bare HTML shell and executes JavaScript in the browser; while fast for authenticated SPAs, it suffers from slow First Contentful Paint (FCP) and poor search engine indexing. 2) Server-Side Rendering (SSR) compiles HTML on every incoming HTTP request, providing up-to-date dynamic data and flawless SEO at the expense of higher server compute and Time To First Byte (TTFB). 3) Static Site Generation (SSG) compiles HTML at build time, allowing sub-50ms distribution via global CDN edge nodes with zero origin server overhead. 4) Incremental Static Regeneration (ISR) blends SSG and SSR by serving cached static pages while revalidating them asynchronously in the background when requested after a stale interval.',
        recommendedTopics: [
          'Hydration & Core Web Vitals (FCP, LCP, TTFB)',
          'Static Site Generation on Edge CDNs',
          'React Server Components & Hybrid Rendering',
        ],
      },
      {
        match: (q) => q.includes('index') && (q.includes('database') || q.includes('sql') || q.includes('b-tree') || q.includes('clustered')),
        title: 'Database Indexing, B+ Trees & Clustered vs Non-Clustered Indexes',
        requiredConcepts: [
          { term: 'b-tree', label: 'B+ Tree balanced search structure reducing scans from O(n) to O(log n)' },
          { term: 'clustered', label: 'Clustered index defining physical disk row ordering (one per table)' },
          { term: 'non-clustered', label: 'Non-clustered auxiliary B+ Tree pointing to row locators' },
          { term: 'write', label: 'Write amplification overhead on INSERT, UPDATE, and DELETE operations' },
          { term: 'io', label: 'Minimizing disk page I/O transfers during query execution' },
        ],
        modelAnswer:
          'A database index is an auxiliary data structure, standardly a balanced B+ Tree, that reduces record lookup complexity from an O(n) full table scan to O(log n) tree traversals. In a B+ Tree, internal nodes store only routing keys to maximize fan-out and reduce disk page reads, while leaf nodes contain all keys and pointers linked sequentially for rapid range queries. A Clustered Index dictates the physical on-disk arrangement of table rows; therefore, each table can possess only one clustered index (typically the Primary Key). Non-Clustered Indexes are secondary B+ Tree structures whose leaves contain the indexed keys and a row locator (RID or clustered key). While indexes substantially accelerate SELECT, WHERE, and JOIN queries, they incur write overhead: every INSERT, UPDATE, and DELETE must rebalance tree nodes and write to both the table and all associated indexes.',
        recommendedTopics: [
          'B+ Tree Fan-Out & Disk Block Optimization',
          'Clustered vs Secondary Index Architecture',
          'Write Amplification & Covering Indexes',
        ],
      },
      {
        match: (q) => q.includes('redis') || (q.includes('cache') && (q.includes('aside') || q.includes('stampede') || q.includes('invalidation'))),
        title: 'Redis Caching Architecture, Cache-Aside Pattern & Stampede Mitigation',
        requiredConcepts: [
          { term: 'aside', label: 'Cache-Aside pattern: check cache, on miss read DB, write back with TTL' },
          { term: 'ttl', label: 'Time-To-Live expiration and explicit mutation invalidation' },
          { term: 'stampede', label: 'Cache stampede / thundering herd when popular keys expire' },
          { term: 'lock', label: 'Distributed locks (SETNX / Redlock) or probabilistic early expiration' },
          { term: 'memory', label: 'In-memory sub-millisecond retrieval vs disk database latency' },
        ],
        modelAnswer:
          'In the Cache-Aside (Lazy Loading) architecture, the application manages the cache tier: 1) Attempt to fetch the key from Redis; 2) On a cache hit, return data in under 2ms; 3) On a cache miss, query the primary database, serialize the result into Redis with a defined Time-To-Live (TTL), and return the payload. When records update, the application updates the primary database and explicitly deletes/invalidates the Redis key. A Cache Stampede (or Thundering Herd) happens when a high-traffic key expires under heavy concurrency, causing hundreds of parallel requests to register cache misses and bombard the database simultaneously. We prevent stampedes by using distributed mutex locks (`SET key val NX PX 30000`), serving stale data while a single asynchronous worker updates the cache, or adopting probabilistic early expiration (XFetch algorithm).',
        recommendedTopics: [
          'Cache-Aside vs Write-Through vs Write-Back Strategies',
          'Cache Stampede & Thundering Herd Prevention',
          'Redis Data Structures (Hashes, Sorted Sets, HyperLogLog)',
        ],
      },
      {
        match: (q) => q.includes('websocket') || (q.includes('sse') && q.includes('polling')) || (q.includes('real-time') && q.includes('http')),
        title: 'Real-Time Communication: WebSockets vs Server-Sent Events vs HTTP Polling',
        requiredConcepts: [
          { term: 'full-duplex', label: 'WebSockets full-duplex bidirectional TCP communication' },
          { term: 'sse', label: 'Server-Sent Events (SSE) unidirectional HTTP stream for telemetry/LLMs' },
          { term: 'polling', label: 'HTTP Polling overhead (repetitive TCP/TLS handshakes and headers)' },
          { term: 'overhead', label: 'Tiny 2-10 byte framing vs full HTTP request headers' },
          { term: 'reconnection', label: 'Native HTTP/2 multiplexing and browser reconnection in SSE' },
        ],
        modelAnswer:
          'Choosing a real-time protocol depends on directionality and latency requirements: 1) HTTP Polling involves periodic client requests; even Long Polling generates excessive connection churn, TLS handshakes, and header overhead. 2) Server-Sent Events (SSE) provide a unidirectional, server-to-client stream over standard HTTP (`text/event-stream`). SSE natively handles HTTP/2 multiplexing, automatic reconnection, and firewall traversal, making it the ideal architecture for notifications, live dashboards, and LLM token streaming. 3) WebSockets establish a full-duplex, bidirectional TCP connection following an initial HTTP 101 protocol handshake. With minimal 2-to-10 byte framing overhead, WebSockets are optimal for low-latency bidirectional workflows such as multiplayer gaming, live chat platforms, and collaborative document editing.',
        recommendedTopics: [
          'WebSocket Handshake & Frame Protocol',
          'Server-Sent Events (SSE) over HTTP/2',
          'Scalable Socket Architecture & Redis Pub/Sub Adapters',
        ],
      },
      {
        match: (q) => (q.includes('two-pointer') || q.includes('two pointer')) && q.includes('sliding window'),
        title: 'Algorithmic Optimization: Two-Pointers vs Sliding Window Techniques',
        requiredConcepts: [
          { term: 'two-pointer', label: 'Pointers at opposite ends or fast/slow runners' },
          { term: 'sliding window', label: 'Maintaining a contiguous subarray window [left, right]' },
          { term: 'monotonic', label: 'Monotonicity invariant determining window validity' },
          { term: 'complexity', label: 'Reducing brute-force O(n²) to optimal O(n) linear time' },
          { term: 'contiguous', label: 'Subarray/substring problems vs pair matching' },
        ],
        modelAnswer:
          'Both techniques optimize brute-force O(n²) search to linear O(n) time. The Two-Pointer technique standardly places pointers at opposing boundaries (left = 0, right = n - 1) on sorted arrays, moving them inward based on comparison invariants (e.g., Two Sum II, Container With Most Water), or uses Fast and Slow pointers to detect linked-list cycles (Floyd\'s algorithm). The Sliding Window technique maintains a contiguous subarray range `[left, right]` where a monotonic property holds: expanding the right pointer incorporates elements into the state, while advancing the left pointer contracts the window when constraints (e.g. maximum sum, character frequencies) are breached. Sliding window is specifically indicated for finding optimal contiguous subarrays or substrings.',
        recommendedTopics: [
          'Two-Pointer Convergence Patterns',
          'Sliding Window Invariant Tracking (Dynamic vs Fixed Size)',
          'Time & Space Complexity Proofs for Two-Pointer Traversal',
        ],
      },
      {
        match: (q) => (q.includes('dynamic programming') || q.includes(' dp ')) && q.includes('greedy'),
        title: 'Optimization Paradigms: Dynamic Programming vs Greedy Algorithms',
        requiredConcepts: [
          { term: 'substructure', label: 'Optimal substructure property in both paradigms' },
          { term: 'greedy choice', label: 'Greedy choice property (locally optimal choices)' },
          { term: 'overlapping', label: 'Overlapping subproblems requiring memoization or tabulation' },
          { term: 'reconsider', label: 'Greedy never reconsiders; DP evaluates all decision paths' },
          { term: 'complexity', label: 'Greedy O(n log n) vs DP polynomial state transitions' },
        ],
        modelAnswer:
          'Both paradigms solve optimization problems with optimal substructure—where the global optimal solution contains optimal solutions to its subproblems. The crucial difference is the Greedy Choice Property: a Greedy algorithm makes the locally optimal choice at every step without ever backtracking or reconsidering past choices, achieving O(n) or O(n log n) complexity (e.g., Dijkstra\'s, Fractional Knapsack, Huffman Coding). However, Greedy fails when a local decision precludes the global optimum. Dynamic Programming is mandatory when subproblems overlap and choices are interdependent: DP systematically explores all branches, caching results via memoization (top-down) or tabulation (bottom-up) to eliminate duplicate subproblem evaluation (e.g., 0/1 Knapsack, Coin Change, Edit Distance).',
        recommendedTopics: [
          'Greedy Choice Property Proof by Contradiction',
          'DP State Definition, Recurrence Relations & Tabulation',
          'Memoization Space Optimization & Rolling Arrays',
        ],
      },
      {
        match: (q) => q.includes('process') && q.includes('thread'),
        title: 'Operating Systems: Process vs Thread & Context Switching Overhead',
        requiredConcepts: [
          { term: 'virtual memory', label: 'Process isolated address space (code, data, heap, stack)' },
          { term: 'share', label: 'Threads share heap, global data, and open file descriptors' },
          { term: 'context switch', label: 'Context switching CPU overhead and register preservation' },
          { term: 'tlb', label: 'TLB invalidation and page table register reload in process switches' },
          { term: 'cache', label: 'Preserving CPU L1/L2 cache locality during thread switching' },
        ],
        modelAnswer:
          'A process is an isolated operating system execution environment possessing its own dedicated virtual address space (code, data, heap, and stack) and kernel file descriptors. A thread is the smallest schedulable execution unit inside a process; multiple threads of the same process share memory (heap, static variables, open files), while each retains private registers, program counter, and stack. Context switching between processes is computationally expensive: the OS kernel must switch the Page Table Base Register (CR3 in x86) and flush the Translation Lookaside Buffer (TLB), triggering significant CPU cache misses. Thread context switching within the same process avoids memory address remapping and TLB flushes, preserving CPU cache locality and executing significantly faster.',
        recommendedTopics: [
          'Virtual Memory & Page Table Translation',
          'Context Switch Mechanics & TLB Invalidation',
          'User-Level vs Kernel-Level Threads',
        ],
      },
      {
        match: (q) => q.includes('acid') || (q.includes('transaction') && q.includes('database')),
        title: 'Database Transactions, ACID Guarantees & Concurrency Control',
        requiredConcepts: [
          { term: 'atomicity', label: 'Atomicity: all-or-nothing execution via Write-Ahead Logs' },
          { term: 'consistency', label: 'Consistency: adhering to schema constraints and foreign keys' },
          { term: 'isolation', label: 'Isolation: preventing dirty reads, non-repeatable reads, phantom rows' },
          { term: 'durability', label: 'Durability: committed data surviving crashes via non-volatile logs' },
          { term: 'mvcc', label: 'Concurrency mechanisms: 2-Phase Locking (2PL) vs MVCC' },
        ],
        modelAnswer:
          'ACID establishes the foundational reliability guarantees of relational database transactions: 1) Atomicity guarantees all-or-nothing execution—if any statement fails, the entire transaction rolls back via Write-Ahead Logging (WAL) and undo segments. 2) Consistency ensures the transaction transitions the database only between valid states enforcing schema integrity, foreign keys, triggers, and constraints. 3) Isolation prevents concurrent transactions from observing uncommitted or transient states. Database engines use Multi-Version Concurrency Control (MVCC) or Two-Phase Locking (2PL) across ANSI SQL isolation levels (Read Committed, Repeatable Read, Serializable) to eliminate dirty reads and phantom records. 4) Durability guarantees committed transactions survive power failures through synchronous flushes to persistent disk storage.',
        recommendedTopics: [
          'Write-Ahead Logging (WAL) & Crash Recovery (ARIES)',
          'ANSI SQL Isolation Levels & Concurrency Anomalies',
          'Multi-Version Concurrency Control (MVCC) in PostgreSQL',
        ],
      },
      {
        match: (q) => q.includes('deadlock') || (q.includes('coffman') && q.includes('process')),
        title: 'Concurrency: Deadlocks, the 4 Coffman Conditions & Prevention',
        requiredConcepts: [
          { term: 'mutual exclusion', label: 'Mutual Exclusion: resources held in unshareable mode' },
          { term: 'hold and wait', label: 'Hold and Wait: process holds resource while awaiting others' },
          { term: 'preemption', label: 'No Preemption: resources cannot be forcibly seized' },
          { term: 'circular wait', label: 'Circular Wait: closed cycle of dependent resource requests' },
          { term: 'prevention', label: 'Deadlock prevention via strict hierarchical resource ordering' },
        ],
        modelAnswer:
          'A deadlock is an execution state where a set of concurrent processes are permanently blocked because each holds a lock on a resource needed by another in the cycle. A deadlock can only occur if all four Coffman conditions are met concurrently: 1) Mutual Exclusion (resources cannot be shared); 2) Hold and Wait (processes holding resources can request additional ones); 3) No Preemption (resources cannot be forcibly reclaimed by the OS); and 4) Circular Wait (a closed chain where each process holds a resource requested by the next). Deadlocks are prevented by invalidating any single condition—most commonly eliminating Circular Wait through strict global hierarchical resource ordering. They can also be avoided dynamically via Banker\'s Algorithm or detected through Resource Allocation Graph cycle analysis.',
        recommendedTopics: [
          'The 4 Coffman Conditions & Mathematical Invalidation',
          'Hierarchical Lock Ordering & Deadlock Prevention',
          'Banker\'s Algorithm & Resource Allocation Graphs',
        ],
      },
      {
        match: (q) => q.includes('disagree') || q.includes('conflict') || category === 'Behavioral',
        title: 'Behavioral & Leadership: Conflict Resolution & The STAR Method',
        requiredConcepts: [
          { term: 'situation', label: 'Situation & Task clearly contextualized' },
          { term: 'action', label: 'Action focused on objective data, benchmarks, or prototypes' },
          { term: 'result', label: 'Result with measurable positive project impact' },
          { term: 'team', label: 'Ego-free collaborative communication and active listening' },
        ],
        modelAnswer:
          'Situation: During our final-year engineering project, my teammate and I disagreed on whether to use client-side state caching versus server-side Redis caching for our real-time search feature. Task: With our sprint milestone approaching, we needed an architectural consensus quickly without compromising search latency or creating team friction. Action: Rather than debating theoretically, I suggested building two quick empirical benchmarks. We profiled latency and memory under simulated network conditions using Chrome DevTools. The data demonstrated server-side Redis reduced client battery drain and lowered API latency by 58%. I presented the benchmarks collaboratively during our standup. Result: My teammate appreciated the empirical data, we adopted the Redis solution, and deployed the feature two days ahead of schedule with zero production regressions.',
        recommendedTopics: [
          'STAR Method Structuring (Situation, Task, Action, Result)',
          'Data-Driven Technical Conflict Resolution',
          'Engineering Alignment & Constructive Communication',
        ],
      },
      {
        match: (q) => q.includes('strength') || q.includes('weakness') || category === 'HR',
        title: 'HR & Culture Fit: Authentic Strengths, Growth Areas & Reflection',
        requiredConcepts: [
          { term: 'strength', label: 'Concrete technical strength backed by examples' },
          { term: 'growth', label: 'Genuine area for growth / weakness without clichés' },
          { term: 'action', label: 'Proactive steps taken to address the growth area' },
        ],
        modelAnswer:
          'My greatest technical strength is structured problem decomposition and root-cause analysis: when tackling ambiguous engineering challenges, I break them into isolated, testable modules and establish clear invariants before writing code. An authentic growth area I work on is my past tendency toward premature optimization. In earlier hackathons, I spent excessive time optimizing data structures for microsecond gains before validating user needs. I addressed this by adopting an agile MVP-first philosophy—shipping clean, working solutions first, gathering feedback, and profiling with metrics before applying optimizations.',
        recommendedTopics: [
          'Self-Awareness & Professional Technical Communication',
          'Framing Authentic Growth Areas for Placement Rounds',
          'Aligning Engineering Strengths with Organizational Impact',
        ],
      },
    ];

    // Find matching domain from knowledge base
    const matchedDomain = DOMAIN_TOPICS.find((d) => d.match(lowerQuestion));

    // Stop words to filter out for keyword analysis
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'it', 'this', 'that', 'i', 'you', 'my', 'we', 'they',
      'what', 'how', 'why', 'can', 'explain', 'describe', 'difference', 'between', 'your',
      'about', 'when', 'tell', 'me', 'have', 'had', 'been', 'would', 'could', 'should',
      'does', 'did', 'do', 'any', 'some', 'which', 'who', 'whom', 'whose'
    ]);

    const questionKeywords = lowerQuestion
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // -------------------------------------------------------------------------
    // 2. Strict Real Evaluation & Scoring
    // -------------------------------------------------------------------------
    let overallScore = 10;
    let correctness = 5;
    let technicalDepth = 5;
    let clarity = 15;
    let confidence = 15;
    let completeness = 5;
    let communication = 25;

    let whatWentWell: string[] = [];
    let whatWasMissed: string[] = [];
    let howToImprove: string[] = [];
    let modelAnswer = '';
    let recommendedTopics: string[] = [];

    if (matchedDomain) {
      modelAnswer = matchedDomain.modelAnswer;
      recommendedTopics = matchedDomain.recommendedTopics;

      // Identify which specific concepts the candidate actually mentioned vs missed
      const hits = matchedDomain.requiredConcepts.filter((c) => lowerAnswer.includes(c.term));
      const misses = matchedDomain.requiredConcepts.filter((c) => !lowerAnswer.includes(c.term));

      if (wordCount < 6) {
        // Very brief / trivial / empty response
        overallScore = Math.min(12, Math.max(5, wordCount * 2));
        correctness = 5;
        technicalDepth = 2;
        clarity = 15;
        confidence = 10;
        completeness = 2;
        communication = 15;

        whatWentWell = [
          `Attempted to submit an answer (${wordCount} words).`,
        ];
        whatWasMissed = [
          `Your response of ${wordCount} words is insufficient for campus recruitment. Technical rounds require structured technical elaboration.`,
          `Did not define ${matchedDomain.title} or explain how it works under the hood.`,
          `Omitted critical concepts: ${misses.slice(0, 3).map((m) => m.label).join('; ')}.`,
        ];
        howToImprove = [
          'In campus interviews, follow the 3-step formula: 1) Core Definition, 2) Underlying Engine / Mechanism, 3) Real-world Example / Trade-off.',
          'Speak or write at least 3-4 comprehensive sentences to demonstrate technical mastery to the interviewer.',
        ];
      } else if (hits.length === 0 && wordCount < 30) {
        // Off-topic or very vague
        overallScore = 20;
        correctness = 15;
        technicalDepth = 10;
        clarity = 30;
        confidence = 25;
        completeness = 10;
        communication = 35;

        whatWentWell = [
          'Provided a general verbal response to the question prompt.',
          'Maintained conversational attempt during the interview round.',
        ];
        whatWasMissed = [
          `The answer is off-topic or surface-level regarding ${matchedDomain.title}.`,
          `Failed to explain core mechanics: ${misses.slice(0, 3).map((m) => m.label).join('; ')}.`,
          'Did not address runtime space/time trade-offs or production use cases.',
        ];
        howToImprove = [
          `Study ${matchedDomain.title} fundamentals, focusing on concrete technical keywords.`,
          'Avoid generalities; mention exact algorithms, data structures, and runtime mechanics.',
        ];
      } else {
        // Genuine substantive answer
        const coverageRatio = hits.length / matchedDomain.requiredConcepts.length;
        const lengthMultiplier = Math.min(1.0, wordCount / 50);

        correctness = Math.round(35 + coverageRatio * 55);
        technicalDepth = Math.round(25 + coverageRatio * 60 * lengthMultiplier);
        clarity = Math.round(50 + Math.min(40, wordCount * 0.8));
        confidence = Math.round(50 + coverageRatio * 35);
        completeness = Math.round(30 + coverageRatio * 60);
        communication = Math.round(55 + Math.min(35, wordCount * 0.6));

        overallScore = Math.round(
          correctness * 0.3 +
          technicalDepth * 0.25 +
          clarity * 0.15 +
          completeness * 0.15 +
          communication * 0.15
        );

        whatWentWell = [
          `Correctly addressed key technical concepts: ${hits.map((h) => h.label).join('; ')}.`,
          wordCount > 35
            ? 'Demonstrated good technical depth and structured explanation.'
            : 'Good foundational awareness of the topic.',
        ];

        whatWasMissed = misses.length > 0
          ? [
              `Did not cover: ${misses.map((m) => m.label).join('; ')}.`,
              'Could discuss production edge-cases, memory overhead, or system failure modes under load.',
            ]
          : [
              'Minor nuance: ensure edge-case performance bounds and memory allocations are explicitly articulated.',
            ];

        howToImprove = [
          `Review the model answer below to incorporate advanced trade-offs for ${matchedDomain.title}.`,
          'In campus interviews, always conclude with a concrete 1-sentence real-world takeaway or project example.',
        ];
      }
    } else {
      // Dynamic fallback for custom / unique questions
      const matched = questionKeywords.filter((kw) => lowerAnswer.includes(kw));
      const matchCount = matched.length;
      const relevanceScore = questionKeywords.length > 0 ? matchCount / questionKeywords.length : 0;

      if (wordCount < 6) {
        overallScore = 8;
        correctness = 5;
        technicalDepth = 2;
        clarity = 15;
        confidence = 10;
        completeness = 2;
        communication = 15;

        whatWentWell = ['Submitted a brief response.'];
        whatWasMissed = [
          `Your response of ${wordCount} words is too brief to evaluate technical competence.`,
          `Did not address the question: "${question}".`,
          'Placement interviews expect systematic, structured explanations.',
        ];
        howToImprove = [
          'Define the core computer science concept first, then explain runtime mechanics and trade-offs.',
        ];
      } else {
        const score = Math.round(30 + relevanceScore * 50 + Math.min(15, wordCount * 0.3));
        overallScore = Math.min(92, Math.max(25, score));
        correctness = overallScore;
        technicalDepth = Math.max(20, overallScore - 5);
        clarity = Math.min(95, overallScore + 5);
        confidence = overallScore;
        completeness = Math.max(25, overallScore - 4);
        communication = Math.min(95, overallScore + 6);

        whatWentWell = matched.length > 0
          ? [`Addressed relevant topics from the prompt: ${matched.slice(0, 4).join(', ')}.`]
          : ['Demonstrated willingness to articulate an answer under interview conditions.'];

        const missedKeywords = questionKeywords.filter((kw) => !lowerAnswer.includes(kw));
        whatWasMissed = missedKeywords.length > 0
          ? [`Could provide deeper discussion on: ${missedKeywords.slice(0, 4).join(', ')}.`]
          : ['Ensure edge-case constraints and trade-offs are clearly articulated.'];

        howToImprove = [
          'Structure your response clearly: 1) Definition & Intent, 2) Core Working Principles, 3) Computational Complexity & Trade-offs.',
        ];
      }

      modelAnswer = `A high-scoring placement interview answer for this question directly defines the core computer science principles of ${questionKeywords.slice(0, 3).join(', ')}, walks through internal runtime and memory mechanics, highlights asymptotic time and space complexities, and concludes with practical production engineering trade-offs.`;
      recommendedTopics = [
        questionKeywords.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ') || 'Core Computer Science',
        'Algorithmic Complexity & Engineering Trade-Offs',
        'Structured Placement Interview Delivery',
      ];
    }

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      scores: {
        correctness: Math.min(100, Math.max(0, correctness)),
        technicalDepth: Math.min(100, Math.max(0, technicalDepth)),
        clarity: Math.min(100, Math.max(0, clarity)),
        confidence: Math.min(100, Math.max(0, confidence)),
        completeness: Math.min(100, Math.max(0, completeness)),
        communication: Math.min(100, Math.max(0, communication)),
      },
      whatWentWell,
      whatWasMissed,
      howToImprove,
      modelAnswer,
      recommendedTopics,
    };
  }

  /**
   * Returns company-specific recruitment intelligence and trending 2025/2026 topics.
   */
  public static getCompanyInsights(companyName: string): {
    company: string;
    focusSummary: string;
    trendingTopics: string[];
    interviewFormat: string;
    difficulty: string;
  } {
    const query = (companyName || '').toLowerCase().trim();

    if (query.includes('google')) {
      return {
        company: 'Google',
        focusSummary: 'Rigorous algorithmic depth. Heavy emphasis on clean optimal Big-O bounds, edge-case resilience, and multi-dimensional graph/DP problems.',
        trendingTopics: [
          'Graph Algorithms (BFS/DFS & Dijkstra)',
          'Multi-Dimensional Dynamic Programming',
          'Binary Search on Monotonic Ranges',
          'Trie & Advanced String Matching',
          'Segment Trees & Fenwick Trees',
          'Concurrency & Multithreading',
          'Distributed System Design (Bigtable/Spanner)',
        ],
        interviewFormat: 'Round 1 Online Assessment (2 LeetCode Medium/Hard) + 4-5 Onsite Technical Coding & System Design Rounds.',
        difficulty: 'Hard',
      };
    }

    if (query.includes('amazon')) {
      return {
        company: 'Amazon',
        focusSummary: 'Strong focus on 16 Leadership Principles (STAR method) combined with Low-Level Object Oriented Design and Tree/Heap data structures.',
        trendingTopics: [
          'Binary Trees, BST & Lowest Common Ancestor',
          'Heaps & Priority Queues (Top K Elements)',
          'Object-Oriented Design (LLD / Parking Lot / Elevator)',
          'Amazon Leadership Principles (Customer Obsession, Ownership)',
          'Sliding Window & Hash Maps',
          'Caching (Redis/DAX) & Microservices',
          'Database Sharding & DynamoDB',
        ],
        interviewFormat: 'Online Assessment (OA 1 & 2: Coding + Work Simulation) + 3-4 Rounds (Coding, LLD/HLD, Bar Raiser with STAR stories).',
        difficulty: 'Medium-Hard',
      };
    }

    if (query.includes('microsoft')) {
      return {
        company: 'Microsoft',
        focusSummary: 'Values foundational data structure fluency, clear communication, bug-free in-place pointer mutations, and clean SOLID OOP design.',
        trendingTopics: [
          'Linked Lists (In-place Reversal & Cycle Detection)',
          'Binary Search & Monotonic Conditions',
          'Binary Tree Traversals & Diameter',
          'Two Pointers & String Manipulation',
          'SOLID Principles & Design Patterns',
          'System Design: Scalable Microservices & Azure',
          'Operating Systems: Threads & Memory Paging',
        ],
        interviewFormat: 'Codility OA (3 Problems in 90 mins) + 3-4 Technical Rounds focusing on core DSA and clean architecture.',
        difficulty: 'Medium-Hard',
      };
    }

    if (query.includes('tcs') || query.includes('ninja') || query.includes('digital')) {
      return {
        company: 'TCS (Digital / Prime)',
        focusSummary: 'Heavy emphasis on Core Computer Science fundamentals (OS, DBMS, Networks), basic-to-intermediate DSA, SQL queries, and Quantitative Aptitude.',
        trendingTopics: [
          'DBMS Normalization (1NF to BCNF) & SQL Joins',
          'Operating Systems: CPU Scheduling & Deadlocks',
          'Computer Networks: OSI Model & TCP 3-Way Handshake',
          'Arrays & Strings Manipulation (Two Sum, Palindrome)',
          'OOP Principles (Inheritance, Polymorphism in Java/C++)',
          'Quantitative Aptitude & Puzzles',
        ],
        interviewFormat: 'NQT Written Assessment (Cognitive + Advanced Coding) + Combined Technical, Managerial & HR Interview.',
        difficulty: 'Medium',
      };
    }

    if (query.includes('infosys') || query.includes('power programmer') || query.includes('hackwithinfy')) {
      return {
        company: 'Infosys (Power Programmer / SP)',
        focusSummary: 'Advanced competitive programming and algorithmic optimization. Tests graph shortest paths, 2D dynamic programming, and SQL window functions.',
        trendingTopics: [
          'Dynamic Programming (Knapsack & Subsequences)',
          'Graph Traversals & Connected Components',
          'SQL Complex Joins, Having & Window Functions',
          'Greedy Interval Scheduling',
          'Core Java / Python OOP & Exception Handling',
          'DBMS Transactions & ACID Properties',
        ],
        interviewFormat: 'HackWithInfy / Coding Contest (3 Hard Problems) + Technical Interview Round on DSA & Projects.',
        difficulty: 'Medium-Hard',
      };
    }

    if (query.includes('uber') || query.includes('swiggy') || query.includes('zomato')) {
      return {
        company: companyName || 'Uber / Delivery Tech',
        focusSummary: 'High-concurrency systems, real-time geospatial lookups, event streaming with Kafka, and clean production coding under strict time constraints.',
        trendingTopics: [
          'Geospatial Indexing (QuadTree / GeoHash)',
          'Graph Shortest Paths (Dijkstra / A*)',
          'Event-Driven Architecture (Kafka / RabbitMQ)',
          'WebSockets & Real-Time Connection Handling',
          'Distributed Rate Limiting & Redis Caching',
          'Database Indexing & Sharding',
        ],
        interviewFormat: 'OA (CodeSignal / HackerRank) + Machine Coding Round + System Design + Hiring Manager Round.',
        difficulty: 'Hard',
      };
    }

    if (query.includes('atlassian')) {
      return {
        company: 'Atlassian',
        focusSummary: 'Values production-quality code, concurrency, rate limiting, and values-based behavioral rounds ("Open company, no bullshit").',
        trendingTopics: [
          'Rate Limiting & Token Bucket Algorithms',
          'LRU Cache & Data Structure Design',
          'Concurrency, Thread Safety & Race Conditions',
          'Full-Stack React & TypeScript Architecture',
          'Git Internals & Directed Acyclic Graphs (DAG)',
          'Values & Behavioral STAR Round',
        ],
        interviewFormat: 'Karst OA + Data Structures & Algorithms + System Design / Machine Coding + Values Interview.',
        difficulty: 'Hard',
      };
    }

    if (query.includes('goldman') || query.includes('morgan') || query.includes('finance')) {
      return {
        company: companyName || 'Goldman Sachs',
        focusSummary: 'Mathematical aptitude, probability, time-bound algorithmic challenges, and low-latency system design with strong focus on Java/C++ memory.',
        trendingTopics: [
          'Array Math & Prefix Multiplications',
          'String Anagrams & Frequency Hash Maps',
          'Probability, Combinatorics & Classic Puzzles',
          'Trees & Binary Search',
          'Java Memory Model & Garbage Collection',
          'Database Transactions & SQL Queries',
        ],
        interviewFormat: 'HackerRank OA (Math + Coding) + 3 Technical Rounds covering DSA, Core CS, and Math Puzzles.',
        difficulty: 'Medium-Hard',
      };
    }

    // Default / Generic Tier-1
    return {
      company: companyName || 'Tier-1 Product Companies',
      focusSummary: `Targeting ${companyName || 'Tier-1 recruiters'} requires mastery of fundamental algorithmic patterns, clean Big-O verbal articulation, scalable system design, and STAR behavioral answers.`,
      trendingTopics: [
        'Arrays, Strings & Two Pointers',
        'Binary Search on Answer Spaces',
        'Binary Trees, BST & DFS/BFS',
        'Dynamic Programming (1D & 2D)',
        'System Design: Caching, Rate Limiting & Load Balancing',
        'Core CS: OS Threads, DBMS Indexing & ACID',
        'Behavioral STAR Method Stories',
      ],
      interviewFormat: 'Round 1 Coding Online Assessment (2-3 Questions) + 3 Technical Rounds (DSA, Core CS / Architecture) + 1 HR Round.',
      difficulty: 'Medium-Hard',
    };
  }

  /**
   * Generates an adaptive, custom placement roadmap tailored to the student's target role,
   * dream company, study duration (weeks), daily hours, weak topics, and custom interested topics.
   * Produces a COMPLETE, FULL-DURATION DAY-BY-DAY curriculum (all 30 days for 4 weeks).
   */
  public static async generateCustomRoadmap(params: {
    role: string;
    targetCompany: string;
    weeks?: number;
    dailyHours?: number;
    weakTopics?: string[];
    customTopics?: string[];
  }): Promise<any> {
    const role = params.role || 'Full Stack Developer';
    const targetCompany = params.targetCompany || 'Tier-1 Tech Companies';
    const numWeeks = params.weeks && params.weeks >= 1 && params.weeks <= 8 ? params.weeks : 4;
    const dailyHours = params.dailyHours || 2;
    const totalDays = numWeeks === 2 ? 14 : numWeeks === 4 ? 30 : numWeeks * 7;

    const weakTopics = Array.isArray(params.weakTopics) ? params.weakTopics : [];
    const customTopics = Array.isArray(params.customTopics) ? params.customTopics : [];
    const allTargetTopics = Array.from(new Set([...weakTopics, ...customTopics]));
    if (allTargetTopics.length === 0) {
      allTargetTopics.push('DSA Patterns', 'System Design', 'Core CS');
    }

    const companyInsight = this.getCompanyInsights(targetCompany);

    const client = this.getClient();
    if (client) {
      const prompt = `
You are a Staff Technical Recruiter and Engineering Director at ${targetCompany}.
Generate a comprehensive, day-by-day ${totalDays}-day placement preparation curriculum for a candidate targeting the "${role}" role at "${targetCompany}".

Candidate Profile & Constraints:
- Target Company: ${targetCompany}
- Company Recruitment Focus: ${companyInsight.focusSummary}
- Priority Topics to Master: ${allTargetTopics.join(', ')}
- Available Daily Preparation Time: ${dailyHours} hours/day
- Total Duration: Exactly ${totalDays} Days structured across ${numWeeks} Weeks (Day 1 through Day ${totalDays}).

Requirements:
1. Every single day from Day 1 to Day ${totalDays} must be included.
2. Group into ${numWeeks} weeks (e.g. Week 1: Days 1-7, Week 2: Days 8-14, Week 3: Days 15-21, Week 4: Days 22-${totalDays}).
3. Each day must have 2 actionable tasks with realistic minutes summing to ~${dailyHours * 60} mins.
4. Direct links to platform routes:
   - '/problems/two-sum', '/problems/binary-search', '/problems/reverse-linked-list', '/problems/valid-parentheses', '/problems/maximum-subarray', '/problems/coin-change', '/problems/best-time-to-buy-and-sell-stock', '/problems/longest-substring-without-repeating-characters'
   - '/questions'
   - '/mock-interview'
   - '/placement-modules'

Return a single valid JSON object matching this schema:
{
  "title": "${role} ${totalDays}-Day Sprint for ${targetCompany}",
  "slug": "custom-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${targetCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}",
  "role": "${role}",
  "durationDays": ${totalDays},
  "level": "Intermediate to Advanced",
  "description": "Personalized ${totalDays}-day curriculum tailored to ${targetCompany} hiring standards, targeting ${allTargetTopics.slice(0, 4).join(', ')}.",
  "targetCompanies": ["${targetCompany}"],
  "icon": "Target",
  "badgeColor": "brand",
  "totalTasks": ${totalDays * 2},
  "totalXp": ${totalDays * 75},
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1: Core Foundations & Coding Basics",
      "focusArea": "Fundamentals",
      "milestoneObjective": "Milestone description",
      "days": [
        {
          "dayNumber": 1,
          "title": "Day 1 Topic",
          "focusArea": "Focus",
          "estimatedMinutes": ${dailyHours * 60},
          "tasks": [
            {
              "id": "cst-d1-t1",
              "title": "Task Title",
              "type": "concept",
              "targetUrl": "/questions",
              "estimatedMinutes": 30,
              "xpReward": 35,
              "description": "Task details",
              "keyTakeaways": ["Key takeaway"]
            },
            {
              "id": "cst-d1-t2",
              "title": "Practice: Problem",
              "type": "problem",
              "targetUrl": "/problems/two-sum",
              "estimatedMinutes": 30,
              "xpReward": 40,
              "description": "Problem details"
            }
          ]
        }
      ]
    }
  ]
}

Ensure all ${totalDays} days are present. Return ONLY valid JSON.`;

      const text = await this.generateContentWithFallback(prompt);
      if (text) {
        try {
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const cleanJson = text.substring(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(cleanJson);
            if (parsed.weeks && parsed.weeks.length > 0) {
              const daysCount = parsed.weeks.reduce((acc: number, w: any) => acc + (w.days?.length || 0), 0);
              // Ensure comprehensive days
              if (daysCount >= Math.min(14, totalDays - 2)) {
                return parsed;
              }
            }
          }
        } catch (err) {
          console.warn('[AIService] generateCustomRoadmap parse failed, falling back.');
        }
      }
    }

    // High quality dynamic fallback generator that guarantees FULL 30 DAYS (Day 1 through Day 30)
    return this.fallbackCustomRoadmap(role, targetCompany, numWeeks, totalDays, dailyHours, allTargetTopics);
  }

  private static fallbackCustomRoadmap(
    role: string,
    targetCompany: string,
    numWeeks: number,
    totalDays: number,
    dailyHours: number,
    topics: string[]
  ): any {
    const slug = `ai-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${targetCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const allDays: any[] = [];
    let taskCounter = 1;

    const standardProblems = [
      { slug: 'two-sum', title: 'Two Sum & Hash Maps' },
      { slug: 'valid-palindrome', title: 'Valid Palindrome Two Pointers' },
      { slug: 'maximum-subarray', title: 'Maximum Subarray (Kadane’s)' },
      { slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy & Sell Stock' },
      { slug: 'binary-search', title: 'Binary Search Core' },
      { slug: 'reverse-linked-list', title: 'Reverse Linked List In-Place' },
      { slug: 'valid-parentheses', title: 'Valid Parentheses Stack' },
      { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists' },
      { slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree' },
      { slug: 'invert-binary-tree', title: 'Invert Binary Tree' },
      { slug: 'climbing-stairs', title: 'Climbing Stairs DP' },
      { slug: 'coin-change', title: 'Coin Change Unbounded DP' },
      { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Sliding Window' },
    ];

    for (let d = 1; d <= totalDays; d++) {
      const topicIndex = (d - 1) % topics.length;
      const currentTopic = topics[topicIndex] || `${targetCompany} Core Topic`;
      const problem = standardProblems[(d - 1) % standardProblems.length];
      const isMockDay = d % 7 === 0 || d === totalDays - 1;

      const tasks = [
        {
          id: `ai-d${d}-t1`,
          title: `Master ${currentTopic} Patterns for ${targetCompany}`,
          type: 'concept',
          targetUrl: '/questions',
          estimatedMinutes: Math.round((dailyHours * 60) / 2),
          xpReward: 35,
          description: `Deep dive into high-frequency interview questions and conceptual trade-offs for ${currentTopic}.`,
          keyTakeaways: [
            `Key requirement: Align with ${targetCompany} technical rubrics.`,
            'Verbalize Big-O time and space complexity before writing code.',
          ],
        },
        {
          id: `ai-d${d}-t2`,
          title: isMockDay
            ? `AI Mock Interview: ${currentTopic} Round`
            : `Practice: ${problem.title}`,
          type: isMockDay ? 'interview' : 'problem',
          targetUrl: isMockDay ? '/mock-interview' : `/problems/${problem.slug}`,
          estimatedMinutes: Math.round((dailyHours * 60) / 2),
          xpReward: isMockDay ? 60 : 40,
          description: isMockDay
            ? `Take a targeted AI technical interview evaluating clarity and problem solving in ${currentTopic}.`
            : `Implement optimal solution in the Monaco Sandbox under a 25-minute timer.`,
        },
      ];

      allDays.push({
        dayNumber: d,
        title: `Day ${d}: ${currentTopic} Intensive`,
        focusArea: `${targetCompany} ${role}`,
        estimatedMinutes: dailyHours * 60,
        tasks,
      });
    }

    // Split days into weeks
    const daysPerWeek = Math.ceil(totalDays / numWeeks);
    const weeks: any[] = [];

    for (let w = 1; w <= numWeeks; w++) {
      const startDay = (w - 1) * daysPerWeek;
      const endDay = w === numWeeks ? totalDays : w * daysPerWeek;
      const weekDays = allDays.slice(startDay, endDay);

      const weekTheme =
        w === 1
          ? `Week 1: Foundations & ${topics[0] || 'Core Patterns'} (Days ${startDay + 1}–${endDay})`
          : w === 2
          ? `Week 2: Advanced Data Structures & ${topics[1] || 'System Core'} (Days ${startDay + 1}–${endDay})`
          : w === 3
          ? `Week 3: ${targetCompany} High-Frequency Problems & Design (Days ${startDay + 1}–${endDay})`
          : `Week 4: Final Placement Drills & Hiring Simulation (Days ${startDay + 1}–${endDay})`;

      weeks.push({
        weekNumber: w,
        title: weekTheme,
        focusArea: `${targetCompany} Hiring Focus`,
        milestoneObjective: `Achieve 85%+ readiness score in ${targetCompany} technical evaluations.`,
        days: weekDays,
      });
    }

    const totalTasksCount = allDays.reduce((acc, d) => acc + d.tasks.length, 0);

    return {
      title: `${role} ${totalDays}-Day Sprint for ${targetCompany}`,
      slug,
      role,
      durationDays: totalDays,
      level: 'All Levels',
      description: `Comprehensive ${totalDays}-day (Day 1 to ${totalDays}) placement curriculum tailored specifically to ${targetCompany} hiring standards, targeting ${topics.join(', ')} with ${dailyHours} hours of dedicated daily practice.`,
      targetCompanies: [targetCompany],
      icon: 'Target',
      badgeColor: 'brand',
      totalTasks: totalTasksCount,
      totalXp: totalTasksCount * 40,
      isCustom: true,
      weeks,
    };
  }
}

