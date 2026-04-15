/*
Toolbox Aid
David Quesenberry
04/14/2026
sharedStateContracts.js
*/
export const SHARED_PROMOTION_CONTRACT_ID = "toolbox.shared.state.promotion";
export const SHARED_PROMOTION_CONTRACT_VERSION = "1.0.0";

export const SHARED_PROMOTION_MODES = Object.freeze({
  PASSIVE: "passive",
  AUTHORITATIVE: "authoritative",
});

export const SHARED_STATE_KEYS = Object.freeze({
  PROMOTED: "promoted",
  STABLE_FRAMES: "stableFrames",
  STABILITY_WINDOW_FRAMES: "stabilityWindowFrames",
  LAST_REASON: "lastReason",
  LAST_EVALUATION: "lastEvaluation",
  STATUS: "status",
});

export function isSharedPromotionMode(value) {
  return value === SHARED_PROMOTION_MODES.PASSIVE || value === SHARED_PROMOTION_MODES.AUTHORITATIVE;
}
