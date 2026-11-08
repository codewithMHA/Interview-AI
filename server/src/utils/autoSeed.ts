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

    // 4. Auto-Seed Demo Student Account (student@placement.edu / Placement2026!)
    const demoEmail = 'student@placement.edu';
    
    // Automatically update any legacy "Mohammed Farooq" records to "Mohammed Hassan Ahmed"
    await User.updateMany({ name: 'Mohammed Farooq' }, { $set: { name: 'Mohammed Hassan Ahmed' } });
    await Profile.updateMany({ name: 'Mohammed Farooq' }, { $set: { name: 'Mohammed Hassan Ahmed', githubProfile: 'https://github.com/codewithMHA', linkedinProfile: 'https://linkedin.com/in/mohammed-hassan-ahmed' } });

    let demoUser = await User.findOne({ email: demoEmail }).select('+password');
    if (!demoUser) {
      console.log(`[AutoSeed] Creating default Demo Student account (${demoEmail})...`);
      demoUser = await User.create({
        name: 'Mohammed Hassan Ahmed',
        email: demoEmail,
        password: 'Placement2026!',
        role: 'student',
      });

      const demoProfile = await Profile.create({
        user: demoUser._id,
        name: 'Mohammed Hassan Ahmed',
        email: demoEmail,
        college: 'National Institute of Technology',
        degree: 'B.Tech in Computer Science & Engineering',
        graduationYear: 2026,
        targetRole: 'Software Engineer',
        experienceLevel: 'Intermediate',
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
        skills: ['Data Structures', 'Algorithms', 'React', 'Node.js', 'MongoDB', 'System Design'],
        githubProfile: 'https://github.com/codewithMHA',
        linkedinProfile: 'https://linkedin.com/in/mohammed-hassan-ahmed',
        preparationScore: 78,
        streakCount: 5,
        xpPoints: 1250,
        level: 4,
        isOnboarded: true,
      });

      demoUser.profile = demoProfile._id as any;
      await demoUser.save();

      // Seed demo submission & mock interview for rich dashboard metrics
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
        role: 'Full Stack Engineer',
        category: 'Technical',
        status: 'completed',
        scores: {
          overallScore: 82,
          technicalScore: 85,
          communicationScore: 80,
          confidenceScore: 81,
        },
        feedback: {
          strengths: ['Clear intuition on hash tables', 'Solid communication of algorithmic trade-offs'],
          improvements: ['Elaborate more on edge cases with negative numbers'],
          recommendations: ['Practice dynamic programming problems under timed conditions'],
        },
        durationMinutes: 25,
      });

      didSeed = true;
      console.log(`[AutoSeed] ✅ Demo Student account created with complete profile and metrics.`);
    } else {
      // Ensure existing demo user has correct name and profile
      if (demoUser.name !== 'Mohammed Hassan Ahmed') {
        demoUser.name = 'Mohammed Hassan Ahmed';
        await demoUser.save();
      }

      const existingProfile = await Profile.findOne({ user: demoUser._id });
      if (!existingProfile) {
        const demoProfile = await Profile.create({
          user: demoUser._id,
          name: 'Mohammed Hassan Ahmed',
          email: demoUser.email,
          college: 'National Institute of Technology',
          degree: 'B.Tech in Computer Science & Engineering',
          graduationYear: 2026,
          targetRole: 'Software Engineer',
          experienceLevel: 'Intermediate',
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
          skills: ['Data Structures', 'Algorithms', 'React', 'Node.js', 'MongoDB', 'System Design'],
          githubProfile: 'https://github.com/codewithMHA',
          linkedinProfile: 'https://linkedin.com/in/mohammed-hassan-ahmed',
          preparationScore: 78,
          streakCount: 5,
          xpPoints: 1250,
          level: 4,
          isOnboarded: true,
        });
        demoUser.profile = demoProfile._id as any;
        await demoUser.save();
      } else {
        await Profile.updateOne(
          { user: demoUser._id },
          {
            name: 'Mohammed Hassan Ahmed',
            githubProfile: 'https://github.com/codewithMHA',
            linkedinProfile: 'https://linkedin.com/in/mohammed-hassan-ahmed',
          }
        );
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

