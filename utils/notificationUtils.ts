import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pickLocalizedText } from "./localizedText";

const PREFS_KEY = "@notification_prefs";
const DAILY_REMINDER_ID = "daily-reminder";
const WEEKLY_SUMMARY_ID = "weekly-summary";

type ReminderRoute = "/(tabs)" | "/(tabs)/tracker";

type ReminderContent = {
  readonly title: string;
  readonly body: string;
  readonly sound: true;
  readonly data: {
    readonly route: ReminderRoute;
  };
};

export interface NotificationPrefs {
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  dailyEnabled: false,
  weeklyEnabled: false,
};

export function buildDailyReminderContent(language = "en"): ReminderContent {
  return {
    title: pickLocalizedText({
      ko: "오늘의 술 가이드",
      en: "Today's alcohol guide",
      es: "Guía de alcohol de hoy",
    }, language),
    body: pickLocalizedText({
      ko: "오늘의 퀴즈, 가이드, 기록 요약을 확인하세요.",
      en: "Open today's quiz, guide, and tracker summary.",
      es: "Abre el quiz, la guía y el resumen de hoy.",
    }, language),
    sound: true,
    data: { route: "/(tabs)" },
  };
}

export function buildWeeklySummaryContent(language = "en"): ReminderContent {
  return {
    title: pickLocalizedText({
      ko: "주간 요약",
      en: "Weekly Summary",
      es: "Resumen semanal",
    }, language),
    body: pickLocalizedText({
      ko: "주간 음주 기록과 중립적인 인사이트를 확인하세요.",
      en: "Review your weekly drinking stats and neutral insights.",
      es: "Revisa tus estadísticas e ideas semanales.",
    }, language),
    sound: true,
    data: { route: "/(tabs)/tracker" },
  };
}

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<void> {
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: buildDailyReminderContent(),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleWeeklySummary(): Promise<void> {
  await cancelWeeklySummary();

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_SUMMARY_ID,
    content: buildWeeklySummaryContent(),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 10,
      minute: 0,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
}

export async function cancelWeeklySummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID);
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) {
      return JSON.parse(raw) as NotificationPrefs;
    }
  } catch (e) {
    console.warn("Failed to load notification prefs:", e);
  }
  return DEFAULT_PREFS;
}

export async function setNotificationPrefs(
  prefs: NotificationPrefs
): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn("Failed to save notification prefs:", e);
  }
}
