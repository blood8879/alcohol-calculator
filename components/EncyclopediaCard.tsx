import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { EncyclopediaEntry } from "../data/types";

type EncyclopediaCardProps = {
  entry: EncyclopediaEntry;
};

const EncyclopediaCard = ({ entry }: EncyclopediaCardProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setExpanded(!expanded)}
      className="bg-gray-800 rounded-xl p-4 mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Text className="text-2xl mr-3">{entry.emoji}</Text>
          <Text className="text-white text-lg font-bold">
            {t(entry.nameKey)}
          </Text>
        </View>
        <View className="bg-green-600/20 rounded-full px-2 py-1">
          <Text className="text-green-400 text-xs font-semibold">
            {entry.abvMin}–{entry.abvMax}%
          </Text>
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
            value={t(entry.originKey)}
          />
          <InfoRow
            label={`🌡️  ${t("encyclopedia.servingTemp")}`}
            value={t(entry.servingTempKey)}
          />
          <InfoRow
            label={`🍽️  ${t("encyclopedia.pairing")}`}
            value={t(entry.pairingKey)}
          />

          <View className="mt-3">
            <Text className="text-gray-400 text-sm mb-1">
              📝  {t("encyclopedia.description")}
            </Text>
            <Text className="text-white text-sm leading-5">
              {t(entry.descriptionKey)}
            </Text>
          </View>
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
