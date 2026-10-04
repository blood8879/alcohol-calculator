import { logSessionEnded } from "../utils/analytics";
import { logFirebaseEvent } from "../utils/firebase";

jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));

describe("session analytics privacy", () => {
  afterEach(() => jest.clearAllMocks());

  it("records coarse session activity without a BAC outcome", () => {
    logSessionEnded({ durationSec: 1800, drinkCount: 2 });

    expect(logFirebaseEvent).toHaveBeenCalledWith("session_ended", expect.objectContaining({
      duration_bucket: "15_59m",
      drink_count_bucket: "1_2",
    }));
    expect(jest.mocked(logFirebaseEvent).mock.calls[0]?.[1]).toStrictEqual({
      duration_bucket: "15_59m",
      drink_count_bucket: "1_2",
    });
  });
});
