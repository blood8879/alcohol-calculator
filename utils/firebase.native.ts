import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics";
import { emitAnalyticsEvent, setAnalyticsPermission } from "./analyticsCore";
import type { AnalyticsParams } from "./analyticsCore";

export type { AnalyticsParams } from "./analyticsCore";

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
    if (enabled) {
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
