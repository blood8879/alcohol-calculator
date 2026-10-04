import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { NotificationResponse } from "expo-notifications";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import "../global.css";

import { useEffect, useState } from "react";
import { View } from "react-native";
import { initI18n } from "../i18n";
import { BannerAdSize } from "../utils/mobileAds";
import { TrackedBannerAd } from "../components/TrackedBannerAd";
import { adUnits } from "../utils/adUnits";
import { initConsentAndDataCollection } from "../utils/consent";
import { useAnalyticsScreen } from "../hooks/useAnalyticsScreen";
import { logFirebaseEvent } from "../utils/firebase";
import { DialogProvider } from "../components/ui/DialogProvider";

type NotificationRoute = "/(tabs)" | "/(tabs)/tracker" | "/session";

const isNotificationRoute = (route: unknown): route is NotificationRoute =>
  route === "/(tabs)" ||
  route === "/(tabs)/tracker" ||
  route === "/session";

SplashScreen.preventAutoHideAsync().catch(() => {});
const seenNotificationResponses = new Set<string>();

export default function RootLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i18nInitialized, setI18nInitialized] = useState(false);
  useAnalyticsScreen();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    initI18n().then(() => {
      setI18nInitialized(true);
    });
  }, []);

  useEffect(() => {
    void initConsentAndDataCollection();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      const Notifications = await import("expo-notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      const routeFromResponse = (
        response: NotificationResponse
      ) => response.notification.request.content.data?.route;

      const handleResponse = (response: NotificationResponse) => {
        const route = routeFromResponse(response);
        if (!isNotificationRoute(route)) return;
        const responseId = `${response.notification.request.identifier}:${response.actionIdentifier}`;
        if (seenNotificationResponses.has(responseId)) return;
        if (seenNotificationResponses.size >= 20) seenNotificationResponses.clear();
        seenNotificationResponses.add(responseId);
        const type = route === "/session" ? "drive_safe" : route === "/(tabs)/tracker" ? "weekly" : "daily";
        logFirebaseEvent("notification_opened", { type });
        router.push(route);
      };

      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) handleResponse(lastResponse);

      const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

      return () => {
        subscription.remove();
      };
    };
    let cleanup: (() => void) | undefined;
    setupNotifications().then((nextCleanup) => {
      cleanup = nextCleanup;
    });
    return () => {
      cleanup?.();
    };
  }, [router]);

  // 루트 창 배경을 앱 배경색으로(기본은 흰색이라 투명한 영역·전환 순간에 흰 띠가 비쳤다).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#111827").catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded && i18nInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, i18nInitialized]);

  if (!loaded || !i18nInitialized) {
    // 폰트·i18n 준비 전까지 스플래시 화면 유지
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#111827" }}>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1 }}>
          <DialogProvider>
            <Slot />
          </DialogProvider>
          <StatusBar style="light" />
        </View>
      </ThemeProvider>
      {/* 배너 로드 전·하단 인셋 영역도 다크 배경으로 칠한다(투명하면 루트 창의 흰 배경이 띠로 보였음). */}
      <View className="items-center bg-background" style={{ paddingBottom: insets.bottom }}>
        <TrackedBannerAd
          unitId={adUnits.anchoredBanner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          placement="anchored"
        />
      </View>
    </SafeAreaProvider>
  );
}
