import { act, renderHook } from "@testing-library/react-native";
import { useAnalyticsScreen } from "../hooks/useAnalyticsScreen";
import { setAnalyticsPermission } from "../utils/analyticsCore";
import { logFirebaseEvent } from "../utils/firebase";

let mockPathname = "/quiz";
jest.mock("expo-router", () => ({ usePathname: () => mockPathname }));
jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));

describe("analytics screen lifecycle", () => {
  afterEach(() => {
    act(() => setAnalyticsPermission(false));
    jest.clearAllMocks();
  });

  it("sends the current screen once after asynchronous consent readiness", () => {
    const view = renderHook(() => useAnalyticsScreen());
    expect(logFirebaseEvent).not.toHaveBeenCalled();
    act(() => setAnalyticsPermission(true));
    expect(logFirebaseEvent).toHaveBeenCalledWith("screen_view", {
      screen_name: "quiz",
      screen_class: "quiz",
    });
    expect(logFirebaseEvent).toHaveBeenCalledTimes(1);
    view.rerender({});
    expect(logFirebaseEvent).toHaveBeenCalledTimes(1);
    view.unmount();
  });
});
