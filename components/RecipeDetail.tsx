import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CocktailRecipe, RecipeIngredient } from "../data/types";

type RecipeDetailProps = {
  recipe: CocktailRecipe;
  onClose: () => void;
};

const difficultyColors: Record<CocktailRecipe["difficulty"], string> = {
  easy: "bg-emerald-600",
  medium: "bg-amber-500",
  hard: "bg-red-500",
};

const RecipeDetail = ({ recipe, onClose }: RecipeDetailProps) => {
  const { t } = useTranslation();

  const name = t(recipe.nameKey);
  const instructions = t(recipe.instructionsKey);
  const difficultyLabel = t(`recipes.${recipe.difficulty}`);

  const { totalVolumeMl, estimatedAbv, estimatedCalories } = useMemo(() => {
    const mlIngredients = recipe.ingredients.filter((ing) => ing.unit === "ml");
    const totalMl = mlIngredients.reduce((sum, ing) => sum + ing.volume, 0);
    const alcoholMl = mlIngredients.reduce(
      (sum, ing) => sum + ing.volume * (ing.abv / 100),
      0
    );
    const abv = totalMl > 0 ? (alcoholMl / totalMl) * 100 : 0;
    const calories = totalMl * (abv / 100) * 0.789 * 7;

    return {
      totalVolumeMl: totalMl,
      estimatedAbv: abv,
      estimatedCalories: calories,
    };
  }, [recipe.ingredients]);

  const resolveIngredientName = (ingredient: RecipeIngredient): string => {
    return t(ingredient.nameKey);
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

        <View className="bg-gray-800 rounded-xl p-4 mt-6">
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
              {Math.round(estimatedCalories)} kcal
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="border border-gray-600 rounded-xl p-3.5 mt-5"
          onPress={onClose}
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
