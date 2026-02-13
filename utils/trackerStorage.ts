import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './idGenerator';

const TRACKER_KEY = '@drink_logs';

export interface DrinkLog {
  id: string;
  presetId?: string;
  name: string;
  emoji: string;
  volume: number;
  abv: number;
  calories: number;
  timestamp: number;
}

export interface DayStats {
  totalDrinks: number;
  totalCalories: number;
  totalVolume: number;
}

export const addDrinkLog = async (
  log: Omit<DrinkLog, 'id' | 'timestamp' | 'calories'>
): Promise<void> => {
  try {
    const logs = await getAllLogs();
    const calories = log.volume * (log.abv / 100) * 5.6;
    const newLog: DrinkLog = {
      ...log,
      id: generateId(),
      timestamp: Date.now(),
      calories: Math.round(calories * 10) / 10,
    };
    logs.push(newLog);
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error adding drink log:', error);
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

export const deleteDrinkLog = async (id: string): Promise<void> => {
  try {
    const logs = await getAllLogs();
    const updated = logs.filter((l) => l.id !== id);
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting drink log:', error);
  }
};

export const getWeeklyStats = async (
  date: Date
): Promise<{ labels: string[]; drinks: number[]; calories: number[]; totalDrinks: number; totalCalories: number }> => {
  const result = { labels: [] as string[], drinks: [] as number[], calories: [] as number[], totalDrinks: 0, totalCalories: 0 };

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
  }

  result.totalCalories = Math.round(result.totalCalories);
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
