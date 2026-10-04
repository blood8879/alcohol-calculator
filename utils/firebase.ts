// 웹/테스트 환경 폴백. 네이티브에서는 firebase.native.ts가 대신 로드된다.
import { setAnalyticsPermission } from "./analyticsCore";
import type { AnalyticsParams } from "./analyticsCore";

export type { AnalyticsParams } from "./analyticsCore";

export const logFirebaseEvent = (
  _name: string,
  _params?: AnalyticsParams
): void => {};

export const setDataCollectionEnabled = async (
  enabled: boolean
): Promise<void> => { setAnalyticsPermission(enabled); };
