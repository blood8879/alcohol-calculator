import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import SectionHeader from "../ui/SectionHeader";
import type { QuickLogItem } from "../../utils/engagement/quickLog";

type QuickLogRowProps = {
  readonly items: readonly QuickLogItem[];
  readonly onLog: (item: QuickLogItem) => void;
  readonly onOpenCustom: () => void;
  readonly disabled?: boolean;
};

// Waterllama 원탭 칩 패턴: 자주 기록한 음료를 한 번에 기록하는 도구(음주 권유 문구 금지).
export default function QuickLogRow({
  items,
  onLog,
  onOpenCustom,
  disabled = false,
}: QuickLogRowProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-4">
      {/* 칩 행은 가로 스크롤이 화면 끝까지 닿아야 하므로 헤더에만 px-4를 준다 */}
      <SectionHeader title={t("tracker.quickLog.title")} className="px-4 mb-2" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            className="bg-surface rounded-card px-3 py-2 mr-2 min-h-[44px] flex-row items-center"
            onPress={() => onLog(item)}
            disabled={disabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("tracker.quickLog.chipA11y", {
              name: item.name,
              volume: item.volume,
              abv: item.abv,
            })}
            accessibilityState={{ disabled }}
          >
            <Text className="text-2xl mr-2">{item.emoji}</Text>
            <View>
              <Text
                className="text-textPrimary text-sm font-semibold max-w-[120px]"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-textSecondary text-xs">
                {item.volume}
                {t("units.ml")} · {item.abv}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          className="border border-surfaceDeep rounded-card px-3 py-2 min-h-[44px] flex-row items-center"
          onPress={onOpenCustom}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("tracker.quickLog.addCustomA11y")}
        >
          <Ionicons name="add" size={18} color="#4ade80" />
          <Text className="text-accentSoft text-sm font-semibold ml-1">
            {t("tracker.quickLog.addCustom")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
