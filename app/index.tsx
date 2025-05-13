import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 계산 카드 컴포넌트
const CalculationCard = ({
  title,
  description,
  fields,
  calculateResult,
  onBack,
}: {
  title: string;
  description: string;
  fields: { label: string; unit: string; placeholder: string }[];
  calculateResult: (values: number[]) => { label: string; value: string }[];
  onBack: () => void;
}) => {
  const [values, setValues] = useState<number[]>(Array(fields.length).fill(0));
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    []
  );

  const handleInputChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = Number(text) || 0;
    setValues(newValues);
  };

  const handleCalculate = () => {
    const calculatedResults = calculateResult(values);
    setResults(calculatedResults);
  };

  return (
    <View className="flex-1">
      <View className="bg-green-500 py-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Text className="text-white text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">{title}</Text>
      </View>

      <View className="p-4 bg-white rounded-lg mx-4 mt-4 shadow-sm">
        <Text className="text-sm text-gray-600 mb-4">{description}</Text>

        {fields.map((field, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-base text-gray-800 flex-1">
              {field.label}
            </Text>
            <View className="flex-row items-center w-[130px]">
              <TextInput
                className="bg-gray-200 p-2 rounded-lg flex-1 text-right"
                placeholder={field.placeholder}
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange(text, index)}
              />
              <Text className="ml-2 text-gray-800">{field.unit}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          className="bg-green-500 p-3 rounded-lg mt-2"
          onPress={handleCalculate}
        >
          <Text className="text-white text-center font-bold text-base">
            계산하기
          </Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View className="mt-4 bg-gray-200 p-4 rounded-lg">
            {results.map((result, index) => (
              <View key={index} className="flex-row justify-between mb-1">
                <Text className="text-base text-gray-800">{result.label}</Text>
                <Text className="text-base text-gray-800 font-bold">
                  {result.value}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

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
    title: "알코올 순함량 계산",
    description: "주어진 용량과 도수에 따른 순알코올량 계산",
    fields: alcoholContentFields,
    calculateResult: calculateAlcoholContent,
    iconColor: "bg-orange-400",
    icon: "🥃",
  },
  temperature: {
    navLabel: "온도 보정",
    title: "온도별 도수 보정",
    description: "측정 온도에서 20°C 기준 도수로 보정",
    fields: temperatureFields,
    calculateResult: calculateTemperatureCorrection,
    iconColor: "bg-blue-500",
    icon: "🌡️",
  },
};

type CalculatorKey = keyof typeof calculatorConfigs;

// 계산기 아이콘 컴포넌트
const CalculatorIcon = ({
  icon,
  label,
  iconColor,
  onPress,
}: {
  icon: string;
  label: string;
  iconColor: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      className="w-[46%] bg-gray-800 rounded-xl p-4 mb-4"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View
          className={`w-12 h-12 ${iconColor} rounded-full items-center justify-center`}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>
        <Text className="text-gray-400 text-2xl">›</Text>
      </View>
      <Text className="text-white text-base font-semibold">{label}</Text>
      <Text className="text-white text-xs opacity-70 mt-1">
        {label} 계산하기
      </Text>
    </TouchableOpacity>
  );
};

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
          계산 항목을 선택하세요
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {Object.keys(calculatorConfigs).map((key) => {
            const config = calculatorConfigs[key as CalculatorKey];
            return (
              <CalculatorIcon
                key={key}
                icon={config.icon}
                label={config.navLabel}
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
