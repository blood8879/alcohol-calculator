import React, { useState, useMemo } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import Modal from "react-native-modal";
import CalculationCard from "../components/CalculationCard";
import CalculatorIcon from "../components/CalculatorIcon";
import LanguageSelector from "../components/LanguageSelector";
import {
  calculateDilution,
  calculateAlcoholContent,
  calculateTemperatureCorrection,
  calculateFreezingPoint,
  calculateProof,
  calculateBlending,
  calculateCalorie,
} from "../utils/calculatorUtils";

type CalculatorKey =
  | "dilution"
  | "blending"
  | "calorie"
  | "temperature"
  | "alcoholContent"
  | "freezingPoint"
  | "proof";

// 메인 화면
export default function HomeScreen() {
  const { t } = useTranslation();
  const [selectedCalculatorKey, setSelectedCalculatorKey] =
    useState<CalculatorKey | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // 계산기 설정을 useMemo로 메모이제이션하여 언어 변경 시 자동으로 업데이트
  const calculatorConfigs = useMemo(
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
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
