import { cocktailRecipes } from "../data/cocktailRecipes";
import { popularContent, seasonalCollections } from "../data/contentCollections";
import { dailyContentCards } from "../data/dailyContent";
import { dailyTips } from "../data/dailyTips";
import { drinkingCultures } from "../data/drinkingCulture";
import { drinkPresets } from "../data/drinkPresets";
import { encyclopediaData } from "../data/encyclopediaData";
import { extendedCocktailRecipes, extendedEncyclopediaEntries } from "../data/extendedContent";
import { foodPairings } from "../data/foodPairings";
import { allGuideDetails } from "../data/guideDetails";
import { quizCategories } from "../data/quizCategories";
import { quizQuestions } from "../data/quizData";
import { recipeExtras } from "../data/recipeExtras";

// Combined lists exactly as the explore screen / analytics merge them.
const allRecipes = [...cocktailRecipes, ...extendedCocktailRecipes];
const allEncyclopedia = [...encyclopediaData, ...extendedEncyclopediaEntries];

const recipeIds = new Set(allRecipes.map((r) => r.id));
const encyclopediaIds = new Set(allEncyclopedia.map((e) => e.id));
const quizIds = new Set(quizQuestions.map((q) => q.id));

const duplicatesOf = (ids: readonly string[]): string[] => {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
};

describe("content ids are unique within each combined collection", () => {
  const collections: Record<string, readonly string[]> = {
    recipes: allRecipes.map((r) => r.id),
    encyclopedia: allEncyclopedia.map((e) => e.id),
    guides: allGuideDetails.map((g) => g.entryId),
    quizQuestions: quizQuestions.map((q) => q.id),
    quizCategories: quizCategories.map((c) => c.key),
    drinkPresets: drinkPresets.map((p) => p.id),
    dailyTips: dailyTips.map((t) => t.id),
    dailyContentCards: dailyContentCards.map((c) => c.id),
    drinkingCultures: drinkingCultures.map((c) => c.id),
    foodPairings: foodPairings.map((p) => p.id),
    seasonalCollections: seasonalCollections.map((c) => c.id),
  };

  it.each(Object.entries(collections))("%s has no duplicate ids", (_name, ids) => {
    expect(ids.length).toBeGreaterThan(0);
    expect(duplicatesOf(ids)).toEqual([]);
  });
});

describe("content references resolve (referential integrity)", () => {
  it("every guide entryId points to an encyclopedia entry", () => {
    const missing = allGuideDetails.map((g) => g.entryId).filter((id) => !encyclopediaIds.has(id));
    expect(missing).toEqual([]);
  });

  it("every guide relatedRecipeId points to a recipe", () => {
    const missing = allGuideDetails.flatMap((g) =>
      g.relatedRecipeIds.filter((id) => !recipeIds.has(id)).map((id) => `${g.entryId} -> ${id}`)
    );
    expect(missing).toEqual([]);
  });

  it("every curated / seasonal collection item points to existing content", () => {
    const items = [...popularContent, ...seasonalCollections.flatMap((c) => c.items)];
    const missing = items
      .filter((item) => !(item.kind === "recipe" ? recipeIds : encyclopediaIds).has(item.id))
      .map((item) => `${item.kind}:${item.id}`);
    expect(missing).toEqual([]);
  });

  it("every recipeExtras key points to a recipe", () => {
    const missing = Object.keys(recipeExtras).filter((id) => !recipeIds.has(id));
    expect(missing).toEqual([]);
  });

  it("every quiz category questionId points to a quiz question", () => {
    const missing = quizCategories.flatMap((c) =>
      (c.questionIds ?? []).filter((id) => !quizIds.has(id)).map((id) => `${c.key} -> ${id}`)
    );
    expect(missing).toEqual([]);
  });

  it("green-grape-soju and green-grape-soju-ade are distinct recipes", () => {
    const base = allRecipes.filter((r) => r.id === "green-grape-soju");
    const ade = allRecipes.filter((r) => r.id === "green-grape-soju-ade");
    expect(base).toHaveLength(1);
    expect(ade).toHaveLength(1);
    expect(base[0].nameKey).toBe("recipes.items.greenGrapeSoju.name");
    expect(ade[0].nameKey).toBe("recipes.extended.greenGrapeSoju.name");
  });
});
