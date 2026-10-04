import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type SectionHeaderProps = {
  readonly title: string;
  readonly actionLabel?: string;
  readonly actionAccessibilityLabel?: string;
  readonly onActionPress?: () => void;
  readonly className?: string;
  // 액션 링크 대신 우측에 둘 요소(예: 카드 내부 헤더의 세그먼트 컨트롤).
  readonly accessory?: React.ReactNode;
};

// 섹션 제목 + 선택적 우측 액션(`모두 보기 ›`). 홈 등 레일/목록 섹션 헤더를 통일한다.
export default function SectionHeader({
  title,
  actionLabel,
  actionAccessibilityLabel,
  onActionPress,
  className = "mb-3",
  accessory,
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text
        className="flex-1 text-textPrimary text-lg font-bold"
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {accessory}
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          className="min-h-[44px] justify-center pl-3"
          onPress={onActionPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text className="text-accentSoft text-sm font-semibold">
            {actionLabel} ›
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
