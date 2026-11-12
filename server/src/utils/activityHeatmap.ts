export interface DailyActivityItem {
  type: 'problem' | 'attempt' | 'interview' | 'question';
  title: string;
  detail?: string;
  difficulty?: string;
  status?: string;
}

export interface SolvedProblemDetail {
  id: string;
  title: string;
  slug?: string;
  difficulty?: string;
  language?: string;
}

export interface DailyActivitySummary {
  date: string;
  totalCount: number;
  problemsSolvedCount: number;
  submissionsCount: number;
  interviewsCount: number;
  questionsCount: number;
  solvedProblems: SolvedProblemDetail[];
  activities: DailyActivityItem[];
}

export interface HeatmapPoint {
  date: string;
  count: number;
  level: number;
}

export interface ActivityHeatmapResult {
  activityMap: Record<string, number>;
  dailyActivityMap: Record<string, DailyActivitySummary>;
  heatmap: HeatmapPoint[];
  annualHeatmap: HeatmapPoint[];
  streak: number;
  bestStreak: number;
}

export const toLocalDateKey = (input: Date | string | number | undefined | null): string | null => {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ensureDayEntry = (
  map: Record<string, DailyActivitySummary>,
  dateStr: string
): DailyActivitySummary => {
  if (!map[dateStr]) {
    map[dateStr] = {
      date: dateStr,
      totalCount: 0,
      problemsSolvedCount: 0,
      submissionsCount: 0,
      interviewsCount: 0,
      questionsCount: 0,
      solvedProblems: [],
      activities: [],
    };
  }
  return map[dateStr];
};

const resolveProblemMeta = (sub: any, allProblems: any[]) => {
  const rawId = sub.problemId ? String(sub.problemId) : '';
  const rawSlug = sub.problemSlug ? String(sub.problemSlug) : '';

  const matched = allProblems.find((p: any) => {
    const pId = p._id ? String(p._id) : p.id ? String(p.id) : '';
    const pSlug = p.slug ? String(p.slug) : '';
    return (
      (rawId && (pId === rawId || pSlug === rawId)) ||
      (rawSlug && (pSlug === rawSlug || pId === rawSlug))
    );
  });

  const looksLikeObjectId = /^[a-f0-9]{24}$/i.test(rawId);
  const title =
    matched?.title ||
    sub.problemTitle ||
    sub.problemSlug ||
    (!looksLikeObjectId && rawId ? rawId : 'Coding Challenge');

  return {
    id: matched?._id ? String(matched._id) : matched?.id ? String(matched.id) : rawSlug || rawId || title,
    slug: matched?.slug || sub.problemSlug || (!looksLikeObjectId ? rawId : undefined),
    title,
    difficulty: matched?.difficulty || sub.difficulty || undefined,
  };
};

export const buildActivityHeatmapData = ({
  submissions = [],
  interviews = [],
  completedQuestionsList = [],
  allProblems = [],
  profileStreakCount,
}: {
  submissions: any[];
  interviews: any[];
  completedQuestionsList?: any[];
  allProblems: any[];
  profileStreakCount?: number;
}): ActivityHeatmapResult => {
  const activityMap: Record<string, number> = {};
  const dailyActivityMap: Record<string, DailyActivitySummary> = {};
  const solvedProblemKeysByDay: Record<string, Set<string>> = {};

  // 1. Coding sandbox submissions
  submissions.forEach((s) => {
    const dateStr = toLocalDateKey(s.createdAt);
    if (!dateStr) return;

    const meta = resolveProblemMeta(s, allProblems);
    const day = ensureDayEntry(dailyActivityMap, dateStr);
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    day.totalCount += 1;
    day.submissionsCount += 1;

    const lang = s.language ? String(s.language) : 'Code';
    const isAccepted = s.status === 'Accepted';

    if (isAccepted) {
      if (!solvedProblemKeysByDay[dateStr]) {
        solvedProblemKeysByDay[dateStr] = new Set<string>();
      }
      const uniqueKey = meta.slug || meta.id || meta.title;
      if (!solvedProblemKeysByDay[dateStr].has(uniqueKey)) {
        solvedProblemKeysByDay[dateStr].add(uniqueKey);
        day.problemsSolvedCount += 1;
        day.solvedProblems.push({
          id: meta.id,
          title: meta.title,
          slug: meta.slug,
          difficulty: meta.difficulty,
          language: lang,
        });
        day.activities.push({
          type: 'problem',
          title: meta.title,
          difficulty: meta.difficulty,
          detail: `${meta.difficulty || 'DSA'} · ${lang} · Accepted`,
          status: 'Accepted',
        });
      }
    } else {
      day.activities.push({
        type: 'attempt',
        title: meta.title,
        difficulty: meta.difficulty,
        detail: `${lang} · ${s.status || 'Tested'}`,
        status: s.status || 'Tested',
      });
    }
  });

  // 2. AI Mock Interviews
  interviews.forEach((iv) => {
    const dateStr = toLocalDateKey(iv.completedAt || iv.createdAt);
    if (!dateStr) return;

    const day = ensureDayEntry(dailyActivityMap, dateStr);
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    day.totalCount += 1;
    day.interviewsCount += 1;

    const roleLabel = iv.role || 'Placement';
    const isCompleted = iv.status === 'completed';
    day.activities.push({
      type: 'interview',
      title: `${roleLabel} AI Mock Interview`,
      detail: isCompleted
        ? `${iv.overallScore ?? 0}% score · ${iv.category || 'Technical'}`
        : `In Progress · ${iv.category || 'Technical'}`,
      status: isCompleted ? 'Completed' : 'In Progress',
    });
  });

  // 3. Question bank items completed (only when timestamp exists)
  completedQuestionsList.forEach((q: any) => {
    const dateStr = toLocalDateKey(q?.completedAt || q?.updatedAt);
    if (!dateStr) return;

    const day = ensureDayEntry(dailyActivityMap, dateStr);
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    day.totalCount += 1;
    day.questionsCount += 1;

    day.activities.push({
      type: 'question',
      title: q.title || 'CS Concept Reviewed',
      difficulty: q.difficulty,
      detail: `${q.topic || q.category || 'Core CS'} · Practiced`,
      status: 'Completed',
    });
  });

  // 4. Current & best consecutive streak
  const today = new Date();
  let realStreak = 0;
  const checkCursor = new Date(today);
  const todayStr = toLocalDateKey(checkCursor)!;

  if ((activityMap[todayStr] || 0) > 0) {
    realStreak = 1;
    checkCursor.setDate(checkCursor.getDate() - 1);
    while (true) {
      const prevStr = toLocalDateKey(checkCursor)!;
      if ((activityMap[prevStr] || 0) > 0) {
        realStreak++;
        checkCursor.setDate(checkCursor.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    checkCursor.setDate(checkCursor.getDate() - 1);
    const yesterdayStr = toLocalDateKey(checkCursor)!;
    if ((activityMap[yesterdayStr] || 0) > 0) {
      realStreak = 1;
      checkCursor.setDate(checkCursor.getDate() - 1);
      while (true) {
        const prevStr = toLocalDateKey(checkCursor)!;
        if ((activityMap[prevStr] || 0) > 0) {
          realStreak++;
          checkCursor.setDate(checkCursor.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  const completedInterviewsCount = interviews.filter((i) => i.status === 'completed').length;
  const streak =
    realStreak > 0
      ? realStreak
      : submissions.length > 0 || completedInterviewsCount > 0
      ? profileStreakCount ?? 1
      : 0;

  let bestStreak = streak;
  const activeDateKeys = Object.keys(activityMap)
    .filter((k) => activityMap[k] > 0)
    .sort();
  if (activeDateKeys.length > 0) {
    let currentRun = 0;
    let maxRun = 0;
    let lastDate: Date | null = null;
    for (const dateKey of activeDateKeys) {
      const curDate = new Date(`${dateKey}T00:00:00`);
      if (!lastDate) {
        currentRun = 1;
      } else {
        const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) currentRun++;
        else if (diffDays > 1) currentRun = 1;
      }
      if (currentRun > maxRun) maxRun = currentRun;
      lastDate = curDate;
    }
    bestStreak = Math.max(streak, maxRun, profileStreakCount ?? 0, 1);
  } else {
    bestStreak = Math.max(streak, profileStreakCount ?? 0, 0);
  }

  // 5. 30-day activity heatmap (kept compatible with testSystem.ts length === 30 check)
  const heatmap: HeatmapPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateKey(d)!;
    const count = activityMap[dateStr] || 0;
    const level = count >= 4 ? 3 : count >= 2 ? 2 : count > 0 ? 1 : 0;
    heatmap.push({ date: dateStr, count, level });
  }

  // 6. 365-day annual heatmap (GitHub / LeetCode contribution graph)
  const annualHeatmap: HeatmapPoint[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateKey(d)!;
    const count = activityMap[dateStr] || 0;
    const level = count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count > 0 ? 1 : 0;
    annualHeatmap.push({ date: dateStr, count, level });
  }

  return {
    activityMap,
    dailyActivityMap,
    heatmap,
    annualHeatmap,
    streak,
    bestStreak,
  };
};

