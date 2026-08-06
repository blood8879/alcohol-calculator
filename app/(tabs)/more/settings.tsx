import React, { useEffect, useState } from "react";
import {
  Alert,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Modal from "react-native-modal";
import Constants from "expo-constants";
import LanguageSelector from "../../../components/LanguageSelector";
import Card from "../../../components/ui/Card";
import {
  requestPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleWeeklySummary,
  cancelWeeklySummary,
  cancelDriveSafeReminder,
  getNotificationPrefs,
  setNotificationPrefs,
} from "../../../utils/notificationUtils";
import { createBackup, restoreBackup } from "../../../utils/backupUtils";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [dailyReminder, setDailyReminder] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [driveSafe, setDriveSafe] = useState(true);
  const [importVisible, setImportVisible] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    getNotificationPrefs().then((prefs) => {
      setDailyReminder(prefs.dailyEnabled);
      setWeeklySummary(prefs.weeklyEnabled);
      setDriveSafe(prefs.driveSafeEnabled);
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
    await setNotificationPrefs({
      dailyEnabled: enabled,
      weeklyEnabled: weeklySummary,
      driveSafeEnabled: driveSafe,
    });
  };

  const handleDriveSafeToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) return;
    } else {
      await cancelDriveSafeReminder();
    }
    setDriveSafe(enabled);
    await setNotificationPrefs({
      dailyEnabled: dailyReminder,
      weeklyEnabled: weeklySummary,
      driveSafeEnabled: enabled,
    });
  };

  const handleExport = async () => {
    const backup = await createBackup();
    try {
      await Share.share({ message: backup });
    } catch {
    }
  };

  const handleImport = () => {
    Alert.alert(
      t("settings.importConfirmTitle"),
      t("settings.importConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.restore"),
          style: "destructive",
          onPress: async () => {
            const ok = await restoreBackup(importText);
            if (ok) {
              setImportVisible(false);
              setImportText("");
              Alert.alert("✅", t("settings.importSuccess"));
            } else {
              Alert.alert(t("common.error"), t("settings.importError"));
            }
          },
        },
      ]
    );
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
    await setNotificationPrefs({
      dailyEnabled: dailyReminder,
      weeklyEnabled: enabled,
      driveSafeEnabled: driveSafe,
    });
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
          <Card className="mb-3">
            <Text className="text-white text-base font-semibold mb-1">
              {t("settings.trackingHabitTitle")}
            </Text>
            <Text className="text-gray-400 text-sm leading-5">
              {t("settings.trackingHabitDescription")}
            </Text>
          </Card>
          <Card>
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
            <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
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
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 mr-3">
                <Text className="text-white text-base">
                  {t("settings.driveSafe")}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5 leading-4">
                  {t("settings.driveSafeDescription")}
                </Text>
              </View>
              <Switch
                value={driveSafe}
                onValueChange={handleDriveSafeToggle}
                trackColor={{ false: "#374151", true: "#22c55e" }}
                thumbColor="#ffffff"
              />
            </View>
          </Card>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            {t("settings.dataSection")}
          </Text>
          <Card>
            <Text className="text-gray-400 text-sm leading-5 mb-3">
              {t("settings.dataDescription")}
            </Text>
            <TouchableOpacity
              className="bg-green-600 rounded-xl py-3 items-center mb-2"
              onPress={handleExport}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t("settings.exportData")}
            >
              <Text className="text-white font-bold">
                📤 {t("settings.exportData")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-gray-600 rounded-xl py-3 items-center"
              onPress={() => setImportVisible(true)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t("settings.importData")}
            >
              <Text className="text-gray-300 font-bold">
                📥 {t("settings.importData")}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            {t("settings.about")}
          </Text>
          <Card>
            <Text className="text-white text-lg font-bold">
              {t("common.appTitle")}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              v{Constants.expoConfig?.version ?? "—"}
            </Text>
            <Text className="text-gray-400 text-sm mt-3">
              {t("settings.appInfo")}
            </Text>
          </Card>
        </View>
      </ScrollView>

      <Modal
        isVisible={importVisible}
        onBackdropPress={() => setImportVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        avoidKeyboard={true}
      >
        <View className="bg-gray-900 rounded-t-3xl p-4">
          <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-4" />
          <Text className="text-white text-lg font-bold mb-2">
            {t("settings.importData")}
          </Text>
          <Text className="text-gray-400 text-sm mb-3">
            {t("settings.importDescription")}
          </Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 text-xs h-40"
            value={importText}
            onChangeText={setImportText}
            placeholder='{"version":1,...}'
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel={t("settings.importData")}
          />
          <TouchableOpacity
            className={`rounded-xl py-3 items-center mb-3 ${
              importText.trim() ? "bg-green-600" : "bg-gray-700"
            }`}
            onPress={handleImport}
            disabled={!importText.trim()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t("settings.restore")}
          >
            <Text
              className={`font-bold ${
                importText.trim() ? "text-white" : "text-gray-500"
              }`}
            >
              {t("settings.restore")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
