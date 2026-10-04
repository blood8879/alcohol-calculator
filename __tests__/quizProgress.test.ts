import {
  buildQuizWeekDots,
  createEmptyQuizProgress,
  getActiveQuizStreak,
  isDailyQuizDoneToday,
  QuizProgress,
  recordQuizCompletion,
  safeParseQuizProgress,
  toLocalDateKey,
} from "../utils/engagement/quizProgress";
import { getDailyQuizQuestionIds } from "../utils/engagement/todayHub";

describe("quiz progress", () => {
  it("falls back safely when storage is corrupt", () => {
    const progress = safeParseQuizProgress("{bad json");

    expect(progress).toEqual(createEmptyQuizProgress());
  });

  it("records category best score, completion count, and daily streak", () => {
    const progress = recordQuizCompletion({
      category: "basics",
      date: new Date("2026-06-03T00:00:00.000Z"),
      isDaily: true,
      progress: createEmptyQuizProgress(),
      quizId: "daily-2026-06-03",
      score: 8,
      total: 10,
    });

    expect(progress.categoryStats.basics).toEqual({
      attempts: 1,
      bestScore: 8,
      completedCount: 1,
      lastScore: 8,
      totalQuestions: 10,
    });
    expect(progress.currentStreak).toBe(1);
    expect(progress.lastDailyQuizId).toBe("daily-2026-06-03");
  });

  it("does not update the daily streak for standard category quizzes", () => {
    const progress = recordQuizCompletion({
      category: "cocktails",
      date: new Date("2026-06-03T00:00:00.000Z"),
      isDaily: false,
      progress: createEmptyQuizProgress(),
      quizId: "standard-cocktails",
      score: 4,
      total: 10,
    });

    expect(progress.categoryStats.cocktails?.completedCount).toBe(1);
    expect(progress.currentStreak).toBe(0);
    expect(progress.lastDailyQuizId).toBeNull();
  });
});

// 로컬 달력 날짜 기준 동작. jest 프로세스의 TZ와 무관하게 결정적이도록, UTC 날짜가 로컬 날짜와
// 다른 상황(+09:00, 오전 8시)을 toISOString 스텁으로 재현하는 케이스를 함께 둔다.
const kstMorning = (): Date => {
  // 로컬 2026-06-03 08:00. +09:00 기기라면 UTC로는 2026-06-02T23:00Z.
  const date = new Date(2026, 5, 3, 8, 0, 0);
  date.toISOString = () => "2026-06-02T23:00:00.000Z";
  return date;
};

const progressWith = (overrides: Partial<QuizProgress>): QuizProgress => ({
  ...createEmptyQuizProgress(),
  ...overrides,
});

describe("quiz progress local date", () => {
  it("builds the date key from the local calendar date, not UTC", () => {
    expect(toLocalDateKey(kstMorning())).toBe("2026-06-03");
    expect(toLocalDateKey(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
    expect(toLocalDateKey(new Date(2025, 11, 31, 23, 55))).toBe("2025-12-31");
  });

  it("records the daily quiz under the local date before 09:00 KST", () => {
    const progress = recordQuizCompletion({
      category: "basics",
      date: kstMorning(),
      isDaily: true,
      progress: createEmptyQuizProgress(),
      quizId: "daily",
      score: 5,
      total: 5,
    });

    expect(progress.lastDailyQuizDate).toBe("2026-06-03");
  });

  it("continues the streak from yesterday's local date just after local midnight", () => {
    const progress = recordQuizCompletion({
      category: "basics",
      date: new Date(2026, 5, 3, 0, 30),
      isDaily: true,
      progress: progressWith({ currentStreak: 3, lastDailyQuizDate: "2026-06-02" }),
      quizId: "daily",
      score: 5,
      total: 5,
    });

    expect(progress.currentStreak).toBe(4);
    expect(progress.lastDailyQuizDate).toBe("2026-06-03");
  });

  it("keeps the streak when the daily quiz is replayed later the same local day", () => {
    const progress = recordQuizCompletion({
      category: "basics",
      date: new Date(2026, 5, 3, 23, 50),
      isDaily: true,
      progress: progressWith({ currentStreak: 4, lastDailyQuizDate: "2026-06-03" }),
      quizId: "daily",
      score: 5,
      total: 5,
    });

    expect(progress.currentStreak).toBe(4);
  });

  it("detects today's completion with the local date", () => {
    const progress = progressWith({ currentStreak: 1, lastDailyQuizDate: "2026-06-03" });

    expect(isDailyQuizDoneToday(progress, kstMorning())).toBe(true);
    expect(isDailyQuizDoneToday(progress, new Date(2026, 5, 4, 0, 1))).toBe(false);
  });

  it("keeps the same daily question set for the whole local day", () => {
    const ids = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];

    expect(getDailyQuizQuestionIds(new Date(2026, 5, 3, 0, 30), ids)).toEqual(
      getDailyQuizQuestionIds(new Date(2026, 5, 3, 23, 30), ids)
    );
    expect(getDailyQuizQuestionIds(new Date(2026, 5, 4, 0, 30), ids)).not.toEqual(
      getDailyQuizQuestionIds(new Date(2026, 5, 3, 23, 30), ids)
    );
  });
});

describe("quiz streak display helpers", () => {
  it("treats a streak as broken when the last daily quiz is older than yesterday", () => {
    const today = new Date(2026, 5, 10, 12, 0);

    expect(getActiveQuizStreak(progressWith({ currentStreak: 5, lastDailyQuizDate: "2026-06-10" }), today)).toBe(5);
    expect(getActiveQuizStreak(progressWith({ currentStreak: 5, lastDailyQuizDate: "2026-06-09" }), today)).toBe(5);
    expect(getActiveQuizStreak(progressWith({ currentStreak: 5, lastDailyQuizDate: "2026-06-08" }), today)).toBe(0);
    expect(getActiveQuizStreak(createEmptyQuizProgress(), today)).toBe(0);
  });

  it("marks the Sunday-start week days covered by the streak ending at the last daily quiz", () => {
    // 2026-06-10은 수요일. 주 = 06-07(일) … 06-13(토).
    const today = new Date(2026, 5, 10, 9, 0);
    const dots = buildQuizWeekDots(
      progressWith({ currentStreak: 3, lastDailyQuizDate: "2026-06-09" }),
      today
    );

    expect(dots.map((dot) => dot.dateKey)).toEqual([
      "2026-06-07",
      "2026-06-08",
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
      "2026-06-12",
      "2026-06-13",
    ]);
    expect(dots.map((dot) => dot.weekday)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(dots.map((dot) => dot.covered)).toEqual([true, true, true, false, false, false, false]);
    expect(dots.map((dot) => dot.isToday)).toEqual([false, false, false, true, false, false, false]);
    expect(dots.map((dot) => dot.isFuture)).toEqual([false, false, false, false, true, true, true]);
  });

  it("clips a long streak to the current week and covers today once done", () => {
    const dots = buildQuizWeekDots(
      progressWith({ currentStreak: 12, lastDailyQuizDate: "2026-06-10" }),
      new Date(2026, 5, 10, 21, 0)
    );

    expect(dots.map((dot) => dot.covered)).toEqual([true, true, true, true, false, false, false]);
  });

  it("covers nothing when the streak is broken or empty", () => {
    const today = new Date(2026, 5, 10, 9, 0);

    expect(
      buildQuizWeekDots(progressWith({ currentStreak: 4, lastDailyQuizDate: "2026-06-07" }), today).some(
        (dot) => dot.covered
      )
    ).toBe(false);
    expect(buildQuizWeekDots(createEmptyQuizProgress(), today).some((dot) => dot.covered)).toBe(false);
  });
});
