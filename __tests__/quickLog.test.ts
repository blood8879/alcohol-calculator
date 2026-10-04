import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  buildQuickLogItems,
  computeDaySummary,
  nextQuickLogSnapshot,
  selectFrequentDrinks,
} from "../utils/engagement/quickLog";
import { drinkPresets } from "../data/drinkPresets";
import {
  addDrinkLog,
  addDrinkLogReturningLog,
  deleteDrinkLog,
  getDrinkLogs,
  restoreDrinkLog,
} from "../utils/trackerStorage";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;
const log = (name: string, volume: number, abv: number, timestamp: number, extra = {}) => ({
  name, emoji: "🍺", volume, abv, timestamp, ...extra,
});
const names: Record<string, string> = {
  "presets.drinks.soju": "소주",
  "presets.drinks.beer": "맥주",
  "presets.drinks.redWine": "레드와인",
};
const resolveName = (key: string) => names[key] ?? key;

describe("selectFrequentDrinks", () => {
  it("groups by name+volume+abv and sorts by count then recency", () => {
    // Given beer twice, soju once (most recent), and highball once (older).
    const logs = [
      log("Beer", 500, 5, NOW - 3 * DAY),
      log("Beer", 500, 5, NOW - 2 * DAY),
      log("Highball", 350, 8, NOW - 5 * DAY),
      log("Soju", 360, 16.5, NOW - 1 * DAY),
    ];
    // When selected.
    const result = selectFrequentDrinks(logs, NOW);
    // Then frequency wins, ties go to the latest.
    expect(result.map((item) => item.name)).toEqual(["Beer", "Soju", "Highball"]);
  });

  it("treats a different volume as a distinct drink and ignores logs outside 14 days", () => {
    const logs = [
      log("Beer", 500, 5, NOW - DAY),
      log("Beer", 330, 5, NOW - DAY),
      log("Wine", 150, 13.5, NOW - 15 * DAY),
    ];
    const result = selectFrequentDrinks(logs, NOW);
    expect(result).toHaveLength(2);
    expect(result.map((item) => item.volume).sort()).toEqual([330, 500]);
  });

  it("caps the result and carries the latest preset id and price", () => {
    const logs = [
      log("A", 1, 1, NOW - 4 * DAY),
      log("B", 1, 1, NOW - 3 * DAY),
      log("C", 1, 1, NOW - 2 * DAY, { presetId: "old", price: 1000 }),
      log("C", 1, 1, NOW - DAY, { presetId: "c", price: 2000 }),
      log("D", 1, 1, NOW - DAY),
      log("E", 1, 1, NOW - DAY),
    ];
    const result = selectFrequentDrinks(logs, NOW);
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ name: "C", presetId: "c", price: 2000, source: "recent" });
  });
});

describe("buildQuickLogItems", () => {
  it("falls back to soju, beer, wine presets when there is no history", () => {
    const result = buildQuickLogItems([], drinkPresets, resolveName, NOW);
    expect(result.map((item) => item.presetId)).toEqual(["soju", "beer", "red-wine"]);
    expect(result.every((item) => item.source === "preset")).toBe(true);
  });

  it("fills remaining slots without duplicating a recent drink", () => {
    const logs = [log("소주", 360, 16.5, NOW - DAY, { presetId: "soju" })];
    const result = buildQuickLogItems(logs, drinkPresets, resolveName, NOW);
    expect(result.map((item) => item.name)).toEqual(["소주", "맥주", "레드와인"]);
    expect(result[0].source).toBe("recent");
  });

  it("does not add presets when history already fills four slots", () => {
    const logs = ["A", "B", "C", "D"].map((name) => log(name, 100, 5, NOW - DAY));
    const result = buildQuickLogItems(logs, drinkPresets, resolveName, NOW);
    expect(result).toHaveLength(4);
    expect(result.some((item) => item.source === "preset")).toBe(false);
  });
});

describe("computeDaySummary", () => {
  it("returns drinks, integer kcal and standard drinks at 14g", () => {
    // 500ml 5% → 19.725g, 360ml 16.5% → 46.87g; total 66.6g → 4.8 standard drinks.
    const summary = computeDaySummary([
      { ...log("Beer", 500, 5, NOW), calories: 140 },
      { ...log("Soju", 360, 16.5, NOW), calories: 332.6 },
    ]);
    expect(summary).toEqual({
      drinks: 2,
      calories: 473,
      pureAlcoholGrams: 66.6,
      standardDrinks: 4.8,
    });
  });

  it("is all zeros for an empty day", () => {
    expect(computeDaySummary([])).toEqual({
      drinks: 0, calories: 0, pureAlcoholGrams: 0, standardDrinks: 0,
    });
  });
});

describe("addDrinkLogReturningLog", () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem("@drink_logs");
  });

  it("returns the stored log so a quick log can be undone", async () => {
    const saved = await addDrinkLogReturningLog({ name: "Beer", emoji: "🍺", volume: 500, abv: 5 });
    expect(saved).not.toBeNull();
    expect(saved?.calories).toBe(140);
    const all = await getDrinkLogs(new Date(0), new Date(Date.now() + DAY));
    expect(all.map((entry) => entry.id)).toEqual([saved?.id]);

    await deleteDrinkLog(saved?.id ?? "");
    expect(await getDrinkLogs(new Date(0), new Date(Date.now() + DAY))).toEqual([]);
  });

  it("keeps the boolean contract of addDrinkLog", async () => {
    await expect(addDrinkLog({ name: "Soju", emoji: "🍶", volume: 360, abv: 16.5 })).resolves.toBe(true);
  });

  it("returns null when storage fails", async () => {
    const write = jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("unavailable"));
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(addDrinkLogReturningLog({ name: "X", emoji: "🍺", volume: 1, abv: 1 })).resolves.toBeNull();
    // setItem은 __mocks__의 jest.fn이라 mockRestore()하면 구현이 사라진다 — once 값만 소비되게 둔다.
    expect(write).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("restoreDrinkLog", () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem("@drink_logs");
  });

  it("restores a deleted log with the same id, timestamp, price and presetId", async () => {
    // Given a stored log that the user deletes from the tracker
    const saved = await addDrinkLogReturningLog({
      name: "Soju", emoji: "🍶", volume: 360, abv: 16.5, presetId: "soju", price: 5000,
    });
    expect(saved).not.toBeNull();
    const original = { ...saved!, timestamp: NOW - DAY };
    await AsyncStorage.setItem("@drink_logs", JSON.stringify([original]));
    await deleteDrinkLog(original.id);

    // When undo restores it
    await expect(restoreDrinkLog(original)).resolves.toBe(true);

    // Then the exact record is back
    expect(await getDrinkLogs(new Date(0), new Date(NOW + DAY))).toEqual([original]);
  });

  it("does not duplicate a log that is already present", async () => {
    const saved = await addDrinkLogReturningLog({ name: "Beer", emoji: "🍺", volume: 500, abv: 5 });
    await expect(restoreDrinkLog(saved!)).resolves.toBe(true);
    const all = await getDrinkLogs(new Date(0), new Date(Date.now() + DAY));
    expect(all).toHaveLength(1);
  });

  it("returns false when storage fails", async () => {
    const write = jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("unavailable"));
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      restoreDrinkLog({ id: "x", name: "X", emoji: "🍺", volume: 1, abv: 1, calories: 0, timestamp: NOW })
    ).resolves.toBe(false);
    // setItem은 __mocks__의 jest.fn이라 mockRestore()하면 구현이 사라진다 — once 값만 소비되게 둔다.
    expect(write).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("nextQuickLogSnapshot (chip order stays put under the finger)", () => {
  const order = (items: readonly { name: string }[]) => items.map((item) => item.name);

  it("keeps the focus-time order after a quick log changes the frequency ranking", () => {
    // Given chips snapshotted on focus: soju (2x) first, beer (1x) second.
    const focusLogs = [
      log("소주", 360, 16.5, NOW - 2 * DAY),
      log("소주", 360, 16.5, NOW - 1 * DAY),
      log("맥주", 500, 5, NOW - 3 * DAY),
    ];
    const onFocus = nextQuickLogSnapshot(
      [],
      buildQuickLogItems(focusLogs, drinkPresets, resolveName, NOW),
      "focus"
    );
    expect(order(onFocus)).toEqual(["소주", "맥주", "레드와인"]);

    // When beer is quick-logged twice and the data refreshes, the ranking would flip.
    const afterLogs = [
      ...focusLogs,
      log("맥주", 500, 5, NOW - 1000),
      log("맥주", 500, 5, NOW - 500),
    ];
    const fresh = buildQuickLogItems(afterLogs, drinkPresets, resolveName, NOW);
    expect(order(fresh)).toEqual(["맥주", "소주", "레드와인"]);
    const afterQuickLog = nextQuickLogSnapshot(onFocus, fresh, "data_change");

    // Then the same slot still logs the same drink.
    expect(order(afterQuickLog)).toEqual(["소주", "맥주", "레드와인"]);
    expect(afterQuickLog).toBe(onFocus);
  });

  it("re-ranks on the next focus (or date change)", () => {
    const current = buildQuickLogItems(
      [log("소주", 360, 16.5, NOW - DAY)],
      drinkPresets,
      resolveName,
      NOW
    );
    const fresh = buildQuickLogItems(
      [log("맥주", 500, 5, NOW - 2), log("맥주", 500, 5, NOW - 1), log("소주", 360, 16.5, NOW - DAY)],
      drinkPresets,
      resolveName,
      NOW
    );
    expect(order(nextQuickLogSnapshot(current, fresh, "focus"))).toEqual(["맥주", "소주", "레드와인"]);
  });

  it("fills an empty snapshot even on a data change", () => {
    const fresh = buildQuickLogItems([], drinkPresets, resolveName, NOW);
    expect(nextQuickLogSnapshot([], fresh, "data_change")).toBe(fresh);
  });
});
