import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

interface CalculationCardProps {
  title: string;
  description: string;
  fields: { label: string; unit: string; placeholder: string }[];
  calculateResult: (values: number[]) => { label: string; value: string }[];
}

export const CalculationCard = ({
  title,
  description,
  fields,
  calculateResult,
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
    <View className="bg-card rounded-card my-3 shadow-sm overflow-hidden">
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold">{title}</Text>
        <Text className="text-white text-sm mt-1 opacity-80">
          {description}
        </Text>
      </View>

      <View className="p-4">
        {fields.map((field, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-text text-base flex-1">{field.label}</Text>
            <View className="flex-row items-center w-32">
              <TextInput
                className="bg-gray-100 p-2 rounded-md flex-1 text-right"
                placeholder={field.placeholder}
                keyboardType="numeric"
                onChangeText={(text: string) => handleInputChange(text, index)}
              />
              <Text className="ml-2 text-text">{field.unit}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          className="bg-primary py-3 rounded-md mt-2"
          onPress={handleCalculate}
        >
          <Text className="text-white text-center font-bold">계산하기</Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View className="mt-4 bg-result p-4 rounded-md">
            {results.map((result, index) => (
              <View key={index} className="flex-row justify-between mb-1">
                <Text className="text-text">{result.label}</Text>
                <Text className="text-text font-bold">{result.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
