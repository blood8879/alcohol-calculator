import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import InlineBannerAd from "../InlineBannerAd";
import { drinkingCultures } from "../../data/drinkingCulture";
import { foodPairings } from "../../data/foodPairings";
import { pickLocalizedText } from "../../utils/localizedText";
import Card from "../ui/Card";

export default function CultureSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const sectionCultureTitle = t("culture.cultureTitle");

  const sectionPairingTitle = t("culture.pairingTitle");

  const customsLabel = t("culture.customs");

  const etiquetteLabel = t("culture.etiquette");

  const pairingsLabel = t("culture.pairings");

  const tipLabel = t("culture.tip");

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 나라별 음주 문화 섹션 */}
      <Text className="text-lg font-bold text-green-400 mb-3">
        {sectionCultureTitle}
      </Text>

      {drinkingCultures.map((item) => (
        <Card key={item.id} className="mb-3">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">{item.emoji}</Text>
            <Text className="text-white font-bold text-base">
              {pickLocalizedText(item.country, lang)}
            </Text>
          </View>

          <Text className="text-green-400 text-xs font-semibold uppercase mb-1">
            {customsLabel}
          </Text>
          {item.customs.map((custom, idx) => (
            <View key={idx} className="flex-row mb-1">
              <Text className="text-gray-400 mr-2">•</Text>
              <Text className="text-gray-300 text-sm flex-1 leading-5">
                {pickLocalizedText(custom, lang)}
              </Text>
            </View>
          ))}

          <Text className="text-green-400 text-xs font-semibold uppercase mt-3 mb-1">
            {etiquetteLabel}
          </Text>
          {item.etiquette.map((e, idx) => (
            <View key={idx} className="flex-row mb-1">
              <Text className="text-gray-400 mr-2">•</Text>
              <Text className="text-gray-300 text-sm flex-1 leading-5">
                {pickLocalizedText(e, lang)}
              </Text>
            </View>
          ))}
        </Card>
      ))}

      <InlineBannerAd />

      {/* 술·안주 페어링 섹션 */}
      <Text className="text-lg font-bold text-green-400 mt-2 mb-3">
        {sectionPairingTitle}
      </Text>

      {foodPairings.map((item) => (
        <Card key={item.id} className="mb-3">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">{item.emoji}</Text>
            <Text className="text-white font-bold text-base">
              {pickLocalizedText(item.drink, lang)}
            </Text>
          </View>

          <Text className="text-green-400 text-xs font-semibold uppercase mb-1">
            {pairingsLabel}
          </Text>
          {item.pairings.map((pairing, idx) => (
            <View key={idx} className="flex-row mb-1">
              <Text className="text-gray-400 mr-2">•</Text>
              <Text className="text-gray-300 text-sm flex-1 leading-5">
                {pickLocalizedText(pairing, lang)}
              </Text>
            </View>
          ))}

          <View className="mt-3 bg-gray-900 rounded-lg px-3 py-2">
            <Text className="text-green-400 text-xs font-semibold mb-1">
              💡 {tipLabel}
            </Text>
            <Text className="text-gray-400 text-sm leading-5">
              {pickLocalizedText(item.note, lang)}
            </Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
