import { getDrinkLogs, getWeeklyStats } from "../trackerStorage";
import {
  ChallengeProgress,
  SobrietyChallenge,
  computeChallengeProgress,
  getChallenge,
  toLocalDateString,
} from "./sobrietyChallenge";
import {
  WeeklyGoal,
  WeeklyProgress,
  computeWeeklyProgress,
  getWeeklyGoal,
} from "./weeklyGoal";

// 홈 "이번 주" 요약 타일·세션 상태 카드용 헬퍼(순수 함수 + 저장소 로더).
// 주간 경계·챌린지 규칙은 트래커와 동일한 weeklyGoal/sobrietyChallenge 함수를 그대로 쓴다.

export type ElapsedTime = {
  readonly hours: number;
  readonly minutes: number;
};

// 세션 시작 시각부터 경과한 시간(시·분, 내림). 시계가 뒤로 가도 음수가 되지 않는다.
export const computeElapsedTime = (startedAt: number, now: number): ElapsedTime => {
  const totalMinutes = Math.max(0, Math.floor((now - startedAt) / 60000));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};

// 챌린지 startDate(yyyy-mm-dd, 로컬)를 로컬 자정 Date로 변환한다.
export const getChallengeStartDate = (challenge: SobrietyChallenge): Date => {
  const [sy, sm, sd] = challenge.startDate
    .split("-")
    .map((n) => parseInt(n, 10));
  const start = new Date(sy, (sm || 1) - 1, sd || 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

export type WeekSummaryInput = {
  // trackerStorage.getWeeklyStats(today).totalDrinks (일요일 시작 주간 경계)
  readonly weekDrinks: number;
  readonly goal: WeeklyGoal | null;
  readonly challenge: SobrietyChallenge | null;
  // 챌린지 시작일~오늘 사이 기록의 로컬 날짜(yyyy-mm-dd)
  readonly challengeDrinkDates: readonly string[];
  readonly today: Date;
};

export type WeekSummary = {
  readonly weekDrinks: number;
  readonly weeklyProgress: WeeklyProgress | null;
  readonly challengeProgress: ChallengeProgress | null;
};

export const deriveWeekSummary = ({
  weekDrinks,
  goal,
  challenge,
  challengeDrinkDates,
  today,
}: WeekSummaryInput): WeekSummary => ({
  weekDrinks: Math.max(0, weekDrinks),
  weeklyProgress: computeWeeklyProgress(goal, weekDrinks),
  challengeProgress: challenge
    ? computeChallengeProgress(challenge, [...challengeDrinkDates], today)
    : null,
});

// 저장소에서 이번 주 잔 수·주간 목표·챌린지를 읽어 요약을 만든다(트래커와 같은 조회 규칙).
export const loadWeekSummary = async (today: Date = new Date()): Promise<WeekSummary> => {
  const [stats, goal, challenge] = await Promise.all([
    getWeeklyStats(today),
    getWeeklyGoal(),
    getChallenge(),
  ]);
  let challengeDrinkDates: string[] = [];
  if (challenge) {
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    const challengeLogs = await getDrinkLogs(getChallengeStartDate(challenge), endOfToday);
    challengeDrinkDates = challengeLogs.map((log) =>
      toLocalDateString(new Date(log.timestamp))
    );
  }
  return deriveWeekSummary({
    weekDrinks: stats.totalDrinks,
    goal,
    challenge,
    challengeDrinkDates,
    today,
  });
};
