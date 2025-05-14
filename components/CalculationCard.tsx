import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

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

export default CalculationCard;
