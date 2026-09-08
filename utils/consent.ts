import { AdsConsent, AdsConsentStatus } from "./mobileAds";
import { setDataCollectionEnabled } from "./firebase";

/**
 * 앱 부팅 시 UMP 동의 상태를 갱신하고, 필요하면 동의 폼을 띄운 뒤
 * 결과에 따라 Analytics/Crashlytics 수집 허용 여부를 정한다.
 * GDPR 대상이 아니면(NOT_REQUIRED) 수집을 허용하고, 대상이면 사용자가
 * "기기 정보 저장·접근"에 동의한 경우에만 허용한다.
 */
export const initConsentAndDataCollection = async (): Promise<void> => {
  try {
    let info = await AdsConsent.requestInfoUpdate();

    if (
      info.isConsentFormAvailable &&
      (info.status === AdsConsentStatus.REQUIRED ||
        info.status === AdsConsentStatus.UNKNOWN)
    ) {
      info = await AdsConsent.showForm();
    }

    const enabled =
      info.status === AdsConsentStatus.NOT_REQUIRED
        ? true
        : (await AdsConsent.getUserChoices())
            .storeAndAccessInformationOnDevice;

    await setDataCollectionEnabled(enabled);
  } catch (error) {
    // 동의 플로우 실패가 앱 부팅을 막지 않도록 방어한다.
    console.warn("Failed to initialize consent:", error);
  }
};
