import React, { useState, useCallback, useEffect } from "react";
import { Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { QuizQuestion } from "../../../data/types";
import { quizQuestions } from "../../../data/quizData";
import {
  getRandomQuestions,
  calculateScore,
  formatShareableScore,
} from "../../../utils/quizUtils";
import QuizQuestionCard from "../../../components/QuizQuestion";
import QuizResult from "../../../components/QuizResult";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";

type QuizState = "idle" | "playing" | "results";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-7612314432840835~3082062514";

const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
    });
    const closedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      setQuizState("results");
      interstitial.load();
    });

    interstitial.load();

    return () => {
      loadedListener();
      closedListener();
    };
  }, []);

  const startQuiz = useCallback(() => {
    const randomQuestions = getRandomQuestions(quizQuestions, 10);
    setQuestions(randomQuestions);
    setCurrentIndex(0);
    setUserAnswers([]);
    setQuizState("playing");
  }, []);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      const newAnswers = [...userAnswers, selectedIndex];
      setUserAnswers(newAnswers);

      if (currentIndex + 1 >= questions.length) {
        if (adLoaded) {
          interstitial.show();
        } else {
          setQuizState("results");
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [userAnswers, currentIndex, questions.length, adLoaded]
  );

  const handleRetry = useCallback(() => {
    setAdLoaded(false);
    interstitial.load();
    startQuiz();
  }, [startQuiz]);

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
        <TouchableOpacity
          onPress={() => {
            if (quizState === "playing") {
              setQuizState("idle");
            } else {
              router.back();
            }
          }}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t("quiz.title")}
        </Text>
      </View>

      {quizState === "idle" && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-8xl mb-6">{"\uD83E\uDDE0"}</Text>
          <Text className="text-2xl font-bold text-white mb-3 text-center">
            {t("quiz.title")}
          </Text>
          <Text className="text-base text-gray-400 text-center mb-10 leading-6">
            {t("quiz.description")}
          </Text>
          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 px-10 items-center"
            onPress={startQuiz}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg font-bold">
              {t("quiz.start")}
            </Text>
          </TouchableOpacity>
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
        />
      )}
    </SafeAreaView>
  );
}
