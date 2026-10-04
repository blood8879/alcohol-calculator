import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
import BacScale from "../components/session/BacScale";
import BacHeroNumber from "../components/session/BacHeroNumber";
import {
  LEVEL_STYLES,
  chunkPairs,
  elapsedLabelOf,
} from "../components/session/sessionUi";
import { computeElapsedTime } from "../utils/engagement/weekSummary";

import {
  DrinkingSession,
  SessionGender,
  estimateSession,
  quickDrinkUnits,
} from "../utils/engagement/drinkingSession";
import {
  logSessionDiscarded,
  logSessionEnded,
  logSessionStarted,
} from "../utils/analytics";
import {
  clearActiveSession,
  getActiveSession,
  getSessionProfile,
  setActiveSession,
  setSessionProfile,
} from "../utils/engagement/drinkingSessionStorage";
import { addDrinkLogsWithTimestamps } from "../utils/trackerStorage";
import { generateId } from "../utils/idGenerator";
import { formatStandardDrinks } from "../utils/alcoholConstants";
import { updateSobrietyWidget } from "../widgets/updateSobrietyWidget";
import {
  CustomDrink,
  getCustomDrinks,
} from "../utils/customDrinks";
import CustomDrinkManagerModal from "../components/CustomDrinkManagerModal";
import { useDialog } from "../components/ui/DialogProvider";
import {
  addSessionRecord,
  buildSessionRecord,
} from "../utils/engagement/sessionHistory";
import {
  getNotificationPrefs,
  requestPermissions,
  scheduleDriveSafeReminder,
} from "../utils/notificationUtils";
import { adUnits } from "../utils/adUnits";
import {
  recordInterstitialShown,
  shouldShowInterstitial,
} from "../utils/adFrequency";
import { useInterstitialAd } from "../hooks/useInterstitialAd";
import { trackEngagement } from "../utils/engagementAnalytics";
import { validateBodyWeight } from "../utils/bodyWeight";

// 빠른 잔 칩 그리드 항목(프리셋·커스텀·[+ 추가] 점선 칩).
type ChipItem =
  | { readonly kind: "preset"; readonly unit: (typeof quickDrinkUnits)[number] }
  | { readonly kind: "custom"; readonly drink: CustomDrink }
  | { readonly kind: "add" };

export default function SessionScreen() {
  const { t, i18n } = useTranslation();
  const { confirm, toast } = useDialog();
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const sessionRef = useRef<DrinkingSession | null>(null);
  const sessionWriteQueue = useRef<Promise<void>>(Promise.resolve());
  const endingRef = useRef(false);
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<SessionGender>("male");
  const [now, setNow] = useState(() => new Date());
  const [customDrinks, setCustomDrinks] = useState<CustomDrink[]>([]);
  const [managerVisible, setManagerVisible] = useState(false);
  const dangerAlertedRef = useRef(false);

  // 세션 종료·저장 후 전면광고. 라이브 세션 진행 중에는 표시하지 않는다.
  const { loaded: adLoaded, show: showSessionInterstitial } = useInterstitialAd(
    adUnits.sessionInterstitial
  );

  useEffect(() => {
    Promise.all([
      getActiveSession(),
      getSessionProfile(),
      getCustomDrinks(),
    ]).then(([storedSession, profile, drinks]) => {
      if (storedSession) {
        sessionRef.current = storedSession;
        setSession(storedSession);
        trackEngagement("session_resumed", { has_drinks: storedSession.drinks.length > 0 });
      }
      if (profile) {
        if (profile.weightKg !== null) setWeight(String(profile.weightKg));
        setGender(profile.gender);
      }
      setCustomDrinks(drinks);
      setLoaded(true);
    });
  }, []);

  // 세션 진행 중 30초마다 BAC 갱신(헤더 경과 시간도 이 시계로 갱신 — 분 단위 표시에 충분).
  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [session]);

  const estimate = useMemo(
    () => (session ? estimateSession(session, now) : null),
    [session, now]
  );

  const level = estimate?.level;
  const isDangerLevel = level === "danger" || level === "high";

  // BAC 레벨이 danger 이상으로 처음 진입할 때만 강한 햅틱을 울린다.
  // 다시 안전 범위로 내려가면 재무장한다.
  useEffect(() => {
    if (isDangerLevel && level && !dangerAlertedRef.current) {
      dangerAlertedRef.current = true;
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      ).catch(() => {});
    } else if (!isDangerLevel) {
      dangerAlertedRef.current = false;
    }
  }, [isDangerLevel, level]);

  const handleStart = useCallback(async () => {
    // 16회차: 30~250kg 밖 값(예: 70 뒤에 70을 덧붙인 7070)은 BAC를 "안전"으로 왜곡하므로 시작을 막는다.
    const weightCheck = validateBodyWeight(weight);
    if (!weightCheck.ok) {
      trackEngagement("session_start_validation_failed", {
        reason: weightCheck.reason === "out_of_range" ? "weight_out_of_range" : "invalid_weight",
      });
      toast({ message: t("errors.weightRange"), variant: "error" });
      return;
    }
    const parsedWeight = weightCheck.weightKg;
    const nextSession: DrinkingSession = {
      startedAt: Date.now(),
      weightKg: parsedWeight,
      gender,
      drinks: [],
    };
    const [sessionSaved] = await Promise.all([
      setActiveSession(nextSession),
      setSessionProfile({ weightKg: parsedWeight, gender }),
    ]);
    if (!sessionSaved) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    logSessionStarted();
    sessionRef.current = nextSession;
    setSession(nextSession);
    setNow(new Date());
  }, [weight, gender, t, toast]);

  const persistSession = useCallback((next: DrinkingSession, action: "preset_added" | "custom_added" | "drink_removed") => {
    sessionRef.current = next;
    setSession(next);
    setNow(new Date());
    sessionWriteQueue.current = sessionWriteQueue.current.then(async () => {
      const saved = await setActiveSession(next);
      if (saved) trackEngagement(action === "drink_removed" ? "session_drink_removed" : "session_drink_added", action === "drink_removed" ? undefined : { source: action === "preset_added" ? "preset" : "custom" });
    });
    return sessionWriteQueue.current;
  }, []);

  const handleAddDrink = useCallback(
    (unitId: string) => {
      const currentSession = sessionRef.current;
      if (!currentSession || endingRef.current) return;
      const unit = quickDrinkUnits.find((item) => item.id === unitId);
      if (!unit) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      void persistSession({
        ...currentSession,
        drinks: [
          ...currentSession.drinks,
          {
            id: generateId(),
            nameKey: unit.nameKey,
            emoji: unit.emoji,
            volume: unit.volume,
            abv: unit.abv,
            timestamp: Date.now(),
          },
        ],
      }, "preset_added");
    },
    [persistSession]
  );

  const handleAddCustomDrink = useCallback(
    (drink: CustomDrink) => {
      const currentSession = sessionRef.current;
      if (!currentSession || endingRef.current) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      void persistSession({
        ...currentSession,
        drinks: [
          ...currentSession.drinks,
          {
            id: generateId(),
            nameKey: drink.name,
            emoji: "🍸",
            volume: drink.volumeMl,
            abv: drink.abv,
            timestamp: Date.now(),
          },
        ],
      }, "custom_added");
    },
    [persistSession]
  );

  const handleUndo = useCallback(() => {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.drinks.length === 0 || endingRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void persistSession({
      ...currentSession,
      drinks: currentSession.drinks.slice(0, -1),
    }, "drink_removed");
  }, [persistSession]);

  const handleEndAndSave = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    try {
      await sessionWriteQueue.current;
      const currentSession = sessionRef.current;
      if (!currentSession) return;
      let completedRecord: ReturnType<typeof buildSessionRecord> | null = null;
      if (currentSession.drinks.length > 0) {
        const logsSaved = await addDrinkLogsWithTimestamps(
          currentSession.drinks.map((drink) => ({
            id: drink.id,
            name: t(drink.nameKey),
            emoji: drink.emoji,
            volume: drink.volume,
            abv: drink.abv,
            timestamp: drink.timestamp,
          }))
        );
        if (!logsSaved) return;

        // 세션 히스토리 저장 (폐기 시에는 저장하지 않음).
        const record = buildSessionRecord(currentSession, Date.now());
        if (!(await addSessionRecord(record))) return;
        completedRecord = record;

        // 운전 가능 추정 시각이 미래면 그 시각에 로컬 알림 예약.
        // 알림 예약 실패가 세션 저장을 막지 않도록 방어한다.
        if (record.soberAt && record.soberAt > Date.now()) {
          try {
            const prefs = await getNotificationPrefs();
            if (prefs.driveSafeEnabled && (await requestPermissions())) {
              await scheduleDriveSafeReminder(record.soberAt, i18n.language);
            }
          } catch (error) {
            console.warn("Failed to schedule drive-safe reminder:", error);
          }
        }
      }
      if (!(await clearActiveSession())) return;
      if (completedRecord) {
        logSessionEnded({
          durationSec: Math.round((completedRecord.endedAt - completedRecord.startedAt) / 1000),
          drinkCount: completedRecord.drinks.length,
        });
      }
      trackEngagement("session_save_succeeded", { had_drinks: currentSession.drinks.length > 0 });
      void updateSobrietyWidget();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      sessionRef.current = null;
      setSession(null);

      // 종료·저장 성공 후 전면광고. 단, danger/high 레벨(안전 정보 확인 순간)이거나
      // 빈도 캡에 걸리거나 광고 미로드면 건너뛰고 전환만 진행한다.
      const isDangerLevelNow =
        estimate?.level === "danger" || estimate?.level === "high";
      if (
        !isDangerLevelNow &&
        adLoaded &&
        (await shouldShowInterstitial("sessionEnd"))
      ) {
        if (showSessionInterstitial()) {
          void recordInterstitialShown("sessionEnd");
        }
      }

      router.replace("/(tabs)/tracker");
    } finally {
      endingRef.current = false;
    }
  }, [t, router, i18n.language, estimate, adLoaded, showSessionInterstitial]);

  const handleDiscard = useCallback(async () => {
    trackEngagement("session_discard_intent");
    const confirmed = await confirm({
      title: t("session.discardTitle"),
      message: t("session.discardMessage"),
      cancelLabel: t("common.cancel"),
      confirmLabel: t("session.discard"),
      destructive: true,
    });
    if (!confirmed) return;
    if (endingRef.current) return;
    endingRef.current = true;
    try {
      await sessionWriteQueue.current;
      if (!(await clearActiveSession())) return;
      logSessionDiscarded();
      sessionRef.current = null;
      setSession(null);
    } finally {
      endingRef.current = false;
    }
  }, [t, confirm]);

  const elapsedText = useMemo(() => {
    if (!session) return "";
    const label = elapsedLabelOf(computeElapsedTime(session.startedAt, now.getTime()));
    return t(label.key, label.params);
  }, [session, now, t]);

  const chipItems = useMemo<ChipItem[]>(
    () => [
      ...quickDrinkUnits.map((unit) => ({ kind: "preset" as const, unit })),
      ...customDrinks.map((drink) => ({ kind: "custom" as const, drink })),
      { kind: "add" as const },
    ],
    [customDrinks]
  );

  const renderChip = (item: ChipItem) => {
    const baseClass =
      "flex-1 bg-surface rounded-xl px-3 min-h-[48px] flex-row items-center";
    if (item.kind === "preset") {
      const label = `${t(item.unit.nameKey)} ${item.unit.volume}ml`;
      return (
        <TouchableOpacity
          key={`preset-${item.unit.id}`}
          className={baseClass}
          onPress={() => handleAddDrink(item.unit.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text className="text-lg mr-2">{item.unit.emoji}</Text>
          <Text className="text-textPrimary text-sm flex-1" numberOfLines={2}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    }
    if (item.kind === "custom") {
      const label = `${item.drink.name} ${item.drink.volumeMl}ml`;
      return (
        <TouchableOpacity
          key={`custom-${item.drink.id}`}
          className={`${baseClass} border border-green-700/50`}
          onPress={() => handleAddCustomDrink(item.drink)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text className="text-lg mr-2">🍸</Text>
          <Text className="text-textPrimary text-sm flex-1" numberOfLines={2}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key="add"
        className={`${baseClass} justify-center border border-dashed border-gray-600`}
        onPress={() => setManagerVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("customDrinks.add")}
      >
        <Ionicons name="add" size={18} color="#9ca3af" />
        <Text className="text-textSecondary text-sm ml-1">
          {t("customDrinks.addShort")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 min-h-[44px] min-w-[44px] justify-center"
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-textPrimary flex-1" numberOfLines={1}>
          {t("session.title")}
        </Text>
        {session && (
          <View
            className="bg-green-500/15 rounded-full px-3 py-1 ml-2"
            accessible
            accessibilityLabel={`${t("session.activeBadge")}, ${elapsedText}`}
          >
            <Text className="text-accentSoft text-xs font-bold" numberOfLines={1}>
              {t("session.activeBadge")} · {elapsedText}
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
            <Text className="text-textPrimary text-lg font-bold text-center mb-2">
              {t("session.subtitle")}
            </Text>
            <Text className="text-textSecondary text-sm text-center leading-5">
              {t("session.description")}
            </Text>
          </View>

          <Text className="text-textSecondary text-sm mb-2">{t("session.weight")} (kg)</Text>
          <TextInput
            className="bg-surface text-textPrimary rounded-xl px-4 py-3 mb-4 text-base"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            selectTextOnFocus
            placeholder="65"
            placeholderTextColor="#8b93a1"
            accessibilityLabel={t("session.weight")}
          />

          <Text className="text-textSecondary text-sm mb-2">{t("session.gender")}</Text>
          <View className="flex-row mb-6">
            {(["male", "female"] as const).map((option) => {
              const isActive = gender === option;
              return (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 rounded-xl py-3 min-h-[48px] justify-center items-center ${
                    option === "male" ? "mr-2" : ""
                  } ${isActive ? "bg-accentButton" : "bg-surface"}`}
                  onPress={() => setGender(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={t(`session.${option}`)}
                >
                  <Text
                    className={`font-semibold ${
                      isActive ? "text-textPrimary" : "text-textSecondary"
                    }`}
                  >
                    {t(`session.${option}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="bg-accentButton rounded-xl py-4 min-h-[56px] justify-center items-center mb-4"
            onPress={handleStart}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t("session.start")}
          >
            <Text className="text-white text-lg font-bold">
              {t("session.start")}
            </Text>
          </TouchableOpacity>

          <Text className="text-textMuted text-xs leading-4 text-center">
            {t("session.disclaimer")}
          </Text>
        </ScrollView>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {estimate && isDangerLevel && (
              <View
                className="rounded-xl p-4 mb-4 flex-row items-center"
                style={{
                  backgroundColor:
                    estimate.level === "high" ? "#7f1d1d" : "#7c2d12",
                }}
                accessibilityRole="alert"
              >
                <Text className="text-2xl mr-3">⚠️</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm mb-0.5">
                    {t("session.dangerBannerTitle")}
                  </Text>
                  <Text className="text-gray-200 text-xs leading-4">
                    {t("session.dangerBannerBody")}
                  </Text>
                </View>
              </View>
            )}

            {estimate && (
              <Card className="mb-4 items-center">
                <Text className="text-textSecondary text-xs mb-1">
                  {t("session.bacNow")}
                </Text>
                <BacHeroNumber bac={estimate.bac} level={estimate.level} />
                <Text className={`${LEVEL_STYLES[estimate.level].text} text-sm font-semibold mt-2`}>
                  {t(LEVEL_STYLES[estimate.level].labelKey)}
                </Text>

                <BacScale
                  bac={estimate.bac}
                  level={estimate.level}
                  accessibilityLabel={`${t("session.bacNow")} ${estimate.bac.toFixed(3)}%, ${t(
                    LEVEL_STYLES[estimate.level].labelKey
                  )}`}
                />

                <View className="flex-row mt-4 w-full">
                  <View className="flex-1 items-center">
                    <Text className="text-textPrimary text-lg font-bold">
                      {formatStandardDrinks(estimate.standardDrinks)}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1">
                      {t("session.standardDrinks")}
                    </Text>
                  </View>
                  <View className="w-px bg-surfaceDeep" />
                  <View className="flex-1 items-center">
                    <Text className="text-textPrimary text-lg font-bold">
                      {estimate.totalCalories}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1">kcal</Text>
                  </View>
                  <View className="w-px bg-surfaceDeep" />
                  <View className="flex-1 items-center">
                    <Text className="text-textPrimary text-lg font-bold">
                      {estimate.soberAt
                        ? new Date(estimate.soberAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1">
                      {t("session.soberAt")}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            <Text className="text-textPrimary text-base font-bold mb-3">
              {t("session.addDrink")}
            </Text>
            <View className="mb-4">
              {chunkPairs(chipItems).map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} className="flex-row mb-2">
                  {renderChip(row[0])}
                  <View className="w-2" />
                  {row[1] ? renderChip(row[1]) : <View className="flex-1" />}
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap items-center justify-between mb-3">
              <Text className="text-textPrimary text-base font-bold flex-shrink mr-2">
                {t("session.logTitle", { count: session.drinks.length })}
              </Text>
              {session.drinks.length > 0 && (
                <TouchableOpacity
                  onPress={handleUndo}
                  className="min-h-[44px] justify-center px-2"
                  accessibilityRole="button"
                  accessibilityLabel={t("session.undo")}
                >
                  <Text className="text-textSecondary text-sm">
                    ↩︎ {t("session.undo")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {session.drinks.length === 0 ? (
              <View className="bg-surface rounded-xl p-6 mb-4 items-center">
                <Text className="text-textMuted text-sm">
                  {t("session.empty")}
                </Text>
              </View>
            ) : (
              <View className="bg-surface rounded-xl p-2 mb-4">
                {[...session.drinks].reverse().map((drink) => (
                  <View
                    key={drink.id}
                    className="flex-row items-center px-2 py-2"
                  >
                    <Text className="text-xl mr-3">{drink.emoji}</Text>
                    <Text className="text-textPrimary text-sm flex-1">
                      {t(drink.nameKey)} · {drink.volume}ml · {drink.abv}%
                    </Text>
                    <Text className="text-textMuted text-xs">
                      {new Date(drink.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 저강조 파괴 액션: 주 버튼(하단 고정)과 시각 차이를 크게 둔다. */}
            <TouchableOpacity
              className="border border-red-500/40 rounded-xl min-h-[48px] justify-center items-center mt-2 mb-4"
              onPress={handleDiscard}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t("session.discard")}
            >
              <Text className="text-red-400 text-sm font-semibold">
                {t("session.discard")}
              </Text>
            </TouchableOpacity>

            <Text className="text-textMuted text-xs leading-4 text-center">
              {t("session.disclaimer")}
            </Text>
          </ScrollView>

          {/* 하단 고정 액션 바: 엄지 도달 범위의 주 버튼(safe-area 포함). */}
          <View
            className="bg-background border-t border-surfaceDeep px-4 pt-3"
            style={{ paddingBottom: 12 }}
          >
            <TouchableOpacity
              className="bg-accentButton rounded-xl min-h-[56px] justify-center items-center px-4"
              onPress={handleEndAndSave}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t("session.endSave")}
            >
              <Text className="text-white text-base font-bold" numberOfLines={2}>
                {t("session.endSave")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <CustomDrinkManagerModal
        visible={managerVisible}
        onClose={() => setManagerVisible(false)}
        onChange={setCustomDrinks}
      />
    </SafeAreaView>
  );
}
