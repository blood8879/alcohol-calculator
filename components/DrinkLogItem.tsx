import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DrinkLog } from "../utils/trackerStorage";

interface DrinkLogItemProps {
  log: DrinkLog;
  onDelete: (id: string) => void;
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const DrinkLogItem = ({ log, onDelete }: DrinkLogItemProps) => {
  const { t } = useTranslation();
  return (
    <View className="bg-gray-800 rounded-xl p-4 mb-3 flex-row items-center">
      <Text className="text-3xl mr-3">{log.emoji}</Text>

      <View className="flex-1 mr-2">
        <Text className="text-white text-base font-semibold" numberOfLines={1}>
          {log.name}
        </Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          {log.volume}{t("units.ml")} · {log.abv}% · {Math.round(log.calories)} {t("units.kcal")}
        </Text>
        <Text className="text-gray-500 text-xs mt-0.5">
          {formatTime(log.timestamp)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onDelete(log.id)}
        className="p-2"
        activeOpacity={0.6}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

export default DrinkLogItem;
