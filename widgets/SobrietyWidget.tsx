import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

// 홈 화면 위젯 UI. NativeWind가 아닌 위젯 전용 style prop만 사용해야 한다.
export type SobrietyWidgetContent = {
  readonly title: string;
  readonly mainValue: string;
  readonly subtitle: string;
  readonly footer: string;
};

export default function SobrietyWidget({
  title,
  mainValue,
  subtitle,
  footer,
}: SobrietyWidgetContent) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#111827",
        borderRadius: 16,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 16,
      }}
    >
      <TextWidget
        text={title}
        style={{ fontSize: 12, color: "#4ade80", fontWeight: "bold" }}
      />
      <TextWidget
        text={mainValue}
        style={{
          fontSize: 28,
          color: "#ffffff",
          fontWeight: "bold",
          marginTop: 4,
        }}
      />
      <TextWidget
        text={subtitle}
        style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
      />
      {footer !== "" && (
        <TextWidget
          text={footer}
          style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}
        />
      )}
    </FlexWidget>
  );
}
