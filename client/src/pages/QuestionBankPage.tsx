import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Filter,
  Lightbulb,
  Building,
  RotateCcw,
  Layers,
  Award,
  Code2,
  Terminal,
  Cpu,
  Database,
  HardDrive
} from 'lucide-react';
import { Question } from '@/types';
import {
  fetchQuestions,
  toggleBookmarkQuestion,
  toggleCompleteQuestion,
} from '@/services/questionService';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

const CATEGORIES = [
  'All',
  'Data Structures & Algorithms',
  'Programming',
  'Web Development',
  'Database',
  'Computer Science',
];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

interface LanguageTrack {
  id: string;
  title: string;
  topic: string;
  category?: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeText: string;
}

const CSE_CURRICULUM_TRACKS: LanguageTrack[] = [
  {
    id: 'DSA',
    title: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    category: 'Data Structures & Algorithms',
    desc: 'Arrays, Two Pointers, Trees, Graphs, DP, Heaps & Tries',
    icon: Code2,
    accentColor: 'from-emerald-500 to-teal-600',
    badgeText: 'Top DSA Track',
  },
  {
    id: 'DBMS',
    title: 'Database Management Systems',
    topic: 'Database Management Systems',
    category: 'Database',
    desc: 'B+ Tree Indexing, ACID Isolation, Normalization, Sharding & MVCC',
    icon: Database,
    accentColor: 'from-blue-600 to-indigo-700',
    badgeText: 'Top DBMS Track',
  },
  {
    id: 'OS',
    title: 'Operating Systems & Linux',
    topic: 'Operating Systems',
    category: 'Computer Science',
    desc: 'Deadlocks, Virtual Memory, CPU Scheduling, Mutex & Linux CLI',
    icon: HardDrive,
    accentColor: 'from-purple-600 to-violet-700',
    badgeText: 'Top OS Track',
  },
  {
    id: 'Networks',
    title: 'Computer Networks',
    topic: 'Computer Networks',
    category: 'Computer Science',
    desc: 'OSI 7 Layers, TCP Handshake, HTTP/1/2/3, DNS & WebSockets',
    icon: Cpu,
    accentColor: 'from-cyan-500 to-blue-600',
    badgeText: 'Top Networks Track',
  },
  {
    id: 'SystemDesign',
    title: 'Full-Stack System Design',
    topic: 'System Design',
    category: 'Web Development',
    desc: 'Microservices, Caching (Redis), Load Balancers & Kafka',
    icon: Layers,
    accentColor: 'from-rose-500 to-pink-600',
    badgeText: 'Top System Design',
  },
  {
    id: 'Java',
    title: 'Java Master Track',
    topic: 'Java',
    category: 'Programming',
    desc: 'JVM Architecture, HashMap Internals, Multithreading & GC',
    icon: Terminal,
    accentColor: 'from-orange-500 to-amber-600',
    badgeText: 'Top Java Questions',
  },
  {
    id: 'Python',
    title: 'Python Core Track',
    topic: 'Python',
    category: 'Programming',
    desc: 'GIL, Memory Management, Generators, Decorators & Asyncio',
    icon: Code2,
    accentColor: 'from-yellow-500 to-emerald-600',
    badgeText: 'Top Python Questions',
  },
  {
    id: 'C++',
    title: 'C++ Systems Track',
    topic: 'C++',
    category: 'Programming',
    desc: 'VTable / Polymorphism, Smart Pointers, RAII & Move Semantics',
    icon: Cpu,
    accentColor: 'from-indigo-500 to-violet-600',
    badgeText: 'Top C++ Questions',
  },
  {
    id: 'JavaScript',
    title: 'JavaScript & React',
    topic: 'JavaScript',
    desc: 'Event Loop, Closures, React Fiber, Hooks & Promises',
    icon: Layers,
    accentColor: 'from-amber-500 to-yellow-600',
    badgeText: 'Top JS Questions',
  },
];

const COMPANY_FILTERS = [
  'All',
  'Google',
  'Amazon',
  'Microsoft',
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Goldman Sachs',
  'Flipkart',
  'Meta',
  'Apple',
  'Adobe',
  'Salesforce',
  'Cognizant',
];

export const QuestionBankPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>(searchParams.get('company') || 'All');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState<boolean>(false);
  const [filterCompletedOnly, setFilterCompletedOnly] = useState<boolean>(false);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions({
        search: debouncedSearch,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        topic: selectedTopic,
        company: selectedCompany,
        bookmarked: filterBookmarkedOnly,
        completed: filterCompletedOnly,
      });
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [debouncedSearch, selectedCategory, selectedDifficulty, selectedTopic, selectedCompany, filterBookmarkedOnly, filterCompletedOnly]);

  const toggleExpand = (id: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const isBookmarked = await toggleBookmarkQuestion(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, isBookmarked } : q))
      );
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const isCompleted = await toggleCompleteQuestion(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, isCompleted } : q))
      );
    } catch (err) {
      console.error('Complete toggle error:', err);
    }
  };

  const questionsFeedRef = useRef<HTMLDivElement>(null);

  const scrollToQuestions = () => {
    setTimeout(() => {
      if (questionsFeedRef.current) {
        const yOffset = -80;
        const y = questionsFeedRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 70);
  };

  const handleSelectTrack = (topicName: string) => {
    if (selectedTopic === topicName) {
      scrollToQuestions();
    } else {
      setSelectedTopic(topicName);
      scrollToQuestions();
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedTopic('All');
    setSelectedCompany('All');
    setFilterBookmarkedOnly(false);
    setFilterCompletedOnly(false);
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <Badge variant="success" size="sm">Easy</Badge>;
      case 'Medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'Hard':
        return <Badge variant="danger" size="sm">Hard</Badge>;
      default:
        return <Badge size="sm">{difficulty}</Badge>;
    }
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedTopic !== 'All' ||
    selectedCompany !== 'All' ||
    Boolean(debouncedSearch.trim()) ||
    filterBookmarkedOnly ||
    filterCompletedOnly;

  const activeFilterName =
    selectedCompany !== 'All'
      ? `${selectedCompany} Placement Questions`
      : selectedTopic !== 'All'
      ? selectedTopic
      : selectedCategory !== 'All'
      ? selectedCategory
      : selectedDifficulty !== 'All'
      ? `${selectedDifficulty} Difficulty`
      : debouncedSearch
      ? `Search "${debouncedSearch}"`
      : filterBookmarkedOnly
      ? 'Bookmarked'
      : filterCompletedOnly
      ? 'Completed'
      : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header Banner - Responsive to Light & Dark Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="space-y-1 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" /> Core CSE Placement Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            CSE Placement Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Comprehensive curriculum covering <strong>Data Structures, DBMS, Operating Systems, Computer Networks, System Design, Java, Python, C++, and JavaScript</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            {hasActiveFilters ? (
              <>
                <p className="text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                  Filtered: {activeFilterName}
                </p>
                <p className="text-sm font-bold text-white">{questions.length} Questions Found</p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-slate-300">All Curated Questions</p>
                <p className="text-sm font-bold text-white">{questions.length} Questions</p>
              </>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-white border-white/20 hover:bg-white/15 text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* LANGUAGE & TOPIC DEDICATED TRACK CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              CSE Curriculum & Language Tracks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any core subject or programming language track to immediately filter its placement interview questions.
            </p>
          </div>
          {selectedTopic !== 'All' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTopic('All')}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Show All Tracks
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
          {CSE_CURRICULUM_TRACKS.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTopic === track.topic;

            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track.topic)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 dark:border-brand-500 shadow-md -translate-y-0.5'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${track.accentColor} text-white flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant={isSelected ? 'purple' : 'outline'} size="sm">
                      {track.badgeText}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {track.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className={`font-semibold flex items-center gap-1 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-brand-600'}`}>
                    {isSelected ? 'Active Filter ↓' : 'Practice Track →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div ref={questionsFeedRef} id="questions-feed-section" className="space-y-4 scroll-mt-20">
        {/* Top Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search concepts (e.g. 'Event loop', 'JVM', 'B-Tree', 'GIL', 'Garbage collection')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
              className={`h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                filterBookmarkedOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmarked</span>
            </button>

            <button
              onClick={() => setFilterCompletedOnly(!filterCompletedOnly)}
              className={`h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                filterCompletedOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </button>

            {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedTopic !== 'All' || filterBookmarkedOnly || filterCompletedOnly) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Category Tabs & Difficulty Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (cat !== 'All') setSelectedTopic('All');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Difficulty Dropdown */}
          <div className="ml-auto shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company Placement Drives Filter Bar */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-850">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-500" />
              <span>Target Company Placement Drives:</span>
            </span>
            {selectedCompany !== 'All' && (
              <button
                onClick={() => setSelectedCompany('All')}
                className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Clear company filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {COMPANY_FILTERS.map((comp) => {
              const isSelected = selectedCompany === comp;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setSelectedCompany(comp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {comp !== 'All' && <Building className="w-3 h-3 text-slate-400" />}
                  <span>{comp === 'All' ? 'All Companies' : comp}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filter Pill */}
      {(selectedTopic !== 'All' || selectedCompany !== 'All') && (
        <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between text-xs">
          <span className="text-brand-700 dark:text-brand-300 font-medium">
            Currently filtering:{' '}
            {selectedCompany !== 'All' && (
              <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white mr-2">
                <Building className="w-3.5 h-3.5 text-brand-500" /> {selectedCompany} Drive
              </span>
            )}
            {selectedTopic !== 'All' && (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Track: {selectedTopic}
              </span>
            )}{' '}
            ({questions.length} questions available)
          </span>
          <button
            onClick={() => {
              setSelectedTopic('All');
              setSelectedCompany('All');
            }}
            className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Questions Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 border border-slate-200 dark:border-slate-800">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No placement questions match your filters"
            description="Try selecting a different track card, clearing your search query, or resetting filters."
            actionText="Reset All Filters"
            onAction={resetFilters}
          />
        ) : (
          questions.map((q) => {
            const isExpanded = expandedQuestionIds.has(q._id);
            return (
              <Card
                key={q._id}
                className={`border transition-all ${
                  q.isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02] dark:border-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">{q.category}</Badge>
                      <Badge variant="info" size="sm">{q.topic}</Badge>
                      {getDifficultyBadge(q.difficulty)}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleToggleBookmark(q._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          q.isBookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={q.isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      {/* Mark Completed Button */}
                      <button
                        onClick={() => handleToggleComplete(q._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          q.isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{q.isCompleted ? 'Completed' : 'Mark Done (+15 XP)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Question */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {q.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      "{q.question}"
                    </p>
                  </div>

                  {/* Companies Asked In */}
                  {q.companies && q.companies.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Building className="w-3 h-3 text-slate-400" /> Asked in:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {q.companies.map((comp) => (
                          <button
                            key={comp}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(comp);
                              scrollToQuestions();
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors border ${
                              selectedCompany === comp
                                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                            title={`Filter questions asked in ${comp}`}
                          >
                            {comp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accordion Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExpand(q._id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <span>{isExpanded ? 'Hide Model Answer & Tips' : 'View Verified Model Answer & Tips'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-slide-up">
                      {/* Model Answer */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Candidate Answer
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {q.answer}
                        </p>
                      </div>

                      {/* Technical Explanation */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Deep-Dive Explanation
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>

                      {/* Interview Tips */}
                      {q.interviewTips && q.interviewTips.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                            <Lightbulb className="w-3.5 h-3.5" /> Senior Interviewer Tips
                          </span>
                          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                            {q.interviewTips.map((tip, idx) => (
                              <li key={idx} className="leading-relaxed">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Bottom Questions Navigation */}
        {questions.length > 0 && (
          <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Showing <strong>{questions.length} questions</strong> {selectedTopic !== 'All' ? `for ${selectedTopic}` : 'across curated tracks'}.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              leftIcon={<ChevronUp className="w-4 h-4" />}
            >
              Back to Tracks Grid ↑
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
