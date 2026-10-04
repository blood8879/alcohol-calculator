import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { trackEngagement } from "../utils/engagementAnalytics";

// 원어 이름은 번역하지 않는다(어느 UI 언어에서든 자기 언어로 표기).
const languages = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) return;
    await changeLanguage(languageCode);
    trackEngagement("language_changed", { language: languageCode });
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-textPrimary mb-3">
        {i18n.t("settings.language")}
      </Text>
      <View
        className="bg-surface rounded-xl overflow-hidden"
        accessibilityRole="radiogroup"
        accessibilityLabel={i18n.t("settings.language")}
      >
        {languages.map((lang, index) => {
          const selected = currentLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageChange(lang.code)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={lang.label}
              accessibilityState={{ checked: selected }}
              className={`flex-row items-center px-4 min-h-[52px] py-3 ${
                index > 0 ? "border-t border-surfaceDeep" : ""
              }`}
              style={index > 0 ? { borderTopWidth: 0.5 } : undefined}
            >
              <Text className="text-2xl mr-3" importantForAccessibility="no">
                {lang.flag}
              </Text>
              <Text
                numberOfLines={1}
                className={`flex-1 text-base text-textPrimary ${
                  selected ? "font-bold" : "font-normal"
                }`}
              >
                {lang.label}
              </Text>
              {selected ? (
                <Ionicons
                  name="checkmark"
                  size={22}
                  color="#4ade80" // accentSoft
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
