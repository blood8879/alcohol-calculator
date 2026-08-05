import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "./idGenerator";

const CUSTOM_DRINKS_KEY = "@custom_drinks";

const ETHANOL_DENSITY = 0.789; // g/ml — drinkingSession과 동일 계수
const STANDARD_DRINK_GRAMS = 14; // 순수알코올 14g = 1표준잔

export type CustomDrink = {
  readonly id: string;
  readonly name: string;
  readonly abv: number; // %
  readonly volumeMl: number; // ml
  readonly price?: number;
};

export type CustomDrinkInput = Omit<CustomDrink, "id">;

// 표준잔 환산 (기존 quickDrinkUnits와 동일 방식).
export const standardDrinksOf = (volumeMl: number, abv: number): number => {
  const grams = volumeMl * (abv / 100) * ETHANOL_DENSITY;
  return Math.round((grams / STANDARD_DRINK_GRAMS) * 10) / 10;
};

// --- 순수 컬렉션 헬퍼 (테스트 대상) ---

export const addToCollection = (
  drinks: readonly CustomDrink[],
  input: CustomDrinkInput
): CustomDrink[] => {
  const created: CustomDrink = { ...input, id: generateId() };
  return [...drinks, created];
};

export const updateInCollection = (
  drinks: readonly CustomDrink[],
  id: string,
  patch: Partial<CustomDrinkInput>
): CustomDrink[] =>
  drinks.map((drink) => (drink.id === id ? { ...drink, ...patch } : drink));

export const removeFromCollection = (
  drinks: readonly CustomDrink[],
  id: string
): CustomDrink[] => drinks.filter((drink) => drink.id !== id);

// --- AsyncStorage CRUD ---

export const getCustomDrinks = async (): Promise<CustomDrink[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_DRINKS_KEY);
    return data ? (JSON.parse(data) as CustomDrink[]) : [];
  } catch (error) {
    console.error("Error getting custom drinks:", error);
    return [];
  }
};

const persist = async (drinks: CustomDrink[]): Promise<void> => {
  await AsyncStorage.setItem(CUSTOM_DRINKS_KEY, JSON.stringify(drinks));
};

export const addCustomDrink = async (
  input: CustomDrinkInput
): Promise<CustomDrink[]> => {
  const drinks = addToCollection(await getCustomDrinks(), input);
  await persist(drinks);
  return drinks;
};

export const updateCustomDrink = async (
  id: string,
  patch: Partial<CustomDrinkInput>
): Promise<CustomDrink[]> => {
  const drinks = updateInCollection(await getCustomDrinks(), id, patch);
  await persist(drinks);
  return drinks;
};

export const deleteCustomDrink = async (
  id: string
): Promise<CustomDrink[]> => {
  const drinks = removeFromCollection(await getCustomDrinks(), id);
  await persist(drinks);
  return drinks;
};
