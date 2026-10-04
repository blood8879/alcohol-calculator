import { useCallback, useEffect, useRef, useState } from "react";
import { adUnits } from "../utils/adUnits";
import { AdEventType, RewardedAd, RewardedAdEventType } from "../utils/mobileAds";
import { logAdEvent, logAdFailure, logAdSuppressed, logRewardOutcome } from "../utils/adAnalytics";
import { useConsentState } from "./useConsentState";
import { getConsentSnapshot } from "../utils/consentState";

export function useRewardedAd(onEarned: () => void) {
  const { canRequestAds } = useConsentState();
  const [loaded, setLoaded] = useState(false);
  const callback = useRef(onEarned);
  const adRef = useRef<ReturnType<typeof RewardedAd.createForAdRequest> | null>(null);
  const ready = useRef(false);
  const showing = useRef(false);
  const opened = useRef(false);
  const completed = useRef(false);
  const attempt = useRef(0);
  callback.current = onEarned;

  useEffect(() => {
    if (!canRequestAds) {
      ready.current = false;
      setLoaded(false);
      return;
    }
    const ad = RewardedAd.createForAdRequest(adUnits.rewarded);
    adRef.current = ad;
    const request = () => {
      ready.current = false;
      setLoaded(false);
      if (!getConsentSnapshot().canRequestAds) return;
      logAdEvent("ad_request", "rewarded", "quiz_retry");
      try {
        ad.load();
      } catch (error) {
        logAdFailure("rewarded", "quiz_retry", error, "load");
      }
    };
    const complete = (outcome: "earned_reward" | "free_fallback") => {
      if (completed.current || !showing.current) return;
      completed.current = true;
      logRewardOutcome(outcome);
      callback.current();
    };
    const listeners = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        ready.current = true;
        setLoaded(true);
        logAdEvent("ad_loaded", "rewarded", "quiz_retry");
      }),
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        const stage = showing.current ? "show" : "load";
        logAdFailure("rewarded", "quiz_retry", error, stage);
        ready.current = false;
        setLoaded(false);
        if (showing.current) {
          logAdSuppressed("rewarded", "quiz_retry", "show_failed");
          complete("free_fallback");
          attempt.current += 1;
          showing.current = false;
          request();
        }
      }),
      ad.addAdEventListener(AdEventType.OPENED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        if (showing.current && !opened.current) {
          opened.current = true;
          logAdEvent("ad_shown", "rewarded", "quiz_retry");
        }
      }),
      ad.addAdEventListener(AdEventType.CLICKED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        if (opened.current) logAdEvent("ad_clicked", "rewarded", "quiz_retry");
      }),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (adRef.current === ad && getConsentSnapshot().canRequestAds) complete("earned_reward");
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        if (adRef.current !== ad || !getConsentSnapshot().canRequestAds) return;
        if (!showing.current) return;
        if (opened.current) logAdEvent("ad_dismissed", "rewarded", "quiz_retry");
        if (!completed.current) logRewardOutcome("dismissed_without_reward");
        attempt.current += 1;
        showing.current = false;
        opened.current = false;
        request();
      }),
    ];
    request();
    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
      if (showing.current && !completed.current && !getConsentSnapshot().canRequestAds) {
        logRewardOutcome("free_fallback");
        callback.current();
      }
      adRef.current = null;
      attempt.current += 1;
      showing.current = false;
      ready.current = false;
    };
  }, [canRequestAds]);

  const show = useCallback(() => {
    if (!getConsentSnapshot().canRequestAds) {
      logRewardOutcome("free_fallback");
      callback.current();
      return;
    }
    const ad = adRef.current;
    if (showing.current) {
      logAdSuppressed("rewarded", "quiz_retry", "not_ready");
      return;
    }
    if (!ad || !ready.current) {
      logAdSuppressed("rewarded", "quiz_retry", "not_ready");
      logRewardOutcome("free_fallback");
      callback.current();
      return;
    }
    ready.current = false;
    setLoaded(false);
    showing.current = true;
    opened.current = false;
    completed.current = false;
    const showAttempt = ++attempt.current;
    void Promise.resolve().then(() => {
      if (!getConsentSnapshot().canRequestAds || adRef.current !== ad || attempt.current !== showAttempt) {
        if (showing.current && attempt.current === showAttempt && !completed.current) {
          completed.current = true;
          showing.current = false;
          attempt.current += 1;
          logRewardOutcome("free_fallback");
          callback.current();
        }
        return;
      }
      return ad.show();
    }).catch((error: unknown) => {
      if (adRef.current !== ad || !showing.current || attempt.current !== showAttempt) return;
      logAdFailure("rewarded", "quiz_retry", error, "show");
      logAdSuppressed("rewarded", "quiz_retry", "show_failed");
      if (!completed.current) {
        completed.current = true;
        logRewardOutcome("free_fallback");
        callback.current();
      }
      attempt.current += 1;
      showing.current = false;
      if (getConsentSnapshot().canRequestAds) {
        logAdEvent("ad_request", "rewarded", "quiz_retry");
        try {
          ad.load();
        } catch (loadError) {
          logAdFailure("rewarded", "quiz_retry", loadError, "load");
        }
      }
    });
  }, []);

  return { loaded, show };
}
