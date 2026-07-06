import type { DrinkLog } from "../trackerStorage";

export type WeekComparison =
  | { readonly kind: "down"; readonly difference: number }
  | { readonly kind: "same" }
  | { readonly kind: "up"; readonly difference: number };

export type TrackerInsights = {
  readonly averageAbv: number;
  readonly mostCommonDrinkName: string | null;
  readonly totalCalories: number;
  readonly totalDrinks: number;
  readonly weekComparison: WeekComparison;
};

const startOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfWeek = (date: Date): Date => {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const inRange = (log: DrinkLog, start: Date, end: Date): boolean =>
  log.timestamp >= start.getTime() && log.timestamp < end.getTime();

const compareWeeks = (currentCount: number, previousCount: number): WeekComparison => {
  const difference = currentCount - previousCount;
  if (difference > 0) {
    return { kind: "up", difference };
  }
  if (difference < 0) {
    return { kind: "down", difference: Math.abs(difference) };
  }
  return { kind: "same" };
};

export const getMostCommonDrinkName = (logs: readonly DrinkLog[]): string | null => {
  if (logs.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();
  logs.forEach((log) => {
    counts.set(log.name, (counts.get(log.name) ?? 0) + 1);
  });

  return Array.from(counts.entries()).sort(
    ([leftName, leftCount], [rightName, rightCount]) =>
      rightCount - leftCount || leftName.localeCompare(rightName)
  )[0]?.[0] ?? null;
};

export const buildTrackerInsights = (
  logs: readonly DrinkLog[],
  date: Date
): TrackerInsights => {
  const currentStart = startOfWeek(date);
  const currentEnd = new Date(currentStart);
  currentEnd.setDate(currentStart.getDate() + 7);
  const previousStart = new Date(currentStart);
  previousStart.setDate(currentStart.getDate() - 7);

  const currentLogs = logs.filter((log) => inRange(log, currentStart, currentEnd));
  const previousLogs = logs.filter((log) => inRange(log, previousStart, currentStart));
  const totalCalories = Math.round(currentLogs.reduce((sum, log) => sum + log.calories, 0));
  const weightedAbv = currentLogs.reduce((sum, log) => sum + log.abv * log.volume, 0);
  const totalVolume = currentLogs.reduce((sum, log) => sum + log.volume, 0);

  return {
    averageAbv: totalVolume > 0 ? Math.round((weightedAbv / totalVolume) * 10) / 10 : 0,
    mostCommonDrinkName: getMostCommonDrinkName(currentLogs),
    totalCalories,
    totalDrinks: currentLogs.length,
    weekComparison: compareWeeks(currentLogs.length, previousLogs.length),
  };
};
