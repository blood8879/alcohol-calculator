import { cocktailRecipes } from "../data/cocktailRecipes";
import { extendedCocktailRecipes } from "../data/extendedContent";
import type { CocktailRecipe } from "../data/types";
import { getDailyCard } from "../data/dailyContent";
import { calculateScore } from "../utils/quizUtils";
import { pickLocalizedText } from "../utils/localizedText";
import type { DrinkLog } from "../utils/trackerStorage";
import {
  calculateRecipeMetrics,
  getAvailableIngredientOptions,
  matchRecipes,
} from "../utils/engagement/recipeRecommender";
import {
  buildTodayHub,
  getDailyQuizQuestionIds,
} from "../utils/engagement/todayHub";
import {
  buildTrackerInsights,
  getMostCommonDrinkName,
} from "../utils/engagement/trackerInsights";

const recipeFixture: CocktailRecipe = {
  id: "fixture-highball",
  nameKey: "fixture.highball",
  emoji: "🥃",
  category: "global",
  ingredients: [
    { nameKey: "ingredients.whiskey", volume: 45, abv: 40, unit: "ml" },
    { nameKey: "ingredients.soda", volume: 135, abv: 0, unit: "ml" },
    { nameKey: "ingredients.lemon", volume: 1, abv: 0, unit: "piece" },
  ],
  instructionsKey: "fixture.highball.instructions",
  difficulty: "easy",
  glassType: "highball",
};

describe("engagement selectors", () => {
  it("pins existing daily card, quiz score, and localized fallback behavior", () => {
    const date = new Date("2026-06-03T00:00:00.000Z");
    const dailyCard = getDailyCard(date);
    const score = calculateScore([0, 1], [
      {
        id: "q1",
        questionKey: "q1",
        optionKeys: ["a", "b", "c", "d"],
        correctIndex: 0,
        explanationKey: "e1",
      },
      {
        id: "q2",
        questionKey: "q2",
        optionKeys: ["a", "b", "c", "d"],
        correctIndex: 3,
        explanationKey: "e2",
      },
    ]);
    const fallback = pickLocalizedText(
      { ko: "한국어", en: "English", es: "Español" },
      "fr-FR"
    );

    expect(dailyCard.target).toBe("tracker");
    expect(score).toEqual({ score: 1, total: 2, percentage: 50 });
    expect(fallback).toBe("English");
  });

  it("calculates recipe metrics from ml ingredients only", () => {
    const metrics = calculateRecipeMetrics(recipeFixture);

    expect(metrics).toEqual({
      estimatedAbv: 10,
      // 180ml × 10% × 5.6 (명세 B-2) = 100.8 → 101
      estimatedCalories: 101,
      totalVolumeMl: 180,
    });
  });

  it("calculates 소맥 metrics with the spec B-2 coefficient (B-5: 142 kcal)", () => {
    const somaek = cocktailRecipes.find((recipe) => recipe.id === "somaek");
    expect(somaek).toBeDefined();

    expect(calculateRecipeMetrics(somaek as CocktailRecipe)).toEqual({
      totalVolumeMl: 300,
      estimatedAbv: 8.5,
      estimatedCalories: 142,
    });
  });

  it("matches recipes by ingredients, style, max ABV, and max calories", () => {
    const matches = matchRecipes({
      maxAbv: 12,
      maxCalories: 120,
      recipes: [recipeFixture, ...extendedCocktailRecipes],
      selectedIngredientKeys: ["ingredients.whiskey", "ingredients.soda"],
      style: "global",
    });

    expect(matches.map((match) => match.recipe.id)).toContain("fixture-highball");
    expect(matches[0]?.metrics.estimatedAbv).toBeLessThanOrEqual(12);
  });

  it("returns starter recommendations and ingredient options for empty input", () => {
    const options = getAvailableIngredientOptions([recipeFixture]);
    const matches = matchRecipes({ recipes: [recipeFixture], selectedIngredientKeys: [] });

    expect(options).toEqual([
      { key: "ingredients.soda", labelKey: "ingredients.soda", name: undefined },
      { key: "ingredients.whiskey", labelKey: "ingredients.whiskey", name: undefined },
    ]);
    expect(matches).toHaveLength(1);
  });

  it("keeps localized ingredient labels for recommender chips", () => {
    const options = getAvailableIngredientOptions(extendedCocktailRecipes);
    const grapeJuice = options.find(
      (option) => option.key === "recipes.extended.ingredients.grapeJuice"
    );

    expect(grapeJuice?.name?.ko).toBe("청포도 주스");
  });

  it("builds deterministic today hub and daily quiz ids", () => {
    const date = new Date("2026-06-03T00:00:00.000Z");
    const todayHub = buildTodayHub({ date, trackerInsightCount: 0 });
    const sameDayQuiz = getDailyQuizQuestionIds(date, ["q1", "q2", "q3", "q4"]);
    const nextDayQuiz = getDailyQuizQuestionIds(
      new Date("2026-06-04T00:00:00.000Z"),
      ["q1", "q2", "q3", "q4"]
    );

    expect(todayHub.cards.map((card) => card.kind)).toEqual([
      "daily-quiz",
      "daily-guide",
      "daily-recipe",
      "tracker-insight",
      "recommender",
    ]);
    expect(todayHub.cards.find((card) => card.kind === "recommender")?.target).toBe(
      "/(tabs)/explore?section=recipes"
    );
    expect(sameDayQuiz).toEqual(getDailyQuizQuestionIds(date, ["q1", "q2", "q3", "q4"]));
    expect(nextDayQuiz).not.toEqual(sameDayQuiz);
  });

  it("builds neutral tracker insights for empty, one-log, and comparison states", () => {
    const empty = buildTrackerInsights([], new Date("2026-06-03T00:00:00.000Z"));
    const currentWeekLog: DrinkLog = {
      abv: 5,
      calories: 70,
      emoji: "🍺",
      id: "current",
      name: "Beer",
      timestamp: new Date("2026-06-03T12:00:00.000Z").getTime(),
      volume: 355,
    };
    const previousWeekLog: DrinkLog = {
      ...currentWeekLog,
      id: "previous",
      timestamp: new Date("2026-05-27T12:00:00.000Z").getTime(),
    };
    const insights = buildTrackerInsights(
      [currentWeekLog, previousWeekLog],
      new Date("2026-06-03T00:00:00.000Z")
    );

    expect(empty.totalDrinks).toBe(0);
    expect(insights.weekComparison.kind).toBe("same");
    expect(getMostCommonDrinkName([currentWeekLog, previousWeekLog])).toBe("Beer");
  });
});
