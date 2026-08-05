import {
  computeWeeklyProgress,
  WeeklyGoal,
} from "../utils/engagement/weeklyGoal";

const goal = (weeklyLimitDrinks: number): WeeklyGoal => ({
  weeklyLimitDrinks,
  createdAt: "2026-06-01T00:00:00.000Z",
});

describe("computeWeeklyProgress", () => {
  it("returns null when no goal is set", () => {
    expect(computeWeeklyProgress(null, 3)).toBeNull();
  });

  it("returns null for a non-positive limit", () => {
    expect(computeWeeklyProgress(goal(0), 3)).toBeNull();
    expect(computeWeeklyProgress(goal(-2), 3)).toBeNull();
  });

  it("reports full remaining count at zero drinks", () => {
    const result = computeWeeklyProgress(goal(7), 0);
    expect(result).not.toBeNull();
    expect(result!.currentDrinks).toBe(0);
    expect(result!.remainingDrinks).toBe(7);
    expect(result!.overBy).toBe(0);
    expect(result!.exceeded).toBe(false);
    expect(result!.progress).toBe(0);
  });

  it("tracks partial progress below the limit", () => {
    const result = computeWeeklyProgress(goal(10), 4);
    expect(result!.remainingDrinks).toBe(6);
    expect(result!.overBy).toBe(0);
    expect(result!.exceeded).toBe(false);
    expect(result!.progress).toBeCloseTo(0.4);
  });

  it("treats hitting the limit exactly as not exceeded", () => {
    const result = computeWeeklyProgress(goal(7), 7);
    expect(result!.remainingDrinks).toBe(0);
    expect(result!.overBy).toBe(0);
    expect(result!.exceeded).toBe(false);
    expect(result!.progress).toBe(1);
  });

  it("flags going over the limit and reports the overage", () => {
    const result = computeWeeklyProgress(goal(7), 10);
    expect(result!.remainingDrinks).toBe(0);
    expect(result!.overBy).toBe(3);
    expect(result!.exceeded).toBe(true);
    expect(result!.progress).toBeCloseTo(10 / 7);
  });

  it("clamps a negative drink count to zero", () => {
    const result = computeWeeklyProgress(goal(7), -5);
    expect(result!.currentDrinks).toBe(0);
    expect(result!.remainingDrinks).toBe(7);
    expect(result!.exceeded).toBe(false);
  });
});
