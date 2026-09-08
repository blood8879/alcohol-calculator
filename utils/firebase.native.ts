import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics";

export type AnalyticsParams = Record<string, string | number | boolean>;

export const logFirebaseEvent = (
  name: string,
  params?: AnalyticsParams
): void => {
  // 로깅 실패가 사용자 플로우를 막지 않도록 항상 삼킨다.
  void Promise.resolve(logEvent(getAnalytics(), name, params)).catch(() => {});
};

export const setDataCollectionEnabled = async (
  enabled: boolean
): Promise<void> => {
  await setAnalyticsCollectionEnabled(getAnalytics(), enabled);
  await setCrashlyticsCollectionEnabled(getCrashlytics(), enabled);
};
