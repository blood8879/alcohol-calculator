import type { BacLevel } from "../../utils/engagement/drinkingSession";
import { BAC_SCALE_MAX, BAC_SCALE_TICKS, LEVEL_STYLES } from "../session/sessionUi";

// 회복 화면 BAC 추이 차트용 순수 헬퍼. BAC 수식은 건드리지 않고 축·간격·기준선만 계산한다.

export type BacAxisScale = {
  readonly maxValue: number;
  readonly noOfSections: number;
  readonly stepValue: number;
  // 아래→위 순서(gifted-charts yAxisLabelTexts 규칙), 소수 2자리.
  readonly labels: readonly string[];
};

// 0.02 단위 눈금을 기본으로, 구간이 너무 많아지면 더 큰 단위로 바꾼다.
const BAC_AXIS_STEPS = [0.02, 0.04, 0.05, 0.1, 0.2, 0.5] as const;
const MAX_AXIS_SECTIONS = 6;

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

export const formatBacAxisLabel = (value: number): string => value.toFixed(2);

// 최고 BAC → 고정 y축. 최소 0~0.12%(세션 스케일과 동일)로 두어 소량 음주에서도 기준선 위치가 안정적이다.
export const computeBacAxisScale = (peakBac: number): BacAxisScale => {
  const peak = Number.isFinite(peakBac) && peakBac > 0 ? peakBac : 0;
  const target = Math.max(BAC_SCALE_MAX, peak);

  let stepValue: number = BAC_AXIS_STEPS[BAC_AXIS_STEPS.length - 1];
  let noOfSections = Math.max(1, Math.ceil(round4(target / stepValue)));
  for (const step of BAC_AXIS_STEPS) {
    const sections = Math.ceil(round4(target / step));
    if (sections <= MAX_AXIS_SECTIONS) {
      stepValue = step;
      noOfSections = sections;
      break;
    }
  }

  const maxValue = round4(stepValue * noOfSections);
  const labels = Array.from({ length: noOfSections + 1 }, (_, index) =>
    formatBacAxisLabel(round4(stepValue * index))
  );
  return { maxValue, noOfSections, stepValue, labels };
};

export type ChartLayoutOptions = {
  readonly yAxisLabelWidth?: number;
  readonly initialSpacing?: number;
  readonly endSpacing?: number;
  // 축선·반올림 여유(px)
  readonly safetyMargin?: number;
  // x축 라벨 하나가 차지해야 하는 최소 간격(px)
  readonly minLabelGap?: number;
};

export type ChartLayout = {
  readonly width: number; // LineChart `width`(y축 라벨 폭 제외)
  readonly spacing: number;
  readonly initialSpacing: number;
  readonly endSpacing: number;
  readonly yAxisLabelWidth: number;
  // x축 라벨을 몇 시간마다 표시할지(1·2·3·4·6·12…)
  readonly labelEvery: number;
};

const LABEL_STEPS = [1, 2, 3, 4, 6, 12, 24] as const;

// 카드 내부 폭 + 점 개수 → 모든 점(0..n시간)이 가로 스크롤 없이 들어가는 width/spacing.
export const computeChartLayout = (
  innerWidth: number,
  pointCount: number,
  {
    yAxisLabelWidth = 44,
    initialSpacing = 8,
    endSpacing = 12,
    safetyMargin = 4,
    minLabelGap = 22,
  }: ChartLayoutOptions = {}
): ChartLayout => {
  const safeInner = Number.isFinite(innerWidth) && innerWidth > 0 ? innerWidth : 0;
  const width = Math.max(0, Math.floor(safeInner - yAxisLabelWidth - safetyMargin));
  const gaps = Math.max(1, Math.floor(pointCount) - 1);
  const spacing = Math.max(0, (width - initialSpacing - endSpacing) / gaps);

  let labelEvery: number = LABEL_STEPS[LABEL_STEPS.length - 1];
  for (const step of LABEL_STEPS) {
    if (spacing * step >= minLabelGap) {
      labelEvery = step;
      break;
    }
  }

  return { width, spacing, initialSpacing, endSpacing, yAxisLabelWidth, labelEvery };
};

export type BacReferenceLine = {
  readonly position: number; // %
  readonly level: BacLevel; // 이 경계부터 시작되는 레벨
  readonly color: string;
  readonly label: string; // "0.05"
};

const LEVELS_ABOVE_TICK: readonly BacLevel[] = ["caution", "danger", "high"];

// 세션 레벨 경계(0.02/0.05/0.08) 기준선. 색은 세션 화면과 같은 레벨 색을 쓴다.
export const BAC_REFERENCE_LINES: readonly BacReferenceLine[] = BAC_SCALE_TICKS.map(
  (position, index) => {
    const level = LEVELS_ABOVE_TICK[index];
    return {
      position,
      level,
      color: LEVEL_STYLES[level].barHex,
      label: formatBacAxisLabel(position),
    };
  }
);
