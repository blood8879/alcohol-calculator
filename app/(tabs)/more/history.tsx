import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  CalculationHistory,
  clearHistory,
  deleteCalculation,
  getHistory,
  toggleFavorite,
} from "../../../utils/historyStorage";
import HistoryItem from "../../../components/HistoryItem";

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await getHistory();
    setHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCalculation(id);
    await loadHistory();
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
    await loadHistory();
  };

  const handleClearAll = () => {
    Alert.alert(
      t("history.clearAll"),
      t("history.confirmClear"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            await loadHistory();
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-32">
      <Ionicons name="time-outline" size={64} color="#4B5563" />
      <Text className="text-lg font-semibold text-gray-400 mt-4">
        {t("history.empty")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">{t("history.title")}</Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
            <Text className="text-red-400 text-sm font-medium">{t("history.clearAll")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}
