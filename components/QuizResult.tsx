import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

type QuizResultProps = {
  score: number;
  total: number;
  percentage: number;
  onRetry: () => void;
  onShare: () => void;
};

const getEmoji = (percentage: number): string => {
  if (percentage >= 80) return "\uD83C\uDFC6";
  if (percentage >= 60) return "\uD83C\uDF89";
  if (percentage >= 40) return "\uD83D\uDCDA";
  return "\uD83D\uDCAA";
};

const getScoreColor = (percentage: number): string => {
  if (percentage > 70) return "text-green-400";
  if (percentage > 40) return "text-yellow-400";
  return "text-red-400";
};

const QuizResult = ({
  score,
  total,
  percentage,
  onRetry,
  onShare,
}: QuizResultProps) => {
  const { t } = useTranslation();

  const getMessage = (): string => {
    if (percentage >= 80) return t("quiz.resultExcellent");
    if (percentage >= 60) return t("quiz.resultGood");
    if (percentage >= 40) return t("quiz.resultAverage");
    return t("quiz.resultKeepTrying");
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-8xl mb-6">{getEmoji(percentage)}</Text>

      <Text className="text-6xl font-bold text-white mb-2">
        {score}/{total}
      </Text>

      <Text className={`text-3xl font-bold mb-4 ${getScoreColor(percentage)}`}>
        {percentage}%
      </Text>

      <Text className="text-gray-400 text-base text-center mb-10 leading-6">
        {getMessage()}
      </Text>

      <TouchableOpacity
        className="bg-green-600 rounded-xl py-4 px-8 w-full items-center mb-3"
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text className="text-white text-base font-bold ml-2">
            {t("quiz.tryAgain")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-green-600 rounded-xl py-4 px-8 w-full items-center"
        onPress={onShare}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <Ionicons name="share-outline" size={20} color="#22C55E" />
          <Text className="text-green-500 text-base font-bold ml-2">
            {t("quiz.shareScore")}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default QuizResult;
