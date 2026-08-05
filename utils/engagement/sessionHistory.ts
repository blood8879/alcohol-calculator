import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "../idGenerator";
import {
  DrinkingSession,
  alcoholGrams,
  estimateSession,
  peakBacOf,
} from "./drinkingSession";

const HISTORY_KEY = "@session_history";
const MAX_RECORDS = 100;
const STANDARD_DRINK_GRAMS = 14;

// 저장된 세션의 잔 하나 (표시용으로 표준잔까지 확정해 둔다).
export type SessionRecordDrink = {
  readonly nameKey: string;
  readonly emoji: string;
  readonly timestamp: number;
  readonly standardDrinks: number;
};

export type SessionRecord = {
  readonly id: string;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly drinks: readonly SessionRecordDrink[];
  readonly peakBac: number;
  readonly totalStandardDrinks: number;
  readonly totalCalories: number;
  readonly soberAt: number | null;
};

// 종료 시점의 세션에서 저장용 레코드를 만든다 (순수 함수).
export const buildSessionRecord = (
  session: DrinkingSession,
  endedAt: number = Date.now()
): SessionRecord => {
  const estimate = estimateSession(session, new Date(endedAt));
  const drinks: SessionRecordDrink[] = session.drinks.map((d) => ({
    nameKey: d.nameKey,
    emoji: d.emoji,
    timestamp: d.timestamp,
    standardDrinks:
      Math.round((alcoholGrams(d.volume, d.abv) / STANDARD_DRINK_GRAMS) * 10) /
      10,
  }));
  return {
    id: generateId(),
    startedAt: session.startedAt,
    endedAt,
    drinks,
    peakBac: peakBacOf(session),
    totalStandardDrinks: estimate.standardDrinks,
    totalCalories: estimate.totalCalories,
    soberAt: estimate.soberAt,
  };
};

// 최신순 정렬 + 100건 캡 (순수 함수).
export const normalizeHistory = (
  records: readonly SessionRecord[]
): SessionRecord[] =>
  [...records].sort((a, b) => b.endedAt - a.endedAt).slice(0, MAX_RECORDS);

// --- AsyncStorage CRUD ---

export const getSessionHistory = async (): Promise<SessionRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? (JSON.parse(data) as SessionRecord[]) : [];
  } catch (error) {
    console.error("Error getting session history:", error);
    return [];
  }
};

export const addSessionRecord = async (
  record: SessionRecord
): Promise<SessionRecord[]> => {
  const history = normalizeHistory([record, ...(await getSessionHistory())]);
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving session record:", error);
  }
  return history;
};

export const deleteSessionRecord = async (
  id: string
): Promise<SessionRecord[]> => {
  const history = (await getSessionHistory()).filter((r) => r.id !== id);
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error deleting session record:", error);
  }
  return history;
};
