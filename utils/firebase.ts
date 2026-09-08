// 웹/테스트 환경 폴백. 네이티브에서는 firebase.native.ts가 대신 로드된다.
export type AnalyticsParams = Record<string, string | number | boolean>;

export const logFirebaseEvent = (
  _name: string,
  _params?: AnalyticsParams
): void => {};

export const setDataCollectionEnabled = async (
  _enabled: boolean
): Promise<void> => {};
