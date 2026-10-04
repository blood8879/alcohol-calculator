import { logEvent, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";
import { setCrashlyticsCollectionEnabled } from "@react-native-firebase/crashlytics";
import { analyticsPermission, setAnalyticsPermission } from "../utils/analyticsCore";
import { logFirebaseEvent, setDataCollectionEnabled } from "../utils/firebase.native";

jest.mock("@react-native-firebase/analytics", () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(async () => {}),
  setAnalyticsCollectionEnabled: jest.fn(async () => {}),
}));
jest.mock("@react-native-firebase/crashlytics", () => ({
  getCrashlytics: jest.fn(() => ({})),
  setCrashlyticsCollectionEnabled: jest.fn(async () => {}),
}));

describe("native analytics adapter", () => {
  afterEach(() => {
    setAnalyticsPermission(false);
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockRestore();
  });

  it("does not enable the event gate before both SDK toggles resolve", async () => {
    let resolveAnalytics: (() => void) | undefined;
    jest.mocked(setAnalyticsCollectionEnabled).mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveAnalytics = resolve;
    }));
    const enabling = setDataCollectionEnabled(true);
    await Promise.resolve();
    expect(analyticsPermission()).toBe(false);
    resolveAnalytics?.();
    await enabling;
    expect(analyticsPermission()).toBe(true);
  });

  it("fails closed when an SDK toggle rejects", async () => {
    jest.mocked(setAnalyticsCollectionEnabled).mockRejectedValueOnce(new Error("offline"));
    jest.spyOn(console, "warn").mockImplementation(() => {});
    await expect(setDataCollectionEnabled(true)).rejects.toThrow("offline");
    expect(analyticsPermission()).toBe(false);
    expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith({}, false);
  });

  it("contains synchronous SDK event failures", () => {
    setAnalyticsPermission(true);
    jest.mocked(logEvent).mockImplementationOnce(() => { throw new Error("sync"); });
    jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => logFirebaseEvent("quiz_started", { mode: "daily" })).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith("Analytics event failed synchronously");
  });

  it("contains asynchronous SDK event failures", async () => {
    setAnalyticsPermission(true);
    jest.mocked(logEvent).mockImplementationOnce(async () => { throw new Error("async"); });
    jest.spyOn(console, "warn").mockImplementation(() => {});
    logFirebaseEvent("notification_toggled", { enabled: true });
    await Promise.resolve();
    await Promise.resolve();
    expect(console.warn).toHaveBeenCalledWith("Analytics event failed asynchronously");
    expect(logEvent).toHaveBeenCalledWith({}, "notification_toggled", {
      analytics_version: 2,
      enabled: 1,
    });
  });
});
