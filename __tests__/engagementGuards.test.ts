import {
  assertLocalizedText,
  validateAlcoholCopy,
} from "../utils/engagement/contentGuards";

describe("engagement content guards", () => {
  it("accepts complete localized text", () => {
    const result = assertLocalizedText({
      ko: "표준잔은 참고용 기준입니다.",
      en: "A standard drink is an estimate.",
      es: "Un trago estándar es una estimación.",
    });

    expect(result.kind).toBe("valid");
  });

  it("rejects localized text missing Spanish copy", () => {
    const result = assertLocalizedText({
      ko: "오늘의 가이드",
      en: "Daily guide",
    });

    expect(result).toEqual({
      kind: "invalid",
      reason: "missing-locale",
      missingLocales: ["es"],
    });
  });

  it("rejects unsafe alcohol promotion phrases", () => {
    const result = validateAlcoholCopy("Take this drinking challenge and drink more tonight.");

    expect(result.kind).toBe("invalid");
    if (result.kind === "invalid") {
      expect(result.reason).toBe("unsafe-alcohol-copy");
    }
  });
});
