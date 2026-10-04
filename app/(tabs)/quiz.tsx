import React, { useState, useCallback, useEffect, useRef } from "react";
import { ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
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
  buildQuizWeekDots,
  createEmptyQuizProgress,
  getActiveQuizStreak,
  isDailyQuizDoneToday,
  recordQuizCompletion,
  QuizProgress,
} from "../../utils/engagement/quizProgress";
import {
  getQuizProgress,
  setQuizProgress,
} from "../../utils/engagement/quizProgressStorage";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import QuizQuestionCard from "../../components/QuizQuestion";
import QuizResult from "../../components/QuizResult";
import { adUnits } from "../../utils/adUnits";
import {
  recordInterstitialShown,
  shouldShowInterstitial,
} from "../../utils/adFrequency";
import { useRewardedAd } from "../../hooks/useRewardedAd";
import { useInterstitialAd } from "../../hooks/useInterstitialAd";
import {
  logQuizCompleted,
  logQuizStarted,
} from "../../utils/analytics";
import { createQuizAnalytics, trackEngagement } from "../../utils/engagementAnalytics";

type QuizState = "idle" | "playing" | "results";
type ProgressCategory = Exclude<QuizCategory, "all">;

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

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
  const quizAnalytics = useRef(createQuizAnalytics());

  useFocusEffect(useCallback(() => () => {
    quizAnalytics.current.abandon("navigation");
  }, []));

  // 완료 후 전면광고: 닫히면 결과 화면으로 진행한다.
  const {
    loaded: adLoaded,
    show: showInterstitial,
    reload: reloadInterstitial,
  } = useInterstitialAd(adUnits.quizInterstitial, {
    placement: "quiz",
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
      quizAnalytics.current.start(isDaily ? "daily" : "standard", isDaily ? "all" : selectedCategory, nextQuestions.length);
    },
    [selectedCategory]
  );

  const startQuiz = useCallback(() => {
    const category = quizCategories.find((item) => item.key === selectedCategory);
    const questionPool = category?.questionIds
      ? quizQuestions.filter((question) => category.questionIds?.includes(question.id))
      : quizQuestions;
    const randomQuestions = getRandomQuestions(questionPool, 10);
    const progressCategory = selectedCategory === "all" ? "basics" : selectedCategory;
    logQuizStarted(selectedCategory, "standard");
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
    logQuizStarted("all", "daily");
    startQuestionSet(dailyQuestions, "basics", `daily-${dailyIds.join("-")}`, true);
  }, [startQuestionSet]);

  const completeQuiz = useCallback(
    async (answers: number[]) => {
      const { score, total } = calculateScore(answers, questions);
      logQuizCompleted({
        category: activeIsDaily ? "all" : selectedCategory,
        mode: activeIsDaily ? "daily" : "standard",
        score,
        total,
      });
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
    [
      activeIsDaily,
      activeProgressCategory,
      activeQuizId,
      progress,
      questions,
      selectedCategory,
    ]
  );

  const handleAnswer = useCallback(
    async (selectedIndex: number) => {
      const question = questions[currentIndex];
      if (!question) return;
      quizAnalytics.current.answer(question.id, currentIndex, selectedIndex === question.correctIndex);
      const newAnswers = [...userAnswers, selectedIndex];
      setUserAnswers(newAnswers);

      if (currentIndex + 1 >= questions.length) {
        quizAnalytics.current.complete();
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
    quizAnalytics.current.restart();
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
      const result = await Share.share({ message });
      trackEngagement("quiz_share_result", { outcome: result.action === Share.sharedAction ? "shared" : "dismissed" });
    } catch {
      trackEngagement("quiz_share_result", { outcome: "failed" });
    }
  }, [userAnswers, questions, t]);

  const scoreData = quizState === "results" ? calculateScore(userAnswers, questions) : null;

  // 로컬 날짜 기준 표시값. 화면 진입/결과 저장마다 progress가 바뀌며 다시 계산된다.
  const now = new Date();
  const activeStreak = getActiveQuizStreak(progress, now);
  const dailyDoneToday = isDailyQuizDoneToday(progress, now);
  const weekDots = buildQuizWeekDots(progress, now);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4">
        {quizState !== "idle" && (
          <TouchableOpacity
            onPress={() => {
              quizAnalytics.current.abandon("back");
              setQuizState("idle");
            }}
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
        <View className="flex-1">
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-textSecondary text-sm leading-5 mb-4" numberOfLines={2}>
              {t("quiz.pickTopicSubtitle")}
            </Text>

            <Card className="mb-6">
              <Text className="text-textSecondary text-sm font-semibold">
                {t("quiz.dailyTitle")}
              </Text>
              {activeStreak > 0 ? (
                <View
                  className="flex-row items-end mt-1"
                  accessible
                  accessibilityLabel={t("quiz.dailyStreak", { count: activeStreak })}
                >
                  <Text className="text-textPrimary text-5xl font-bold">{activeStreak}</Text>
                  <Text className="text-3xl ml-1 mb-1">{"⚡"}</Text>
                  <Text className="text-textSecondary text-base font-semibold ml-2 mb-2">
                    {t("quiz.streakDaysLabel")}
                  </Text>
                </View>
              ) : (
                <Text className="text-textPrimary text-lg font-bold mt-1">
                  {t("quiz.streakEmpty")}
                </Text>
              )}

              <View
                className="flex-row justify-between mt-4"
                accessible
                accessibilityLabel={t("quiz.weekDotsA11y", {
                  count: weekDots.filter((dot) => dot.covered).length,
                })}
              >
                {weekDots.map((dot) => (
                  <View key={dot.dateKey} className="items-center">
                    <Text
                      className={`text-xs mb-1.5 ${
                        dot.isToday ? "text-accentSoft font-bold" : "text-textMuted"
                      }`}
                    >
                      {t(`time.${WEEKDAY_KEYS[dot.weekday]}`)}
                    </Text>
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        dot.covered ? "bg-accentDeep" : "bg-surfaceDeep"
                      } ${dot.isToday ? "border-2 border-accentSoft" : ""} ${
                        dot.isFuture ? "opacity-50" : ""
                      }`}
                    >
                      {dot.covered ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                className={`rounded-xl min-h-[52px] px-4 mt-4 items-center justify-center ${
                  dailyDoneToday
                    ? "border border-surfaceDeep"
                    : "bg-accentDeep/15 border border-accent"
                }`}
                onPress={startDailyQuiz}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={dailyDoneToday ? t("quiz.dailyDone") : t("quiz.dailyStart")}
              >
                <Text
                  className={`text-base font-bold ${
                    dailyDoneToday ? "text-textSecondary" : "text-accentSoft"
                  }`}
                >
                  {dailyDoneToday ? t("quiz.dailyDone") : t("quiz.dailyStart")}
                </Text>
              </TouchableOpacity>
            </Card>

            <SectionHeader title={t("quiz.chooseTopic")} />
            {quizCategories.map((category) => {
              const isSelected = category.key === selectedCategory;
              const stats = category.key === "all" ? undefined : progress.categoryStats[category.key];
              const title = pickLocalizedText(category.title, i18n.language);
              return (
                <TouchableOpacity
                  key={category.key}
                  className={`rounded-xl p-4 mb-3 border ${
                    isSelected ? "bg-accentDeep/10 border-accent" : "bg-surface border-surfaceDeep"
                  }`}
                  onPress={() => {
                    setSelectedCategory(category.key);
                    trackEngagement("quiz_category_selected", { category: category.key });
                  }}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityLabel={title}
                  accessibilityState={{ selected: isSelected, checked: isSelected }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{category.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-textPrimary text-base font-bold">{title}</Text>
                      <Text className="text-textSecondary text-sm mt-1 leading-5" numberOfLines={2}>
                        {pickLocalizedText(category.description, i18n.language)}
                      </Text>
                    </View>
                    <View className="items-end ml-3">
                      {stats && stats.totalQuestions > 0 ? (
                        <View className="bg-surfaceDeep rounded-full px-2 py-0.5">
                          <Text className="text-textSecondary text-xs font-semibold">
                            {t("quiz.bestBadge", {
                              best: stats.bestScore,
                              total: stats.totalQuestions,
                            })}
                          </Text>
                        </View>
                      ) : null}
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#4ade80"
                          style={{ marginTop: stats ? 6 : 0 }}
                        />
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 하단 고정 CTA — 카테고리 선택 후 스크롤 없이 바로 시작(Brilliant 패턴). */}
          <View className="px-5 pt-3 pb-3 bg-background border-t border-surfaceDeep">
            <TouchableOpacity
              className="bg-accentButton rounded-xl min-h-[52px] items-center justify-center"
              onPress={startQuiz}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("quiz.start")}
            >
              <Text className="text-white text-lg font-bold">
                {t("quiz.start")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
          streak={activeStreak}
          questions={questions}
          answers={userAnswers}
          onOpenGuide={() => router.push("/(tabs)/explore?section=encyclopedia&guide=standard-drink")}
          onOpenTracker={() => router.push("/(tabs)/tracker")}
        />
      )}
    </SafeAreaView>
  );
}
