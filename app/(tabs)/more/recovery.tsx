import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-gifted-charts";
import InlineBannerAd from "../../../components/InlineBannerAd";
import Card from "../../../components/ui/Card";

type Gender = "male" | "female";

interface ChartPoint {
  value: number;
  label?: string;
}

interface BacResult {
  data: ChartPoint[];
  peakBac: number;
  soberHours: number;
}

function computeBac(
  weight: number,
  gender: Gender,
  drinks: number
): BacResult | null {
  if (
    !Number.isFinite(weight) ||
    !Number.isFinite(drinks) ||
    weight <= 0 ||
    drinks <= 0
  ) {
    return null;
  }

  const r = gender === "male" ? 0.68 : 0.55;
  const bodyWeightGrams = weight * 1000;
  const peakBac = ((drinks * 14) / (bodyWeightGrams * r)) * 100;
  const soberHours = peakBac / 0.015;
  const maxHour = Math.ceil(soberHours);

  const data: ChartPoint[] = [];
  for (let t = 0; t <= maxHour; t += 1) {
    const bac = Math.max(0, peakBac - 0.015 * t);
    data.push({
      value: Math.round(bac * 10000) / 10000,
      label: t % 2 === 0 ? String(t) : undefined,
    });
  }

  return {
    data,
    peakBac: Math.round(peakBac * 10000) / 10000,
    soberHours,
  };
}

export default function RecoveryScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [weightInput, setWeightInput] = useState("70");
  const [gender, setGender] = useState<Gender>("male");
  const [drinksInput, setDrinksInput] = useState("3");

  const result = useMemo<BacResult | null>(() => {
    const weight = Number(weightInput);
    const drinks = Number(drinksInput);
    return computeBac(weight, gender, drinks);
  }, [weightInput, gender, drinksInput]);

  const recoveryTips: string[] = [
    t("recovery.tip1"),
    t("recovery.tip2"),
    t("recovery.tip3"),
    t("recovery.tip4"),
    t("recovery.tip5"),
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          accessibilityRole="button"
          accessibilityLabel={t("recovery.back")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t("recovery.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="mb-4">
          <Text className="text-white font-semibold text-base mb-3">
            {t("recovery.yourDetails")}
          </Text>

          <Text className="text-gray-400 text-sm mb-1">
            {t("recovery.weight")}
          </Text>
          <TextInput
            className="bg-gray-900 text-white rounded-lg px-3 py-2 mb-4"
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="70"
            placeholderTextColor="#6b7280"
          />

          <Text className="text-gray-400 text-sm mb-1">
            {t("recovery.gender")}
          </Text>
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`flex-1 rounded-lg py-2 mr-2 items-center ${
                gender === "male" ? "bg-green-600" : "bg-gray-900"
              }`}
              onPress={() => setGender("male")}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={t("recovery.male")}
              accessibilityState={{ selected: gender === "male" }}
            >
              <Text
                className={
                  gender === "male" ? "text-white font-semibold" : "text-gray-400"
                }
              >
                {t("recovery.male")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-lg py-2 items-center ${
                gender === "female" ? "bg-green-600" : "bg-gray-900"
              }`}
              onPress={() => setGender("female")}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={t("recovery.female")}
              accessibilityState={{ selected: gender === "female" }}
            >
              <Text
                className={
                  gender === "female"
                    ? "text-white font-semibold"
                    : "text-gray-400"
                }
              >
                {t("recovery.female")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-400 text-sm mb-1">
            {t("recovery.standardDrinks")}
          </Text>
          <TextInput
            className="bg-gray-900 text-white rounded-lg px-3 py-2"
            keyboardType="numeric"
            value={drinksInput}
            onChangeText={setDrinksInput}
            placeholder="3"
            placeholderTextColor="#6b7280"
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-white font-semibold text-base mb-3">
            {t("recovery.bacTimeline")}
          </Text>
          {result ? (
            <>
              <LineChart
                data={result.data}
                color="#22c55e"
                thickness={2}
                dataPointsColor="#4ade80"
                yAxisTextStyle={{ color: "#9ca3af" }}
                xAxisLabelTextStyle={{ color: "#9ca3af" }}
                xAxisColor="#374151"
                yAxisColor="#374151"
                rulesColor="#374151"
                noOfSections={4}
              />
              <View className="mt-4">
                <Text className="text-gray-400 text-sm">
                  {t("recovery.peakBac")}:{" "}
                  <Text className="text-green-400 font-semibold">
                    {result.peakBac.toFixed(4)}%
                  </Text>
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {t("recovery.timeToSober")}
                  :{" "}
                  <Text className="text-green-400 font-semibold">
                    {result.soberHours.toFixed(1)}
                    {t("recovery.hoursUnit")}
                  </Text>
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-gray-400 text-sm">
              {t("recovery.emptyState")}
            </Text>
          )}
        </Card>

        <InlineBannerAd />

        <View className="mb-4">
          <Text className="text-white font-semibold text-base mb-3">
            {t("recovery.tipsTitle")}
          </Text>
          {recoveryTips.map((tip, index) => (
            <Card key={index} className="mb-3 flex-row">
              <Text className="text-green-400 font-bold mr-3">{index + 1}</Text>
              <Text className="text-gray-300 text-sm flex-1 leading-5">
                {tip}
              </Text>
            </Card>
          ))}
          <Text className="text-gray-500 text-xs mt-1">
            {t("recovery.disclaimer")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
