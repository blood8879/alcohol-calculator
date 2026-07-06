import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { CocktailRecipe } from "../data/types";
import {
  getAvailableIngredientOptions,
  matchRecipes,
  RecipeMatch,
} from "../utils/engagement/recipeRecommender";
import { translateWithFallback } from "../utils/localizedText";
import Card from "./ui/Card";

type RecipeRecommenderPanelProps = {
  readonly recipes: readonly CocktailRecipe[];
  readonly onSelectRecipe: (recipe: CocktailRecipe) => void;
  readonly className?: string;
};

type StyleFilter = "all" | "global" | "korean";

const MAX_RESULTS = 8;
const STYLE_FILTERS: readonly StyleFilter[] = ["all", "korean", "global"];
const ABV_FILTERS = [8, 12, 18] as const;
const CALORIE_FILTERS = [120, 180, 260] as const;

export default function RecipeRecommenderPanel({
  recipes,
  onSelectRecipe,
  className = "mx-4 mb-4",
}: RecipeRecommenderPanelProps) {
  const { t, i18n } = useTranslation();
  const [selectedIngredientKeys, setSelectedIngredientKeys] = useState<readonly string[]>([]);
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("all");
  const [maxAbv, setMaxAbv] = useState<number | undefined>(12);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(180);

  const options = useMemo(() => getAvailableIngredientOptions(recipes).slice(0, 10), [recipes]);
  const matches = useMemo(
    () =>
      matchRecipes({
        recipes,
        selectedIngredientKeys,
        maxAbv,
        maxCalories,
        style: styleFilter === "all" ? undefined : styleFilter,
      }).slice(0, MAX_RESULTS),
    [maxAbv, maxCalories, recipes, selectedIngredientKeys, styleFilter]
  );
  const toggleIngredient = (key: string) => {
    setSelectedIngredientKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
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
        className="bg-gray-900 rounded-xl p-3 mr-3 w-52"
        onPress={() => onSelectRecipe(match.recipe)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={name}
      >
        <Text className="text-3xl mb-2">{match.recipe.emoji}</Text>
        <Text className="text-white text-base font-bold" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {match.metrics.estimatedAbv.toFixed(1)}% - {match.metrics.estimatedCalories} kcal
        </Text>
        <Text className="text-green-400 text-xs font-semibold mt-2">
          {t("recommender.openDetails")} ›
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Card className={className}>
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-white text-lg font-bold">
            {t("recommender.title")}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            {t("recommender.subtitle")}
          </Text>
        </View>
      </View>

      <FilterRow title={t("recommender.style")}>
        {STYLE_FILTERS.map((filter) => (
          <FilterChip
            key={filter}
            active={styleFilter === filter}
            label={filter === "all" ? t("recommender.all") : t(`recipes.filter.${filter}`)}
            onPress={() => setStyleFilter(filter)}
          />
        ))}
      </FilterRow>

      <FilterRow title={t("recommender.maxAbv")}>
        {ABV_FILTERS.map((filter) => (
          <FilterChip
            key={filter}
            active={maxAbv === filter}
            label={`${filter}%`}
            onPress={() => setMaxAbv(maxAbv === filter ? undefined : filter)}
          />
        ))}
      </FilterRow>

      <FilterRow title={t("recommender.maxCalories")}>
        {CALORIE_FILTERS.map((filter) => (
          <FilterChip
            key={filter}
            active={maxCalories === filter}
            label={`${filter}`}
            onPress={() => setMaxCalories(maxCalories === filter ? undefined : filter)}
          />
        ))}
      </FilterRow>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        {options.map((option) => {
          const selected = selectedIngredientKeys.includes(option.key);
          return (
            <TouchableOpacity
              key={option.key}
              className={`rounded-full px-3 py-2 mr-2 ${selected ? "bg-green-600" : "bg-gray-700"}`}
              onPress={() => toggleIngredient(option.key)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={translateWithFallback(t, option.labelKey, option.name, i18n.language)}
              accessibilityState={{ selected }}
            >
              <Text className="text-white text-xs font-semibold">
                {translateWithFallback(t, option.labelKey, option.name, i18n.language)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {matches.length > 0 ? (
          matches.map(renderMatch)
        ) : (
          <View className="bg-gray-900 rounded-xl p-4 flex-1">
            <Text className="text-white font-bold">
              {t("recommender.emptyTitle")}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {t("recommender.emptySubtitle")}
            </Text>
          </View>
        )}
      </ScrollView>
    </Card>
  );
}

function FilterRow({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <View className="mb-3">
      <Text className="text-gray-400 text-xs font-bold mb-2">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

function FilterChip({
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
      className={`rounded-full px-3 py-2 mr-2 ${active ? "bg-green-600" : "bg-gray-700"}`}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text className="text-white text-xs font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}
