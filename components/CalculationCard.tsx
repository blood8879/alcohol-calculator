import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { DrinkPreset } from "../data/types";
import { shareResults } from "../utils/shareUtils";
import { saveCalculation } from "../utils/historyStorage";
import PresetPicker from "./PresetPicker";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

export type FieldOption = {
  label: string;
  value: number;
};

export type CalculationField = {
  label: string;
  unit: string;
  placeholder: string;
  fieldType?: "numeric" | "radio" | "select";
  options?: FieldOption[];
};

export type CalculationCardProps = {
  title: string;
  description: string;
  fields: CalculationField[];
  calculateResult: (values: number[]) => { label: string; value: string }[];
  onBack: () => void;
  presets?: DrinkPreset[];
  presetFieldMapping?: { volumeIndex: number; abvIndex: number };
  calculatorType?: string;
  calculatorIcon?: string;
};

const CalculationCard = ({
  title,
  description,
  fields,
  calculateResult,
  onBack,
  presets,
  presetFieldMapping,
  calculatorType,
  calculatorIcon,
}: CalculationCardProps) => {
  const { t } = useTranslation();
  const bannerAdUnitId = __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-7612314432840835/5764066171";
  const [values, setValues] = useState<number[]>(Array(fields.length).fill(0));
  const [inputTexts, setInputTexts] = useState<string[]>(
    Array(fields.length).fill("")
  );
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    []
  );

  const handleInputChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = Number(text) || 0;
    setValues(newValues);

    const newTexts = [...inputTexts];
    newTexts[index] = text;
    setInputTexts(newTexts);
  };

  const handleOptionSelect = (index: number, optionValue: number) => {
    const newValues = [...values];
    newValues[index] = optionValue;
    setValues(newValues);
  };

  const handlePresetSelect = (preset: DrinkPreset) => {
    if (!presetFieldMapping) return;

    const newValues = [...values];
    const newTexts = [...inputTexts];

    newValues[presetFieldMapping.volumeIndex] = preset.volume;
    newTexts[presetFieldMapping.volumeIndex] = String(preset.volume);

    newValues[presetFieldMapping.abvIndex] = preset.abv;
    newTexts[presetFieldMapping.abvIndex] = String(preset.abv);

    setValues(newValues);
    setInputTexts(newTexts);
  };

  const handleCalculate = () => {
    const calculatedResults = calculateResult(values);
    setResults(calculatedResults);

    if (calculatorType && calculatorIcon && calculatedResults.length > 0) {
      saveCalculation({
        calculatorType,
        calculatorIcon,
        inputs: fields.map((f, i) => ({
          label: f.label,
          value: inputTexts[i] || String(values[i]),
        })),
        results: calculatedResults,
      });
    }
  };

  const handleShare = () => {
    shareResults(title, results, t);
  };

  const renderRadioField = (field: CalculationField, index: number) => {
    const options = field.options || [];
    return (
      <View key={index} className="mb-4">
        <Text className="text-base text-gray-800 mb-2">{field.label}</Text>
        <View className="flex-row">
          {options.map((option) => {
            const isSelected = values[index] === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`flex-1 p-3 rounded-lg mr-2 last:mr-0 ${
                  isSelected ? "bg-green-500" : "bg-gray-200"
                }`}
                onPress={() => handleOptionSelect(index, option.value)}
              >
                <Text
                  className={`text-center font-semibold ${
                    isSelected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSelectField = (field: CalculationField, index: number) => {
    const options = field.options || [];
    return (
      <View key={index} className="mb-4">
        <Text className="text-base text-gray-800 mb-2">{field.label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map((option) => {
            const isSelected = values[index] === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`rounded-full px-4 py-2 mr-2 ${
                  isSelected ? "bg-green-500" : "bg-gray-200"
                }`}
                onPress={() => handleOptionSelect(index, option.value)}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderNumericField = (field: CalculationField, index: number) => {
    return (
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
            value={inputTexts[index]}
            onChangeText={(text) => handleInputChange(text, index)}
          />
          <Text className="ml-2 text-gray-800">{field.unit}</Text>
        </View>
      </View>
    );
  };

  const renderField = (field: CalculationField, index: number) => {
    switch (field.fieldType) {
      case "radio":
        return renderRadioField(field, index);
      case "select":
        return renderSelectField(field, index);
      default:
        return renderNumericField(field, index);
    }
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
        {presets && presets.length > 0 && presetFieldMapping && (
          <PresetPicker presets={presets} onSelect={handlePresetSelect} />
        )}

        {fields.map((field, index) => renderField(field, index))}

        <TouchableOpacity
          className="bg-green-500 p-3 rounded-lg mt-2"
          onPress={handleCalculate}
        >
          <Text className="text-white text-center font-bold text-base">
            {t("common.calculate")}
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

        {results.length > 0 && (
          <TouchableOpacity
            className="border border-green-500 p-3 rounded-lg mt-3 flex-row items-center justify-center"
            onPress={handleShare}
          >
            <Text className="text-green-600 text-center font-semibold">
              📤 {t("common.share")}
            </Text>
          </TouchableOpacity>
        )}

        <View className="items-center my-3">
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.BANNER}
          />
        </View>

        {/* 닫기 버튼 */}
        <TouchableOpacity
          className="border border-gray-300 p-3 rounded-lg mt-4 mb-4"
          onPress={onBack}
        >
          <Text className="text-gray-800 text-center">{t("common.reset")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CalculationCard;
