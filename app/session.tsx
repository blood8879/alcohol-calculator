import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import Card from "../components/ui/Card";

import {
  DrinkingSession,
  SessionGender,
  estimateSession,
  quickDrinkUnits,
} from "../utils/engagement/drinkingSession";
import {
  clearActiveSession,
  getActiveSession,
  getSessionProfile,
  setActiveSession,
  setSessionProfile,
} from "../utils/engagement/drinkingSessionStorage";
import { addDrinkLogsWithTimestamps } from "../utils/trackerStorage";
import { generateId } from "../utils/idGenerator";
import { updateSobrietyWidget } from "../widgets/updateSobrietyWidget";

const LEVEL_STYLES = {
  safe: { text: "text-green-400", bar: "bg-green-500", labelKey: "session.levelSafe" },
  caution: { text: "text-amber-400", bar: "bg-amber-500", labelKey: "session.levelCaution" },
  danger: { text: "text-orange-400", bar: "bg-orange-500", labelKey: "session.levelDanger" },
  high: { text: "text-red-400", bar: "bg-red-500", labelKey: "session.levelHigh" },
} as const;

export default function SessionScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<SessionGender>("male");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    Promise.all([getActiveSession(), getSessionProfile()]).then(
      ([storedSession, profile]) => {
        if (storedSession) {
          setSession(storedSession);
        }
        if (profile) {
          setWeight(String(profile.weightKg));
          setGender(profile.gender);
        }
        setLoaded(true);
      }
    );
  }, []);

  // 세션 진행 중 30초마다 BAC 갱신
  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [session]);

  const estimate = useMemo(
    () => (session ? estimateSession(session, now) : null),
    [session, now]
  );

  const handleStart = useCallback(async () => {
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert(t("common.error"), t("errors.positiveValues"));
      return;
    }
    const nextSession: DrinkingSession = {
      startedAt: Date.now(),
      weightKg: parsedWeight,
      gender,
      drinks: [],
    };
    await Promise.all([
      setActiveSession(nextSession),
      setSessionProfile({ weightKg: parsedWeight, gender }),
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSession(nextSession);
    setNow(new Date());
  }, [weight, gender, t]);

  const persistSession = useCallback(async (next: DrinkingSession) => {
    setSession(next);
    setNow(new Date());
    await setActiveSession(next);
  }, []);

  const handleAddDrink = useCallback(
    (unitId: string) => {
      if (!session) return;
      const unit = quickDrinkUnits.find((item) => item.id === unitId);
      if (!unit) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      void persistSession({
        ...session,
        drinks: [
          ...session.drinks,
          {
            id: generateId(),
            nameKey: unit.nameKey,
            emoji: unit.emoji,
            volume: unit.volume,
            abv: unit.abv,
            timestamp: Date.now(),
          },
        ],
      });
    },
    [session, persistSession]
  );

  const handleUndo = useCallback(() => {
    if (!session || session.drinks.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void persistSession({
      ...session,
      drinks: session.drinks.slice(0, -1),
    });
  }, [session, persistSession]);

  const handleEndAndSave = useCallback(async () => {
    if (!session) return;
    if (session.drinks.length > 0) {
      await addDrinkLogsWithTimestamps(
        session.drinks.map((drink) => ({
          name: t(drink.nameKey),
          emoji: drink.emoji,
          volume: drink.volume,
          abv: drink.abv,
          timestamp: drink.timestamp,
        }))
      );
    }
    await clearActiveSession();
    void updateSobrietyWidget();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSession(null);
    router.replace("/(tabs)/tracker");
  }, [session, t, router]);

  const handleDiscard = useCallback(() => {
    Alert.alert(t("session.discardTitle"), t("session.discardMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("session.discard"),
        style: "destructive",
        onPress: async () => {
          await clearActiveSession();
          setSession(null);
        },
      },
    ]);
  }, [t]);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />

      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1">
          {t("session.title")}
        </Text>
        {session && (
          <View className="bg-green-500/15 rounded-full px-3 py-1">
            <Text className="text-green-400 text-xs font-bold">
              {t("session.activeBadge")}
            </Text>
          </View>
        )}
      </View>

      {!loaded ? null : !session ? (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center pt-6 pb-8">
            <Text className="text-6xl mb-4">🍻</Text>
            <Text className="text-white text-lg font-bold text-center mb-2">
              {t("session.subtitle")}
            </Text>
            <Text className="text-gray-400 text-sm text-center leading-5">
              {t("session.description")}
            </Text>
          </View>

          <Text className="text-gray-400 text-sm mb-2">{t("session.weight")} (kg)</Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 text-base"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="65"
            placeholderTextColor="#6b7280"
            accessibilityLabel={t("session.weight")}
          />

          <Text className="text-gray-400 text-sm mb-2">{t("session.gender")}</Text>
          <View className="flex-row mb-6">
            {(["male", "female"] as const).map((option) => {
              const isActive = gender === option;
              return (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 rounded-xl py-3 items-center ${
                    option === "male" ? "mr-2" : ""
                  } ${isActive ? "bg-green-600" : "bg-gray-800"}`}
                  onPress={() => setGender(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={t(`session.${option}`)}
                >
                  <Text
                    className={`font-semibold ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {t(`session.${option}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 items-center mb-4"
            onPress={handleStart}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t("session.start")}
          >
            <Text className="text-white text-lg font-bold">
              {t("session.start")}
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-600 text-xs leading-4 text-center">
            {t("session.disclaimer")}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {estimate && (
            <Card className="mb-4 items-center">
              <Text className="text-gray-400 text-xs mb-1">
                {t("session.bacNow")}
              </Text>
              <Text
                className={`${LEVEL_STYLES[estimate.level].text} text-5xl font-bold`}
              >
                {estimate.bac.toFixed(3)}%
              </Text>
              <Text className={`${LEVEL_STYLES[estimate.level].text} text-sm font-semibold mt-2`}>
                {t(LEVEL_STYLES[estimate.level].labelKey)}
              </Text>

              <View className="h-2 bg-gray-700 rounded-full overflow-hidden w-full mt-4">
                <View
                  className={`h-2 rounded-full ${LEVEL_STYLES[estimate.level].bar}`}
                  style={{
                    width: `${Math.min(100, (estimate.bac / 0.12) * 100)}%`,
                  }}
                />
              </View>

              <View className="flex-row mt-5 w-full">
                <View className="flex-1 items-center">
                  <Text className="text-white text-lg font-bold">
                    {estimate.standardDrinks}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {t("session.standardDrinks")}
                  </Text>
                </View>
                <View className="w-px bg-gray-700" />
                <View className="flex-1 items-center">
                  <Text className="text-white text-lg font-bold">
                    {estimate.totalCalories}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">kcal</Text>
                </View>
                <View className="w-px bg-gray-700" />
                <View className="flex-1 items-center">
                  <Text className="text-white text-lg font-bold">
                    {estimate.soberAt
                      ? new Date(estimate.soberAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {t("session.soberAt")}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          <Text className="text-white text-base font-bold mb-3">
            {t("session.addDrink")}
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {quickDrinkUnits.map((unit) => (
              <TouchableOpacity
                key={unit.id}
                className="bg-gray-800 rounded-xl px-3 py-2 mr-2 mb-2 flex-row items-center"
                onPress={() => handleAddDrink(unit.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${t(unit.nameKey)} ${unit.volume}ml`}
              >
                <Text className="text-lg mr-1.5">{unit.emoji}</Text>
                <Text className="text-gray-300 text-sm">
                  {t(unit.nameKey)} {unit.volume}ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-bold">
              {t("session.logTitle", { count: session.drinks.length })}
            </Text>
            {session.drinks.length > 0 && (
              <TouchableOpacity
                onPress={handleUndo}
                accessibilityRole="button"
                accessibilityLabel={t("session.undo")}
              >
                <Text className="text-gray-400 text-sm">
                  ↩︎ {t("session.undo")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {session.drinks.length === 0 ? (
            <View className="bg-gray-800 rounded-xl p-6 mb-4 items-center">
              <Text className="text-gray-500 text-sm">
                {t("session.empty")}
              </Text>
            </View>
          ) : (
            <View className="bg-gray-800 rounded-xl p-2 mb-4">
              {[...session.drinks].reverse().map((drink) => (
                <View
                  key={drink.id}
                  className="flex-row items-center px-2 py-2"
                >
                  <Text className="text-xl mr-3">{drink.emoji}</Text>
                  <Text className="text-white text-sm flex-1">
                    {t(drink.nameKey)} · {drink.volume}ml · {drink.abv}%
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {new Date(drink.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 items-center mb-3"
            onPress={handleEndAndSave}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t("session.endSave")}
          >
            <Text className="text-white text-base font-bold">
              {t("session.endSave")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-gray-700 rounded-xl py-3 items-center mb-4"
            onPress={handleDiscard}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t("session.discard")}
          >
            <Text className="text-gray-400 text-sm font-semibold">
              {t("session.discard")}
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-600 text-xs leading-4 text-center">
            {t("session.disclaimer")}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
