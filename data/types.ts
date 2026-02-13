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
  emoji: string;
  abvMin: number;
  abvMax: number;
  caloriesPer100ml: number;
  originKey: string;
  servingTempKey: string;
  pairingKey: string;
  descriptionKey: string;
}

export interface RecipeIngredient {
  nameKey: string;
  volume: number;
  abv: number;
  unit: string;
}

export interface CocktailRecipe {
  id: string;
  nameKey: string;
  emoji: string;
  category: 'korean' | 'global';
  ingredients: RecipeIngredient[];
  instructionsKey: string;
  difficulty: 'easy' | 'medium' | 'hard';
  glassType: string;
}

export interface QuizQuestion {
  id: string;
  questionKey: string;
  optionKeys: [string, string, string, string];
  correctIndex: number;
  explanationKey: string;
}
