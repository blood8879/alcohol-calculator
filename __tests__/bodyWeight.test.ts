import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TFunction } from "i18next";
import {
  MAX_BODY_WEIGHT_KG,
  MIN_BODY_WEIGHT_KG,
  validateBodyWeight,
} from "../utils/bodyWeight";
import { calculateBAC } from "../utils/bacCalculator";
import {
  getSessionProfile,
  sanitizeSessionProfile,
} from "../utils/engagement/drinkingSessionStorage";

const identityT = ((key: string) => key) as unknown as TFunction;

describe("validateBodyWeight (16회차: 30~250kg)", () => {
  it("uses the documented adult range", () => {
    expect(MIN_BODY_WEIGHT_KG).toBe(30);
    expect(MAX_BODY_WEIGHT_KG).toBe(250);
  });

  it.each([
    [29.9, "out_of_range"],
    ["29.9", "out_of_range"],
    [250.1, "out_of_range"],
    ["7070", "out_of_range"],
    [Number.NaN, "not_number"],
    ["abc", "not_number"],
    ["", "empty"],
    ["   ", "empty"],
    [null, "empty"],
    [0, "non_positive"],
    ["-70", "non_positive"],
  ] as const)("rejects %p as %s", (input, reason) => {
    expect(validateBodyWeight(input)).toEqual({ ok: false, reason });
  });

  it.each([
    [30, 30],
    ["30", 30],
    [250, 250],
    ["250", 250],
    ["70", 70],
    [" 65.5 ", 65.5],
    ["70,5", 70.5],
  ] as const)("accepts %p", (input, expected) => {
    expect(validateBodyWeight(input)).toEqual({ ok: true, weightKg: expected });
  });
});

describe("calculateBAC weight guard", () => {
  it("returns only the error row for a typo weight (7070kg)", () => {
    expect(calculateBAC(7070, "male", 2, 0, identityT)).toEqual([
      { label: "common.error", value: "errors.weightRange" },
    ]);
  });

  it("rejects just outside the range and accepts the boundaries", () => {
    expect(calculateBAC(29.9, "male", 2, 0, identityT)[0].label).toBe("common.error");
    expect(calculateBAC(250.1, "female", 2, 0, identityT)[0].label).toBe("common.error");
    expect(calculateBAC(30, "male", 2, 0, identityT)[0].label).toBe("calculators.bac.bacLevel");
    expect(calculateBAC(250, "male", 2, 0, identityT)[0].label).toBe("calculators.bac.bacLevel");
  });
});

describe("session profile sanitization", () => {
  afterEach(() => jest.restoreAllMocks());

  it("drops an out-of-range stored weight but keeps gender", () => {
    expect(sanitizeSessionProfile({ weightKg: 7070, gender: "female" })).toEqual({
      weightKg: null,
      gender: "female",
    });
    expect(sanitizeSessionProfile({ weightKg: "70", gender: "male" })).toEqual({
      weightKg: null,
      gender: "male",
    });
  });

  it("keeps a valid stored weight and rejects non-objects", () => {
    expect(sanitizeSessionProfile({ weightKg: 70, gender: "male" })).toEqual({
      weightKg: 70,
      gender: "male",
    });
    expect(sanitizeSessionProfile(null)).toBeNull();
    expect(sanitizeSessionProfile(42)).toBeNull();
  });

  it("getSessionProfile does not auto-fill a saved typo weight", async () => {
    jest
      .spyOn(AsyncStorage, "getItem")
      .mockResolvedValueOnce(JSON.stringify({ weightKg: 7070, gender: "male" }));
    await expect(getSessionProfile()).resolves.toEqual({ weightKg: null, gender: "male" });
  });
});
