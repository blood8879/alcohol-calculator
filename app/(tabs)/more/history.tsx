import React, { useCallback, useState } from "react";
import {
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
import EmptyState from "../../../components/ui/EmptyState";
import { useDialog } from "../../../components/ui/DialogProvider";
import { logCalculatorHistoryOpened, logCalculatorHistoryAction } from "../../../utils/calculatorAnalytics";

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { confirm } = useDialog();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await getHistory();
    setHistory(data);
    return data;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then((data) => logCalculatorHistoryOpened(data.length));
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    logCalculatorHistoryAction("delete_tapped");
    await deleteCalculation(id);
    await loadHistory();
  };

  const handleToggleFavorite = async (id: string) => {
    logCalculatorHistoryAction("favorite_tapped");
    await toggleFavorite(id);
    await loadHistory();
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: t("history.clearAll"),
      message: t("history.confirmClear"),
      cancelLabel: t("common.cancel"),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (!confirmed) return;
    logCalculatorHistoryAction("clear_confirmed");
    await clearHistory();
    await loadHistory();
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center py-32">
      <EmptyState emoji="🕒" title={t("history.empty")} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">{t("history.title")}</Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("history.clearAll")}
          >
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
