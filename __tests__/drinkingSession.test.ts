import {
  DrinkingSession,
  alcoholGrams,
  bacLevelOf,
  estimateSession,
} from "../utils/engagement/drinkingSession";

const session = (
  drinks: DrinkingSession["drinks"],
  weightKg = 70,
  gender: DrinkingSession["gender"] = "male"
): DrinkingSession => ({
  startedAt: new Date(2026, 6, 1, 20, 0).getTime(),
  weightKg,
  gender,
  drinks,
});

const drink = (volume: number, abv: number, timestamp: number) => ({
  id: `d-${timestamp}`,
  nameKey: "presets.drinks.soju",
  emoji: "🍶",
  volume,
  abv,
  timestamp,
});

describe("drinking session estimates", () => {
  it("computes ethanol grams from volume and abv", () => {
    // 360ml 소주(16.5%) ≈ 46.9g
    expect(alcoholGrams(360, 16.5)).toBeCloseTo(46.87, 1);
  });

  it("maps bac to risk levels", () => {
    expect(bacLevelOf(0.01)).toBe("safe");
    expect(bacLevelOf(0.03)).toBe("caution");
    expect(bacLevelOf(0.06)).toBe("danger");
    expect(bacLevelOf(0.1)).toBe("high");
  });

  it("returns a zero estimate with no drinks", () => {
    const result = estimateSession(session([]), new Date(2026, 6, 1, 21, 0));
    expect(result.bac).toBe(0);
    expect(result.level).toBe("safe");
    expect(result.soberAt).toBeNull();
  });

  it("estimates bac right after drinking and decays over time", () => {
    const at = new Date(2026, 6, 1, 20, 0).getTime();
    const s = session([drink(360, 16.5, at)]);

    const immediate = estimateSession(s, new Date(at));
    // 46.9g / (70kg * 1000 * 0.68) * 100 ≈ 0.0985%
    expect(immediate.bac).toBeCloseTo(0.0985, 3);
    expect(immediate.level).toBe("high");

    const twoHoursLater = estimateSession(s, new Date(at + 2 * 3_600_000));
    expect(twoHoursLater.bac).toBeCloseTo(0.0685, 3);
    expect(twoHoursLater.bac).toBeLessThan(immediate.bac);
  });

  it("never returns negative bac after full elimination", () => {
    const at = new Date(2026, 6, 1, 20, 0).getTime();
    const s = session([drink(50, 16.5, at)]);
    const result = estimateSession(s, new Date(at + 24 * 3_600_000));
    expect(result.bac).toBe(0);
    expect(result.hoursToSober).toBe(0);
    expect(result.soberAt).toBeNull();
  });

  it("counts standard drinks from total alcohol", () => {
    const at = new Date(2026, 6, 1, 20, 0).getTime();
    const s = session([drink(360, 16.5, at)]);
    // 46.9g / 14g ≈ 3.3 표준잔
    expect(estimateSession(s, new Date(at)).standardDrinks).toBeCloseTo(3.3, 1);
  });

  it("uses a lower distribution ratio for female", () => {
    const at = new Date(2026, 6, 1, 20, 0).getTime();
    const male = estimateSession(session([drink(360, 16.5, at)], 70, "male"), new Date(at));
    const female = estimateSession(session([drink(360, 16.5, at)], 70, "female"), new Date(at));
    expect(female.bac).toBeGreaterThan(male.bac);
  });
});
