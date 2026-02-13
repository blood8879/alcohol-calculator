import { TFunction } from "i18next";

type VolumeUnit = 'ml' | 'oz' | 'cups' | 'bottles';
type TempUnit = 'celsius' | 'fahrenheit';
type KoreanUnit = 'ml' | 'sojuGlass' | 'beerGlass' | 'doe' | 'sojuBottle';

const volumeToMl: Record<VolumeUnit, number> = {
  ml: 1,
  oz: 29.5735,
  cups: 236.588,
  bottles: 750,
};

const koreanToMl: Record<KoreanUnit, number> = {
  ml: 1,
  sojuGlass: 50,
  beerGlass: 355,
  doe: 1800,
  sojuBottle: 360,
};

export const convertVolume = (value: number, from: VolumeUnit, to: VolumeUnit): number => {
  const ml = value * volumeToMl[from];
  return ml / volumeToMl[to];
};

export const convertTemperature = (value: number, from: TempUnit, to: TempUnit): number => {
  if (from === to) return value;
  if (from === 'celsius') return (value * 9/5) + 32;
  return (value - 32) * 5/9;
};

export const convertKoreanUnits = (value: number, from: KoreanUnit, to: KoreanUnit): number => {
  const ml = value * koreanToMl[from];
  return ml / koreanToMl[to];
};

export const calculateUnitConversion = (
  value: number,
  mode: 'volume' | 'temperature' | 'korean',
  fromUnit: string,
  toUnit: string,
  t: TFunction
): { label: string; value: string }[] => {
  if (value === 0) {
    return [{ label: t("common.error"), value: t("errors.positiveValues") }];
  }

  let result: number;
  let unitLabel: string;

  switch (mode) {
    case 'volume':
      result = convertVolume(value, fromUnit as VolumeUnit, toUnit as VolumeUnit);
      unitLabel = t(`calculators.unitConverter.${toUnit}`);
      break;
    case 'temperature':
      result = convertTemperature(value, fromUnit as TempUnit, toUnit as TempUnit);
      unitLabel = t(`calculators.unitConverter.${toUnit}`);
      break;
    case 'korean':
      result = convertKoreanUnits(value, fromUnit as KoreanUnit, toUnit as KoreanUnit);
      unitLabel = t(`calculators.unitConverter.${toUnit}`);
      break;
    default:
      return [{ label: t("common.error"), value: t("errors.calculationError") }];
  }

  return [
    { label: t("calculators.unitConverter.result"), value: `${result.toFixed(2)} ${unitLabel}` },
  ];
};
