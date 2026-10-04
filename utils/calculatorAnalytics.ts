import { logFirebaseEvent } from "./firebase";
import type { CalculatorType } from "./analytics";
import { drinkPresets } from "../data/drinkPresets";

export type CalculatorEntrySource = "home_grid";
export type CalculatorCloseReason = "button" | "backdrop" | "swipe" | "back" | "recommendation";

export const calculatorDurationBucket = (milliseconds: number): string => {
  if (milliseconds < 10000) return "under_10s";
  if (milliseconds < 60000) return "10_59s";
  if (milliseconds < 300000) return "1_4m";
  return "5m_plus";
};

export const isSuccessfulCalculation = (
  results: readonly { readonly label: string; readonly value: string }[],
  errorLabel: string
): boolean => results.length > 0 && !results.some((result) =>
  result.label === errorLabel || /(?:^|[^a-z])(NaN|Infinity)(?:$|[^a-z])/i.test(result.value)
);

export const logCalculatorOpened = (calculatorType: CalculatorType, entrySource: CalculatorEntrySource): void =>
  logFirebaseEvent("calculator_opened", { calculator_type: calculatorType, entry_source: entrySource });

export const logCalculatorFirstInput = (calculatorType: CalculatorType, fieldIndex: number): void =>
  logFirebaseEvent("calculator_first_input", { calculator_type: calculatorType, field_index: fieldIndex });

export const logCalculatorPreset = (calculatorType: CalculatorType, presetId: string): void => {
  if (!drinkPresets.some((preset) => preset.id === presetId)) return;
  logFirebaseEvent("calculator_preset_selected", { calculator_type: calculatorType, preset_id: presetId });
};

export const logCalculatorAttempt = (calculatorType: CalculatorType): void =>
  logFirebaseEvent("calculation_attempted", { calculator_type: calculatorType });

export const logCalculatorOutcome = (calculatorType: CalculatorType, successful: boolean): void => {
  logFirebaseEvent(successful ? "calculation_succeeded" : "calculation_validation_failed", { calculator_type: calculatorType });
  if (successful) logFirebaseEvent("calculator_used", { calculator_type: calculatorType });
};

export const logCalculatorClosed = (
  calculatorType: CalculatorType,
  reason: CalculatorCloseReason,
  hadResult: boolean,
  elapsedMs: number
): void => logFirebaseEvent("calculator_closed", {
  calculator_type: calculatorType,
  close_reason: reason,
  had_result: hadResult,
  duration_bucket: calculatorDurationBucket(elapsedMs),
});

export const logCalculatorGuideOpened = (calculatorType: CalculatorType): void =>
  logFirebaseEvent("calculator_guide_opened", { calculator_type: calculatorType });

export const logCalculatorRecommendation = (calculatorType: CalculatorType, target: "recipes" | "encyclopedia" | "tracker"): void =>
  logFirebaseEvent("calculator_recommendation_tapped", { calculator_type: calculatorType, target });

export const logCalculatorShare = (calculatorType: CalculatorType, outcome: "attempted" | "dismissed" | "completed" | "failed"): void =>
  logFirebaseEvent(`calculator_share_${outcome}`, { calculator_type: calculatorType });

export const logCalculatorHistoryOpened = (count: number): void =>
  logFirebaseEvent("calculator_history_opened", { item_count: count === 0 ? "zero" : count <= 5 ? "1_5" : count <= 20 ? "6_20" : "21_plus" });

export const logCalculatorHistoryAction = (action: "favorite_tapped" | "delete_tapped" | "clear_confirmed"): void =>
  logFirebaseEvent("calculator_history_action", { action });
