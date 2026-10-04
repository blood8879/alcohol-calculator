export type AnalyticsParams = Record<string, string | number | boolean>;

type EventSink = (name: string, params: AnalyticsParams) => void;
type PermissionListener = () => void;

const SCREEN_BY_ROUTE: Readonly<Record<string, string>> = {
  "/": "home",
  "/(tabs)": "home",
  "/(tabs)/index": "home",
  "/(tabs)/explore": "explore",
  "/explore": "explore",
  "/(tabs)/quiz": "quiz",
  "/quiz": "quiz",
  "/(tabs)/tracker": "tracker",
  "/tracker": "tracker",
  "/(tabs)/more": "more",
  "/more": "more",
  "/(tabs)/more/index": "more",
  "/(tabs)/more/history": "history",
  "/more/history": "history",
  "/(tabs)/more/recovery": "recovery",
  "/more/recovery": "recovery",
  "/(tabs)/more/sessions": "sessions",
  "/more/sessions": "sessions",
  "/(tabs)/more/settings": "settings",
  "/more/settings": "settings",
  "/session": "session",
  "/+not-found": "not_found",
} as const;

let permitted = false;
const listeners = new Set<PermissionListener>();

export const analyticsPermission = (): boolean => permitted;

export const setAnalyticsPermission = (enabled: boolean): void => {
  if (permitted === enabled) return;
  permitted = enabled;
  listeners.forEach((listener) => listener());
};

export const subscribeAnalyticsPermission = (listener: PermissionListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const normalizeScreen = (route: string): string | null => {
  const cleanRoute = route.split(/[?#]/, 1)[0];
  return SCREEN_BY_ROUTE[cleanRoute] ?? null;
};

const isSafeString = (value: string): boolean =>
  /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(value);

export const sanitizeAnalyticsParams = (
  params?: AnalyticsParams
): AnalyticsParams => {
  const safe: AnalyticsParams = { analytics_version: 2 };
  if (!params) return safe;

  for (const [key, value] of Object.entries(params)) {
    if (Object.keys(safe).length >= 25) break;
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(key) || key === "analytics_version") continue;
    if (typeof value === "string") {
      if (isSafeString(value)) safe[key] = value;
    } else if (typeof value === "number") {
      if (Number.isFinite(value) && value >= 0 && value <= 1_000_000) safe[key] = value;
    } else if (typeof value === "boolean") {
      safe[key] = value ? 1 : 0;
    }
  }
  return safe;
};

export const emitAnalyticsEvent = (
  name: string,
  params: AnalyticsParams | undefined,
  sink: EventSink
): void => {
  if (!permitted || !/^[a-z][a-z0-9_]{0,39}$/.test(name)) return;
  sink(name, sanitizeAnalyticsParams(params));
};
