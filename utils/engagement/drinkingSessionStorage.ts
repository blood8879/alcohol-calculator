import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DrinkingSession, SessionGender } from "./drinkingSession";

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
): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error saving drinking session:", error);
  }
};

export const clearActiveSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Error clearing drinking session:", error);
  }
};

export const getSessionProfile = async (): Promise<SessionProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? (JSON.parse(data) as SessionProfile) : null;
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
