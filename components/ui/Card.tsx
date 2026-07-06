import React from "react";
import { TouchableOpacity, View, ViewProps } from "react-native";

// 앱 표준 카드 프리미티브. 배경 bg-gray-800, 반경 rounded-xl, 패딩 p-4가 기본값이며
// 화면마다 복붙되던 카드 스타일은 점진적으로 이 컴포넌트로 교체한다.
type CardProps = ViewProps & {
  readonly className?: string;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
};

export default function Card({
  className = "",
  onPress,
  accessibilityLabel,
  children,
  ...rest
}: CardProps) {
  const baseClassName = `bg-gray-800 rounded-xl p-4 ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        className={baseClassName}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={baseClassName} {...rest}>
      {children}
    </View>
  );
}
