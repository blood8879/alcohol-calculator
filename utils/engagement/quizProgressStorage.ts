import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createEmptyQuizProgress,
  QuizProgress,
  safeParseQuizProgress,
} from "./quizProgress";

const QUIZ_PROGRESS_KEY = "@quiz_progress";

export async function getQuizProgress(): Promise<QuizProgress> {
  const raw = await AsyncStorage.getItem(QUIZ_PROGRESS_KEY);
  return safeParseQuizProgress(raw);
}

export async function setQuizProgress(progress: QuizProgress): Promise<void> {
  await AsyncStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
}

export async function resetQuizProgress(): Promise<QuizProgress> {
  const empty = createEmptyQuizProgress();
  await setQuizProgress(empty);
  return empty;
}
