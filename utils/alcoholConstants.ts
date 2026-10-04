// 알코올 관련 공용 계수 — 앱 전역에서 이 모듈만 참조한다.

// 칼로리 계수: kcal = 용량(ml) × (도수/100) × 5.6
// 출처: docs/디자인_의뢰_명세서.md B-2 (순수 알코올 1ml ≈ 0.8g × 7kcal/g)
// 예) 소맥(소주 90ml 16.5% + 맥주 210ml 5%) = 142 kcal (명세 B-5)
export const KCAL_PER_ML_PURE_ALCOHOL_FACTOR = 5.6;

// 에탄올 밀도 (g/ml)
export const ETHANOL_DENSITY = 0.789;

// 1표준잔 = 순수 알코올 14g
export const STANDARD_DRINK_GRAMS = 14;

// 반올림하지 않은 알코올 칼로리(kcal). 반올림은 호출부 책임.
export const alcoholCalories = (volumeMl: number, abvPercent: number): number =>
  volumeMl * (abvPercent / 100) * KCAL_PER_ML_PURE_ALCOHOL_FACTOR;

// 표준잔 표시 포맷 — 명세서 §2.1 "표준잔 소수 1자리" (예: 1 → "1.0", 0.45 → "0.5").
// 앱 전역에서 표준잔 수치를 화면/공유 텍스트에 노출할 때 이 함수만 사용한다.
export const formatStandardDrinks = (standardDrinks: number): string =>
  Number.isFinite(standardDrinks) ? standardDrinks.toFixed(1) : "0.0";
