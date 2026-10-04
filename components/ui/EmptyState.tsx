import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type EmptyStateProps = {
  readonly emoji: string;
  readonly title: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly actionAccessibilityLabel?: string;
  readonly onActionPress?: () => void;
  // 카드 안(트래커)·화면 중앙(목록 화면) 등 배치에 맞춰 바깥 여백/배경을 조정한다.
  readonly className?: string;
  // 레일·인라인 영역용 축소판(여백·이모지 크기 축소).
  readonly compact?: boolean;
};

// 명세서 §2.5 빈 상태 템플릿: 이모지 + 타이틀 + (설명) + (CTA). 화면마다 제각각이던 빈 상태를 통일한다.
// CTA는 외곽선 버튼(accentSoft 텍스트) — 흰 글씨+green-500 배경은 AA 대비 미달이라 쓰지 않는다.
export default function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  actionAccessibilityLabel,
  onActionPress,
  className = "",
  compact = false,
}: EmptyStateProps) {
  return (
    <View className={`items-center ${compact ? "px-4 py-4" : "px-6 py-8"} ${className}`}>
      <View
        className="items-center"
        accessible
        accessibilityLabel={description ? `${title}. ${description}` : title}
      >
        <Text
          className={compact ? "text-2xl mb-1.5" : "text-4xl mb-3"}
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          {emoji}
        </Text>
        <Text className="text-textPrimary text-base font-semibold text-center">
          {title}
        </Text>
        {description ? (
          <Text className="text-textSecondary text-sm text-center leading-5 mt-1.5">
            {description}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          className="border border-accentSoft rounded-xl px-5 min-h-[44px] items-center justify-center mt-4"
          onPress={onActionPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
        >
          <Text className="text-accentSoft font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
