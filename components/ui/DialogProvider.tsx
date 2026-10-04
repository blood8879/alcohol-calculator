import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "./Toast";
import {
  dialogReducer,
  initialDialogState,
  type ConfirmOptions,
  type ToastOptions,
} from "../../utils/dialogState";

export type DialogApi = {
  // 사용자가 확인을 누르면 true, 취소·뒤로가기·바깥 탭이면 false.
  readonly confirm: (options: ConfirmOptions) => Promise<boolean>;
  readonly toast: (options: ToastOptions) => void;
};

export type DialogController = DialogApi & {
  // 다이얼로그·토스트를 실제로 그리는 요소. 이 요소를 렌더한 위치(트리)에 쌓인다.
  readonly host: ReactElement;
};

/**
 * 확인 다이얼로그·토스트 상태 + 렌더 요소를 만드는 훅.
 * 루트에서는 DialogProvider가 쓰고, 이미 열린 모달(바텀시트) 안에서 띄워야 하는 화면은
 * 이 훅을 직접 써서 `host`를 그 모달의 children 안에 렌더한다.
 * (형제 RN Modal 두 개를 동시에 띄우는 것은 iOS에서 보장되지 않고, 루트 토스트는 모달 아래에 깔리기 때문)
 */
export function useDialogController(): DialogController {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(dialogReducer, initialDialogState);
  const nextIdRef = useRef(0);
  const resolversRef = useRef(new Map<number, (result: boolean) => void>());
  // 닫힘 페이드 동안 내용이 비지 않도록 마지막 옵션을 기억한다.
  const lastConfirmRef = useRef<ConfirmOptions | null>(null);

  const settle = useCallback((id: number, result: boolean) => {
    const resolve = resolversRef.current.get(id);
    resolversRef.current.delete(id);
    dispatch({ type: "confirm/close", id });
    resolve?.(result);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    // 이미 떠 있는 다이얼로그가 있으면 취소로 정리하고 새 다이얼로그로 교체한다.
    for (const [pendingId, resolve] of resolversRef.current) {
      resolversRef.current.delete(pendingId);
      resolve(false);
    }
    nextIdRef.current += 1;
    const id = nextIdRef.current;
    return new Promise<boolean>((resolve) => {
      resolversRef.current.set(id, resolve);
      dispatch({ type: "confirm/open", id, options });
    });
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    nextIdRef.current += 1;
    dispatch({ type: "toast/show", id: nextIdRef.current, options });
  }, []);

  useEffect(() => {
    const resolvers = resolversRef.current;
    return () => {
      // 언마운트 시 대기 중인 confirm은 취소로 끝낸다(호출부 await가 영원히 걸리지 않게).
      for (const resolve of resolvers.values()) resolve(false);
      resolvers.clear();
    };
  }, []);

  const confirmEntry = state.confirm;
  if (confirmEntry) lastConfirmRef.current = confirmEntry.options;
  const shown = confirmEntry?.options ?? lastConfirmRef.current;
  const toastEntry = state.toast;

  const hideToast = useCallback(() => {
    if (toastEntry) dispatch({ type: "toast/hide", id: toastEntry.id });
  }, [toastEntry]);

  const toastLabel = toastEntry
    ? t(
        toastEntry.variant === "error"
          ? "common.error"
          : toastEntry.variant === "success"
            ? "common.success"
            : "common.info"
      )
    : "";

  const host = (
    <>
      {shown ? (
        <ConfirmDialog
          visible={confirmEntry !== null}
          title={shown.title}
          message={shown.message}
          confirmLabel={shown.confirmLabel ?? t("common.confirm")}
          cancelLabel={shown.cancelLabel ?? t("common.cancel")}
          destructive={shown.destructive}
          onConfirm={() => confirmEntry && settle(confirmEntry.id, true)}
          onCancel={() => confirmEntry && settle(confirmEntry.id, false)}
        />
      ) : null}
      <Toast
        visible={toastEntry !== null}
        message={toastEntry?.message ?? ""}
        variant={toastEntry?.variant ?? "info"}
        variantLabel={toastLabel}
        onHide={hideToast}
        resetKey={toastEntry?.id}
      />
    </>
  );

  return { confirm, toast, host };
}

const DialogContext = createContext<DialogApi | null>(null);

// 앱 루트에 한 번 둔다. 하위 화면은 useDialog()로 confirm/toast를 호출한다.
export function DialogProvider({ children }: { readonly children: ReactNode }) {
  const { confirm, toast, host } = useDialogController();
  const api = useMemo<DialogApi>(() => ({ confirm, toast }), [confirm, toast]);
  return (
    <DialogContext.Provider value={api}>
      {children}
      {host}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogApi {
  const api = useContext(DialogContext);
  if (!api) throw new Error("useDialog must be used within <DialogProvider>");
  return api;
}
