import {
  computeChallengeProgress,
  estimateMoneySaved,
  toLocalDateString,
  SobrietyChallenge,
} from "../utils/engagement/sobrietyChallenge";

const challenge = (startDate: string, targetDays: number): SobrietyChallenge => ({
  active: true,
  startDate,
  targetDays,
});

describe("sobriety challenge progress", () => {
  it("formats local dates without UTC shift", () => {
    // Local midnight should not roll back a day.
    const d = new Date(2026, 0, 5, 0, 0, 0); // Jan 5 2026 local
    expect(toLocalDateString(d)).toBe("2026-01-05");
  });

  it("counts a clean streak from the start date through today", () => {
    const result = computeChallengeProgress(
      challenge("2026-06-01", 7),
      [],
      new Date(2026, 5, 4) // Jun 4 -> 4 days clean
    );
    expect(result.currentStreakDays).toBe(4);
    expect(result.failedDate).toBeNull();
    expect(result.succeeded).toBe(false);
  });

  it("marks success once the clean streak reaches the target", () => {
    const result = computeChallengeProgress(
      challenge("2026-06-01", 7),
      [],
      new Date(2026, 5, 7) // Jun 1..7 inclusive = 7 days
    );
    expect(result.currentStreakDays).toBe(7);
    expect(result.succeeded).toBe(true);
  });

  it("fails on the first day a drink was logged", () => {
    const result = computeChallengeProgress(
      challenge("2026-06-01", 7),
      ["2026-06-03"],
      new Date(2026, 5, 6)
    );
    expect(result.failedDate).toBe("2026-06-03");
    expect(result.currentStreakDays).toBe(2); // Jun 1, Jun 2
    expect(result.succeeded).toBe(false);
  });

  it("estimates money saved from the pre-challenge daily spend", () => {
    // 28일간 56,000원 지출 → 하루 평균 2,000원, 10일 절주 시 20,000원 절약
    expect(estimateMoneySaved(56000, 28, 10)).toBe(20000);
  });

  it("returns zero savings without baseline spend or streak", () => {
    expect(estimateMoneySaved(0, 28, 10)).toBe(0);
    expect(estimateMoneySaved(56000, 0, 10)).toBe(0);
    expect(estimateMoneySaved(56000, 28, 0)).toBe(0);
  });

  it("reports no progress when today precedes the start date", () => {
    const result = computeChallengeProgress(
      challenge("2026-06-10", 7),
      [],
      new Date(2026, 5, 1)
    );
    expect(result.currentStreakDays).toBe(0);
    expect(result.succeeded).toBe(false);
  });
});
