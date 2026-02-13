import { TFunction } from "i18next";

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
  const alcoholGrams = drinks * 14;
  const bodyWeightGrams = weight * 1000;

  const bac = Math.max(0, (alcoholGrams / (bodyWeightGrams * r)) * 100 - (0.015 * hours));
  const soberHours = bac > 0 ? bac / 0.015 : 0;

  let warningKey = "calculators.bac.bacSafe";
  if (bac >= 0.30) warningKey = "calculators.bac.bacWarningHigh";
  else if (bac >= 0.08) warningKey = "calculators.bac.bacWarningMedium";
  else if (bac >= 0.02) warningKey = "calculators.bac.bacWarningLow";

  return [
    { label: t("calculators.bac.bacLevel"), value: `${bac.toFixed(4)}%` },
    { label: t("calculators.bac.soberTime"), value: `${soberHours.toFixed(1)} ${t("calculators.bac.hours")}` },
    { label: t("common.reference"), value: t(warningKey) },
  ];
};
