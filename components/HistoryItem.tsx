import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { CalculationHistory } from "../utils/historyStorage";

interface HistoryItemProps {
  item: CalculationHistory;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function useFormatTimestamp() {
  const { t } = useTranslation();
  return (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return t("time.justNow");
    if (minutes < 60) return t("time.minutesAgo", { count: minutes });
    if (hours < 24) return t("time.hoursAgo", { count: hours });
    if (days < 7) return t("time.daysAgo", { count: days });

    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };
}

const HistoryItem = ({ item, onDelete, onToggleFavorite }: HistoryItemProps) => {
  const formatTimestamp = useFormatTimestamp();
  const firstResult = item.results.length > 0 ? item.results[0].value : "";

  return (
    <View className="bg-gray-800 rounded-xl p-4 mb-3 flex-row items-center">
      <Text className="text-2xl mr-3">{item.calculatorIcon}</Text>

      <View className="flex-1 mr-2">
        <Text className="text-white text-base font-semibold" numberOfLines={1}>
          {item.calculatorType}
        </Text>
        {firstResult ? (
          <Text className="text-green-400 text-sm mt-0.5" numberOfLines={1}>
            {firstResult}
          </Text>
        ) : null}
        <Text className="text-gray-500 text-xs mt-0.5">
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onToggleFavorite(item.id)}
        className="p-2"
        activeOpacity={0.6}
      >
        <Ionicons
          name={item.isFavorite ? "star" : "star-outline"}
          size={20}
          color={item.isFavorite ? "#FBBF24" : "#6B7280"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        className="p-2"
        activeOpacity={0.6}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

export default HistoryItem;
