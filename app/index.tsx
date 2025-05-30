import React, { useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Modal from "react-native-modal";
import alcoholConversionData from "../alcohol_conversion_data.json";
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
  { label: "주정분", unit: "%", placeholder: "0" },
];

const freezingPointFields = [
  { label: "알코올 도수", unit: "%", placeholder: "0" },
];

const proofFields = [
  { label: "ABV", unit: "%", placeholder: "0" },
  { label: "Proof", unit: "Proof", placeholder: "0" },
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

  // 입력된 온도와 가장 가까운 온도를 찾습니다.
  const availableTemperatures = Object.keys(alcoholConversionData).map(
    parseFloat
  );
  const closestTemperature = availableTemperatures.reduce((prev, curr) =>
    Math.abs(curr - temperature) < Math.abs(prev - temperature) ? curr : prev
  );

  const temperatureKey = closestTemperature.toFixed(1);
  const temperatureData =
    alcoholConversionData[temperatureKey as keyof typeof alcoholConversionData];

  if (!temperatureData) {
    return [{ label: "오류", value: "해당 온도 데이터를 찾을 수 없습니다." }];
  }

  // 입력된 측정 ABV와 가장 가까운 측정 ABV를 찾습니다.
  const availableMeasuredABVs = Object.keys(temperatureData).map(parseFloat);
  const closestMeasuredABV = availableMeasuredABVs.reduce((prev, curr) =>
    Math.abs(curr - measuredABV) < Math.abs(prev - measuredABV) ? curr : prev
  );

  const measuredABVKey = closestMeasuredABV.toFixed(1);
  const actualABV =
    temperatureData[measuredABVKey as keyof typeof temperatureData];

  if (actualABV === undefined || actualABV === null) {
    return [
      {
        label: "오류",
        value: "해당 측정 도수에 대한 데이터를 찾을 수 없습니다.",
      },
    ];
  }

  return [
    {
      label: `실제 알코올 도수 (${temperatureKey}°C, ${measuredABVKey}% 기준)`,
      value: `${Number(actualABV).toFixed(2)} %`,
    },
  ];
};

const calculateFreezingPoint = (values: number[]) => {
  const [abv] = values;
  if (abv <= 0) {
    return [{ label: "오류", value: "알코올 도수는 0보다 커야 합니다" }];
  }
  if (abv >= 100) {
    return [{ label: "오류", value: "알코올 도수는 100% 미만이어야 합니다" }];
  }

  const freezingPoint = -abv * 0.4;
  return [
    { label: "예상 빙점", value: `${freezingPoint.toFixed(1)} °C` },
    { label: "참고", value: "실제 빙점은 다른 성분에 따라 달라질 수 있습니다" },
  ];
};

const calculateProof = (values: number[]) => {
  const [abv, proof] = values;

  // 둘 다 입력된 경우
  if (abv > 0 && proof > 0) {
    return [{ label: "오류", value: "ABV 또는 Proof 중 하나만 입력해주세요" }];
  }

  // 둘 다 입력되지 않은 경우
  if (abv <= 0 && proof <= 0) {
    return [{ label: "오류", value: "ABV 또는 Proof 중 하나를 입력해주세요" }];
  }

  // ABV가 입력된 경우 -> Proof로 변환
  if (abv > 0) {
    if (abv > 100) {
      return [{ label: "오류", value: "ABV는 100% 이하여야 합니다" }];
    }
    const usProof = abv * 2;
    const ukProof = abv * 1.75;
    return [
      { label: "미국 기준 Proof", value: `${usProof.toFixed(1)} Proof` },
      {
        label: "영국 기준 Proof",
        value: `${ukProof.toFixed(1)} Proof (참고용)`,
      },
    ];
  }

  // Proof가 입력된 경우 -> ABV로 변환
  if (proof > 0) {
    if (proof > 200) {
      return [{ label: "오류", value: "Proof는 200 이하여야 합니다" }];
    }
    const calculatedABV = proof / 2; // 미국 기준
    const ukABV = proof / 1.75; // 영국 기준
    return [
      { label: "ABV (미국 기준)", value: `${calculatedABV.toFixed(1)} %` },
      { label: "ABV (영국 기준)", value: `${ukABV.toFixed(1)} % (참고용)` },
    ];
  }

  return [{ label: "오류", value: "계산 중 오류가 발생했습니다" }];
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
    navLabel: "도수 확인",
    navDescription: "측정 온도와 주정분%에 따른 실제 알코올 도수 환산",
    title: "실제 도수 확인",
    description: "측정 온도와 주정분%에 따른 실제 알코올 도수 환산",
    fields: temperatureFields,
    calculateResult: calculateTemperatureCorrection,
    iconColor: "bg-blue-500",
    icon: "🌡️",
  },
  freezingPoint: {
    navLabel: "빙점 계산",
    navDescription: "알코올 도수에 따른 예상 빙점 계산",
    title: "빙점 계산",
    description: "알코올 도수에 따른 예상 빙점 계산",
    fields: freezingPointFields,
    calculateResult: calculateFreezingPoint,
    iconColor: "bg-green-500",
    icon: "🧊",
  },
  proof: {
    navLabel: "Proof 변환",
    navDescription: "ABV ↔ Proof 양방향 변환",
    title: "Proof 변환",
    description: "ABV ↔ Proof 양방향 변환 (둘 중 하나만 입력하세요)",
    fields: proofFields,
    calculateResult: calculateProof,
    iconColor: "bg-purple-500",
    icon: "🔄",
  },
};

type CalculatorKey = keyof typeof calculatorConfigs;

// 메인 화면
export default function HomeScreen() {
  const [selectedCalculatorKey, setSelectedCalculatorKey] =
    useState<CalculatorKey | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const selectedCalculator = selectedCalculatorKey
    ? calculatorConfigs[selectedCalculatorKey]
    : null;

  const handleBack = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedCalculatorKey(null), 300); // 모달이 닫힌 후 선택 초기화
  };

  const openCalculator = (key: CalculatorKey) => {
    setSelectedCalculatorKey(key);
    setModalVisible(true);
  };

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
                onPress={() => openCalculator(key as CalculatorKey)}
              />
            );
          })}
        </View>
      </View>

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
