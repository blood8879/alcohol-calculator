import React from "react";
import { Text, View } from "react-native";

import type { BacLevel } from "../../utils/engagement/drinkingSession";
import {
  BAC_SCALE_TICKS,
  BAC_SCALE_ZONES,
  LEVEL_STYLES,
  bacToScalePosition,
  tickToScalePosition,
} from "./sessionUi";

type BacScaleProps = {
  readonly bac: number;
  readonly level: BacLevel;
  readonly accessibilityLabel: string;
};

const BAR_HEIGHT = 10;
const POINTER_WIDTH = 14;
const TICK_LABEL_WIDTH = 40;
const DIMMED_OPACITY = 0.3;

// BAC 스케일(0~0.12%): 4구간 색 띠 + 임계 눈금(0.02·0.05·0.08) + 현재값 ▲ 포인터.
// 색만으로 상태를 구분하지 않도록 현재 구간만 불투명, 나머지는 흐리게 하고 위치·눈금을 함께 보여준다(§4.7).
export default function BacScale({ bac, level, accessibilityLabel }: BacScaleProps) {
  const position = bacToScalePosition(bac);

  return (
    <View
      className="w-full mt-4"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: `${bac.toFixed(3)}%` }}
    >
      <View
        className="flex-row w-full rounded-full overflow-hidden"
        style={{ height: BAR_HEIGHT }}
      >
        {BAC_SCALE_ZONES.map((zone, index) => (
          <View
            key={zone.level}
            style={{
              flex: zone.fraction,
              backgroundColor: LEVEL_STYLES[zone.level].barHex,
              opacity: zone.level === level ? 1 : DIMMED_OPACITY,
              marginRight: index < BAC_SCALE_ZONES.length - 1 ? 2 : 0,
            }}
          />
        ))}
      </View>

      <View className="w-full" style={{ height: 14 }}>
        <Text
          style={{
            position: "absolute",
            left: `${position * 100}%`,
            width: POINTER_WIDTH,
            marginLeft: -POINTER_WIDTH / 2,
            textAlign: "center",
            fontSize: 12,
            lineHeight: 14,
            color: LEVEL_STYLES[level].textHex,
          }}
        >
          ▲
        </Text>
      </View>

      <View className="w-full" style={{ height: 16 }}>
        {BAC_SCALE_TICKS.map((tick) => (
          <Text
            key={tick}
            className="text-textSecondary text-xs"
            style={{
              position: "absolute",
              left: `${tickToScalePosition(tick) * 100}%`,
              width: TICK_LABEL_WIDTH,
              marginLeft: -TICK_LABEL_WIDTH / 2,
              textAlign: "center",
            }}
          >
            {tick.toFixed(2)}
          </Text>
        ))}
      </View>
    </View>
  );
}
