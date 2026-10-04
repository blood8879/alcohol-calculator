import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";

import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { computeIntegerAxisScale, formatIntegerAxisLabel } from "../../utils/chartScale";
import { DISPLAY_NUMBER_TEXT_PROPS } from "../../utils/fontScale";

type Metric = "drinks" | "calories";

type WeeklyStatsCardProps = {
  readonly stats: {
    readonly labels: readonly string[];
    readonly drinks: readonly number[];
    readonly calories: readonly number[];
    readonly totalDrinks: number;
    readonly totalCalories: number;
    readonly totalSpend: number;
  };
  // 주간 목표 한도(잔). 설정 시 잔 수 차트에 일 평균 한도선(한도÷7)을 그린다.
  readonly weeklyLimit?: number | null;
};

const METRIC_COLORS: Record<Metric, string> = {
  drinks: "#22c55e",
  calories: "#f59e0b",
};
const LIMIT_LINE_COLOR = "#ef4444";
// getWeeklyStats 라벨은 일~토 순서이므로 인덱스로 현지화한다.
const DAY_KEYS = ["time.sun", "time.mon", "time.tue", "time.wed", "time.thu", "time.fri", "time.sat"];

// GrowPal/FoodNoms Goals 패턴: 세그먼트로 지표 전환 + 막대 1개 + 스탯 타일(지출 有 2×2 / 無 3칸 1행)
export default function WeeklyStatsCard({ stats, weeklyLimit }: WeeklyStatsCardProps) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<Metric>("drinks");

  const values = metric === "drinks" ? stats.drinks : stats.calories;
  const color = METRIC_COLORS[metric];
  const dailyLimit =
    metric === "drinks" && weeklyLimit && weeklyLimit > 0 ? weeklyLimit / 7 : null;

  const barData = stats.labels.map((label, i) => ({
    value: values[i] || 0,
    label: stats.labels.length === 7 ? t(DAY_KEYS[i]) : label,
    frontColor: color,
  }));
  // 잔 수·칼로리 모두 정수 눈금만 쓴다(0.5잔 같은 눈금 금지). 한도선이 축 안에 들어오도록 포함.
  const axis = computeIntegerAxisScale([...values, dailyLimit ?? 0], {
    minMax: metric === "drinks" ? 4 : 100,
  });

  const segments: { key: Metric; label: string }[] = [
    { key: "drinks", label: t("tracker.stats.segmentDrinks") },
    { key: "calories", label: t("tracker.stats.segmentCalories") },
  ];

  const tiles = [
    {
      key: "drinks",
      value: String(stats.totalDrinks),
      label: t("tracker.stats.totalDrinks"),
      color: "text-accentSoft",
    },
    {
      key: "kcal",
      value: Math.round(stats.totalCalories).toLocaleString(),
      label: t("tracker.kcal"),
      color: "text-amber-400",
    },
    {
      key: "average",
      value: (stats.totalDrinks / 7).toFixed(1),
      label: t("tracker.stats.dailyAverage"),
      color: "text-blue-400",
    },
    ...(stats.totalSpend > 0
      ? [
          {
            key: "spend",
            value: Math.round(stats.totalSpend).toLocaleString(),
            label: t("tracker.spend"),
            color: "text-purple-400",
          },
        ]
      : []),
  ];

  return (
    <Card className="mb-4">
      <SectionHeader
        title={t("tracker.weeklyStats")}
        accessory={
          <View className="flex-row bg-background rounded-lg p-0.5 ml-2" accessibilityRole="tablist">
            {segments.map((segment) => {
              const selected = metric === segment.key;
              return (
                <TouchableOpacity
                  key={segment.key}
                  className={`px-3 min-h-[44px] justify-center rounded-md ${
                    selected ? "bg-surfaceDeep" : ""
                  }`}
                  onPress={() => setMetric(segment.key)}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={t("tracker.stats.segmentA11y", { label: segment.label })}
                  accessibilityState={{ selected }}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? "text-textPrimary" : "text-textSecondary"
                    }`}
                  >
                    {segment.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        }
      />

      <BarChart
        data={barData}
        barWidth={20}
        noOfSections={axis.noOfSections}
        maxValue={axis.maxValue}
        stepValue={axis.stepValue}
        formatYLabel={formatIntegerAxisLabel}
        yAxisColor="#374151"
        xAxisColor="#374151"
        yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
        xAxisLabelTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
        backgroundColor="transparent"
        hideRules={false}
        rulesColor="#374151"
        spacing={16}
        isAnimated={false}
        showReferenceLine1={dailyLimit !== null}
        referenceLine1Position={dailyLimit ?? 0}
        referenceLine1Config={{
          color: LIMIT_LINE_COLOR,
          thickness: 1,
          dashWidth: 4,
          dashGap: 4,
        }}
      />

      {dailyLimit !== null && (
        <View className="flex-row items-center mt-2">
          <View className="w-4 h-0.5 bg-danger mr-2" />
          <Text className="text-textSecondary text-xs">
            {t("tracker.stats.dailyLimit")} {dailyLimit.toFixed(1)}
          </Text>
        </View>
      )}

      {/* 지출이 있으면 2×2, 없으면 3칸 1행(빈 칸 없이 균등 폭) */}
      <View className="flex-row flex-wrap justify-between mt-3">
        {tiles.map((tile) => (
          <View
            key={tile.key}
            className="bg-background rounded-lg p-3 mb-2"
            style={{ width: tiles.length === 3 ? "32%" : "48.5%" }}
          >
            <Text
              className={`${tile.color} text-xl font-bold`}
              {...DISPLAY_NUMBER_TEXT_PROPS}
            >
              {tile.value}
            </Text>
            <Text className="text-textSecondary text-xs mt-1">{tile.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
