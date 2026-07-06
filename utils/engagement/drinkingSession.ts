// 실시간 음주 세션: Widmark 공식 기반의 순수 계산 로직.
// 의학적 진단이 아닌 참고용 추정치이며, UI에서 면책 문구와 함께 노출한다.

export type SessionGender = "male" | "female";

export type SessionDrink = {
  readonly id: string;
  readonly nameKey: string;
  readonly emoji: string;
  readonly volume: number; // ml
  readonly abv: number; // %
  readonly timestamp: number;
};

export type DrinkingSession = {
  readonly startedAt: number;
  readonly weightKg: number;
  readonly gender: SessionGender;
  readonly drinks: readonly SessionDrink[];
};

export type BacLevel = "safe" | "caution" | "danger" | "high";

export type SessionEstimate = {
  readonly bac: number; // %
  readonly level: BacLevel;
  readonly standardDrinks: number;
  readonly hoursToSober: number;
  readonly soberAt: number | null; // epoch ms, null이면 이미 0
  readonly totalVolume: number;
  readonly totalCalories: number;
};

const ETHANOL_DENSITY = 0.789; // g/ml
const STANDARD_DRINK_GRAMS = 14;
const ELIMINATION_RATE = 0.015; // %/hour
const CALORIES_PER_ML_ABV = 5.6 / 100; // trackerStorage와 동일 계수

const distributionRatio = (gender: SessionGender): number =>
  gender === "male" ? 0.68 : 0.55;

export const alcoholGrams = (volume: number, abv: number): number =>
  volume * (abv / 100) * ETHANOL_DENSITY;

export const bacLevelOf = (bac: number): BacLevel => {
  if (bac >= 0.08) return "high";
  if (bac >= 0.05) return "danger";
  if (bac >= 0.02) return "caution";
  return "safe";
};

export const estimateSession = (
  session: DrinkingSession,
  now: Date
): SessionEstimate => {
  const drinks = session.drinks;
  const totalGrams = drinks.reduce(
    (sum, d) => sum + alcoholGrams(d.volume, d.abv),
    0
  );
  const totalVolume = drinks.reduce((sum, d) => sum + d.volume, 0);
  const totalCalories = Math.round(
    drinks.reduce((sum, d) => sum + d.volume * d.abv * CALORIES_PER_ML_ABV, 0)
  );

  if (drinks.length === 0 || session.weightKg <= 0) {
    return {
      bac: 0,
      level: "safe",
      standardDrinks: 0,
      hoursToSober: 0,
      soberAt: null,
      totalVolume,
      totalCalories,
    };
  }

  const firstDrinkAt = Math.min(...drinks.map((d) => d.timestamp));
  const hoursElapsed = Math.max(0, (now.getTime() - firstDrinkAt) / 3_600_000);
  const rawBac =
    (totalGrams / (session.weightKg * 1000 * distributionRatio(session.gender))) *
    100;
  const bac = Math.max(0, rawBac - ELIMINATION_RATE * hoursElapsed);
  const hoursToSober = bac > 0 ? bac / ELIMINATION_RATE : 0;

  return {
    bac: Math.round(bac * 10000) / 10000,
    level: bacLevelOf(bac),
    standardDrinks: Math.round((totalGrams / STANDARD_DRINK_GRAMS) * 10) / 10,
    hoursToSober: Math.round(hoursToSober * 10) / 10,
    soberAt: bac > 0 ? now.getTime() + hoursToSober * 3_600_000 : null,
    totalVolume,
    totalCalories,
  };
};

// 세션 중 빠른 추가용 잔 단위 (트래커 프리셋은 병 단위라 별도 정의)
export type QuickDrinkUnit = {
  readonly id: string;
  readonly nameKey: string;
  readonly emoji: string;
  readonly volume: number;
  readonly abv: number;
};

export const quickDrinkUnits: readonly QuickDrinkUnit[] = [
  { id: "soju-glass", nameKey: "presets.drinks.soju", emoji: "🍶", volume: 50, abv: 16.5 },
  { id: "beer-glass", nameKey: "presets.drinks.beer", emoji: "🍺", volume: 355, abv: 5 },
  { id: "somaek-glass", nameKey: "presets.drinks.somaek", emoji: "🍻", volume: 300, abv: 9 },
  { id: "wine-glass", nameKey: "presets.drinks.redWine", emoji: "🍷", volume: 150, abv: 13 },
  { id: "whiskey-shot", nameKey: "presets.drinks.whiskey", emoji: "🥃", volume: 30, abv: 40 },
  { id: "highball-glass", nameKey: "presets.drinks.highball", emoji: "🍹", volume: 350, abv: 8 },
  { id: "makgeolli-bowl", nameKey: "presets.drinks.makgeolli", emoji: "🥛", volume: 200, abv: 6 },
];
