import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEKLY_GOAL_KEY = '@weekly_goal';

export type WeeklyGoal = {
  weeklyLimitDrinks: number; // 주간 허용 잔 수 (기준: 로그 1건 = 1잔)
  createdAt: string; // ISO timestamp
};

export type WeeklyProgress = {
  limitDrinks: number;
  currentDrinks: number;
  remainingDrinks: number; // 남은 잔 수 (초과 시 0)
  overBy: number; // 초과한 잔 수 (초과하지 않으면 0)
  exceeded: boolean;
  progress: number; // 0~1+ (한도 대비 진행률)
};

export const getWeeklyGoal = async (): Promise<WeeklyGoal | null> => {
  try {
    const data = await AsyncStorage.getItem(WEEKLY_GOAL_KEY);
    return data ? (JSON.parse(data) as WeeklyGoal) : null;
  } catch (error) {
    console.error('Error getting weekly goal:', error);
    return null;
  }
};

export const setWeeklyGoal = async (
  weeklyLimitDrinks: number
): Promise<boolean> => {
  const goal: WeeklyGoal = {
    weeklyLimitDrinks,
    createdAt: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(WEEKLY_GOAL_KEY, JSON.stringify(goal));
    return true;
  } catch (error) {
    console.error('Error setting weekly goal:', error);
    return false;
  }
};

export const clearWeeklyGoal = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(WEEKLY_GOAL_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing weekly goal:', error);
    return false;
  }
};

// 순수 함수: 이번 주 마신 잔수 대비 목표 진행률을 계산한다. 부작용 없음.
// currentDrinks는 trackerStorage.getWeeklyStats(date).totalDrinks와 동일한
// 주간 경계(일요일 시작, 일~토) 집계를 그대로 넘겨받는다.
export const computeWeeklyProgress = (
  goal: WeeklyGoal | null,
  currentDrinks: number
): WeeklyProgress | null => {
  if (!goal || goal.weeklyLimitDrinks <= 0) {
    return null;
  }
  const limitDrinks = goal.weeklyLimitDrinks;
  const drinks = Math.max(0, currentDrinks);
  const remainingDrinks = Math.max(0, limitDrinks - drinks);
  const overBy = Math.max(0, drinks - limitDrinks);
  const exceeded = drinks > limitDrinks;
  const progress = limitDrinks > 0 ? drinks / limitDrinks : 0;

  return {
    limitDrinks,
    currentDrinks: drinks,
    remainingDrinks,
    overBy,
    exceeded,
    progress,
  };
};
