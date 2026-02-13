import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "@notification_prefs";
const DAILY_REMINDER_ID = "daily-reminder";
const WEEKLY_SUMMARY_ID = "weekly-summary";

export interface NotificationPrefs {
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  dailyEnabled: false,
  weeklyEnabled: false,
};

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
    content: {
      title: "Time to log your drinks!",
      body: "Don't forget to track today's drinks",
      sound: true,
    },
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
    content: {
      title: "Weekly Summary",
      body: "Check your weekly drinking stats",
      sound: true,
    },
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
