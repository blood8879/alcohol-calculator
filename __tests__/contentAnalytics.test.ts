import { logFirebaseEvent } from "../utils/firebase";
import { logContentViewed, logContentSearch, queryLengthBucket } from "../utils/contentAnalytics";

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test("search reports only length and result buckets", () => {
  logContentSearch("recipes", "private search phrase", 0);
  expect(logFirebaseEvent).toHaveBeenCalledWith("content_search", {
    section: "recipes", query_length: "11_plus", result_count: "zero",
  });
  expect(JSON.stringify(jest.mocked(logFirebaseEvent).mock.calls)).not.toContain("private search phrase");
  expect(queryLengthBucket("ab")).toBe("1_2");
});

test("unknown content ids cannot be sent", () => {
  logContentViewed("recipe", "private-user-id");
  expect(logFirebaseEvent).not.toHaveBeenCalled();
});
