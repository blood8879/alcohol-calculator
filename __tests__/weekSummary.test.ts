import {
  computeElapsedTime,
  deriveWeekSummary,
  getChallengeStartDate,
} from "../utils/engagement/weekSummary";
import type { WeeklyGoal } from "../utils/engagement/weeklyGoal";
import type { SobrietyChallenge } from "../utils/engagement/sobrietyChallenge";

const MINUTE = 60 * 1000;

const goal = (weeklyLimitDrinks: number): WeeklyGoal => ({
  weeklyLimitDrinks,
  createdAt: "2026-06-01T00:00:00.000Z",
});

const challenge = (startDate: string, targetDays: number): SobrietyChallenge => ({
  active: true,
  startDate,
  targetDays,
});

describe("computeElapsedTime", () => {
  const start = new Date(2026, 9, 3, 20, 0, 0).getTime();

  it("returns zero right after start", () => {
    expect(computeElapsedTime(start, start)).toEqual({ hours: 0, minutes: 0 });
  });

  it("floors partial minutes", () => {
    expect(computeElapsedTime(start, start + 59 * 1000)).toEqual({ hours: 0, minutes: 0 });
    expect(computeElapsedTime(start, start + 12 * MINUTE + 30 * 1000)).toEqual({ hours: 0, minutes: 12 });
  });

  it("splits hours and minutes", () => {
    expect(computeElapsedTime(start, start + 72 * MINUTE)).toEqual({ hours: 1, minutes: 12 });
    expect(computeElapsedTime(start, start + 120 * MINUTE)).toEqual({ hours: 2, minutes: 0 });
  });

  it("never goes negative when the clock is behind startedAt", () => {
    expect(computeElapsedTime(start, start - 5 * MINUTE)).toEqual({ hours: 0, minutes: 0 });
  });
});

describe("getChallengeStartDate", () => {
  it("parses yyyy-mm-dd as local midnight", () => {
    const date = getChallengeStartDate(challenge("2026-10-01", 7));
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });
});

describe("deriveWeekSummary", () => {
  const today = new Date(2026, 9, 3, 15, 0, 0);

  it("returns plain count without goal or challenge", () => {
    const summary = deriveWeekSummary({
      weekDrinks: 4,
      goal: null,
      challenge: null,
      challengeDrinkDates: [],
      today,
    });
    expect(summary).toEqual({ weekDrinks: 4, weeklyProgress: null, challengeProgress: null });
  });

  it("reports progress within the weekly goal", () => {
    const summary = deriveWeekSummary({
      weekDrinks: 5,
      goal: goal(7),
      challenge: null,
      challengeDrinkDates: [],
      today,
    });
    expect(summary.weeklyProgress).toMatchObject({
      currentDrinks: 5,
      limitDrinks: 7,
      remainingDrinks: 2,
      exceeded: false,
    });
  });

  it("flags an exceeded weekly goal", () => {
    const summary = deriveWeekSummary({
      weekDrinks: 9,
      goal: goal(7),
      challenge: null,
      challengeDrinkDates: [],
      today,
    });
    expect(summary.weeklyProgress).toMatchObject({ exceeded: true, overBy: 2 });
  });

  it("clamps a negative count to zero", () => {
    const summary = deriveWeekSummary({
      weekDrinks: -3,
      goal: null,
      challenge: null,
      challengeDrinkDates: [],
      today,
    });
    expect(summary.weekDrinks).toBe(0);
  });

  it("computes the sobriety streak with the shared challenge rules", () => {
    const summary = deriveWeekSummary({
      weekDrinks: 0,
      goal: null,
      challenge: challenge("2026-10-01", 7),
      challengeDrinkDates: [],
      today,
    });
    expect(summary.challengeProgress).toEqual({
      currentStreakDays: 3,
      targetDays: 7,
      succeeded: false,
      failedDate: null,
    });
  });

  it("stops the streak on a drinking day", () => {
    const summary = deriveWeekSummary({
      weekDrinks: 1,
      goal: null,
      challenge: challenge("2026-10-01", 7),
      challengeDrinkDates: ["2026-10-02"],
      today,
    });
    expect(summary.challengeProgress).toMatchObject({
      currentStreakDays: 1,
      failedDate: "2026-10-02",
    });
  });
});
