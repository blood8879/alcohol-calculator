import { AdsConsent, AdsConsentStatus } from "../utils/mobileAds";
import { initConsentAndDataCollection, showPrivacyOptionsAndUpdateCollection } from "../utils/consent";
import { analyticsPermission, setAnalyticsPermission } from "../utils/analyticsCore";
import { getConsentSnapshot, updateConsentState } from "../utils/consentState";
import { setDataCollectionEnabled } from "../utils/firebase";

const mockSetAnalyticsPermission = (enabled: boolean): void => setAnalyticsPermission(enabled);

jest.mock("../utils/mobileAds", () => ({
  AdsConsentStatus: {
    UNKNOWN: "UNKNOWN",
    REQUIRED: "REQUIRED",
    NOT_REQUIRED: "NOT_REQUIRED",
    OBTAINED: "OBTAINED",
  },
  AdsConsentPrivacyOptionsRequirementStatus: {
    UNKNOWN: "UNKNOWN",
    REQUIRED: "REQUIRED",
    NOT_REQUIRED: "NOT_REQUIRED",
  },
  AdsConsentDebugGeography: { EEA: 1 },
  AdsConsent: {
    requestInfoUpdate: jest.fn(),
    showForm: jest.fn(),
    showPrivacyOptionsForm: jest.fn(),
    getConsentInfo: jest.fn(),
    getUserChoices: jest.fn(),
  },
}));

jest.mock("../utils/firebase", () => ({
  setDataCollectionEnabled: jest.fn(async (enabled: boolean) => {
    mockSetAnalyticsPermission(enabled);
  }),
}));

describe("consent collection gate", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    setAnalyticsPermission(false);
    updateConsentState({ canRequestAds: false, privacyOptionsRequired: false, updating: false });
  });

  it("starts with ad requests disabled", () => {
    expect(getConsentSnapshot().canRequestAds).toBe(false);
  });

  it("enables collection when consent is not required", async () => {
    jest.spyOn(AdsConsent, "requestInfoUpdate").mockResolvedValue({
      status: AdsConsentStatus.NOT_REQUIRED,
      isConsentFormAvailable: false,
      canRequestAds: true,
      privacyOptionsRequirementStatus: "NOT_REQUIRED",
    });
    await initConsentAndDataCollection();
    expect(setDataCollectionEnabled).toHaveBeenCalledWith(true);
    expect(analyticsPermission()).toBe(true);
    expect(getConsentSnapshot().canRequestAds).toBe(true);
  });

  it("keeps collection disabled when required consent is denied", async () => {
    jest.spyOn(AdsConsent, "requestInfoUpdate").mockResolvedValue({
      status: AdsConsentStatus.REQUIRED,
      isConsentFormAvailable: false,
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    jest.spyOn(AdsConsent, "getUserChoices").mockResolvedValue({
      storeAndAccessInformationOnDevice: false,
    });
    await initConsentAndDataCollection();
    expect(setDataCollectionEnabled).toHaveBeenCalledWith(false);
    expect(analyticsPermission()).toBe(false);
    expect(getConsentSnapshot().canRequestAds).toBe(false);
  });

  it("keeps analytics off when a completed UMP form denies device storage", async () => {
    jest.spyOn(AdsConsent, "requestInfoUpdate").mockResolvedValue({
      status: AdsConsentStatus.REQUIRED,
      isConsentFormAvailable: true,
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    jest.spyOn(AdsConsent, "showForm").mockResolvedValue({
      status: AdsConsentStatus.OBTAINED,
      isConsentFormAvailable: true,
      canRequestAds: true,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    jest.spyOn(AdsConsent, "getUserChoices").mockResolvedValue({
      storeAndAccessInformationOnDevice: false,
    });
    await initConsentAndDataCollection();
    expect(setDataCollectionEnabled).toHaveBeenLastCalledWith(false);
    expect(analyticsPermission()).toBe(false);
    expect(getConsentSnapshot().canRequestAds).toBe(true);
    expect(getConsentSnapshot().privacyOptionsRequired).toBe(true);
  });

  it("does not use stale choices while status remains unknown", async () => {
    jest.spyOn(AdsConsent, "requestInfoUpdate").mockResolvedValue({
      status: AdsConsentStatus.UNKNOWN,
      isConsentFormAvailable: false,
      canRequestAds: false,
      privacyOptionsRequirementStatus: "UNKNOWN",
    });
    const choices = jest.spyOn(AdsConsent, "getUserChoices");
    await initConsentAndDataCollection();
    expect(choices).not.toHaveBeenCalled();
    expect(setDataCollectionEnabled).toHaveBeenCalledWith(false);
    expect(analyticsPermission()).toBe(false);
    expect(getConsentSnapshot().canRequestAds).toBe(false);
  });

  it("revokes analytics and ad requests while reopening privacy choices", async () => {
    updateConsentState({ canRequestAds: true, privacyOptionsRequired: true, updating: false });
    setAnalyticsPermission(true);
    jest.spyOn(AdsConsent, "showPrivacyOptionsForm").mockResolvedValue({
      status: AdsConsentStatus.REQUIRED,
      isConsentFormAvailable: true,
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    jest.spyOn(AdsConsent, "getConsentInfo").mockResolvedValue({
      status: AdsConsentStatus.REQUIRED,
      isConsentFormAvailable: true,
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    await showPrivacyOptionsAndUpdateCollection();
    expect(getConsentSnapshot()).toEqual({
      canRequestAds: false,
      privacyOptionsRequired: true,
      updating: false,
    });
    expect(setDataCollectionEnabled).toHaveBeenCalledWith(false);
    expect(analyticsPermission()).toBe(false);
  });

  it("closes ad requests immediately while the privacy form is open", async () => {
    updateConsentState({ canRequestAds: true, privacyOptionsRequired: true, updating: false });
    setAnalyticsPermission(true);
    let finishForm: ((info: {
      status: string;
      isConsentFormAvailable: boolean;
      canRequestAds: boolean;
      privacyOptionsRequirementStatus: string;
    }) => void) | undefined;
    jest.spyOn(AdsConsent, "showPrivacyOptionsForm").mockImplementation(() =>
      new Promise((resolve) => { finishForm = resolve; })
    );
    const info = {
      status: AdsConsentStatus.NOT_REQUIRED,
      isConsentFormAvailable: false,
      canRequestAds: true,
      privacyOptionsRequirementStatus: "NOT_REQUIRED",
    };
    jest.spyOn(AdsConsent, "getConsentInfo").mockResolvedValue(info);
    const reopening = showPrivacyOptionsAndUpdateCollection();
    expect(getConsentSnapshot()).toEqual({
      canRequestAds: false,
      privacyOptionsRequired: true,
      updating: true,
    });
    expect(analyticsPermission()).toBe(false);
    await Promise.resolve();
    finishForm?.(info);
    await reopening;
    expect(getConsentSnapshot().canRequestAds).toBe(true);
    expect(analyticsPermission()).toBe(true);
  });

  it("fails closed when privacy choices cannot open", async () => {
    updateConsentState({ canRequestAds: true, privacyOptionsRequired: true, updating: false });
    setAnalyticsPermission(true);
    jest.spyOn(AdsConsent, "showPrivacyOptionsForm").mockRejectedValue(new Error("form failed"));
    await expect(showPrivacyOptionsAndUpdateCollection()).rejects.toThrow("form failed");
    expect(getConsentSnapshot()).toEqual({
      canRequestAds: false,
      privacyOptionsRequired: true,
      updating: false,
    });
    expect(analyticsPermission()).toBe(false);
  });

  it("fails closed if consent lookup fails", async () => {
    jest.spyOn(AdsConsent, "requestInfoUpdate").mockRejectedValue(new Error("offline"));
    jest.spyOn(console, "warn").mockImplementation(() => {});
    await initConsentAndDataCollection();
    expect(setDataCollectionEnabled).toHaveBeenCalledWith(false);
    expect(analyticsPermission()).toBe(false);
  });
});
