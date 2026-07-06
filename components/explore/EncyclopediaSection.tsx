import React, { useState, useMemo } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { encyclopediaData } from "../../data/encyclopediaData";
import { extendedEncyclopediaEntries } from "../../data/extendedContent";
import EncyclopediaCard from "../EncyclopediaCard";
import InlineBannerAd from "../InlineBannerAd";
import { translateWithFallback } from "../../utils/localizedText";

type EncyclopediaSectionProps = {
  readonly initialGuide?: string;
};

export default function EncyclopediaSection({ initialGuide }: EncyclopediaSectionProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const allEntries = [...encyclopediaData, ...extendedEncyclopediaEntries];
    if (!search.trim()) return allEntries;
    const query = search.toLowerCase();
    return allEntries.filter((entry) =>
      translateWithFallback(t, entry.nameKey, entry.displayName, i18n.language)
        .toLowerCase()
        .includes(query)
    );
  }, [search, t, i18n.language]);

  return (
    <View className="flex-1">
      <TextInput
        className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4"
        placeholder={t("encyclopedia.searchPlaceholder")}
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        accessibilityLabel={t("encyclopedia.searchPlaceholder")}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <>
            <EncyclopediaCard
              entry={item}
              initialExpanded={initialGuide === item.id}
              onOpenTarget={router.push}
            />
            {(index + 1) % 8 === 0 && <InlineBannerAd className="mb-3" />}
          </>
        )}
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
  );
}
