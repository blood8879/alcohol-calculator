import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { SessionRecord } from "../utils/engagement/sessionHistory";
import { formatStandardDrinks } from "../utils/alcoholConstants";

// 세션 요약 공유용 카드. react-native-view-shot으로 캡처하므로 배경을 명시적으로 지정한다.
// 앱 다크테마(gray-900 배경, green 강조)와 일관되게 구성.
interface SessionShareCardProps {
  record: SessionRecord;
}

const formatDate = (ms: number): string =>
  new Date(ms).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SessionShareCard = ({ record }: SessionShareCardProps) => {
  const { t } = useTranslation();

  return (
    <View style={{ backgroundColor: "#111827", padding: 24, width: 340 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 40 }}>🍻</Text>
        <Text
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 6,
          }}
        >
          {t("sessionHistory.shareTitle")}
        </Text>
        <Text style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>
          {formatDate(record.startedAt)} · {formatTime(record.startedAt)} –{" "}
          {formatTime(record.endedAt)}
        </Text>
      </View>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={{ color: "#9ca3af", fontSize: 12 }}>
          {t("sessionHistory.peakBac")}
        </Text>
        <Text style={{ color: "#4ade80", fontSize: 44, fontWeight: "800" }}>
          {record.peakBac.toFixed(3)}%
        </Text>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700" }}>
            {formatStandardDrinks(record.totalStandardDrinks)}
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>
            {t("sessionHistory.standardDrinks")}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700" }}>
            {record.totalCalories}
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>
            kcal
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700" }}>
            {record.soberAt ? formatTime(record.soberAt) : "—"}
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>
            {t("sessionHistory.soberAt")}
          </Text>
        </View>
      </View>

      <Text style={{ color: "#8b93a1", fontSize: 10, textAlign: "center" }}>
        {t("sessionHistory.shareFooter")}
      </Text>
    </View>
  );
};

export default SessionShareCard;
