import { isCollectionAllowedForBuild } from "../utils/firebase.native";

jest.mock("@react-native-firebase/analytics", () => ({
  getAnalytics: jest.fn(),
  logEvent: jest.fn(),
  setAnalyticsCollectionEnabled: jest.fn(),
}));
jest.mock("@react-native-firebase/crashlytics", () => ({
  getCrashlytics: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(),
}));

// 개발 빌드(실기기 QA 포함) 이벤트가 GA 실사용 지표에 섞이지 않도록 수집은 릴리스 빌드에서만 허용한다.
describe("analytics collection build gate", () => {
  it("allows release builds", () => {
    expect(isCollectionAllowedForBuild(false, "production")).toBe(true);
  });

  it("blocks development builds (debug QA app on devices)", () => {
    expect(isCollectionAllowedForBuild(true, "development")).toBe(false);
    expect(isCollectionAllowedForBuild(true, "")).toBe(false);
  });

  it("keeps the unit-test environment working", () => {
    expect(isCollectionAllowedForBuild(true, "test")).toBe(true);
  });
});
