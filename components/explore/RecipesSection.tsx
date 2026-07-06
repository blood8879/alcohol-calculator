import React, { useState, useMemo, useCallback } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

type CategoryFilter = "all" | "korean" | "global";

const FILTER_TABS: CategoryFilter[] = ["all", "korean", "global"];

export default function RecipesSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<CocktailRecipe | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const allRecipes = [...cocktailRecipes, ...extendedCocktailRecipes];

    return allRecipes.filter((recipe) => {
      if (activeFilter !== "all" && recipe.category !== activeFilter) {
        return false;
      }
      if (query) {
        const translatedName = translateWithFallback(t, recipe.nameKey, recipe.displayName, i18n.language).toLowerCase();
        return translatedName.includes(query);
      }
      return true;
    });
  }, [searchQuery, activeFilter, t, i18n.language]);

  const allRecipes = useMemo(
    () => [...cocktailRecipes, ...extendedCocktailRecipes],
    []
  );

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
          className="bg-gray-800 text-white rounded-xl px-4 py-3 text-base"
          placeholder={t("recipes.searchPlaceholder")}
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t("recipes.searchPlaceholder")}
        />
      </View>

      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                className={`rounded-full px-4 py-2 ${
                  isActive ? "bg-green-500" : "bg-gray-800"
                }`}
                onPress={() => setActiveFilter(tab)}
                accessibilityRole="button"
                accessibilityLabel={t(`recipes.filter.${tab}`)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {t(`recipes.filter.${tab}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <RecipeRecommenderPanel recipes={allRecipes} onSelectRecipe={handleCardPress} />

      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-4xl mb-3">🔍</Text>
            <Text className="text-gray-500 text-base">
              {t("recipes.searchPlaceholder")}
            </Text>
          </View>
        }
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleClose}
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
