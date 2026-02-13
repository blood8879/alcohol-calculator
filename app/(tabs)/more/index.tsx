import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface MenuCardProps {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
}

function MenuCard({ emoji, title, description, onPress }: MenuCardProps) {
  return (
    <TouchableOpacity
      className="bg-gray-800 rounded-xl p-4 flex-row items-center mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-3xl mr-4">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{title}</Text>
        <Text className="text-gray-400 text-sm mt-1">{description}</Text>
      </View>
      <Text className="text-gray-500 text-xl ml-2">›</Text>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-white mb-1">{t("more.title")}</Text>
        <Text className="text-sm text-gray-400 mb-6">
          {t("more.subtitle")}
        </Text>

        <MenuCard
          emoji="📜"
          title={t("more.history")}
          description={t("more.historyDescription")}
          onPress={() => router.push("/(tabs)/more/history")}
        />
        <MenuCard
          emoji="🧠"
          title={t("more.quiz")}
          description={t("more.quizDescription")}
          onPress={() => router.push("/(tabs)/more/quiz")}
        />
        <MenuCard
          emoji="⚙️"
          title={t("more.settings")}
          description={t("more.settingsDescription")}
          onPress={() => router.push("/(tabs)/more/settings")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
