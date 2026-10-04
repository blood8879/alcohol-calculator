import type { DrinkPreset } from "../../data/types";
import { ETHANOL_DENSITY, STANDARD_DRINK_GRAMS } from "../alcoholConstants";

// 트래커 "빠른 기록" 칩과 일 요약 칩 계산용 순수 함수 모음.

type LogLike = {
  readonly name: string;
  readonly emoji: string;
  readonly volume: number;
  readonly abv: number;
  readonly calories?: number;
  readonly presetId?: string;
  readonly price?: number;
  readonly timestamp: number;
};

export type QuickLogItem = {
  readonly key: string;
  readonly name: string;
  readonly emoji: string;
  readonly volume: number;
  readonly abv: number;
  readonly presetId?: string;
  readonly price?: number;
  readonly source: "recent" | "preset";
};

export const QUICK_LOG_LIMIT = 4;
export const QUICK_LOG_WINDOW_DAYS = 14;
export const QUICK_LOG_FALLBACK_PRESET_IDS = ["soju", "beer", "red-wine"] as const;

export const quickLogKey = (name: string, volume: number, abv: number): string =>
  `${name.trim().toLowerCase()}|${volume}|${abv}`;

// 최근 기록에서 자주 마신 음료를 (이름+용량+도수) 단위로 묶어 횟수↓, 최근순↓ 정렬한다.
export const selectFrequentDrinks = (
  logs: readonly LogLike[],
  now: number,
  limit: number = QUICK_LOG_LIMIT,
  windowDays: number = QUICK_LOG_WINDOW_DAYS
): QuickLogItem[] => {
  const since = now - windowDays * 24 * 60 * 60 * 1000;
  const groups = new Map<string, { count: number; latest: LogLike }>();
  logs.forEach((log) => {
    if (log.timestamp < since || log.timestamp > now) return;
    const key = quickLogKey(log.name, log.volume, log.abv);
    const group = groups.get(key);
    if (!group) {
      groups.set(key, { count: 1, latest: log });
      return;
    }
    group.count += 1;
    if (log.timestamp > group.latest.timestamp) group.latest = log;
  });

  return [...groups.entries()]
    .sort(
      ([, a], [, b]) =>
        b.count - a.count || b.latest.timestamp - a.latest.timestamp
    )
    .slice(0, Math.max(0, limit))
    .map(([key, { latest }]) => ({
      key,
      name: latest.name,
      emoji: latest.emoji,
      volume: latest.volume,
      abv: latest.abv,
      presetId: latest.presetId,
      price: latest.price,
      source: "recent" as const,
    }));
};

// 자주 마신 음료가 부족하면 기본 프리셋(소주·맥주·와인)으로 채운다.
export const buildQuickLogItems = (
  logs: readonly LogLike[],
  presets: readonly DrinkPreset[],
  resolveName: (nameKey: string) => string,
  now: number,
  limit: number = QUICK_LOG_LIMIT
): QuickLogItem[] => {
  const items = selectFrequentDrinks(logs, now, limit);
  const usedKeys = new Set(items.map((item) => item.key));
  const usedPresetIds = new Set(
    items.map((item) => item.presetId).filter((id): id is string => !!id)
  );

  for (const presetId of QUICK_LOG_FALLBACK_PRESET_IDS) {
    if (items.length >= limit) break;
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) continue;
    const name = resolveName(preset.nameKey);
    const key = quickLogKey(name, preset.volume, preset.abv);
    if (usedKeys.has(key) || usedPresetIds.has(preset.id)) continue;
    usedKeys.add(key);
    items.push({
      key,
      name,
      emoji: preset.emoji,
      volume: preset.volume,
      abv: preset.abv,
      presetId: preset.id,
      source: "preset",
    });
  }
  return items;
};

// 칩 순서는 손가락 아래에서 바뀌면 안 된다(실기기: 맥주 기록 직후 맥주가 1번으로 올라가
// 같은 자리를 다시 누르자 다른 술이 기록됨). 그래서 목록은 화면 포커스(날짜 변경 포함) 때만
// 다시 계산하고, 빠른 기록·되돌리기·삭제 같은 데이터 변경 뒤에는 기존 스냅샷을 유지한다.
export type QuickLogRefreshTrigger = "focus" | "data_change";

export const nextQuickLogSnapshot = (
  current: readonly QuickLogItem[],
  fresh: readonly QuickLogItem[],
  trigger: QuickLogRefreshTrigger
): readonly QuickLogItem[] => {
  if (trigger === "focus" || current.length === 0) return fresh;
  return current;
};

export type DaySummary = {
  readonly drinks: number;
  readonly calories: number;
  readonly pureAlcoholGrams: number;
  readonly standardDrinks: number;
};

export const pureAlcoholGrams = (volume: number, abv: number): number =>
  volume * (abv / 100) * ETHANOL_DENSITY;

// 일 요약: 잔 수, 칼로리(정수), 표준잔(소수 1자리, 14g 기준)
export const computeDaySummary = (logs: readonly LogLike[]): DaySummary => {
  const grams = logs.reduce(
    (sum, log) => sum + pureAlcoholGrams(log.volume, log.abv),
    0
  );
  const calories = logs.reduce((sum, log) => sum + (log.calories ?? 0), 0);
  return {
    drinks: logs.length,
    calories: Math.round(calories),
    pureAlcoholGrams: Math.round(grams * 10) / 10,
    standardDrinks: Math.round((grams / STANDARD_DRINK_GRAMS) * 10) / 10,
  };
};
