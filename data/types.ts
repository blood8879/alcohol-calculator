import type { LocalizedText } from "../utils/localizedText";

export interface DrinkPreset {
  id: string;
  nameKey: string;
  emoji: string;
  volume: number;
  abv: number;
}

export interface EncyclopediaEntry {
  id: string;
  nameKey: string;
  displayName?: LocalizedText;
  emoji: string;
  abvMin: number;
  abvMax: number;
  caloriesPer100ml: number;
  originKey: string;
  origin?: LocalizedText;
  servingTempKey: string;
  servingTemp?: LocalizedText;
  pairingKey: string;
  pairing?: LocalizedText;
  descriptionKey: string;
  description?: LocalizedText;
}

export interface RecipeIngredient {
  nameKey: string;
  name?: LocalizedText;
  volume: number;
  abv: number;
  unit: string;
}

export interface CocktailRecipe {
  id: string;
  nameKey: string;
  displayName?: LocalizedText;
  emoji: string;
  category: 'korean' | 'global';
  ingredients: RecipeIngredient[];
  instructionsKey: string;
  instructions?: LocalizedText;
  difficulty: 'easy' | 'medium' | 'hard';
  glassType: string;
}

export type QuizCategory = "all" | "basics" | "korean" | "cocktails" | "safety";

export interface QuizQuestion {
  id: string;
  questionKey: string;
  optionKeys: [string, string, string, string];
  correctIndex: number;
  explanationKey: string;
  category?: Exclude<QuizCategory, "all">;
}
