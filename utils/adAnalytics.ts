import { logFirebaseEvent } from "./firebase";

export type AdFormat = "banner" | "interstitial" | "rewarded";
export type AdPlacement = "anchored" | "inline" | "quiz" | "session_end" | "quiz_retry";
export type AdEvent = "ad_request" | "ad_loaded" | "ad_failed" | "ad_shown" | "ad_dismissed" | "ad_clicked";

export function logAdEvent(event: AdEvent, adFormat: AdFormat, placement: AdPlacement): void {
  logFirebaseEvent(event, { ad_format: adFormat, placement });
}

type FailureReason = "no_fill" | "network" | "invalid_request" | "internal" | "show_failed" | "unknown";

export function classifyAdFailure(error: unknown, stage: "load" | "show"): FailureReason {
  if (stage === "show") return "show_failed";
  if (typeof error !== "object" || error === null || !("code" in error)) return "unknown";
  const code = error.code;
  if (typeof code !== "string") return "unknown";
  switch (code) {
    case "googleMobileAds/error-code-no-fill":
      return "no_fill";
    case "googleMobileAds/error-code-network-error":
      return "network";
    case "googleMobileAds/error-code-invalid-request":
      return "invalid_request";
    case "googleMobileAds/error-code-internal-error":
      return "internal";
    default:
      return "unknown";
  }
}

export function logAdFailure(adFormat: AdFormat, placement: AdPlacement, error: unknown, stage: "load" | "show"): void {
  logFirebaseEvent("ad_failed", {
    ad_format: adFormat,
    placement,
    error_code: stage === "load" ? 1 : 2,
    failure_reason: classifyAdFailure(error, stage),
  });
}

export function logAdSuppressed(adFormat: AdFormat, placement: AdPlacement, reason: "not_ready" | "show_failed"): void {
  logFirebaseEvent("ad_suppressed", { ad_format: adFormat, placement, reason });
}

export function logRewardOutcome(outcome: "earned_reward" | "free_fallback" | "dismissed_without_reward"): void {
  logFirebaseEvent("reward_outcome", { ad_format: "rewarded", placement: "quiz_retry", outcome });
  if (outcome === "earned_reward") logFirebaseEvent("quiz_retry_ad_watched");
}
