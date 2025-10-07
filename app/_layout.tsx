import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";

import { useColorScheme } from "@/hooks/useColorScheme";

import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { initI18n } from "../i18n";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [i18nInitialized, setI18nInitialized] = useState(false);

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-7612314432840835/5764066171";

  const bannerRef = useRef<BannerAd>(null);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    initI18n().then(() => {
      setI18nInitialized(true);
    });
  }, []);

  if (!loaded || !i18nInitialized) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* <Stack.Screen name="(tabs)" options={{ headerShown: true }} /> */}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
      <View
        className="absolute bottom-0 left-0 right-0 items-center"
        style={{ paddingBottom: insets.bottom }}
      >
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </SafeAreaProvider>
  );
}
