import { useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  subscribeConsentState,
} from "../utils/consentState";
import type { ConsentSnapshot } from "../utils/consentState";

const serverSnapshot: ConsentSnapshot = {
  canRequestAds: false,
  privacyOptionsRequired: false,
  updating: false,
};

export const useConsentState = (): ConsentSnapshot =>
  useSyncExternalStore(subscribeConsentState, getConsentSnapshot, () => serverSnapshot);
