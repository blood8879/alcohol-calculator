import React, { forwardRef } from "react";
import { View } from "react-native";

type BannerAdProps = {
  readonly unitId: string;
  readonly size: string;
  readonly onAdLoaded?: () => void;
  readonly onAdFailedToLoad?: (error: Error) => void;
  readonly onAdOpened?: () => void;
  readonly onAdClosed?: () => void;
};

type Listener = (...args: unknown[]) => void;

export const AdEventType = {
  CLOSED: "closed",
  LOADED: "loaded",
  ERROR: "error",
  OPENED: "opened",
  CLICKED: "clicked",
} as const;

export const BannerAdSize = {
  ANCHORED_ADAPTIVE_BANNER: "anchoredAdaptiveBanner",
  BANNER: "banner",
} as const;

export const TestIds = {
  BANNER: "test-banner",
  INTERSTITIAL: "test-interstitial",
  REWARDED: "test-rewarded",
} as const;

export const BannerAd = forwardRef<View, BannerAdProps>(function BannerAdFallback(
  _props,
  ref
) {
  return React.createElement(View, { ref });
});

export const InterstitialAd = {
  createForAdRequest: (_unitId: string) => ({
    addAdEventListener: (_eventName: string, _listener: Listener) => () => {},
    load: () => {},
    show: () => {},
  }),
};

export const RewardedAdEventType = {
  LOADED: "rewarded_loaded",
  EARNED_REWARD: "rewarded_earned_reward",
} as const;

export const AdsConsentStatus = {
  UNKNOWN: "UNKNOWN",
  REQUIRED: "REQUIRED",
  NOT_REQUIRED: "NOT_REQUIRED",
  OBTAINED: "OBTAINED",
} as const;

export const AdsConsentPrivacyOptionsRequirementStatus = {
  UNKNOWN: "UNKNOWN",
  REQUIRED: "REQUIRED",
  NOT_REQUIRED: "NOT_REQUIRED",
} as const;

export const AdsConsentDebugGeography = { EEA: 1 } as const;

export type ConsentInfo = {
  status: string;
  isConsentFormAvailable: boolean;
  canRequestAds: boolean;
  privacyOptionsRequirementStatus: string;
};

const noConsentNeeded: ConsentInfo = {
  status: AdsConsentStatus.NOT_REQUIRED,
  isConsentFormAvailable: false,
  canRequestAds: true,
  privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
};

export const AdsConsent = {
  requestInfoUpdate: async (_options?: { readonly debugGeography?: number }): Promise<ConsentInfo> => noConsentNeeded,
  showForm: async (): Promise<ConsentInfo> => noConsentNeeded,
  showPrivacyOptionsForm: async (): Promise<ConsentInfo> => noConsentNeeded,
  getConsentInfo: async (): Promise<ConsentInfo> => noConsentNeeded,
  getUserChoices: async (): Promise<{
    storeAndAccessInformationOnDevice: boolean;
  }> => ({ storeAndAccessInformationOnDevice: false }),
};

export const RewardedAd = {
  createForAdRequest: (_unitId: string) => ({
    addAdEventListener: (_eventName: string, _listener: Listener) => () => {},
    load: () => {},
    show: () => {},
  }),
};
