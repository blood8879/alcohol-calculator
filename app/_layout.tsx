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
import "../global.css";

import { useEffect, useState } from "react";
import { View } from "react-native";
import { initI18n } from "../i18n";
import { BannerAd, BannerAdSize } from "../utils/mobileAds";
import { adUnits } from "../utils/adUnits";

type NotificationRoute = "/(tabs)" | "/(tabs)/tracker";

const isNotificationRoute = (route: unknown): route is NotificationRoute =>
  route === "/(tabs)" || route === "/(tabs)/tracker";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i18nInitialized, setI18nInitialized] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    initI18n().then(() => {
      setI18nInitialized(true);
    });
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

      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      const initialRoute = lastResponse ? routeFromResponse(lastResponse) : null;
      if (isNotificationRoute(initialRoute)) {
        router.push(initialRoute);
      }

      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const route = routeFromResponse(response);
        if (isNotificationRoute(route)) {
          router.push(route);
        }
      });

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
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1 }}>
          <Slot />
          <StatusBar style="light" />
        </View>
      </ThemeProvider>
      <View className="items-center" style={{ paddingBottom: insets.bottom }}>
        <BannerAd
          unitId={adUnits.anchoredBanner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </SafeAreaProvider>
  );
}
