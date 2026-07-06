import {
  buildDailyReminderContent,
  buildWeeklySummaryContent,
} from "../utils/notificationUtils";

describe("notification routing", () => {
  it("builds daily reminder content for the Today hub", () => {
    const content = buildDailyReminderContent();

    expect(content.data).toEqual({ route: "/(tabs)" });
  });

  it("builds weekly summary content for the tracker", () => {
    const content = buildWeeklySummaryContent();

    expect(content.data).toEqual({ route: "/(tabs)/tracker" });
  });

  it("builds localized Spanish notification copy", () => {
    const content = buildDailyReminderContent("es");

    expect(content.title).toBe("Guía de alcohol de hoy");
  });
});
