import React, { useCallback } from "react";
import { trackEngagement } from "../utils/engagementAnalytics";
import { Share, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import type { SobrietyChallenge } from "../utils/engagement/sobrietyChallenge";
import Card from "./ui/Card";

type SobrietyChallengeCardProps = {
  challenge: SobrietyChallenge | null;
  progress: {
    currentStreakDays: number;
    targetDays: number;
    succeeded: boolean;
  } | null;
  moneySaved?: number;
  onStart: (days: number) => void;
  onStop: () => void;
};

const DAY_OPTIONS = [7, 14, 30];

const SobrietyChallengeCard = ({
  challenge,
  progress,
  moneySaved = 0,
  onStart,
  onStop,
}: SobrietyChallengeCardProps) => {
  const { t } = useTranslation();

  const currentStreakDays = progress?.currentStreakDays ?? 0;
  const targetDays = progress?.targetDays ?? challenge?.targetDays ?? 0;
  const succeeded = progress?.succeeded ?? false;

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const savedLine =
      moneySaved > 0
        ? `\n${t("challenge.moneySaved", { amount: moneySaved.toLocaleString() })}`
        : "";
    const message = succeeded
      ? t("challenge.shareSucceeded", { target: targetDays, savedLine })
      : t("challenge.shareInProgress", {
          streak: currentStreakDays,
          target: targetDays,
          savedLine,
        });
    try {
      const result = await Share.share({ message });
      trackEngagement("challenge_share_outcome", { outcome: result.action === Share.sharedAction ? "shared" : "dismissed" });
    } catch {
    }
  }, [succeeded, currentStreakDays, targetDays, moneySaved, t]);

  if (!challenge) {
    return (
      <Card className="mb-4">
        <Text className="text-lg font-bold text-white mb-1">
          {t("challenge.title")}
        </Text>
        <Text className="text-gray-400 text-sm mb-4">
          {t("challenge.subtitle")}
        </Text>
        <View className="flex-row justify-between">
          {DAY_OPTIONS.map((days) => (
            <TouchableOpacity
              key={days}
              className="flex-1 bg-accentButton rounded-xl py-3 mx-1 items-center"
              onPress={() => onStart(days)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("challenge.startA11y", { count: days })}
            >
              <Text className="text-white font-semibold">
                {t("challenge.dayOption", { count: days })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  }

  const percent = targetDays > 0
    ? Math.min(100, Math.round((currentStreakDays / targetDays) * 100))
    : 0;

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-white">
          {t("challenge.title")}
        </Text>
        <TouchableOpacity
          onPress={onStop}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("challenge.stopA11y")}
        >
          <Text className="text-gray-400 text-sm">
            {t("challenge.stop")}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-3">
        <Text className="text-green-400 text-4xl font-bold">
          {currentStreakDays}
          <Text className="text-textMuted text-2xl"> / {targetDays}</Text>
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {t("challenge.streakLabel")}
        </Text>
      </View>

      <View className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
        <View
          className="h-2 bg-green-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </View>

      {moneySaved > 0 && (
        <View className="flex-row items-center justify-center mt-2">
          <Text className="text-gray-400 text-sm">
            {t("challenge.moneySaved", { amount: moneySaved.toLocaleString() })}
          </Text>
        </View>
      )}

      {succeeded && (
        <Text className="text-green-400 text-center font-semibold mt-2">
          {t("challenge.goalReached")}
        </Text>
      )}

      <TouchableOpacity
        className="border border-green-600 rounded-xl py-3 px-4 mt-3"
        onPress={handleShare}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={t("challenge.shareA11y")}
      >
        <Text className="text-green-400 text-center font-bold">
          {t("challenge.share")}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};

export default SobrietyChallengeCard;
