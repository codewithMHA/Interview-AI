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
  BarChart2
} from 'lucide-react';

export interface LeetCodeStreakCalendarProps {
  currentStreak?: number;
  bestStreak?: number;
  activityMap?: Record<string, number>;
  heatmap?: Array<{ date: string; count: number; level: number }>;
  onDayClick?: (dateStr: string, count: number) => void;
  className?: string;
  showAnnualToggle?: boolean;
}

export const LeetCodeStreakCalendar: React.FC<LeetCodeStreakCalendarProps> = ({
  currentStreak = 0,
  bestStreak = 0,
  activityMap = {},
  heatmap = [],
  onDayClick,
  className = '',
  showAnnualToggle = true
}) => {
  // Calendar view state: defaults to current month & year
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'annual'>('calendar');
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ date: string; count: number } | null>(null);

  // Countdown timer to midnight (05:41:35 left)
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
  const todayDateStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // First day of the month & days count
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to format YYYY-MM-DD
  const formatDayString = (dayNum: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayInfo(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayInfo(null);
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date());
    setSelectedDayInfo(null);
  };

  // Current day number if in the current viewed month
  const isViewingCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDayDisplay = isViewingCurrentMonth ? today.getDate() : 1;

  // Compute activity count for day
  const getActivityForDay = (dayNum: number): number => {
    const dayStr = formatDayString(dayNum);
    if (activityMap[dayStr] !== undefined) {
      return activityMap[dayStr];
    }
    const found = heatmap.find((h) => h.date === dayStr);
    return found ? found.count : 0;
  };

  // 365-day annual heatmap helper
  const annualDays = useMemo(() => {
    const days: Array<{ date: string; count: number; level: number; dayOfWeek: number }> = [];
    const cursor = new Date(today);
    // 52 weeks = 364 days + today = 365 days
    cursor.setDate(cursor.getDate() - 364);

    while (cursor <= today) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const count = activityMap[dateStr] || (heatmap.find((h) => h.date === dateStr)?.count ?? 0);
      const level = count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count > 0 ? 1 : 0;

      days.push({
        date: dateStr,
        count,
        level,
        dayOfWeek: cursor.getDay()
      });

      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [today, activityMap, heatmap]);

  const totalAnnualSubmissions = useMemo(() => {
    return annualDays.reduce((acc, d) => acc + d.count, 0);
  }, [annualDays]);

  const activeDaysCount = useMemo(() => {
    return annualDays.filter((d) => d.count > 0).length;
  }, [annualDays]);

  const getHeatmapSquareColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-emerald-500 hover:bg-emerald-400 border border-emerald-400/80';
      case 3:
        return 'bg-emerald-600 hover:bg-emerald-500';
      case 2:
        return 'bg-emerald-500/80 hover:bg-emerald-500';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-900/80 hover:bg-emerald-300 dark:hover:bg-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-750/30';
    }
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#15151a] text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl p-5 sm:p-6 transition-all relative overflow-hidden ${className}`}
    >
      {/* Background subtle glow effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-44 h-44 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              InterviewAI Consistency Engine
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily Placement Challenge & Streak Calendar</p>
          </div>
        </div>

        {/* View Switcher: Monthly vs Annual */}
        {showAnnualToggle && (
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#23232b] border border-slate-200 dark:border-slate-800 text-xs">
            <button
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
              onClick={() => setViewMode('annual')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'annual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              365-Day Grid
            </button>
          </div>
        )}
      </div>

      {viewMode === 'calendar' ? (
        /* =========================================================================
           1. EXACT MONTHLY CALENDAR STREAK WIDGET (LIGHT + DARK RESPONSIVE)
           ========================================================================= */
        <div className="space-y-4 relative z-10">
          {/* Calendar Month Selector Header */}
          <div className="flex items-center justify-between px-1 py-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#25252e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {monthName} {year}
              </span>
              {!isViewingCurrentMonth && (
                <button
                  onClick={handleResetToToday}
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#25252e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader: Day X & Real-Time Countdown Timer */}
          <div className="flex items-center justify-between px-1 text-xs font-semibold">
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              Day {currentDayDisplay}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] tracking-wide">
              {timeLeft || '05:41:35 left'}
            </span>
          </div>

          {/* Days of Week Header (S M T W T F S) */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, i) => (
              <div
                key={i}
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 py-1"
              >
                {dayChar}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
            {/* Empty slots for leading offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9 mx-auto" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDayString(dayNum);
              const isToday = dateStr === todayDateStr;
              const activityCount = getActivityForDay(dayNum);
              const isSolved = activityCount > 0;
              const isPast = new Date(dateStr) < today && !isToday;
              const isFuture = new Date(dateStr) > today;

              return (
                <div
                  key={dayNum}
                  className="flex items-center justify-center relative group"
                >
                  <button
                    onClick={() => {
                      setSelectedDayInfo({ date: dateStr, count: activityCount });
                      if (onDayClick) onDayClick(dateStr, activityCount);
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                      isToday
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 font-bold shadow-md shadow-indigo-500/30'
                        : isSolved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-500/40 hover:scale-105'
                        : isPast
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#25252e] hover:text-slate-900 dark:hover:text-white'
                        : isFuture
                        ? 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {dayNum}
                  </button>

                  {/* Solved green dot indicator */}
                  {isSolved && !isToday && (
                    <span className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Day Toast / Inspector */}
          {selectedDayInfo && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#23232b] border border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs animate-slide-up">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Date: </span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDayInfo.date}</span>
              </div>
              <div>
                {selectedDayInfo.count > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedDayInfo.count} problem{selectedDayInfo.count > 1 ? 's' : ''} solved
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">No activity recorded</span>
                )}
              </div>
            </div>
          )}

          {/* Bottom Streak Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Current Streak */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202026] border border-slate-200 dark:border-slate-800/80">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Current Streak
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/30 shrink-0" />
                <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {currentStreak} days
                </span>
              </div>
            </div>

            {/* Best Streak */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202026] border border-slate-200 dark:border-slate-800/80">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Best Streak
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {bestStreak || currentStreak} days
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Tip */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Solve one problem a day to keep your streak</span>
            </div>
            <Link
              to="/coding"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0"
            >
              <span>Daily Problem</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        /* =========================================================================
           2. 365-DAY ANNUAL HEATMAP MATRIX (LIGHT + DARK RESPONSIVE)
           ========================================================================= */
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Submissions in the last year: </span>
              <span className="font-extrabold text-slate-900 dark:text-white">{totalAnnualSubmissions}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Active Days: </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{activeDaysCount} days</span>
            </div>
          </div>

          {/* Heatmap Grid Wrapper */}
          <div className="overflow-x-auto pb-2 no-scrollbar">
            <div className="min-w-[640px]">
              {/* Heatmap Squares: 52 columns x 7 rows */}
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {annualDays.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count} activities`}
                    onClick={() => {
                      setSelectedDayInfo({ date: d.date, count: d.count });
                      if (onDayClick) onDayClick(d.date, d.count);
                    }}
                    className={`w-2.5 h-2.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${getHeatmapSquareColor(
                      d.level
                    )}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900/80" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-600" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
              <span>More</span>
            </div>

            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              Calibrated to Monaco & AI Mock Interviews
            </span>
          </div>

          {/* Selected Day Toast */}
          {selectedDayInfo && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#23232b] border border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs animate-slide-up">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Date: </span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDayInfo.date}</span>
              </div>
              <div>
                {selectedDayInfo.count > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedDayInfo.count} activities completed
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">0 submissions on this date</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const InterviewStreakCalendar = LeetCodeStreakCalendar;
export type InterviewStreakCalendarProps = LeetCodeStreakCalendarProps;
