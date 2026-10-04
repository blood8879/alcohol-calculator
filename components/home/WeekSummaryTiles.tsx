import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import ProgressBar from "../ui/ProgressBar";
import { DISPLAY_NUMBER_TEXT_PROPS } from "../../utils/fontScale";
import type { WeekSummary } from "../../utils/engagement/weekSummary";

type WeekSummaryTilesProps = {
  readonly summary: WeekSummary;
  readonly onPress: () => void;
};

// 홈 "이번 주" 2열 요약 타일. 트래커 StatusTiles와 같은 시각 언어를 쓰되 탭하면 트래커로 이동한다.
export default function WeekSummaryTiles({
  summary,
  onPress,
}: WeekSummaryTilesProps) {
  const { t } = useTranslation();
  const { weekDrinks, weeklyProgress, challengeProgress } = summary;

  // 이번 주 음주 타일
  const drinksLabel = t("home.week.drinksLabel");
  const exceeded = weeklyProgress?.exceeded ?? false;
  const goalPercent = weeklyProgress
    ? Math.min(100, Math.round(weeklyProgress.progress * 100))
    : 0;
  const drinksStatusText = weeklyProgress
    ? exceeded
      ? t("weeklyGoal.exceeded", { count: weeklyProgress.overBy })
      : t("weeklyGoal.remaining", { count: weeklyProgress.remainingDrinks })
    : t("home.week.noGoal");
  const drinksValueText = weeklyProgress
    ? `${weeklyProgress.currentDrinks} / ${weeklyProgress.limitDrinks}`
    : t("home.week.drinkCount", { count: weekDrinks });

  // 절주 챌린지 타일
  const challengeTitle = t("challenge.title");
  const streak = challengeProgress?.currentStreakDays ?? 0;
  const targetDays = challengeProgress?.targetDays ?? 0;
  const challengePercent =
    targetDays > 0 ? Math.min(100, Math.round((streak / targetDays) * 100)) : 0;
  const showChallenge = challengeProgress !== null;
  const challengeA11yValue = showChallenge
    ? `D+${streak}, ${t("tracker.tiles.challengeTarget", { count: targetDays })}`
    : t("home.week.challengeCta");

  return (
    <View className="flex-row mb-6">
      <TouchableOpacity
        className="flex-1 bg-surface rounded-card p-4 mr-2 min-h-[44px]"
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${drinksLabel}, ${drinksValueText}, ${drinksStatusText}`}
        accessibilityHint={t("home.week.a11yHint")}
      >
        <Text className="text-textSecondary text-xs font-semibold" numberOfLines={1}>
          {drinksLabel}
        </Text>
        {weeklyProgress ? (
          <>
            <Text
              className={`${exceeded ? "text-red-400" : "text-accentSoft"} text-3xl font-bold mt-1`}
              {...DISPLAY_NUMBER_TEXT_PROPS}
            >
              {weeklyProgress.currentDrinks}
              <Text className="text-textMuted text-lg">
                {" "}
                / {weeklyProgress.limitDrinks}
              </Text>
            </Text>
            <Text
              className={`${exceeded ? "text-red-400 font-semibold" : "text-textMuted"} text-xs mt-0.5`}
              numberOfLines={2}
            >
              {drinksStatusText}
            </Text>
            <ProgressBar
              percent={goalPercent}
              colorClassName={exceeded ? "bg-danger" : "bg-accentDeep"}
            />
          </>
        ) : (
          <>
            <Text className="text-textPrimary text-3xl font-bold mt-1" {...DISPLAY_NUMBER_TEXT_PROPS}>
              {drinksValueText}
            </Text>
            <Text className="text-textMuted text-xs mt-0.5" numberOfLines={1}>
              {drinksStatusText}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 bg-surface rounded-card p-4 ml-2 min-h-[44px]"
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${challengeTitle}, ${challengeA11yValue}`}
        accessibilityHint={t("home.week.a11yHint")}
      >
        <Text className="text-textSecondary text-xs font-semibold" numberOfLines={1}>
          {challengeTitle}
        </Text>
        {showChallenge ? (
          <>
            <Text className="text-accentSoft text-3xl font-bold mt-1" {...DISPLAY_NUMBER_TEXT_PROPS}>
              D+{streak}
            </Text>
            <Text className="text-textMuted text-xs mt-0.5" numberOfLines={1}>
              {t("tracker.tiles.challengeTarget", { count: targetDays })}
            </Text>
            <ProgressBar percent={challengePercent} colorClassName="bg-accentDeep" />
          </>
        ) : (
          <Text className="text-accentSoft text-base font-bold mt-3">
            {t("home.week.challengeCta")} ›
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
