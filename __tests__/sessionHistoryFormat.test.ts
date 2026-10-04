import { formatStandardDrinks } from "../utils/alcoholConstants";
import ko from "../locales/ko.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import ja from "../locales/ja.json";
import zh from "../locales/zh.json";

// 13회차: 세션 히스토리 표준잔 소수 1자리(명세서 §2.1) + 상세 피크 BAC "(추정)" (§2.3-5).
describe("formatStandardDrinks", () => {
  it("always renders exactly one decimal", () => {
    expect(formatStandardDrinks(1)).toBe("1.0");
    expect(formatStandardDrinks(0.5)).toBe("0.5");
    expect(formatStandardDrinks(2.5)).toBe("2.5");
    expect(formatStandardDrinks(0)).toBe("0.0");
    expect(formatStandardDrinks(10)).toBe("10.0");
  });

  it("rounds to one decimal", () => {
    expect(formatStandardDrinks(1.36)).toBe("1.4");
    expect(formatStandardDrinks(0.94)).toBe("0.9");
  });

  it("falls back to 0.0 for non-finite values", () => {
    expect(formatStandardDrinks(Number.NaN)).toBe("0.0");
    expect(formatStandardDrinks(Number.POSITIVE_INFINITY)).toBe("0.0");
  });
});

describe("sessionHistory locale keys", () => {
  const locales = { ko, en, es, ja, zh } as const;

  it.each(Object.entries(locales))(
    "%s has standardDrinksValue with a {{value}} placeholder",
    (_lang, locale) => {
      const value = locale.sessionHistory.standardDrinksValue;
      expect(typeof value).toBe("string");
      expect(value).toContain("{{value}}");
      expect(value).not.toContain("{{count}}");
    }
  );

  it.each(Object.entries(locales))(
    "%s has a peakBacEstimated label that marks the value as an estimate",
    (_lang, locale) => {
      const label = locale.sessionHistory.peakBacEstimated;
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toBe(locale.sessionHistory.peakBac);
    }
  );

  it("ko uses the spec copy 피크 BAC (추정)", () => {
    expect(ko.sessionHistory.peakBacEstimated).toBe("피크 BAC (추정)");
    expect(ko.sessionHistory.standardDrinksValue).toBe("표준잔 {{value}}잔");
  });
});
