import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CocktailRecipe } from "../data/types";
import { translateWithFallback } from "../utils/localizedText";
import { calculateRecipeMetrics } from "../utils/engagement/recipeRecommender";
import Card from "./ui/Card";

type RecipeCardProps = {
  recipe: CocktailRecipe;
  onPress: () => void;
};

const difficultyColors: Record<CocktailRecipe["difficulty"], string> = {
  easy: "bg-accentButton",
  medium: "bg-amber-700",
  hard: "bg-red-700",
};

// Crouton 패턴 컴팩트 행: 이모지 + 이름 / 난이도·카테고리 뱃지 + `도수% · kcal` 메타 + ›
const RecipeCard = ({ recipe, onPress }: RecipeCardProps) => {
  const { t, i18n } = useTranslation();

  const name = translateWithFallback(t, recipe.nameKey, recipe.displayName, i18n.language);
  const difficultyLabel = t(`recipes.${recipe.difficulty}`);
  // 상세 요약 카드와 같은 순수 함수를 재사용(계산 중복 금지).
  const { estimatedAbv, estimatedCalories } = useMemo(
    () => calculateRecipeMetrics(recipe),
    [recipe]
  );
  const meta = `${estimatedAbv.toFixed(1)}% · ${estimatedCalories} kcal`;

  return (
    <Card
      className="mb-2 py-2.5 min-h-[56px] flex-row items-center"
      onPress={onPress}
      accessibilityLabel={`${name}, ${difficultyLabel}, ${t(`recipes.filter.${recipe.category}`)}, ${meta}`}
    >
      <Text className="text-2xl mr-3">{recipe.emoji}</Text>

      <View className="flex-1">
        <Text className="text-textPrimary text-base font-bold" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center mt-1 gap-1.5">
          <View className={`${difficultyColors[recipe.difficulty]} rounded-full px-2 py-0.5`}>
            <Text className="text-white text-xs font-semibold">
              {difficultyLabel}
            </Text>
          </View>
          <View className="bg-surfaceDeep rounded-full px-2 py-0.5">
            <Text className="text-gray-300 text-xs font-medium">
              {t(`recipes.filter.${recipe.category}`)}
            </Text>
          </View>
          <Text className="text-textSecondary text-xs ml-1 flex-shrink" numberOfLines={1}>
            {meta}
          </Text>
        </View>
      </View>

      <Text className="text-textMuted text-xl ml-2">›</Text>
    </Card>
  );
};

export default RecipeCard;
