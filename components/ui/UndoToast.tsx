import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type UndoToastProps = {
  readonly visible: boolean;
  readonly message: string;
  readonly actionLabel: string;
  readonly actionAccessibilityLabel?: string;
  readonly onAction: () => void;
  readonly onHide: () => void;
  // 값이 바뀌면 자동 숨김 타이머를 다시 시작한다(연속 기록 시).
  readonly resetKey?: string | number;
  readonly durationMs?: number;
};

export const UNDO_TOAST_DURATION_MS = 4000;

// 화면 하단에 뜨는 되돌리기 토스트. 일정 시간 후 자동으로 사라진다.
export default function UndoToast({
  visible,
  message,
  actionLabel,
  actionAccessibilityLabel,
  onAction,
  onHide,
  resetKey,
  durationMs = UNDO_TOAST_DURATION_MS,
}: UndoToastProps) {
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [visible, resetKey, durationMs, onHide]);

  if (!visible) return null;

  return (
    <View
      className="absolute left-4 right-4 bottom-4 bg-surfaceDeep rounded-card px-4 py-2 flex-row items-center"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text className="flex-1 text-textPrimary text-sm mr-3" numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity
        className="min-h-[44px] min-w-[44px] px-2 items-center justify-center"
        onPress={onAction}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
      >
        <Text className="text-accentSoft font-bold">{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
