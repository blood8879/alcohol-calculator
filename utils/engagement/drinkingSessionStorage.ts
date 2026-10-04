import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DrinkingSession, SessionGender } from "./drinkingSession";
import { isValidBodyWeight } from "../bodyWeight";

const SESSION_KEY = "@active_drinking_session";
const PROFILE_KEY = "@session_profile";

export type SessionProfile = {
  readonly weightKg: number;
  readonly gender: SessionGender;
};

export const getActiveSession = async (): Promise<DrinkingSession | null> => {
  try {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    return data ? (JSON.parse(data) as DrinkingSession) : null;
  } catch (error) {
    console.error("Error getting drinking session:", error);
    return null;
  }
};

export const setActiveSession = async (
  session: DrinkingSession
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error("Error saving drinking session:", error);
    return false;
  }
};

export const clearActiveSession = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing drinking session:", error);
    return false;
  }
};

// 16회차: 예전 버전이 저장한 오타 체중(예: 7070kg)을 다음 세션에 자동 입력하지 않는다.
// 체중이 유효 범위 밖이면 성별만 살리고(null 체중) — 화면은 체중 칸을 비워 둔다.
export type StoredSessionProfile = {
  readonly weightKg: number | null;
  readonly gender: SessionGender;
};

export const sanitizeSessionProfile = (raw: unknown): StoredSessionProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const { weightKg, gender } = raw as { weightKg?: unknown; gender?: unknown };
  const safeGender: SessionGender = gender === "female" ? "female" : "male";
  const safeWeight =
    typeof weightKg === "number" && isValidBodyWeight(weightKg) ? weightKg : null;
  return { weightKg: safeWeight, gender: safeGender };
};

export const getSessionProfile = async (): Promise<StoredSessionProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? sanitizeSessionProfile(JSON.parse(data)) : null;
  } catch (error) {
    console.error("Error getting session profile:", error);
    return null;
  }
};

export const setSessionProfile = async (
  profile: SessionProfile
): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving session profile:", error);
  }
};
