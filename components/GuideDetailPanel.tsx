import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { GuideDetail } from "../data/guideDetails";
import { pickLocalizedText } from "../utils/localizedText";
import { logGuideNextStep } from "../utils/contentAnalytics";

type GuideDetailPanelProps = {
  readonly guide: GuideDetail;
  readonly onPressTarget: (target: GuideDetail["nextStep"]["target"]) => void;
};

export default function GuideDetailPanel({
  guide,
  onPressTarget,
}: GuideDetailPanelProps) {
  const { i18n } = useTranslation();
  const language = i18n.language;

  return (
    <View className="bg-gray-900 rounded-xl p-4 mt-4 border border-gray-700">
      <Text className="text-white text-base font-bold mb-2">
        {pickLocalizedText(guide.title, language)}
      </Text>
      <Text className="text-gray-300 text-sm leading-5 mb-3">
        {pickLocalizedText(guide.summary, language)}
      </Text>

      {guide.quickFacts.map((fact) => (
        <View key={pickLocalizedText(fact, "en")} className="flex-row items-start mb-2">
          <Text className="text-green-400 mr-2">-</Text>
          <Text className="text-gray-300 text-sm leading-5 flex-1">
            {pickLocalizedText(fact, language)}
          </Text>
        </View>
      ))}

      <View className="bg-gray-800 rounded-xl p-3 mt-2">
        <Text className="text-gray-400 text-xs font-bold mb-2">
          {language.startsWith("ko") ? "연결 콘텐츠" : "Related"}
        </Text>
        <Text className="text-gray-300 text-sm">
          {language.startsWith("ko")
            ? `레시피 ${guide.relatedRecipeIds.length}개 - ${guide.relatedQuizCategory} 퀴즈`
            : `${guide.relatedRecipeIds.length} recipes - ${guide.relatedQuizCategory} quiz`}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-accentButton rounded-xl px-4 py-3 mt-3"
        onPress={() => {
          const target = guide.nextStep.target;
          logGuideNextStep(guide.entryId, target === "/(tabs)/tracker" ? "tracker" : target === "/(tabs)/quiz" ? "quiz" : "recipes");
          onPressTarget(target);
        }}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={pickLocalizedText(guide.nextStep.label, language)}
      >
        <Text className="text-white text-center font-bold">
          {pickLocalizedText(guide.nextStep.label, language)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
