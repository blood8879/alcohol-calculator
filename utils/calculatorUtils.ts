import { TFunction } from "i18next";
import alcoholConversionData from "../alcohol_conversion_data.json";

// 계산 함수들
export const calculateDilution = (values: number[], t: TFunction) => {
  const [currentVolume, currentABV, targetABV] = values;
  if (
    currentABV <= targetABV ||
    currentVolume <= 0 ||
    currentABV <= 0 ||
    targetABV <= 0
  ) {
    return [
      { label: t("common.error"), value: t("calculators.dilution.errorHigher") },
    ];
  }
  const finalVolume = (currentVolume * currentABV) / targetABV;
  const waterToAdd = finalVolume - currentVolume;
  return [
    { label: t("calculators.dilution.waterToAdd"), value: `${waterToAdd.toFixed(2)} ${t("units.ml")}` },
    { label: t("calculators.dilution.finalVolume"), value: `${finalVolume.toFixed(2)} ${t("units.ml")}` },
  ];
};

export const calculateAlcoholContent = (values: number[], t: TFunction) => {
  const [volume, abv] = values;
  if (volume <= 0 || abv <= 0) {
    return [{ label: t("common.error"), value: t("errors.positiveValues") }];
  }
  const pureAlcohol = volume * (abv / 100);
  return [{ label: t("calculators.alcoholContent.pureAlcohol"), value: `${pureAlcohol.toFixed(2)} ${t("units.ml")}` }];
};

export const calculateTemperatureCorrection = (values: number[], t: TFunction) => {
  const [temperature, measuredABV] = values;

  if (measuredABV <= 0) {
    return [{ label: t("common.error"), value: t("errors.abvPositive") }];
  }

  const availableTemperatures = Object.keys(alcoholConversionData).map(parseFloat);
  const closestTemperature = availableTemperatures.reduce((prev, curr) =>
    Math.abs(curr - temperature) < Math.abs(prev - temperature) ? curr : prev
  );

  const temperatureKey = closestTemperature.toFixed(1);
  const temperatureData = alcoholConversionData[temperatureKey as keyof typeof alcoholConversionData];

  if (!temperatureData) {
    return [{ label: t("common.error"), value: t("calculators.temperature.errorNoData") }];
  }

  const availableMeasuredABVs = Object.keys(temperatureData).map(parseFloat);
  const closestMeasuredABV = availableMeasuredABVs.reduce((prev, curr) =>
    Math.abs(curr - measuredABV) < Math.abs(prev - measuredABV) ? curr : prev
  );

  const measuredABVKey = closestMeasuredABV.toFixed(1);
  const actualABV = temperatureData[measuredABVKey as keyof typeof temperatureData];

  if (actualABV === undefined || actualABV === null) {
    return [
      {
        label: t("common.error"),
        value: t("calculators.temperature.errorNoABVData"),
      },
    ];
  }

  return [
    {
      label: t("calculators.temperature.actualABV", { temp: temperatureKey, abv: measuredABVKey }),
      value: `${Number(actualABV).toFixed(2)} ${t("units.percent")}`,
    },
  ];
};

export const calculateFreezingPoint = (values: number[], t: TFunction) => {
  const [abv] = values;
  if (abv <= 0) {
    return [{ label: t("common.error"), value: t("errors.abvPositiveAlcohol") }];
  }
  if (abv >= 100) {
    return [{ label: t("common.error"), value: t("calculators.freezingPoint.errorTooHigh") }];
  }

  const freezingPoint = -abv * 0.4;
  return [
    { label: t("calculators.freezingPoint.expectedFreezing"), value: `${freezingPoint.toFixed(1)} ${t("units.celsius")}` },
    { label: t("common.reference"), value: t("calculators.freezingPoint.note") },
  ];
};

export const calculateProof = (values: number[], t: TFunction) => {
  const [abv, proof] = values;

  if (abv > 0 && proof > 0) {
    return [{ label: t("common.error"), value: t("calculators.proof.errorBoth") }];
  }

  if (abv <= 0 && proof <= 0) {
    return [{ label: t("common.error"), value: t("calculators.proof.errorNone") }];
  }

  if (abv > 0) {
    if (abv > 100) {
      return [{ label: t("common.error"), value: t("calculators.proof.errorABVHigh") }];
    }
    const usProof = abv * 2;
    const ukProof = abv * 1.75;
    return [
      { label: t("calculators.proof.usProof"), value: `${usProof.toFixed(1)} ${t("units.proof")}` },
      { label: t("calculators.proof.ukProof"), value: `${ukProof.toFixed(1)} ${t("units.proof")}` },
    ];
  }

  if (proof > 0) {
    if (proof > 200) {
      return [{ label: t("common.error"), value: t("calculators.proof.errorProofHigh") }];
    }
    const calculatedABV = proof / 2;
    const ukABV = proof / 1.75;
    return [
      { label: t("calculators.proof.abvUS"), value: `${calculatedABV.toFixed(1)} ${t("units.percent")}` },
      { label: t("calculators.proof.abvUK"), value: `${ukABV.toFixed(1)} ${t("units.percent")}` },
    ];
  }

  return [{ label: t("common.error"), value: t("errors.calculationError") }];
};

export const calculateBlending = (values: number[], t: TFunction) => {
  const [firstABV, firstVolume, secondABV, targetABV, targetVolume] = values;

  if (
    firstABV <= 0 ||
    firstVolume <= 0 ||
    secondABV <= 0 ||
    targetABV <= 0 ||
    targetVolume <= 0
  ) {
    return [{ label: t("common.error"), value: t("errors.positiveValues") }];
  }

  if (firstABV > 100 || secondABV > 100 || targetABV > 100) {
    return [{ label: t("common.error"), value: t("errors.abvUnder100") }];
  }

  if (targetVolume <= firstVolume) {
    return [
      { label: t("common.error"), value: t("calculators.blending.errorTargetLarger") },
    ];
  }

  const secondVolume = targetVolume - firstVolume;
  const calculatedTargetABV =
    (firstVolume * firstABV + secondVolume * secondABV) / targetVolume;

  const minPossibleABV = Math.min(firstABV, secondABV);
  const maxPossibleABV = Math.max(firstABV, secondABV);

  if (targetABV < minPossibleABV || targetABV > maxPossibleABV) {
    return [
      {
        label: t("common.error"),
        value: t("calculators.blending.errorTargetRange", { min: minPossibleABV, max: maxPossibleABV }),
      },
    ];
  }

  return [
    { label: t("calculators.blending.secondVolumeNeeded"), value: `${secondVolume.toFixed(2)} ${t("units.ml")}` },
    { label: t("calculators.blending.actualABV"), value: `${calculatedTargetABV.toFixed(2)} ${t("units.percent")}` },
    { label: t("calculators.blending.totalVolume"), value: `${targetVolume.toFixed(2)} ${t("units.ml")}` },
  ];
};

export const calculateCalorie = (values: number[], t: TFunction) => {
  const [volume, abv] = values;

  if (volume <= 0 || abv <= 0) {
    return [{ label: t("common.error"), value: t("errors.positiveValues") }];
  }

  if (abv > 100) {
    return [{ label: t("common.error"), value: t("errors.abvUnder100Alcohol") }];
  }

  const alcoholCalories = volume * (abv / 100) * 5.6;

  return [
    { label: t("calculators.calorie.alcoholCalories"), value: `${alcoholCalories.toFixed(1)} ${t("units.kcal")}` },
    { label: t("common.referenceNote"), value: t("calculators.calorie.additionalNote") },
  ];
};
