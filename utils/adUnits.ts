import { TestIds } from "./mobileAds";

/**
 * Centralized AdMob ad unit configuration.
 *
 * Production unit IDs are split per placement so AdMob can optimize delivery
 * and reporting for each location independently. In development every slot
 * falls back to Google's official test unit IDs.
 *
 * To create the production rewarded unit and the dedicated banner units,
 * add them in the AdMob console and replace the placeholder IDs below.
 */

const PUBLISHER = "ca-app-pub-7612314432840835";

type AdUnitMap = {
  /** Anchored adaptive banner pinned to the root layout. */
  readonly anchoredBanner: string;
  /** Inline banners inside scrollable content lists (recipes, encyclopedia, tracker). */
  readonly inlineBanner: string;
  /** Interstitial shown after quiz completion. */
  readonly quizInterstitial: string;
  /** Rewarded video; opt-in unlocks (extra quiz attempt, etc.). */
  readonly rewarded: string;
};

const PROD_AD_UNITS: AdUnitMap = {
  anchoredBanner: `${PUBLISHER}/5764066171`,
  // TODO: replace with dedicated inline banner unit created in AdMob console.
  inlineBanner: `${PUBLISHER}/5764066171`,
  quizInterstitial: `${PUBLISHER}/3082062514`,
  // TODO: replace with the rewarded unit created in AdMob console.
  rewarded: `${PUBLISHER}/3082062514`,
};

const TEST_AD_UNITS: AdUnitMap = {
  anchoredBanner: TestIds.BANNER,
  inlineBanner: TestIds.BANNER,
  quizInterstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
};

export const adUnits: AdUnitMap = __DEV__ ? TEST_AD_UNITS : PROD_AD_UNITS;
