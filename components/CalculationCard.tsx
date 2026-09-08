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
import { logCalculatorUsed } from "../utils/analytics";
import PresetPicker from "./PresetPicker";
import { getCalculatorGuide } from "../data/calculatorGuides";
import { pickLocalizedText } from "../utils/localizedText";

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

type RecommendationTarget = "recipes" | "encyclopedia" | "tracker";

type ContentRecommendation = {
  emoji: string;
  title: string;
  description: string;
  action: string;
  target: RecommendationTarget;
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
  onRecommendationPress?: (target: RecommendationTarget) => void;
};

const getRecommendation = (
  calculatorType: string | undefined,
  isKorean: boolean
): ContentRecommendation => {
  if (calculatorType === "calorie") {
    return {
      emoji: "🔥",
      title: isKorean ? "칼로리가 낮은 술 고르기" : "Choose lower-calorie drinks",
      description: isKorean ? "계산한 칼로리를 바탕으로 가벼운 조합과 관련 상식을 확인해보세요." : "Use your result to explore lighter drink choices and practical tips.",
      action: isKorean ? "백과 보기" : "Open encyclopedia",
      target: "encyclopedia",
    };
  }

  if (calculatorType === "bac") {
    return {
      emoji: "📊",
      title: isKorean ? "이번 주 음주 기록 확인" : "Review your weekly drinking pattern",
      description: isKorean ? "BAC는 참고용입니다. 기록을 남기면 주간 잔 수와 칼로리를 함께 볼 수 있습니다." : "BAC is an estimate. Logging drinks helps track weekly drinks and calories.",
      action: isKorean ? "기록 보기" : "View tracker",
      target: "tracker",
    };
  }

  if (calculatorType === "blending" || calculatorType === "dilution") {
    return {
      emoji: "🍹",
      title: isKorean ? "이 도수로 만들 수 있는 레시피" : "Recipes for this style",
      description: isKorean ? "도수 조정 결과를 레시피와 연결해 실제로 만들어볼 조합을 찾아보세요." : "Turn your calculation into a practical drink idea.",
      action: isKorean ? "레시피 보기" : "View recipes",
      target: "recipes",
    };
  }

  return {
    emoji: "📚",
    title: isKorean ? "계산 결과를 더 잘 이해하기" : "Understand your result better",
    description: isKorean ? "도수, 표준잔, 온도, 페어링 같은 관련 정보를 이어서 확인해보세요." : "Continue with ABV, standard drink, temperature, and pairing guides.",
    action: isKorean ? "백과 보기" : "Open encyclopedia",
    target: "encyclopedia",
  };
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
  onRecommendationPress,
}: CalculationCardProps) => {
  const { t, i18n } = useTranslation();
  const [values, setValues] = useState<number[]>(Array(fields.length).fill(0));
  const [inputTexts, setInputTexts] = useState<string[]>(
    Array(fields.length).fill("")
  );
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    []
  );
  const recommendation = getRecommendation(calculatorType, i18n.language.startsWith("ko"));
  const guide = getCalculatorGuide(calculatorType);
  const isKorean = i18n.language.startsWith("ko");
  const [guideOpen, setGuideOpen] = useState(false);

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

    if (calculatorType && calculatedResults.length > 0) {
      logCalculatorUsed(calculatorType);
    }

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
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
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
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
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
        {guide && (
          <View className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setGuideOpen((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isKorean ? "이 계산기는 무엇인가요?" : "What is this calculator?"}
              accessibilityState={{ expanded: guideOpen }}
            >
              <Text className="text-blue-900 font-semibold text-sm">
                {isKorean ? "ℹ️ 이 계산기는 무엇인가요?" : "ℹ️ What is this calculator?"}
              </Text>
              <Text className="text-blue-400 text-base">{guideOpen ? "▾" : "▸"}</Text>
            </TouchableOpacity>
            <Text className="text-gray-700 text-sm leading-5 mt-2">
              {pickLocalizedText(guide.what, i18n.language)}
            </Text>
            {guideOpen && (
              <View className="mt-3">
                <Text className="text-blue-900 font-semibold text-xs mb-1">
                  {isKorean ? "언제 쓰나요" : "When to use"}
                </Text>
                <Text className="text-gray-700 text-sm leading-5 mb-3">
                  {pickLocalizedText(guide.when, i18n.language)}
                </Text>
                <Text className="text-blue-900 font-semibold text-xs mb-1">
                  {isKorean ? "어떻게 계산하나요" : "How it works"}
                </Text>
                <Text className="text-gray-700 text-sm leading-5">
                  {pickLocalizedText(guide.formula, i18n.language)}
                </Text>
              </View>
            )}
          </View>
        )}
        {presets && presets.length > 0 && presetFieldMapping && (
          <PresetPicker presets={presets} onSelect={handlePresetSelect} />
        )}

        {fields.map((field, index) => renderField(field, index))}

        <TouchableOpacity
          className="bg-green-500 p-3 rounded-lg mt-2"
          onPress={handleCalculate}
          accessibilityRole="button"
          accessibilityLabel={t("common.calculate")}
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
            accessibilityRole="button"
            accessibilityLabel={t("common.share")}
          >
            <Text className="text-green-600 text-center font-semibold">
              📤 {t("common.share")}
            </Text>
          </TouchableOpacity>
        )}

        {results.length > 0 && onRecommendationPress && (
          <TouchableOpacity
            className="bg-green-50 border border-green-200 p-4 rounded-xl mt-3"
            onPress={() => onRecommendationPress(recommendation.target)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${recommendation.title} - ${recommendation.action}`}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{recommendation.emoji}</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base">
                  {recommendation.title}
                </Text>
                <Text className="text-gray-600 text-sm mt-1 leading-5">
                  {recommendation.description}
                </Text>
                <Text className="text-green-700 font-semibold text-sm mt-2">
                  {recommendation.action} ›
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}


        {/* 닫기 버튼 */}
        <TouchableOpacity
          className="border border-gray-300 p-3 rounded-lg mt-4 mb-4"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t("common.reset")}
        >
          <Text className="text-gray-800 text-center">{t("common.reset")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CalculationCard;
