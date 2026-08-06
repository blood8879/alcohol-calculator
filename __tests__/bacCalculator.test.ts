import { bacWarningKey, calculateBAC } from "../utils/bacCalculator";
import type { TFunction } from "i18next";

// 테스트에서는 t()가 키를 그대로 반환하도록 한다.
const identityT = ((key: string) => key) as unknown as TFunction;

describe("bac calculator level unification", () => {
  it("shares the session thresholds 0.02 / 0.05 / 0.08", () => {
    expect(bacWarningKey(0.019)).toBe("calculators.bac.bacSafe");
    expect(bacWarningKey(0.02)).toBe("calculators.bac.bacCaution");
    expect(bacWarningKey(0.049)).toBe("calculators.bac.bacCaution");
    expect(bacWarningKey(0.05)).toBe("calculators.bac.bacDanger");
    expect(bacWarningKey(0.079)).toBe("calculators.bac.bacDanger");
    expect(bacWarningKey(0.08)).toBe("calculators.bac.bacHigh");
    expect(bacWarningKey(0.3)).toBe("calculators.bac.bacHigh");
  });

  it("returns the reference row using the unified warning key", () => {
    // 70kg 남성, 표준잔 3잔, 0시간 → BAC ≈ 0.0882% → high
    const rows = calculateBAC(70, "male", 3, 0, identityT);
    const reference = rows.find(
      (r) => r.label === "common.reference"
    );
    expect(reference?.value).toBe("calculators.bac.bacHigh");
  });

  it("validates weight and drinks inputs", () => {
    expect(calculateBAC(0, "male", 3, 0, identityT)[0].value).toBe(
      "calculators.bac.errorWeight"
    );
    expect(calculateBAC(70, "male", 0, 0, identityT)[0].value).toBe(
      "calculators.bac.errorDrinks"
    );
  });
});
