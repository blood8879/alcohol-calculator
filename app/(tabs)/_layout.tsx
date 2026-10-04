import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Text } from "react-native";
import { FONT_SCALE_CAP } from "../../utils/fontScale";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      // 하단 안전 영역은 루트 광고 슬롯(app/_layout.tsx)이 한 번만 처리한다.
      // 전면 광고를 닫은 뒤 인셋이 다시 잡히면 탭바가 또 여백을 더해 빈 띠가 생겼다(실기기).
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#374151",
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#9ca3af",
        // 탭바 높이는 고정이라 시스템 글꼴 200%에서 라벨이 아래로 잘렸다(§4.7, 17회차).
        // 기본 Label은 maxFontSizeMultiplier를 받지 않으므로 직접 렌더해 확대 상한만 둔다(아이콘은 그대로).
        tabBarLabel: ({ color, children }) => (
          <Text
            style={{ color, fontSize: 10, fontWeight: "500", textAlign: "center" }}
            numberOfLines={1}
            maxFontSizeMultiplier={FONT_SCALE_CAP.tabLabel}
          >
            {children}
          </Text>
        ),
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync().catch(() => {});
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tabs.explore"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: t("tabs.tracker"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: t("tabs.quiz"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t("tabs.more"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
