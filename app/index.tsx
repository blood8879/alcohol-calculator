import React, { useState } from "react";
import { SafeAreaView, StatusBar, Text, View } from "react-native";
import CalculationCard from "../components/CalculationCard";
import CalculatorIcon from "../components/CalculatorIcon";

// 계산 함수들
const dilutionFields = [
  { label: "현재 용량", unit: "ml", placeholder: "0" },
  { label: "현재 도수", unit: "%", placeholder: "0" },
  { label: "목표 도수", unit: "%", placeholder: "0" },
];

const alcoholContentFields = [
  { label: "용량", unit: "ml", placeholder: "0" },
  { label: "도수", unit: "%", placeholder: "0" },
];

const temperatureFields = [
  { label: "측정 온도", unit: "°C", placeholder: "0" },
  { label: "측정 도수", unit: "%", placeholder: "0" },
];

const calculateDilution = (values: number[]) => {
  const [currentVolume, currentABV, targetABV] = values;
  if (
    currentABV <= targetABV ||
    currentVolume <= 0 ||
    currentABV <= 0 ||
    targetABV <= 0
  ) {
    return [
      { label: "오류", value: "현재 도수는 목표 도수보다 높아야 합니다" },
    ];
  }
  const finalVolume = (currentVolume * currentABV) / targetABV;
  const waterToAdd = finalVolume - currentVolume;
  return [
    { label: "추가할 물의 양", value: `${waterToAdd.toFixed(2)} ml` },
    { label: "최종 용량", value: `${finalVolume.toFixed(2)} ml` },
  ];
};

const calculateAlcoholContent = (values: number[]) => {
  const [volume, abv] = values;
  if (volume <= 0 || abv <= 0) {
    return [{ label: "오류", value: "모든 값은 0보다 커야 합니다" }];
  }
  const pureAlcohol = volume * (abv / 100);
  return [{ label: "순알코올량", value: `${pureAlcohol.toFixed(2)} ml` }];
};

const calculateTemperatureCorrection = (values: number[]) => {
  const [temperature, measuredABV] = values;
  if (measuredABV <= 0) {
    return [{ label: "오류", value: "도수는 0보다 커야 합니다" }];
  }
  const tempDifference = temperature - 20;
  const correctionFactor = tempDifference * 0.35;
  const correctedABV = measuredABV + correctionFactor;
  return [
    { label: "20°C 기준 보정 도수", value: `${correctedABV.toFixed(2)} %` },
  ];
};

// 계산기 설정
const calculatorConfigs = {
  dilution: {
    navLabel: "도수 조정",
    navDescription:
      "현재 도수와 용량에서 원하는 도수로 만들기 위해 필요한 물의 양 계산",
    title: "도수 조정 계산",
    description:
      "현재 도수와 용량에서 원하는 도수로 만들기 위해 필요한 물의 양 계산",
    fields: dilutionFields,
    calculateResult: calculateDilution,
    iconColor: "bg-red-500",
    icon: "🧪",
  },
  alcoholContent: {
    navLabel: "알코올량",
    navDescription: "주어진 용량과 도수에 따른 순알코올량 계산",
    title: "알코올 순함량 계산",
    description: "주어진 용량과 도수에 따른 순알코올량 계산",
    fields: alcoholContentFields,
    calculateResult: calculateAlcoholContent,
    iconColor: "bg-orange-400",
    icon: "🥃",
  },
  temperature: {
    navLabel: "온도 보정",
    navDescription: "측정 온도에서 20°C 기준 도수로 보정",
    title: "온도별 도수 보정",
    description: "측정 온도에서 20°C 기준 도수로 보정",
    fields: temperatureFields,
    calculateResult: calculateTemperatureCorrection,
    iconColor: "bg-blue-500",
    icon: "🌡️",
  },
};

type CalculatorKey = keyof typeof calculatorConfigs;

// 메인 화면
export default function HomeScreen() {
  const [selectedCalculatorKey, setSelectedCalculatorKey] =
    useState<CalculatorKey | null>(null);

  const selectedCalculator = selectedCalculatorKey
    ? calculatorConfigs[selectedCalculatorKey]
    : null;

  const handleBack = () => {
    setSelectedCalculatorKey(null);
  };

  if (selectedCalculator) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <CalculationCard
          title={selectedCalculator.title}
          description={selectedCalculator.description}
          fields={selectedCalculator.fields}
          calculateResult={selectedCalculator.calculateResult}
          onBack={handleBack}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />

      <View className="p-4">
        <Text className="text-2xl font-bold text-white mb-1">주류 계산기</Text>
        <Text className="text-sm text-gray-400 mb-6">
          계산하시려는 항목을 터치해주세요!
        </Text>

        <View className="flex-col space-y-4">
          {Object.keys(calculatorConfigs).map((key) => {
            const config = calculatorConfigs[key as CalculatorKey];
            return (
              <CalculatorIcon
                key={key}
                icon={config.icon}
                label={config.navLabel}
                description={config.navDescription}
                iconColor={config.iconColor}
                onPress={() => setSelectedCalculatorKey(key as CalculatorKey)}
              />
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
