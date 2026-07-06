import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import SobrietyWidget from "./SobrietyWidget";
import { buildSobrietyWidgetContent } from "./widgetContent";

// Android 홈 위젯 갱신 요청(추가/주기 갱신/리사이즈)을 처리하는 헤드리스 태스크.
export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps
): Promise<void> {
  if (props.widgetInfo.widgetName !== "SobrietyWidget") {
    return;
  }
  if (
    props.widgetAction === "WIDGET_ADDED" ||
    props.widgetAction === "WIDGET_UPDATE" ||
    props.widgetAction === "WIDGET_RESIZED" ||
    props.widgetAction === "WIDGET_CLICK"
  ) {
    const content = await buildSobrietyWidgetContent();
    props.renderWidget(<SobrietyWidget {...content} />);
  }
}
