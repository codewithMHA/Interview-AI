import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Code2,
  Search,
  CheckCircle2,
  Circle,
  Filter,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { fetchProblems } from '@/services/problemService';
import { CodingProblemListItem } from '@/types';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

const CATEGORIES = [
  'All',
  'Arrays',
  'Strings',
  'Two Pointers',
  'Stack',
  'Linked Lists',
  'Trees',
  'Searching',
  'Sorting',
  'Dynamic Programming',
  'Graphs',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

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
  'Cisco',
];

export const CodingPracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<CodingProblemListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>(searchParams.get('company') || 'All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadProblems = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProblems({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        company: selectedCompany,
        search: debouncedSearch,
      });
      setProblems(data);
    } catch (err) {
      console.error('Failed to load coding problems:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [selectedCategory, selectedDifficulty, selectedCompany, debouncedSearch]);

  const solvedCount = problems.filter((p) => p.isSolved).length;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedCompany('All');
    setSearchTerm('');
    setDebouncedSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header Banner - Responsive to Light & Dark Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/30 text-brand-200 text-xs font-semibold">
            <Code2 className="w-4 h-4 text-brand-300" /> DSA & Algorithmic Sandbox
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Coding Practice & Judge0 Sandbox
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Practice high-yield DSA placement problems with our in-browser Monaco Editor,
            multi-language code execution in JavaScript, Python, Java & C++, and comprehensive test cases.
          </p>
        </div>

        {/* Quick Stats Pill Card */}
        <div className="relative z-10 flex flex-row sm:flex-col gap-3 sm:gap-2.5 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Problems Solved</span>
            <span className="text-xs font-bold text-emerald-400">
              {solvedCount} / {problems.length}
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${problems.length > 0 ? (solvedCount / problems.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
            <span className="text-emerald-300 font-semibold">{easyCount} Easy</span>
            <span className="text-amber-300 font-semibold">{mediumCount} Med</span>
            <span className="text-rose-300 font-semibold">{hardCount} Hard</span>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="space-y-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-500'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems by title, keyword, or company (e.g. 'Two Sum', 'Amazon', 'Sliding Window')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-colors"
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

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
              {DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? diff === 'Easy'
                          ? 'bg-emerald-500 text-white'
                          : diff === 'Medium'
                          ? 'bg-amber-500 text-white'
                          : diff === 'Hard'
                          ? 'bg-rose-500 text-white'
                          : 'bg-brand-600 text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            {(selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedCompany !== 'All' || searchTerm) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Company Placement Drives Bar */}
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

      {/* Active Company Filter Pill */}
      {selectedCompany !== 'All' && (
        <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between text-xs">
          <span className="text-brand-700 dark:text-brand-300 font-medium flex items-center gap-1.5">
            <Building className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>
              Targeting <strong>{selectedCompany} Placement Coding Problems</strong> ({problems.length} problems found)
            </span>
          </span>
          <button
            onClick={() => setSelectedCompany('All')}
            className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            Clear company filter
          </button>
        </div>
      )}

      {/* Problems Table / List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-60" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={Code2}
                title="No coding problems match your filters"
                description="Try broadening your search term or selecting 'All' categories."
                actionText="Reset All Filters"
                onAction={resetFilters}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="col-span-1">Status</div>
                <div className="col-span-5">Title & Category</div>
                <div className="col-span-2 text-center">Difficulty</div>
                <div className="col-span-2 text-center">Acceptance</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Problem Rows */}
              {problems.map((prob, idx) => {
                const difficultyBadge =
                  prob.difficulty === 'Easy' ? (
                    <Badge variant="success" size="sm">Easy</Badge>
                  ) : prob.difficulty === 'Medium' ? (
                    <Badge variant="warning" size="sm">Medium</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Hard</Badge>
                  );

                return (
                  <div
                    key={prob._id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-5 sm:px-6 py-4 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Status */}
                    <div className="col-span-1 hidden sm:flex items-center">
                      {prob.isSolved ? (
                        <span title="Solved">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </span>
                      ) : (
                        <span title="Unsolved">
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </span>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="col-span-5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="sm:hidden">
                          {prob.isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </span>
                        <Link
                          to={`/problems/${prob.slug}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                          {prob.title}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                          {prob.category}
                        </span>
                        {prob.companies && prob.companies.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            {prob.companies.slice(0, 3).map((comp) => (
                              <button
                                key={comp}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedCompany(comp);
                                }}
                                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold transition-colors border ${
                                  selectedCompany === comp
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                                title={`Filter problems asked in ${comp}`}
                              >
                                {comp}
                              </button>
                            ))}
                            {prob.companies.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{prob.companies.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2 text-left sm:text-center">
                      {difficultyBadge}
                    </div>

                    {/* Acceptance */}
                    <div className="col-span-2 text-left sm:text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                      <span>{prob.acceptanceRate}%</span>
                    </div>

                    {/* Action */}
                    <div className="col-span-2 text-right">
                      <Link to={`/problems/${prob.slug}`}>
                        <Button
                          variant={prob.isSolved ? 'outline' : 'primary'}
                          size="sm"
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          {prob.isSolved ? 'Review' : 'Solve'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
