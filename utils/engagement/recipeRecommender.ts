import type { CocktailRecipe, RecipeIngredient } from "../../data/types";

export type RecipeMetrics = {
  readonly estimatedAbv: number;
  readonly estimatedCalories: number;
  readonly totalVolumeMl: number;
};

export type IngredientOption = {
  readonly key: string;
  readonly labelKey: string;
  readonly name?: RecipeIngredient["name"];
};

export type RecipeMatch = {
  readonly metrics: RecipeMetrics;
  readonly recipe: CocktailRecipe;
};

export type RecipeMatchInput = {
  readonly maxAbv?: number;
  readonly maxCalories?: number;
  readonly recipes: readonly CocktailRecipe[];
  readonly selectedIngredientKeys?: readonly string[];
  readonly style?: CocktailRecipe["category"] | "all";
};

const roundOne = (value: number): number => Math.round(value * 10) / 10;

export const calculateRecipeMetrics = (recipe: CocktailRecipe): RecipeMetrics => {
  const mlIngredients = recipe.ingredients.filter((ingredient) => ingredient.unit === "ml");
  const totalVolumeMl = mlIngredients.reduce((sum, ingredient) => sum + ingredient.volume, 0);
  const alcoholMl = mlIngredients.reduce(
    (sum, ingredient) => sum + ingredient.volume * (ingredient.abv / 100),
    0
  );
  const estimatedAbv = totalVolumeMl > 0 ? (alcoholMl / totalVolumeMl) * 100 : 0;
  const estimatedCalories = totalVolumeMl * (estimatedAbv / 100) * 0.789 * 7;

  return {
    estimatedAbv: roundOne(estimatedAbv),
    estimatedCalories: Math.round(estimatedCalories),
    totalVolumeMl,
  };
};

export const getAvailableIngredientOptions = (
  recipes: readonly CocktailRecipe[]
): readonly IngredientOption[] => {
  const ingredients = new Map<string, RecipeIngredient>();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      if (ingredient.unit === "ml") {
        const current = ingredients.get(ingredient.nameKey);
        if (current === undefined || current.name === undefined) {
          ingredients.set(ingredient.nameKey, ingredient);
        }
      }
    });
  });

  return Array.from(ingredients.values())
    .sort((left, right) => left.nameKey.localeCompare(right.nameKey))
    .map((ingredient) => ({
      key: ingredient.nameKey,
      labelKey: ingredient.nameKey,
      name: ingredient.name,
    }));
};

const hasSelectedIngredients = (
  recipe: CocktailRecipe,
  selectedIngredientKeys: readonly string[]
): boolean => {
  if (selectedIngredientKeys.length === 0) {
    return true;
  }

  const recipeIngredients = new Set(recipe.ingredients.map((ingredient) => ingredient.nameKey));
  return selectedIngredientKeys.every((key) => recipeIngredients.has(key));
};

export const matchRecipes = (input: RecipeMatchInput): readonly RecipeMatch[] => {
  const selectedIngredientKeys = input.selectedIngredientKeys ?? [];
  const style = input.style ?? "all";

  return input.recipes
    .filter((recipe) => style === "all" || recipe.category === style)
    .filter((recipe) => hasSelectedIngredients(recipe, selectedIngredientKeys))
    .map((recipe) => ({ recipe, metrics: calculateRecipeMetrics(recipe) }))
    .filter((match) => input.maxAbv === undefined || match.metrics.estimatedAbv <= input.maxAbv)
    .filter(
      (match) =>
        input.maxCalories === undefined || match.metrics.estimatedCalories <= input.maxCalories
    )
    .sort((left, right) => {
      const leftScore = selectedIngredientKeys.length === 0 ? 0 : left.recipe.ingredients.length;
      const rightScore = selectedIngredientKeys.length === 0 ? 0 : right.recipe.ingredients.length;
      return leftScore - rightScore || left.metrics.estimatedAbv - right.metrics.estimatedAbv;
    });
};
