import { QuizCategory } from "./types";
import { LocalizedText } from "../utils/localizedText";

export type QuizCategoryConfig = {
  key: QuizCategory;
  emoji: string;
  title: LocalizedText;
  description: LocalizedText;
  questionIds?: string[];
};

export const quizCategories: QuizCategoryConfig[] = [
  {
    key: "all",
    emoji: "🧠",
    title: { ko: "전체", en: "All", es: "Todo" },
    description: { ko: "모든 주제에서 무작위 10문제", en: "10 random questions from every topic", es: "10 preguntas aleatorias" },
  },
  {
    key: "basics",
    emoji: "📚",
    title: { ko: "기초 상식", en: "Basics", es: "Básicos" },
    description: { ko: "도수, 원료, 용어 중심", en: "ABV, ingredients, terminology", es: "ABV, ingredientes y términos" },
    questionIds: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q20", "q21", "q22", "q23", "q33", "q34", "q35", "q36"],
  },
  {
    key: "korean",
    emoji: "🍶",
    title: { ko: "한국 술", en: "Korean Drinks", es: "Bebidas coreanas" },
    description: { ko: "소주, 막걸리, 음주 예절", en: "Soju, makgeolli, etiquette", es: "Soju, makgeolli y etiqueta" },
    questionIds: ["q1", "q10", "q19", "q24", "q25", "q26", "q27", "q32", "q37", "q38", "q39", "q40"],
  },
  {
    key: "cocktails",
    emoji: "🍹",
    title: { ko: "칵테일/주류", en: "Cocktails", es: "Cócteles" },
    description: { ko: "세계 술과 칵테일 재료", en: "Global drinks and cocktail basics", es: "Bebidas globales y cócteles" },
    questionIds: ["q9", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q41", "q42", "q43", "q44", "q45", "q46"],
  },
  {
    key: "safety",
    emoji: "💧",
    title: { ko: "음주 안전", en: "Safety", es: "Seguridad" },
    description: { ko: "표준잔, 대사, 숙취, 운전 기준", en: "Standard drinks, metabolism, hangovers, driving", es: "Tragos estándar, metabolismo y conducción" },
    questionIds: ["q8", "q28", "q29", "q30", "q31", "q32", "q47", "q48", "q49", "q50"],
  },
];
