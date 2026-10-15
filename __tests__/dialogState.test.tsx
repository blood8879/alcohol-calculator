/**
 * 12회차 — 공통 확인 다이얼로그·토스트 (명세서 §2.5).
 */
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import {
  dialogReducer,
  initialDialogState,
  TOAST_DURATION_MS,
  type DialogState,
} from "../utils/dialogState";
import { DialogProvider, useDialog } from "../components/ui/DialogProvider";

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));

// 첫 렌더 테스트가 렌더러·Modal 모듈 로딩(콜드 스타트)을 떠안아 전체 병렬 실행·부하 시 기본 5초를 넘긴다(단독 실행은 통과).
jest.setTimeout(20000);

describe("dialogReducer", () => {
  it("opens and closes a confirm by id", () => {
    const opened = dialogReducer(initialDialogState, {
      type: "confirm/open",
      id: 1,
      options: { title: "삭제?", destructive: true },
    });
    expect(opened.confirm).toEqual({ id: 1, options: { title: "삭제?", destructive: true } });
    expect(dialogReducer(opened, { type: "confirm/close", id: 1 }).confirm).toBeNull();
  });

  it("ignores a stale confirm close for a replaced dialog", () => {
    let state: DialogState = dialogReducer(initialDialogState, {
      type: "confirm/open",
      id: 1,
      options: { title: "A" },
    });
    state = dialogReducer(state, { type: "confirm/open", id: 2, options: { title: "B" } });
    const after = dialogReducer(state, { type: "confirm/close", id: 1 });
    expect(after).toBe(state);
    expect(after.confirm?.options.title).toBe("B");
  });

  it("shows a toast with default info variant and replaces the previous toast", () => {
    let state = dialogReducer(initialDialogState, { type: "toast/show", id: 1, options: { message: "a" } });
    expect(state.toast).toEqual({ id: 1, message: "a", variant: "info" });
    state = dialogReducer(state, { type: "toast/show", id: 2, options: { message: "b", variant: "error" } });
    expect(state.toast).toEqual({ id: 2, message: "b", variant: "error" });
  });

  it("does not let an old toast's timer hide a newer toast", () => {
    let state = dialogReducer(initialDialogState, { type: "toast/show", id: 1, options: { message: "a" } });
    state = dialogReducer(state, { type: "toast/show", id: 2, options: { message: "b" } });
    expect(dialogReducer(state, { type: "toast/hide", id: 1 })).toBe(state);
    expect(dialogReducer(state, { type: "toast/hide", id: 2 }).toast).toBeNull();
  });

  it("keeps confirm and toast independent", () => {
    let state = dialogReducer(initialDialogState, { type: "confirm/open", id: 1, options: { title: "A" } });
    state = dialogReducer(state, { type: "toast/show", id: 2, options: { message: "t" } });
    state = dialogReducer(state, { type: "toast/hide", id: 2 });
    expect(state.confirm?.id).toBe(1);
  });
});

function Harness({ onResult }: { readonly onResult: (value: boolean) => void }) {
  const { confirm, toast } = useDialog();
  return (
    <>
      <TouchableOpacity
        onPress={async () => {
          onResult(
            await confirm({
              title: "기록 삭제",
              message: "정말 삭제할까요?",
              confirmLabel: "삭제",
              cancelLabel: "취소",
              destructive: true,
            })
          );
        }}
      >
        <Text>open-confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toast({ message: "모든 값은 0보다 커야 합니다", variant: "error" })}>
        <Text>open-toast</Text>
      </TouchableOpacity>
    </>
  );
}

describe("DialogProvider", () => {
  it("resolves confirm(true) when the confirm button is pressed", async () => {
    const onResult = jest.fn();
    render(
      <DialogProvider>
        <Harness onResult={onResult} />
      </DialogProvider>
    );
    fireEvent.press(screen.getByText("open-confirm"));
    expect(screen.getByText("기록 삭제")).toBeTruthy();
    expect(screen.getByText("정말 삭제할까요?")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("삭제"));
    });
    expect(onResult).toHaveBeenCalledWith(true);
  });

  it("resolves confirm(false) when cancelled", async () => {
    const onResult = jest.fn();
    render(
      <DialogProvider>
        <Harness onResult={onResult} />
      </DialogProvider>
    );
    fireEvent.press(screen.getByText("open-confirm"));
    await act(async () => {
      fireEvent.press(screen.getByLabelText("취소"));
    });
    expect(onResult).toHaveBeenCalledWith(false);
  });

  it("cancels a pending confirm when a new one replaces it", async () => {
    const onResult = jest.fn();
    render(
      <DialogProvider>
        <Harness onResult={onResult} />
      </DialogProvider>
    );
    fireEvent.press(screen.getByText("open-confirm"));
    await act(async () => {
      fireEvent.press(screen.getByText("open-confirm"));
    });
    expect(onResult).toHaveBeenCalledWith(false);
    await act(async () => {
      fireEvent.press(screen.getByLabelText("삭제"));
    });
    expect(onResult).toHaveBeenLastCalledWith(true);
  });

  it("shows an error toast with the exact message and hides it automatically", () => {
    jest.useFakeTimers();
    try {
      render(
        <DialogProvider>
          <Harness onResult={jest.fn()} />
        </DialogProvider>
      );
      fireEvent.press(screen.getByText("open-toast"));
      expect(screen.getByText("모든 값은 0보다 커야 합니다")).toBeTruthy();
      // 색·아이콘만이 아니라 "오류" 접두어도 스크린리더에 읽힌다(i18n 목은 키를 그대로 반환).
      expect(screen.getByLabelText("common.error: 모든 값은 0보다 커야 합니다")).toBeTruthy();
      act(() => {
        jest.advanceTimersByTime(TOAST_DURATION_MS);
      });
      expect(screen.queryByText("모든 값은 0보다 커야 합니다")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("throws a clear error when useDialog is used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Harness onResult={jest.fn()} />)).toThrow(/DialogProvider/);
    spy.mockRestore();
  });
});

describe("no OS Alert left in app UI", () => {
  // 12회차: OS 기본 Alert는 다크 앱 위 흰 팝업이고 react-native-web에서는 동작하지 않는다.
  it("app/ and components/ do not call Alert.alert", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path") as typeof import("path");
    const root = path.resolve(__dirname, "..");
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : []
      );
    const offenders = ["app", "components", "hooks"]
      .flatMap((d) => walk(path.join(root, d)))
      .filter((f) => /\bAlert\.alert\(/.test(fs.readFileSync(f, "utf8")))
      .map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });
});
