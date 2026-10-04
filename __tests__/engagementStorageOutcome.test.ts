import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDrinkLog, addDrinkLogsWithTimestamps, deleteDrinkLog } from "../utils/trackerStorage";
import { addSessionRecord } from "../utils/engagement/sessionHistory";

it("reports failure when a drink cannot be persisted", async () => {
  // Given failed storage writes.
  const write = jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("storage unavailable"));
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  // When a drink is added.
  const saved = await addDrinkLog({ name: "Local only", emoji: "🍺", volume: 100, abv: 5 });
  // Then callers can avoid reporting a false success.
  expect(saved).toBe(false);
  write.mockRestore();
  consoleError.mockRestore();
});

it("reports failure when deletion cannot be persisted", async () => {
  // Given failed storage writes.
  const write = jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("storage unavailable"));
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  // When deletion is requested.
  const deleted = await deleteDrinkLog("unknown");
  // Then callers can avoid reporting a false success.
  expect(deleted).toBe(false);
  write.mockRestore();
  consoleError.mockRestore();
});

it("keeps session writes idempotent after a partial save and retry", async () => {
  const entry = { id: "session-drink-1", name: "Test", emoji: "🍺", volume: 100, abv: 5, timestamp: 1 };
  const record = { id: "record-1", startedAt: 1, endedAt: 2, drinks: [], peakBac: 0, totalStandardDrinks: 0, totalCalories: 0, soberAt: null };
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  const stored = new Map<string, string>();
  const read = jest.spyOn(AsyncStorage, "getItem").mockImplementation(async (key) => stored.get(key) ?? null);
  let failHistory = true;
  const write = jest.spyOn(AsyncStorage, "setItem").mockImplementation(async (key, value) => {
    if (key === "@session_history" && failHistory) {
      failHistory = false;
      throw new Error("history unavailable");
    }
    stored.set(key, value);
  });
  const firstLogs = await addDrinkLogsWithTimestamps([entry]);
  const firstHistory = await addSessionRecord(record);
  const secondLogs = await addDrinkLogsWithTimestamps([entry]);
  const secondHistory = await addSessionRecord(record);
  const logs = stored.get("@drink_logs");
  const history = stored.get("@session_history");
  expect({ firstLogs, firstHistory, secondLogs, secondHistory }).toEqual({ firstLogs: true, firstHistory: false, secondLogs: true, secondHistory: true });
  expect(JSON.parse(logs ?? "[]")).toHaveLength(1);
  expect(JSON.parse(history ?? "[]")).toHaveLength(1);
  read.mockRestore();
  write.mockRestore();
  consoleError.mockRestore();
});
