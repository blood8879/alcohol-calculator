import {
  BAC_SCALE_MAX,
  BAC_SCALE_TICKS,
  BAC_SCALE_ZONES,
  LEVEL_STYLES,
  bacScaleZoneOf,
  bacToScalePosition,
  chunkPairs,
  elapsedLabelOf,
  tickToScalePosition,
} from "../components/session/sessionUi";
import { bacLevelOf } from "../utils/engagement/drinkingSession";

describe("BAC scale helpers", () => {
  it("uses the 0–0.12% range with the fixed level thresholds", () => {
    expect(BAC_SCALE_MAX).toBe(0.12);
    expect([...BAC_SCALE_TICKS]).toEqual([0.02, 0.05, 0.08]);
  });

  it("ticks match bacLevelOf boundaries", () => {
    const [caution, danger, high] = BAC_SCALE_TICKS;
    expect(bacLevelOf(caution - 0.0001)).toBe("safe");
    expect(bacLevelOf(caution)).toBe("caution");
    expect(bacLevelOf(danger - 0.0001)).toBe("caution");
    expect(bacLevelOf(danger)).toBe("danger");
    expect(bacLevelOf(high - 0.0001)).toBe("danger");
    expect(bacLevelOf(high)).toBe("high");
  });

  it("builds four contiguous zones covering the whole scale", () => {
    expect(BAC_SCALE_ZONES.map((z) => z.level)).toEqual([
      "safe",
      "caution",
      "danger",
      "high",
    ]);
    expect(BAC_SCALE_ZONES[0].from).toBe(0);
    expect(BAC_SCALE_ZONES[3].to).toBe(BAC_SCALE_MAX);
    for (let i = 1; i < BAC_SCALE_ZONES.length; i++) {
      expect(BAC_SCALE_ZONES[i].from).toBe(BAC_SCALE_ZONES[i - 1].to);
    }
    const total = BAC_SCALE_ZONES.reduce((sum, z) => sum + z.fraction, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(BAC_SCALE_ZONES[0].fraction).toBeCloseTo(1 / 6, 10);
    expect(BAC_SCALE_ZONES[1].fraction).toBeCloseTo(0.25, 10);
    expect(BAC_SCALE_ZONES[2].fraction).toBeCloseTo(0.25, 10);
    expect(BAC_SCALE_ZONES[3].fraction).toBeCloseTo(1 / 3, 10);
  });

  it("maps BAC to a clamped pointer position", () => {
    expect(bacToScalePosition(0)).toBe(0);
    expect(bacToScalePosition(-0.01)).toBe(0);
    expect(bacToScalePosition(Number.NaN)).toBe(0);
    expect(bacToScalePosition(0.06)).toBeCloseTo(0.5, 10);
    expect(bacToScalePosition(0.12)).toBe(1);
    expect(bacToScalePosition(0.3)).toBe(1);
    expect(bacToScalePosition(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("places ticks at the zone boundaries", () => {
    const positions = BAC_SCALE_TICKS.map(tickToScalePosition);
    expect(positions[0]).toBeCloseTo(1 / 6, 10);
    expect(positions[1]).toBeCloseTo(5 / 12, 10);
    expect(positions[2]).toBeCloseTo(2 / 3, 10);
  });

  it("pointer position lies inside the zone of the current level", () => {
    for (const bac of [0, 0.01, 0.02, 0.044, 0.05, 0.079, 0.08, 0.11]) {
      const level = bacScaleZoneOf(bac);
      expect(level).toBe(bacLevelOf(bac));
      const zone = BAC_SCALE_ZONES.find((z) => z.level === level)!;
      const pos = bacToScalePosition(bac);
      expect(pos).toBeGreaterThanOrEqual(zone.from / BAC_SCALE_MAX - 1e-9);
      expect(pos).toBeLessThanOrEqual(zone.to / BAC_SCALE_MAX + 1e-9);
    }
  });

  it("treats non-finite BAC as the safe zone", () => {
    expect(bacScaleZoneOf(Number.NaN)).toBe("safe");
  });

  it("keeps the fixed level label keys", () => {
    expect(LEVEL_STYLES.safe.labelKey).toBe("session.levelSafe");
    expect(LEVEL_STYLES.caution.labelKey).toBe("session.levelCaution");
    expect(LEVEL_STYLES.danger.labelKey).toBe("session.levelDanger");
    expect(LEVEL_STYLES.high.labelKey).toBe("session.levelHigh");
  });
});

describe("elapsedLabelOf", () => {
  it("uses minutes-only key under one hour", () => {
    expect(elapsedLabelOf({ hours: 0, minutes: 7 })).toEqual({
      key: "home.sessionCard.elapsedMinutes",
      params: { minutes: 7 },
    });
  });

  it("uses hours+minutes key from one hour", () => {
    expect(elapsedLabelOf({ hours: 1, minutes: 12 })).toEqual({
      key: "home.sessionCard.elapsedHoursMinutes",
      params: { hours: 1, minutes: 12 },
    });
  });
});

describe("chunkPairs", () => {
  it("splits items into rows of two", () => {
    expect(chunkPairs([1, 2, 3, 4, 5])).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkPairs([1, 2])).toEqual([[1, 2]]);
    expect(chunkPairs([])).toEqual([]);
  });
});
