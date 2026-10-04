import {
  analyticsPermission,
  emitAnalyticsEvent,
  normalizeScreen,
  sanitizeAnalyticsParams,
  setAnalyticsPermission,
  subscribeAnalyticsPermission,
} from "../utils/analyticsCore";

describe("analytics foundation", () => {
  afterEach(() => setAnalyticsPermission(false));

  it("drops events before permission and after denial without replay", () => {
    const sink = jest.fn();
    emitAnalyticsEvent("calculator_used", { calculator_type: "bac" }, sink);
    expect(sink).not.toHaveBeenCalled();
    setAnalyticsPermission(true);
    expect(sink).not.toHaveBeenCalled();
    emitAnalyticsEvent("calculator_used", { calculator_type: "bac" }, sink);
    expect(sink).toHaveBeenCalledTimes(1);
    setAnalyticsPermission(false);
    emitAnalyticsEvent("calculator_used", { calculator_type: "bac" }, sink);
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers only when permission changes", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeAnalyticsPermission(listener);
    setAnalyticsPermission(false);
    setAnalyticsPermission(true);
    setAnalyticsPermission(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(analyticsPermission()).toBe(true);
    unsubscribe();
  });

  it("bounds parameters and removes unsafe values", () => {
    const params = sanitizeAnalyticsParams({
      calculator_type: "bac",
      raw_input: "person@example.com",
      big_number: Number.POSITIVE_INFINITY,
      negative_number: -1,
      safe_number: 12,
      long_text: "x".repeat(101),
    });
    expect(params).toEqual({
      analytics_version: 2,
      calculator_type: "bac",
      safe_number: 12,
    });
  });

  it("preserves public calculator values and slug identifiers", () => {
    expect(sanitizeAnalyticsParams({
      calculator_type: "alcoholContent",
      item_id: "standard-drink",
      duration_bucket: "1_3h",
    })).toEqual({
      analytics_version: 2,
      calculator_type: "alcoholContent",
      item_id: "standard-drink",
      duration_bucket: "1_3h",
    });
  });

  it("maps routes to a finite screen taxonomy", () => {
    expect(normalizeScreen("/(tabs)/more/settings?email=a@b.com")).toBe("settings");
    expect(normalizeScreen("/more/settings")).toBe("settings");
    expect(normalizeScreen("/(tabs)")).toBe("home");
    expect(normalizeScreen("/unexpected/private")).toBeNull();
  });
});
