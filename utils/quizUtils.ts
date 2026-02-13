import { QuizQuestion } from '../data/types';

export const getRandomQuestions = (
  allQuestions: QuizQuestion[],
  count: number = 10
): QuizQuestion[] => {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const calculateScore = (
  userAnswers: number[],
  questions: QuizQuestion[]
): { score: number; total: number; percentage: number } => {
  let score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.correctIndex) {
      score++;
    }
  });
  return {
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
  };
};

export const formatShareableScore = (
  score: number,
  total: number,
  t: (key: string) => string
): string => {
  return `🍺 ${t('quiz.title')}\n${t('quiz.yourScore')}: ${score}/${total} (${Math.round((score/total)*100)}%)\n\n--- ${t('share.appName')} ---`;
};
