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

export const RewardedAd = {
  createForAdRequest: (_unitId: string) => ({
    addAdEventListener: (_eventName: string, _listener: Listener) => () => {},
    load: () => {},
    show: () => {},
  }),
};
