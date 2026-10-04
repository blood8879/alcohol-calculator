import type { QuizCategory } from "../../data/types";

export type QuizCategoryStats = {
  readonly attempts: number;
  readonly bestScore: number;
  readonly completedCount: number;
  readonly lastScore: number;
  readonly totalQuestions: number;
};

export type QuizProgress = {
  readonly categoryStats: Partial<Record<Exclude<QuizCategory, "all">, QuizCategoryStats>>;
  readonly currentStreak: number;
  readonly lastDailyQuizDate: string | null;
  readonly lastDailyQuizId: string | null;
};

export type QuizCompletionInput = {
  readonly category: Exclude<QuizCategory, "all">;
  readonly date: Date;
  readonly progress: QuizProgress;
  readonly isDaily: boolean;
  readonly quizId: string;
  readonly score: number;
  readonly total: number;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

// 기기 로컬 달력 기준 YYYY-MM-DD. toISOString(UTC)을 쓰면 KST에서는 오전 9시 전이
// 전날로 집계되어 일일 퀴즈·연속 기록 경계가 09:00에 바뀌는 버그가 있었다.
// 저장 포맷(YYYY-MM-DD 문자열)은 그대로라 기존 저장값과 호환된다.
export const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const shiftLocalDays = (date: Date, days: number): Date => {
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  shifted.setDate(shifted.getDate() + days);
  return shifted;
};

export const previousLocalDateKey = (date: Date): string =>
  toLocalDateKey(shiftLocalDays(date, -1));

const parseLocalDateKey = (key: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

export const createEmptyQuizProgress = (): QuizProgress => ({
  categoryStats: {},
  currentStreak: 0,
  lastDailyQuizDate: null,
  lastDailyQuizId: null,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const safeParseQuizProgress = (raw: string | null): QuizProgress => {
  if (raw === null) {
    return createEmptyQuizProgress();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return createEmptyQuizProgress();
    }

    return {
      categoryStats: isRecord(parsed.categoryStats) ? parsed.categoryStats : {},
      currentStreak:
        typeof parsed.currentStreak === "number" && Number.isFinite(parsed.currentStreak)
          ? parsed.currentStreak
          : 0,
      lastDailyQuizDate:
        typeof parsed.lastDailyQuizDate === "string" ? parsed.lastDailyQuizDate : null,
      lastDailyQuizId:
        typeof parsed.lastDailyQuizId === "string" ? parsed.lastDailyQuizId : null,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createEmptyQuizProgress();
    }
    throw error;
  }
};

export const recordQuizCompletion = (input: QuizCompletionInput): QuizProgress => {
  const currentStats = input.progress.categoryStats[input.category];
  const nextStats: QuizCategoryStats = {
    attempts: (currentStats?.attempts ?? 0) + 1,
    bestScore: Math.max(currentStats?.bestScore ?? 0, input.score),
    completedCount: (currentStats?.completedCount ?? 0) + 1,
    lastScore: input.score,
    totalQuestions: input.total,
  };
  const today = toLocalDateKey(input.date);
  const previous = previousLocalDateKey(input.date);
  const streak = input.isDaily
    ? input.progress.lastDailyQuizDate === today
      ? input.progress.currentStreak
      : input.progress.lastDailyQuizDate === previous
        ? input.progress.currentStreak + 1
        : 1
    : input.progress.currentStreak;

  return {
    categoryStats: {
      ...input.progress.categoryStats,
      [input.category]: nextStats,
    },
    currentStreak: streak,
    lastDailyQuizDate: input.isDaily ? today : input.progress.lastDailyQuizDate,
    lastDailyQuizId: input.isDaily ? input.quizId : input.progress.lastDailyQuizId,
  };
};

/** 오늘 일일 퀴즈를 이미 완료했는지(로컬 날짜 기준). */
export const isDailyQuizDoneToday = (progress: QuizProgress, today: Date): boolean =>
  progress.lastDailyQuizDate === toLocalDateKey(today);

/**
 * 화면에 보여줄 "살아 있는" 연속 일수. 마지막 일일 퀴즈가 오늘·어제가 아니면 연속이
 * 끊긴 것이므로 0을 돌려준다(저장값은 다음 완료 시 recordQuizCompletion이 1로 재시작).
 */
export const getActiveQuizStreak = (progress: QuizProgress, today: Date): number => {
  const last = progress.lastDailyQuizDate;
  if (!last || progress.currentStreak <= 0) return 0;
  return last === toLocalDateKey(today) || last === previousLocalDateKey(today)
    ? progress.currentStreak
    : 0;
};

export type QuizWeekDot = {
  readonly dateKey: string;
  /** 0 = 일요일 … 6 = 토요일 */
  readonly weekday: number;
  readonly covered: boolean;
  readonly isToday: boolean;
  readonly isFuture: boolean;
};

/**
 * 이번 주(일요일 시작) 7일 도트. lastDailyQuizDate에서 끝나는 현재 연속 기록이 덮는 날을
 * covered로 표시한다. 연속이 끊겼거나 0이면 모두 false.
 */
export const buildQuizWeekDots = (progress: QuizProgress, today: Date): QuizWeekDot[] => {
  const streak = getActiveQuizStreak(progress, today);
  const lastDate = progress.lastDailyQuizDate
    ? parseLocalDateKey(progress.lastDailyQuizDate)
    : null;
  const lastKey = lastDate ? toLocalDateKey(lastDate) : null;
  const startKey =
    lastDate && streak > 0 ? toLocalDateKey(shiftLocalDays(lastDate, -(streak - 1))) : null;
  const todayKey = toLocalDateKey(today);
  const weekStart = shiftLocalDays(today, -today.getDay());

  return Array.from({ length: 7 }, (_, weekday) => {
    const key = toLocalDateKey(shiftLocalDays(weekStart, weekday));
    return {
      dateKey: key,
      weekday,
      covered: startKey !== null && lastKey !== null && key >= startKey && key <= lastKey,
      isToday: key === todayKey,
      isFuture: key > todayKey,
    };
  });
};
