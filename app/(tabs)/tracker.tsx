import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { trackEngagement } from "../../utils/engagementAnalytics";

import CalendarStrip from "../../components/CalendarStrip";
import DrinkLogItem from "../../components/DrinkLogItem";
import AddDrinkModal from "../../components/AddDrinkModal";
import InlineBannerAd from "../../components/InlineBannerAd";
import TrackerInsightsCard from "../../components/TrackerInsightsCard";
import StatusTiles from "../../components/tracker/StatusTiles";
import QuickLogRow from "../../components/tracker/QuickLogRow";
import WeeklyStatsCard from "../../components/tracker/WeeklyStatsCard";
import UndoToast from "../../components/ui/UndoToast";
import { useDialog } from "../../components/ui/DialogProvider";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import { shouldStackHeader } from "../../utils/fontScale";
import {
  DrinkLog,
  addDrinkLogReturningLog,
  getDrinkLogs,
  getDrinkLogsForDate,
  deleteDrinkLog,
  getWeeklyStats,
  restoreDrinkLog,
} from "../../utils/trackerStorage";
import {
  QuickLogItem,
  QuickLogRefreshTrigger,
  buildQuickLogItems,
  computeDaySummary,
  nextQuickLogSnapshot,
} from "../../utils/engagement/quickLog";
import { drinkPresets } from "../../data/drinkPresets";
import {
  buildTrackerInsights,
  TrackerInsights,
} from "../../utils/engagement/trackerInsights";

import {
  SobrietyChallenge,
  ChallengeProgress,
  getChallenge,
  startChallenge,
  stopChallenge,
  computeChallengeProgress,
  estimateMoneySaved,
  toLocalDateString,
} from "../../utils/engagement/sobrietyChallenge";
import {
  WeeklyProgress,
  getWeeklyGoal,
  setWeeklyGoal,
  clearWeeklyGoal,
  computeWeeklyProgress,
} from "../../utils/engagement/weeklyGoal";
import { getChallengeStartDate } from "../../utils/engagement/weekSummary";
import { formatStandardDrinks } from "../../utils/alcoholConstants";
import { updateSobrietyWidget } from "../../widgets/updateSobrietyWidget";
import {
  logDrinkLogged,
  logChallengeCompleted,
  logChallengeStarted,
  logWeeklyGoalExceeded,
  logWeeklyGoalSet,
} from "../../utils/analytics";


interface WeeklyStatsData {
  labels: string[];
  drinks: number[];
  calories: number[];
  totalDrinks: number;
  totalCalories: number;
  totalSpend: number;
}

const EMPTY_WEEKLY: WeeklyStatsData = {
  labels: [],
  drinks: [],
  calories: [],
  totalDrinks: 0,
  totalCalories: 0,
  totalSpend: 0,
};

// 챌린지 시작 전 소비 패턴을 추정하는 기준 기간(일)
const SAVINGS_BASELINE_DAYS = 28;

const formatDateLabel = (date: Date, locale?: string): string =>
  date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });

// 되돌리기 토스트는 하나만 쓴다(빠른 기록·삭제 중 마지막 동작이 이긴다).
// nonce는 같은 동작이 연달아 일어나도 자동 숨김 타이머를 다시 시작하기 위한 키다.
type UndoTarget =
  | { readonly kind: "quick_log"; readonly id: string; readonly name: string; readonly nonce: number }
  | { readonly kind: "delete"; readonly log: DrinkLog; readonly nonce: number };

export default function TrackerScreen() {
  const { t, i18n } = useTranslation();
  const { toast } = useDialog();
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const stackHeader = shouldStackHeader(fontScale);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData>(EMPTY_WEEKLY);
  const [insights, setInsights] = useState<TrackerInsights>(() =>
    buildTrackerInsights([], new Date())
  );
  // 빠른 기록 칩 스냅샷 — 포커스(날짜 변경 포함) 때만 다시 계산해 기록 직후 순서가 바뀌지 않게 한다.
  const [quickLogItems, setQuickLogItems] = useState<readonly QuickLogItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [undoTarget, setUndoTarget] = useState<UndoTarget | null>(null);
  const quickLogBusyRef = useRef(false);
  const undoNonceRef = useRef(0);
  const [isQuickLogging, setQuickLogging] = useState(false);
  const [challenge, setChallenge] = useState<SobrietyChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] =
    useState<ChallengeProgress | null>(null);
  const [moneySaved, setMoneySaved] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(
    null
  );
  // 초과·달성 이벤트는 상태가 처음 뒤집힐 때만 1회 보낸다.
  const goalExceededRef = useRef<boolean | null>(null);
  const challengeCompletedRef = useRef<string | null>(null);


  const refreshData = useCallback(async (
    quickLogTrigger: QuickLogRefreshTrigger = "data_change"
  ) => {
    const insightStart = new Date(selectedDate);
    insightStart.setDate(selectedDate.getDate() - 13);
    insightStart.setHours(0, 0, 0, 0);
    const insightEnd = new Date(selectedDate);
    insightEnd.setHours(23, 59, 59, 999);
    const [dateLogs, stats, insightLogs, storedChallenge, storedGoal] =
      await Promise.all([
        getDrinkLogsForDate(selectedDate),
        getWeeklyStats(selectedDate),
        getDrinkLogs(insightStart, insightEnd),
        getChallenge(),
        getWeeklyGoal(),
      ]);
    setLogs(dateLogs.sort((a, b) => b.timestamp - a.timestamp));
    setWeeklyStats(stats);
    setInsights(buildTrackerInsights(insightLogs, selectedDate));
    // 빠른 기록 칩 후보(최근 14일) — 인사이트와 같은 조회 결과를 재사용한다.
    const freshQuickLogItems = buildQuickLogItems(
      insightLogs,
      drinkPresets,
      (nameKey) => t(nameKey),
      Date.now()
    );
    setQuickLogItems((current) =>
      nextQuickLogSnapshot(current, freshQuickLogItems, quickLogTrigger)
    );
    const nextWeeklyProgress = computeWeeklyProgress(
      storedGoal,
      stats.totalDrinks
    );
    setWeeklyProgress(nextWeeklyProgress);
    if (nextWeeklyProgress) {
      if (goalExceededRef.current === false && nextWeeklyProgress.exceeded) {
        logWeeklyGoalExceeded(nextWeeklyProgress.limitDrinks);
      }
      goalExceededRef.current = nextWeeklyProgress.exceeded;
    } else {
      goalExceededRef.current = null;
    }

    setChallenge(storedChallenge);
    if (storedChallenge) {
      const today = new Date();
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      const challengeStart = getChallengeStartDate(storedChallenge);
      const baselineStart = new Date(challengeStart);
      baselineStart.setDate(baselineStart.getDate() - SAVINGS_BASELINE_DAYS);
      const [challengeLogs, baselineLogs] = await Promise.all([
        getDrinkLogs(challengeStart, endOfToday),
        getDrinkLogs(baselineStart, challengeStart),
      ]);
      const drinkDates = challengeLogs.map((log) =>
        toLocalDateString(new Date(log.timestamp))
      );
      const progress = computeChallengeProgress(storedChallenge, drinkDates, today);
      setChallengeProgress(progress);
      const challengeKey = `${storedChallenge.startDate}-${storedChallenge.targetDays}`;
      if (progress.succeeded && challengeCompletedRef.current !== challengeKey) {
        challengeCompletedRef.current = challengeKey;
        logChallengeCompleted(storedChallenge.targetDays);
      }
      const baselineSpend = baselineLogs.reduce(
        (sum, log) => sum + (log.price ?? 0),
        0
      );
      setMoneySaved(
        estimateMoneySaved(
          baselineSpend,
          SAVINGS_BASELINE_DAYS,
          progress.currentStreakDays
        )
      );
    } else {
      setChallengeProgress(null);
      setMoneySaved(0);
    }

    // 기록/챌린지 변화를 홈 화면 위젯에도 반영 (Android 전용, 그 외 no-op)
    void updateSobrietyWidget();
  }, [selectedDate, t]);


  // 포커스 진입·날짜 변경(refreshData 재생성) 시에만 칩 순서를 새로 정한다.
  useFocusEffect(
    useCallback(() => {
      refreshData("focus");
    }, [refreshData])
  );

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // 확인 없이 즉시 삭제하고, 실수 대비로 되돌리기 토스트를 띄운다.
  const handleDeleteLog = useCallback(
    async (log: DrinkLog) => {
      trackEngagement("tracker_delete_intent", { surface: "drink_log" });
      const deleted = await deleteDrinkLog(log.id);
      if (deleted) {
        trackEngagement("tracker_delete_succeeded", { surface: "drink_log" });
        undoNonceRef.current += 1;
        setUndoTarget({ kind: "delete", log, nonce: undoNonceRef.current });
      }
      refreshData();
    },
    [refreshData]
  );

  const handleAddDrink = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleQuickLog = useCallback(
    async (item: QuickLogItem) => {
      if (quickLogBusyRef.current) return;
      quickLogBusyRef.current = true;
      setQuickLogging(true);
      try {
        const saved = await addDrinkLogReturningLog({
          name: item.name,
          emoji: item.emoji,
          volume: item.volume,
          abv: item.abv,
          presetId: item.presetId,
          price: item.price,
        });
        if (!saved) {
          trackEngagement("tracker_add_validation_failed", { reason: "storage_failed", source: "quick_log" });
          toast({ message: t("tracker.quickLog.failed"), variant: "error" });
          return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        logDrinkLogged("quick_log");
        trackEngagement("tracker_add_saved", { source: "quick_log" });
        undoNonceRef.current += 1;
        setUndoTarget({
          kind: "quick_log",
          id: saved.id,
          name: saved.name,
          nonce: undoNonceRef.current,
        });
        await refreshData();
      } finally {
        quickLogBusyRef.current = false;
        setQuickLogging(false);
      }
    },
    [refreshData, t, toast]
  );

  const handleUndo = useCallback(async () => {
    const target = undoTarget;
    setUndoTarget(null);
    if (!target) return;
    if (target.kind === "quick_log") {
      trackEngagement("tracker_delete_intent", { surface: "quick_log_undo" });
      const deleted = await deleteDrinkLog(target.id);
      if (deleted) trackEngagement("tracker_delete_succeeded", { surface: "quick_log_undo" });
    } else {
      // 삭제 되돌리기: id·시각·금액·presetId를 그대로 복원한다(legacy drink_logged는 보내지 않음).
      const restored = await restoreDrinkLog(target.log);
      if (restored) trackEngagement("tracker_add_saved", { source: "undo_delete" });
    }
    refreshData();
  }, [undoTarget, refreshData]);

  const hideUndoToast = useCallback(() => setUndoTarget(null), []);

  const handleStartChallenge = useCallback(
    async (days: number) => {
      if (!(await startChallenge(days))) return;
      logChallengeStarted(days);
      refreshData();
    },
    [refreshData]
  );

  const handleStopChallenge = useCallback(async () => {
    if (!(await stopChallenge())) return;
    trackEngagement("challenge_stopped");
    refreshData();
  }, [refreshData]);

  const handleSetWeeklyGoal = useCallback(
    async (limitDrinks: number) => {
      if (!(await setWeeklyGoal(limitDrinks))) return;
      logWeeklyGoalSet(limitDrinks);
      refreshData();
    },
    [refreshData]
  );

  const handleClearWeeklyGoal = useCallback(async () => {
    if (!(await clearWeeklyGoal())) return;
    trackEngagement("weekly_goal_cleared");
    refreshData();
  }, [refreshData]);


  const isToday = (() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  })();

  const dateLabel = formatDateLabel(selectedDate, i18n.language);
  const sectionTitle = isToday ? t("tracker.todayLog") : dateLabel;
  const undoMessage = !undoTarget
    ? ""
    : undoTarget.kind === "quick_log"
      ? t("tracker.quickLog.logged", { name: undoTarget.name })
      : t("tracker.deleted", { name: undoTarget.log.name });
  const undoA11y =
    undoTarget?.kind === "delete"
      ? t("tracker.deleteUndoA11y")
      : t("tracker.quickLog.undoA11y");
  const headerSubtitle = isToday
    ? `${t("tracker.today")} · ${dateLabel}`
    : dateLabel;

  const daySummary = useMemo(() => computeDaySummary(logs), [logs]);

  const renderLogItem = useCallback(
    ({ item }: { item: DrinkLog }) => (
      <DrinkLogItem log={item} onDelete={handleDeleteLog} />
    ),
    [handleDeleteLog]
  );

  const keyExtractor = useCallback((item: DrinkLog) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* 글꼴 200%에서는 제목이 버튼에 밀려 "Drink T…"로 잘리므로, 큰 배율에선 버튼을 제목 아래 줄로 내린다. */}
      <View
        className={`px-4 pt-2 pb-3 ${stackHeader ? "" : "flex-row items-center justify-between"}`}
      >
        <View className={stackHeader ? "" : "flex-1 mr-2"}>
          <Text
            className="text-2xl font-bold text-white"
            numberOfLines={stackHeader ? 2 : 1}
          >
            {t("tracker.title")}
          </Text>
          <Text
            className="text-textSecondary text-sm mt-0.5"
            numberOfLines={stackHeader ? 2 : 1}
          >
            {headerSubtitle}
          </Text>
        </View>
        <View className={`flex-row items-center ${stackHeader ? "mt-3" : ""}`}>
          <TouchableOpacity
            className="bg-gray-800 rounded-xl px-3 min-h-[44px] min-w-[44px] items-center justify-center mr-2"
            onPress={() => router.push("/session")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("session.homeCta")}
          >
            <Text className="text-base">🍻</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-accentButton rounded-xl px-4 min-h-[44px] flex-row items-center ${stackHeader ? "flex-1 justify-center" : ""}`}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("tracker.addDrink")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-1 flex-shrink">
              {t("tracker.addDrink")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-4">
          <StatusTiles
            challenge={challenge}
            challengeProgress={challengeProgress}
            moneySaved={moneySaved}
            onStartChallenge={handleStartChallenge}
            onStopChallenge={handleStopChallenge}
            weeklyProgress={weeklyProgress}
            onSetWeeklyGoal={handleSetWeeklyGoal}
            onClearWeeklyGoal={handleClearWeeklyGoal}
          />

          <TrackerInsightsCard
            insights={insights}
            onOpenGuide={() => router.push("/(tabs)/explore?section=encyclopedia&guide=standard-drink")}
          />
        </View>

        {/* 빠른 기록은 지금 시각으로 저장되므로 오늘을 볼 때만 노출 */}
        {isToday && (
          <QuickLogRow
            items={quickLogItems}
            onLog={handleQuickLog}
            onOpenCustom={() => setModalVisible(true)}
            disabled={isQuickLogging}
          />
        )}

        <CalendarStrip
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />

        <View className="px-4">
          {logs.length > 0 && (
            <View
              className="flex-row flex-wrap mb-3"
              accessible
              accessibilityLabel={`${t("tracker.daySummary.a11y")}: ${t("tracker.daySummary.drinks", { count: daySummary.drinks })}, ${t("tracker.daySummary.kcal", { value: daySummary.calories.toLocaleString() })}, ${t("tracker.daySummary.standardDrinks", { value: formatStandardDrinks(daySummary.standardDrinks) })}`}
            >
              <SummaryChip
                text={t("tracker.daySummary.drinks", { count: daySummary.drinks })}
                className="text-accentSoft"
              />
              <SummaryChip
                text={t("tracker.daySummary.kcal", { value: daySummary.calories.toLocaleString() })}
                className="text-amber-400"
              />
              <SummaryChip
                text={t("tracker.daySummary.standardDrinks", { value: formatStandardDrinks(daySummary.standardDrinks) })}
                className="text-blue-400"
              />
            </View>
          )}

          <SectionHeader title={sectionTitle} />

          {logs.length > 0 ? (
            <FlatList
              data={logs}
              renderItem={renderLogItem}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
            />
          ) : (
            <EmptyState
              className="bg-surface rounded-card mb-3"
              emoji="🍷"
              title={isToday ? t("tracker.empty") : t("tracker.emptyDate", { date: dateLabel })}
              description={isToday ? t("tracker.emptyHint") : undefined}
              actionLabel={isToday ? t("tracker.emptyCta") : undefined}
              onActionPress={isToday ? () => setModalVisible(true) : undefined}
            />
          )}

          {weeklyStats.labels.length > 0 && (
            <View className="mt-4">
              <WeeklyStatsCard
                stats={weeklyStats}
                weeklyLimit={weeklyProgress?.limitDrinks ?? null}
              />
              <InlineBannerAd className="mb-4" />
            </View>
          )}
        </View>
      </ScrollView>

      <UndoToast
        visible={undoTarget !== null}
        message={undoMessage}
        actionLabel={t("tracker.quickLog.undo")}
        actionAccessibilityLabel={undoA11y}
        onAction={handleUndo}
        onHide={hideUndoToast}
        resetKey={undoTarget?.nonce}
      />

      <AddDrinkModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddDrink}
      />
    </SafeAreaView>
  );
}

function SummaryChip({
  text,
  className,
}: {
  readonly text: string;
  readonly className: string;
}) {
  return (
    <View className="bg-surface rounded-full px-3 py-1.5 mr-2 mb-2">
      <Text className={`${className} text-sm font-semibold`}>{text}</Text>
    </View>
  );
}
