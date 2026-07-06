import React from "react";
import { Platform } from "react-native";

// 앱 안에서 데이터가 바뀔 때(기록 추가, 챌린지 시작/중단, 세션 종료 등)
// 홈 화면 위젯을 즉시 갱신한다. Android 전용이며 다른 플랫폼에서는 no-op.
export const updateSobrietyWidget = async (): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }
  try {
    const { requestWidgetUpdate } = await import("react-native-android-widget");
    const [{ default: SobrietyWidget }, { buildSobrietyWidgetContent }] =
      await Promise.all([
        import("./SobrietyWidget"),
        import("./widgetContent"),
      ]);
    await requestWidgetUpdate({
      widgetName: "SobrietyWidget",
      renderWidget: async () => {
        const content = await buildSobrietyWidgetContent();
        return React.createElement(SobrietyWidget, content);
      },
    });
  } catch (error) {
    console.warn("Widget update skipped:", error);
  }
};
