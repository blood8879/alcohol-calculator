import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";

const languages = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-white mb-3">
        {i18n.t("settings.language")}
      </Text>
      <View className="flex-row space-x-3">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            className={`flex-1 p-3 rounded-lg ${
              currentLanguage === lang.code
                ? "bg-blue-500"
                : "bg-gray-800"
            }`}
          >
            <Text className="text-2xl text-center mb-1">{lang.flag}</Text>
            <Text
              className={`text-center text-sm ${
                currentLanguage === lang.code
                  ? "text-white font-bold"
                  : "text-gray-400"
              }`}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
