// 체중 입력 공용 검증(16회차). BAC(Widmark)는 체중에 반비례하므로 오타 체중(예: 70→7070)이
// 통과하면 위험한 음주량이 "안전 범위"로 표시된다. 세션·BAC 계산기·회복 화면이 모두 이 검증을 쓴다.
//
// 범위 근거: 앱 타깃은 성인 음주자(명세서 §1). 30kg 미만·250kg 초과 성인은 극히 드물고,
// 이 범위 밖 값은 거의 확실히 오타(자릿수 누락·중복 입력)다. 경계값(30, 250)은 허용한다.
export const MIN_BODY_WEIGHT_KG = 30;
export const MAX_BODY_WEIGHT_KG = 250;

export type BodyWeightError = "empty" | "not_number" | "non_positive" | "out_of_range";

export type BodyWeightValidation =
  | { readonly ok: true; readonly weightKg: number }
  | { readonly ok: false; readonly reason: BodyWeightError };

/** 체중(kg) 입력값을 검증한다. 문자열(입력 칸 원문) 또는 숫자를 받는다. */
export const validateBodyWeight = (input: string | number | null | undefined): BodyWeightValidation => {
  if (input === null || input === undefined) return { ok: false, reason: "empty" };
  if (typeof input === "string" && input.trim() === "") return { ok: false, reason: "empty" };
  // 일부 로캘 숫자 키보드는 소수점으로 쉼표를 낸다("70,5") → 점으로 정규화.
  const value = typeof input === "number" ? input : Number(input.trim().replace(",", "."));
  if (!Number.isFinite(value)) return { ok: false, reason: "not_number" };
  if (value <= 0) return { ok: false, reason: "non_positive" };
  if (value < MIN_BODY_WEIGHT_KG || value > MAX_BODY_WEIGHT_KG) {
    return { ok: false, reason: "out_of_range" };
  }
  return { ok: true, weightKg: value };
};

export const isValidBodyWeight = (input: string | number | null | undefined): boolean =>
  validateBodyWeight(input).ok;
