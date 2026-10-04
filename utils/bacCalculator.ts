import { TFunction } from "i18next";
import { BacLevel, bacLevelOf } from "./engagement/drinkingSession";
import { STANDARD_DRINK_GRAMS } from "./alcoholConstants";

// 라이브 세션(drinkingSession.bacLevelOf)과 동일한 4단계 임계(0.02/0.05/0.08)를
// 단일 소스로 공유한다. 각 레벨을 홈 BAC 계산기의 경고 문구 키에 매핑한다.
const BAC_WARNING_KEYS: Record<BacLevel, string> = {
  safe: "calculators.bac.bacSafe",
  caution: "calculators.bac.bacCaution",
  danger: "calculators.bac.bacDanger",
  high: "calculators.bac.bacHigh",
};

export const bacWarningKey = (bac: number): string =>
  BAC_WARNING_KEYS[bacLevelOf(bac)];

export const calculateBAC = (
  weight: number,
  gender: 'male' | 'female',
  drinks: number,
  hours: number,
  t: TFunction
): { label: string; value: string }[] => {
  if (weight <= 0) {
    return [{ label: t("common.error"), value: t("calculators.bac.errorWeight") }];
  }
  if (drinks <= 0) {
    return [{ label: t("common.error"), value: t("calculators.bac.errorDrinks") }];
  }

  const r = gender === 'male' ? 0.68 : 0.55;
  // Standard drink = 14g of pure alcohol
  const alcoholGrams = drinks * STANDARD_DRINK_GRAMS;
  const bodyWeightGrams = weight * 1000;

  const bac = Math.max(0, (alcoholGrams / (bodyWeightGrams * r)) * 100 - (0.015 * hours));
  const soberHours = bac > 0 ? bac / 0.015 : 0;

  return [
    { label: t("calculators.bac.bacLevel"), value: `${bac.toFixed(4)}%` },
    { label: t("calculators.bac.soberTime"), value: `${soberHours.toFixed(1)} ${t("calculators.bac.hours")}` },
    { label: t("common.reference"), value: t(bacWarningKey(bac)) },
  ];
};
