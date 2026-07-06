import AsyncStorage from "@react-native-async-storage/async-storage";

// 백업에 포함되는 로컬 데이터 키. 새 저장소를 추가하면 여기에도 등록한다.
export const BACKUP_KEYS = [
  "@drink_logs",
  "@calc_history",
  "@content_favorites",
  "@recent_content",
  "@sobriety_challenge",
  "@notification_prefs",
  "@quiz_progress",
  "@session_profile",
] as const;

export const BACKUP_VERSION = 1;

export type BackupPayload = {
  readonly version: number;
  readonly exportedAt: string;
  readonly data: Record<string, unknown>;
};

export const createBackup = async (): Promise<string> => {
  const pairs = await AsyncStorage.multiGet([...BACKUP_KEYS]);
  const data: Record<string, unknown> = {};
  pairs.forEach(([key, value]) => {
    if (value !== null) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload);
};

// 순수 검증 로직: 파싱 성공 시 저장할 [key, json] 쌍을 반환한다.
export const parseBackup = (
  raw: string
): { ok: true; entries: [string, string][] } | { ok: false } => {
  let payload: unknown;
  try {
    payload = JSON.parse(raw.trim());
  } catch {
    return { ok: false };
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as BackupPayload).version !== "number" ||
    typeof (payload as BackupPayload).data !== "object" ||
    (payload as BackupPayload).data === null
  ) {
    return { ok: false };
  }

  const data = (payload as BackupPayload).data as Record<string, unknown>;
  const allowed = new Set<string>(BACKUP_KEYS);
  const entries: [string, string][] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (allowed.has(key) && value !== undefined && value !== null) {
      entries.push([
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      ]);
    }
  });
  if (entries.length === 0) {
    return { ok: false };
  }
  return { ok: true, entries };
};

export const restoreBackup = async (raw: string): Promise<boolean> => {
  const parsed = parseBackup(raw);
  if (!parsed.ok) {
    return false;
  }
  try {
    await AsyncStorage.multiSet(parsed.entries);
    return true;
  } catch (error) {
    console.error("Error restoring backup:", error);
    return false;
  }
};
