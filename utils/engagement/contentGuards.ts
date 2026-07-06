import type { LocalizedText } from "../localizedText";

export type LocaleValidationResult =
  | { readonly kind: "invalid"; readonly missingLocales: readonly string[]; readonly reason: "missing-locale" }
  | { readonly kind: "valid" };

export type AlcoholCopyValidationResult =
  | { readonly kind: "invalid"; readonly reason: "unsafe-alcohol-copy"; readonly term: string }
  | { readonly kind: "valid" };

const REQUIRED_LOCALES = ["ko", "en", "es"] as const;
const UNSAFE_TERMS = [
  "binge",
  "buy now",
  "challenge",
  "drink more",
  "guaranteed",
  "legal advice",
  "medical advice",
  "purchase",
  "underage",
] as const;

export const assertLocalizedText = (value: Partial<LocalizedText>): LocaleValidationResult => {
  const missingLocales = REQUIRED_LOCALES.filter((locale) => {
    const text = value[locale];
    return typeof text !== "string" || text.trim().length === 0;
  });

  if (missingLocales.length > 0) {
    return { kind: "invalid", reason: "missing-locale", missingLocales };
  }

  return { kind: "valid" };
};

export const validateAlcoholCopy = (copy: string): AlcoholCopyValidationResult => {
  const normalized = copy.toLowerCase();
  const unsafeTerm = UNSAFE_TERMS.find((term) => normalized.includes(term));

  if (unsafeTerm !== undefined) {
    return { kind: "invalid", reason: "unsafe-alcohol-copy", term: unsafeTerm };
  }

  return { kind: "valid" };
};
