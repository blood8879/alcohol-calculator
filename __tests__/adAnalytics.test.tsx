import { act, render, renderHook } from "@testing-library/react-native";
import { TrackedBannerAd } from "../components/TrackedBannerAd";
import { useInterstitialAd } from "../hooks/useInterstitialAd";
import { useRewardedAd } from "../hooks/useRewardedAd";
import { classifyAdFailure } from "../utils/adAnalytics";
import { logFirebaseEvent } from "../utils/firebase";
import { BannerAd } from "../utils/mobileAds";
import { updateConsentState } from "../utils/consentState";

const mockListeners = new Map<string, Set<(...args: unknown[]) => void>>();
const mockLoad = jest.fn();
const mockShow = jest.fn<Promise<void>, []>(() => Promise.resolve());
const mockCreateInterstitial = jest.fn(() => ({
  addAdEventListener: mockSubscribe, load: mockLoad, show: mockShow,
}));
const mockCreateRewarded = jest.fn(() => ({
  addAdEventListener: mockSubscribe, load: mockLoad, show: mockShow,
}));
const mockSubscribe = (event: string, listener: (...args: unknown[]) => void) => {
  const listeners = mockListeners.get(event) ?? new Set();
  listeners.add(listener);
  mockListeners.set(event, listeners);
  return () => listeners.delete(listener);
};
const emit = (event: string, error?: unknown) => {
  mockListeners.get(event)?.forEach((listener) => listener(error));
};

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));
jest.mock("../utils/mobileAds", () => ({
  AdEventType: {
    LOADED: "loaded", ERROR: "error", OPENED: "opened", CLICKED: "clicked", CLOSED: "closed",
  },
  RewardedAdEventType: {
    LOADED: "rewarded_loaded", EARNED_REWARD: "rewarded_earned_reward",
  },
  InterstitialAd: {
    createForAdRequest: () => mockCreateInterstitial(),
  },
  RewardedAd: {
    createForAdRequest: () => mockCreateRewarded(),
  },
  BannerAd: jest.fn(() => null),
  TestIds: { BANNER: "test-banner", INTERSTITIAL: "test-interstitial", REWARDED: "test-rewarded" },
}));

beforeEach(() => {
  updateConsentState({ canRequestAds: true, privacyOptionsRequired: false, updating: false });
  mockListeners.clear();
  mockLoad.mockClear();
  mockShow.mockReset().mockResolvedValue();
  mockCreateInterstitial.mockClear();
  mockCreateRewarded.mockClear();
  jest.mocked(BannerAd).mockClear();
  jest.mocked(logFirebaseEvent).mockClear();
});

afterEach(() => {
  updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false });
});

it("does not mount or request banners before consent, then mounts once granted", () => {
  updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false });
  render(<TrackedBannerAd unitId="banner-unit" size="banner" placement="inline" />);
  expect(BannerAd).not.toHaveBeenCalled();
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_request", expect.anything());
  act(() => updateConsentState({ canRequestAds: true, privacyOptionsRequired: false, updating: false }));
  expect(BannerAd).toHaveBeenCalledTimes(1);
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([name]) => name === "ad_request")).toHaveLength(1);
  act(() => updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false }));
  expect(jest.mocked(BannerAd).mock.calls).toHaveLength(1);
});

it("creates interstitial only after consent and blocks cached show after revocation", () => {
  updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false });
  const { result, unmount } = renderHook(() => useInterstitialAd("quiz-unit", { placement: "quiz" }));
  expect(mockCreateInterstitial).not.toHaveBeenCalled();
  expect(mockLoad).not.toHaveBeenCalled();
  expect(result.current.show()).toBe(false);
  act(() => updateConsentState({ canRequestAds: true, privacyOptionsRequired: false, updating: false }));
  expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
  expect(mockLoad).toHaveBeenCalledTimes(1);
  act(() => emit("loaded"));
  act(() => {
    updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false });
    expect(result.current.show()).toBe(false);
    result.current.reload();
  });
  expect(result.current.loaded).toBe(false);
  expect(mockShow).not.toHaveBeenCalled();
  expect(mockLoad).toHaveBeenCalledTimes(1);
  act(() => updateConsentState({ canRequestAds: true, privacyOptionsRequired: false, updating: false }));
  expect(mockCreateInterstitial).toHaveBeenCalledTimes(2);
  expect(mockLoad).toHaveBeenCalledTimes(2);
  unmount();
});

it("uses free fallback while consent is denied without creating rewarded SDK ad", () => {
  updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false });
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  expect(mockCreateRewarded).not.toHaveBeenCalled();
  act(() => result.current.show());
  expect(restart).toHaveBeenCalledTimes(1);
  expect(mockLoad).not.toHaveBeenCalled();
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_failed", expect.anything());
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_request", expect.anything());
  act(() => updateConsentState({ canRequestAds: true, privacyOptionsRequired: false, updating: false }));
  expect(mockCreateRewarded).toHaveBeenCalledTimes(1);
  expect(mockLoad).toHaveBeenCalledTimes(1);
  unmount();
});

it("revokes a pending rewarded show with one fallback and no new request", async () => {
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  act(() => emit("rewarded_loaded"));
  act(() => result.current.show());
  await act(async () => { await Promise.resolve(); });
  act(() => updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: true }));
  expect(result.current.loaded).toBe(false);
  expect(restart).toHaveBeenCalledTimes(1);
  expect(mockLoad).toHaveBeenCalledTimes(1);
  emit("rewarded_earned_reward");
  expect(restart).toHaveBeenCalledTimes(1);
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("quiz_retry_ad_watched");
  unmount();
});

it("classifies only known SDK codes and never logs raw messages", () => {
  expect(classifyAdFailure({ code: "googleMobileAds/error-code-no-fill", message: "private" }, "load")).toBe("no_fill");
  expect(classifyAdFailure({ code: "private" }, "load")).toBe("unknown");
  expect(classifyAdFailure(new Error("private"), "show")).toBe("show_failed");
});

it("counts banner load as loaded and click-through as clicked, never shown", () => {
  render(<TrackedBannerAd unitId="banner-unit" size="banner" placement="inline" />);
  const props = jest.mocked(BannerAd).mock.calls[0]?.[0];
  act(() => {
    props?.onAdLoaded?.();
    props?.onAdOpened?.();
  });
  expect(logFirebaseEvent).toHaveBeenCalledWith("ad_loaded", { ad_format: "banner", placement: "inline" });
  expect(logFirebaseEvent).toHaveBeenCalledWith("ad_clicked", { ad_format: "banner", placement: "inline" });
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_shown", expect.anything());
});

it("reserves a dark banner slot before load and collapses it after a load failure", () => {
  // Given a banner that has not loaded yet (native view is 0x0 until then).
  const { toJSON } = render(<TrackedBannerAd unitId="banner-unit" size="banner" placement="anchored" />);
  const slotStyle = () => {
    const tree = toJSON() as { props: { style?: unknown } } | null;
    return [tree?.props.style].flat(Infinity) as Record<string, unknown>[];
  };
  // Then the slot keeps the 50pt banner height instead of an empty band.
  expect(slotStyle()).toEqual(expect.arrayContaining([expect.objectContaining({ minHeight: 50 })]));

  // When the load fails, the reserved space is released.
  const props = jest.mocked(BannerAd).mock.calls[0]?.[0];
  act(() => {
    props?.onAdFailedToLoad?.(new Error("no fill"));
  });
  expect(slotStyle()).toEqual(expect.arrayContaining([expect.objectContaining({ minHeight: 0 })]));
});

it("logs interstitial shown only after OPENED and dismissal after CLOSED", async () => {
  const onClosed = jest.fn();
  const { result, unmount } = renderHook(() => useInterstitialAd("quiz-unit", { placement: "quiz", onClosed }));
  act(() => emit("loaded"));
  act(() => expect(result.current.show()).toBe(true));
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_shown", expect.anything());
  await act(async () => { await Promise.resolve(); });
  act(() => { emit("opened"); emit("opened"); emit("closed"); });
  expect(logFirebaseEvent).toHaveBeenCalledWith("ad_shown", { ad_format: "interstitial", placement: "quiz" });
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([name]) => name === "ad_shown")).toHaveLength(1);
  expect(onClosed).toHaveBeenCalledTimes(1);
  expect(mockLoad).toHaveBeenCalledTimes(2);
  unmount();
});

it("records a failed interstitial load and a rejected show without a view", async () => {
  const onClosed = jest.fn();
  const { result, unmount } = renderHook(() => useInterstitialAd("quiz-unit", { placement: "quiz", onClosed }));
  act(() => emit("error", { code: "googleMobileAds/error-code-no-fill", message: "private" }));
  expect(logFirebaseEvent).toHaveBeenCalledWith("ad_failed", {
    ad_format: "interstitial", placement: "quiz", error_code: 1, failure_reason: "no_fill",
  });
  act(() => emit("loaded"));
  mockShow.mockRejectedValueOnce(new Error("private"));
  act(() => expect(result.current.show()).toBe(true));
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  expect(onClosed).toHaveBeenCalledTimes(1);
  expect(logFirebaseEvent).toHaveBeenCalledWith("ad_failed", {
    ad_format: "interstitial", placement: "quiz", error_code: 2, failure_reason: "show_failed",
  });
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_shown", expect.anything());
  unmount();
});

it("grants a rewarded retry once only on earned event", async () => {
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  act(() => emit("rewarded_loaded"));
  act(() => result.current.show());
  await act(async () => { await Promise.resolve(); });
  act(() => { emit("opened"); emit("rewarded_earned_reward"); emit("rewarded_earned_reward"); emit("closed"); });
  expect(restart).toHaveBeenCalledTimes(1);
  expect(logFirebaseEvent).toHaveBeenCalledWith("quiz_retry_ad_watched");
  expect(logFirebaseEvent).toHaveBeenCalledWith("reward_outcome", {
    ad_format: "rewarded", placement: "quiz_retry", outcome: "earned_reward",
  });
  expect(mockLoad).toHaveBeenCalledTimes(2);
  unmount();
});

it("does not grant a reward when a video closes before it is earned", async () => {
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  act(() => emit("rewarded_loaded"));
  act(() => result.current.show());
  await act(async () => { await Promise.resolve(); });
  act(() => { emit("opened"); emit("closed"); });
  expect(restart).not.toHaveBeenCalled();
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("quiz_retry_ad_watched");
  expect(logFirebaseEvent).toHaveBeenCalledWith("reward_outcome", {
    ad_format: "rewarded", placement: "quiz_retry", outcome: "dismissed_without_reward",
  });
  unmount();
});

it("grants a free fallback on not ready and rejected show without fake view", async () => {
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  act(() => result.current.show());
  expect(restart).toHaveBeenCalledTimes(1);
  act(() => emit("rewarded_loaded"));
  mockShow.mockRejectedValueOnce(new Error("private"));
  act(() => result.current.show());
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  expect(restart).toHaveBeenCalledTimes(2);
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("ad_shown", expect.anything());
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("quiz_retry_ad_watched");
  unmount();
});

it("ignores late SDK events and rejected show after unmount", async () => {
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  act(() => emit("rewarded_loaded"));
  let rejectShow: (error: Error) => void = () => {};
  mockShow.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectShow = reject; }));
  act(() => result.current.show());
  await act(async () => { await Promise.resolve(); });
  unmount();
  await act(async () => { rejectShow(new Error("late")); await Promise.resolve(); });
  emit("rewarded_earned_reward");
  expect(restart).not.toHaveBeenCalled();
});

it("ignores rejection from a prior rewarded attempt after a new attempt starts", async () => {
  const restart = jest.fn();
  const { result, unmount } = renderHook(() => useRewardedAd(restart));
  let rejectFirst: (error: Error) => void = () => {};
  mockShow
    .mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectFirst = reject; }))
    .mockResolvedValueOnce();
  act(() => emit("rewarded_loaded"));
  act(() => result.current.show());
  await act(async () => { await Promise.resolve(); });
  act(() => emit("closed"));
  act(() => emit("rewarded_loaded"));
  act(() => result.current.show());
  await act(async () => { rejectFirst(new Error("stale")); await Promise.resolve(); });
  expect(restart).not.toHaveBeenCalled();
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([name, params]) =>
    name === "reward_outcome" && params?.outcome === "free_fallback"
  )).toHaveLength(0);
  unmount();
});
