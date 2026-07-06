export type TodayHubCardKind =
  | "daily-guide"
  | "daily-quiz"
  | "daily-recipe"
  | "recommender"
  | "tracker-insight";

/**
 * Encyclopedia entries (all have a deep-dive guide) that the daily guide card
 * rotates through by day index, so "today's guide" actually changes daily.
 */
export const dailyGuideTargets = [
  "/(tabs)/explore?section=encyclopedia&guide=soju",
  "/(tabs)/explore?section=encyclopedia&guide=beer",
  "/(tabs)/explore?section=encyclopedia&guide=red-wine",
  "/(tabs)/explore?section=encyclopedia&guide=whiskey",
  "/(tabs)/explore?section=encyclopedia&guide=makgeolli",
  "/(tabs)/explore?section=encyclopedia&guide=gin",
  "/(tabs)/explore?section=encyclopedia&guide=vodka",
  "/(tabs)/explore?section=encyclopedia&guide=sake",
  "/(tabs)/explore?section=encyclopedia&guide=cheongju",
  "/(tabs)/explore?section=encyclopedia&guide=vermouth",
] as const;

export type TodayHubCard = {
  readonly kind: TodayHubCardKind;
  readonly target:
    | "/(tabs)/explore?section=encyclopedia"
    | (typeof dailyGuideTargets)[number]
    | "/(tabs)/quiz"
    | "/(tabs)/explore?section=recipes"
    | "/(tabs)/tracker";
};

export type TodayHub = {
  readonly cards: readonly TodayHubCard[];
};

export type TodayHubInput = {
  readonly date: Date;
  readonly trackerInsightCount: number;
};

const DAY_MS = 86_400_000;

const dayIndex = (date: Date): number => Math.floor(date.getTime() / DAY_MS);

export const getDailyQuizQuestionIds = (
  date: Date,
  questionIds: readonly string[],
  count = 5
): readonly string[] => {
  if (questionIds.length === 0) {
    return [];
  }

  const offset = dayIndex(date) % questionIds.length;
  return Array.from({ length: Math.min(count, questionIds.length) }, (_, index) => {
    const questionIndex = (offset + index) % questionIds.length;
    return questionIds[questionIndex] ?? questionIds[0];
  });
};

export const getDailyGuideTarget = (
  date: Date
): (typeof dailyGuideTargets)[number] =>
  dailyGuideTargets[dayIndex(date) % dailyGuideTargets.length] ?? dailyGuideTargets[0];

export const buildTodayHub = (input: TodayHubInput): TodayHub => ({
  cards: [
    { kind: "daily-quiz", target: "/(tabs)/quiz" },
    { kind: "daily-guide", target: getDailyGuideTarget(input.date) },
    { kind: "daily-recipe", target: "/(tabs)/explore?section=recipes" },
    { kind: "tracker-insight", target: "/(tabs)/tracker" },
    { kind: "recommender", target: "/(tabs)/explore?section=recipes" },
  ],
});
