import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { QuizCategory, QuizQuestion } from "../../data/types";
import { quizQuestions } from "../../data/quizData";
import { quizCategories } from "../../data/quizCategories";
import { pickLocalizedText } from "../../utils/localizedText";
import {
  getRandomQuestions,
  calculateScore,
  formatShareableScore,
} from "../../utils/quizUtils";
import {
  getDailyQuizQuestionIds,
} from "../../utils/engagement/todayHub";
import {
  createEmptyQuizProgress,
  recordQuizCompletion,
  QuizProgress,
} from "../../utils/engagement/quizProgress";
import {
  getQuizProgress,
  setQuizProgress,
} from "../../utils/engagement/quizProgressStorage";
import Card from "../../components/ui/Card";
import QuizQuestionCard from "../../components/QuizQuestion";
import QuizResult from "../../components/QuizResult";
import { adUnits } from "../../utils/adUnits";
import {
  recordInterstitialShown,
  shouldShowInterstitial,
} from "../../utils/adFrequency";
import { useRewardedAd } from "../../hooks/useRewardedAd";
import { useInterstitialAd } from "../../hooks/useInterstitialAd";

type QuizState = "idle" | "playing" | "results";
type ProgressCategory = Exclude<QuizCategory, "all">;

export default function QuizScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>("all");
  const [activeProgressCategory, setActiveProgressCategory] =
    useState<ProgressCategory>("basics");
  const [activeQuizId, setActiveQuizId] = useState("standard");
  const [activeIsDaily, setActiveIsDaily] = useState(false);
  const [progress, setProgress] = useState<QuizProgress>(() =>
    createEmptyQuizProgress()
  );

  // 완료 후 전면광고: 닫히면 결과 화면으로 진행한다.
  const {
    loaded: adLoaded,
    show: showInterstitial,
    reload: reloadInterstitial,
  } = useInterstitialAd(adUnits.quizInterstitial, {
    onClosed: () => setQuizState("results"),
  });

  useEffect(() => {
    getQuizProgress().then(setProgress);
  }, []);

  const startQuestionSet = useCallback(
    (
      nextQuestions: QuizQuestion[],
      category: ProgressCategory,
      quizId: string,
      isDaily: boolean
    ) => {
      setQuestions(nextQuestions);
      setCurrentIndex(0);
      setUserAnswers([]);
      setActiveProgressCategory(category);
      setActiveQuizId(quizId);
      setActiveIsDaily(isDaily);
      setQuizState("playing");
    },
    []
  );

  const startQuiz = useCallback(() => {
    const category = quizCategories.find((item) => item.key === selectedCategory);
    const questionPool = category?.questionIds
      ? quizQuestions.filter((question) => category.questionIds?.includes(question.id))
      : quizQuestions;
    const randomQuestions = getRandomQuestions(questionPool, 10);
    const progressCategory = selectedCategory === "all" ? "basics" : selectedCategory;
    startQuestionSet(randomQuestions, progressCategory, `standard-${selectedCategory}`, false);
  }, [selectedCategory, startQuestionSet]);

  const startDailyQuiz = useCallback(() => {
    const dailyIds = getDailyQuizQuestionIds(
      new Date(),
      quizQuestions.map((question) => question.id),
      5
    );
    const dailyQuestions = dailyIds
      .map((id) => quizQuestions.find((question) => question.id === id))
      .filter((question): question is QuizQuestion => Boolean(question));
    startQuestionSet(dailyQuestions, "basics", `daily-${dailyIds.join("-")}`, true);
  }, [startQuestionSet]);

  const completeQuiz = useCallback(
    async (answers: number[]) => {
      const { score, total } = calculateScore(answers, questions);
      const nextProgress = recordQuizCompletion({
        category: activeProgressCategory,
        date: new Date(),
        isDaily: activeIsDaily,
        progress,
        quizId: activeQuizId,
        score,
        total,
      });
      setProgress(nextProgress);
      await setQuizProgress(nextProgress);
    },
    [activeIsDaily, activeProgressCategory, activeQuizId, progress, questions]
  );

  const handleAnswer = useCallback(
    async (selectedIndex: number) => {
      const newAnswers = [...userAnswers, selectedIndex];
      setUserAnswers(newAnswers);

      if (currentIndex + 1 >= questions.length) {
        void completeQuiz(newAnswers);
        // 광고가 준비됐고 빈도 캡에 걸리지 않을 때만 표시. 그 외엔 바로 결과로.
        const canShow = adLoaded && (await shouldShowInterstitial("quiz"));
        if (canShow && showInterstitial()) {
          void recordInterstitialShown("quiz");
        } else {
          setQuizState("results");
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [userAnswers, currentIndex, questions.length, completeQuiz, adLoaded, showInterstitial]
  );

  const restartQuiz = useCallback(() => {
    reloadInterstitial();
    startQuiz();
  }, [startQuiz, reloadInterstitial]);

  // Opt-in rewarded video: watching it grants a bonus retry.
  const { show: showRewardedRetry } = useRewardedAd(restartQuiz);

  const handleRetry = useCallback(() => {
    showRewardedRetry();
  }, [showRewardedRetry]);

  const handleShare = useCallback(async () => {
    const { score, total } = calculateScore(userAnswers, questions);
    const message = formatShareableScore(score, total, t);
    try {
      await Share.share({ message });
    } catch {
    }
  }, [userAnswers, questions, t]);

  const scoreData = quizState === "results" ? calculateScore(userAnswers, questions) : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center p-4">
        {quizState !== "idle" && (
          <TouchableOpacity
            onPress={() => setQuizState("idle")}
            className="mr-3"
            accessibilityRole="button"
            accessibilityLabel={t("common.back", { defaultValue: "Back" })}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-white">
          {t("quiz.title")}
        </Text>
      </View>

      {quizState === "idle" && (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center pt-8 pb-6">
            <Text className="text-7xl mb-5">{"🧠"}</Text>
            <Text className="text-2xl font-bold text-white mb-3 text-center">
              {t("quiz.title")}
            </Text>
            <Text className="text-base text-gray-400 text-center leading-6">
              {t("quiz.pickTopicSubtitle")}
            </Text>
          </View>

          <Card className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-white text-lg font-bold">
                  {t("quiz.dailyTitle")}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {t("quiz.dailyStreak", { count: progress.currentStreak })}
                </Text>
              </View>
              <Text className="text-3xl">⚡</Text>
            </View>
            <TouchableOpacity
              className="bg-green-600 rounded-xl py-3 px-4 items-center"
              onPress={startDailyQuiz}
              activeOpacity={0.75}
            >
              <Text className="text-white font-bold">
                {t("quiz.dailyStart")}
              </Text>
            </TouchableOpacity>
          </Card>

          <View className="mb-6">
            {quizCategories.map((category) => {
              const isSelected = category.key === selectedCategory;
              return (
                <TouchableOpacity
                  key={category.key}
                  className={`rounded-2xl p-4 mb-3 border ${
                    isSelected ? "bg-green-600 border-green-500" : "bg-gray-800 border-gray-700"
                  }`}
                  onPress={() => setSelectedCategory(category.key)}
                  activeOpacity={0.75}
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{category.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-white text-base font-bold">
                        {pickLocalizedText(category.title, i18n.language)}
                      </Text>
                      <Text className={`${isSelected ? "text-green-50" : "text-gray-400"} text-sm mt-1 leading-5`}>
                        {pickLocalizedText(category.description, i18n.language)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 px-10 items-center mb-6"
            onPress={startQuiz}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg font-bold">
              {t("quiz.start")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {quizState === "playing" && questions.length > 0 && (
        <View className="flex-1 px-4">
          <QuizQuestionCard
            key={questions[currentIndex].id}
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        </View>
      )}

      {quizState === "results" && scoreData && (
        <QuizResult
          score={scoreData.score}
          total={scoreData.total}
          percentage={scoreData.percentage}
          onRetry={handleRetry}
          onShare={handleShare}
          streak={progress.currentStreak}
          onOpenGuide={() => router.push("/(tabs)/explore?section=encyclopedia&guide=standard-drink")}
          onOpenTracker={() => router.push("/(tabs)/tracker")}
        />
      )}
    </SafeAreaView>
  );
}
