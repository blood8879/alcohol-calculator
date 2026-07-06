import {
  createEmptyQuizProgress,
  recordQuizCompletion,
  safeParseQuizProgress,
} from "../utils/engagement/quizProgress";

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
