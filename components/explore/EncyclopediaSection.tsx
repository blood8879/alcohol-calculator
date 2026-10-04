import React, { useState, useMemo, useEffect, useRef } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { encyclopediaData } from "../../data/encyclopediaData";
import { extendedEncyclopediaEntries } from "../../data/extendedContent";
import EncyclopediaCard from "../EncyclopediaCard";
import InlineBannerAd from "../InlineBannerAd";
import { translateWithFallback } from "../../utils/localizedText";
import { logContentSearch, isCatalogContentId } from "../../utils/contentAnalytics";

type EncyclopediaSectionProps = {
  readonly initialGuide?: string;
};

export default function EncyclopediaSection({ initialGuide }: EncyclopediaSectionProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validatedGuide = typeof initialGuide === "string" && isCatalogContentId("encyclopedia", initialGuide) ? initialGuide : undefined;

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

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (search.trim()) searchTimer.current = setTimeout(() => logContentSearch("encyclopedia", search, filteredData.length), 700);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, filteredData.length]);

  return (
    <View className="flex-1">
      <TextInput
        className="bg-surface text-textPrimary rounded-xl px-4 py-3 mb-3"
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
              initialExpanded={validatedGuide === item.id}
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
