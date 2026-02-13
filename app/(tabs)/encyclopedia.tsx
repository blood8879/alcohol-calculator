import React, { useState, useMemo } from "react";
import { FlatList, StatusBar, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { encyclopediaData } from "../../data/encyclopediaData";
import EncyclopediaCard from "../../components/EncyclopediaCard";

export default function EncyclopediaScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return encyclopediaData;
    const query = search.toLowerCase();
    return encyclopediaData.filter((entry) =>
      t(entry.nameKey).toLowerCase().includes(query)
    );
  }, [search, t]);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />

      <View className="p-4 flex-1">
        <Text className="text-2xl font-bold text-white mb-4">
          {t("tabs.encyclopedia")}
        </Text>

        <TextInput
          className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4"
          placeholder={t("encyclopedia.searchPlaceholder")}
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EncyclopediaCard entry={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-4xl mb-4">🔍</Text>
              <Text className="text-gray-400 text-base">
                {t("encyclopedia.search")}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
