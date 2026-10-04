import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { TrackerInsights } from "../utils/engagement/trackerInsights";
import Card from "./ui/Card";

type TrackerInsightsCardProps = {
  readonly insights: TrackerInsights;
  readonly onOpenGuide: () => void;
};

export default function TrackerInsightsCard({
  insights,
  onOpenGuide,
}: TrackerInsightsCardProps) {
  const { t } = useTranslation();
  const comparisonText = (() => {
    if (insights.weekComparison.kind === "same") {
      return t("insights.comparisonSame");
    }
    if (insights.weekComparison.kind === "up") {
      return t("insights.comparisonUp", { count: insights.weekComparison.difference });
    }
    return t("insights.comparisonDown", { count: insights.weekComparison.difference });
  })();

  return (
    <Card className="mb-4">
      {/* 큰 글꼴에선 비교 문구가 제목 아래 줄로 내려가도록 wrap — 카드 밖으로 넘치지 않게 한다. */}
      <View className="flex-row flex-wrap items-center justify-between mb-3">
        <Text className="text-white text-lg font-bold flex-shrink mr-2">
          {t("insights.title")}
        </Text>
        <Text className="text-green-400 text-xs font-bold flex-shrink">
          {comparisonText}
        </Text>
      </View>

      <View className="flex-row mb-4">
        <InsightStat
          label={t("insights.statDrinks")}
          value={String(insights.totalDrinks)}
          color="text-green-400"
        />
        <InsightStat
          label={t("insights.statCalories")}
          value={`${insights.totalCalories}`}
          color="text-amber-400"
        />
        <InsightStat
          label={t("insights.statAvgAbv")}
          value={`${insights.averageAbv.toFixed(1)}%`}
          color="text-blue-400"
        />
      </View>

      <Text className="text-gray-300 text-sm leading-5 mb-4">
        {insights.mostCommonDrinkName
          ? t("insights.mostCommon", { name: insights.mostCommonDrinkName })
          : t("insights.empty")}
      </Text>

      <TouchableOpacity
        className="border border-green-600 rounded-xl py-3 px-4"
        onPress={onOpenGuide}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={t("insights.openGuide")}
      >
        <Text className="text-green-400 text-center font-bold">
          {t("insights.openGuide")}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

function InsightStat({
  label,
  value,
  color,
}: {
  readonly label: string;
  readonly value: string;
  readonly color: string;
}) {
  return (
    <View className="flex-1">
      <Text className={`${color} text-xl font-bold`}>
        {value}
      </Text>
      <Text className="text-gray-400 text-xs mt-1">
        {label}
      </Text>
    </View>
  );
}
