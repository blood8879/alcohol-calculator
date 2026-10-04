import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './idGenerator';
import { alcoholCalories } from './alcoholConstants';

const TRACKER_KEY = '@drink_logs';

export interface DrinkLog {
  id: string;
  presetId?: string;
  name: string;
  emoji: string;
  volume: number;
  abv: number;
  calories: number;
  price?: number;
  timestamp: number;
}

export interface DayStats {
  totalDrinks: number;
  totalCalories: number;
  totalVolume: number;
}

// 저장된 로그(새 id 포함)를 돌려준다. 실패 시 null — 되돌리기(undo) 등 id가 필요한 호출부용.
export const addDrinkLogReturningLog = async (
  log: Omit<DrinkLog, 'id' | 'timestamp' | 'calories'>
): Promise<DrinkLog | null> => {
  try {
    const logs = await getAllLogs();
    const calories = alcoholCalories(log.volume, log.abv);
    const newLog: DrinkLog = {
      ...log,
      id: generateId(),
      timestamp: Date.now(),
      calories: Math.round(calories * 10) / 10,
    };
    logs.push(newLog);
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(logs));
    return newLog;
  } catch (error) {
    console.error('Error adding drink log:', error);
    return null;
  }
};

export const addDrinkLog = async (
  log: Omit<DrinkLog, 'id' | 'timestamp' | 'calories'>
): Promise<boolean> => (await addDrinkLogReturningLog(log)) !== null;

// 세션 종료 시 잔별 실제 시각을 유지한 채 일괄 기록한다.
export const addDrinkLogsWithTimestamps = async (
  entries: Array<Omit<DrinkLog, 'calories'>>
): Promise<boolean> => {
  try {
    const logs = await getAllLogs();
    const existingIds = new Set(logs.map((log) => log.id));
    entries.forEach((entry) => {
      if (existingIds.has(entry.id)) return;
      const calories = alcoholCalories(entry.volume, entry.abv);
      logs.push({
        ...entry,
        calories: Math.round(calories * 10) / 10,
      });
      existingIds.add(entry.id);
    });
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(logs));
    return true;
  } catch (error) {
    console.error('Error adding drink logs:', error);
    return false;
  }
};

// 삭제 되돌리기: 지운 로그를 id·시각·칼로리·금액·presetId까지 그대로 되살린다.
// 같은 id가 이미 있으면 중복 저장하지 않고 true(이미 복원됨)를 돌려준다.
export const restoreDrinkLog = async (log: DrinkLog): Promise<boolean> => {
  try {
    const logs = await getAllLogs();
    if (logs.some((existing) => existing.id === log.id)) return true;
    logs.push({ ...log });
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(logs));
    return true;
  } catch (error) {
    console.error('Error restoring drink log:', error);
    return false;
  }
};

const getAllLogs = async (): Promise<DrinkLog[]> => {
  try {
    const data = await AsyncStorage.getItem(TRACKER_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
};

export const getDrinkLogs = async (
  startDate: Date,
  endDate: Date
): Promise<DrinkLog[]> => {
  const logs = await getAllLogs();
  const start = startDate.getTime();
  const end = endDate.getTime();
  return logs.filter((log) => log.timestamp >= start && log.timestamp <= end);
};

export const getDrinkLogsForDate = async (date: Date): Promise<DrinkLog[]> => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return getDrinkLogs(start, end);
};

export const deleteDrinkLog = async (id: string): Promise<boolean> => {
  try {
    const logs = await getAllLogs();
    const updated = logs.filter((l) => l.id !== id);
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error deleting drink log:', error);
    return false;
  }
};

export const getWeeklyStats = async (
  date: Date
): Promise<{ labels: string[]; drinks: number[]; calories: number[]; totalDrinks: number; totalCalories: number; totalSpend: number }> => {
  const result = { labels: [] as string[], drinks: [] as number[], calories: [] as number[], totalDrinks: 0, totalCalories: 0, totalSpend: 0 };

  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const logs = await getDrinkLogsForDate(day);

    result.labels.push(dayNames[i]);
    result.drinks.push(logs.length);
    const dayCals = logs.reduce((sum, l) => sum + l.calories, 0);
    result.calories.push(Math.round(dayCals));
    result.totalDrinks += logs.length;
    result.totalCalories += dayCals;
    result.totalSpend += logs.reduce((sum, l) => sum + (l.price ?? 0), 0);
  }

  result.totalCalories = Math.round(result.totalCalories);
  result.totalSpend = Math.round(result.totalSpend);
  return result;
};

export const getMonthlyStats = async (
  date: Date
): Promise<{ labels: string[]; drinks: number[]; calories: number[]; totalDrinks: number; totalCalories: number }> => {
  const result = { labels: [] as string[], drinks: [] as number[], calories: [] as number[], totalDrinks: 0, totalCalories: 0 };

  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(year, month, i);
    const logs = await getDrinkLogsForDate(day);

    result.labels.push(String(i));
    result.drinks.push(logs.length);
    const dayCals = logs.reduce((sum, l) => sum + l.calories, 0);
    result.calories.push(Math.round(dayCals));
    result.totalDrinks += logs.length;
    result.totalCalories += dayCals;
  }

  result.totalCalories = Math.round(result.totalCalories);
  return result;
};
