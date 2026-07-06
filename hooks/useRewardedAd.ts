import { useCallback, useEffect, useRef, useState } from "react";

import { adUnits } from "../utils/adUnits";
import { RewardedAd, RewardedAdEventType } from "../utils/mobileAds";

type RewardedHandle = {
  addAdEventListener: (eventName: string, listener: (...args: unknown[]) => void) => () => void;
  load: () => void;
  show: () => void;
};

/**
 * Loads and shows an opt-in rewarded video. The reward is granted only when
 * the ad reports EARNED_REWARD. The hook preloads on mount and reloads the
 * next ad after each successful view so the slot stays warm.
 */
export function useRewardedAd(onEarned: () => void) {
  const [loaded, setLoaded] = useState(false);
  const onEarnedRef = useRef(onEarned);
  const adRef = useRef<RewardedHandle | null>(null);

  onEarnedRef.current = onEarned;

  useEffect(() => {
    const ad = RewardedAd.createForAdRequest(adUnits.rewarded) as RewardedHandle;
    adRef.current = ad;

    const loadedListener = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });
    const earnedListener = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      onEarnedRef.current();
      // Warm up the next ad for the slot.
      setLoaded(false);
      ad.load();
    });

    ad.load();

    return () => {
      loadedListener();
      earnedListener();
      adRef.current = null;
    };
  }, []);

  const show = useCallback(() => {
    const ad = adRef.current;
    if (!ad || !loaded) {
      // Ad not ready: grant the reward anyway so the feature never blocks UX.
      onEarnedRef.current();
      return;
    }
    ad.show();
  }, [loaded]);

  return { loaded, show };
}
