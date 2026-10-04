import React, { useCallback, useRef } from "react";
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  findNodeHandle,
} from "react-native";

type ConfirmDialogProps = {
  readonly visible: boolean;
  readonly title: string;
  readonly message?: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly destructive?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

// 앱 톤의 확인 다이얼로그 1종 (명세서 §2.5).
// - RN `Modal`로 띄우므로, 다른 모달(react-native-modal 시트 포함) 안에서 렌더하면 그 위에 쌓인다.
// - 파괴 버튼은 red-700(#b91c1c, 흰 글씨 6.47:1). 명세서의 #EF4444는 흰 글씨 3.76:1로 AA(4.5:1) 미달이라
//   9회차 난이도 뱃지와 같은 기준으로 한 단계 진한 빨강을 쓴다.
// - 안드로이드 뒤로가기·바깥 탭 = 취소. 열리면 스크린리더 포커스를 제목으로 옮긴다.
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleRef = useRef<Text>(null);

  const focusTitle = useCallback(() => {
    // findNodeHandle은 웹에서 예외를 던지므로 네이티브에서만 포커스를 옮긴다.
    if (Platform.OS === "web") return;
    const tag = titleRef.current ? findNodeHandle(titleRef.current) : null;
    if (tag != null) AccessibilityInfo.setAccessibilityFocus(tag);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
      onShow={focusTitle}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <Pressable
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onCancel}
          accessible={false}
          importantForAccessibility="no"
        />
        <View
          className="w-full max-w-[400px] bg-surface border border-surfaceDeep rounded-2xl p-5"
          accessibilityViewIsModal
        >
          <Text
            ref={titleRef}
            className="text-textPrimary text-lg font-bold"
            accessibilityRole="header"
          >
            {title}
          </Text>
          {message ? (
            <Text className="text-textSecondary text-sm leading-5 mt-2">{message}</Text>
          ) : null}
          <View className="flex-row mt-5" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 min-h-[48px] px-3 rounded-xl border border-surfaceDeep items-center justify-center"
              onPress={onCancel}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text className="text-textPrimary text-base font-semibold text-center">
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 min-h-[48px] px-3 rounded-xl items-center justify-center ${
                destructive ? "bg-red-700" : "bg-accentButton"
              }`}
              onPress={onConfirm}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text className="text-white text-base font-bold text-center">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
