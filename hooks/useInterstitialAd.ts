import { useCallback, useEffect, useRef, useState } from "react";
import { AdEventType, InterstitialAd } from "../utils/mobileAds";
import { logAdEvent, logAdFailure, logAdSuppressed } from "../utils/adAnalytics";
import type { AdPlacement } from "../utils/adAnalytics";
import { useConsentState } from "./useConsentState";
import { getConsentSnapshot } from "../utils/consentState";

type Options = {
  readonly onClosed?: () => void;
  readonly placement?: "quiz" | "session_end";
};

export function useInterstitialAd(unitId: string, options?: Options) {
  const { canRequestAds } = useConsentState();
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef<ReturnType<typeof InterstitialAd.createForAdRequest> | null>(null);
  const ready = useRef(false);
  const showing = useRef(false);
  const opened = useRef(false);
  const attempt = useRef(0);
  const onClosed = useRef(options?.onClosed);
  onClosed.current = options?.onClosed;
  const placement: AdPlacement = options?.placement ?? "session_end";

  useEffect(() => {
    if (!canRequestAds) {
      ready.current = false;
      setLoaded(false);
      return;
    }
    const ad = InterstitialAd.createForAdRequest(unitId);
    adRef.current = ad;
    const request = () => {
      ready.current = false;
      setLoaded(false);
      if (!getConsentSnapshot().canRequestAds) return;
      logAdEvent("ad_request", "interstitial", placement);
      try {
        ad.load();
      } catch (error) {
        logAdFailure("interstitial", placement, error, "load");
      }
    };
    const listeners = [
      ad.addAdEventListener(AdEventType.LOADED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        ready.current = true;
        setLoaded(true);
        logAdEvent("ad_loaded", "interstitial", placement);
      }),
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        const stage = showing.current ? "show" : "load";
        ready.current = false;
        setLoaded(false);
        logAdFailure("interstitial", placement, error, stage);
        if (showing.current) {
          logAdSuppressed("interstitial", placement, "show_failed");
          attempt.current += 1;
          showing.current = false;
          onClosed.current?.();
          request();
        }
      }),
      ad.addAdEventListener(AdEventType.OPENED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        if (showing.current && !opened.current) {
          opened.current = true;
          logAdEvent("ad_shown", "interstitial", placement);
        }
      }),
      ad.addAdEventListener(AdEventType.CLICKED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        if (opened.current) logAdEvent("ad_clicked", "interstitial", placement);
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        if (!showing.current) return;
        if (opened.current) logAdEvent("ad_dismissed", "interstitial", placement);
        attempt.current += 1;
        showing.current = false;
        opened.current = false;
        onClosed.current?.();
        request();
      }),
    ];
    request();
    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
      if (showing.current && !getConsentSnapshot().canRequestAds) onClosed.current?.();
      adRef.current = null;
      attempt.current += 1;
      showing.current = false;
      ready.current = false;
    };
  }, [unitId, placement, canRequestAds]);

  const show = useCallback(() => {
    if (!getConsentSnapshot().canRequestAds) return false;
    const ad = adRef.current;
    if (!ad || !ready.current || showing.current) {
      logAdSuppressed("interstitial", placement, "not_ready");
      return false;
    }
    ready.current = false;
    setLoaded(false);
    showing.current = true;
    opened.current = false;
    const showAttempt = ++attempt.current;
    void Promise.resolve().then(() => {
      if (!getConsentSnapshot().canRequestAds || adRef.current !== ad || attempt.current !== showAttempt) {
        if (showing.current && attempt.current === showAttempt) {
          showing.current = false;
          attempt.current += 1;
          onClosed.current?.();
        }
        return;
      }
      return ad.show();
    }).catch((error: unknown) => {
      if (adRef.current !== ad || !showing.current || attempt.current !== showAttempt) return;
      logAdFailure("interstitial", placement, error, "show");
      logAdSuppressed("interstitial", placement, "show_failed");
      attempt.current += 1;
      showing.current = false;
      onClosed.current?.();
      if (getConsentSnapshot().canRequestAds) {
        logAdEvent("ad_request", "interstitial", placement);
        try {
          ad.load();
        } catch (loadError) {
          logAdFailure("interstitial", placement, loadError, "load");
        }
      }
    });
    return true;
  }, [placement]);

  const reload = useCallback(() => {
    const ad = adRef.current;
    if (!getConsentSnapshot().canRequestAds || !ad || showing.current) return;
    ready.current = false;
    setLoaded(false);
    logAdEvent("ad_request", "interstitial", placement);
    try {
      ad.load();
    } catch (error) {
      logAdFailure("interstitial", placement, error, "load");
    }
  }, [placement]);

  return { loaded, show, reload };
}
