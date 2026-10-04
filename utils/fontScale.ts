/**
 * 시스템 글꼴 확대(최대 200%) 대응 상한값 — 명세서 §4.7.
 *
 * 본문 텍스트에는 적용하지 않는다(접근성상 계속 확대돼야 함).
 * 크기가 고정된 컨테이너(탭바·그리드 타일)나 이미 충분히 큰 초대형 수치에만
 * `maxFontSizeMultiplier`로 상한을 둬 잘림·숫자 중간 줄바꿈을 막는다.
 */
export const FONT_SCALE_CAP = {
  /** 하단 탭바 라벨: 탭바 높이가 고정이라 이 이상 키우면 아래가 잘린다. */
  tabLabel: 1.3,
  /** 폭·높이가 촘촘한 셀 라벨(계산기 그리드 타일·날짜 스트립·퀴즈 보기 배지·BAC 눈금). */
  compactLabel: 1.5,
  /** 히어로/디스플레이 수치(BAC·D+n·점수 등): 기본 크기가 이미 커서 1.3배면 충분. */
  display: 1.3,
} as const;

/** 초대형 수치가 카드 폭을 넘으면 줄바꿈 대신 축소되도록 하는 공통 Text props. */
export const DISPLAY_NUMBER_TEXT_PROPS = {
  numberOfLines: 1,
  adjustsFontSizeToFit: true,
  minimumFontScale: 0.5,
  maxFontSizeMultiplier: FONT_SCALE_CAP.display,
} as const;

/**
 * 이 배율을 넘으면 "가로 한 줄에 제목+버튼"을 포기하고 세로로 쌓는다(명세서 §4.7).
 * 1.3 = Android "가장 크게"(1.3) 까지는 기존 한 줄 레이아웃 유지, 그 이상(1.5~2.0)부터 스택.
 */
export const STACKED_HEADER_FONT_SCALE = 1.3;

/** 현재 시스템 글꼴 배율이 헤더를 세로로 쌓아야 할 만큼 큰지. */
export function shouldStackHeader(fontScale: number): boolean {
  return fontScale > STACKED_HEADER_FONT_SCALE;
}
