import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Modal from "react-native-modal";
import type { CocktailRecipe } from "../data/types";
import {
  getAvailableIngredientOptions,
  matchRecipes,
  RecipeMatch,
} from "../utils/engagement/recipeRecommender";
import {
  buildRecipeFilterPills,
  DEFAULT_RECIPE_FILTERS,
  isDefaultRecipeFilters,
  MAX_INGREDIENT_OPTIONS,
  RECIPE_ABV_OPTIONS,
  RECIPE_CALORIE_OPTIONS,
  RECIPE_STYLE_FILTERS,
  RecipeFilterPillKind,
  RecipeFilterState,
  RecipeStyleFilter,
  styleFilterLabelKey,
  toggleIngredientKey,
  toggleThreshold,
} from "../utils/engagement/recipeFilters";
import { translateWithFallback } from "../utils/localizedText";
import EmptyState from "./ui/EmptyState";
import { logContentFilter, logRecommenderUsed } from "../utils/contentAnalytics";

type RecipeRecommenderPanelProps = {
  readonly recipes: readonly CocktailRecipe[];
  readonly filters: RecipeFilterState;
  readonly onChangeFilters: (next: RecipeFilterState) => void;
  readonly onSelectRecipe: (recipe: CocktailRecipe) => void;
};

const MAX_RESULTS = 8;

// 5회차: 무거운 추천 카드(칩 4줄) → Uber Eats식 드롭다운 필터 알약 한 줄 + 결과 요약 + 추천 레일.
// 알약을 누르면 작은 다크 바텀시트에서 옵션을 고른다. 스타일은 레시피 목록과 공유한다.
export default function RecipeRecommenderPanel({
  recipes,
  filters,
  onChangeFilters,
  onSelectRecipe,
}: RecipeRecommenderPanelProps) {
  const { t, i18n } = useTranslation();
  const [openSheet, setOpenSheet] = useState<RecipeFilterPillKind | null>(null);
  const hasInteracted = useRef(false);
  const { style: styleFilter, maxAbv, maxCalories, ingredientKeys: selectedIngredientKeys } = filters;

  const options = useMemo(
    () => getAvailableIngredientOptions(recipes).slice(0, MAX_INGREDIENT_OPTIONS),
    [recipes]
  );
  const allMatches = useMemo(
    () =>
      matchRecipes({
        recipes,
        selectedIngredientKeys,
        maxAbv,
        maxCalories,
        style: styleFilter === "all" ? undefined : styleFilter,
      }),
    [maxAbv, maxCalories, recipes, selectedIngredientKeys, styleFilter]
  );
  const matches = useMemo(() => allMatches.slice(0, MAX_RESULTS), [allMatches]);
  useEffect(() => {
    if (hasInteracted.current) logRecommenderUsed(matches.length, selectedIngredientKeys.length);
  }, [matches.length, selectedIngredientKeys.length, styleFilter, maxAbv, maxCalories]);

  const pills = useMemo(() => buildRecipeFilterPills(filters, t), [filters, t]);
  const isDefault = isDefaultRecipeFilters(filters);

  const chooseFilter = (filter: string, next: RecipeFilterState) => {
    hasInteracted.current = true;
    logContentFilter("recommender", filter);
    onChangeFilters(next);
  };
  const chooseStyle = (style: RecipeStyleFilter) => {
    // 목록 스타일 필터(구 상단 칩)와 추천 스타일 칩이 하나로 합쳐져 두 이벤트를 모두 유지한다.
    if (style !== styleFilter) logContentFilter("recipes", style);
    chooseFilter(`style_${style}`, { ...filters, style });
    setOpenSheet(null);
  };
  const chooseAbv = (value: number | undefined) => {
    chooseFilter("max_abv", {
      ...filters,
      maxAbv: value === undefined ? undefined : toggleThreshold(maxAbv, value),
    });
    setOpenSheet(null);
  };
  const chooseCalories = (value: number | undefined) => {
    chooseFilter("max_calories", {
      ...filters,
      maxCalories: value === undefined ? undefined : toggleThreshold(maxCalories, value),
    });
    setOpenSheet(null);
  };
  const toggleIngredient = (key: string) => {
    chooseFilter("ingredient", {
      ...filters,
      ingredientKeys: toggleIngredientKey(selectedIngredientKeys, key),
    });
  };
  const resetFilters = () => {
    if (styleFilter !== DEFAULT_RECIPE_FILTERS.style) {
      logContentFilter("recipes", DEFAULT_RECIPE_FILTERS.style);
    }
    chooseFilter("reset", DEFAULT_RECIPE_FILTERS);
  };

  const renderMatch = (match: RecipeMatch) => {
    const name = translateWithFallback(
      t,
      match.recipe.nameKey,
      match.recipe.displayName,
      i18n.language
    );

    return (
      <TouchableOpacity
        key={match.recipe.id}
        className="bg-surface rounded-xl p-3 mr-3 w-44"
        onPress={() => onSelectRecipe(match.recipe)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={name}
      >
        <Text className="text-2xl mb-1.5">{match.recipe.emoji}</Text>
        <Text className="text-textPrimary text-base font-bold" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-textSecondary text-xs mt-1">
          {match.metrics.estimatedAbv.toFixed(1)}% - {match.metrics.estimatedCalories} kcal
        </Text>
        <Text className="text-accentSoft text-xs font-semibold mt-1.5">
          {t("recommender.openDetails")} ›
        </Text>
      </TouchableOpacity>
    );
  };

  const sheetTitle = (kind: RecipeFilterPillKind): string => {
    if (kind === "style") return t("recommender.style");
    if (kind === "abv") return t("recommender.maxAbv");
    if (kind === "kcal") return t("recommender.maxCalories");
    return t("recipes.ingredientsTitle");
  };

  const renderSheetBody = (kind: RecipeFilterPillKind) => {
    if (kind === "style") {
      return RECIPE_STYLE_FILTERS.map((style) => (
        <OptionChip
          key={style}
          active={styleFilter === style}
          label={t(styleFilterLabelKey(style))}
          onPress={() => chooseStyle(style)}
        />
      ));
    }
    if (kind === "abv") {
      return [
        <OptionChip
          key="any"
          active={maxAbv === undefined}
          label={t("recommender.noLimit")}
          onPress={() => chooseAbv(undefined)}
        />,
        ...RECIPE_ABV_OPTIONS.map((value) => (
          <OptionChip
            key={value}
            active={maxAbv === value}
            label={`≤${value}%`}
            onPress={() => chooseAbv(value)}
          />
        )),
      ];
    }
    if (kind === "kcal") {
      return [
        <OptionChip
          key="any"
          active={maxCalories === undefined}
          label={t("recommender.noLimit")}
          onPress={() => chooseCalories(undefined)}
        />,
        ...RECIPE_CALORIE_OPTIONS.map((value) => (
          <OptionChip
            key={value}
            active={maxCalories === value}
            label={`≤${value} kcal`}
            onPress={() => chooseCalories(value)}
          />
        )),
      ];
    }
    return options.map((option) => {
      const label = translateWithFallback(t, option.labelKey, option.name, i18n.language);
      return (
        <OptionChip
          key={option.key}
          active={selectedIngredientKeys.includes(option.key)}
          label={label}
          onPress={() => toggleIngredient(option.key)}
        />
      );
    });
  };

  return (
    <View className="mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {pills.map((pill) => (
          <TouchableOpacity
            key={pill.kind}
            className={`flex-row items-center rounded-full px-3.5 min-h-[44px] border ${
              pill.active ? "bg-green-500/15 border-accentSoft" : "bg-surface border-surfaceDeep"
            }`}
            onPress={() => setOpenSheet(pill.kind)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={pill.label}
            accessibilityState={{ selected: pill.active }}
          >
            <Text
              className={`text-sm font-semibold ${
                pill.active ? "text-accentSoft" : "text-textPrimary"
              }`}
            >
              {pill.label}
            </Text>
            <Text
              className={`text-xs ml-1 ${pill.active ? "text-accentSoft" : "text-textSecondary"}`}
              importantForAccessibility="no"
              accessibilityElementsHidden
            >
              ▾
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-row items-center mt-1 mb-1 min-h-[44px]">
        <Text className="text-textSecondary text-sm font-semibold" accessibilityRole="header">
          {t("recommender.resultCount", { count: allMatches.length })}
        </Text>
        {!isDefault && (
          <>
            <Text className="text-textMuted text-sm mx-1.5">·</Text>
            <TouchableOpacity
              className="min-h-[44px] justify-center"
              onPress={resetFilters}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("recommender.reset")}
              hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
            >
              <Text className="text-accentSoft text-sm font-semibold">
                {t("recommender.reset")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {matches.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {matches.map(renderMatch)}
        </ScrollView>
      ) : (
        <EmptyState
          compact
          className="bg-surface rounded-xl"
          emoji="🍹"
          title={t("recommender.emptyTitle")}
          description={t("recommender.emptySubtitle")}
        />
      )}

      <Modal
        isVisible={openSheet !== null}
        onBackdropPress={() => setOpenSheet(null)}
        onBackButtonPress={() => setOpenSheet(null)}
        onSwipeComplete={() => setOpenSheet(null)}
        swipeDirection={["down"]}
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        {openSheet !== null ? (
          <View className="bg-surface rounded-t-2xl px-4 pt-3 pb-8">
            <View className="self-center w-10 h-1 rounded-full bg-surfaceDeep mb-3" />
            <Text
              className="text-textPrimary text-lg font-bold mb-3"
              accessibilityRole="header"
            >
              {sheetTitle(openSheet)}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {renderSheetBody(openSheet)}
            </View>
            {openSheet === "ingredients" && (
              <TouchableOpacity
                className="bg-surfaceDeep rounded-xl min-h-[48px] items-center justify-center mt-5"
                onPress={() => setOpenSheet(null)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t("recommender.done")}
              >
                <Text className="text-textPrimary text-base font-bold">
                  {t("recommender.done")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View />
        )}
      </Modal>
    </View>
  );
}

function OptionChip({
  active,
  label,
  onPress,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className={`rounded-full px-4 min-h-[44px] justify-center border ${
        active ? "bg-green-500/15 border-accentSoft" : "bg-background border-surfaceDeep"
      }`}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text
        className={`text-sm font-semibold ${active ? "text-accentSoft" : "text-textPrimary"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
