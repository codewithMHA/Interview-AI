import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Code,
  Server,
  Layers,
  Cpu,
  BarChart,
  Brain,
  Terminal,
  Zap,
  Award,
  Compass,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enrollInRoadmap } from '@/services/roadmapService';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

const ROLES = [
  {
    id: 'Software Engineer',
    label: 'Software Engineer',
    desc: 'Core DSA, Problem Solving, System Architecture & High-Performance Code',
    icon: Terminal,
  },
  {
    id: 'Full Stack Developer',
    label: 'Full Stack Developer',
    desc: 'End-to-end Web Applications, REST APIs, Database Design & React',
    icon: Layers,
  },
  {
    id: 'Frontend Developer',
    label: 'Frontend Developer',
    desc: 'Modern JavaScript/TypeScript, React UI/UX, Performance & State Management',
    icon: Code,
  },
  {
    id: 'Backend Developer',
    label: 'Backend Developer',
    desc: 'Distributed Systems, Node.js/Java, Microservices, SQL & MongoDB',
    icon: Server,
  },
  {
    id: 'AI/ML Engineer',
    label: 'AI/ML Engineer',
    desc: 'Machine Learning Models, Python, NLP, LLMs & Deep Learning Frameworks',
    icon: Brain,
  },
  {
    id: 'Data Scientist',
    label: 'Data Scientist',
    desc: 'Statistical Modeling, Data Pipelines, Python, Pandas & Predictive Analytics',
    icon: BarChart,
  },
  {
    id: 'Data Analyst',
    label: 'Data Analyst',
    desc: 'SQL Queries, Dashboard Visualization, BI Tools & Business Intelligence',
    icon: Cpu,
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'Beginner',
    label: 'Beginner',
    desc: 'Freshman/Sophomore exploring fundamentals, preparing for first internship',
  },
  {
    id: 'Intermediate',
    label: 'Intermediate',
    desc: 'Pre-final/Final year student with project experience, targeting campus placements',
  },
  {
    id: 'Advanced',
    label: 'Advanced',
    desc: 'Experienced coder with strong DSA rating aiming for Tier-1 Product Companies',
  },
];

const ALL_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'Git',
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Docker',
  'System Design',
];

export const CareerSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, completeCareerSetup } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string>(profile?.targetRole || 'Software Engineer');
  const [selectedLevel, setSelectedLevel] = useState<string>(profile?.experienceLevel || 'Intermediate');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    profile?.skills?.length ? profile.skills : ['Data Structures', 'Algorithms', 'JavaScript', 'React']
  );
  const [enrolledRoadmapTitle, setEnrolledRoadmapTitle] = useState<string>('Full-Stack Developer 30-Day Sprint');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFinish = async () => {
    if (!selectedRole || !selectedLevel) {
      setError('Please select both your target role and experience level.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Derive programming languages from selected skills
      const langKeywords = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'];
      const derivedLangs = selectedSkills.filter((s) => langKeywords.includes(s));

      await completeCareerSetup({
        targetRole: selectedRole,
        experienceLevel: selectedLevel,
        skills: selectedSkills,
        programmingLanguages: derivedLangs.length > 0 ? derivedLangs : ['JavaScript', 'Python'],
      });

      // Automatically enroll in matching 30-day curriculum roadmap
      let matchingSlug = 'full-stack-30';
      const roleLower = selectedRole.toLowerCase();
      if (roleLower.includes('frontend')) matchingSlug = 'frontend-30';
      else if (roleLower.includes('backend') || roleLower.includes('cloud')) matchingSlug = 'backend-30';
      else if (roleLower.includes('ai') || roleLower.includes('data') || roleLower.includes('machine')) matchingSlug = 'ai-ml-30';
      else matchingSlug = 'full-stack-30';

      try {
        const enrollResult = await enrollInRoadmap(matchingSlug);
        if (enrollResult?.roadmap?.title) {
          setEnrolledRoadmapTitle(enrollResult.roadmap.title);
        }
      } catch (enrollErr) {
        console.warn('Roadmap auto-enroll fallback:', enrollErr);
      }

      // Transition to Step 4 so user can clearly see and review their generated plan
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to complete career setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-grid-pattern relative flex items-center justify-center">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Placement Profile Calibration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Personalize Your Placement Journey
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tell us about your target role and current skills so our AI can calibrate your 30-day preparation roadmap.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>1</span>
              <span>Target Role</span>
            </div>
            <span className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>2</span>
              <span>Experience Level</span>
            </div>
            <span className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 3 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>3</span>
              <span>Key Skills</span>
            </div>
            <span className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>4</span>
              <span>Your Plan ✓</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* STEP 1: TARGET ROLE */}
        {step === 1 && (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: What role are you preparing for?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We customize the technical interview rubrics and coding patterns to match this profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 dark:border-brand-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                            {r.label}
                          </h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <Button size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Experience Level
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: EXPERIENCE LEVEL */}
        {step === 2 && (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 2: What is your current preparation level?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Helps adjust the initial question difficulty from foundational to competitive.
                </p>
              </div>

              <div className="space-y-3.5">
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 dark:border-brand-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="font-semibold text-base text-slate-900 dark:text-white">
                          {lvl.label}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {lvl.desc}
                        </p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 ml-4" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 ml-4" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Skills Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: SKILLS SELECTION */}
        {step === 3 && (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 3: Select technologies and topics you are targeting
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Click to select all skills relevant to your placement targets ({selectedSkills.length} selected).
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {ALL_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-transparent'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              {/* Onboarding Reward Banner */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    Completing setup earns you <strong>+50 Bonus XP</strong> towards your Placement Readiness Level.
                  </span>
                </div>
                <Badge variant="warning">+50 XP</Badge>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  isLoading={isSubmitting}
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Generate My 30-Day Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: PLAN GENERATED & SAVED CONFIRMATION */}
        {step === 4 && (
          <Card className="border border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/20 shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500" />
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <Badge variant="success" className="px-3 py-1 text-xs">
                  Plan Activated & Saved to Profile
                </Badge>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Your 30-Day Placement Plan is Ready!
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                  We calibrated your personalized preparation strategy based on your target role, experience, and target skills.
                </p>
              </div>

              {/* Summary of Activated Plan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target Role</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedRole}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Experience Tier</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedLevel}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Enrolled 30-Day Track</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{enrolledRoadmapTitle}</div>
                </div>
              </div>

              {/* Roadmap Milestones Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-brand-500" />
                  Your 4-Week Placement Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="font-bold text-brand-600 dark:text-brand-400">Week 1: Core Fundamentals</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Data structures, core syntax mastery, and problem classification.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="font-bold text-brand-600 dark:text-brand-400">Week 2: Algorithmic Patterns</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Two Pointers, Sliding Window, DP, and Tree/Graph traversals.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="font-bold text-brand-600 dark:text-brand-400">Week 3: System Architecture</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">OS, DBMS, Computer Networks, and High-Level System Design.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="font-bold text-brand-600 dark:text-brand-400">Week 4: Mock Rounds & HR</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">STAR technique behavioral responses and full-length timed mock tests.</p>
                  </div>
                </div>
              </div>

              {/* Where it is saved info */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <span>
                  <strong>Where is this plan saved?</strong> This plan is permanently saved to your user profile in the database and is now the active roadmap in the <strong>30-Day Adaptive Roadmap</strong> tab. You can track progress daily or re-calibrate anytime from your <strong>Profile</strong>.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/roadmap')}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Open My 30-Day Placement Roadmap →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

