import { useCallback, useEffect, useRef, useState } from "react";

import { AdEventType, InterstitialAd } from "../utils/mobileAds";

type InterstitialHandle = {
  addAdEventListener: (
    eventName: string,
    listener: (...args: unknown[]) => void
  ) => () => void;
  load: () => void;
  show: () => void;
};

type UseInterstitialAdOptions = {
  /** Fires when the ad is dismissed (CLOSED). Use it to resume the flow. */
  onClosed?: () => void;
};

/**
 * Loads and shows a full-screen interstitial for a given placement/unit.
 *
 * Preloads on mount and reloads the next ad after each dismissal so the slot
 * stays warm. `show()` only presents when an ad is actually loaded and returns
 * whether it did — callers decide the fallback (and any frequency capping)
 * before calling it. This does not enforce frequency caps itself.
 */
export function useInterstitialAd(
  unitId: string,
  options?: UseInterstitialAdOptions
) {
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef<InterstitialHandle | null>(null);
  const onClosedRef = useRef(options?.onClosed);
  onClosedRef.current = options?.onClosed;

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(unitId) as InterstitialHandle;
    adRef.current = ad;

    const loadedListener = ad.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });
    const closedListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      onClosedRef.current?.();
      // 다음 표시를 위해 슬롯을 다시 데운다.
      ad.load();
    });

    ad.load();

    return () => {
      loadedListener();
      closedListener();
      adRef.current = null;
    };
  }, [unitId]);

  /** Presents the ad if loaded. Returns true when it was actually shown. */
  const show = useCallback(() => {
    const ad = adRef.current;
    if (!ad || !loaded) return false;
    ad.show();
    return true;
  }, [loaded]);

  /** Discards the current (possibly stale) ad and warms up a fresh one. */
  const reload = useCallback(() => {
    const ad = adRef.current;
    if (!ad) return;
    setLoaded(false);
    ad.load();
  }, []);

  return { loaded, show, reload };
}
