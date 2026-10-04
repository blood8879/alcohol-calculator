// 막대 차트 y축을 정수 눈금으로만 그리기 위한 스케일 계산.
// 잔 수에 `0.5, 1.5` 같은 소수 눈금이 나오지 않도록 step을 1·2·2.5·5×10^k 중 정수로 고른다.

export type IntegerAxisScale = {
  readonly maxValue: number;
  readonly noOfSections: number;
  readonly stepValue: number;
};

type IntegerAxisOptions = {
  // 최댓값 위 여유 비율(기본 20%)
  readonly headroom?: number;
  // 축 최댓값 하한(데이터가 0~1뿐이어도 눈금이 찌그러지지 않게)
  readonly minMax?: number;
  // 허용하는 최대 구간 수
  readonly maxSections?: number;
};

const niceIntegerSteps = function* (): Generator<number> {
  for (let magnitude = 1; ; magnitude *= 10) {
    yield magnitude;
    yield 2 * magnitude;
    // 2.5 × 1은 정수가 아니므로 10 이상에서만 사용한다.
    if (magnitude >= 10) yield 2.5 * magnitude;
    yield 5 * magnitude;
  }
};

export const computeIntegerAxisScale = (
  values: readonly number[],
  { headroom = 0.2, minMax = 4, maxSections = 5 }: IntegerAxisOptions = {}
): IntegerAxisScale => {
  const finite = values.filter((value) => Number.isFinite(value) && value > 0);
  const peak = finite.length > 0 ? Math.max(...finite) : 0;
  const target = Math.max(Math.ceil(peak * (1 + headroom)), Math.ceil(minMax), 1);

  for (const step of niceIntegerSteps()) {
    const sections = Math.ceil(target / step);
    if (sections <= maxSections) {
      return { maxValue: step * sections, noOfSections: sections, stepValue: step };
    }
  }
  // 제너레이터는 무한하므로 도달하지 않는다.
  return { maxValue: target, noOfSections: 1, stepValue: target };
};

export const formatIntegerAxisLabel = (label: string): string => {
  const numeric = Number(label);
  return Number.isFinite(numeric) ? String(Math.round(numeric)) : label;
};
