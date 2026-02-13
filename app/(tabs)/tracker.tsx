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
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import CalendarStrip from "../../components/CalendarStrip";
import DrinkLogItem from "../../components/DrinkLogItem";
import AddDrinkModal from "../../components/AddDrinkModal";
import StatsChart from "../../components/StatsChart";
import {
  DrinkLog,
  getDrinkLogsForDate,
  deleteDrinkLog,
  getWeeklyStats,
} from "../../utils/trackerStorage";

interface WeeklyStatsData {
  labels: string[];
  drinks: number[];
  calories: number[];
  totalDrinks: number;
  totalCalories: number;
}

const EMPTY_WEEKLY: WeeklyStatsData = {
  labels: [],
  drinks: [],
  calories: [],
  totalDrinks: 0,
  totalCalories: 0,
};

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
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData>(EMPTY_WEEKLY);
  const [isModalVisible, setModalVisible] = useState(false);

  const refreshData = useCallback(async () => {
    const [dateLogs, stats] = await Promise.all([
      getDrinkLogsForDate(selectedDate),
      getWeeklyStats(selectedDate),
    ]);
    setLogs(dateLogs.sort((a, b) => b.timestamp - a.timestamp));
    setWeeklyStats(stats);
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
        <TouchableOpacity
          className="bg-green-500 rounded-xl px-4 py-2 flex-row items-center"
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-1">
            {t("tracker.addDrink")}
          </Text>
        </TouchableOpacity>
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

              <View className="bg-gray-800 rounded-xl p-4 mb-4">
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
                </View>
              </View>
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
