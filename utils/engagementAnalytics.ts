import { logFirebaseEvent } from "./firebase";
import type { QuizMode } from "./analytics";

export type EngagementEventName =
  | "quiz_category_selected" | "quiz_question_answered" | "quiz_abandoned"
  | "quiz_restarted" | "quiz_share_result"
  | "tracker_add_opened" | "tracker_add_mode_selected" | "tracker_add_validation_failed"
  | "tracker_add_saved" | "tracker_add_closed" | "tracker_delete_intent"
  | "tracker_delete_succeeded" | "custom_drink_saved" | "custom_drink_deleted"
  | "session_resumed" | "session_drink_added" | "session_drink_removed"
  | "session_save_succeeded" | "session_discard_intent" | "session_start_validation_failed"
  | "settings_permission_requested" | "settings_permission_outcome"
  | "settings_preference_saved" | "language_changed"
  | "backup_export_outcome" | "backup_restore_outcome"
  | "weekly_goal_cleared" | "challenge_stopped" | "challenge_share_outcome"
  | "session_share_outcome" | "session_record_delete_intent" | "session_record_deleted";

export const trackEngagement = (
  name: EngagementEventName,
  params?: Record<string, string | number | boolean>
): void => logFirebaseEvent(name, params);

export const elapsedBucket = (milliseconds: number): "under_5s" | "5_to_29s" | "30s_plus" => {
  if (milliseconds < 5_000) return "under_5s";
  if (milliseconds < 30_000) return "5_to_29s";
  return "30s_plus";
};

type ActiveQuiz = {
  readonly mode: QuizMode;
  readonly category: string;
  readonly total: number;
  readonly startedAt: number;
  answered: number;
  finished: boolean;
  abandoned: boolean;
};

export const createQuizAnalytics = (now: () => number = Date.now) => {
  let active: ActiveQuiz | null = null;
  return {
    start(mode: QuizMode, category: string, total: number): void {
      active = { mode, category, total, startedAt: now(), answered: 0, finished: false, abandoned: false };
    },
    answer(questionId: string, index: number, correct: boolean): void {
      if (!active || active.finished || index < active.answered) return;
      active.answered = index + 1;
      trackEngagement("quiz_question_answered", {
        mode: active.mode,
        category: active.category,
        question_id: questionId,
        question_index: index + 1,
        correct,
        quiz_elapsed_bucket: elapsedBucket(now() - active.startedAt),
      });
    },
    complete(): void {
      if (active) active.finished = true;
    },
    abandon(reason: "back" | "navigation"): void {
      if (!active || active.finished || active.abandoned) return;
      active.abandoned = true;
      const progressBucket = active.answered === 0 ? "none" : active.answered < active.total / 2 ? "started" : "half_or_more";
      trackEngagement("quiz_abandoned", {
        mode: active.mode, category: active.category, reason, progress_bucket: progressBucket,
      });
    },
    restart(): void {
      if (!active) return;
      trackEngagement("quiz_restarted", { mode: active.mode, category: active.category });
    },
  };
};
