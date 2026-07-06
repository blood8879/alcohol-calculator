import React, { useState, useCallback } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import CalendarStrip from "../../components/CalendarStrip";
import DrinkLogItem from "../../components/DrinkLogItem";
import AddDrinkModal from "../../components/AddDrinkModal";
import StatsChart from "../../components/StatsChart";
import InlineBannerAd from "../../components/InlineBannerAd";
import TrackerInsightsCard from "../../components/TrackerInsightsCard";
import Card from "../../components/ui/Card";
import {
  DrinkLog,
  getDrinkLogs,
  getDrinkLogsForDate,
  deleteDrinkLog,
  getWeeklyStats,
} from "../../utils/trackerStorage";
import {
  buildTrackerInsights,
  TrackerInsights,
} from "../../utils/engagement/trackerInsights";

import SobrietyChallengeCard from "../../components/SobrietyChallengeCard";
import {
  SobrietyChallenge,
  ChallengeProgress,
  getChallenge,
  startChallenge,
  stopChallenge,
  computeChallengeProgress,
  estimateMoneySaved,
  toLocalDateString,
} from "../../utils/engagement/sobrietyChallenge";
import { updateSobrietyWidget } from "../../widgets/updateSobrietyWidget";


interface WeeklyStatsData {
  labels: string[];
  drinks: number[];
  calories: number[];
  totalDrinks: number;
  totalCalories: number;
  totalSpend: number;
}

const EMPTY_WEEKLY: WeeklyStatsData = {
  labels: [],
  drinks: [],
  calories: [],
  totalDrinks: 0,
  totalCalories: 0,
  totalSpend: 0,
};

// 챌린지 시작 전 소비 패턴을 추정하는 기준 기간(일)
const SAVINGS_BASELINE_DAYS = 28;

const formatDateLabel = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);

  if (selected.getTime() === today.getTime()) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function TrackerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData>(EMPTY_WEEKLY);
  const [insights, setInsights] = useState<TrackerInsights>(() =>
    buildTrackerInsights([], new Date())
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [challenge, setChallenge] = useState<SobrietyChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] =
    useState<ChallengeProgress | null>(null);
  const [moneySaved, setMoneySaved] = useState(0);


  const refreshData = useCallback(async () => {
    const insightStart = new Date(selectedDate);
    insightStart.setDate(selectedDate.getDate() - 13);
    insightStart.setHours(0, 0, 0, 0);
    const insightEnd = new Date(selectedDate);
    insightEnd.setHours(23, 59, 59, 999);
    const [dateLogs, stats, insightLogs, storedChallenge] = await Promise.all([
      getDrinkLogsForDate(selectedDate),
      getWeeklyStats(selectedDate),
      getDrinkLogs(insightStart, insightEnd),
      getChallenge(),
    ]);
    setLogs(dateLogs.sort((a, b) => b.timestamp - a.timestamp));
    setWeeklyStats(stats);
    setInsights(buildTrackerInsights(insightLogs, selectedDate));

    setChallenge(storedChallenge);
    if (storedChallenge) {
      const today = new Date();
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      const [sy, sm, sd] = storedChallenge.startDate
        .split("-")
        .map((n) => parseInt(n, 10));
      const challengeStart = new Date(sy, (sm || 1) - 1, sd || 1);
      challengeStart.setHours(0, 0, 0, 0);
      const baselineStart = new Date(challengeStart);
      baselineStart.setDate(baselineStart.getDate() - SAVINGS_BASELINE_DAYS);
      const [challengeLogs, baselineLogs] = await Promise.all([
        getDrinkLogs(challengeStart, endOfToday),
        getDrinkLogs(baselineStart, challengeStart),
      ]);
      const drinkDates = challengeLogs.map((log) =>
        toLocalDateString(new Date(log.timestamp))
      );
      const progress = computeChallengeProgress(storedChallenge, drinkDates, today);
      setChallengeProgress(progress);
      const baselineSpend = baselineLogs.reduce(
        (sum, log) => sum + (log.price ?? 0),
        0
      );
      setMoneySaved(
        estimateMoneySaved(
          baselineSpend,
          SAVINGS_BASELINE_DAYS,
          progress.currentStreakDays
        )
      );
    } else {
      setChallengeProgress(null);
      setMoneySaved(0);
    }

    // 기록/챌린지 변화를 홈 화면 위젯에도 반영 (Android 전용, 그 외 no-op)
    void updateSobrietyWidget();
  }, [selectedDate]);


  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleDeleteLog = useCallback(
    async (id: string) => {
      await deleteDrinkLog(id);
      refreshData();
    },
    [refreshData]
  );

  const handleAddDrink = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleStartChallenge = useCallback(
    async (days: number) => {
      await startChallenge(days);
      refreshData();
    },
    [refreshData]
  );

  const handleStopChallenge = useCallback(async () => {
    await stopChallenge();
    refreshData();
  }, [refreshData]);


  const isToday = (() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  })();

  const dateLabel = formatDateLabel(selectedDate);
  const sectionTitle = isToday
    ? t("tracker.todayLog")
    : `${dateLabel}`;

  const renderLogItem = useCallback(
    ({ item }: { item: DrinkLog }) => (
      <DrinkLogItem log={item} onDelete={handleDeleteLog} />
    ),
    [handleDeleteLog]
  );

  const keyExtractor = useCallback((item: DrinkLog) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />

      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Text className="text-2xl font-bold text-white">
          {t("tracker.title")}
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            className="bg-gray-800 rounded-xl px-3 py-2 mr-2"
            onPress={() => router.push("/session")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("session.homeCta")}
          >
            <Text className="text-base">🍻</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-500 rounded-xl px-4 py-2 flex-row items-center"
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("tracker.addDrink")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-1">
              {t("tracker.addDrink")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <CalendarStrip
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />

        <View className="px-4">
          <TrackerInsightsCard
            insights={insights}
            onOpenGuide={() => router.push("/(tabs)/explore?section=encyclopedia&guide=standard-drink")}
          />

          <SobrietyChallengeCard
            challenge={challenge}
            progress={challengeProgress}
            moneySaved={moneySaved}
            onStart={handleStartChallenge}
            onStop={handleStopChallenge}
          />

          <Text className="text-lg font-semibold text-white mb-3">
            {sectionTitle}
          </Text>

          {logs.length > 0 ? (
            <FlatList
              data={logs}
              renderItem={renderLogItem}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-gray-800 rounded-xl p-8 mb-3 items-center">
              <Text className="text-3xl mb-2">🍷</Text>
              <Text className="text-gray-500 text-base">
                {t("tracker.empty")}
              </Text>
            </View>
          )}

          {weeklyStats.labels.length > 0 && (
            <View className="mt-4">
              <StatsChart
                title={t("tracker.weeklyStats") + " — " + t("tracker.totalDrinks")}
                data={{
                  labels: weeklyStats.labels,
                  values: weeklyStats.drinks,
                }}
              />

              <StatsChart
                title={t("tracker.weeklyStats") + " — " + t("tracker.totalCalories")}
                data={{
                  labels: weeklyStats.labels,
                  values: weeklyStats.calories,
                }}
                color="#f59e0b"
              />

              <Card className="mb-4">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-green-400 text-2xl font-bold">
                      {weeklyStats.totalDrinks}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {t("tracker.drinks")}
                    </Text>
                  </View>
                  <View className="w-px bg-gray-700" />
                  <View className="items-center flex-1">
                    <Text className="text-amber-400 text-2xl font-bold">
                      {weeklyStats.totalCalories}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {t("tracker.kcal")}
                    </Text>
                  </View>
                  <View className="w-px bg-gray-700" />
                  <View className="items-center flex-1">
                    <Text className="text-blue-400 text-2xl font-bold">
                      {weeklyStats.totalDrinks > 0
                        ? (weeklyStats.totalDrinks / 7).toFixed(1)
                        : "0"}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {t("tracker.averageDrinks")}
                    </Text>
                  </View>
                  {weeklyStats.totalSpend > 0 && (
                    <>
                      <View className="w-px bg-gray-700" />
                      <View className="items-center flex-1">
                        <Text className="text-purple-400 text-2xl font-bold">
                          {weeklyStats.totalSpend.toLocaleString()}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          {t("tracker.spend")}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </Card>
              <InlineBannerAd className="mb-4" />
            </View>
          )}
        </View>
      </ScrollView>

      <AddDrinkModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddDrink}
      />
    </SafeAreaView>
  );
}
