import AsyncStorage from '@react-native-async-storage/async-storage';

const CHALLENGE_KEY = '@sobriety_challenge';

export type SobrietyChallenge = {
  active: boolean;
  startDate: string; // ISO yyyy-mm-dd (local)
  targetDays: number;
};

export type ChallengeProgress = {
  currentStreakDays: number;
  targetDays: number;
  succeeded: boolean;
  failedDate: string | null;
};

// Local-time yyyy-mm-dd formatter (no UTC shift).
export const toLocalDateString = (x: Date): string => {
  const year = x.getFullYear();
  const month = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getChallenge = async (): Promise<SobrietyChallenge | null> => {
  try {
    const data = await AsyncStorage.getItem(CHALLENGE_KEY);
    return data ? (JSON.parse(data) as SobrietyChallenge) : null;
  } catch (error) {
    console.error('Error getting sobriety challenge:', error);
    return null;
  }
};

export const startChallenge = async (
  targetDays: number
): Promise<SobrietyChallenge> => {
  const challenge: SobrietyChallenge = {
    active: true,
    startDate: toLocalDateString(new Date()),
    targetDays,
  };
  try {
    await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
  } catch (error) {
    console.error('Error starting sobriety challenge:', error);
  }
  return challenge;
};

export const stopChallenge = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHALLENGE_KEY);
  } catch (error) {
    console.error('Error stopping sobriety challenge:', error);
  }
};

// Pure function: estimate money saved during a sobriety streak, based on the
// user's average daily drink spend over a baseline window before the challenge.
export const estimateMoneySaved = (
  baselineSpendTotal: number,
  baselineDays: number,
  streakDays: number
): number => {
  if (baselineSpendTotal <= 0 || baselineDays <= 0 || streakDays <= 0) {
    return 0;
  }
  return Math.round((baselineSpendTotal / baselineDays) * streakDays);
};

// Pure function: compute challenge progress without side effects.
export const computeChallengeProgress = (
  challenge: SobrietyChallenge,
  drinkDates: string[],
  today: Date
): ChallengeProgress => {
  const drinkSet = new Set(drinkDates);
  const targetDays = challenge.targetDays;

  // Parse startDate (yyyy-mm-dd) as a local date.
  const [sy, sm, sd] = challenge.startDate.split('-').map((n) => parseInt(n, 10));
  const start = new Date(sy, (sm || 1) - 1, sd || 1);
  start.setHours(0, 0, 0, 0);

  const todayLocal = new Date(today);
  todayLocal.setHours(0, 0, 0, 0);

  // If today is before the start date, no progress yet.
  if (todayLocal.getTime() < start.getTime()) {
    return { currentStreakDays: 0, targetDays, succeeded: false, failedDate: null };
  }

  let currentStreakDays = 0;
  let failedDate: string | null = null;

  const cursor = new Date(start);
  while (cursor.getTime() <= todayLocal.getTime()) {
    const key = toLocalDateString(cursor);
    if (drinkSet.has(key)) {
      failedDate = key;
      break;
    }
    currentStreakDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  const succeeded = failedDate === null && currentStreakDays >= targetDays;

  return { currentStreakDays, targetDays, succeeded, failedDate };
};
