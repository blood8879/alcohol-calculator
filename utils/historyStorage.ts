import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './idGenerator';

const HISTORY_KEY = '@calc_history';
const MAX_ENTRIES = 100;

export interface CalculationHistory {
  id: string;
  calculatorType: string;
  calculatorIcon: string;
  inputs: { label: string; value: string }[];
  results: { label: string; value: string }[];
  timestamp: number;
  isFavorite: boolean;
}

export const saveCalculation = async (
  entry: Omit<CalculationHistory, 'id' | 'timestamp' | 'isFavorite'>
): Promise<void> => {
  try {
    const history = await getHistory();
    const newEntry: CalculationHistory = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
      isFavorite: false,
    };
    const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving calculation:', error);
  }
};

export const getHistory = async (): Promise<CalculationHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

export const deleteCalculation = async (id: string): Promise<void> => {
  try {
    const history = await getHistory();
    const updated = history.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting calculation:', error);
  }
};

export const toggleFavorite = async (id: string): Promise<void> => {
  try {
    const history = await getHistory();
    const updated = history.map((h) =>
      h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
    );
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};
