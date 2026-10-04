import React, { useCallback, useState, useMemo, useRef } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import Modal from "react-native-modal";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import SessionStatusCard from "../../components/home/SessionStatusCard";
import WeekSummaryTiles from "../../components/home/WeekSummaryTiles";
import CalculationCard, { CalculationField } from "../../components/CalculationCard";
import {
  calculateDilution,
  calculateAlcoholContent,
  calculateTemperatureCorrection,
  calculateFreezingPoint,
  calculateProof,
  calculateBlending,
  calculateCalorie,
} from "../../utils/calculatorUtils";
import { calculateBAC } from "../../utils/bacCalculator";
import { drinkPresets } from "../../data/drinkPresets";
import { getDailyCard, DailyContentCard } from "../../data/dailyContent";
import { getDailyTip } from "../../data/dailyTips";
import { DrinkPreset } from "../../data/types";
import { ContentRef, getFavorites, getRecentContent } from "../../utils/contentStorage";
import { getActiveSession } from "../../utils/engagement/drinkingSessionStorage";
import type { DrinkingSession } from "../../utils/engagement/drinkingSession";
import { WeekSummary, loadWeekSummary } from "../../utils/engagement/weekSummary";
import { pickLocalizedText } from "../../utils/localizedText";
import { logCalculatorOpened, logCalculatorClosed } from "../../utils/calculatorAnalytics";
import type { CalculatorCloseReason } from "../../utils/calculatorAnalytics";
import { logHomeContentClick, logHomeCtaClick } from "../../utils/contentAnalytics";

type CalculatorKey =
  | "dilution"
  | "blending"
  | "calorie"
  | "temperature"
  | "alcoholContent"
  | "freezingPoint"
  | "proof"
  | "bac"
  | "unitConverter";

type CalculatorConfig = {
  navLabel: string;
  navDescription: string;
  title: string;
  description: string;
  fields: CalculationField[];
  calculateResult: (values: number[]) => { label: string; value: string }[];
  iconColor: string;
  icon: string;
  presets?: DrinkPreset[];
  presetFieldMapping?: { volumeIndex: number; abvIndex: number };
};

type ContentShortcutProps = {
  item: ContentRef;
  badgeLabel: string;
  onPress: () => void;
};

// Notion "Jump back in" 패턴: 이모지 상단 + 뱃지 + 제목 2줄의 작은 카드.
function ContentShortcut({ item, badgeLabel, onPress }: ContentShortcutProps) {
  return (
    <Card
      className="mr-3 w-36 min-h-[128px]"
      onPress={onPress}
      accessibilityLabel={`${badgeLabel}, ${item.label}`}
    >
      <Text className="text-3xl mb-2">{item.emoji}</Text>
      <View className="self-start bg-surfaceDeep rounded-full px-2 py-0.5 mb-2">
        <Text className="text-textSecondary text-xs font-semibold" numberOfLines={1}>
          {badgeLabel}
        </Text>
      </View>
      <Text className="text-textPrimary text-sm font-bold leading-5" numberOfLines={2}>
        {item.label}
      </Text>
    </Card>
  );
}

// 메인 화면
export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [selectedCalculatorKey, setSelectedCalculatorKey] =
    useState<CalculatorKey | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [calculatorOpenSequence, setCalculatorOpenSequence] = useState(0);
  const [favoriteContent, setFavoriteContent] = useState<ContentRef[]>([]);
  const [recentContent, setRecentContent] = useState<ContentRef[]>([]);
  const calculatorOpenedAt = useRef(0);
  const calculatorHadResult = useRef(false);
  const calculatorIsOpen = useRef(false);
  const [activeSession, setActiveSession] = useState<DrinkingSession | null>(null);
  const [weekSummary, setWeekSummary] = useState<WeekSummary>({
    weekDrinks: 0,
    weeklyProgress: null,
    challengeProgress: null,
  });
  const [today, setToday] = useState(() => new Date());

  // 계산기 설정을 useMemo로 메모이제이션하여 언어 변경 시 자동으로 업데이트
  const calculatorConfigs: Record<CalculatorKey, CalculatorConfig> = useMemo(
    () => ({
      dilution: {
        navLabel: t("calculators.dilution.navLabel"),
        navDescription: t("calculators.dilution.navDescription"),
        title: t("calculators.dilution.title"),
        description: t("calculators.dilution.description"),
        fields: [
          { label: t("calculators.dilution.currentVolume"), unit: t("units.ml"), placeholder: "0" },
          { label: t("calculators.dilution.currentABV"), unit: t("units.percent"), placeholder: "0" },
          { label: t("calculators.dilution.targetABV"), unit: t("units.percent"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateDilution(values, t),
        iconColor: "bg-red-500",
        icon: "🧪",
        presets: drinkPresets,
        presetFieldMapping: { volumeIndex: 0, abvIndex: 1 },
      },
      blending: {
        navLabel: t("calculators.blending.navLabel"),
        navDescription: t("calculators.blending.navDescription"),
        title: t("calculators.blending.title"),
        description: t("calculators.blending.description"),
        fields: [
          { label: t("calculators.blending.firstABV"), unit: t("units.percent"), placeholder: "0" },
          { label: t("calculators.blending.firstVolume"), unit: t("units.ml"), placeholder: "0" },
          { label: t("calculators.blending.secondABV"), unit: t("units.percent"), placeholder: "0" },
          { label: t("calculators.blending.targetABV"), unit: t("units.percent"), placeholder: "0" },
          { label: t("calculators.blending.targetVolume"), unit: t("units.ml"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateBlending(values, t),
        iconColor: "bg-pink-500",
        icon: "🍹",
        presets: drinkPresets,
        presetFieldMapping: { volumeIndex: 1, abvIndex: 0 },
      },
      calorie: {
        navLabel: t("calculators.calorie.navLabel"),
        navDescription: t("calculators.calorie.navDescription"),
        title: t("calculators.calorie.title"),
        description: t("calculators.calorie.description"),
        fields: [
          { label: t("calculators.calorie.volume"), unit: t("units.ml"), placeholder: "0" },
          { label: t("calculators.calorie.abv"), unit: t("units.percent"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateCalorie(values, t),
        iconColor: "bg-yellow-500",
        icon: "🔥",
        presets: drinkPresets,
        presetFieldMapping: { volumeIndex: 0, abvIndex: 1 },
      },
      temperature: {
        navLabel: t("calculators.temperature.navLabel"),
        navDescription: t("calculators.temperature.navDescription"),
        title: t("calculators.temperature.title"),
        description: t("calculators.temperature.description"),
        fields: [
          { label: t("calculators.temperature.measuredTemp"), unit: t("units.celsius"), placeholder: "0" },
          { label: t("calculators.temperature.measuredABV"), unit: t("units.percent"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateTemperatureCorrection(values, t),
        iconColor: "bg-blue-500",
        icon: "🌡️",
      },
      alcoholContent: {
        navLabel: t("calculators.alcoholContent.navLabel"),
        navDescription: t("calculators.alcoholContent.navDescription"),
        title: t("calculators.alcoholContent.title"),
        description: t("calculators.alcoholContent.description"),
        fields: [
          { label: t("calculators.alcoholContent.volume"), unit: t("units.ml"), placeholder: "0" },
          { label: t("calculators.alcoholContent.abv"), unit: t("units.percent"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateAlcoholContent(values, t),
        iconColor: "bg-orange-400",
        icon: "🥃",
        presets: drinkPresets,
        presetFieldMapping: { volumeIndex: 0, abvIndex: 1 },
      },
      freezingPoint: {
        navLabel: t("calculators.freezingPoint.navLabel"),
        navDescription: t("calculators.freezingPoint.navDescription"),
        title: t("calculators.freezingPoint.title"),
        description: t("calculators.freezingPoint.description"),
        fields: [
          { label: t("calculators.freezingPoint.abv"), unit: t("units.percent"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateFreezingPoint(values, t),
        iconColor: "bg-green-500",
        icon: "🧊",
      },
      proof: {
        navLabel: t("calculators.proof.navLabel"),
        navDescription: t("calculators.proof.navDescription"),
        title: t("calculators.proof.title"),
        description: t("calculators.proof.description"),
        fields: [
          { label: t("calculators.proof.abv"), unit: t("units.percent"), placeholder: "0" },
          { label: t("calculators.proof.proof"), unit: t("units.proof"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => calculateProof(values, t),
        iconColor: "bg-purple-500",
        icon: "🔄",
      },
      bac: {
        navLabel: t("calculators.bac.navLabel"),
        navDescription: t("calculators.bac.navDescription"),
        title: t("calculators.bac.title"),
        description: t("calculators.bac.description"),
        fields: [
          { label: t("calculators.bac.weight"), unit: "kg", placeholder: "0" },
          {
            label: t("calculators.bac.gender"),
            unit: "",
            placeholder: "",
            fieldType: "radio" as const,
            options: [
              { label: t("calculators.bac.male"), value: 0 },
              { label: t("calculators.bac.female"), value: 1 },
            ],
          },
          { label: t("calculators.bac.numberOfDrinks"), unit: "", placeholder: "0" },
          { label: t("calculators.bac.timeSinceFirst"), unit: t("calculators.bac.hours"), placeholder: "0" },
        ],
        calculateResult: (values: number[]) => {
          const gender = values[1] === 0 ? "male" : "female";
          return calculateBAC(values[0], gender, values[2], values[3], t);
        },
        iconColor: "bg-teal-500",
        icon: "🍺",
      },
      unitConverter: {
        navLabel: t("calculators.unitConverter.navLabel"),
        navDescription: t("calculators.unitConverter.navDescription"),
        title: t("calculators.unitConverter.title"),
        description: t("calculators.unitConverter.description"),
        fields: [
          {
            label: t("calculators.unitConverter.volumeMode"),
            unit: "",
            placeholder: "",
            fieldType: "select" as const,
            options: [
              { label: t("calculators.unitConverter.volumeMode"), value: 0 },
              { label: t("calculators.unitConverter.tempMode"), value: 1 },
              { label: t("calculators.unitConverter.koreanMode"), value: 2 },
            ],
          },
          { label: t("calculators.unitConverter.inputValue"), unit: "", placeholder: "0" },
        ],
        calculateResult: (values: number[]) => {
          const modes = ["volume", "temperature", "korean"] as const;
          const mode = modes[values[0]] || "volume";

          if (mode === "volume") {
            const ml = values[1];
            return [
              { label: t("calculators.unitConverter.ml"), value: `${ml.toFixed(2)} ml` },
              { label: t("calculators.unitConverter.oz"), value: `${(ml / 29.5735).toFixed(2)} oz` },
              { label: t("calculators.unitConverter.cups"), value: `${(ml / 236.588).toFixed(2)}` },
              { label: t("calculators.unitConverter.bottles"), value: `${(ml / 750).toFixed(2)}` },
            ];
          } else if (mode === "temperature") {
            const celsius = values[1];
            return [
              { label: t("calculators.unitConverter.celsius"), value: `${celsius.toFixed(1)} °C` },
              { label: t("calculators.unitConverter.fahrenheit"), value: `${(celsius * 9 / 5 + 32).toFixed(1)} °F` },
            ];
          } else {
            const ml = values[1];
            return [
              { label: "ml", value: `${ml.toFixed(1)} ml` },
              { label: t("calculators.unitConverter.sojuGlass"), value: `${(ml / 50).toFixed(2)}` },
              { label: t("calculators.unitConverter.beerGlass"), value: `${(ml / 355).toFixed(2)}` },
              { label: t("calculators.unitConverter.sojuBottle"), value: `${(ml / 360).toFixed(2)}` },
              { label: t("calculators.unitConverter.doe"), value: `${(ml / 1800).toFixed(4)}` },
            ];
          }
        },
        iconColor: "bg-indigo-500",
        icon: "📐",
      },
    }),
    [t]
  );

  const selectedCalculator = selectedCalculatorKey
    ? calculatorConfigs[selectedCalculatorKey]
    : null;
  const featuredDailyCard = useMemo(() => getDailyCard(), []);
  const dailyTip = useMemo(() => getDailyTip(), []);

  // 즐겨찾기 우선, 최근 본 콘텐츠로 채운 단일 레일 (중복 제거, 최대 8개)
  const contentRail = useMemo(() => {
    const seen = new Set<string>();
    const merged: ContentRef[] = [];
    for (const item of [...favoriteContent, ...recentContent]) {
      const key = `${item.kind}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
    return merged.slice(0, 8);
  }, [favoriteContent, recentContent]);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setToday(now);
      Promise.all([
        getFavorites(),
        getRecentContent(),
        getActiveSession(),
        loadWeekSummary(now),
      ]).then(([favorites, recent, session, summary]) => {
        setFavoriteContent(favorites);
        setRecentContent(recent);
        setActiveSession(session);
        setWeekSummary(summary);
      });
    }, [])
  );

  const handleBack = (reason: CalculatorCloseReason = "button") => {
    if (calculatorIsOpen.current && selectedCalculatorKey) {
      logCalculatorClosed(selectedCalculatorKey, reason, calculatorHadResult.current, Date.now() - calculatorOpenedAt.current);
      calculatorIsOpen.current = false;
    }
    setModalVisible(false);
    setTimeout(() => { if (!calculatorIsOpen.current) setSelectedCalculatorKey(null); }, 300);
  };

  const openCalculator = (key: CalculatorKey) => {
    setCalculatorOpenSequence((sequence) => sequence + 1);
    calculatorOpenedAt.current = Date.now();
    calculatorHadResult.current = false;
    calculatorIsOpen.current = true;
    logCalculatorOpened(key, "home_grid");
    setSelectedCalculatorKey(key);
    setModalVisible(true);
  };

  const targetRoute = (target: DailyContentCard["target"]) => {
    if (target === "quiz") return "/(tabs)/quiz" as const;
    if (target === "tracker") return "/(tabs)/tracker" as const;
    if (target === "recipes") return "/(tabs)/explore?section=recipes" as const;
    return "/(tabs)/explore?section=encyclopedia" as const;
  };

  const openDailyTarget = (target: DailyContentCard["target"]) => {
    logHomeCtaClick(target, "daily_card");
    router.push(targetRoute(target));
  };

  const handleRecommendationPress = (target: "recipes" | "encyclopedia" | "tracker") => {
    handleBack("recommendation");
    setTimeout(() => {
      router.push(targetRoute(target));
    }, 300);
  };

  const openTrackerFromWeekSummary = () => {
    logHomeCtaClick("tracker", "week_summary");
    router.push("/(tabs)/tracker");
  };

  const todayLabel = today.toLocaleDateString(i18n.language, {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const openContentKind = (kind: "recipe" | "encyclopedia") => {
    router.push(
      kind === "recipe"
        ? "/(tabs)/explore?section=recipes"
        : "/(tabs)/explore?section=encyclopedia"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />

      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-textPrimary mb-1" accessibilityRole="header">
          {t("common.appTitle")}
        </Text>
        <Text className="text-sm text-textSecondary mb-5">{todayLabel}</Text>

        {/* 세션 상태 카드: 비활성 = 외곽선 CTA, 진행 중 = 초록 + 펄스·경과 시간·잔 수 */}
        <SessionStatusCard
          session={activeSession}
          onPress={() => { logHomeCtaClick("session", "session_banner"); router.push("/session"); }}
        />

        {/* 핵심 기능인 계산기를 첫 화면 최상단에 그리드로 배치 */}
        <SectionHeader title={t("home.calculatorsTitle")} />
        <View className="flex-row flex-wrap justify-between mb-3">
          {(Object.keys(calculatorConfigs) as CalculatorKey[]).map((key) => {
            const config = calculatorConfigs[key];
            return (
              <TouchableOpacity
                key={key}
                className="bg-surface rounded-card px-2 py-3 mb-3 items-center justify-center w-[31%] h-24 min-h-[44px]"
                onPress={() => openCalculator(key)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={config.navLabel}
                accessibilityHint={config.navDescription}
              >
                <View
                  className={`${config.iconColor} rounded-full w-11 h-11 items-center justify-center mb-2`}
                >
                  <Text className="text-xl">{config.icon}</Text>
                </View>
                <Text
                  className="text-textPrimary text-xs font-semibold text-center"
                  numberOfLines={1}
                >
                  {config.navLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 오늘: 팁 + 추천을 카드 1장으로 통합 */}
        <SectionHeader title={t("home.todayTitle")} />
        <Card className="mb-4">
          <View className="flex-row items-start">
            <Text className="text-3xl mr-3">{dailyTip.emoji}</Text>
            <View className="flex-1">
              <Text className="text-accentSoft text-xs font-bold mb-1">
                {t("home.todayTipLabel")}
              </Text>
              <Text className="text-textPrimary text-sm leading-5">
                {pickLocalizedText(dailyTip.text, i18n.language)}
              </Text>
            </View>
          </View>
          <View className="h-px bg-surfaceDeep my-3" />
          <TouchableOpacity
            className="flex-row items-center min-h-[44px]"
            onPress={() => openDailyTarget(featuredDailyCard.target)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${pickLocalizedText(featuredDailyCard.label, i18n.language)}, ${pickLocalizedText(featuredDailyCard.title, i18n.language)}, ${pickLocalizedText(featuredDailyCard.action, i18n.language)}`}
          >
            <View className="flex-1">
              {/* 팁 라벨과 같은 문구면 같은 카드 안에서 중복되므로 뱃지를 생략한다 */}
              {pickLocalizedText(featuredDailyCard.label, i18n.language) !== t("home.todayTipLabel") && (
                <Text className="text-accentSoft text-xs font-bold mb-0.5" numberOfLines={1}>
                  {pickLocalizedText(featuredDailyCard.label, i18n.language)}
                </Text>
              )}
              <Text className="text-textPrimary text-sm font-semibold leading-5" numberOfLines={2}>
                {featuredDailyCard.emoji} {pickLocalizedText(featuredDailyCard.title, i18n.language)}
              </Text>
            </View>
            <Text className="text-accentSoft text-sm font-semibold ml-2" numberOfLines={1}>
              {pickLocalizedText(featuredDailyCard.action, i18n.language)} ›
            </Text>
          </TouchableOpacity>
        </Card>

        {/* 이번 주 요약: 탭하면 트래커로 이동 */}
        <SectionHeader
          title={t("home.week.title")}
          actionLabel={t("home.seeAll")}
          onActionPress={openTrackerFromWeekSummary}
          className="mb-1"
        />
        <WeekSummaryTiles summary={weekSummary} onPress={openTrackerFromWeekSummary} />

        {/* 퀴즈: 낮은 위계의 행 카드 */}
        <Card
          className="mb-6 flex-row items-center min-h-[44px]"
          onPress={() => { logHomeCtaClick("quiz", "quiz_banner"); router.push("/(tabs)/quiz"); }}
          accessibilityLabel={`${t("home.quizBannerTitle")}, ${t("home.quizBannerDescription")}`}
        >
          <Text className="text-2xl mr-3">🧠</Text>
          <View className="flex-1">
            <Text className="text-textPrimary text-base font-bold" numberOfLines={1}>
              {t("home.quizBannerTitle")}
            </Text>
            <Text className="text-textSecondary text-sm mt-0.5" numberOfLines={1}>
              {t("home.quizBannerDescription")}
            </Text>
          </View>
          <Text className="text-textSecondary text-2xl ml-2">›</Text>
        </Card>

        {/* 이어 보기(즐겨찾기·최근 본 콘텐츠). 콘텐츠가 없으면 섹션 전체 숨김 */}
        {contentRail.length > 0 && (
          <View className="mb-6">
            <SectionHeader title={t("home.continueTitle")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {contentRail.map((item) => (
                <ContentShortcut
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  badgeLabel={item.kind === "recipe" ? t("home.badgeRecipe") : t("home.badgeGuide")}
                  onPress={() => { logHomeContentClick(item.kind, item.id, favoriteContent.some((favorite) => favorite.kind === item.kind && favorite.id === item.id) ? "favorite" : "recent"); openContentKind(item.kind); }}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => handleBack("backdrop")}
        onBackButtonPress={() => handleBack("back")}
        onSwipeComplete={() => handleBack("swipe")}
        swipeDirection={["down"]}
        style={{ justifyContent: "flex-end", margin: 0 }}
        propagateSwipe={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        {selectedCalculator && (
          <View className="bg-background rounded-t-3xl overflow-hidden max-h-[90%]">
            <CalculationCard
              key={`${selectedCalculatorKey}-${calculatorOpenSequence}`}
              title={selectedCalculator.title}
              description={selectedCalculator.description}
              fields={selectedCalculator.fields}
              calculateResult={selectedCalculator.calculateResult}
              onBack={() => handleBack("button")}
              onSuccessfulResult={() => { calculatorHadResult.current = true; }}
              presets={selectedCalculator.presets}
              presetFieldMapping={selectedCalculator.presetFieldMapping}
              calculatorType={selectedCalculatorKey || undefined}
              calculatorIcon={selectedCalculator.icon}
              onRecommendationPress={handleRecommendationPress}
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
