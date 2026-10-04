// Android 키보드 회피용 순수 계산.
// 모달 창이 키보드만큼 리사이즈된 뒤, 줄어든 뷰포트 안에 [계산하기]가 들어오도록 스크롤 위치를 정한다.

export const KEYBOARD_REVEAL_MARGIN = 16;

type RevealInput = {
  // ScrollView 콘텐츠 기준 대상(버튼)의 y·높이
  readonly targetY: number;
  readonly targetHeight: number;
  // 키보드로 리사이즈된 뒤의 ScrollView 뷰포트 높이
  readonly viewportHeight: number;
  readonly currentOffset: number;
  readonly margin?: number;
};

// 대상 하단이 뷰포트 아래로 잘리면 필요한 스크롤 y를, 이미 보이면 null을 돌려준다.
// 아래로만 스크롤한다(사용자가 이미 더 내려 본 상태를 되돌리지 않음).
export const computeRevealScrollOffset = ({
  targetY,
  targetHeight,
  viewportHeight,
  currentOffset,
  margin = KEYBOARD_REVEAL_MARGIN,
}: RevealInput): number | null => {
  if (viewportHeight <= 0 || targetHeight <= 0) return null;
  const needed = Math.max(0, targetY + targetHeight + margin - viewportHeight);
  return needed > currentOffset ? needed : null;
};
