import {
  SessionRecord,
  buildSessionRecord,
  normalizeHistory,
} from "../utils/engagement/sessionHistory";
import { DrinkingSession } from "../utils/engagement/drinkingSession";

const at = (h: number, m = 0) => new Date(2026, 6, 1, h, m).getTime();

const session = (
  drinks: DrinkingSession["drinks"],
  weightKg = 70,
  gender: DrinkingSession["gender"] = "male"
): DrinkingSession => ({
  startedAt: at(20),
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

const record = (id: string, endedAt: number): SessionRecord => ({
  id,
  startedAt: endedAt - 3_600_000,
  endedAt,
  drinks: [],
  peakBac: 0,
  totalStandardDrinks: 0,
  totalCalories: 0,
  soberAt: null,
});

describe("session history records", () => {
  it("builds a record with per-drink standard drinks and peak bac", () => {
    const s = session([drink(360, 16.5, at(20))]);
    const result = buildSessionRecord(s, at(20));

    expect(result.startedAt).toBe(at(20));
    expect(result.endedAt).toBe(at(20));
    // 46.9g / 14g ≈ 3.3 표준잔
    expect(result.drinks[0].standardDrinks).toBeCloseTo(3.3, 1);
    expect(result.totalStandardDrinks).toBeCloseTo(3.3, 1);
    // 46.9g / (70kg * 1000 * 0.68) * 100 ≈ 0.0985%
    expect(result.peakBac).toBeCloseTo(0.0985, 3);
    expect(result.soberAt).not.toBeNull();
    expect(result.soberAt!).toBeGreaterThan(result.endedAt);
    expect(result.id).toBeTruthy();
  });

  it("captures peak bac at the last drink before elimination outpaces intake", () => {
    // 한 시간 간격 두 잔: 두 번째 잔 시점에 누적 알코올이 최대라 그때가 피크.
    const s = session([drink(360, 16.5, at(20)), drink(360, 16.5, at(21))]);
    const single = buildSessionRecord(
      session([drink(360, 16.5, at(20))]),
      at(21)
    );
    const result = buildSessionRecord(s, at(21));
    expect(result.peakBac).toBeGreaterThan(single.peakBac);
  });

  it("reports zero peak bac for an empty session", () => {
    const result = buildSessionRecord(session([]), at(21));
    expect(result.peakBac).toBe(0);
    expect(result.soberAt).toBeNull();
    expect(result.totalStandardDrinks).toBe(0);
  });

  it("sorts history newest first", () => {
    const normalized = normalizeHistory([
      record("a", at(20)),
      record("c", at(22)),
      record("b", at(21)),
    ]);
    expect(normalized.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  it("caps history at 100 records, keeping the newest", () => {
    const records = Array.from({ length: 105 }, (_, i) =>
      record(`r-${i}`, at(0) + i * 60_000)
    );
    const normalized = normalizeHistory(records);
    expect(normalized).toHaveLength(100);
    // 가장 최신(마지막 인덱스)이 맨 앞에 남아야 한다.
    expect(normalized[0].id).toBe("r-104");
    // 가장 오래된 5건은 잘려나간다.
    expect(normalized.find((r) => r.id === "r-0")).toBeUndefined();
  });
});
