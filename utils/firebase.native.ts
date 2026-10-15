import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics";
import { emitAnalyticsEvent, setAnalyticsPermission } from "./analyticsCore";
import type { AnalyticsParams } from "./analyticsCore";

export type { AnalyticsParams } from "./analyticsCore";

// 개발(디버그) 빌드의 이벤트·크래시가 실사용 데이터에 섞이지 않도록 수집은 릴리스 빌드에서만 켠다.
// (실기기 QA 중 테스트 사용이 GA 지표에 그대로 집계된 것을 확인함) jest는 __DEV__가 true라 테스트는 예외.
export const isCollectionAllowedForBuild = (
  isDev: boolean = __DEV__,
  nodeEnv: string | undefined = process.env.NODE_ENV
): boolean => !isDev || nodeEnv === "test";

export const logFirebaseEvent = (
  name: string,
  params?: AnalyticsParams
): void => {
  emitAnalyticsEvent(name, params, (safeName, safeParams) => {
    try {
      void Promise.resolve(logEvent(getAnalytics(), safeName, safeParams)).catch(() => {
        console.warn("Analytics event failed asynchronously");
      });
    } catch {
      console.warn("Analytics event failed synchronously");
    }
  });
};

export const setDataCollectionEnabled = async (
  enabled: boolean
): Promise<void> => {
  setAnalyticsPermission(false);
  try {
    if (enabled && isCollectionAllowedForBuild()) {
      await setCrashlyticsCollectionEnabled(getCrashlytics(), true);
      await setAnalyticsCollectionEnabled(getAnalytics(), true);
      setAnalyticsPermission(true);
    } else {
      await setAnalyticsCollectionEnabled(getAnalytics(), false);
      await setCrashlyticsCollectionEnabled(getCrashlytics(), false);
    }
  } catch (error: unknown) {
    try {
      await setAnalyticsCollectionEnabled(getAnalytics(), false);
    } catch {
      console.warn("Failed to disable Analytics after collection error");
    }
    try {
      await setCrashlyticsCollectionEnabled(getCrashlytics(), false);
    } catch {
      console.warn("Failed to disable Crashlytics after collection error");
    }
    throw error;
  }
};
