import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

import type { DrinkingSession } from "../../utils/engagement/drinkingSession";
import { computeElapsedTime } from "../../utils/engagement/weekSummary";

type SessionStatusCardProps = {
  readonly session: DrinkingSession | null;
  readonly onPress: () => void;
};

const ELAPSED_TICK_MS = 60 * 1000;

// 홈 최상단 세션 상태 카드(GrowPal 상태 카드 패턴).
// 진행 중이면 펄스 점 + 경과 시간 + 잔 수만 보여준다. BAC 수치·운전 관련 표현은 넣지 않는다(명세서 §2.4).
export default function SessionStatusCard({ session, onPress }: SessionStatusCardProps) {
  const { t } = useTranslation();
  const isActive = session !== null;
  const [now, setNow] = useState(() => Date.now());

  // 포커스 중에만 1분마다 경과 시간을 갱신한다.
  useFocusEffect(
    useCallback(() => {
      if (!isActive) return undefined;
      setNow(Date.now());
      const timer = setInterval(() => setNow(Date.now()), ELAPSED_TICK_MS);
      return () => clearInterval(timer);
    }, [isActive])
  );

  if (!session) {
    const title = t("session.homeCta");
    const description = t("session.homeCtaDescription");
    return (
      <TouchableOpacity
        className="bg-surface border border-accentDeep rounded-2xl p-4 mb-6 min-h-[44px] flex-row items-center"
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${description}`}
      >
        <Text className="text-3xl mr-3">🍻</Text>
        <View className="flex-1">
          <Text className="text-textPrimary text-base font-bold">{title}</Text>
          <Text className="text-textSecondary text-sm mt-1 leading-5">
            {description}
          </Text>
        </View>
        <Text className="text-textSecondary text-2xl ml-2">›</Text>
      </TouchableOpacity>
    );
  }

  const elapsed = computeElapsedTime(session.startedAt, now);
  const elapsedText =
    elapsed.hours > 0
      ? t("home.sessionCard.elapsedHoursMinutes", {
          hours: elapsed.hours,
          minutes: elapsed.minutes,
        })
      : t("home.sessionCard.elapsedMinutes", { minutes: elapsed.minutes });
  const drinksText = t("home.sessionCard.drinkCount", {
    count: session.drinks.length,
  });
  const liveLabel = t("home.sessionCard.live");
  const title = t("session.homeCtaActive");

  return (
    <TouchableOpacity
      className="bg-accentButton rounded-2xl p-4 mb-6 min-h-[44px] flex-row items-center"
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${liveLabel}, ${title}, ${elapsedText}, ${drinksText}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <PulseDot />
          <Text className="text-white text-xs font-bold ml-2">{liveLabel}</Text>
        </View>
        <Text className="text-white text-base font-bold" numberOfLines={2}>
          {title}
        </Text>
        <Text className="text-green-100 text-sm mt-1" numberOfLines={1}>
          {elapsedText} · {drinksText}
        </Text>
      </View>
      <Text className="text-white text-2xl ml-2">›</Text>
    </TouchableOpacity>
  );
}

// 진행 중 표시 펄스 점. "동작 줄이기"가 켜져 있으면 정적인 점으로 표시한다.
function PulseDot() {
  const [reduceMotion, setReduceMotion] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  return (
    <Animated.View
      style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffffff", opacity }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
