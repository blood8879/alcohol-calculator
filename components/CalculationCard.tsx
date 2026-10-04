import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DrinkPreset } from "../data/types";
import { shareResults } from "../utils/shareUtils";
import { saveCalculation } from "../utils/historyStorage";
import type { CalculatorType } from "../utils/analytics";
import { isSuccessfulCalculation, logCalculatorAttempt, logCalculatorFirstInput, logCalculatorGuideOpened, logCalculatorOutcome, logCalculatorPreset, logCalculatorRecommendation, logCalculatorShare } from "../utils/calculatorAnalytics";
import PresetPicker from "./PresetPicker";
import { getCalculatorGuide } from "../data/calculatorGuides";
import { pickLocalizedText } from "../utils/localizedText";
import { computeRevealScrollOffset } from "../utils/keyboardReveal";
import { FONT_SCALE_CAP } from "../utils/fontScale";

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
  calculatorType?: CalculatorType;
  calculatorIcon?: string;
  onRecommendationPress?: (target: RecommendationTarget) => void;
  onSuccessfulResult?: () => void;
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
  onSuccessfulResult,
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
  const inputTracked = useRef(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Android 키보드 회피(실기기 이슈 3): 실기기(Galaxy S20+, Android 13)에서 모달 창은 키보드만큼 리사이즈된다.
  // 그래서 여백을 더하면 이중으로 밀려 버튼이 화면 밖으로 사라졌다 → 여백 없이, 리사이즈로 줄어든
  // 뷰포트 안에 [계산하기]가 들어오도록 스크롤만 맞춘다. iOS는 기존 KeyboardAvoidingView(padding)만 쓴다.
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const calculateButtonLayoutRef = useRef<{ y: number; height: number } | null>(null);
  const pendingRevealRef = useRef(false);

  const revealCalculateButton = useCallback(() => {
    const button = calculateButtonLayoutRef.current;
    if (!button) return;
    const offset = computeRevealScrollOffset({
      targetY: button.y,
      targetHeight: button.height,
      viewportHeight: viewportHeightRef.current,
      currentOffset: scrollOffsetRef.current,
    });
    if (offset !== null) scrollRef.current?.scrollTo({ y: offset, animated: true });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      // 리사이즈 후 onLayout에서 맞추고, 레이아웃이 안 바뀐 경우(다른 입력칸 이동 등)를 위해 한 번 더 시도한다.
      pendingRevealRef.current = true;
      setTimeout(revealCalculateButton, 150);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      pendingRevealRef.current = false;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [revealCalculateButton]);

  const trackFirstInput = (index: number) => {
    if (calculatorType && !inputTracked.current) {
      inputTracked.current = true;
      logCalculatorFirstInput(calculatorType, index);
    }
  };

  const handleInputChange = (text: string, index: number) => {
    trackFirstInput(index);
    const newValues = [...values];
    newValues[index] = Number(text) || 0;
    setValues(newValues);

    const newTexts = [...inputTexts];
    newTexts[index] = text;
    setInputTexts(newTexts);
  };

  const handleOptionSelect = (index: number, optionValue: number) => {
    trackFirstInput(index);
    const newValues = [...values];
    newValues[index] = optionValue;
    setValues(newValues);
  };

  const handlePresetSelect = (preset: DrinkPreset) => {
    if (!presetFieldMapping) return;
    if (calculatorType) logCalculatorPreset(calculatorType, preset.id);
    trackFirstInput(presetFieldMapping.volumeIndex);

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
    if (calculatorType) logCalculatorAttempt(calculatorType);
    const calculatedResults = calculateResult(values);
    setResults(calculatedResults);
    const successful = isSuccessfulCalculation(calculatedResults, t("common.error"));

    if (calculatorType) logCalculatorOutcome(calculatorType, successful);
    if (successful) onSuccessfulResult?.();

    if (calculatorType && calculatorIcon && successful) {
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

  const handleShare = async () => {
    if (calculatorType) logCalculatorShare(calculatorType, "attempted");
    const outcome = await shareResults(title, results, t);
    if (calculatorType) logCalculatorShare(calculatorType, outcome);
  };

  // 세그먼트 컨트롤(BAC 성별 등): 다크 surface 트랙 + 선택 시 accentButton
  const renderRadioField = (field: CalculationField, index: number) => {
    const options = field.options || [];
    return (
      <View key={index} className="mb-4">
        <Text className="text-sm text-textSecondary mb-2">{field.label}</Text>
        <View className="flex-row bg-surface rounded-xl p-1" accessibilityRole="radiogroup">
          {options.map((option, optionIndex) => {
            const isSelected = values[index] === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`flex-1 min-h-[44px] items-center justify-center rounded-lg ${
                  optionIndex > 0 ? "ml-1" : ""
                } ${isSelected ? "bg-accentButton" : ""}`}
                onPress={() => handleOptionSelect(index, option.value)}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={`text-center font-semibold ${
                    isSelected ? "text-textPrimary" : "text-textSecondary"
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

  // 선택 칩(단위 변환 모드 등): 가로 스크롤 칩, 선택 시 accentButton
  const renderSelectField = (field: CalculationField, index: number) => {
    const options = field.options || [];
    return (
      <View key={index} className="mb-4">
        <Text className="text-sm text-textSecondary mb-2">{field.label}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {options.map((option) => {
            const isSelected = values[index] === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`min-h-[44px] justify-center rounded-full px-4 mr-2 border ${
                  isSelected
                    ? "bg-accentButton border-accentButton"
                    : "bg-surface border-surfaceDeep"
                }`}
                onPress={() => handleOptionSelect(index, option.value)}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-textPrimary" : "text-textSecondary"
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

  // 숫자 입력 행(Revolut식): 라벨 좌 / 우측 정렬 값 + 단위. 행 전체 탭 시 입력 포커스.
  const renderNumericRow = (field: CalculationField, index: number, isFirst: boolean) => {
    const isFocused = focusedIndex === index;
    return (
      <React.Fragment key={index}>
        {!isFirst && <View className="h-px bg-surfaceDeep mx-4" />}
        <Pressable
          accessible={false}
          onPress={() => inputRefs.current[index]?.focus()}
          className={`flex-row items-center min-h-[56px] px-4 py-2 rounded-2xl border ${
            isFocused ? "border-accent bg-surfaceDeep/40" : "border-transparent"
          }`}
        >
          <Text className="text-base text-textSecondary flex-1 mr-3">
            {field.label}
          </Text>
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className="text-xl font-semibold text-textPrimary text-right min-w-[96px] max-w-[160px] py-1"
            placeholder={field.placeholder}
            placeholderTextColor="#8b93a1"
            selectionColor="#22c55e"
            keyboardType="numeric"
            selectTextOnFocus
            value={inputTexts[index]}
            onChangeText={(text) => handleInputChange(text, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
            accessibilityLabel={field.unit ? `${field.label} (${field.unit})` : field.label}
          />
          {field.unit ? (
            <Text className="ml-2 text-base text-textSecondary">{field.unit}</Text>
          ) : null}
        </Pressable>
      </React.Fragment>
    );
  };

  // 연속된 숫자 필드는 하나의 surface 그룹 카드로 묶고, 라디오/선택 필드는 단독 렌더.
  const renderFields = () => {
    const nodes: React.ReactNode[] = [];
    let group: { field: CalculationField; index: number }[] = [];

    const flushGroup = () => {
      if (group.length === 0) return;
      const groupKey = `numeric-group-${group[0].index}`;
      nodes.push(
        <View key={groupKey} className="bg-surface rounded-2xl mb-4">
          {group.map(({ field, index }, i) => renderNumericRow(field, index, i === 0))}
        </View>
      );
      group = [];
    };

    fields.forEach((field, index) => {
      if (field.fieldType === "radio") {
        flushGroup();
        nodes.push(renderRadioField(field, index));
      } else if (field.fieldType === "select") {
        flushGroup();
        nodes.push(renderSelectField(field, index));
      } else {
        group.push({ field, index });
      }
    });
    flushGroup();
    return nodes;
  };

  const errorLabel = t("common.error");
  const errorResults = results.filter((result) => result.label === errorLabel);
  const [heroResult, ...secondaryResults] = results;

  // 결과 블록(PayPal식 위계): 첫 결과 = 주인공 숫자, 나머지는 보조 행. 값 문자열은 그대로 표시.
  const renderResults = () => {
    if (results.length === 0) return null;

    if (errorResults.length > 0) {
      return (
        <View
          className="mt-5 bg-surface border border-danger rounded-2xl p-4"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {errorResults.map((result, index) => (
            <View
              key={index}
              className={`flex-row items-start ${index > 0 ? "mt-3" : ""}`}
            >
              <Ionicons
                name="alert-circle"
                size={22}
                color="#ef4444"
                style={{ marginRight: 8, marginTop: 1 }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-danger mb-1">
                  {result.label}
                </Text>
                <Text className="text-base text-danger leading-6">
                  {result.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View className="mt-5 bg-surface rounded-2xl p-4">
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="summary"
          accessible
          accessibilityLabel={`${heroResult.label} ${heroResult.value}`}
        >
          <Text className="text-sm text-textSecondary mb-1">{heroResult.label}</Text>
          {/* 값이 문장형일 수 있어 줄바꿈은 허용하고 확대 상한만 둔다(§4.7). */}
          <Text
            className="text-4xl font-bold text-accentSoft flex-wrap"
            maxFontSizeMultiplier={FONT_SCALE_CAP.display}
          >
            {heroResult.value}
          </Text>
        </View>
        {secondaryResults.map((result, index) => {
          // 참고 문구처럼 긴 값은 라벨 아래로 쌓고, 짧은 수치는 라벨 좌·값 우 행으로.
          const stacked = result.value.length > 24;
          return (
            <View key={index} className="border-t border-surfaceDeep mt-3 pt-3">
              {stacked ? (
                <>
                  <Text className="text-sm text-textSecondary mb-1">{result.label}</Text>
                  <Text className="text-sm text-textPrimary leading-5">{result.value}</Text>
                </>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-textSecondary flex-1 mr-3">
                    {result.label}
                  </Text>
                  <Text className="text-base font-semibold text-textPrimary text-right flex-shrink">
                    {result.value}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="bg-background flex-shrink"
    >
      {/* 바텀시트 그랩 핸들 */}
      <View className="items-center pt-3 pb-4">
        <View className="w-10 h-1 bg-surfaceDeep rounded-full" />
      </View>

      {/* 헤더 */}
      <View className="px-4 pb-4">
        <Text className="text-2xl font-bold text-textPrimary">{title}</Text>
        <Text className="text-sm text-textSecondary mt-1">{description}</Text>
      </View>

      {/* 계산 영역 */}
      <ScrollView
        ref={scrollRef}
        className="px-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={32}
        onScroll={(event) => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        onLayout={(event) => {
          viewportHeightRef.current = event.nativeEvent.layout.height;
          if (pendingRevealRef.current) {
            pendingRevealRef.current = false;
            revealCalculateButton();
          }
        }}
      >
        {guide && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between min-h-[44px]"
              onPress={() => { if (!guideOpen && calculatorType) logCalculatorGuideOpened(calculatorType); setGuideOpen((prev) => !prev); }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isKorean ? "이 계산기는 무엇인가요?" : "What is this calculator?"}
              accessibilityState={{ expanded: guideOpen }}
            >
              <Text className="text-accentSoft font-semibold text-sm flex-1 mr-2">
                {isKorean ? "ℹ️ 이 계산기는 무엇인가요?" : "ℹ️ What is this calculator?"}
              </Text>
              <Ionicons
                name={guideOpen ? "chevron-down" : "chevron-forward"}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>
            <Text className="text-textSecondary text-sm leading-5">
              {pickLocalizedText(guide.what, i18n.language)}
            </Text>
            {guideOpen && (
              <View className="mt-3 pt-3 border-t border-surfaceDeep">
                <Text className="text-accentSoft font-semibold text-xs mb-1">
                  {isKorean ? "언제 쓰나요" : "When to use"}
                </Text>
                <Text className="text-textSecondary text-sm leading-5 mb-3">
                  {pickLocalizedText(guide.when, i18n.language)}
                </Text>
                <Text className="text-accentSoft font-semibold text-xs mb-1">
                  {isKorean ? "어떻게 계산하나요" : "How it works"}
                </Text>
                <Text className="text-textSecondary text-sm leading-5">
                  {pickLocalizedText(guide.formula, i18n.language)}
                </Text>
              </View>
            )}
          </View>
        )}
        {presets && presets.length > 0 && presetFieldMapping && (
          <PresetPicker presets={presets} onSelect={handlePresetSelect} />
        )}

        {renderFields()}

        <TouchableOpacity
          className="bg-accentButton min-h-[52px] rounded-2xl items-center justify-center mt-1"
          onPress={handleCalculate}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            calculateButtonLayoutRef.current = { y, height };
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("common.calculate")}
        >
          <Text className="text-textPrimary text-center font-bold text-base">
            {t("common.calculate")}
          </Text>
        </TouchableOpacity>

        {renderResults()}

        {results.length > 0 && (
          <TouchableOpacity
            className="border border-surfaceDeep min-h-[48px] rounded-2xl mt-3 flex-row items-center justify-center"
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("common.share")}
          >
            <Text className="text-accentSoft text-center font-semibold">
              📤 {t("common.share")}
            </Text>
          </TouchableOpacity>
        )}

        {results.length > 0 && onRecommendationPress && (
          <TouchableOpacity
            className="bg-surface border border-surfaceDeep p-4 rounded-2xl mt-3"
            onPress={() => { if (calculatorType) logCalculatorRecommendation(calculatorType, recommendation.target); onRecommendationPress(recommendation.target); }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${recommendation.title} - ${recommendation.action}`}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{recommendation.emoji}</Text>
              <View className="flex-1">
                <Text className="text-textPrimary font-bold text-base">
                  {recommendation.title}
                </Text>
                <Text className="text-textSecondary text-sm mt-1 leading-5">
                  {recommendation.description}
                </Text>
                <Text className="text-accentSoft font-semibold text-sm mt-2">
                  {recommendation.action} ›
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 닫기 버튼 */}
        <TouchableOpacity
          className="border border-surfaceDeep min-h-[48px] rounded-2xl items-center justify-center mt-4 mb-8"
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("common.reset")}
        >
          <Text className="text-textPrimary text-center font-medium">{t("common.reset")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CalculationCard;
