import React, { useState } from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { QuizQuestion as QuizQuestionType } from "../data/types";

type QuizQuestionProps = {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number) => void;
};

const optionLabels = ["A", "B", "C", "D"] as const;

const QuizQuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizQuestionProps) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isCorrect = selectedIndex === question.correctIndex;
  const progressPercent = (questionNumber / totalQuestions) * 100;

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      onAnswer(selectedIndex);
    }
  };

  const getOptionStyle = (index: number): string => {
    if (!showFeedback) {
      return "bg-gray-800 border border-gray-700";
    }
    if (index === question.correctIndex) {
      return "bg-green-600/20 border border-green-500";
    }
    if (index === selectedIndex && !isCorrect) {
      return "bg-red-600/20 border border-red-500";
    }
    return "bg-gray-800 border border-gray-700 opacity-50";
  };

  const getOptionTextColor = (index: number): string => {
    if (!showFeedback) return "text-white";
    if (index === question.correctIndex) return "text-green-400";
    if (index === selectedIndex && !isCorrect) return "text-red-400";
    return "text-gray-500";
  };

  const getLabelColor = (index: number): string => {
    if (!showFeedback) return "bg-gray-700";
    if (index === question.correctIndex) return "bg-green-600";
    if (index === selectedIndex && !isCorrect) return "bg-red-600";
    return "bg-gray-700 opacity-50";
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-400 text-sm font-semibold">
            {t("quiz.questionOf")} {questionNumber}/{totalQuestions}
          </Text>
          <Text className="text-green-400 text-sm font-bold">
            {Math.round(progressPercent)}%
          </Text>
        </View>

        <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
          <View
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <Text className="text-white text-xl font-bold mb-6 mt-4 leading-7">
        {t(question.questionKey)}
      </Text>

      {question.optionKeys.map((optionKey, index) => (
        <TouchableOpacity
          key={optionKey}
          className={`${getOptionStyle(index)} rounded-xl p-4 mb-3 flex-row items-center`}
          onPress={() => handleSelect(index)}
          activeOpacity={showFeedback ? 1 : 0.7}
          disabled={showFeedback}
        >
          <View
            className={`${getLabelColor(index)} w-8 h-8 rounded-lg items-center justify-center mr-3`}
          >
            {showFeedback && index === question.correctIndex ? (
              <Ionicons name="checkmark" size={18} color="#fff" />
            ) : showFeedback && index === selectedIndex && !isCorrect ? (
              <Ionicons name="close" size={18} color="#fff" />
            ) : (
              <Text className="text-white text-sm font-bold">
                {optionLabels[index]}
              </Text>
            )}
          </View>
          <Text className={`${getOptionTextColor(index)} text-base flex-1 leading-5`}>
            {t(optionKey)}
          </Text>
        </TouchableOpacity>
      ))}

      {showFeedback && (
        <View className="bg-gray-800 rounded-xl p-4 mt-4 border-l-4 border-blue-500">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#60A5FA" />
            <Text className="text-blue-400 text-sm font-bold ml-2">
              {isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
            </Text>
          </View>
          <Text className="text-gray-300 text-sm leading-5">
            {t(question.explanationKey)}
          </Text>
        </View>
      )}

      {showFeedback && (
        <TouchableOpacity
          className="bg-green-600 rounded-xl py-4 mt-6 items-center"
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text className="text-white text-base font-bold">
            {questionNumber === totalQuestions
              ? t("quiz.seeResults")
              : t("quiz.next")}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default QuizQuestionCard;
