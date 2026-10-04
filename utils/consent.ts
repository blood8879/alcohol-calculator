import {
  AdsConsent,
  AdsConsentDebugGeography,
  AdsConsentPrivacyOptionsRequirementStatus,
  AdsConsentStatus,
} from "./mobileAds";
import type { ConsentInfo } from "./mobileAds";
import { setDataCollectionEnabled } from "./firebase";
import { setAnalyticsPermission } from "./analyticsCore";
import { getConsentSnapshot, updateConsentState } from "./consentState";

const privacyRequired = (info: ConsentInfo): boolean =>
  info.privacyOptionsRequirementStatus ===
  AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;

const applyConsent = async (info: ConsentInfo): Promise<void> => {
  const analyticsEnabled = info.status === AdsConsentStatus.NOT_REQUIRED ||
    (info.status === AdsConsentStatus.OBTAINED &&
      (await AdsConsent.getUserChoices()).storeAndAccessInformationOnDevice);
  await setDataCollectionEnabled(analyticsEnabled);
  updateConsentState({
    canRequestAds: info.canRequestAds,
    privacyOptionsRequired: privacyRequired(info),
    updating: false,
  });
};

const closeCollection = async (): Promise<void> => {
  setAnalyticsPermission(false);
  updateConsentState({
    canRequestAds: false,
    privacyOptionsRequired: getConsentSnapshot().privacyOptionsRequired,
    updating: false,
  });
  try {
    await setDataCollectionEnabled(false);
  } catch {
    console.warn("Failed to disable data collection after consent error");
  }
};

const debugOptions = __DEV__ && process.env.EXPO_PUBLIC_UMP_DEBUG_GEOGRAPHY === "EEA"
  ? { debugGeography: AdsConsentDebugGeography.EEA }
  : undefined;

export const initConsentAndDataCollection = async (): Promise<void> => {
  setAnalyticsPermission(false);
  updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: true });
  try {
    await setDataCollectionEnabled(false);
    let info = await AdsConsent.requestInfoUpdate(debugOptions);
    if (
      info.isConsentFormAvailable &&
      (info.status === AdsConsentStatus.REQUIRED ||
        info.status === AdsConsentStatus.UNKNOWN)
    ) {
      info = await AdsConsent.showForm();
    }
    await applyConsent(info);
  } catch {
    await closeCollection();
    console.warn("Failed to initialize consent");
  }
};

export const showPrivacyOptionsAndUpdateCollection = async (): Promise<void> => {
  const current = getConsentSnapshot();
  if (current.updating || !current.privacyOptionsRequired) return;
  setAnalyticsPermission(false);
  updateConsentState({
    canRequestAds: false,
    privacyOptionsRequired: true,
    updating: true,
  });
  try {
    await setDataCollectionEnabled(false);
    await AdsConsent.showPrivacyOptionsForm();
    const info = await AdsConsent.getConsentInfo();
    await applyConsent(info);
  } catch (error) {
    await closeCollection();
    throw error;
  }
};
