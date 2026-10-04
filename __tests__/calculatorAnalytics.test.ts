import { logFirebaseEvent } from "../utils/firebase";
import { calculatorDurationBucket, isSuccessfulCalculation, logCalculatorOutcome, logCalculatorPreset } from "../utils/calculatorAnalytics";

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test("validation result is not a successful calculation", () => {
  expect(isSuccessfulCalculation([{ label: "Error", value: "Invalid" }], "Error")).toBe(false);
  expect(isSuccessfulCalculation([{ label: "BAC", value: "NaN%" }], "Error")).toBe(false);
  expect(isSuccessfulCalculation([{ label: "BAC", value: "Infinity%" }], "Error")).toBe(false);
  logCalculatorOutcome("proof", false);
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculation_validation_failed", { calculator_type: "proof" });
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("calculator_used", expect.anything());
});

test("success emits the legacy usage event exactly once", () => {
  expect(isSuccessfulCalculation([{ label: "Proof", value: "20" }], "Error")).toBe(true);
  logCalculatorOutcome("proof", true);
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculation_succeeded", { calculator_type: "proof" });
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculator_used", { calculator_type: "proof" });
});

test("duration buckets have stable boundaries", () => {
  expect(calculatorDurationBucket(9999)).toBe("under_10s");
  expect(calculatorDurationBucket(10000)).toBe("10_59s");
  expect(calculatorDurationBucket(60000)).toBe("1_4m");
  expect(calculatorDurationBucket(300000)).toBe("5m_plus");
});

test("preset analytics accepts only bundled catalog IDs", () => {
  logCalculatorPreset("calorie", "private-drink-name");
  expect(logFirebaseEvent).not.toHaveBeenCalled();
  logCalculatorPreset("calorie", "soju");
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculator_preset_selected", { calculator_type: "calorie", preset_id: "soju" });
});
