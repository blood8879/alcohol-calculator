import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

import type { BacLevel } from "../../utils/engagement/drinkingSession";
import { LEVEL_STYLES } from "./sessionUi";
import { DISPLAY_NUMBER_TEXT_PROPS } from "../../utils/fontScale";

type BacHeroNumberProps = {
  readonly bac: number;
  readonly level: BacLevel;
};

const COLOR_DURATION_MS = 450;
const PULSE_SCALE = 1.12;
const PULSE_UP_MS = 160;
const PULSE_DOWN_MS = 260;

// "동작 줄이기" 설정을 구독한다. 확인 전에는 모션을 끈 상태로 시작한다.
function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReduceMotion(false);
      });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled)
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
}

// 세션 히어로의 초대형 BAC 수치. 레벨이 바뀌면 색을 이전→새 레벨 컬러로 전환하고
// 짧게 확대 펄스를 준다. 동작 줄이기가 켜져 있으면 즉시 새 색으로만 바꾼다.
export default function BacHeroNumber({ bac, level }: BacHeroNumberProps) {
  const reduceMotion = useReduceMotion();
  const [transition, setTransition] = useState<{ from: string; to: string }>(() => ({
    from: LEVEL_STYLES[level].textHex,
    to: LEVEL_STYLES[level].textHex,
  }));
  const colorProgress = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const prevLevelRef = useRef<BacLevel>(level);
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;

  // 1) 레벨 변경 감지 → 전환 색 쌍 갱신(렌더 후 새 보간 범위가 반영된다).
  useEffect(() => {
    const prevLevel = prevLevelRef.current;
    if (prevLevel === level) return;
    prevLevelRef.current = level;
    const nextHex = LEVEL_STYLES[level].textHex;
    setTransition({
      from: reduceMotionRef.current ? nextHex : LEVEL_STYLES[prevLevel].textHex,
      to: nextHex,
    });
  }, [level]);

  // 2) 새 색 쌍이 반영된 뒤 색 전환 + 확대 펄스 실행.
  useEffect(() => {
    if (transition.from === transition.to) {
      colorProgress.setValue(1);
      scale.setValue(1);
      return undefined;
    }
    colorProgress.setValue(0);
    // 색 보간은 네이티브 드라이버 미지원 → JS 드라이버, 확대 펄스는 네이티브 드라이버.
    const colorAnim = Animated.timing(colorProgress, {
      toValue: 1,
      duration: COLOR_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    });
    const pulseAnim = Animated.sequence([
      Animated.timing(scale, {
        toValue: PULSE_SCALE,
        duration: PULSE_UP_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: PULSE_DOWN_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
    colorAnim.start();
    pulseAnim.start();
    return () => {
      colorAnim.stop();
      pulseAnim.stop();
      colorProgress.setValue(1);
      scale.setValue(1);
    };
  }, [transition, colorProgress, scale]);

  const color = colorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [transition.from, transition.to],
  });

  return (
    // 확대(네이티브)와 색(JS)을 서로 다른 노드에 둬 드라이버가 섞이지 않게 한다.
    <Animated.View style={{ transform: [{ scale }] }}>
      <Animated.Text
        style={{ color, fontSize: 48, lineHeight: 56, fontWeight: "700" }}
        accessibilityRole="text"
        {...DISPLAY_NUMBER_TEXT_PROPS}
      >
        {bac.toFixed(3)}%
      </Animated.Text>
    </Animated.View>
  );
}
