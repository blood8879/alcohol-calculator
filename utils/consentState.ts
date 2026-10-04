export type ConsentSnapshot = {
  readonly canRequestAds: boolean;
  readonly privacyOptionsRequired: boolean;
  readonly updating: boolean;
};

type Listener = () => void;

let snapshot: ConsentSnapshot = {
  canRequestAds: false,
  privacyOptionsRequired: false,
  updating: false,
};
const listeners = new Set<Listener>();

export const getConsentSnapshot = (): ConsentSnapshot => snapshot;

export const subscribeConsentState = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const updateConsentState = (next: ConsentSnapshot): void => {
  if (
    snapshot.canRequestAds === next.canRequestAds &&
    snapshot.privacyOptionsRequired === next.privacyOptionsRequired &&
    snapshot.updating === next.updating
  ) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
};
