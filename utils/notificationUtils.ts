import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pickLocalizedText } from "./localizedText";

const PREFS_KEY = "@notification_prefs";
const DAILY_REMINDER_ID = "daily-reminder";
const WEEKLY_SUMMARY_ID = "weekly-summary";
const SOBER_NOTIFICATION_KEY = "@sober_notification";

type ReminderRoute = "/(tabs)" | "/(tabs)/tracker" | "/session";

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
  driveSafeEnabled: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  dailyEnabled: false,
  weeklyEnabled: false,
  driveSafeEnabled: true,
};

export function buildDailyReminderContent(language = "en"): ReminderContent {
  return {
    title: pickLocalizedText({
      ko: "오늘의 술 가이드",
      en: "Today's alcohol guide",
      es: "Guía de alcohol de hoy",
      ja: "今日のお酒ガイド",
      zh: "今日饮酒指南",
    }, language),
    body: pickLocalizedText({
      ko: "오늘의 퀴즈, 가이드, 기록 요약을 확인하세요.",
      en: "Open today's quiz, guide, and tracker summary.",
      es: "Abre el quiz, la guía y el resumen de hoy.",
      ja: "今日のクイズ・ガイド・記録の要約をチェックしましょう。",
      zh: "查看今天的测验、指南和记录摘要。",
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
      ja: "週間サマリー",
      zh: "每周总结",
    }, language),
    body: pickLocalizedText({
      ko: "주간 음주 기록과 중립적인 인사이트를 확인하세요.",
      en: "Review your weekly drinking stats and neutral insights.",
      es: "Revisa tus estadísticas e ideas semanales.",
      ja: "週間の飲酒記録と中立的なインサイトを確認しましょう。",
      zh: "查看每周饮酒统计和中立的分析。",
    }, language),
    sound: true,
    data: { route: "/(tabs)/tracker" },
  };
}

export function buildDriveSafeContent(language = "en"): ReminderContent {
  return {
    title: pickLocalizedText({
      ko: "이제 운전할 수 있어요 (추정)",
      en: "You may be able to drive now (estimate)",
      es: "Quizá ya puedas conducir (estimación)",
      ja: "そろそろ運転できるかもしれません（推定）",
      zh: "现在也许可以开车了（估算）",
    }, language),
    body: pickLocalizedText({
      ko: "이제 알코올이 대사되었을 시간이에요. 그래도 운전 전 컨디션을 꼭 확인하세요.",
      en: "Alcohol should be metabolized by now. Still, check how you feel before driving.",
      es: "El alcohol ya debería estar metabolizado. Aun así, revisa cómo te sientes antes de conducir.",
      ja: "そろそろアルコールが分解された頃です。それでも運転前に必ず体調を確認してください。",
      zh: "此时酒精应已代谢完毕。但开车前请务必确认自己的状态。",
    }, language),
    sound: true,
    data: { route: "/session" },
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

// 운전 가능 추정 시각(soberAt, epoch ms)에 1회성 알림 예약.
// 과거 시각이면 예약하지 않는다. 예약된 id는 @sober_notification에 저장하고
// 재예약 시 기존 알림을 먼저 취소한다.
export async function scheduleDriveSafeReminder(
  soberAt: number,
  language = "en"
): Promise<boolean> {
  await cancelDriveSafeReminder();

  if (!Number.isFinite(soberAt) || soberAt <= Date.now()) {
    return false;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: buildDriveSafeContent(language),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(soberAt),
    },
  });

  try {
    await AsyncStorage.setItem(SOBER_NOTIFICATION_KEY, identifier);
  } catch (e) {
    console.warn("Failed to persist sober notification id:", e);
  }
  return true;
}

export async function cancelDriveSafeReminder(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(SOBER_NOTIFICATION_KEY);
    if (existing) {
      await Notifications.cancelScheduledNotificationAsync(existing);
      await AsyncStorage.removeItem(SOBER_NOTIFICATION_KEY);
    }
  } catch (e) {
    console.warn("Failed to cancel sober notification:", e);
  }
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
      return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
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
