import React, { useState, useCallback } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import type { WeeklyProgress } from "../utils/engagement/weeklyGoal";
import Card from "./ui/Card";

type WeeklyGoalCardProps = {
  progress: WeeklyProgress | null;
  onSetGoal: (limitDrinks: number) => void;
  onClearGoal: () => void;
};

const PRESET_LIMITS = [5, 7, 10, 14];

const WeeklyGoalCard = ({
  progress,
  onSetGoal,
  onClearGoal,
}: WeeklyGoalCardProps) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const openModal = useCallback((initial: number | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setInputValue(initial ? String(initial) : "");
    setModalVisible(true);
  }, []);

  const handleConfirm = useCallback(() => {
    const parsed = parseInt(inputValue, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      onSetGoal(parsed);
      setModalVisible(false);
    }
  }, [inputValue, onSetGoal]);

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-gray-800 rounded-2xl p-5">
          <Text className="text-white text-lg font-bold mb-1">
            {t("weeklyGoal.modalTitle")}
          </Text>
          <Text className="text-gray-400 text-sm mb-4">
            {t("weeklyGoal.modalSubtitle")}
          </Text>

          <View className="flex-row flex-wrap mb-3">
            {PRESET_LIMITS.map((limit) => (
              <TouchableOpacity
                key={limit}
                className="bg-gray-700 rounded-xl px-4 py-2 mr-2 mb-2"
                onPress={() => setInputValue(String(limit))}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t("weeklyGoal.presetA11y", { count: limit })}
              >
                <Text className="text-white font-semibold">
                  {t("weeklyGoal.drinksUnit", { count: limit })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4"
            keyboardType="number-pad"
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={t("weeklyGoal.inputPlaceholder")}
            placeholderTextColor="#6b7280"
            maxLength={3}
            accessibilityLabel={t("weeklyGoal.inputA11y")}
          />

          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 border border-gray-600 rounded-xl py-3 mr-2 items-center"
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text className="text-gray-300 font-semibold">
                {t("weeklyGoal.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-600 rounded-xl py-3 ml-2 items-center"
              onPress={handleConfirm}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("weeklyGoal.confirm")}
            >
              <Text className="text-white font-bold">
                {t("weeklyGoal.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!progress) {
    return (
      <Card className="mb-4">
        <Text className="text-lg font-bold text-white mb-1">
          {t("weeklyGoal.title")}
        </Text>
        <Text className="text-gray-400 text-sm mb-4">
          {t("weeklyGoal.subtitle")}
        </Text>
        <TouchableOpacity
          className="bg-green-600 rounded-xl py-3 items-center"
          onPress={() => openModal(null)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("weeklyGoal.setCta")}
        >
          <Text className="text-white font-semibold">
            {t("weeklyGoal.setCta")}
          </Text>
        </TouchableOpacity>
        {renderModal()}
      </Card>
    );
  }

  const percent = Math.min(100, Math.round(progress.progress * 100));
  const exceeded = progress.exceeded;
  const barColor = exceeded ? "bg-red-500" : "bg-green-600";
  const valueColor = exceeded ? "text-red-400" : "text-green-400";

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-white">
          {t("weeklyGoal.title")}
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => openModal(progress.limitDrinks)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("weeklyGoal.editA11y")}
            className="mr-4"
          >
            <Text className="text-gray-400 text-sm">
              {t("weeklyGoal.edit")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClearGoal}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("weeklyGoal.clearA11y")}
          >
            <Text className="text-gray-400 text-sm">
              {t("weeklyGoal.clear")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="items-center mb-3">
        <Text className={`${valueColor} text-4xl font-bold`}>
          {progress.currentDrinks}
          <Text className="text-gray-500 text-2xl">
            {" "}
            / {progress.limitDrinks}
          </Text>
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {t("weeklyGoal.progressLabel")}
        </Text>
      </View>

      <View className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
        <View
          className={`h-2 ${barColor} rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </View>

      {exceeded ? (
        <Text className="text-red-400 text-center font-semibold mt-2">
          {t("weeklyGoal.exceeded", { count: progress.overBy })}
        </Text>
      ) : (
        <Text className="text-gray-300 text-center text-sm mt-2">
          {t("weeklyGoal.remaining", { count: progress.remainingDrinks })}
        </Text>
      )}

      {renderModal()}
    </Card>
  );
};

export default WeeklyGoalCard;
