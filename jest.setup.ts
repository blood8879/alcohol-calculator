jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

jest.mock("react-native-google-mobile-ads", () => ({
  AdEventType: {
    CLOSED: "closed",
    LOADED: "loaded",
  },
  BannerAd: "BannerAd",
  BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: "anchoredAdaptiveBanner",
    BANNER: "banner",
  },
  InterstitialAd: {
    createForAdRequest: () => ({
      addAdEventListener: jest.fn(() => jest.fn()),
      load: jest.fn(),
      show: jest.fn(),
    }),
  },
  TestIds: {
    BANNER: "test-banner",
    INTERSTITIAL: "test-interstitial",
  },
}));

jest.mock("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: "default" },
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
    WEEKLY: "weekly",
  },
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

jest.mock("expo-device", () => ({
  isDevice: true,
}));
