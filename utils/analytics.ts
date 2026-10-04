import { logFirebaseEvent } from "./firebase";

export type CalculatorType =
  | "dilution"
  | "blending"
  | "calorie"
  | "temperature"
  | "alcoholContent"
  | "freezingPoint"
  | "proof"
  | "bac"
  | "unitConverter";

export type QuizMode = "standard" | "daily";
export type DrinkLogSource = "preset" | "manual" | "quick_log";
export type NotificationType = "daily" | "weekly" | "drive_safe";

const durationBucket = (seconds: number): string => {
  if (seconds < 900) return "under_15m";
  if (seconds < 3600) return "15_59m";
  if (seconds < 14400) return "1_3h";
  return "4h_plus";
};

const countBucket = (count: number): string => {
  if (count < 1) return "none";
  if (count < 3) return "1_2";
  if (count < 6) return "3_5";
  return "6_plus";
};

const challengeTarget = (days: number): string => {
  if (days === 7) return "7_days";
  if (days === 14) return "14_days";
  if (days === 30) return "30_days";
  return "other";
};

export const logCalculatorUsed = (calculatorType: string): void =>
  logFirebaseEvent("calculator_used", { calculator_type: calculatorType });

export const logSessionStarted = (): void =>
  logFirebaseEvent("session_started");

export const logSessionEnded = (params: {
  durationSec: number;
  drinkCount: number;
}): void =>
  logFirebaseEvent("session_ended", {
    duration_bucket: durationBucket(params.durationSec),
    drink_count_bucket: countBucket(params.drinkCount),
  });

export const logSessionDiscarded = (): void =>
  logFirebaseEvent("session_discarded");

export const logSessionShared = (): void => logFirebaseEvent("session_shared");

export const logQuizStarted = (category: string, mode: QuizMode): void =>
  logFirebaseEvent("quiz_started", { category, mode });

export const logQuizCompleted = (params: {
  category: string;
  mode: QuizMode;
  score: number;
  total: number;
}): void => logFirebaseEvent("quiz_completed", { ...params });

export const logQuizRetryAdWatched = (): void =>
  logFirebaseEvent("quiz_retry_ad_watched");

export const logDrinkLogged = (source: DrinkLogSource): void =>
  logFirebaseEvent("drink_logged", { source });

export const logChallengeStarted = (targetDays: number): void =>
  logFirebaseEvent("challenge_started", { target_days_bucket: challengeTarget(targetDays) });

export const logChallengeCompleted = (targetDays: number): void =>
  logFirebaseEvent("challenge_completed", { target_days_bucket: challengeTarget(targetDays) });

export const logWeeklyGoalSet = (limitDrinks: number): void =>
  logFirebaseEvent("weekly_goal_set", { limit_drinks_bucket: countBucket(limitDrinks) });

export const logWeeklyGoalExceeded = (limitDrinks: number): void =>
  logFirebaseEvent("weekly_goal_exceeded", { limit_drinks_bucket: countBucket(limitDrinks) });

export const logRecipeViewed = (itemId: string): void =>
  logFirebaseEvent("recipe_viewed", { item_id: itemId });

export const logEncyclopediaViewed = (itemId: string): void =>
  logFirebaseEvent("encyclopedia_viewed", { item_id: itemId });

export const logNotificationToggled = (
  type: NotificationType,
  enabled: boolean
): void => logFirebaseEvent("notification_toggled", { type, enabled });
