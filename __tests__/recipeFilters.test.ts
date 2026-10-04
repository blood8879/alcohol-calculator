import { cocktailRecipes } from "../data/cocktailRecipes";
import { extendedCocktailRecipes } from "../data/extendedContent";
import type { CocktailRecipe } from "../data/types";
import {
  buildRecipeFilterPills,
  DEFAULT_RECIPE_FILTERS,
  filterRecipeList,
  isDefaultRecipeFilters,
  toggleIngredientKey,
  toggleThreshold,
} from "../utils/engagement/recipeFilters";

// 키와 보간값을 그대로 노출하는 가짜 t
const fakeT = (key: string, options?: Record<string, unknown>): string =>
  options ? `${key}|${JSON.stringify(options)}` : key;

describe("recipe filter state", () => {
  it("keeps spec defaults: all style, 12% ABV, 180 kcal, no ingredients", () => {
    expect(DEFAULT_RECIPE_FILTERS).toEqual({
      style: "all",
      maxAbv: 12,
      maxCalories: 180,
      ingredientKeys: [],
    });
    expect(isDefaultRecipeFilters(DEFAULT_RECIPE_FILTERS)).toBe(true);
    expect(isDefaultRecipeFilters({ ...DEFAULT_RECIPE_FILTERS, style: "korean" })).toBe(false);
    expect(isDefaultRecipeFilters({ ...DEFAULT_RECIPE_FILTERS, maxAbv: undefined })).toBe(false);
    expect(isDefaultRecipeFilters({ ...DEFAULT_RECIPE_FILTERS, ingredientKeys: ["x"] })).toBe(false);
  });

  it("re-tapping the selected threshold clears it", () => {
    expect(toggleThreshold(12, 12)).toBeUndefined();
    expect(toggleThreshold(12, 18)).toBe(18);
    expect(toggleThreshold(undefined, 8)).toBe(8);
  });

  it("toggles ingredient keys without mutating", () => {
    const current = ["a"];
    expect(toggleIngredientKey(current, "b")).toEqual(["a", "b"]);
    expect(toggleIngredientKey(current, "a")).toEqual([]);
    expect(current).toEqual(["a"]);
  });
});

describe("buildRecipeFilterPills", () => {
  it("labels default pills and marks applied constraints active", () => {
    const pills = buildRecipeFilterPills(DEFAULT_RECIPE_FILTERS, fakeT);
    expect(pills.map((pill) => pill.kind)).toEqual(["style", "abv", "kcal", "ingredients"]);
    expect(pills[0]).toEqual({
      kind: "style",
      label: 'recommender.pill.style|{"value":"recipes.filter.all"}',
      active: false,
    });
    expect(pills[1]).toEqual({ kind: "abv", label: 'recommender.pill.abv|{"value":12}', active: true });
    expect(pills[2]).toEqual({ kind: "kcal", label: 'recommender.pill.kcal|{"value":180}', active: true });
    expect(pills[3]).toEqual({ kind: "ingredients", label: "recommender.pill.ingredientsAny", active: false });
  });

  it("reflects cleared thresholds, chosen style and ingredient count", () => {
    const pills = buildRecipeFilterPills(
      { style: "korean", maxAbv: undefined, maxCalories: undefined, ingredientKeys: ["a", "b"] },
      fakeT
    );
    expect(pills[0].label).toBe('recommender.pill.style|{"value":"recipes.filter.korean"}');
    expect(pills[0].active).toBe(true);
    expect(pills[1]).toMatchObject({ label: "recommender.pill.abvAny", active: false });
    expect(pills[2]).toMatchObject({ label: "recommender.pill.kcalAny", active: false });
    expect(pills[3]).toMatchObject({ label: 'recommender.pill.ingredients|{"count":2}', active: true });
  });
});

describe("filterRecipeList", () => {
  const recipes: readonly CocktailRecipe[] = [...cocktailRecipes, ...extendedCocktailRecipes];
  const nameOf = (recipe: CocktailRecipe) => recipe.id;

  it("returns all 35 recipes for the all style and split 10/25 by style", () => {
    expect(filterRecipeList(recipes, "all", "", nameOf)).toHaveLength(recipes.length);
    expect(filterRecipeList(recipes, "korean", "", nameOf).every((r) => r.category === "korean")).toBe(true);
    expect(
      filterRecipeList(recipes, "korean", "", nameOf).length +
        filterRecipeList(recipes, "global", "", nameOf).length
    ).toBe(recipes.length);
  });

  it("matches the translated name case-insensitively, combined with style", () => {
    const sample = recipes.find((recipe) => recipe.category === "global");
    expect(sample).toBeDefined();
    const query = ` ${sample!.id.toUpperCase()} `;
    expect(filterRecipeList(recipes, "global", query, nameOf)).toContain(sample);
    expect(filterRecipeList(recipes, "korean", query, nameOf)).not.toContain(sample);
  });
});
