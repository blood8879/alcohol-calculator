import { act, renderHook } from "@testing-library/react-native";
import { useConsentState } from "../hooks/useConsentState";
import { updateConsentState } from "../utils/consentState";

describe("consent snapshot", () => {
  afterEach(() => updateConsentState({
    canRequestAds: false,
    privacyOptionsRequired: false,
    updating: false,
  }));

  it("starts closed and updates mounted ad consumers when permission changes", () => {
    const view = renderHook(() => useConsentState());
    expect(view.result.current.canRequestAds).toBe(false);
    act(() => updateConsentState({
      canRequestAds: true,
      privacyOptionsRequired: true,
      updating: false,
    }));
    expect(view.result.current.canRequestAds).toBe(true);
    act(() => updateConsentState({
      canRequestAds: false,
      privacyOptionsRequired: true,
      updating: true,
    }));
    expect(view.result.current).toEqual({
      canRequestAds: false,
      privacyOptionsRequired: true,
      updating: true,
    });
    view.unmount();
  });
});
