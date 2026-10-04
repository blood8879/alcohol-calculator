import React, { useEffect, useState } from "react";
import {
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
import { useDialog, useDialogController } from "../../../components/ui/DialogProvider";
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
import { logNotificationToggled } from "../../../utils/analytics";
import { trackEngagement } from "../../../utils/engagementAnalytics";
import { useConsentState } from "../../../hooks/useConsentState";
import { showPrivacyOptionsAndUpdateCollection } from "../../../utils/consent";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useDialog();
  // 복원 확인·복원 실패 토스트는 가져오기 바텀시트(모달) 위에 떠야 하므로 시트 안에 로컬 호스트를 둔다.
  const importDialog = useDialogController();
  const consent = useConsentState();
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
      trackEngagement("settings_permission_requested", { preference: "daily" });
      const granted = await requestPermissions();
      trackEngagement("settings_permission_outcome", { preference: "daily", outcome: granted ? "granted" : "denied" });
      if (!granted) return;
      await scheduleDailyReminder(21, 0);
    } else {
      await cancelDailyReminder();
    }
    setDailyReminder(enabled);
    const saved = await setNotificationPrefs({
      dailyEnabled: enabled,
      weeklyEnabled: weeklySummary,
      driveSafeEnabled: driveSafe,
    });
    if (saved) {
      logNotificationToggled("daily", enabled);
      trackEngagement("settings_preference_saved", { preference: "daily", enabled });
    }
  };

  const handleDriveSafeToggle = async (enabled: boolean) => {
    if (enabled) {
      trackEngagement("settings_permission_requested", { preference: "drive_safe" });
      const granted = await requestPermissions();
      trackEngagement("settings_permission_outcome", { preference: "drive_safe", outcome: granted ? "granted" : "denied" });
      if (!granted) return;
    } else {
      await cancelDriveSafeReminder();
    }
    setDriveSafe(enabled);
    const saved = await setNotificationPrefs({
      dailyEnabled: dailyReminder,
      weeklyEnabled: weeklySummary,
      driveSafeEnabled: enabled,
    });
    if (saved) {
      logNotificationToggled("drive_safe", enabled);
      trackEngagement("settings_preference_saved", { preference: "drive_safe", enabled });
    }
  };

  const handleExport = async () => {
    try {
      const backup = await createBackup();
      const result = await Share.share({ message: backup });
      trackEngagement("backup_export_outcome", { outcome: result.action === Share.sharedAction ? "shared" : "dismissed" });
    } catch {
      trackEngagement("backup_export_outcome", { outcome: "failed" });
    }
  };

  const handleImport = async () => {
    const confirmed = await importDialog.confirm({
      title: t("settings.importConfirmTitle"),
      message: t("settings.importConfirmMessage"),
      cancelLabel: t("common.cancel"),
      confirmLabel: t("settings.restore"),
      destructive: true,
    });
    if (!confirmed) return;
    const ok = await restoreBackup(importText);
    trackEngagement("backup_restore_outcome", { outcome: ok ? "succeeded" : "failed" });
    if (ok) {
      setImportVisible(false);
      setImportText("");
      // 시트가 닫히므로 성공 토스트는 루트(화면) 토스트로 띄운다.
      toast({ message: t("settings.importSuccess"), variant: "success" });
    } else {
      importDialog.toast({ message: t("settings.importError"), variant: "error" });
    }
  };

  const handleWeeklySummaryToggle = async (enabled: boolean) => {
    if (enabled) {
      trackEngagement("settings_permission_requested", { preference: "weekly" });
      const granted = await requestPermissions();
      trackEngagement("settings_permission_outcome", { preference: "weekly", outcome: granted ? "granted" : "denied" });
      if (!granted) return;
      await scheduleWeeklySummary();
    } else {
      await cancelWeeklySummary();
    }
    setWeeklySummary(enabled);
    const saved = await setNotificationPrefs({
      dailyEnabled: dailyReminder,
      weeklyEnabled: enabled,
      driveSafeEnabled: driveSafe,
    });
    if (saved) {
      logNotificationToggled("weekly", enabled);
      trackEngagement("settings_preference_saved", { preference: "weekly", enabled });
    }
  };

  const handlePrivacyChoices = async () => {
    try {
      await showPrivacyOptionsAndUpdateCollection();
    } catch {
      toast({ message: t("settings.privacyChoicesError"), variant: "error" });
    }
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
              className="bg-accentButton rounded-xl py-3 items-center mb-2"
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

        {consent.privacyOptionsRequired && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-3">
              {t("settings.privacy")}
            </Text>
            <Card>
              <TouchableOpacity
                className="min-h-[48px] flex-row items-center justify-between"
                onPress={handlePrivacyChoices}
                disabled={consent.updating}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t("settings.privacyChoices")}
                accessibilityState={{ disabled: consent.updating }}
              >
                <Text className={`text-base flex-1 mr-3 ${consent.updating ? "text-gray-400" : "text-white"}`}>
                  {t("settings.privacyChoices")}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </Card>
          </View>
        )}

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
        onBackButtonPress={() => setImportVisible(false)}
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
            placeholderTextColor="#8b93a1"
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel={t("settings.importData")}
          />
          <TouchableOpacity
            className={`rounded-xl py-3 items-center mb-3 ${
              importText.trim() ? "bg-accentButton" : "bg-gray-700"
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
        {importDialog.host}
      </Modal>
    </SafeAreaView>
  );
}
