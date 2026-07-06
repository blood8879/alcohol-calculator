import React, { useCallback, useState, useMemo } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import Modal from "react-native-modal";
import Card from "../../components/ui/Card";
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
import { CuratedContentItem } from "../../data/contentCollections";
import { getDailyTip } from "../../data/dailyTips";
import { DrinkPreset } from "../../data/types";
import { ContentRef, getFavorites, getRecentContent } from "../../utils/contentStorage";
import { getActiveSession } from "../../utils/engagement/drinkingSessionStorage";
import { pickLocalizedText } from "../../utils/localizedText";

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

type DailyCardProps = {
  card: DailyContentCard;
  language: string;
  compact?: boolean;
  onPress: () => void;
};

function DailyCard({ card, language, compact = false, onPress }: DailyCardProps) {
  return (
    <Card className={compact ? "flex-1" : ""} onPress={onPress}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-green-500/15 rounded-full px-3 py-1">
          <Text className="text-green-400 text-xs font-bold">
            {pickLocalizedText(card.label, language)}
          </Text>
        </View>
        <Text className={compact ? "text-3xl" : "text-4xl"}>{card.emoji}</Text>
      </View>
      <Text className="text-white text-lg font-bold mb-2" numberOfLines={compact ? 2 : undefined}>
        {pickLocalizedText(card.title, language)}
      </Text>
      <Text className="text-gray-400 text-sm leading-5 mb-4" numberOfLines={compact ? 3 : undefined}>
        {pickLocalizedText(card.description, language)}
      </Text>
      <Text className="text-green-400 text-sm font-semibold">
        {pickLocalizedText(card.action, language)} ›
      </Text>
    </Card>
  );
}

type ContentShortcutProps = {
  item: ContentRef | CuratedContentItem;
  language: string;
  description?: string;
  onPress: () => void;
};

function ContentShortcut({ item, language, description: descriptionOverride, onPress }: ContentShortcutProps) {
  const title = "label" in item ? item.label : pickLocalizedText(item.title, language);
  const description = "description" in item
    ? pickLocalizedText(item.description, language)
    : descriptionOverride;

  return (
    <Card className="mr-3 w-56" onPress={onPress}>
      <View className="flex-row items-center mb-3">
        <Text className="text-3xl mr-3">{item.emoji}</Text>
        <View className="bg-gray-700 rounded-full px-2 py-1">
          <Text className="text-gray-300 text-xs font-semibold">
            {item.kind === "recipe" ? "Recipe" : "Guide"}
          </Text>
        </View>
      </View>
      <Text className="text-white text-base font-bold mb-2" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-gray-400 text-sm leading-5" numberOfLines={2}>
        {description}
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
  const [favoriteContent, setFavoriteContent] = useState<ContentRef[]>([]);
  const [recentContent, setRecentContent] = useState<ContentRef[]>([]);
  const [hasActiveSession, setHasActiveSession] = useState(false);

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
      Promise.all([getFavorites(), getRecentContent(), getActiveSession()]).then(
        ([favorites, recent, activeSession]) => {
          setFavoriteContent(favorites);
          setRecentContent(recent);
          setHasActiveSession(activeSession !== null);
        }
      );
    }, [])
  );

  const handleBack = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedCalculatorKey(null), 300);
  };

  const openCalculator = (key: CalculatorKey) => {
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
    router.push(targetRoute(target));
  };

  const handleRecommendationPress = (target: "recipes" | "encyclopedia" | "tracker") => {
    setModalVisible(false);
    setTimeout(() => {
      router.push(targetRoute(target));
    }, 300);
  };

  const openContentKind = (kind: "recipe" | "encyclopedia") => {
    router.push(
      kind === "recipe"
        ? "/(tabs)/explore?section=recipes"
        : "/(tabs)/explore?section=encyclopedia"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />

      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-white mb-1">
          {t("common.appTitle")}
        </Text>
        <Text className="text-sm text-gray-400 mb-5">
          {t("common.appSubtitle")}
        </Text>

        {/* 실시간 음주 세션 진입 CTA */}
        <TouchableOpacity
          className={`rounded-2xl p-4 mb-6 flex-row items-center ${
            hasActiveSession ? "bg-green-600" : "bg-gray-800 border border-green-700"
          }`}
          onPress={() => router.push("/session")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={hasActiveSession ? t("session.homeCtaActive") : t("session.homeCta")}
        >
          <Text className="text-3xl mr-3">🍻</Text>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">
              {hasActiveSession ? t("session.homeCtaActive") : t("session.homeCta")}
            </Text>
            <Text
              className={`text-sm mt-1 leading-5 ${
                hasActiveSession ? "text-green-100" : "text-gray-400"
              }`}
            >
              {t("session.homeCtaDescription")}
            </Text>
          </View>
          <Text className="text-white text-2xl ml-2">›</Text>
        </TouchableOpacity>

        {/* 핵심 기능인 계산기를 첫 화면 최상단에 그리드로 배치 */}
        <Text className="text-lg font-bold text-white mb-3">
          {t("home.calculatorsTitle")}
        </Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {(Object.keys(calculatorConfigs) as CalculatorKey[]).map((key) => {
            const config = calculatorConfigs[key];
            return (
              <TouchableOpacity
                key={key}
                className="bg-gray-800 rounded-xl p-3 mb-3 items-center w-[31%]"
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
                  className="text-white text-xs font-semibold text-center"
                  numberOfLines={1}
                >
                  {config.navLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 오늘 블록: 팁 + 추천 카드 하나로 통합 */}
        <Text className="text-lg font-bold text-white mb-3">
          {t("home.todayTitle")}
        </Text>
        <Card className="mb-3 flex-row items-start">
          <Text className="text-3xl mr-3">{dailyTip.emoji}</Text>
          <View className="flex-1">
            <Text className="text-green-400 text-xs font-bold mb-1">
              {t("home.todayTipLabel")}
            </Text>
            <Text className="text-white text-sm leading-5">
              {pickLocalizedText(dailyTip.text, i18n.language)}
            </Text>
          </View>
        </Card>
        <DailyCard
          card={featuredDailyCard}
          language={i18n.language}
          onPress={() => openDailyTarget(featuredDailyCard.target)}
        />

        <TouchableOpacity
          className="bg-emerald-600 rounded-2xl p-4 mt-3 mb-6 flex-row items-center"
          onPress={() => router.push("/(tabs)/quiz")}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t("home.quizBannerTitle")}
        >
          <Text className="text-3xl mr-3">🧠</Text>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">
              {t("home.quizBannerTitle")}
            </Text>
            <Text className="text-emerald-100 text-sm mt-1 leading-5">
              {t("home.quizBannerDescription")}
            </Text>
          </View>
          <Text className="text-white text-2xl ml-2">›</Text>
        </TouchableOpacity>

        {contentRail.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-white mb-3">
              {t("home.contentRailTitle")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {contentRail.map((item) => (
                <ContentShortcut
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  language={i18n.language}
                  description={item.kind === "recipe" ? t("home.openRecipe") : t("home.openGuide")}
                  onPress={() => openContentKind(item.kind)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleBack}
        onSwipeComplete={handleBack}
        swipeDirection={["down"]}
        style={{ justifyContent: "flex-end", margin: 0 }}
        propagateSwipe={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        {selectedCalculator && (
          <View className="bg-white rounded-t-3xl overflow-hidden max-h-[90%]">
            <CalculationCard
              title={selectedCalculator.title}
              description={selectedCalculator.description}
              fields={selectedCalculator.fields}
              calculateResult={selectedCalculator.calculateResult}
              onBack={handleBack}
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
