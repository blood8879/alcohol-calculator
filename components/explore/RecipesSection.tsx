import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FlatList, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Modal from "react-native-modal";

import { cocktailRecipes } from "../../data/cocktailRecipes";
import { extendedCocktailRecipes } from "../../data/extendedContent";
import { CocktailRecipe } from "../../data/types";
import { translateWithFallback } from "../../utils/localizedText";
import RecipeCard from "../RecipeCard";
import RecipeDetail from "../RecipeDetail";
import InlineBannerAd from "../InlineBannerAd";
import RecipeRecommenderPanel from "../RecipeRecommenderPanel";
import EmptyState from "../ui/EmptyState";
import { logContentSearch } from "../../utils/contentAnalytics";
import {
  DEFAULT_RECIPE_FILTERS,
  filterRecipeList,
  RecipeFilterState,
} from "../../utils/engagement/recipeFilters";

const ALL_RECIPES: readonly CocktailRecipe[] = [...cocktailRecipes, ...extendedCocktailRecipes];

export default function RecipesSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  // 스타일(전체/한국/글로벌)은 목록과 맞춤 추천이 공유하는 단일 상태.
  const [filters, setFilters] = useState<RecipeFilterState>(DEFAULT_RECIPE_FILTERS);
  const [selectedRecipe, setSelectedRecipe] = useState<CocktailRecipe | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredRecipes = useMemo(
    () =>
      filterRecipeList(ALL_RECIPES, filters.style, searchQuery, (recipe) =>
        translateWithFallback(t, recipe.nameKey, recipe.displayName, i18n.language)
      ),
    [searchQuery, filters.style, t, i18n.language]
  );

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchQuery.trim()) searchTimer.current = setTimeout(() => logContentSearch("recipes", searchQuery, filteredRecipes.length), 700);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, filteredRecipes.length]);

  const handleCardPress = useCallback((recipe: CocktailRecipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedRecipe(null), 300);
  }, []);

  const handleOpenGuide = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => {
      router.push("/(tabs)/explore?section=encyclopedia&guide=standard-drink");
      setSelectedRecipe(null);
    }, 300);
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: CocktailRecipe; index: number }) => (
      <>
        <RecipeCard recipe={item} onPress={() => handleCardPress(item)} />
        {(index + 1) % 8 === 0 && <InlineBannerAd className="mb-3" />}
      </>
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: CocktailRecipe) => item.id, []);

  return (
    <View className="flex-1">
      <View className="mb-3">
        <TextInput
          className="bg-surface text-textPrimary rounded-xl px-4 py-3 text-base min-h-[48px]"
          placeholder={t("recipes.searchPlaceholder")}
          placeholderTextColor="#8b93a1"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t("recipes.searchPlaceholder")}
        />
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <RecipeRecommenderPanel
            recipes={ALL_RECIPES}
            filters={filters}
            onChangeFilters={setFilters}
            onSelectRecipe={handleCardPress}
          />
        }
        ListEmptyComponent={
          <EmptyState emoji="🔍" title={t("recipes.searchPlaceholder")} />
        }
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleClose}
        onBackButtonPress={handleClose}
        onSwipeComplete={handleClose}
        swipeDirection={["down"]}
        style={{ justifyContent: "flex-end", margin: 0 }}
        propagateSwipe={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        {selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            onClose={handleClose}
            onOpenGuide={handleOpenGuide}
          />
        ) : (
          <View />
        )}
      </Modal>
    </View>
  );
}
