import React, { useState, useMemo, useCallback } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Modal from "react-native-modal";

import { cocktailRecipes } from "../../data/cocktailRecipes";
import { CocktailRecipe } from "../../data/types";
import RecipeCard from "../../components/RecipeCard";
import RecipeDetail from "../../components/RecipeDetail";

type CategoryFilter = "all" | "korean" | "global";

const FILTER_TABS: CategoryFilter[] = ["all", "korean", "global"];

export default function RecipesScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<CocktailRecipe | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return cocktailRecipes.filter((recipe) => {
      if (activeFilter !== "all" && recipe.category !== activeFilter) {
        return false;
      }
      if (query) {
        const translatedName = t(recipe.nameKey).toLowerCase();
        return translatedName.includes(query);
      }
      return true;
    });
  }, [searchQuery, activeFilter, t]);

  const handleCardPress = useCallback((recipe: CocktailRecipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedRecipe(null), 300);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CocktailRecipe }) => (
      <RecipeCard recipe={item} onPress={() => handleCardPress(item)} />
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: CocktailRecipe) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />

      <View className="px-4 pt-2 pb-3">
        <Text className="text-2xl font-bold text-white mb-1">
          {t("recipes.title")}
        </Text>
      </View>

      <View className="px-4 mb-3">
        <TextInput
          className="bg-gray-800 text-white rounded-xl px-4 py-3 text-base"
          placeholder={t("recipes.searchPlaceholder")}
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View className="px-4 mb-4">
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

      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
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
          <RecipeDetail recipe={selectedRecipe} onClose={handleClose} />
        ) : (
          <View />
        )}
      </Modal>
    </SafeAreaView>
  );
}
