import React, { useState, useMemo } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import Modal from "react-native-modal";
import CalculationCard, { CalculationField } from "../../components/CalculationCard";
import CalculatorIcon from "../../components/CalculatorIcon";
import LanguageSelector from "../../components/LanguageSelector";
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
import { DrinkPreset } from "../../data/types";

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

// 메인 화면
export default function HomeScreen() {
  const { t } = useTranslation();
  const [selectedCalculatorKey, setSelectedCalculatorKey] =
    useState<CalculatorKey | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

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

  const handleBack = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedCalculatorKey(null), 300);
  };

  const openCalculator = (key: CalculatorKey) => {
    setSelectedCalculatorKey(key);
    setModalVisible(true);
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
        <Text className="text-sm text-gray-400 mb-6">
          {t("common.appSubtitle")}
        </Text>

        <LanguageSelector />

        <View className="flex-col space-y-4">
          {(Object.keys(calculatorConfigs) as CalculatorKey[]).map((key) => {
            const config = calculatorConfigs[key];
            return (
              <CalculatorIcon
                key={key}
                icon={config.icon}
                label={config.navLabel}
                description={config.navDescription}
                iconColor={config.iconColor}
                onPress={() => openCalculator(key)}
              />
            );
          })}
        </View>
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
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
