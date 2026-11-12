import { Question } from '../models/Question.js';
import { CodingProblem } from '../models/CodingProblem.js';
import { Roadmap } from '../models/Roadmap.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Submission } from '../models/Submission.js';
import { MockInterview } from '../models/MockInterview.js';
import { SEED_QUESTIONS } from '../data/seedQuestions.js';
import { SEED_PROBLEMS } from '../data/seedProblems.js';
import { SEED_ROADMAPS } from '../data/seedRoadmaps.js';

let isSeeding = false;

export interface AutoSeedResult {
  questions: number;
  problems: number;
  roadmaps: number;
  seeded: boolean;
}

/**
 * Automatically inspects the connected MongoDB database.
 * If Question Bank, Coding Problems, Roadmaps, or the Demo Student account
 * are empty or missing records, it safely seeds and populates them.
 */
export const autoSeedDatabase = async (): Promise<AutoSeedResult> => {
  if (isSeeding) {
    return {
      questions: await Question.countDocuments().catch(() => 0),
      problems: await CodingProblem.countDocuments().catch(() => 0),
      roadmaps: await Roadmap.countDocuments().catch(() => 0),
      seeded: false,
    };
  }

  isSeeding = true;
  let didSeed = false;

  try {
    // 1. Auto-Seed Questions (149 curated placement questions)
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      console.log(`[AutoSeed] Question Bank is empty. Inserting ${SEED_QUESTIONS.length} curated questions...`);
      await Question.insertMany(SEED_QUESTIONS);
      didSeed = true;
      console.log(`[AutoSeed] ✅ Successfully inserted ${SEED_QUESTIONS.length} placement questions into MongoDB.`);
    } else if (questionCount < SEED_QUESTIONS.length) {
      console.log(`[AutoSeed] Syncing missing questions (${questionCount}/${SEED_QUESTIONS.length})...`);
      for (const q of SEED_QUESTIONS) {
        await Question.updateOne(
          { title: q.title, topic: q.topic },
          { $set: q },
          { upsert: true }
        );
      }
      didSeed = true;
      console.log(`[AutoSeed] ✅ Questions synchronized successfully.`);
    }

    // 2. Auto-Seed Coding Problems (31 comprehensive LeetCode-style problems)
    const problemCount = await CodingProblem.countDocuments();
    if (problemCount === 0) {
      console.log(`[AutoSeed] Coding Problems collection is empty. Inserting ${SEED_PROBLEMS.length} problems...`);
      await CodingProblem.insertMany(SEED_PROBLEMS);
      didSeed = true;
      console.log(`[AutoSeed] ✅ Successfully inserted ${SEED_PROBLEMS.length} coding problems into MongoDB.`);
    } else if (problemCount < SEED_PROBLEMS.length) {
      console.log(`[AutoSeed] Syncing missing coding problems (${problemCount}/${SEED_PROBLEMS.length})...`);
      for (const p of SEED_PROBLEMS) {
        await CodingProblem.updateOne(
          { slug: p.slug },
          { $set: p },
          { upsert: true }
        );
      }
      didSeed = true;
      console.log(`[AutoSeed] ✅ Coding problems synchronized successfully.`);
    }

    // 3. Auto-Seed Placement Roadmaps
    const roadmapCount = await Roadmap.countDocuments();
    if (roadmapCount === 0) {
      console.log(`[AutoSeed] Placement Roadmaps collection is empty. Inserting roadmap tracks...`);
      for (const r of SEED_ROADMAPS) {
        await Roadmap.updateOne(
          { slug: r.slug },
          { $set: r },
          { upsert: true }
        );
      }
      didSeed = true;
      console.log(`[AutoSeed] ✅ Placement roadmaps seeded successfully.`);
    }

    // 4. Seed test student account only in non-production/test environments (no demo account in production)
    const shouldSeedTestAccount =
      process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_LOGIN === 'true';
    const demoEmail = 'student@placement.edu';
    let demoUser = shouldSeedTestAccount
      ? await User.findOne({ email: demoEmail }).select('+password')
      : null;
    if (shouldSeedTestAccount && !demoUser) {
      console.log(`[AutoSeed] Creating default Demo Student account (${demoEmail})...`);
      demoUser = await User.create({
        name: 'Demo Student',
        email: demoEmail,
        password: 'Placement2026!',
        role: 'student',
      });

      const demoProfile = await Profile.create({
        user: demoUser._id,
        name: 'Demo Student',
        email: demoEmail,
        college: 'National Institute of Technology',
        degree: 'B.Tech in Computer Science & Engineering',
        graduationYear: 2026,
        targetRole: 'Software Engineer',
        experienceLevel: 'Intermediate',
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
        skills: ['Data Structures', 'Algorithms', 'React', 'Node.js', 'MongoDB', 'System Design'],
        githubProfile: '',
        linkedinProfile: '',
        preparationScore: 78,
        streakCount: 5,
        xpPoints: 1250,
        level: 4,
        isOnboarded: true,
      });

      demoUser.profile = demoProfile._id as any;
      await demoUser.save();

      // Seed demo submission & mock interview matching MockInterviewSchema
      const sampleProblem = await CodingProblem.findOne({ slug: 'two-sum' });
      if (sampleProblem) {
        await Submission.create({
          userId: demoUser._id,
          problemId: sampleProblem._id,
          language: 'javascript',
          code: 'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }',
          status: 'Accepted',
          runtime: 52,
          memory: 42.1,
          testCasesPassed: sampleProblem.testCases.length,
          totalTestCases: sampleProblem.testCases.length,
        });
      }

      await MockInterview.create({
        userId: demoUser._id,
        title: 'Full Stack Engineer · Technical Sample',
        interviewType: 'Technical',
        roundType: 'technical_stack',
        role: 'Full Stack Engineer',
        difficulty: 'Intermediate',
        status: 'completed',
        currentStage: 'completed',
        numberOfQuestions: 1,
        overallScore: 84,
        averageScores: {
          correctness: 86,
          technicalDepth: 84,
          clarity: 82,
          confidence: 84,
          completeness: 80,
          communication: 82,
          relevance: 88,
        },
        questions: [
          {
            id: 'q-seed-1',
            question: 'How does a Hash Map resolve key collisions and maintain O(1) average lookup complexity?',
            category: 'Technical',
            difficulty: 'Intermediate',
            stage: 'main',
            expectedPoints: ['Hashing function & bucket indexing', 'Separate chaining vs open addressing', 'Load factor & rehashing at 0.75'],
            studentAnswer: 'A hash map hashes keys into bucket indices and handles collisions with linked lists or balanced trees once buckets grow, resizing when load factor crosses 0.75.',
            answeredAt: new Date(),
            feedback: {
              overallScore: 84,
              scores: { correctness: 86, technicalDepth: 84, clarity: 82, confidence: 84, completeness: 80, communication: 82 },
              rubricBreakdown: {
                technicalCorrectness: 86,
                problemSolving: 84,
                communication: 82,
                relevance: 88,
                completeness: 80,
                scoringFormula: 'Score = (Correctness * 0.30) + (ProblemSolving * 0.25) + (Communication * 0.20) + (Relevance * 0.15) + (Completeness * 0.10)',
              },
              roleLevel: 'SDE-1',
              whatWentWell: ['Clearly explained hashing, collision chaining, and dynamic resizing'],
              whatWasMissed: ['Could briefly mention worst-case O(N) vs treeified O(log N) bucket lookups'],
              missingConcepts: ['Treeified buckets in Java 8+'],
              howToImprove: ['Include concrete amortized vs worst-case complexity bounds'],
              modelAnswer: 'Hash maps map keys via hash functions to array buckets. Collisions are resolved using separate chaining or open addressing, and resizing occurs when load factor (default 0.75) triggers amortized O(1) lookup.',
              recommendedTopics: ['Hashing & Load Factor Trade-offs'],
            },
          },
        ],
        completedAt: new Date(),
      });

      didSeed = true;
      console.log(`[AutoSeed] ✅ Demo Student account created with complete profile and metrics.`);
    } else if (shouldSeedTestAccount && demoUser) {
      const existingProfile = await Profile.findOne({ user: demoUser._id });
      if (!existingProfile) {
        const demoProfile = await Profile.create({
          user: demoUser._id,
          name: demoUser.name || 'Demo Student',
          email: demoUser.email,
          college: 'National Institute of Technology',
          degree: 'B.Tech in Computer Science & Engineering',
          graduationYear: 2026,
          targetRole: 'Software Engineer',
          experienceLevel: 'Intermediate',
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
          skills: ['Data Structures', 'Algorithms', 'React', 'Node.js', 'MongoDB', 'System Design'],
          githubProfile: '',
          linkedinProfile: '',
          preparationScore: 78,
          streakCount: 5,
          xpPoints: 1250,
          level: 4,
          isOnboarded: true,
        });
        demoUser.profile = demoProfile._id as any;
        await demoUser.save();
      }
    }

    const currentQuestions = await Question.countDocuments();
    const currentProblems = await CodingProblem.countDocuments();
    const currentRoadmaps = await Roadmap.countDocuments();

    console.log(
      `[AutoSeed] 🎯 Active Database Status: ${currentQuestions} Questions | ${currentProblems} Coding Problems | ${currentRoadmaps} Roadmaps.`
    );

    return {
      questions: currentQuestions,
      problems: currentProblems,
      roadmaps: currentRoadmaps,
      seeded: didSeed,
    };
  } catch (err: any) {
    console.error('[AutoSeed] Error during auto-seeding:', err.message);
    return {
      questions: await Question.countDocuments().catch(() => 0),
      problems: await CodingProblem.countDocuments().catch(() => 0),
      roadmaps: await Roadmap.countDocuments().catch(() => 0),
      seeded: false,
    };
  } finally {
    isSeeding = false;
  }
};

