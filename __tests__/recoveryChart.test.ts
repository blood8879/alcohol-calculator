import {
  BAC_REFERENCE_LINES,
  computeBacAxisScale,
  computeChartLayout,
  formatBacAxisLabel,
} from "../components/recovery/recoveryChart";
import { BAC_SCALE_TICKS, LEVEL_STYLES } from "../components/session/sessionUi";
import { bacLevelOf } from "../utils/engagement/drinkingSession";
import ko from "../locales/ko.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import ja from "../locales/ja.json";
import zh from "../locales/zh.json";

describe("computeBacAxisScale", () => {
  it("keeps a stable 0–0.12% axis with 0.02 steps for small peaks", () => {
    for (const peak of [0, 0.01, 0.0441, 0.0882, 0.12]) {
      const scale = computeBacAxisScale(peak);
      expect(scale.maxValue).toBeCloseTo(0.12, 10);
      expect(scale.stepValue).toBe(0.02);
      expect(scale.noOfSections).toBe(6);
      expect(scale.labels).toEqual(["0.00", "0.02", "0.04", "0.06", "0.08", "0.10", "0.12"]);
    }
  });

  it("grows to cover larger peaks with at most 6 sections", () => {
    const scale = computeBacAxisScale(0.1764);
    expect(scale.maxValue).toBeGreaterThanOrEqual(0.1764);
    expect(scale.noOfSections).toBeLessThanOrEqual(6);
    expect(scale.labels).toHaveLength(scale.noOfSections + 1);
    expect(scale.labels[scale.labels.length - 1]).toBe(formatBacAxisLabel(scale.maxValue));

    const huge = computeBacAxisScale(0.9);
    expect(huge.maxValue).toBeGreaterThanOrEqual(0.9);
    expect(huge.noOfSections).toBeLessThanOrEqual(6);
  });

  it("treats NaN/negative as zero", () => {
    expect(computeBacAxisScale(Number.NaN).maxValue).toBeCloseTo(0.12, 10);
    expect(computeBacAxisScale(-1).maxValue).toBeCloseTo(0.12, 10);
  });

  it("formats labels with 2 decimals", () => {
    expect(formatBacAxisLabel(0.08)).toBe("0.08");
    expect(formatBacAxisLabel(0.1)).toBe("0.10");
  });
});

describe("computeChartLayout", () => {
  it("fits every point inside the measured width (no horizontal overflow)", () => {
    for (const inner of [240, 300, 343, 400]) {
      for (const points of [2, 4, 7, 13, 30]) {
        const layout = computeChartLayout(inner, points);
        const used =
          layout.initialSpacing + layout.spacing * (points - 1) + layout.endSpacing;
        expect(used).toBeLessThanOrEqual(layout.width + 1e-9);
        expect(layout.width + layout.yAxisLabelWidth).toBeLessThanOrEqual(inner);
        expect(layout.yAxisLabelWidth).toBeGreaterThanOrEqual(44);
      }
    }
  });

  it("thins x labels so they keep a minimum gap", () => {
    const sparse = computeChartLayout(343, 7);
    expect(sparse.labelEvery).toBe(1);
    const dense = computeChartLayout(300, 30);
    expect(dense.spacing * dense.labelEvery).toBeGreaterThanOrEqual(22);
    expect(dense.labelEvery).toBeGreaterThan(1);
  });

  it("handles unmeasured width and single point safely", () => {
    const layout = computeChartLayout(0, 1);
    expect(layout.width).toBe(0);
    expect(layout.spacing).toBe(0);
  });
});

describe("BAC_REFERENCE_LINES", () => {
  it("sit on the session level thresholds with the session level colors", () => {
    expect(BAC_REFERENCE_LINES.map((line) => line.position)).toEqual([...BAC_SCALE_TICKS]);
    for (const line of BAC_REFERENCE_LINES) {
      expect(bacLevelOf(line.position)).toBe(line.level);
      expect(line.color).toBe(LEVEL_STYLES[line.level].barHex);
    }
    expect(BAC_REFERENCE_LINES.map((line) => line.label)).toEqual(["0.02", "0.05", "0.08"]);
  });
});

describe("peak BAC hero level mapping", () => {
  it("uses the session level for the design sample peak 0.0882%", () => {
    expect(bacLevelOf(0.0882)).toBe("high");
    expect(LEVEL_STYLES[bacLevelOf(0.0882)].text).toBe("text-red-400");
    expect(bacLevelOf(0.0441)).toBe("caution");
  });
});

describe("recovery locale keys", () => {
  it("exist in all five locales", () => {
    for (const locale of [ko, en, es, ja, zh]) {
      const recovery = (locale as { recovery: Record<string, string> }).recovery;
      expect(recovery.peakBacEstimated).toBeTruthy();
      expect(recovery.chartXAxis).toBeTruthy();
      expect(recovery.chartA11y).toContain("{{peak}}");
      expect(recovery.chartA11y).toContain("{{hours}}");
    }
    expect((ko as { recovery: Record<string, string> }).recovery.peakBacEstimated).toBe(
      "예상 최고 혈중알코올농도 (추정)"
    );
  });
});
