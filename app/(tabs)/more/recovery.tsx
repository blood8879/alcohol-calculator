import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-gifted-charts";
import InlineBannerAd from "../../../components/InlineBannerAd";
import Card from "../../../components/ui/Card";
import SectionHeader from "../../../components/ui/SectionHeader";
import { LEVEL_STYLES } from "../../../components/session/sessionUi";
import {
  BAC_REFERENCE_LINES,
  computeBacAxisScale,
  computeChartLayout,
} from "../../../components/recovery/recoveryChart";
import { bacLevelOf } from "../../../utils/engagement/drinkingSession";
import { STANDARD_DRINK_GRAMS } from "../../../utils/alcoholConstants";
import { validateBodyWeight } from "../../../utils/bodyWeight";
import { DISPLAY_NUMBER_TEXT_PROPS } from "../../../utils/fontScale";

type Gender = "male" | "female";

interface ChartPoint {
  value: number;
  label?: string;
}

interface BacResult {
  data: ChartPoint[];
  peakBac: number;
  soberHours: number;
}

function computeBac(
  weight: number,
  gender: Gender,
  drinks: number
): BacResult | null {
  // 체중은 공용 검증(30~250kg)을 통과해야 계산한다 — 7070kg 같은 오타가 "안전"으로 보이지 않게.
  if (
    !validateBodyWeight(weight).ok ||
    !Number.isFinite(drinks) ||
    drinks <= 0
  ) {
    return null;
  }

  const r = gender === "male" ? 0.68 : 0.55;
  const bodyWeightGrams = weight * 1000;
  const peakBac = ((drinks * STANDARD_DRINK_GRAMS) / (bodyWeightGrams * r)) * 100;
  const soberHours = peakBac / 0.015;
  const maxHour = Math.ceil(soberHours);

  const data: ChartPoint[] = [];
  for (let t = 0; t <= maxHour; t += 1) {
    const bac = Math.max(0, peakBac - 0.015 * t);
    data.push({
      value: Math.round(bac * 10000) / 10000,
      label: t % 2 === 0 ? String(t) : undefined,
    });
  }

  return {
    data,
    peakBac: Math.round(peakBac * 10000) / 10000,
    soberHours,
  };
}

// 차트 축·라벨 색(시맨틱 토큰 hex — tailwind.config.js와 동일)
const AXIS_TEXT_COLOR = "#9ca3af"; // textSecondary
const AXIS_LINE_COLOR = "#374151"; // surfaceDeep
const LINE_COLOR = "#22c55e"; // accent
const X_LABEL_WIDTH = 28;

export default function RecoveryScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [weightInput, setWeightInput] = useState("70");
  const [gender, setGender] = useState<Gender>("male");
  const [drinksInput, setDrinksInput] = useState("3");
  const [chartInnerWidth, setChartInnerWidth] = useState(0);

  const weightCheck = useMemo(() => validateBodyWeight(weightInput), [weightInput]);
  const weightOutOfRange = !weightCheck.ok && weightCheck.reason === "out_of_range";

  const result = useMemo<BacResult | null>(() => {
    if (!weightCheck.ok) return null;
    const drinks = Number(drinksInput);
    return computeBac(weightCheck.weightKg, gender, drinks);
  }, [weightCheck, gender, drinksInput]);

  const onChartLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    setChartInnerWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  }, []);

  const axis = useMemo(
    () => computeBacAxisScale(result?.peakBac ?? 0),
    [result?.peakBac]
  );

  const layout = useMemo(
    () => computeChartLayout(chartInnerWidth, result?.data.length ?? 0),
    [chartInnerWidth, result?.data.length]
  );

  // x축 라벨(경과 시간 h): 간격에 맞춰 labelEvery 시간마다만 표시. 라벨 폭을 spacing보다 넓게 잡아 잘림 방지.
  const chartData = useMemo(() => {
    if (!result) return [];
    return result.data.map((point, hour) => {
      const showLabel = hour % layout.labelEvery === 0;
      return {
        value: point.value,
        labelComponent: showLabel
          ? () => (
              <Text
                style={{
                  width: X_LABEL_WIDTH,
                  marginLeft: (layout.spacing - X_LABEL_WIDTH) / 2,
                  textAlign: "center",
                  color: AXIS_TEXT_COLOR,
                  fontSize: 11,
                }}
                numberOfLines={1}
              >
                {hour}
              </Text>
            )
          : undefined,
      };
    });
  }, [result, layout.labelEvery, layout.spacing]);

  const peakLevel = result ? bacLevelOf(result.peakBac) : "safe";
  const peakStyle = LEVEL_STYLES[peakLevel];

  const recoveryTips: string[] = [
    t("recovery.tip1"),
    t("recovery.tip2"),
    t("recovery.tip3"),
    t("recovery.tip4"),
    t("recovery.tip5"),
  ];

  const referenceLineProps = BAC_REFERENCE_LINES.reduce<Record<string, unknown>>(
    (acc, line, index) => {
      const n = index + 1;
      acc[`showReferenceLine${n}`] = true;
      acc[`referenceLine${n}Position`] = line.position;
      acc[`referenceLine${n}Config`] = {
        color: line.color,
        thickness: 1,
        dashWidth: 4,
        dashGap: 4,
        labelText: line.label,
        labelTextStyle: { color: line.color, fontSize: 10, marginLeft: 2 },
      };
      return acc;
    },
    {}
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 min-h-[44px] min-w-[44px] justify-center"
          accessibilityRole="button"
          accessibilityLabel={t("recovery.back")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-textPrimary">
          {t("recovery.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="mb-4">
          <Text className="text-textPrimary font-semibold text-base mb-3">
            {t("recovery.yourDetails")}
          </Text>

          <Text className="text-textSecondary text-sm mb-1">
            {t("recovery.weight")}
          </Text>
          <TextInput
            className="bg-background text-textPrimary rounded-lg px-3 py-2 mb-4"
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
            selectTextOnFocus
            placeholder="70"
            placeholderTextColor="#8b93a1"
            accessibilityLabel={t("recovery.weight")}
          />

          <Text className="text-textSecondary text-sm mb-1">
            {t("recovery.gender")}
          </Text>
          <View className="flex-row mb-4" accessibilityRole="radiogroup">
            {(["male", "female"] as const).map((option, index) => {
              const selected = gender === option;
              return (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 rounded-lg min-h-[44px] justify-center items-center ${
                    index === 0 ? "mr-2" : ""
                  } ${selected ? "bg-accentButton" : "bg-background"}`}
                  onPress={() => setGender(option)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityLabel={t(`recovery.${option}`)}
                  accessibilityState={{ selected }}
                >
                  <Text
                    className={
                      selected
                        ? "text-textPrimary font-semibold"
                        : "text-textSecondary"
                    }
                  >
                    {t(`recovery.${option}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-textSecondary text-sm mb-1">
            {t("recovery.standardDrinks")}
          </Text>
          <TextInput
            className="bg-background text-textPrimary rounded-lg px-3 py-2"
            keyboardType="numeric"
            value={drinksInput}
            onChangeText={setDrinksInput}
            selectTextOnFocus
            placeholder="3"
            placeholderTextColor="#8b93a1"
            accessibilityLabel={t("recovery.standardDrinks")}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-textPrimary font-semibold text-base mb-3">
            {t("recovery.bacTimeline")}
          </Text>
          {result ? (
            <>
              {/* 주인공 숫자: 예상 최고 BAC(4자리) — 세션과 같은 레벨 4색 + 레벨 문구 */}
              <View
                className="items-center mb-4"
                accessible
                accessibilityLabel={`${t("recovery.peakBacEstimated")} ${result.peakBac.toFixed(
                  4
                )}%, ${t(peakStyle.labelKey)}`}
              >
                <Text className="text-textSecondary text-xs mb-1">
                  {t("recovery.peakBacEstimated")}
                </Text>
                <Text
                  className={`${peakStyle.text} text-5xl font-bold`}
                  {...DISPLAY_NUMBER_TEXT_PROPS}
                >
                  {result.peakBac.toFixed(4)}%
                </Text>
                <Text className={`${peakStyle.text} text-sm font-semibold mt-2`}>
                  {t(peakStyle.labelKey)}
                </Text>
              </View>

              <View className="items-center mb-4">
                <Text className="text-textPrimary text-lg font-bold">
                  {result.soberHours.toFixed(1)}
                  {t("recovery.hoursUnit")}
                </Text>
                <Text className="text-textSecondary text-xs mt-1">
                  {t("recovery.timeToSober")}
                </Text>
              </View>

              <View
                onLayout={onChartLayout}
                className="w-full overflow-hidden"
                accessible
                accessibilityLabel={t("recovery.chartA11y", {
                  peak: result.peakBac.toFixed(4),
                  hours: result.soberHours.toFixed(1),
                })}
              >
                {chartInnerWidth > 0 ? (
                  <LineChart
                    data={chartData}
                    width={layout.width}
                    spacing={layout.spacing}
                    initialSpacing={layout.initialSpacing}
                    endSpacing={layout.endSpacing}
                    disableScroll
                    height={180}
                    maxValue={axis.maxValue}
                    noOfSections={axis.noOfSections}
                    stepValue={axis.stepValue}
                    yAxisLabelTexts={[...axis.labels]}
                    yAxisLabelWidth={layout.yAxisLabelWidth}
                    color={LINE_COLOR}
                    thickness={2}
                    hideDataPoints={result.data.length > 16}
                    dataPointsColor={LINE_COLOR}
                    dataPointsRadius={3}
                    yAxisTextStyle={{ color: AXIS_TEXT_COLOR, fontSize: 11 }}
                    xAxisColor={AXIS_LINE_COLOR}
                    yAxisColor={AXIS_LINE_COLOR}
                    rulesColor={AXIS_LINE_COLOR}
                    {...referenceLineProps}
                  />
                ) : (
                  <View style={{ height: 220 }} />
                )}
              </View>
              <Text className="text-textSecondary text-xs text-center mt-1">
                {t("recovery.chartXAxis")}
              </Text>

              {/* 기준선 범례: 색 + 경계값 + 레벨 문구(색만으로 구분하지 않음) */}
              <View className="mt-3">
                {BAC_REFERENCE_LINES.map((line) => (
                  <View key={line.level} className="flex-row items-center mt-1">
                    <View
                      className="mr-2"
                      style={{
                        width: 16,
                        borderTopWidth: 2,
                        borderStyle: "dashed",
                        borderColor: line.color,
                      }}
                    />
                    <Text className="text-textSecondary text-xs">
                      ≥ {line.label}%{"  "}
                    </Text>
                    <Text className={`${LEVEL_STYLES[line.level].text} text-xs flex-1`}>
                      {t(LEVEL_STYLES[line.level].labelKey)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text
              className="text-textSecondary text-sm"
              accessibilityLiveRegion="polite"
            >
              {weightOutOfRange ? t("errors.weightRange") : t("recovery.emptyState")}
            </Text>
          )}

          {/* 면책 문구(§2.3-3): 차트 바로 아래 상시 노출 */}
          <View className="flex-row items-start mt-4 pt-3 border-t border-surfaceDeep">
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={AXIS_TEXT_COLOR}
              style={{ marginTop: 1, marginRight: 6 }}
            />
            <Text className="text-textSecondary text-sm flex-1 leading-5">
              {t("recovery.disclaimer")}
            </Text>
          </View>
        </Card>

        <InlineBannerAd />

        <View className="mb-4">
          <SectionHeader title={t("recovery.tipsTitle")} />
          {recoveryTips.map((tip, index) => (
            <Card key={index} className="mb-3 flex-row">
              <Text className="text-accentSoft font-bold mr-3">{index + 1}</Text>
              <Text className="text-textPrimary text-sm flex-1 leading-5">
                {tip}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
