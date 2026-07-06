import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CocktailRecipe } from "../data/types";
import { translateWithFallback } from "../utils/localizedText";
import Card from "./ui/Card";

type RecipeCardProps = {
  recipe: CocktailRecipe;
  onPress: () => void;
};

const difficultyColors: Record<CocktailRecipe["difficulty"], string> = {
  easy: "bg-emerald-600",
  medium: "bg-amber-500",
  hard: "bg-red-500",
};

const RecipeCard = ({ recipe, onPress }: RecipeCardProps) => {
  const { t, i18n } = useTranslation();

  const name = translateWithFallback(t, recipe.nameKey, recipe.displayName, i18n.language);
  const difficultyLabel = t(`recipes.${recipe.difficulty}`);

  return (
    <Card
      className="mb-3 flex-row items-center"
      onPress={onPress}
      accessibilityLabel={name}
    >
      <Text className="text-3xl mr-4">{recipe.emoji}</Text>

      <View className="flex-1">
        <Text className="text-white text-lg font-bold" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center mt-1.5 gap-2">
          <View className={`${difficultyColors[recipe.difficulty]} rounded-full px-2.5 py-0.5`}>
            <Text className="text-white text-xs font-semibold">
              {difficultyLabel}
            </Text>
          </View>
          <View className="bg-gray-700 rounded-full px-2.5 py-0.5">
            <Text className="text-gray-300 text-xs font-medium">
              {t(`recipes.filter.${recipe.category}`)}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-gray-500 text-xl ml-2">›</Text>
    </Card>
  );
};

export default RecipeCard;
