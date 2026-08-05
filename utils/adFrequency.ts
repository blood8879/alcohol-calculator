import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Interstitial frequency capping.
 *
 * A single global minimum interval separates any two interstitials regardless
 * of placement, and each placement may add its own longer cap on top. The pure
 * decision function is kept separate from storage so it can be unit tested.
 */

const FREQUENCY_KEY = "@ad_frequency";

// 모든 인터스티셜 사이의 전역 최소 간격 (placement 무관).
export const GLOBAL_MIN_INTERVAL_MS = 3 * 60 * 1000; // 3분

export type InterstitialPlacement = "quiz" | "sessionEnd";

// placement별 추가 캡 (전역 간격에 더해 적용). 0이면 추가 캡 없음.
const PLACEMENT_CAP_MS: Record<InterstitialPlacement, number> = {
  quiz: 0,
  sessionEnd: 12 * 60 * 60 * 1000, // 12시간
};

// placement -> 마지막 표시 시각(ms). 그 외 키는 무시한다.
export type AdFrequencyState = Partial<Record<InterstitialPlacement, number>>;

/**
 * 지금 이 placement의 인터스티셜을 보여줘도 되는지 판단한다 (순수 함수).
 *
 * - 최근 어떤 placement든 인터스티셜을 3분 이내에 보여줬으면 막는다.
 * - 해당 placement의 추가 캡(예: sessionEnd 12시간) 이내면 막는다.
 */
export const canShowInterstitial = (
  state: AdFrequencyState,
  placement: InterstitialPlacement,
  now: number
): boolean => {
  // 전역 간격: 가장 최근에 표시된 인터스티셜 기준.
  const lastAnyShown = Object.values(state).reduce<number>(
    (max, value) => (typeof value === "number" && value > max ? value : max),
    0
  );
  if (lastAnyShown > 0 && now - lastAnyShown < GLOBAL_MIN_INTERVAL_MS) {
    return false;
  }

  // placement별 추가 캡.
  const placementCap = PLACEMENT_CAP_MS[placement];
  const lastForPlacement = state[placement];
  if (
    placementCap > 0 &&
    typeof lastForPlacement === "number" &&
    now - lastForPlacement < placementCap
  ) {
    return false;
  }

  return true;
};

// --- AsyncStorage ---

export const getAdFrequencyState = async (): Promise<AdFrequencyState> => {
  try {
    const data = await AsyncStorage.getItem(FREQUENCY_KEY);
    return data ? (JSON.parse(data) as AdFrequencyState) : {};
  } catch (error) {
    console.error("Error reading ad frequency state:", error);
    return {};
  }
};

/**
 * 저장된 상태를 읽어 이 placement를 지금 보여줘도 되는지 판단한다.
 * 저장/조회 실패 시 UX를 막지 않도록 보수적으로 true를 반환한다.
 */
export const shouldShowInterstitial = async (
  placement: InterstitialPlacement,
  now: number = Date.now()
): Promise<boolean> => {
  const state = await getAdFrequencyState();
  return canShowInterstitial(state, placement, now);
};

/** 인터스티셜을 실제로 표시한 시각을 기록한다. */
export const recordInterstitialShown = async (
  placement: InterstitialPlacement,
  now: number = Date.now()
): Promise<void> => {
  try {
    const state = await getAdFrequencyState();
    const next: AdFrequencyState = { ...state, [placement]: now };
    await AsyncStorage.setItem(FREQUENCY_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Error recording interstitial shown:", error);
  }
};
