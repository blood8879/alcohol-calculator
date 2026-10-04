import { BacLevel, bacLevelOf } from "../../utils/engagement/drinkingSession";
import type { ElapsedTime } from "../../utils/engagement/weekSummary";

// 라이브 세션 화면 표시용 순수 헬퍼. BAC 수식·임계값 자체는 drinkingSession.ts가 단일 출처이며,
// 여기서는 그 결과를 스케일 위치·색·문구 키로 옮기기만 한다.

// 레벨 4색(다크 배경). text = 수치·레벨 문구, bar = 스케일 구간.
export const LEVEL_STYLES = {
  safe: {
    text: "text-green-400",
    textHex: "#4ade80",
    barHex: "#22c55e",
    labelKey: "session.levelSafe",
  },
  caution: {
    text: "text-amber-400",
    textHex: "#fbbf24",
    barHex: "#f59e0b",
    labelKey: "session.levelCaution",
  },
  danger: {
    text: "text-orange-400",
    textHex: "#fb923c",
    barHex: "#f97316",
    labelKey: "session.levelDanger",
  },
  high: {
    text: "text-red-400",
    textHex: "#f87171",
    barHex: "#ef4444",
    labelKey: "session.levelHigh",
  },
} as const satisfies Record<
  BacLevel,
  { text: string; textHex: string; barHex: string; labelKey: string }
>;

// 스케일 상한(%). 기존 진행바와 동일하게 0~0.12% 범위를 보여준다.
export const BAC_SCALE_MAX = 0.12;

// 레벨 경계(%) — bacLevelOf의 임계(0.02/0.05/0.08)와 같아야 한다(테스트로 고정).
export const BAC_SCALE_TICKS = [0.02, 0.05, 0.08] as const;

export type BacScaleZone = {
  readonly level: BacLevel;
  readonly from: number; // %
  readonly to: number; // %
  readonly fraction: number; // 스케일 전체 대비 폭(0~1)
};

const ZONE_LEVELS: readonly BacLevel[] = ["safe", "caution", "danger", "high"];

export const BAC_SCALE_ZONES: readonly BacScaleZone[] = ZONE_LEVELS.map(
  (level, index) => {
    const from = index === 0 ? 0 : BAC_SCALE_TICKS[index - 1];
    const to = index < BAC_SCALE_TICKS.length ? BAC_SCALE_TICKS[index] : BAC_SCALE_MAX;
    return { level, from, to, fraction: (to - from) / BAC_SCALE_MAX };
  }
);

// BAC(%) → 스케일상 위치(0~1). 음수·NaN은 0, 상한 초과는 1로 고정한다.
export const bacToScalePosition = (bac: number): number => {
  if (!Number.isFinite(bac) || bac <= 0) return 0;
  return Math.min(1, bac / BAC_SCALE_MAX);
};

// 경계값(%) → 스케일상 위치(0~1). 눈금 라벨 배치용.
export const tickToScalePosition = (tick: number): number => tick / BAC_SCALE_MAX;

// 현재 BAC가 속한 구간의 레벨(bacLevelOf와 동일 규칙).
export const bacScaleZoneOf = (bac: number): BacLevel =>
  bacLevelOf(Number.isFinite(bac) ? bac : 0);

export type ElapsedLabel =
  | { readonly key: "home.sessionCard.elapsedHoursMinutes"; readonly params: { hours: number; minutes: number } }
  | { readonly key: "home.sessionCard.elapsedMinutes"; readonly params: { minutes: number } };

// 경과 시간 → 홈 세션 카드와 같은 i18n 키·파라미터.
export const elapsedLabelOf = (elapsed: ElapsedTime): ElapsedLabel =>
  elapsed.hours > 0
    ? {
        key: "home.sessionCard.elapsedHoursMinutes",
        params: { hours: elapsed.hours, minutes: elapsed.minutes },
      }
    : { key: "home.sessionCard.elapsedMinutes", params: { minutes: elapsed.minutes } };

// 빠른 잔 칩을 2열 행으로 나눈다(홀수면 마지막 행은 1개).
export const chunkPairs = <T,>(items: readonly T[]): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
};
