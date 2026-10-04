import { computeIntegerAxisScale, formatIntegerAxisLabel } from "../utils/chartScale";

const isIntegerScale = ({ maxValue, noOfSections, stepValue }: ReturnType<typeof computeIntegerAxisScale>) =>
  Number.isInteger(stepValue) &&
  Number.isInteger(maxValue) &&
  maxValue === stepValue * noOfSections;

describe("computeIntegerAxisScale", () => {
  it("never produces fractional drink ticks for small counts", () => {
    // Given a week with at most 1 drink a day (previously rendered 0.5/1.5 ticks)
    const scale = computeIntegerAxisScale([0, 1, 0, 1, 0, 0, 0]);
    // Then the axis uses 1-drink steps up to the minimum of 4
    expect(scale).toEqual({ maxValue: 4, noOfSections: 4, stepValue: 1 });
  });

  it("keeps integer ticks for every drink peak from 0 to 40", () => {
    for (let peak = 0; peak <= 40; peak += 1) {
      const scale = computeIntegerAxisScale([peak]);
      expect(isIntegerScale(scale)).toBe(true);
      expect(scale.maxValue).toBeGreaterThanOrEqual(peak);
      expect(scale.noOfSections).toBeLessThanOrEqual(5);
    }
  });

  it("includes the fractional daily limit line inside the axis", () => {
    // Given a weekly limit of 10 → daily limit 1.43 and a peak of 3
    const scale = computeIntegerAxisScale([3, 10 / 7]);
    expect(isIntegerScale(scale)).toBe(true);
    expect(scale.maxValue).toBeGreaterThanOrEqual(3);
  });

  it("chooses round steps for calorie-sized values", () => {
    const scale = computeIntegerAxisScale([1000], { minMax: 100 });
    // 1000 * 1.2 = 1200 → step 250 × 5 sections
    expect(scale).toEqual({ maxValue: 1250, noOfSections: 5, stepValue: 250 });
  });

  it("falls back to the minimum when there is no data", () => {
    expect(computeIntegerAxisScale([], { minMax: 100 })).toEqual({
      maxValue: 100,
      noOfSections: 5,
      stepValue: 20,
    });
    expect(computeIntegerAxisScale([Number.NaN, -1])).toEqual({
      maxValue: 4,
      noOfSections: 4,
      stepValue: 1,
    });
  });
});

describe("formatIntegerAxisLabel", () => {
  it("rounds numeric labels and leaves others untouched", () => {
    expect(formatIntegerAxisLabel("2.0")).toBe("2");
    expect(formatIntegerAxisLabel("1250")).toBe("1250");
    expect(formatIntegerAxisLabel("abc")).toBe("abc");
  });
});
