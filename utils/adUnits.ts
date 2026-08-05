import { TestIds } from "./mobileAds";

/**
 * Centralized AdMob ad unit configuration.
 *
 * Production unit IDs are split per placement so AdMob can optimize delivery
 * and reporting for each location independently. In development every slot
 * falls back to Google's official test unit IDs.
 *
 */

const PUBLISHER = "ca-app-pub-7612314432840835";

type AdUnitMap = {
  /** Anchored adaptive banner pinned to the root layout. */
  readonly anchoredBanner: string;
  /** Inline banners inside scrollable content lists (recipes, encyclopedia, tracker). */
  readonly inlineBanner: string;
  /** Interstitial shown after quiz completion. */
  readonly quizInterstitial: string;
  /** Interstitial shown after a live session ends and is saved. */
  readonly sessionInterstitial: string;
  /** Rewarded video; opt-in unlocks (extra quiz attempt, etc.). */
  readonly rewarded: string;
};

const PROD_AD_UNITS: AdUnitMap = {
  anchoredBanner: `${PUBLISHER}/5764066171`,
  inlineBanner: `${PUBLISHER}/3826487912`,
  quizInterstitial: `${PUBLISHER}/3082062514`,
  sessionInterstitial: `${PUBLISHER}/8446711044`,
  rewarded: `${PUBLISHER}/3634916227`,
};

const TEST_AD_UNITS: AdUnitMap = {
  anchoredBanner: TestIds.BANNER,
  inlineBanner: TestIds.BANNER,
  quizInterstitial: TestIds.INTERSTITIAL,
  sessionInterstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
};

export const adUnits: AdUnitMap = __DEV__ ? TEST_AD_UNITS : PROD_AD_UNITS;
