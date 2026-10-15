import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { View } from "react-native";
import CalculationCard from "../components/CalculationCard";
import { logFirebaseEvent } from "../utils/firebase";
import { shareResults } from "../utils/shareUtils";
import { bacInitialValuesFromProfile } from "../utils/calculatorPrefill";

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));
jest.mock("../utils/historyStorage", () => ({ saveCalculation: jest.fn() }));
jest.mock("../utils/shareUtils", () => ({ shareResults: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }) }));

// 첫 렌더가 모듈 로딩(콜드 스타트)을 떠안아 부하 시 기본 5초를 넘길 수 있다.
jest.setTimeout(20000);

const baseProps = {
  title: "Proof",
  description: "Description",
  fields: [{ label: "ABV", unit: "%", placeholder: "0" }],
  onBack: jest.fn(),
  calculatorType: "proof" as const,
  calculatorIcon: "🍷",
};

beforeEach(() => jest.clearAllMocks());

test("typing repeatedly emits first input once and validation is not usage", () => {
  const view = render(<CalculationCard {...baseProps} calculateResult={() => [{ label: "common.error", value: "Invalid" }]} />);
  const input = view.getByPlaceholderText("0");
  fireEvent.changeText(input, "1");
  fireEvent.changeText(input, "12");
  fireEvent.press(view.getByLabelText("common.calculate"));
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([event]) => event === "calculator_first_input")).toHaveLength(1);
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculation_validation_failed", { calculator_type: "proof" });
  expect(jest.mocked(logFirebaseEvent).mock.calls.some(([event]) => event === "calculator_used")).toBe(false);
});

test("valid result emits success and legacy use", () => {
  const view = render(<CalculationCard {...baseProps} calculateResult={() => [{ label: "Proof", value: "20" }]} />);
  fireEvent.press(view.getByLabelText("common.calculate"));
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculation_succeeded", { calculator_type: "proof" });
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculator_used", { calculator_type: "proof" });
});

test("share dismissal is recorded without claiming delivery", async () => {
  jest.mocked(shareResults).mockResolvedValueOnce("dismissed");
  const view = render(<CalculationCard {...baseProps} calculateResult={() => [{ label: "Proof", value: "20" }]} />);
  fireEvent.press(view.getByLabelText("common.calculate"));
  fireEvent.press(view.getByLabelText("common.share"));
  await waitFor(() => expect(logFirebaseEvent).toHaveBeenCalledWith("calculator_share_dismissed", { calculator_type: "proof" }));
  expect(logFirebaseEvent).toHaveBeenCalledWith("calculator_share_attempted", { calculator_type: "proof" });
  expect(jest.mocked(logFirebaseEvent).mock.calls.some(([event]) => event === "calculator_share_completed")).toBe(false);
});

test("a new modal opening resets first-input tracking and prior result", () => {
  const view = render(<View><CalculationCard key="open-1" {...baseProps} calculateResult={() => [{ label: "Proof", value: "20" }]} /></View>);
  fireEvent.changeText(view.getByPlaceholderText("0"), "10");
  fireEvent.press(view.getByLabelText("common.calculate"));
  expect(view.getByText("20")).toBeTruthy();

  view.rerender(<View><CalculationCard key="open-2" {...baseProps} calculateResult={() => [{ label: "Proof", value: "20" }]} /></View>);
  expect(view.queryByText("20")).toBeNull();
  fireEvent.changeText(view.getByPlaceholderText("0"), "15");
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([event]) => event === "calculator_first_input")).toHaveLength(2);
});

test("BAC prefill from saved profile fills weight and gender without counting as first input", () => {
  const view = render(
    <CalculationCard
      {...baseProps}
      calculatorType="bac"
      fields={[
        { label: "weight", unit: "kg", placeholder: "0" },
        { label: "gender", unit: "", placeholder: "", fieldType: "radio", options: [{ label: "male", value: 0 }, { label: "female", value: 1 }] },
        { label: "drinks", unit: "", placeholder: "drinks-0" },
      ]}
      initialValues={bacInitialValuesFromProfile({ weightKg: 62, gender: "female" })}
      calculateResult={(values) => [{ label: "echo", value: values.join(",") }]}
    />
  );
  expect(view.getByDisplayValue("62")).toBeTruthy();
  expect(jest.mocked(logFirebaseEvent).mock.calls.some(([event]) => event === "calculator_first_input")).toBe(false);
  fireEvent.press(view.getByLabelText("common.calculate"));
  expect(view.getByText("62,1,0")).toBeTruthy();
});

test("profile without a valid weight keeps the weight empty", () => {
  expect(bacInitialValuesFromProfile({ weightKg: null, gender: "male" })).toEqual([undefined, 0, undefined, undefined]);
  expect(bacInitialValuesFromProfile(null)).toBeUndefined();
});
