import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalculationCard } from "../../components/CalculationCard";

// 메인 화면
export default function HomeScreen() {
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

  // 도수 조정 계산
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

  // 순알코올량 계산
  const calculateAlcoholContent = (values: number[]) => {
    const [volume, abv] = values;

    if (volume <= 0 || abv <= 0) {
      return [{ label: "오류", value: "모든 값은 0보다 커야 합니다" }];
    }

    const pureAlcohol = volume * (abv / 100);

    return [{ label: "순알코올량", value: `${pureAlcohol.toFixed(2)} ml` }];
  };

  // 온도별 도수 보정
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <View className="bg-primary px-4 py-4">
        <Text className="text-white text-2xl font-bold">주류 계산기</Text>
        <Text className="text-white text-sm opacity-80 mt-1">
          간단하고 정확한 주류 계산
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-2">
        <CalculationCard
          title="도수 조정 계산"
          description="현재 도수와 용량에서 원하는 도수로 만들기 위해 필요한 물의 양 계산"
          fields={dilutionFields}
          calculateResult={calculateDilution}
        />

        <CalculationCard
          title="알코올 순함량 계산"
          description="주어진 용량과 도수에 따른 순알코올량 계산"
          fields={alcoholContentFields}
          calculateResult={calculateAlcoholContent}
        />

        <CalculationCard
          title="온도별 도수 보정"
          description="측정 온도에서 20°C 기준 도수로 보정"
          fields={temperatureFields}
          calculateResult={calculateTemperatureCorrection}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
