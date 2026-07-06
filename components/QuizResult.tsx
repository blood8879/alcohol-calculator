import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Card from "./ui/Card";

type QuizResultProps = {
  score: number;
  total: number;
  percentage: number;
  onRetry: () => void;
  onShare: () => void;
  streak?: number;
  onOpenGuide?: () => void;
  onOpenTracker?: () => void;
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
  streak,
  onOpenGuide,
  onOpenTracker,
}: QuizResultProps) => {
  const { t, i18n } = useTranslation();

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

      {typeof streak === "number" && streak > 0 && (
        <Card className="w-full mb-3">
          <Text className="text-white text-base font-bold text-center">
            {i18n.language.startsWith("ko")
              ? `${streak}일 연속 퀴즈 완료`
              : `${streak}-day quiz streak`}
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-1">
            {i18n.language.startsWith("ko")
              ? "기록을 함께 남기면 주간 인사이트가 더 정확해집니다."
              : "Pair this with drink logs for better weekly insights."}
          </Text>
        </Card>
      )}

      <TouchableOpacity
        className="bg-green-600 rounded-xl py-4 px-8 w-full items-center mb-3"
        onPress={onRetry}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          i18n.language.startsWith("ko")
            ? "광고 보고 다시 도전"
            : "Watch ad to try again"
        }
      >
        <View className="flex-row items-center">
          <Ionicons name="play-circle-outline" size={20} color="#fff" />
          <Text className="text-white text-base font-bold ml-2">
            {i18n.language.startsWith("ko")
              ? "광고 보고 다시 도전"
              : "Watch ad to try again"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-green-600 rounded-xl py-4 px-8 w-full items-center"
        onPress={onShare}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("quiz.shareScore")}
      >
        <View className="flex-row items-center">
          <Ionicons name="share-outline" size={20} color="#22C55E" />
          <Text className="text-green-500 text-base font-bold ml-2">
            {t("quiz.shareScore")}
          </Text>
        </View>
      </TouchableOpacity>

      {onOpenGuide && (
        <TouchableOpacity
          className="border border-gray-600 rounded-xl py-4 px-8 w-full items-center mt-3"
          onPress={onOpenGuide}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            i18n.language.startsWith("ko") ? "관련 가이드 보기" : "Open related guide"
          }
        >
          <Text className="text-gray-200 text-base font-bold">
            {i18n.language.startsWith("ko") ? "관련 가이드 보기" : "Open related guide"}
          </Text>
        </TouchableOpacity>
      )}

      {onOpenTracker && (
        <TouchableOpacity
          className="border border-gray-600 rounded-xl py-4 px-8 w-full items-center mt-3"
          onPress={onOpenTracker}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            i18n.language.startsWith("ko") ? "트래커 인사이트 보기" : "Open tracker insights"
          }
        >
          <Text className="text-gray-200 text-base font-bold">
            {i18n.language.startsWith("ko") ? "트래커 인사이트 보기" : "Open tracker insights"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default QuizResult;
