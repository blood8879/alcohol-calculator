import { parseBackup } from "../utils/backupUtils";

describe("backup parsing", () => {
  it("accepts a valid backup and keeps only known keys", () => {
    const raw = JSON.stringify({
      version: 1,
      exportedAt: "2026-07-06T00:00:00.000Z",
      data: {
        "@drink_logs": [{ id: "a", name: "소주", volume: 360 }],
        "@unknown_key": { evil: true },
      },
    });

    const result = parseBackup(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entries.map(([key]) => key)).toEqual(["@drink_logs"]);
      expect(JSON.parse(result.entries[0][1])).toEqual([
        { id: "a", name: "소주", volume: 360 },
      ]);
    }
  });

  it("rejects invalid json and malformed payloads", () => {
    expect(parseBackup("not json").ok).toBe(false);
    expect(parseBackup("{}").ok).toBe(false);
    expect(parseBackup(JSON.stringify({ version: 1, data: {} })).ok).toBe(false);
    expect(
      parseBackup(JSON.stringify({ version: 1, data: { "@unknown": 1 } })).ok
    ).toBe(false);
  });
});
