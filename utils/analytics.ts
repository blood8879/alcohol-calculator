import { logFirebaseEvent } from "./firebase";
import type { BacLevel } from "./engagement/drinkingSession";

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
export type DrinkLogSource = "preset" | "manual";
export type NotificationType = "daily" | "weekly" | "drive_safe";

export const logCalculatorUsed = (calculatorType: string): void =>
  logFirebaseEvent("calculator_used", { calculator_type: calculatorType });

export const logSessionStarted = (): void =>
  logFirebaseEvent("session_started");

export const logSessionEnded = (params: {
  durationSec: number;
  drinkCount: number;
  peakBacLevel: BacLevel;
}): void =>
  logFirebaseEvent("session_ended", {
    duration_sec: params.durationSec,
    drink_count: params.drinkCount,
    peak_bac_level: params.peakBacLevel,
  });

export const logSessionDiscarded = (): void =>
  logFirebaseEvent("session_discarded");

export const logSessionDangerReached = (level: BacLevel): void =>
  logFirebaseEvent("session_danger_reached", { level });

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
  logFirebaseEvent("challenge_started", { target_days: targetDays });

export const logChallengeCompleted = (targetDays: number): void =>
  logFirebaseEvent("challenge_completed", { target_days: targetDays });

export const logWeeklyGoalSet = (limitDrinks: number): void =>
  logFirebaseEvent("weekly_goal_set", { limit_drinks: limitDrinks });

export const logWeeklyGoalExceeded = (limitDrinks: number): void =>
  logFirebaseEvent("weekly_goal_exceeded", { limit_drinks: limitDrinks });

export const logRecipeViewed = (itemId: string): void =>
  logFirebaseEvent("recipe_viewed", { item_id: itemId });

export const logEncyclopediaViewed = (itemId: string): void =>
  logFirebaseEvent("encyclopedia_viewed", { item_id: itemId });

export const logNotificationToggled = (
  type: NotificationType,
  enabled: boolean
): void => logFirebaseEvent("notification_toggled", { type, enabled });
