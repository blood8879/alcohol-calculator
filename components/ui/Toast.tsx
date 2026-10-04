import React, { useContext, useEffect } from "react";
import { AccessibilityInfo, Platform, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { TOAST_DURATION_MS, type ToastVariant } from "../../utils/dialogState";

type ToastProps = {
  readonly visible: boolean;
  readonly message: string;
  readonly variant: ToastVariant;
  // 스크린리더용 접두어(예: "오류"). 색·아이콘만으로 상태를 구분하지 않도록 함께 읽힌다.
  readonly variantLabel: string;
  readonly onHide: () => void;
  // 값이 바뀌면 자동 숨김 타이머를 다시 시작한다(연속 토스트).
  readonly resetKey?: string | number;
  readonly durationMs?: number;
};

// 아이콘 색은 토스트 배경 surfaceDeep(#374151) 위 비텍스트 대비 3:1 이상.
// red-400 3.73 · green-400 5.92 · blue-300 5.72.
const VARIANT_ICON: Record<ToastVariant, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  error: { name: "alert-circle", color: "#f87171" },
  success: { name: "checkmark-circle", color: "#4ade80" },
  info: { name: "information-circle", color: "#93c5fd" },
};

// 앱 톤의 일반 토스트(UndoToast와 같은 surfaceDeep 카드). 화면 위쪽(상단 안전 영역 아래)에 떠서
// 탭바·바텀시트·키보드에 가리지 않는다. 일정 시간 후 자동으로 사라진다.
export default function Toast({
  visible,
  message,
  variant,
  variantLabel,
  onHide,
  resetKey,
  durationMs = TOAST_DURATION_MS,
}: ToastProps) {
  const insets = useContext(SafeAreaInsetsContext);
  const spokenLabel = `${variantLabel}: ${message}`;

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [visible, resetKey, durationMs, onHide]);

  useEffect(() => {
    // 안드로이드는 accessibilityLiveRegion이 읽어 주므로 iOS에서만 직접 알린다(중복 낭독 방지).
    if (visible && Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(spokenLabel);
    }
    // resetKey가 바뀌면(같은 문구의 새 토스트) 다시 알린다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, resetKey]);

  if (!visible) return null;

  const icon = VARIANT_ICON[variant];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: (insets?.top ?? 0) + 8,
        zIndex: 1000,
        elevation: 10,
      }}
    >
      <View
        className="bg-surfaceDeep rounded-card px-4 py-3 flex-row items-center"
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={spokenLabel}
        testID={`toast-${variant}`}
      >
        <Ionicons name={icon.name} size={20} color={icon.color} />
        <Text className="flex-1 text-textPrimary text-sm ml-3">{message}</Text>
      </View>
    </View>
  );
}
