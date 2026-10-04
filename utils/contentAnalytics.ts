import { cocktailRecipes } from "../data/cocktailRecipes";
import { extendedCocktailRecipes, extendedEncyclopediaEntries } from "../data/extendedContent";
import { encyclopediaData } from "../data/encyclopediaData";
import { logFirebaseEvent } from "./firebase";
import type { ContentKind } from "./contentStorage";

export type ContentSection = "recipes" | "encyclopedia" | "culture";
const recipeIds = new Set([...cocktailRecipes, ...extendedCocktailRecipes].map((item) => item.id));
const encyclopediaIds = new Set([...encyclopediaData, ...extendedEncyclopediaEntries].map((item) => item.id));

export const isCatalogContentId = (kind: ContentKind, id: string): boolean =>
  kind === "recipe" ? recipeIds.has(id) : encyclopediaIds.has(id);

export const queryLengthBucket = (query: string): string => {
  const length = query.trim().length;
  if (length <= 2) return "1_2";
  if (length <= 5) return "3_5";
  if (length <= 10) return "6_10";
  return "11_plus";
};

export const resultCountBucket = (count: number): string => {
  if (count === 0) return "zero";
  if (count <= 5) return "1_5";
  if (count <= 20) return "6_20";
  return "21_plus";
};

export const logContentSection = (section: ContentSection, source: "tab" | "deep_link"): void =>
  logFirebaseEvent("content_section_selected", { section, source });

export const logContentSearch = (section: "recipes" | "encyclopedia", query: string, resultCount: number): void => {
  if (!query.trim()) return;
  logFirebaseEvent("content_search", { section, query_length: queryLengthBucket(query), result_count: resultCountBucket(resultCount) });
};

export const logContentFilter = (section: "recipes" | "recommender", filter: string): void => {
  if (!/^[a-z_0-9]{1,30}$/.test(filter)) return;
  logFirebaseEvent("content_filter_used", { section, filter });
};

export const logContentViewed = (kind: ContentKind, id: string): void => {
  if (!isCatalogContentId(kind, id)) return;
  logFirebaseEvent(kind === "recipe" ? "recipe_viewed" : "encyclopedia_viewed", { item_id: id });
};

export const logGuideViewed = (id: string): void => {
  if (encyclopediaIds.has(id)) logFirebaseEvent("guide_viewed", { item_id: id });
};

export const logGuideNextStep = (id: string, target: "tracker" | "recipes" | "quiz"): void => {
  if (encyclopediaIds.has(id)) logFirebaseEvent("guide_next_step_tapped", { item_id: id, target });
};

export const logContentFavorite = (kind: ContentKind, id: string, added: boolean): void => {
  if (!isCatalogContentId(kind, id)) return;
  logFirebaseEvent(added ? "content_favorite_added" : "content_favorite_removed", { content_kind: kind, item_id: id });
};

export const logHomeContentClick = (kind: ContentKind, id: string, source: "favorite" | "recent"): void => {
  if (!isCatalogContentId(kind, id)) return;
  logFirebaseEvent("home_content_clicked", { content_kind: kind, item_id: id, source });
};

export const logHomeCtaClick = (target: "quiz" | "tracker" | "recipes" | "encyclopedia" | "session", source: "daily_card" | "quiz_banner" | "session_banner" | "week_summary"): void =>
  logFirebaseEvent("home_cta_clicked", { target, source });

export const logRecommenderUsed = (resultCount: number, selectedIngredientCount: number): void =>
  logFirebaseEvent("recommender_used", { result_count: resultCountBucket(resultCount), ingredient_count: resultCountBucket(selectedIngredientCount) });
