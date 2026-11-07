import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  Briefcase,
  Play,
  RotateCcw,
  Check,
  Award,
  Video,
  Mic,
  FileCode,
  ShieldAlert,
  ChevronRight,
  User,
  History,
  X,
  Code2,
  Cpu,
  Database,
  Terminal,
  Brain,
  Globe,
  Settings,
  Trash2,
  ExternalLink,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import {
  startMockInterview,
  getMockInterviewHistory,
  deleteMockInterview,
  StartMockInterviewParams,
} from '@/services/aiService';
import { MockInterviewDetailedSession, ResumeTopicItem } from '@/types';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';

export interface InterviewerPersona {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio: string;
  style: string;
}

const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'emily',
    name: 'Emily Zhou',
    role: 'Senior Software Engineer',
    company: 'Amazon / AWS Cloud',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bio: 'Runs technical deep dives and system architecture rounds at Amazon. Probes scalability, concurrency, and real-world trade-offs.',
    style: 'Direct, analytical, focused on production edge cases & ACID guarantees.',
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'Staff Infrastructure Architect',
    company: 'Google Cloud Platform',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Ex-Meta engineering lead. Evaluates code execution speed, distributed systems primitives, and OS-level bottlenecks.',
    style: 'Thorough, inquisitive, challenges assumptions about time/space complexity.',
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Engineering Lead',
    company: 'Razorpay / Fintech',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    bio: 'Leads core banking APIs and high-availability systems. Specializes in full-stack architecture and clean code craftsmanship.',
    style: 'Encouraging, structured, evaluates end-to-end API contracts & error handling.',
  },
  {
    id: 'david',
    name: 'David Chen',
    role: 'Engineering Director & Hiring Manager',
    company: 'Microsoft / Enterprise SWE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Assesses cultural fit, STAR storytelling, cross-functional ownership, and long-term engineering potential.',
    style: 'Warm, behavioral-focused, probes real impact and team friction resolution.',
  },
];

// The 11 Core Interview Types from Master Development Prompt Section 2
const INTERVIEW_TYPES = [
  {
    id: 'Coding',
    name: 'Coding Interview',
    icon: Code2,
    badge: 'Monaco IDE + Compiler',
    description: 'Solve real algorithmic challenges in live Monaco IDE with Judge0 code execution and complexity follow-ups.',
    color: 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400',
  },
  {
    id: 'Technical',
    name: 'Technical Interview',
    icon: Terminal,
    badge: 'Core CS & Architecture',
    description: 'In-depth evaluation of system design, backend architectures, concurrency, and trade-offs.',
    color: 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'Full Stack Developer',
    name: 'Full Stack Developer',
    icon: Layers,
    badge: 'Frontend + Backend + DB',
    description: 'End-to-end web engineering, REST/GraphQL APIs, React state, databases, and microservices.',
    color: 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'Frontend Developer',
    name: 'Frontend Developer',
    icon: Globe,
    badge: 'React · TS · DOM · Web Perf',
    description: 'Component architecture, state management, render optimizations, CSS layouts, and modern browser APIs.',
    color: 'border-cyan-500 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'Backend Developer',
    name: 'Backend Developer',
    icon: Cpu,
    badge: 'Node.js · Distributed Systems',
    description: 'High-throughput APIs, caching with Redis, message queues, ACID transactions, and auth security.',
    color: 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'Java',
    name: 'Java Interview',
    icon: Terminal,
    badge: 'JVM · Spring Boot · OOP',
    description: 'Java memory model, GC algorithms, Spring Boot microservices, multithreading, and collections.',
    color: 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'Python',
    name: 'Python Interview',
    icon: Code2,
    badge: 'FastAPI · Django · GIL',
    description: 'Python internals, async/await event loops, decorators, generators, and data science tooling.',
    color: 'border-yellow-500 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400',
  },
  {
    id: 'Database',
    name: 'Database Interview',
    icon: Database,
    badge: 'SQL · NoSQL · Indexing',
    description: 'Query optimization, schema normalization, B-trees, sharding, replication, and query execution plans.',
    color: 'border-rose-500 bg-rose-500/5 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'AI/ML',
    name: 'AI / ML Interview',
    icon: Brain,
    badge: 'LLMs · RAG · PyTorch',
    description: 'Model fine-tuning, embeddings, vector stores, transformer architectures, and ML operational pipelines.',
    color: 'border-purple-500 bg-purple-500/5 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'HR',
    name: 'HR & Behavioral',
    icon: User,
    badge: 'STAR Method & Culture',
    description: 'Situational leadership, cross-functional collaboration, overcoming project blockers, and career goals.',
    color: 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'Custom',
    name: 'Custom Interview',
    icon: Settings,
    badge: 'Tailored to your stack',
    description: 'Specify your own custom technologies, specialized role, and targeted interview focus.',
    color: 'border-slate-500 bg-slate-500/5 text-slate-600 dark:text-slate-400',
  },
];

export const MockInterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Top Level Tab: 'configure' vs 'history'
  const [activeTab, setActiveTab] = useState<'configure' | 'history'>('configure');

  // Wizard Step: 1 = Resume, 2 = Role & Config, 3 = Interview Type & Round, 4 = Review & Start
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Resume State (User Uploads/Pastes Own Resume)
  const [resumeMode, setResumeMode] = useState<'upload' | 'paste'>('upload');
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [parsedTopics, setParsedTopics] = useState<ResumeTopicItem[]>([]);

  // Step 2: Role & Configuration
  const [targetType, setTargetType] = useState<'none' | 'saved' | 'paste'>('paste');
  const [targetJD, setTargetJD] = useState<string>('SDE-1 at amazon');
  const [selectedRole, setSelectedRole] = useState<string>('Software Development Engineer');
  const [selectedCompany, setSelectedCompany] = useState<string>('Amazon');
  const [skillsInput, setSkillsInput] = useState<string>('React, Node.js, Express, MongoDB, Data Structures');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [experienceLevel, setExperienceLevel] = useState<'Fresher' | 'Student' | 'Experienced'>('Fresher');
  const [duration, setDuration] = useState<number>(30);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [interviewMode, setInterviewMode] = useState<'mixed' | 'voice' | 'text'>('mixed');

  // Step 3: Interview Type & Round
  const [selectedType, setSelectedType] = useState<string>('Technical');
  const [selectedRound, setSelectedRound] = useState<'project_deep_dive' | 'behavioral' | 'hiring_manager' | 'technical_stack'>('project_deep_dive');

  // Step 4: Assigned Interviewer Persona
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerPersona>(INTERVIEWER_PERSONAS[0]);

  // Loading & Submission State
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [history, setHistory] = useState<MockInterviewDetailedSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auto-populate from user's saved profile if available
  useEffect(() => {
    if (profile && profile.skills && profile.skills.length > 0 && !resumeText) {
      const edu = [profile.degree, profile.college].filter(Boolean).join(' - ') || 'Computer Science Engineering';
      const generatedFromProfile = `${user?.name || 'Mohammed Hassan Ahmed'}\n${user?.email || 'mhassan2k5@gmail.com'}\nCollege: ${profile.college || 'Engineering College'}\n\nTECHNICAL SKILLS:\n${profile.skills.join(', ')}\n\nEDUCATION & FOCUS:\n${edu}\nTarget Role: ${profile.targetRole || 'Software Development Engineer'}\n\nPROJECTS:\n1. Cloud Microservices Platform with Node.js, React, and MongoDB - High-scale REST APIs, ACID guarantees, and caching.`;
      setResumeText(generatedFromProfile);
      setParsedTopics(parseUserResume(generatedFromProfile));
      setSkillsInput(profile.skills.join(', '));
      if (profile.targetRole) {
        setSelectedRole(profile.targetRole);
      }
    }
  }, [profile, user]);

  // Load candidate previous sessions
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getMockInterviewHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // Dev fallback
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle session deletion
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this mock interview record?')) return;
    setDeletingId(sessionId);
    try {
      await deleteMockInterview(sessionId);
      setHistory((prev) => prev.filter((item) => (item._id || item.id) !== sessionId));
    } catch (err) {
      console.error('Failed to delete interview:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Parse user's actual uploaded resume dynamically into 8 thita.ai topic cards (Matching Photo 4)
  const parseUserResume = (text: string): ResumeTopicItem[] => {
    if (!text || text.trim().length === 0) return [];

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const topics: ResumeTopicItem[] = [];

    // 1. Profile Topic (Header, contact, student info - Matching Photo 4 Card 1)
    const candidateName = lines[0] || (user?.name || 'Mohammed Hassan Ahmed');
    const headline = lines.slice(1, 4).join(' | ') || 'Computer Science Engineering | Web Development 9482364185 | College Email LinkedIn | GitHub';
    topics.push({
      id: 'topic-profile-card',
      title: `${candidateName}`,
      category: 'Profile',
      description: headline,
      status: 'discussing',
    });

    // 2. Summary or Background (Matching Photo 4 Card 2)
    const summaryIndex = lines.findIndex((l) => /profile|summary|about|objective/i.test(l));
    const summaryDesc = summaryIndex !== -1 && lines[summaryIndex + 1]
      ? lines.slice(summaryIndex + 1, summaryIndex + 5).join(' ').slice(0, 220)
      : 'Computer Science Engineering student interested in software development and problem-solving. Familiar with HTML, CSS, React.js, Node.js, and Express.js, with basic knowledge of Java and Python.';
    topics.push({
      id: 'topic-summary-profile',
      title: 'Undergraduate Engineering Profile & Focus',
      category: 'PROFILE',
      description: summaryDesc,
      status: 'not_yet',
    });

    // 3. Extract Projects dynamically from user's text (Topic 3)
    const projectIndex = lines.findIndex((l) => /project/i.test(l));
    let pTitle = 'Core Project Architecture & Design';
    if (projectIndex !== -1 && lines[projectIndex + 1]) {
      pTitle = lines[projectIndex + 1].replace(/^[0-9]+[.)\s]*/, '').slice(0, 60);
    }
    topics.push({
      id: 'topic-proj-architecture',
      title: pTitle,
      category: 'PROJECT',
      description: 'End-to-end component modularity, API contracts, schema design, and client-server boundaries.',
      status: 'not_yet',
    });

    // 4. Concurrency, ACID & Scalability (Topic 4)
    topics.push({
      id: 'topic-proj-concurrency',
      title: 'Concurrency, Data Consistency & Scale',
      category: 'PROJECT',
      description: 'Handling edge cases, database locks, indexing, caching with Redis, and preventing race conditions.',
      status: 'not_yet',
    });

    // 5. Tech Stack & Language Internals (Topic 5)
    const skillIndex = lines.findIndex((l) => /skills|tech stack|technologies/i.test(l));
    const skillText = skillIndex !== -1 && lines[skillIndex + 1] ? lines[skillIndex + 1] : skillsInput || 'JavaScript, React, Node.js, Express, Java/Python, and SQL/NoSQL databases';
    topics.push({
      id: 'topic-tech-stack',
      title: 'Technical Stack & Language Internals',
      category: 'STACK',
      description: skillText.slice(0, 180),
      status: 'not_yet',
    });

    // 6. Problem Solving & Algorithms (Topic 6)
    topics.push({
      id: 'topic-dsa-algorithms',
      title: 'Data Structures & Algorithmic Trade-offs',
      category: 'ALGORITHMS',
      description: 'Big-O time and space complexity, array manipulation, tree/graph traversals, and dynamic programming.',
      status: 'not_yet',
    });

    // 7. STAR Behavioral & Team Collaboration (Topic 7)
    topics.push({
      id: 'topic-behavioral-ownership',
      title: 'STAR Situational & Engineering Ownership',
      category: 'BEHAVIORAL',
      description: 'Resolving technical team friction, debugging production incidents, and Amazon Leadership Principles.',
      status: 'not_yet',
    });

    // 8. System Design & Reliability (Topic 8)
    topics.push({
      id: 'topic-system-design',
      title: 'Production Reliability & System Design',
      category: 'SYSTEM DESIGN',
      description: 'High-availability services, rate limiting, resilient fallback circuits, and zero-downtime deployment.',
      status: 'not_yet',
    });

    return topics;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    setResumeMode('upload');
    setIsParsingResume(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setResumeText(content);
      const parsed = parseUserResume(content);
      setParsedTopics(parsed);
      setIsParsingResume(false);
    };
    reader.onerror = () => {
      setErrorMessage('Could not read file. Please paste your resume text instead.');
      setIsParsingResume(false);
    };
    reader.readAsText(file);
  };

  const handleStartSession = async (preferredMode: 'voice' | 'text' | 'mixed') => {
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const finalTopics = parsedTopics.length > 0 ? parsedTopics : parseUserResume(resumeText || 'Candidate Profile');

      const skillsList = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: StartMockInterviewParams = {
        title: `${selectedCompany} · ${selectedRole} · ${selectedType} Interview`,
        role: selectedRole || targetJD || 'Software Development Engineer',
        company: selectedCompany,
        experienceLevel: experienceLevel,
        difficulty: difficulty,
        interviewType: selectedType,
        type: selectedType,
        duration: Number(duration) || 30,
        numberOfQuestions: Number(questionCount) || 5,
        questionCount: Number(questionCount) || 5,
        mode: preferredMode,
        skills: skillsList,
        customTopics: skillsList,
        resumeText: resumeText || `${user?.name || 'Candidate'} - ${selectedRole}`,
        targetJD: targetJD || `${selectedRole} at ${selectedCompany}`,
        jobDescription: targetJD,
        roundType: selectedRound,
        interviewerName: selectedInterviewer.name,
        interviewerRole: selectedInterviewer.role,
        interviewerAvatar: selectedInterviewer.avatar,
        resumeTopics: finalTopics,
        candidateNotes: `# Talking Points - ${selectedCompany} ${selectedRole}\n- Candidate: ${user?.name || 'Applicant'}\n- Role: ${selectedRole}\n- Interviewer: ${selectedInterviewer.name} (${selectedInterviewer.role})\n\n## Key Talking Points\n- [ ] Walk through high-level project component architecture\n- [ ] Highlight ACID transaction guarantees & concurrency locks\n- [ ] Address bottlenecks and latency trade-offs\n`,
      };

      const session = await startMockInterview(payload);
      if (session?._id || session?.id) {
        const id = session._id || session.id;
        navigate(`/ai-interview/${id}?mode=${preferredMode}`);
      } else {
        throw new Error('Interview session could not be initialized.');
      }
    } catch (err: any) {
      console.error('Failed to start interview:', err);
      setErrorMessage(err?.response?.data?.error || err.message || 'Could not start interview session.');
    } finally {
      setIsStarting(false);
    }
  };

  // Performance Dashboard Calculations
  const completedInterviews = history.filter((h) => h.status === 'completed');
  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 75), 0) /
            completedInterviews.length
        )
      : 0;
  const bestScore =
    completedInterviews.length > 0
      ? Math.max(...completedInterviews.map((h) => h.overallScore || 0))
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070b] text-slate-900 dark:text-slate-100 py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Top Back Navigation Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Switcher Tab: New Interview vs Past History */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-[#13131e] border border-slate-300/50 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('configure')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'configure'
                  ? 'bg-white dark:bg-[#202030] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Interview</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                loadHistory();
              }}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-[#202030] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Sessions ({history.length})</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: HISTORY & PERFORMANCE ANALYTICS DASHBOARD
            ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dashboard Hero Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] shadow-lg flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Interviews Completed
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {completedInterviews.length}
                    <span className="text-xs text-slate-400 font-normal ml-1.5">
                      / {history.length} initiated
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] shadow-lg flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Average Score
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {avgScore}
                    <span className="text-xs text-slate-400 font-normal ml-1">/100</span>
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] shadow-lg flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Best Score
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {bestScore}
                    <span className="text-xs text-slate-400 font-normal ml-1">/100</span>
                  </p>
                </div>
              </div>
            </div>

            {/* List of Past Mock Interviews */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] shadow-xl overflow-hidden p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Interview History & Detailed Reports
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review candidate answers, model solutions, and track placement readiness.
                  </p>
                </div>
                <Button size="sm" onClick={() => setActiveTab('configure')} className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start New</span>
                </Button>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <span className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">Loading previous interviews...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Bot className="w-12 h-12 text-slate-400 mx-auto opacity-40" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No mock interviews recorded yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Configure your first placement interview to receive live feedback, voice probing, and a detailed performance report.
                  </p>
                  <Button size="sm" onClick={() => setActiveTab('configure')} className="mt-2">
                    Start Your First Interview
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    const sid = item._id || item.id || '';
                    const isDeleting = deletingId === sid;
                    return (
                      <div
                        key={sid}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#12121c] hover:border-indigo-400/50 transition-all flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="purple" size="sm">
                              {item.interviewType || item.type || 'Technical'}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {item.difficulty || 'Intermediate'}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title || item.role}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Interviewer: <strong>{item.interviewerName || 'Emily Zhou'}</strong> · Mode:{' '}
                            <span className="capitalize">{item.mode || 'mixed'}</span> · Status:{' '}
                            <span
                              className={`font-semibold ${
                                item.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                              }`}
                            >
                              {item.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.overallScore !== undefined && (
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Score
                              </span>
                              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                                {item.overallScore}
                                <span className="text-xs text-slate-400">/100</span>
                              </span>
                            </div>
                          )}

                          <Link to={`/ai-interview/${sid}/result`}>
                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Report</span>
                            </Button>
                          </Link>

                          <button
                            onClick={(e) => handleDeleteSession(sid, e)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: NEW INTERVIEW WIZARD
            ========================================================================= */}
        {activeTab === 'configure' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e0e15] shadow-2xl overflow-hidden transition-all">

            {/* Wizard Header Bar */}
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#12121c]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>
                      {currentStep === 4
                        ? 'AI Mock Interview'
                        : currentStep === 3
                        ? 'Select Interview Type & Round'
                        : currentStep === 2
                        ? 'Target Role & Configuration'
                        : 'Resume & Candidate Profile'}
                    </span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {currentStep === 4
                      ? 'Review configuration details before entering the live interview room.'
                      : 'Simulate a real Tier-1 placement interview with live voice turn-taking and code execution.'}
                  </p>

                  {/* 4 Step Progress Pills */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-xs font-semibold">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className={`pb-1 border-b-2 transition-all ${
                        currentStep === 1
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      1. Resume
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className={`pb-1 border-b-2 transition-all ${
                        currentStep === 2
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      2. Role & Settings
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className={`pb-1 border-b-2 transition-all ${
                        currentStep === 3
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      3. Interview Type
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className={`pb-1 border-b-2 transition-all ${
                        currentStep === 4
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      4. Review & Start
                    </button>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Wizard Step Body */}
            <div className="p-6 sm:p-8">

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* =========================================================================
                  STEP 1: RESUME SELECTION & PARSER
                  ========================================================================= */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      STEP 1 OF 4: RESUME & BACKGROUND
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Upload or paste your resume
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      The AI interviewer analyzes your actual projects, technologies, and academic experience to formulate dynamic, authentic questions.
                    </p>
                  </div>

                  {/* Mode Switcher */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#151522] text-xs font-semibold max-w-sm">
                    <button
                      onClick={() => setResumeMode('upload')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        resumeMode === 'upload'
                          ? 'bg-white dark:bg-[#202030] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      📁 Upload File (PDF / TXT)
                    </button>
                    <button
                      onClick={() => setResumeMode('paste')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        resumeMode === 'paste'
                          ? 'bg-white dark:bg-[#202030] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      ✍️ Paste Resume Text
                    </button>
                  </div>

                  {resumeMode === 'upload' ? (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-slate-50/50 dark:bg-[#12121c] group">
                      <input
                        type="file"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {resumeFileName ? `Uploaded: ${resumeFileName}` : 'Click to upload your resume'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports PDF or plain text files
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={resumeText}
                        onChange={(e) => {
                          setResumeText(e.target.value);
                          setParsedTopics(parseUserResume(e.target.value));
                        }}
                        placeholder="Paste your resume content here (Projects, Technical Skills, Education)..."
                        rows={7}
                        className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12121b] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {/* Dynamic Resume Preview Cards */}
                  {parsedTopics.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-[#12121c] border border-slate-200 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Extracted {parsedTopics.length} Interview Focus Areas</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Ready for Live AI Probing</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {parsedTopics.slice(0, 4).map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#161624] border border-slate-200 dark:border-slate-800 text-[11px]"
                          >
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[9px]">
                              {t.category}
                            </span>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {t.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-end">
                    <Button onClick={() => setCurrentStep(2)} className="gap-1.5">
                      <span>Continue to Role & Config</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  STEP 2: TARGET ROLE & CONFIGURATION (Master Prompt Section 2 & Photo 1)
                  ========================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      STEP 2 OF 4: ROLE & CONFIGURATION
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Configure your interview parameters
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Customize the job description, target company, difficulty, experience level, and duration.
                    </p>
                  </div>

                  {/* Job Description Radio Group (Matching Photo 1) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Job Description (optional)
                    </label>

                    <div className="space-y-2">
                      <label
                        onClick={() => {
                          setTargetType('none');
                          setTargetJD('');
                        }}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          targetType === 'none'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetType"
                          checked={targetType === 'none'}
                          onChange={() => {}}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">No job description</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            The interviewer will focus purely on your resume background.
                          </p>
                        </div>
                      </label>

                      <label
                        onClick={() => {
                          setTargetType('saved');
                          setTargetJD('Full Stack Engineer at Google / High-Scale Systems');
                          setSelectedCompany('Google');
                          setSelectedRole('Full Stack Engineer');
                        }}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          targetType === 'saved'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetType"
                          checked={targetType === 'saved'}
                          onChange={() => {}}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">A saved job</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Use predefined Tier-1 enterprise job tracks.
                          </p>
                        </div>
                      </label>

                      <label
                        onClick={() => setTargetType('paste')}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          targetType === 'paste'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetType"
                          checked={targetType === 'paste'}
                          onChange={() => {}}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div className="w-full">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Paste a job description
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Provide the target role or job description text.
                          </p>
                          {targetType === 'paste' && (
                            <input
                              type="text"
                              value={targetJD}
                              onChange={(e) => {
                                setTargetJD(e.target.value);
                                if (e.target.value.toLowerCase().includes('amazon')) setSelectedCompany('Amazon');
                                else if (e.target.value.toLowerCase().includes('google')) setSelectedCompany('Google');
                                else if (e.target.value.toLowerCase().includes('microsoft')) setSelectedCompany('Microsoft');
                              }}
                              placeholder="e.g. SDE-1 at amazon"
                              className="w-full mt-2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12121b] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Role & Company Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Job Role
                      </label>
                      <input
                        type="text"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        placeholder="e.g. Software Development Engineer"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#14141f] text-xs font-medium text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        placeholder="e.g. Amazon, Google, Razorpay"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#14141f] text-xs font-medium text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Skills / Technologies */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Skills & Technologies
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#14141f] text-xs font-medium text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* 4 Multi-Select Parameter Grids (Difficulty, Experience, Duration, Questions) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Difficulty */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setDifficulty(lvl)}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              difficulty === lvl
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Experience Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Fresher', 'Student', 'Experienced'] as const).map((exp) => (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setExperienceLevel(exp)}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              experienceLevel === exp
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {exp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Interview Duration
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[10, 15, 30, 45].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setDuration(mins)}
                            className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                              duration === mins
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Count */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Number of Questions
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[5, 10, 15].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                              questionCount === cnt
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {cnt} Qs
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setQuestionCount(8)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                            questionCount === 8
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          8 Qs
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mode Picker (Mixed vs Voice vs Text) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Interview Interaction Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setInterviewMode('mixed')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          interviewMode === 'mixed'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          <span>Mixed (Voice + Text)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Speak or type freely at any time.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInterviewMode('voice')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          interviewMode === 'voice'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                          <Mic className="w-4 h-4 text-emerald-500" />
                          <span>Voice Interview</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Hands-free realistic voice turn-taking.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInterviewMode('text')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          interviewMode === 'text'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>Text Interview</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Distraction-free typed answers.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Resume</span>
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} className="gap-1.5">
                      <span>Continue to Interview Type</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  STEP 3: 11 INTERVIEW TYPES & ROUND PRESETS (Master Prompt Sections 1, 2 & Photo 2)
                  ========================================================================= */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      STEP 3 OF 4: INTERVIEW TYPE & ROUND
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Select your interview specialization
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose from 11 targeted tracks including live Coding Sandbox with compiler, Technical Architecture, or HR Behavioral.
                    </p>
                  </div>

                  {/* 11 Interview Types Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {INTERVIEW_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = selectedType === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedType(t.id);
                            if (t.id === 'Coding') setSelectedRole('Software Development Engineer');
                            else if (t.id === 'Frontend Developer') setSelectedRole('Frontend Engineer');
                            else if (t.id === 'Backend Developer') setSelectedRole('Backend Systems Engineer');
                          }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-[#11111a] hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="p-2 rounded-xl bg-white dark:bg-[#1a1a28] shadow-sm">
                              <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {t.badge}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-3">
                            {t.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {t.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* thita.ai Round Presets (Matching Photo 2) */}
                  <div className="pt-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Target Placement Round (Photo 2)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setSelectedRound('project_deep_dive')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedRound === 'project_deep_dive'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Project deep dive · 45 min
                          </p>
                          <input
                            type="radio"
                            name="round"
                            checked={selectedRound === 'project_deep_dive'}
                            onChange={() => {}}
                            className="text-indigo-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          One or two of your projects, in depth: your part, the design, what broke.
                        </p>
                      </label>

                      <label
                        onClick={() => setSelectedRound('behavioral')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedRound === 'behavioral'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Behavioural from your stories
                          </p>
                          <input
                            type="radio"
                            name="round"
                            checked={selectedRound === 'behavioral'}
                            onChange={() => {}}
                            className="text-indigo-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Situations from your own roles and projects, probed in STAR order.
                        </p>
                      </label>

                      <label
                        onClick={() => setSelectedRound('hiring_manager')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedRound === 'hiring_manager'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Hiring manager
                          </p>
                          <input
                            type="radio"
                            name="round"
                            checked={selectedRound === 'hiring_manager'}
                            onChange={() => {}}
                            className="text-indigo-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Your career story, impact and fit for the role you want next.
                        </p>
                      </label>

                      <label
                        onClick={() => setSelectedRound('technical_stack')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedRound === 'technical_stack'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Technical on your stack · 45 min
                          </p>
                          <input
                            type="radio"
                            name="round"
                            checked={selectedRound === 'technical_stack'}
                            onChange={() => {}}
                            className="text-indigo-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Language internals, runtime mechanics, SQL/NoSQL, and system design.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Role</span>
                    </Button>
                    <Button onClick={() => setCurrentStep(4)} className="gap-1.5">
                      <span>Continue to Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  STEP 4: REVIEW & START INTERVIEW (Matching Photo 3 & Master Prompt)
                  ========================================================================= */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      STEP 4 OF 4: REVIEW & START
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Check your interview, then start.
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Review your assigned interviewer, parameters, and choose your preferred answering mode.
                    </p>
                  </div>

                  {/* Review Summary Grid (Matching Photo 3 UI!) */}
                  <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Company</span>
                        <p className="font-bold text-slate-200 mt-0.5">
                          {selectedCompany || 'No specific company'}
                        </p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] text-indigo-400 hover:underline mt-1"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Seniority</span>
                        <p className="font-bold text-slate-200 mt-0.5">{experienceLevel}</p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] text-indigo-400 hover:underline mt-1"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Role</span>
                        <p className="font-bold text-slate-200 mt-0.5 truncate">{selectedRole}</p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] text-indigo-400 hover:underline mt-1"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Round</span>
                        <p className="font-bold text-slate-200 mt-0.5 capitalize truncate">
                          {selectedRound.replace(/_/g, ' ')}
                        </p>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="text-[11px] text-indigo-400 hover:underline mt-1"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Interviewer Persona Card (Photo 3: Emily Zhou) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Assigned Interviewer
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Why this interviewer? {selectedInterviewer.name} runs this round.
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedInterviewer.avatar}
                            alt={selectedInterviewer.name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">
                              {selectedInterviewer.name} ·{' '}
                              <span className="text-slate-300 font-normal">{selectedInterviewer.role}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {selectedInterviewer.bio}
                            </p>
                          </div>
                        </div>

                        {/* Switch persona */}
                        <select
                          value={selectedInterviewer.id}
                          onChange={(e) => {
                            const found = INTERVIEWER_PERSONAS.find((p) => p.id === e.target.value);
                            if (found) setSelectedInterviewer(found);
                          }}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
                        >
                          {INTERVIEWER_PERSONAS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.company})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Format Specifications */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <span>
                        ⏱️ Duration: <strong>{duration} mins</strong>
                      </span>
                      <span>·</span>
                      <span>
                        ❓ Questions: <strong>{questionCount} stages</strong>
                      </span>
                      <span>·</span>
                      <span>
                        🎯 Type: <strong>{selectedType}</strong>
                      </span>
                      {selectedType === 'Coding' && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Monaco IDE + Judge0 Sandbox Active</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Navigation & Action Buttons (Matching Photo 3: "Answer by typing" and "Start interview") */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleStartSession('text')}
                        disabled={isStarting}
                        className="gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Answer by typing</span>
                      </Button>

                      <Button
                        onClick={() => handleStartSession(interviewMode === 'text' ? 'text' : 'voice')}
                        disabled={isStarting}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 px-6"
                      >
                        {isStarting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Setting up session...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>Start interview</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
