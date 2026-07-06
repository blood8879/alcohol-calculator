import { TFunction } from "i18next";

export type LocalizedText = {
  ko: string;
  en: string;
  es: string;
};

export const pickLocalizedText = (
  text: LocalizedText,
  language?: string
): string => {
  const code = language?.split("-")[0];

  if (code === "ko" || code === "en" || code === "es") {
    return text[code];
  }

  return text.en;
};

export const translateWithFallback = (
  t: TFunction,
  key: string,
  fallback?: LocalizedText,
  language?: string
): string => {
  const translated = t(key);

  if (translated !== key) {
    return translated;
  }

  return fallback ? pickLocalizedText(fallback, language) : key;
};
