import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { QuizQuestion } from "../data/types";
import Card from "./ui/Card";
import SectionHeader from "./ui/SectionHeader";

type QuizResultProps = {
  score: number;
  total: number;
  percentage: number;
  onRetry: () => void;
  onShare: () => void;
  streak?: number;
  // 문제 복기용(풀이 중 메모리에만 보관, 저장하지 않음).
  questions?: readonly QuizQuestion[];
  answers?: readonly number[];
  onOpenGuide?: () => void;
  onOpenTracker?: () => void;
};

const getEmoji = (percentage: number): string => {
  if (percentage >= 80) return "🏆";
  if (percentage >= 60) return "🎉";
  if (percentage >= 40) return "📚";
  return "💪";
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
  questions = [],
  answers = [],
  onOpenGuide,
  onOpenTracker,
}: QuizResultProps) => {
  const { t } = useTranslation();

  const getMessage = (): string => {
    if (percentage >= 80) return t("quiz.resultExcellent");
    if (percentage >= 60) return t("quiz.resultGood");
    if (percentage >= 40) return t("quiz.resultAverage");
    return t("quiz.resultKeepTrying");
  };

  const reviewItems = questions
    .map((question, index) => ({ question, answer: answers[index] }))
    .filter((item): item is { question: QuizQuestion; answer: number } =>
      typeof item.answer === "number"
    );

  return (
    <ScrollView
      className="flex-1 px-5"
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center">
        <Text className="text-7xl mb-4">{getEmoji(percentage)}</Text>

        <Text
          className="text-6xl font-bold text-textPrimary mb-1"
          accessibilityLabel={`${score}/${total}`}
        >
          {score}/{total}
        </Text>

        <Text className={`text-3xl font-bold mb-3 ${getScoreColor(percentage)}`}>
          {percentage}%
        </Text>

        <Text className="text-textSecondary text-base text-center mb-6 leading-6">
          {getMessage()}
        </Text>
      </View>

      {typeof streak === "number" && streak > 0 && (
        <Card className="w-full mb-6">
          <Text className="text-textPrimary text-base font-bold text-center">
            {"⚡ "}
            {t("quiz.resultStreak", { count: streak })}
          </Text>
          <Text className="text-textSecondary text-sm text-center mt-1">
            {t("quiz.resultStreakHint")}
          </Text>
        </Card>
      )}

      {/* 버튼 위계: 주 버튼 1개(보상형 재도전) + 보조 외곽선(공유) + 하단 텍스트 링크. */}
      <TouchableOpacity
        className="bg-accentButton rounded-xl min-h-[52px] px-6 w-full items-center justify-center mb-3"
        onPress={onRetry}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("quiz.watchAdRetry")}
      >
        <View className="flex-row items-center">
          <Ionicons name="play-circle-outline" size={20} color="#fff" />
          <Text className="text-white text-base font-bold ml-2">
            {t("quiz.watchAdRetry")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-accentSoft rounded-xl min-h-[48px] px-6 w-full items-center justify-center"
        onPress={onShare}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("quiz.shareScore")}
      >
        <View className="flex-row items-center">
          <Ionicons name="share-outline" size={18} color="#4ade80" />
          <Text className="text-accentSoft text-base font-semibold ml-2">
            {t("quiz.shareScore")}
          </Text>
        </View>
      </TouchableOpacity>

      {reviewItems.length > 0 && (
        <View className="mt-8">
          <SectionHeader title={t("quiz.reviewTitle")} />
          {reviewItems.map(({ question, answer }, index) => {
            const isCorrect = answer === question.correctIndex;
            const userAnswerKey = question.optionKeys[answer];
            const correctAnswerKey = question.optionKeys[question.correctIndex];
            return (
              <View
                key={`${question.id}-${index}`}
                className="bg-surface rounded-card p-3 mb-2 flex-row"
                accessible
                accessibilityLabel={[
                  `${index + 1}. ${isCorrect ? t("quiz.correct") : t("quiz.incorrect")}`,
                  t(question.questionKey),
                  userAnswerKey ? t("quiz.yourAnswer", { answer: t(userAnswerKey) }) : "",
                  !isCorrect && correctAnswerKey
                    ? t("quiz.correctAnswer", { answer: t(correctAnswerKey) })
                    : "",
                ]
                  .filter(Boolean)
                  .join(". ")}
              >
                <View
                  className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
                    isCorrect ? "bg-accentButton" : "bg-red-600"
                  }`}
                >
                  <Ionicons name={isCorrect ? "checkmark" : "close"} size={16} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary text-sm font-semibold leading-5" numberOfLines={2}>
                    {index + 1}. {t(question.questionKey)}
                  </Text>
                  {userAnswerKey ? (
                    <Text
                      className={`text-sm mt-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}
                    >
                      {t("quiz.yourAnswer", { answer: t(userAnswerKey) })}
                    </Text>
                  ) : null}
                  {!isCorrect && correctAnswerKey ? (
                    <Text className="text-green-400 text-sm mt-0.5">
                      {t("quiz.correctAnswer", { answer: t(correctAnswerKey) })}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {(onOpenGuide || onOpenTracker) && (
        <View className="flex-row flex-wrap justify-center mt-6">
          {onOpenGuide && (
            <TouchableOpacity
              className="min-h-[44px] px-3 justify-center"
              onPress={onOpenGuide}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={t("quiz.openGuide")}
            >
              <Text className="text-accentSoft text-sm font-semibold">
                {t("quiz.openGuide")} ›
              </Text>
            </TouchableOpacity>
          )}
          {onOpenTracker && (
            <TouchableOpacity
              className="min-h-[44px] px-3 justify-center"
              onPress={onOpenTracker}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={t("quiz.openTracker")}
            >
              <Text className="text-accentSoft text-sm font-semibold">
                {t("quiz.openTracker")} ›
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default QuizResult;
