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

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

const previousDateKey = (date: Date): string => {
  const previous = new Date(date);
  previous.setDate(date.getDate() - 1);
  return dateKey(previous);
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
  const today = dateKey(input.date);
  const previous = previousDateKey(input.date);
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
