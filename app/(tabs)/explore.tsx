import React, { useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import EncyclopediaSection from "../../components/explore/EncyclopediaSection";
import RecipesSection from "../../components/explore/RecipesSection";
import CultureSection from "../../components/explore/CultureSection";
import { isCatalogContentId, logContentSection } from "../../utils/contentAnalytics";

type ExploreSection = "encyclopedia" | "recipes" | "culture";

const SECTIONS: ExploreSection[] = ["encyclopedia", "recipes", "culture"];

const isExploreSection = (value: unknown): value is ExploreSection =>
  value === "encyclopedia" || value === "recipes" || value === "culture";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ section?: string; guide?: string }>();
  const [activeSection, setActiveSection] = useState<ExploreSection>(() =>
    isExploreSection(params.section)
      ? params.section
      : params.guide
        ? "encyclopedia"
        : "encyclopedia"
  );

  // 딥링크(?section=, ?guide=)로 도착하면 해당 섹션으로 전환
  useEffect(() => {
    if (isExploreSection(params.section)) {
      logContentSection(params.section, "deep_link");
      setActiveSection(params.section);
    } else if (typeof params.guide === "string" && isCatalogContentId("encyclopedia", params.guide)) {
      logContentSection("encyclopedia", "deep_link");
      setActiveSection("encyclopedia");
    }
  }, [params.section, params.guide]);

  const sectionLabel = (section: ExploreSection): string => {
    if (section === "encyclopedia") return t("tabs.encyclopedia");
    if (section === "recipes") return t("tabs.recipes");
    return t("tabs.culture");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      <View className="px-4 pt-2 flex-1">
        <Text className="text-2xl font-bold text-textPrimary mb-3">
          {t("tabs.explore")}
        </Text>

        {/* 트래커 주간 통계와 같은 중립 세그먼트: 컨테이너 surface, 선택 surfaceDeep + 흰 굵은 글씨 */}
        <View className="flex-row bg-surface rounded-xl p-1 mb-3" accessibilityRole="tablist">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section;
            return (
              <TouchableOpacity
                key={section}
                className={`flex-1 rounded-lg min-h-[44px] items-center justify-center ${
                  isActive ? "bg-surfaceDeep" : ""
                }`}
                onPress={() => { if (!isActive) { logContentSection(section, "tab"); setActiveSection(section); } }}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={sectionLabel(section)}
              >
                <Text
                  className={`text-sm ${
                    isActive ? "text-textPrimary font-bold" : "text-textSecondary font-semibold"
                  }`}
                >
                  {sectionLabel(section)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeSection === "encyclopedia" && (
          <EncyclopediaSection
            key={typeof params.guide === "string" ? params.guide : "none"}
            initialGuide={typeof params.guide === "string" ? params.guide : undefined}
          />
        )}
        {activeSection === "recipes" && <RecipesSection />}
        {activeSection === "culture" && <CultureSection />}
      </View>
    </SafeAreaView>
  );
}
