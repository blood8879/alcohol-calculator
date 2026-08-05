import {
  AdFrequencyState,
  GLOBAL_MIN_INTERVAL_MS,
  canShowInterstitial,
} from "../utils/adFrequency";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const NOW = new Date(2026, 6, 1, 20, 0, 0).getTime();

describe("canShowInterstitial", () => {
  it("허용: 기록이 전혀 없으면(최초 표시) 어떤 placement든 보여준다", () => {
    const state: AdFrequencyState = {};
    expect(canShowInterstitial(state, "quiz", NOW)).toBe(true);
    expect(canShowInterstitial(state, "sessionEnd", NOW)).toBe(true);
  });

  describe("전역 최소 간격 3분", () => {
    it("차단: 다른 placement가 3분 이내에 표시됐으면 막는다", () => {
      const state: AdFrequencyState = { sessionEnd: NOW - 2 * MIN };
      expect(canShowInterstitial(state, "quiz", NOW)).toBe(false);
    });

    it("허용: 마지막 표시가 정확히 3분 전이면(경계값) 보여준다", () => {
      const state: AdFrequencyState = {
        sessionEnd: NOW - GLOBAL_MIN_INTERVAL_MS,
      };
      expect(canShowInterstitial(state, "quiz", NOW)).toBe(true);
    });

    it("차단: 3분에서 1ms 모자라면(경계값) 막는다", () => {
      const state: AdFrequencyState = {
        quiz: NOW - GLOBAL_MIN_INTERVAL_MS + 1,
      };
      expect(canShowInterstitial(state, "quiz", NOW)).toBe(false);
    });

    it("전역 간격은 가장 최근 표시 기준으로 판단한다", () => {
      const state: AdFrequencyState = {
        quiz: NOW - 10 * MIN,
        sessionEnd: NOW - 1 * MIN,
      };
      expect(canShowInterstitial(state, "quiz", NOW)).toBe(false);
    });
  });

  describe("sessionEnd 12시간 캡", () => {
    it("차단: 지난 12시간 안에 이미 sessionEnd를 보여줬으면 막는다", () => {
      const state: AdFrequencyState = { sessionEnd: NOW - 5 * HOUR };
      expect(canShowInterstitial(state, "sessionEnd", NOW)).toBe(false);
    });

    it("허용: 정확히 12시간 전이면(경계값) 보여준다", () => {
      const state: AdFrequencyState = { sessionEnd: NOW - 12 * HOUR };
      expect(canShowInterstitial(state, "sessionEnd", NOW)).toBe(true);
    });

    it("차단: 12시간에서 1분 모자라면 막는다", () => {
      const state: AdFrequencyState = { sessionEnd: NOW - 12 * HOUR + MIN };
      expect(canShowInterstitial(state, "sessionEnd", NOW)).toBe(false);
    });
  });

  describe("placement 독립성", () => {
    it("quiz에는 추가 캡이 없어 전역 간격만 지나면 반복 표시된다", () => {
      const state: AdFrequencyState = { quiz: NOW - 5 * MIN };
      expect(canShowInterstitial(state, "quiz", NOW)).toBe(true);
    });

    it("sessionEnd 12시간 캡은 quiz 표시를 막지 않는다(전역 간격만 지났다면)", () => {
      const state: AdFrequencyState = { sessionEnd: NOW - 4 * MIN };
      expect(canShowInterstitial(state, "quiz", NOW)).toBe(true);
    });

    it("최근 quiz 표시는 전역 간격 밖이면 sessionEnd를 막지 않는다", () => {
      const state: AdFrequencyState = { quiz: NOW - 4 * MIN };
      expect(canShowInterstitial(state, "sessionEnd", NOW)).toBe(true);
    });
  });
});
