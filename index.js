import { Platform } from "react-native";

// 앱 본체는 expo-router 엔트리를 그대로 사용하고,
// Android에서만 홈 위젯 헤드리스 태스크 핸들러를 함께 등록한다.
import "expo-router/entry";

if (Platform.OS === "android") {
  const {
    registerWidgetTaskHandler,
  } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./widgets/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}
