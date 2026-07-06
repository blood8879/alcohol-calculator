import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { EncyclopediaEntry } from "../data/types";
import { getGuideDetail } from "../data/guideDetails";
import type { GuideDetail } from "../data/guideDetails";
import GuideDetailPanel from "./GuideDetailPanel";
import { isFavorite, toggleFavorite, addRecentContent } from "../utils/contentStorage";
import { translateWithFallback } from "../utils/localizedText";

type EncyclopediaCardProps = {
  entry: EncyclopediaEntry;
  initialExpanded?: boolean;
  onOpenTarget?: (target: GuideDetail["nextStep"]["target"]) => void;
};

const EncyclopediaCard = ({ entry, initialExpanded = false, onOpenTarget }: EncyclopediaCardProps) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const name = translateWithFallback(t, entry.nameKey, entry.displayName, i18n.language);
  const origin = translateWithFallback(t, entry.originKey, entry.origin, i18n.language);
  const servingTemp = translateWithFallback(t, entry.servingTempKey, entry.servingTemp, i18n.language);
  const pairing = translateWithFallback(t, entry.pairingKey, entry.pairing, i18n.language);
  const description = translateWithFallback(t, entry.descriptionKey, entry.description, i18n.language);
  const guideDetail = getGuideDetail(entry.id);

  useEffect(() => {
    isFavorite("encyclopedia", entry.id).then(setFavorite);
  }, [entry.id]);

  useEffect(() => {
    if (initialExpanded) {
      setExpanded(true);
    }
  }, [initialExpanded]);

  const handlePress = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      addRecentContent({
        kind: "encyclopedia",
        id: entry.id,
        label: name,
        emoji: entry.emoji,
        viewedAt: Date.now(),
      });
    }
  };

  const handleToggleFavorite = async () => {
    const nextFavorite = await toggleFavorite({
      kind: "encyclopedia",
      id: entry.id,
      label: name,
      emoji: entry.emoji,
      viewedAt: Date.now(),
    });
    setFavorite(nextFavorite);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ expanded }}
      className="bg-gray-800 rounded-xl p-4 mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Text className="text-2xl mr-3">{entry.emoji}</Text>
          <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`rounded-full px-2 py-1 mr-2 ${favorite ? "bg-yellow-500" : "bg-gray-700"}`}
            onPress={handleToggleFavorite}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={favorite ? t("history.unfavorite") : t("history.favorite")}
          >
            <Text className={favorite ? "text-gray-900 text-xs font-bold" : "text-gray-300 text-xs font-bold"}>
              {favorite ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
          <View className="bg-green-600/20 rounded-full px-2 py-1">
            <Text className="text-green-400 text-xs font-semibold">
              {entry.abvMin}–{entry.abvMax}%
            </Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View className="mt-4 pt-3 border-t border-gray-700">
          <InfoRow
            label={`🔥  ${t("encyclopedia.calories")}`}
            value={`${entry.caloriesPer100ml} kcal / 100ml`}
          />
          <InfoRow
            label={`🌍  ${t("encyclopedia.origin")}`}
            value={origin}
          />
          <InfoRow
            label={`🌡️  ${t("encyclopedia.servingTemp")}`}
            value={servingTemp}
          />
          <InfoRow
            label={`🍽️  ${t("encyclopedia.pairing")}`}
            value={pairing}
          />

          <View className="mt-3">
            <Text className="text-gray-400 text-sm mb-1">
              📝  {t("encyclopedia.description")}
            </Text>
            <Text className="text-white text-sm leading-5">
              {description}
            </Text>
          </View>

          {guideDetail && onOpenTarget && (
            <GuideDetailPanel guide={guideDetail} onPressTarget={onOpenTarget} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-start justify-between mb-2">
    <Text className="text-gray-400 text-sm flex-shrink-0 mr-3">{label}</Text>
    <Text className="text-white text-sm text-right flex-1 flex-shrink">
      {value}
    </Text>
  </View>
);

export default EncyclopediaCard;
