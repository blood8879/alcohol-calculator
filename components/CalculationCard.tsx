import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type CalculationCardProps = {
  title: string;
  description: string;
  fields: { label: string; unit: string; placeholder: string }[];
  calculateResult: (values: number[]) => { label: string; value: string }[];
  onBack: () => void;
};

const CalculationCard = ({
  title,
  description,
  fields,
  calculateResult,
  onBack,
}: CalculationCardProps) => {
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
    <View className="bg-white">
      {/* 바텀시트 드래그 핸들 */}
      <View className="items-center pt-2 pb-4">
        <View className="w-10 h-1 bg-gray-300 rounded-full" />
      </View>

      {/* 헤더 */}
      <View className="px-4 pb-4">
        <Text className="text-2xl font-bold text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-600 mt-1">{description}</Text>
      </View>

      {/* 계산 영역 */}
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {fields.map((field, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-base text-gray-800 flex-1 mr-2">
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
              <View key={index} className="mb-2 last:mb-0">
                <Text className="text-base text-gray-800 font-semibold mb-1">
                  {result.label}
                </Text>
                <Text className="text-base text-gray-800 font-bold flex-wrap">
                  {result.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 닫기 버튼 */}
        <TouchableOpacity
          className="border border-gray-300 p-3 rounded-lg mt-4 mb-4"
          onPress={onBack}
        >
          <Text className="text-gray-800 text-center">닫기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CalculationCard;
