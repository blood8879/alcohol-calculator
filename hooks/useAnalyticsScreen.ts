import { usePathname } from "expo-router";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import {
  analyticsPermission,
  normalizeScreen,
  subscribeAnalyticsPermission,
} from "../utils/analyticsCore";
import { logFirebaseEvent } from "../utils/firebase";

export const useAnalyticsScreen = (): void => {
  const pathname = usePathname();
  const permitted = useSyncExternalStore(
    subscribeAnalyticsPermission,
    analyticsPermission,
    () => false
  );
  const current = useRef<{ screen: string; started: number } | null>(null);
  const lastScreen = useRef<string | null>(null);

  useEffect(() => {
    const endScreen = () => {
      const visit = current.current;
      current.current = null;
      if (!visit || !analyticsPermission()) return;
      const durationSec = Math.floor((Date.now() - visit.started) / 1000);
      if (durationSec >= 3) {
        logFirebaseEvent("screen_engaged", {
          screen_name: visit.screen,
          duration_sec: Math.min(durationSec, 3600),
        });
      }
    };
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        endScreen();
      } else if (analyticsPermission() && lastScreen.current) {
        current.current = { screen: lastScreen.current, started: Date.now() };
      }
    });
    return () => {
      endScreen();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!permitted) {
      current.current = null;
      lastScreen.current = null;
      return;
    }
    const screen = normalizeScreen(pathname);
    if (!screen || screen === lastScreen.current) return;
    const prior = current.current;
    if (prior) {
      const durationSec = Math.floor((Date.now() - prior.started) / 1000);
      if (durationSec >= 3) {
        logFirebaseEvent("screen_engaged", {
          screen_name: prior.screen,
          duration_sec: Math.min(durationSec, 3600),
        });
      }
    }
    lastScreen.current = screen;
    current.current = AppState.currentState === "active"
      ? { screen, started: Date.now() }
      : null;
    logFirebaseEvent("screen_view", { screen_name: screen, screen_class: screen });
  }, [pathname, permitted]);
};
