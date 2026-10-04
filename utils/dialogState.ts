/**
 * 12회차 — 공통 확인 다이얼로그·토스트 상태 (명세서 §2.5).
 * UI와 분리된 순수 리듀서. 다이얼로그는 한 번에 하나, 토스트도 한 번에 하나만 보인다.
 * id로 열림/닫힘을 맞춰서, 늦게 도착한 닫기(이전 토스트의 타이머 등)가 새 항목을 지우지 않게 한다.
 */

export type ToastVariant = "error" | "success" | "info";

export type ConfirmOptions = {
  readonly title: string;
  readonly message?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  // true면 확인 버튼이 빨강(파괴적 액션) 채움이 된다.
  readonly destructive?: boolean;
};

export type ToastOptions = {
  readonly message: string;
  readonly variant?: ToastVariant;
};

export type ConfirmEntry = {
  readonly id: number;
  readonly options: ConfirmOptions;
};

export type ToastEntry = {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
};

export type DialogState = {
  readonly confirm: ConfirmEntry | null;
  readonly toast: ToastEntry | null;
};

export type DialogAction =
  | { readonly type: "confirm/open"; readonly id: number; readonly options: ConfirmOptions }
  | { readonly type: "confirm/close"; readonly id: number }
  | { readonly type: "toast/show"; readonly id: number; readonly options: ToastOptions }
  | { readonly type: "toast/hide"; readonly id: number };

export const TOAST_DURATION_MS = 3000;

export const initialDialogState: DialogState = { confirm: null, toast: null };

export function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "confirm/open":
      return { ...state, confirm: { id: action.id, options: action.options } };
    case "confirm/close":
      return state.confirm?.id === action.id ? { ...state, confirm: null } : state;
    case "toast/show":
      return {
        ...state,
        toast: {
          id: action.id,
          message: action.options.message,
          variant: action.options.variant ?? "info",
        },
      };
    case "toast/hide":
      return state.toast?.id === action.id ? { ...state, toast: null } : state;
    default:
      return state;
  }
}
