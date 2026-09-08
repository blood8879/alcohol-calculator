import React, { forwardRef } from "react";
import { View } from "react-native";

type BannerAdProps = {
  readonly unitId: string;
  readonly size: string;
};

type Listener = () => void;

export const AdEventType = {
  CLOSED: "closed",
  LOADED: "loaded",
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

type ConsentInfo = {
  status: string;
  isConsentFormAvailable: boolean;
  canRequestAds: boolean;
};

const noConsentNeeded: ConsentInfo = {
  status: AdsConsentStatus.NOT_REQUIRED,
  isConsentFormAvailable: false,
  canRequestAds: true,
};

export const AdsConsent = {
  requestInfoUpdate: async (): Promise<ConsentInfo> => noConsentNeeded,
  showForm: async (): Promise<ConsentInfo> => noConsentNeeded,
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
