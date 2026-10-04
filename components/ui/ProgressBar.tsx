import React from "react";
import { View } from "react-native";

type ProgressBarProps = {
  readonly percent: number;
  readonly colorClassName: string;
};

// 요약 타일용 얇은 진행바(트래커 상태 타일·홈 이번 주 타일 공용).
export default function ProgressBar({ percent, colorClassName }: ProgressBarProps) {
  return (
    <View className="h-1.5 bg-surfaceDeep rounded-full overflow-hidden mt-2">
      <View
        className={`h-1.5 ${colorClassName} rounded-full`}
        style={{ width: `${percent}%` }}
      />
    </View>
  );
}
