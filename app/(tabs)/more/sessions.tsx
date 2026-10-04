import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import Modal from "react-native-modal";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { useDialogController } from "../../../components/ui/DialogProvider";
import SessionShareCard from "../../../components/SessionShareCard";
import InlineBannerAd from "../../../components/InlineBannerAd";
import {
  SessionRecord,
  deleteSessionRecord,
  getSessionHistory,
} from "../../../utils/engagement/sessionHistory";
import { logSessionShared } from "../../../utils/analytics";
import { trackEngagement } from "../../../utils/engagementAnalytics";
import { formatStandardDrinks } from "../../../utils/alcoholConstants";

const formatDate = (ms: number): string =>
  new Date(ms).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function SessionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  // 삭제 확인은 상세 바텀시트(모달) 위에 떠야 하므로 시트 안에 로컬 호스트를 둔다.
  const sheetDialog = useDialogController();
  const { confirm } = sheetDialog;
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [selected, setSelected] = useState<SessionRecord | null>(null);
  const shareRef = useRef<React.ElementRef<typeof ViewShot>>(null);

  const load = useCallback(async () => {
    setHistory(await getSessionHistory());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = useCallback(
    async (record: SessionRecord) => {
      trackEngagement("session_record_delete_intent");
      const confirmed = await confirm({
        title: t("sessionHistory.deleteTitle"),
        message: t("sessionHistory.deleteMessage"),
        cancelLabel: t("common.cancel"),
        confirmLabel: t("sessionHistory.delete"),
        destructive: true,
      });
      if (!confirmed) return;
      const next = await deleteSessionRecord(record.id);
      if (!next) return;
      trackEngagement("session_record_deleted");
      setHistory(next);
      setSelected(null);
    },
    [t, confirm]
  );

  const handleShare = useCallback(async () => {
    if (!selected) return;
    try {
      const uri = await captureRef(shareRef, {
        format: "png",
        quality: 1,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        await Share.share({ url: uri });
      }
      logSessionShared();
      trackEngagement("session_share_outcome", { outcome: "shared_card" });
    } catch (error) {
      console.warn("Failed to share session card:", error);
      // 캡처/공유 실패 시 텍스트 요약으로 폴백.
      try {
        await Share.share({
          message: t("sessionHistory.shareFallback", {
            date: formatDate(selected.startedAt),
            peak: selected.peakBac.toFixed(3),
            drinks: formatStandardDrinks(selected.totalStandardDrinks),
          }),
        });
        logSessionShared();
        trackEngagement("session_share_outcome", { outcome: "shared_text_fallback" });
      } catch {
        trackEngagement("session_share_outcome", { outcome: "failed" });
        // 사용자가 공유 시트를 닫은 경우 등은 무시.
      }
    }
  }, [selected, t]);

  const renderItem = useCallback(
    ({ item }: { item: SessionRecord }) => (
      <Card
        className="mb-3"
        onPress={() => setSelected(item)}
        accessibilityLabel={formatDate(item.startedAt)}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">
              {formatDate(item.startedAt)}
            </Text>
            <Text className="text-textSecondary text-xs mt-1">
              {formatTime(item.startedAt)} – {formatTime(item.endedAt)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-accentSoft font-bold text-base">
              {item.peakBac.toFixed(3)}%
            </Text>
            <Text className="text-textSecondary text-xs mt-1">
              {t("sessionHistory.standardDrinksValue", {
                value: formatStandardDrinks(item.totalStandardDrinks),
              })}
            </Text>
          </View>
          <Text className="text-textMuted text-xl ml-3">›</Text>
        </View>
      </Card>
    ),
    [t]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t("sessionHistory.title")}
        </Text>
      </View>

      {history.length === 0 ? (
        <View className="flex-1 justify-center px-4">
          <EmptyState emoji="🍺" title={t("sessionHistory.empty")} />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListFooterComponent={<InlineBannerAd />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        isVisible={selected !== null}
        onBackdropPress={() => setSelected(null)}
        onBackButtonPress={() => setSelected(null)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View className="bg-background rounded-t-3xl p-4 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-4" />
          {selected && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-white text-lg font-bold mb-1">
                {formatDate(selected.startedAt)}
              </Text>
              <Text className="text-textSecondary text-xs mb-4">
                {formatTime(selected.startedAt)} –{" "}
                {formatTime(selected.endedAt)}
              </Text>

              <Card className="mb-4">
                <View className="flex-row">
                  <View className="flex-1 items-center">
                    <Text className="text-accentSoft text-lg font-bold">
                      {selected.peakBac.toFixed(3)}%
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1">
                      {t("sessionHistory.peakBacEstimated")}
                    </Text>
                  </View>
                  <View className="w-px bg-surfaceDeep" />
                  <View className="flex-1 items-center">
                    <Text className="text-white text-lg font-bold">
                      {formatStandardDrinks(selected.totalStandardDrinks)}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1">
                      {t("sessionHistory.standardDrinks")}
                    </Text>
                  </View>
                  <View className="w-px bg-surfaceDeep" />
                  <View className="flex-1 items-center">
                    <Text className="text-white text-lg font-bold">
                      {selected.totalCalories}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1">kcal</Text>
                  </View>
                </View>
              </Card>

              <Text className="text-white text-base font-bold mb-2">
                {t("sessionHistory.timeline")}
              </Text>
              <View className="bg-surface rounded-xl p-2 mb-4">
                {selected.drinks.map((drink, index) => (
                  <View
                    key={index}
                    className="flex-row items-center px-2 py-2"
                  >
                    <Text className="text-xl mr-3">{drink.emoji}</Text>
                    <Text className="text-white text-sm flex-1">
                      {t(drink.nameKey)}
                    </Text>
                    <Text className="text-textSecondary text-xs mr-3">
                      {t("sessionHistory.standardDrinksValue", {
                        value: formatStandardDrinks(drink.standardDrinks),
                      })}
                    </Text>
                    <Text className="text-textMuted text-xs">
                      {formatTime(drink.timestamp)}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                className="bg-accentButton rounded-xl py-4 items-center mb-3 flex-row justify-center"
                onPress={handleShare}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t("sessionHistory.share")}
              >
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text className="text-white text-base font-bold ml-2">
                  {t("sessionHistory.share")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border border-surfaceDeep rounded-xl py-3 items-center mb-2"
                onPress={() => handleDelete(selected)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t("sessionHistory.delete")}
              >
                <Text className="text-textSecondary text-sm font-semibold">
                  {t("sessionHistory.delete")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
        {sheetDialog.host}
      </Modal>

      {/* 캡처 전용 오프스크린 렌더 */}
      {selected && (
        <View
          style={{ position: "absolute", left: -9999, top: 0 }}
          pointerEvents="none"
        >
          <ViewShot ref={shareRef}>
            <SessionShareCard record={selected} />
          </ViewShot>
        </View>
      )}
    </SafeAreaView>
  );
}
