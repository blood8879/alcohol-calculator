import type { StoredSessionProfile } from "./engagement/drinkingSessionStorage";

// 20회차: GA에서 계산기를 연 사람의 32%가 아무것도 입력하지 않고 닫았다(열림 122 → 첫 입력 83).
// BAC 계산기는 체중·성별을 매번 다시 넣어야 했는데, 라이브 세션이 검증된(30~250kg) 프로필을 이미 저장한다.
// 그 값을 미리 채워 첫 입력 부담을 줄인다. 필드 순서: [체중, 성별(0=남·1=여), 잔 수, 경과 시간].
export type CalculatorInitialValues = readonly (number | undefined)[];

export const bacInitialValuesFromProfile = (
  profile: StoredSessionProfile | null
): CalculatorInitialValues | undefined => {
  if (!profile) return undefined;
  return [profile.weightKg ?? undefined, profile.gender === "female" ? 1 : 0, undefined, undefined];
};
