import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Info,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Bot,
  BookOpen,
  X,
  Clock
} from 'lucide-react';
import type { DailyActivitySummary, HeatmapDay } from '@/services/analyticsService';

export interface LeetCodeStreakCalendarProps {
  currentStreak?: number;
  bestStreak?: number;
  activityMap?: Record<string, number>;
  dailyActivityMap?: Record<string, DailyActivitySummary>;
  heatmap?: HeatmapDay[];
  annualHeatmap?: HeatmapDay[];
  onDayClick?: (dateStr: string, count: number) => void;
  className?: string;
  showAnnualToggle?: boolean;
  layout?: 'tabs' | 'split';
  defaultView?: 'calendar' | 'annual';
}

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatReadableDate = (dateStr: string): string => {
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getDifficultyPillClass = (difficulty?: string) => {
  const d = (difficulty || '').toLowerCase();
  if (d === 'hard') {
    return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25';
  }
  if (d === 'medium') {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25';
  }
  return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
};

export const LeetCodeStreakCalendar: React.FC<LeetCodeStreakCalendarProps> = ({
  currentStreak = 0,
  bestStreak = 0,
  activityMap = {},
  dailyActivityMap = {},
  heatmap = [],
  annualHeatmap = [],
  onDayClick,
  className = '',
  showAnnualToggle = true,
  layout = 'tabs',
  defaultView = 'calendar',
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'annual'>(defaultView);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [pinnedDate, setPinnedDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);

      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00:00:00 left');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)} left`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => toDateKey(today), [today]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDayString = (dayNum: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Merge count lookup from dailyActivityMap, activityMap, annualHeatmap, and heatmap
  const heatmapLookup = useMemo(() => {
    const map: Record<string, number> = { ...activityMap };
    annualHeatmap.forEach((h) => {
      if (map[h.date] === undefined) map[h.date] = h.count;
    });
    heatmap.forEach((h) => {
      if (map[h.date] === undefined) map[h.date] = h.count;
    });
    Object.values(dailyActivityMap).forEach((entry) => {
      if (entry?.date && (map[entry.date] === undefined || entry.totalCount > map[entry.date])) {
        map[entry.date] = entry.totalCount;
      }
    });
    return map;
  }, [activityMap, annualHeatmap, heatmap, dailyActivityMap]);

  const getCountForDate = (dateStr: string): number => heatmapLookup[dateStr] ?? 0;

  const getSummaryForDate = (dateStr: string): DailyActivitySummary => {
    const detailed = dailyActivityMap[dateStr];
    if (detailed) return detailed;

    const count = getCountForDate(dateStr);
    return {
      date: dateStr,
      totalCount: count,
      problemsSolvedCount: count,
      submissionsCount: count,
      interviewsCount: 0,
      questionsCount: 0,
      solvedProblems: [],
      activities:
        count > 0
          ? [
              {
                type: 'problem',
                title: `${count} practice activit${count === 1 ? 'y' : 'ies'} recorded`,
                detail: 'Completed placement tasks',
                status: 'Accepted',
              },
            ]
          : [],
    };
  };

  // Build week-aligned 365-day annual grid (columns = weeks, rows = Sun..Sat)
  const { weekColumns, monthLabels, totalAnnualActivities, totalProblemsSolvedInYear, activeDaysCount } =
    useMemo(() => {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364);

      const leadingPads = startDate.getDay();
      type GridCell = {
        date: string;
        count: number;
        level: number;
        isPadding?: boolean;
      };

      const flatCells: GridCell[] = [];
      for (let p = 0; p < leadingPads; p++) {
        flatCells.push({ date: `pad-${p}`, count: 0, level: -1, isPadding: true });
      }

      let totalActs = 0;
      let totalSolvedYear = 0;
      let activeDays = 0;
      const seenSolvedIds = new Set<string>();

      const cursor = new Date(startDate);
      while (cursor <= today) {
        const dateStr = toDateKey(cursor);
        const count = getCountForDate(dateStr);
        const level = count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count > 0 ? 1 : 0;

        totalActs += count;
        if (count > 0) activeDays += 1;

        const detail = dailyActivityMap[dateStr];
        if (detail?.solvedProblems && detail.solvedProblems.length > 0) {
          detail.solvedProblems.forEach((sp) => seenSolvedIds.add(sp.slug || sp.id || sp.title));
        }

        flatCells.push({ date: dateStr, count, level });
        cursor.setDate(cursor.getDate() + 1);
      }

      totalSolvedYear =
        seenSolvedIds.size > 0
          ? seenSolvedIds.size
          : Object.values(dailyActivityMap).reduce((sum, d) => sum + (d?.problemsSolvedCount || 0), 0);

      const cols: GridCell[][] = [];
      for (let i = 0; i < flatCells.length; i += 7) {
        cols.push(flatCells.slice(i, i + 7));
      }

      const labels: Array<{ colIndex: number; label: string }> = [];
      let lastMonth = -1;
      cols.forEach((col, colIndex) => {
        const firstReal = col.find((c) => !c.isPadding);
        if (!firstReal) return;
        const d = new Date(`${firstReal.date}T00:00:00`);
        const m = d.getMonth();
        if (m !== lastMonth) {
          // Avoid overlapping labels on first partial week if next month starts almost immediately
          if (labels.length === 0 || colIndex - labels[labels.length - 1].colIndex >= 2) {
            labels.push({ colIndex, label: MONTH_SHORT[m] });
          } else if (labels.length === 1 && colIndex <= 2) {
            labels[0] = { colIndex, label: MONTH_SHORT[m] };
          }
          lastMonth = m;
        }
      });

      return {
        weekColumns: cols,
        monthLabels: labels,
        totalAnnualActivities: totalActs,
        totalProblemsSolvedInYear: totalSolvedYear,
        activeDaysCount: activeDays,
      };
    }, [today, heatmapLookup, dailyActivityMap]);

  // Default latest active date so inspector is immediately useful even before hovering
  const latestActiveDate = useMemo(() => {
    const activeDates = Object.keys(heatmapLookup)
      .filter((k) => heatmapLookup[k] > 0)
      .sort();
    return activeDates.length > 0 ? activeDates[activeDates.length - 1] : null;
  }, [heatmapLookup]);

  const inspectedDate = hoveredDate || pinnedDate || latestActiveDate || todayDateStr;
  const inspectedSummary = getSummaryForDate(inspectedDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date());
    setPinnedDate(todayDateStr);
  };

  const isViewingCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDayDisplay = isViewingCurrentMonth ? today.getDate() : 1;

  const getHeatmapSquareColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-emerald-500 dark:bg-emerald-400 border border-emerald-400/80 shadow-[0_0_6px_rgba(16,185,129,0.35)]';
      case 3:
        return 'bg-emerald-600 dark:bg-emerald-500 border border-emerald-500/60';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-600/85 border border-emerald-400/50';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-900/90 border border-emerald-300/60 dark:border-emerald-700/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500';
    }
  };

  const renderFloatingTooltip = (
    dateStr: string,
    horizontalAlign: 'left' | 'center' | 'right' = 'center'
  ) => {
    const info = getSummaryForDate(dateStr);
    const alignClass =
      horizontalAlign === 'left'
        ? 'left-0'
        : horizontalAlign === 'right'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';

    return (
      <div
        className={`pointer-events-none absolute bottom-full mb-2.5 z-50 w-64 sm:w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-3 text-left ${alignClass}`}
      >
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-900 dark:text-white">
            {formatReadableDate(dateStr)}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              info.totalCount > 0
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {info.problemsSolvedCount} Solved
          </span>
        </div>

        {info.totalCount > 0 ? (
          <div className="mt-2 space-y-1.5">
            <div className="flex flex-wrap gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
              {info.problemsSolvedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {info.problemsSolvedCount} Problem{info.problemsSolvedCount > 1 ? 's' : ''}
                </span>
              )}
              {info.interviewsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                  {info.interviewsCount} Mock{info.interviewsCount > 1 ? 's' : ''}
                </span>
              )}
              {info.questionsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {info.questionsCount} CS Q{info.questionsCount > 1 ? 's' : ''}
                </span>
              )}
              {info.submissionsCount > info.problemsSolvedCount && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {info.submissionsCount} Submissions
                </span>
              )}
            </div>

            {info.activities.length > 0 && (
              <ul className="space-y-1 pt-0.5">
                {info.activities.slice(0, 4).map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        act.type === 'problem'
                          ? 'bg-emerald-500'
                          : act.type === 'interview'
                          ? 'bg-indigo-500'
                          : act.type === 'question'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {act.title}
                      </p>
                      {act.detail && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {act.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
                {info.activities.length > 4 && (
                  <li className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold pl-3">
                    +{info.activities.length - 4} more recorded below
                  </li>
                )}
              </ul>
            )}
          </div>
        ) : (
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            0 problems solved on this date
          </p>
        )}
      </div>
    );
  };

  const renderMonthlyCalendar = () => (
    <div className="space-y-3.5 relative z-10">
      {/* Month Navigator */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#25252e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            {monthName} {year}
          </span>
          {!isViewingCurrentMonth && (
            <button
              type="button"
              onClick={handleResetToToday}
              className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900"
            >
              Today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#25252e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subheader: Day X & Reset Timer */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e1e26] border border-slate-200/70 dark:border-slate-800 text-xs">
        <span className="text-slate-900 dark:text-white font-bold">Day {currentDayDisplay}</span>
        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-indigo-500" />
          {timeLeft || '00:00:00 left'}
        </span>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_SHORT.map((dayChar, i) => (
          <div key={i} className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">
            {dayChar}
          </div>
        ))}
      </div>

      {/* Calendar Dates */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8 mx-auto" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDayString(dayNum);
          const colIdx = (firstDayOfWeek + i) % 7;
          const align: 'left' | 'center' | 'right' =
            colIdx <= 1 ? 'left' : colIdx >= 5 ? 'right' : 'center';

          const isToday = dateStr === todayDateStr;
          const isPinned = dateStr === pinnedDate;
          const isHovered = hoveredDate === dateStr;
          const daySummary = getSummaryForDate(dateStr);
          const hasActivity = daySummary.totalCount > 0;
          const isPast = dateStr < todayDateStr;
          const isFuture = dateStr > todayDateStr;

          return (
            <div key={dayNum} className="flex items-center justify-center relative">
              {isHovered && renderFloatingTooltip(dateStr, align)}

              <button
                type="button"
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate((prev) => (prev === dateStr ? null : prev))}
                onFocus={() => setHoveredDate(dateStr)}
                onBlur={() => setHoveredDate((prev) => (prev === dateStr ? null : prev))}
                onClick={() => {
                  setPinnedDate(dateStr);
                  onDayClick?.(dateStr, daySummary.totalCount);
                }}
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isToday
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md shadow-indigo-500/30'
                    : isPinned
                    ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                    : hasActivity
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 hover:scale-110'
                    : isPast
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#25252e]'
                    : isFuture
                    ? 'text-slate-400 dark:text-slate-600 hover:bg-slate-100/60 dark:hover:bg-[#25252e]/50'
                    : 'text-slate-500'
                }`}
              >
                {dayNum}
              </button>

              {hasActivity && !isToday && !isPinned && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Streak Summary Row */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1e1e26] border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Current Streak
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/30 shrink-0" />
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentStreak} day{currentStreak === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1e1e26] border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Best Streak
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {Math.max(bestStreak, currentStreak)} day{Math.max(bestStreak, currentStreak) === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {layout === 'tabs' && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Hover or click any date to inspect</span>
          </div>
          <Link
            to="/coding"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
          >
            <span>Daily Problem</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );

  const renderAnnualHeatmap = () => (
    <div className="space-y-3.5 relative z-10 flex flex-col justify-between h-full">
      {/* Top Year Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Activities (1 yr): </span>
            <span className="font-extrabold text-slate-900 dark:text-white">{totalAnnualActivities}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Problems Solved: </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalProblemsSolvedInYear}
            </span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 dark:text-slate-400">Active Days: </span>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{activeDaysCount} days</span>
        </div>
      </div>

      {/* Month Labels + Week-Aligned 53x7 Contribution Heatmap */}
      <div className="overflow-x-auto pt-1 pb-2 no-scrollbar">
        <div className="min-w-[630px]">
          {/* Month Header Row */}
          <div className="flex pl-7 mb-1.5 relative h-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {weekColumns.map((_, colIdx) => {
              const matchedLabel = monthLabels.find((m) => m.colIndex === colIdx);
              return (
                <div key={colIdx} className="flex-1 min-w-[10px] relative">
                  {matchedLabel && (
                    <span className="absolute left-0 top-0 whitespace-nowrap">{matchedLabel.label}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid Body: Weekday Labels + 53 Week Columns */}
          <div className="flex gap-1.5 items-stretch">
            {/* Weekday Axis */}
            <div className="grid grid-rows-7 gap-[3px] w-6 shrink-0 text-[9px] font-medium text-slate-400 dark:text-slate-500 select-none">
              <span />
              <span className="leading-[11px]">Mon</span>
              <span />
              <span className="leading-[11px]">Wed</span>
              <span />
              <span className="leading-[11px]">Fri</span>
              <span />
            </div>

            {/* Week Columns */}
            <div className="flex-1 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weekColumns.length}, minmax(0, 1fr))` }}>
              {weekColumns.map((col, colIdx) => {
                const align: 'left' | 'center' | 'right' =
                  colIdx < 9 ? 'left' : colIdx > weekColumns.length - 10 ? 'right' : 'center';

                return (
                  <div key={colIdx} className="grid grid-rows-7 gap-[3px]">
                    {col.map((cell) => {
                      if (cell.isPadding) {
                        return <div key={cell.date} className="w-full aspect-square max-w-[12px]" />;
                      }

                      const isSelected = pinnedDate === cell.date;
                      const isHovered = hoveredDate === cell.date;
                      const isTodayCell = cell.date === todayDateStr;

                      return (
                        <div key={cell.date} className="relative flex items-center justify-center">
                          {isHovered && renderFloatingTooltip(cell.date, align)}

                          <button
                            type="button"
                            aria-label={`${cell.date}: ${cell.count} activities`}
                            onMouseEnter={() => setHoveredDate(cell.date)}
                            onMouseLeave={() =>
                              setHoveredDate((prev) => (prev === cell.date ? null : prev))
                            }
                            onFocus={() => setHoveredDate(cell.date)}
                            onBlur={() =>
                              setHoveredDate((prev) => (prev === cell.date ? null : prev))
                            }
                            onClick={() => {
                              setPinnedDate(cell.date);
                              onDayClick?.(cell.date, cell.count);
                            }}
                            className={`w-2.5 h-2.5 xl:w-[11px] xl:h-[11px] rounded-[2.5px] transition-transform duration-150 cursor-pointer hover:scale-125 focus:outline-none ${getHeatmapSquareColor(
                              cell.level
                            )} ${
                              isSelected
                                ? 'ring-2 ring-brand-500 scale-125 z-20'
                                : isTodayCell
                                ? 'ring-1 ring-indigo-500/80'
                                : ''
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/90" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-600/85" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-400" />
          <span>More</span>
        </div>

        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Hover any date for solved problems & activity breakdown
        </span>
      </div>

      {/* Live Inspected Date Breakdown Panel */}
      <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1e1e26] border border-slate-200/90 dark:border-slate-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formatReadableDate(inspectedSummary.date)}
            </span>
            {pinnedDate === inspectedSummary.date && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/25">
                Pinned
                <button
                  type="button"
                  onClick={() => setPinnedDate(null)}
                  className="hover:text-rose-500"
                  title="Clear pinned date"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            {inspectedSummary.problemsSolvedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inspectedSummary.problemsSolvedCount} Problem
                {inspectedSummary.problemsSolvedCount > 1 ? 's' : ''} Solved
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">0 Problems Solved</span>
            )}

            {inspectedSummary.interviewsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <Bot className="w-3.5 h-3.5" />
                {inspectedSummary.interviewsCount} Mock Interview
                {inspectedSummary.interviewsCount > 1 ? 's' : ''}
              </span>
            )}

            {inspectedSummary.questionsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-3.5 h-3.5" />
                {inspectedSummary.questionsCount} CS Q
                {inspectedSummary.questionsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {inspectedSummary.activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {inspectedSummary.activities.map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#14141a] border border-slate-200/80 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {act.type === 'problem' || act.type === 'attempt' ? (
                    <Code2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        act.type === 'problem' ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    />
                  ) : act.type === 'interview' ? (
                    <Bot className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {act.title}
                    </p>
                    {act.detail && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {act.detail}
                      </p>
                    )}
                  </div>
                </div>

                {act.difficulty && (
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getDifficultyPillClass(
                      act.difficulty
                    )}`}
                  >
                    {act.difficulty}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No coding submissions or mock interviews recorded on this date. Solve a problem in the Coding Sandbox to build your streak!
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#15151a] text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl p-5 sm:p-6 transition-all relative ${className}`}
    >
      {/* Clipped Decorative Glow Layer (keeps hover tooltips unclipped) */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full" />
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Consistency & Activity Heatmap
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Daily Problem Solving, Mock Interviews & Streak Tracker
            </p>
          </div>
        </div>

        {/* View Switcher (in tabs mode OR mobile viewport of split mode) */}
        {showAnnualToggle && (
          <div
            className={`flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#23232b] border border-slate-200 dark:border-slate-800 text-xs ${
              layout === 'split' ? 'lg:hidden' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('annual')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'annual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              365-Day Heatmap
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {layout === 'split' ? (
        <>
          {/* Desktop Split View: Monthly Calendar (Left) + 365-Day Contribution Heatmap (Right) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start relative z-20">
            <div className="lg:col-span-4 lg:pr-5 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800/80">
              {renderMonthlyCalendar()}
            </div>
            <div className="lg:col-span-8">{renderAnnualHeatmap()}</div>
          </div>

          {/* Mobile / Tablet Tabbed View */}
          <div className="lg:hidden relative z-20">
            {viewMode === 'calendar' ? renderMonthlyCalendar() : renderAnnualHeatmap()}
          </div>
        </>
      ) : (
        <div className="relative z-20">
          {viewMode === 'calendar' ? (
            <div className="space-y-3">
              {renderMonthlyCalendar()}
              {/* Also show compact date breakdown in tabs monthly view when a date is inspected */}
              {pinnedDate && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1e1e26] border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatReadableDate(inspectedSummary.date)}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {inspectedSummary.problemsSolvedCount} solved
                    </span>
                  </div>
                  {inspectedSummary.activities.slice(0, 3).map((act, idx) => (
                    <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      • {act.title} {act.detail ? `(${act.detail})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            renderAnnualHeatmap()
          )}
        </div>
      )}
    </div>
  );
};

export const InterviewStreakCalendar = LeetCodeStreakCalendar;
export type InterviewStreakCalendarProps = LeetCodeStreakCalendarProps;
