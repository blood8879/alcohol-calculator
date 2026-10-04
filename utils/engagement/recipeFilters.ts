import type { CocktailRecipe } from "../../data/types";

// 탐색 > 레시피의 단일 필터 상태. 스타일은 레시피 목록과 맞춤 추천이 공유하고,
// 도수·칼로리·재료는 맞춤 추천 레일에만 적용된다(명세서 B-5 기본값: 전체 / 12% / 180).
export type RecipeStyleFilter = "all" | CocktailRecipe["category"];

export type RecipeFilterState = {
  readonly style: RecipeStyleFilter;
  readonly maxAbv?: number;
  readonly maxCalories?: number;
  readonly ingredientKeys: readonly string[];
};

export type RecipeFilterPillKind = "style" | "abv" | "kcal" | "ingredients";

export type RecipeFilterPill = {
  readonly kind: RecipeFilterPillKind;
  readonly label: string;
  // 조건이 적용된(강조 표시할) 알약인지
  readonly active: boolean;
};

type Translate = (key: string, options?: Record<string, unknown>) => string;

export const RECIPE_STYLE_FILTERS: readonly RecipeStyleFilter[] = ["all", "korean", "global"];
export const RECIPE_ABV_OPTIONS = [8, 12, 18] as const;
export const RECIPE_CALORIE_OPTIONS = [120, 180, 260] as const;
export const MAX_INGREDIENT_OPTIONS = 10;

export const DEFAULT_RECIPE_FILTERS: RecipeFilterState = {
  style: "all",
  maxAbv: 12,
  maxCalories: 180,
  ingredientKeys: [],
};

// 같은 임계값을 다시 누르면 해제(undefined), 다른 값이면 교체.
export const toggleThreshold = (
  current: number | undefined,
  value: number
): number | undefined => (current === value ? undefined : value);

export const toggleIngredientKey = (
  current: readonly string[],
  key: string
): readonly string[] =>
  current.includes(key) ? current.filter((item) => item !== key) : [...current, key];

export const isDefaultRecipeFilters = (state: RecipeFilterState): boolean =>
  state.style === DEFAULT_RECIPE_FILTERS.style &&
  state.maxAbv === DEFAULT_RECIPE_FILTERS.maxAbv &&
  state.maxCalories === DEFAULT_RECIPE_FILTERS.maxCalories &&
  state.ingredientKeys.length === 0;

export const styleFilterLabelKey = (style: RecipeStyleFilter): string =>
  `recipes.filter.${style}`;

export const buildRecipeFilterPills = (
  state: RecipeFilterState,
  t: Translate
): readonly RecipeFilterPill[] => [
  {
    kind: "style",
    label: t("recommender.pill.style", { value: t(styleFilterLabelKey(state.style)) }),
    active: state.style !== "all",
  },
  {
    kind: "abv",
    label:
      state.maxAbv === undefined
        ? t("recommender.pill.abvAny")
        : t("recommender.pill.abv", { value: state.maxAbv }),
    active: state.maxAbv !== undefined,
  },
  {
    kind: "kcal",
    label:
      state.maxCalories === undefined
        ? t("recommender.pill.kcalAny")
        : t("recommender.pill.kcal", { value: state.maxCalories }),
    active: state.maxCalories !== undefined,
  },
  {
    kind: "ingredients",
    label:
      state.ingredientKeys.length === 0
        ? t("recommender.pill.ingredientsAny")
        : t("recommender.pill.ingredients", { count: state.ingredientKeys.length }),
    active: state.ingredientKeys.length > 0,
  },
];

// 레시피 목록 필터: 공유 스타일 + 번역명 부분일치 검색.
export const filterRecipeList = (
  recipes: readonly CocktailRecipe[],
  style: RecipeStyleFilter,
  query: string,
  getName: (recipe: CocktailRecipe) => string
): readonly CocktailRecipe[] => {
  const normalized = query.toLowerCase().trim();
  return recipes.filter((recipe) => {
    if (style !== "all" && recipe.category !== style) return false;
    if (normalized) return getName(recipe).toLowerCase().includes(normalized);
    return true;
  });
};
