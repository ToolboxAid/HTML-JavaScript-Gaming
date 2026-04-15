/*
Toolbox Aid
David Quesenberry
04/14/2026
normalization.js
*/
import { normalizeRecord } from "../data/index.js";
import { isBoolean, isNonEmptyString } from "../types/index.js";
import { SHARED_PROMOTION_MODES } from "./contracts.js";
import { createPromotionStateSnapshot } from "./createPromotionStateSnapshot.js";

function normalizeMode(lastEvaluation, promoted) {
  const mode = isNonEmptyString(lastEvaluation?.mode) ? lastEvaluation.mode : "";
  if (mode) {
    return mode;
  }
  return promoted ? SHARED_PROMOTION_MODES.AUTHORITATIVE : SHARED_PROMOTION_MODES.PASSIVE;
}

export function normalizePromotionStateInput(input = {}) {
  const source = normalizeRecord(input);
  const promoted = isBoolean(source.promoted) ? source.promoted : false;
  const stableFrames = Number.isFinite(source.stableFrames) ? source.stableFrames : 0;
  const stabilityWindowFrames = Number.isFinite(source.stabilityWindowFrames) ? source.stabilityWindowFrames : 0;
  const lastReason = isNonEmptyString(source.lastReason) ? source.lastReason : "";
  const lastEvaluation = normalizeRecord(source.lastEvaluation, null);
  const handoff = normalizeRecord(source.handoff, null);

  return {
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation,
    handoff,
    mode: normalizeMode(lastEvaluation, promoted),
  };
}

export function createNormalizedPromotionSnapshot(input = {}) {
  const normalized = normalizePromotionStateInput(input);
  return createPromotionStateSnapshot({
    promoted: normalized.promoted,
    stableFrames: normalized.stableFrames,
    stabilityWindowFrames: normalized.stabilityWindowFrames,
    lastReason: normalized.lastReason,
    lastEvaluation: normalized.lastEvaluation
      ? { ...normalized.lastEvaluation, mode: normalized.mode }
      : { mode: normalized.mode },
    handoff: normalized.handoff,
  });
}
