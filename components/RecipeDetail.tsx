import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CocktailRecipe, RecipeIngredient } from "../data/types";
import InlineBannerAd from "./InlineBannerAd";
import { isFavorite, toggleFavorite, addRecentContent } from "../utils/contentStorage";
import { calculateRecipeMetrics } from "../utils/engagement/recipeRecommender";
import { translateWithFallback, pickLocalizedText } from "../utils/localizedText";
import { getRecipeExtra } from "../data/recipeExtras";
import Card from "./ui/Card";

type RecipeDetailProps = {
  recipe: CocktailRecipe;
  onClose: () => void;
  onOpenGuide?: () => void;
};

const difficultyColors: Record<CocktailRecipe["difficulty"], string> = {
  easy: "bg-emerald-600",
  medium: "bg-amber-500",
  hard: "bg-red-500",
};

const RecipeDetail = ({ recipe, onClose, onOpenGuide }: RecipeDetailProps) => {
  const { t, i18n } = useTranslation();

  const name = translateWithFallback(t, recipe.nameKey, recipe.displayName, i18n.language);
  const instructions = translateWithFallback(t, recipe.instructionsKey, recipe.instructions, i18n.language);
  const difficultyLabel = t(`recipes.${recipe.difficulty}`);
  const extra = getRecipeExtra(recipe.id);
  const isKorean = i18n.language.startsWith("ko");
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    isFavorite("recipe", recipe.id).then(setFavorite);
    addRecentContent({
      kind: "recipe",
      id: recipe.id,
      label: name,
      emoji: recipe.emoji,
      viewedAt: Date.now(),
    });
  }, [name, recipe.emoji, recipe.id]);

  const handleToggleFavorite = async () => {
    const nextFavorite = await toggleFavorite({
      kind: "recipe",
      id: recipe.id,
      label: name,
      emoji: recipe.emoji,
      viewedAt: Date.now(),
    });
    setFavorite(nextFavorite);
  };

  const { totalVolumeMl, estimatedAbv, estimatedCalories } = useMemo(
    () => calculateRecipeMetrics(recipe),
    [recipe]
  );

  const resolveIngredientName = (ingredient: RecipeIngredient): string => {
    return translateWithFallback(t, ingredient.nameKey, ingredient.name, i18n.language);
  };

  return (
    <View className="bg-gray-900 rounded-t-3xl max-h-[92%]">
      <View className="items-center pt-3 pb-2">
        <View className="w-10 h-1 bg-gray-600 rounded-full" />
      </View>

      <ScrollView
        className="px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="items-center py-4">
          <View className="w-full flex-row justify-end mb-1">
            <TouchableOpacity
              className={`rounded-full px-3 py-1.5 ${favorite ? "bg-yellow-500" : "bg-gray-800"}`}
              onPress={handleToggleFavorite}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={favorite ? t("history.unfavorite") : t("history.favorite")}
            >
              <Text className={favorite ? "text-gray-900 font-bold" : "text-gray-300 font-semibold"}>
                {favorite ? "★" : "☆"} {i18n.language.startsWith("ko") ? "즐겨찾기" : "Favorite"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 60 }}>{recipe.emoji}</Text>
          <Text className="text-white text-2xl font-bold mt-3 text-center">
            {name}
          </Text>
          <View className="flex-row items-center mt-3 gap-2">
            <View className={`${difficultyColors[recipe.difficulty]} rounded-full px-3 py-1`}>
              <Text className="text-white text-sm font-semibold">
                {difficultyLabel}
              </Text>
            </View>
            <View className="bg-gray-700 rounded-full px-3 py-1">
              <Text className="text-gray-300 text-sm font-medium">
                {t(`recipes.filter.${recipe.category}`)}
              </Text>
            </View>
          </View>
        </View>

        <View className="border-t border-gray-700 pt-4 mt-2">
          <Text className="text-white text-lg font-bold mb-3">
            {t("recipes.ingredientsTitle")}
          </Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-200 text-base">
                  {resolveIngredientName(ingredient)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-base">
                  {ingredient.volume} {ingredient.unit}
                </Text>
                {ingredient.abv > 0 && (
                  <Text className="text-amber-400 text-sm ml-2">
                    ({ingredient.abv}%)
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View className="border-t border-gray-700 pt-4 mt-4">
          <Text className="text-white text-lg font-bold mb-3">
            {t("recipes.instructions")}
          </Text>
          <Text className="text-gray-300 text-base leading-6">
            {instructions}
          </Text>
        </View>

        {extra?.origin && (
          <View className="border-t border-gray-700 pt-4 mt-4">
            <Text className="text-white text-lg font-bold mb-2">
              {isKorean ? "유래 & 배경" : "Origin & background"}
            </Text>
            <Text className="text-gray-300 text-base leading-6">
              {pickLocalizedText(extra.origin, i18n.language)}
            </Text>
          </View>
        )}

        {extra?.tips && extra.tips.length > 0 && (
          <View className="border-t border-gray-700 pt-4 mt-4">
            <Text className="text-white text-lg font-bold mb-3">
              {isKorean ? "만들기 팁" : "Tips"}
            </Text>
            {extra.tips.map((tip, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-green-400 mr-2">•</Text>
                <Text className="text-gray-300 text-base leading-6 flex-1">
                  {pickLocalizedText(tip, i18n.language)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {extra?.garnish && (
          <View className="flex-row items-center mt-4">
            <Text className="text-gray-400 text-sm mr-2">
              {isKorean ? "🍃 가니시" : "🍃 Garnish"}
            </Text>
            <Text className="text-gray-200 text-sm font-medium flex-1">
              {pickLocalizedText(extra.garnish, i18n.language)}
            </Text>
          </View>
        )}

        <Card className="mt-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400 text-sm">{t("recipes.totalVolume")}</Text>
            <Text className="text-white text-sm font-semibold">
              {totalVolumeMl} ml
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400 text-sm">
              {t("recipes.totalAbv")}
            </Text>
            <Text className="text-emerald-400 text-sm font-semibold">
              {estimatedAbv.toFixed(1)}%
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-sm">
              {t("recipes.totalCalories")}
            </Text>
            <Text className="text-amber-400 text-sm font-semibold">
              {estimatedCalories} kcal
            </Text>
          </View>
        </Card>

        {onOpenGuide && (
          <TouchableOpacity
            className="border border-green-600 rounded-xl p-3.5 mt-4"
            onPress={onOpenGuide}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={
              i18n.language.startsWith("ko") ? "표준잔 가이드 보기" : "Open standard drink guide"
            }
          >
            <Text className="text-green-400 text-center font-semibold text-base">
              {i18n.language.startsWith("ko") ? "표준잔 가이드 보기" : "Open standard drink guide"}
            </Text>
          </TouchableOpacity>
        )}

        <InlineBannerAd className="mt-5 mb-1" />

        <TouchableOpacity
          className="border border-gray-600 rounded-xl p-3.5 mt-5"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.reset")}
        >
          <Text className="text-gray-300 text-center font-semibold text-base">
            {t("common.reset")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RecipeDetail;
