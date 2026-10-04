import { createQuizAnalytics, elapsedBucket } from "../utils/engagementAnalytics";
import { logFirebaseEvent } from "../utils/firebase";

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

it("emits one observable abandonment with progress when a playing quiz loses focus", () => {
  // Given an active quiz with one answered question.
  const quiz = createQuizAnalytics(() => 1_000);
  quiz.start("standard", "basics", 10);
  quiz.answer("quiz-public-1", 0, true);
  // When focus cleanup and unmount both run.
  quiz.abandon("navigation");
  quiz.abandon("navigation");
  // Then abandonment is emitted only once with no answer content.
  expect(logFirebaseEvent).toHaveBeenCalledWith("quiz_abandoned", {
    mode: "standard", category: "basics", reason: "navigation", progress_bucket: "started",
  });
  expect(jest.mocked(logFirebaseEvent).mock.calls.filter(([name]) => name === "quiz_abandoned")).toHaveLength(1);
});

it("does not call completion an abandonment and distinguishes restart", () => {
  // Given a completed quiz.
  const quiz = createQuizAnalytics(() => 1_000);
  quiz.start("daily", "all", 5);
  // When it completes and starts a retry.
  quiz.complete();
  quiz.abandon("navigation");
  quiz.restart();
  // Then only the restart event is emitted.
  expect(logFirebaseEvent).not.toHaveBeenCalledWith("quiz_abandoned", expect.anything());
  expect(logFirebaseEvent).toHaveBeenCalledWith("quiz_restarted", { mode: "daily", category: "all" });
});

it("coarsens elapsed time without leaking timestamps", () => {
  // Given durations around bucket boundaries.
  // When bucketed.
  // Then only a fixed label remains.
  expect([elapsedBucket(4_999), elapsedBucket(5_000), elapsedBucket(30_000)]).toEqual(["under_5s", "5_to_29s", "30s_plus"]);
});
