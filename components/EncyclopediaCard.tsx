import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { EncyclopediaEntry } from "../data/types";
import { getGuideDetail } from "../data/guideDetails";
import type { GuideDetail } from "../data/guideDetails";
import GuideDetailPanel from "./GuideDetailPanel";
import { isFavorite, toggleFavorite, addRecentContent } from "../utils/contentStorage";
import { translateWithFallback } from "../utils/localizedText";
import { logContentViewed, logGuideViewed, logContentFavorite } from "../utils/contentAnalytics";

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
      logContentViewed("encyclopedia", entry.id);
      if (guideDetail) logGuideViewed(entry.id);
    }
  }, [initialExpanded, entry.id, guideDetail]);

  const handlePress = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      logContentViewed("encyclopedia", entry.id);
      if (guideDetail) logGuideViewed(entry.id);
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
    if (nextFavorite !== null) {
      setFavorite(nextFavorite);
      logContentFavorite("encyclopedia", entry.id, nextFavorite);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ expanded }}
      className="bg-surface rounded-xl px-4 py-1.5 mb-2"
    >
      {/* 접힘 행: ~52–56pt 컴팩트(LookUp 단어장 행 패턴). 즐겨찾기는 32pt + hitSlop으로 44pt 확보 */}
      <View className="flex-row items-center justify-between min-h-[44px]">
        <View className="flex-row items-center flex-1 mr-2">
          <Text className="text-xl mr-3">{entry.emoji}</Text>
          <Text className="text-textPrimary text-base font-bold flex-1" numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View className="flex-row items-center">
          {/* 터치·스크린리더 포커스 영역은 44pt, 보이는 원은 32pt(hitSlop은 접근성 포커스 영역을 넓히지 않음) */}
          <TouchableOpacity
            className="items-center justify-center mr-1"
            style={{ width: 44, height: 44, flexShrink: 0 }}
            onPress={handleToggleFavorite}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={favorite ? t("history.unfavorite") : t("history.favorite")}
            accessibilityState={{ selected: favorite }}
          >
            <View className={`w-8 h-8 rounded-full items-center justify-center ${favorite ? "bg-yellow-500" : "bg-surfaceDeep"}`}>
              <Text className={favorite ? "text-gray-900 text-sm font-bold" : "text-gray-300 text-sm font-bold"}>
                {favorite ? "★" : "☆"}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="bg-green-600/20 rounded-full px-2 py-1 min-w-[64px] items-center">
            <Text className="text-accentSoft text-xs font-semibold">
              {entry.abvMin}–{entry.abvMax}%
            </Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View className="mt-2.5 mb-2.5 pt-3 border-t border-surfaceDeep">
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
            <Text className="text-textSecondary text-sm mb-1">
              📝  {t("encyclopedia.description")}
            </Text>
            <Text className="text-textPrimary text-sm leading-5">
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
    <Text className="text-textSecondary text-sm flex-shrink-0 mr-3">{label}</Text>
    <Text className="text-textPrimary text-sm text-right flex-1 flex-shrink">
      {value}
    </Text>
  </View>
);

export default EncyclopediaCard;
