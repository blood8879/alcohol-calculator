import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import QuizScreen from "../app/(tabs)/quiz";
import QuizQuestionCard from "../components/QuizQuestion";
import { logFirebaseEvent } from "../utils/firebase";

const mockFocusCallbacks: Array<() => void | (() => void)> = [];

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));
jest.mock("@react-navigation/native", () => ({ useFocusEffect: (callback: () => void | (() => void)) => { mockFocusCallbacks.push(callback); } }));
jest.mock("../hooks/useRewardedAd", () => ({ useRewardedAd: () => ({ show: jest.fn() }) }));
jest.mock("../hooks/useInterstitialAd", () => ({ useInterstitialAd: () => ({ loaded: false, show: jest.fn(), reload: jest.fn() }) }));
jest.mock("../utils/engagement/quizProgressStorage", () => ({ getQuizProgress: jest.fn(async () => require("../utils/engagement/quizProgress").createEmptyQuizProgress()), setQuizProgress: jest.fn(async () => {}) }));
jest.mock("../components/QuizQuestion", () => {
  return { __esModule: true, default: "MockQuizQuestion" };
});

it("reports quiz navigation exit once and still accepts an answer on a mounted tab", async () => {
  // Given a quiz started on its actual screen.
  const view = render(<QuizScreen />);
  fireEvent.press(view.getByText("quiz.start"));
  const focusCleanup = mockFocusCallbacks[mockFocusCallbacks.length - 1]?.();
  // When focus cleanup fires twice and the mounted quiz receives an answer.
  focusCleanup?.();
  focusCleanup?.();
  fireEvent(view.UNSAFE_getByType(QuizQuestionCard), "onAnswer", 0);
  // Then exit is deduplicated and the quiz still records its answer.
  await waitFor(() => expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([name]) => name === "quiz_question_answered")).toHaveLength(1));
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([name]) => name === "quiz_abandoned")).toHaveLength(1);
}, 30_000);
