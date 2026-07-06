import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  computeChallengeProgress,
  estimateMoneySaved,
  getChallenge,
  toLocalDateString,
} from "../utils/engagement/sobrietyChallenge";
import { getDrinkLogs, getWeeklyStats } from "../utils/trackerStorage";
import type { SobrietyWidgetContent } from "./SobrietyWidget";

const SAVINGS_BASELINE_DAYS = 28;

type WidgetLanguage = "ko" | "en" | "es";

const getLanguage = async (): Promise<WidgetLanguage> => {
  try {
    const stored = await AsyncStorage.getItem("@app_language");
    if (stored?.startsWith("en")) return "en";
    if (stored?.startsWith("es")) return "es";
    return "ko";
  } catch {
    return "ko";
  }
};

const STRINGS: Record<WidgetLanguage, {
  challengeTitle: string;
  dayUnit: (days: number) => string;
  target: (days: number) => string;
  saved: (amount: string) => string;
  weeklyTitle: string;
  drinksUnit: (count: number) => string;
  weeklySubtitle: (kcal: number) => string;
  emptyFooter: string;
}> = {
  ko: {
    challengeTitle: "절주 챌린지",
    dayUnit: (days) => `D+${days}`,
    target: (days) => `목표 ${days}일`,
    saved: (amount) => `💰 아낀 술값 약 ${amount}원`,
    weeklyTitle: "이번 주 음주",
    drinksUnit: (count) => `${count}잔`,
    weeklySubtitle: (kcal) => `${kcal} kcal`,
    emptyFooter: "탭해서 기록 시작하기",
  },
  en: {
    challengeTitle: "Sobriety Challenge",
    dayUnit: (days) => `Day ${days}`,
    target: (days) => `Goal: ${days} days`,
    saved: (amount) => `💰 ~${amount} saved`,
    weeklyTitle: "Drinks this week",
    drinksUnit: (count) => `${count} drinks`,
    weeklySubtitle: (kcal) => `${kcal} kcal`,
    emptyFooter: "Tap to start tracking",
  },
  es: {
    challengeTitle: "Reto sin alcohol",
    dayUnit: (days) => `Día ${days}`,
    target: (days) => `Meta: ${days} días`,
    saved: (amount) => `💰 ~${amount} ahorrados`,
    weeklyTitle: "Bebidas esta semana",
    drinksUnit: (count) => `${count} bebidas`,
    weeklySubtitle: (kcal) => `${kcal} kcal`,
    emptyFooter: "Toca para registrar",
  },
};

export const buildSobrietyWidgetContent =
  async (): Promise<SobrietyWidgetContent> => {
    const [language, challenge] = await Promise.all([
      getLanguage(),
      getChallenge(),
    ]);
    const strings = STRINGS[language];
    const today = new Date();

    if (challenge) {
      const [sy, sm, sd] = challenge.startDate
        .split("-")
        .map((n) => parseInt(n, 10));
      const challengeStart = new Date(sy, (sm || 1) - 1, sd || 1);
      challengeStart.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      const baselineStart = new Date(challengeStart);
      baselineStart.setDate(baselineStart.getDate() - SAVINGS_BASELINE_DAYS);

      const [challengeLogs, baselineLogs] = await Promise.all([
        getDrinkLogs(challengeStart, endOfToday),
        getDrinkLogs(baselineStart, challengeStart),
      ]);
      const drinkDates = challengeLogs.map((log) =>
        toLocalDateString(new Date(log.timestamp))
      );
      const progress = computeChallengeProgress(challenge, drinkDates, today);
      const baselineSpend = baselineLogs.reduce(
        (sum, log) => sum + (log.price ?? 0),
        0
      );
      const saved = estimateMoneySaved(
        baselineSpend,
        SAVINGS_BASELINE_DAYS,
        progress.currentStreakDays
      );

      return {
        title: strings.challengeTitle,
        mainValue: strings.dayUnit(progress.currentStreakDays),
        subtitle: progress.succeeded
          ? "🎉"
          : strings.target(progress.targetDays),
        footer: saved > 0 ? strings.saved(saved.toLocaleString()) : "",
      };
    }

    const weekly = await getWeeklyStats(today);
    return {
      title: strings.weeklyTitle,
      mainValue: strings.drinksUnit(weekly.totalDrinks),
      subtitle: strings.weeklySubtitle(weekly.totalCalories),
      footer: weekly.totalDrinks === 0 ? strings.emptyFooter : "",
    };
  };
