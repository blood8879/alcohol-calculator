import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../../components/LanguageSelector";
import {
  requestPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleWeeklySummary,
  cancelWeeklySummary,
  getNotificationPrefs,
  setNotificationPrefs,
} from "../../../utils/notificationUtils";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [dailyReminder, setDailyReminder] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);

  useEffect(() => {
    getNotificationPrefs().then((prefs) => {
      setDailyReminder(prefs.dailyEnabled);
      setWeeklySummary(prefs.weeklyEnabled);
    });
  }, []);

  const handleDailyReminderToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) return;
      await scheduleDailyReminder(21, 0);
    } else {
      await cancelDailyReminder();
    }
    setDailyReminder(enabled);
    await setNotificationPrefs({ dailyEnabled: enabled, weeklyEnabled: weeklySummary });
  };

  const handleWeeklySummaryToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) return;
      await scheduleWeeklySummary();
    } else {
      await cancelWeeklySummary();
    }
    setWeeklySummary(enabled);
    await setNotificationPrefs({ dailyEnabled: dailyReminder, weeklyEnabled: enabled });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t("settings.title")}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <LanguageSelector />

        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            {t("settings.notifications")}
          </Text>
          <View className="bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
              <Text className="text-white text-base">
                {t("settings.dailyReminder")}
              </Text>
              <Switch
                value={dailyReminder}
                onValueChange={handleDailyReminderToggle}
                trackColor={{ false: "#374151", true: "#22c55e" }}
                thumbColor="#ffffff"
              />
            </View>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-white text-base">
                {t("settings.weeklyStats")}
              </Text>
              <Switch
                value={weeklySummary}
                onValueChange={handleWeeklySummaryToggle}
                trackColor={{ false: "#374151", true: "#22c55e" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            {t("settings.about")}
          </Text>
          <View className="bg-gray-800 rounded-xl p-4">
            <Text className="text-white text-lg font-bold">
              {t("common.appTitle")}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">v1.0.0</Text>
            <Text className="text-gray-400 text-sm mt-3">
              {t("settings.appInfo")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
