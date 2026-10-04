import React, { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import SobrietyChallengeCard from "../SobrietyChallengeCard";
import WeeklyGoalCard from "../WeeklyGoalCard";
import ProgressBar from "../ui/ProgressBar";
import { DISPLAY_NUMBER_TEXT_PROPS } from "../../utils/fontScale";
import type {
  ChallengeProgress,
  SobrietyChallenge,
} from "../../utils/engagement/sobrietyChallenge";
import type { WeeklyProgress } from "../../utils/engagement/weeklyGoal";

type ExpandedTile = "challenge" | "goal" | null;

type StatusTilesProps = {
  readonly challenge: SobrietyChallenge | null;
  readonly challengeProgress: ChallengeProgress | null;
  readonly moneySaved: number;
  readonly onStartChallenge: (days: number) => void;
  readonly onStopChallenge: () => void;
  readonly weeklyProgress: WeeklyProgress | null;
  readonly onSetWeeklyGoal: (limitDrinks: number) => void;
  readonly onClearWeeklyGoal: () => void;
};

// FoodNoms 목표 타일 패턴: 챌린지·주간 목표를 2열 타일로 요약하고, 탭하면 기존 상세 카드를 펼친다.
export default function StatusTiles({
  challenge,
  challengeProgress,
  moneySaved,
  onStartChallenge,
  onStopChallenge,
  weeklyProgress,
  onSetWeeklyGoal,
  onClearWeeklyGoal,
}: StatusTilesProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<ExpandedTile>(null);

  const toggle = useCallback((tile: Exclude<ExpandedTile, null>) => {
    Haptics.selectionAsync().catch(() => {});
    setExpanded((current) => (current === tile ? null : tile));
  }, []);

  // 챌린지 타일
  const streak = challengeProgress?.currentStreakDays ?? 0;
  const targetDays = challengeProgress?.targetDays ?? challenge?.targetDays ?? 0;
  const challengePercent =
    targetDays > 0 ? Math.min(100, Math.round((streak / targetDays) * 100)) : 0;
  const challengeTitle = t("challenge.title");
  const challengeA11yValue = challenge
    ? `D+${streak}, ${t("tracker.tiles.challengeTarget", { count: targetDays })}`
    : t("tracker.tiles.challengeCta");

  // 주간 목표 타일
  const goalTitle = t("weeklyGoal.title");
  const exceeded = weeklyProgress?.exceeded ?? false;
  const goalPercent = weeklyProgress
    ? Math.min(100, Math.round(weeklyProgress.progress * 100))
    : 0;
  const goalStatusText = weeklyProgress
    ? exceeded
      ? t("weeklyGoal.exceeded", { count: weeklyProgress.overBy })
      : t("weeklyGoal.remaining", { count: weeklyProgress.remainingDrinks })
    : t("tracker.tiles.goalCta");
  const goalA11yValue = weeklyProgress
    ? `${weeklyProgress.currentDrinks} / ${weeklyProgress.limitDrinks}, ${goalStatusText}`
    : goalStatusText;

  return (
    // 펼친 상세 카드는 자체 mb-4를 가지므로 바깥 여백은 접힌 상태에서만 준다.
    <View className={expanded ? "" : "mb-4"}>
      <View className="flex-row">
        <TouchableOpacity
          className={`flex-1 bg-surface rounded-card p-4 mr-2 min-h-[44px] border ${
            expanded === "challenge" ? "border-accentDeep" : "border-transparent"
          }`}
          onPress={() => toggle("challenge")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`${challengeTitle}, ${challengeA11yValue}`}
          accessibilityHint={t("tracker.tiles.a11yHint")}
          accessibilityState={{ expanded: expanded === "challenge" }}
        >
          <Text className="text-textSecondary text-xs font-semibold" numberOfLines={1}>
            {challengeTitle}
          </Text>
          {challenge ? (
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
              {t("tracker.tiles.challengeCta")} ›
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 bg-surface rounded-card p-4 ml-2 min-h-[44px] border ${
            expanded === "goal" ? "border-accentDeep" : "border-transparent"
          }`}
          onPress={() => toggle("goal")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`${goalTitle}, ${goalA11yValue}`}
          accessibilityHint={t("tracker.tiles.a11yHint")}
          accessibilityState={{ expanded: expanded === "goal" }}
        >
          <Text className="text-textSecondary text-xs font-semibold" numberOfLines={1}>
            {goalTitle}
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
                {goalStatusText}
              </Text>
              <ProgressBar
                percent={goalPercent}
                colorClassName={exceeded ? "bg-danger" : "bg-accentDeep"}
              />
            </>
          ) : (
            <Text className="text-accentSoft text-base font-bold mt-3">
              {goalStatusText} ›
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {expanded === "challenge" && (
        <View className="mt-3">
          <SobrietyChallengeCard
            challenge={challenge}
            progress={challengeProgress}
            moneySaved={moneySaved}
            onStart={onStartChallenge}
            onStop={onStopChallenge}
          />
        </View>
      )}
      {expanded === "goal" && (
        <View className="mt-3">
          <WeeklyGoalCard
            progress={weeklyProgress}
            onSetGoal={onSetWeeklyGoal}
            onClearGoal={onClearWeeklyGoal}
          />
        </View>
      )}
    </View>
  );
}
