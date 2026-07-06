import { LocalizedText } from "../utils/localizedText";

export type DailyContentCard = {
  id: string;
  emoji: string;
  label: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  action: LocalizedText;
  target: "recipes" | "encyclopedia" | "quiz" | "tracker";
};

export const dailyContentCards: DailyContentCard[] = [
  {
    id: "daily-recipe",
    emoji: "🍹",
    label: { ko: "오늘의 레시피", en: "Daily Recipe", es: "Receta del día" },
    title: { ko: "가볍게 만드는 홈 칵테일", en: "Easy Home Cocktail", es: "Cóctel fácil en casa" },
    description: {
      ko: "소주, 하이볼, 편의점 조합까지 바로 따라 할 수 있는 레시피를 확인해보세요.",
      en: "Browse easy soju, highball, and convenience-store style mixes.",
      es: "Explora mezclas fáciles con soju, highball y estilo tienda de conveniencia.",
    },
    action: { ko: "레시피 보기", en: "View recipes", es: "Ver recetas" },
    target: "recipes",
  },
  {
    id: "daily-knowledge",
    emoji: "📚",
    label: { ko: "오늘의 술 상식", en: "Daily Knowledge", es: "Dato del día" },
    title: { ko: "도수, 칼로리, 표준잔 이해하기", en: "ABV, Calories, and Standard Drinks", es: "ABV, calorías y trago estándar" },
    description: {
      ko: "계산 결과를 더 잘 이해할 수 있는 술 정보와 안전한 음주 팁을 모았습니다.",
      en: "Learn practical alcohol facts and safer drinking context for your calculations.",
      es: "Aprende datos prácticos y contexto de consumo más seguro para tus cálculos.",
    },
    action: { ko: "백과 보기", en: "Open encyclopedia", es: "Abrir enciclopedia" },
    target: "encyclopedia",
  },
  {
    id: "daily-quiz",
    emoji: "🧠",
    label: { ko: "오늘의 퀴즈", en: "Daily Quiz", es: "Quiz del día" },
    title: { ko: "10문제로 술 지식 테스트", en: "10 Questions to Test Your Knowledge", es: "10 preguntas para probar tu conocimiento" },
    description: {
      ko: "짧게 풀고 점수를 공유하면서 도수, 칼로리, 음주 상식을 가볍게 익혀보세요.",
      en: "Take a short quiz and share your score after finishing.",
      es: "Haz un quiz corto y comparte tu puntuación al terminar.",
    },
    action: { ko: "퀴즈 시작", en: "Start quiz", es: "Iniciar quiz" },
    target: "quiz",
  },
  {
    id: "weekly-report",
    emoji: "📊",
    label: { ko: "주간 리포트", en: "Weekly Report", es: "Reporte semanal" },
    title: { ko: "이번 주 음주 기록 확인", en: "Review This Week's Drinks", es: "Revisa tus bebidas de la semana" },
    description: {
      ko: "잔 수, 칼로리, 평균 음주량을 기록하면 앱을 다시 열 이유가 생깁니다.",
      en: "Track drinks, calories, and averages to build a useful weekly habit.",
      es: "Registra bebidas, calorías y promedios para crear un hábito útil.",
    },
    action: { ko: "기록 보기", en: "View tracker", es: "Ver registro" },
    target: "tracker",
  },
];

export const getDailyCard = (date = new Date()): DailyContentCard => {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return dailyContentCards[dayIndex % dailyContentCards.length];
};
