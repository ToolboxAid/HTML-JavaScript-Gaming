/*
Toolbox Aid
David Quesenberry
04/14/2026
guards.js
*/
import { isRecord } from "../object/objects.js";
import { isFunction } from "../types/typeGuards.js";
import { SHARED_STATE_KEYS } from "../contracts/sharedStateContracts.js";

export function isStateContainer(source) {
  return isRecord(source) && isFunction(source.getState);
}

export function readState(source, fallback = null) {
  if (!isStateContainer(source)) {
    return fallback;
  }
  const state = source.getState();
  return isRecord(state) ? state : fallback;
}

export function isPromotionStateSnapshot(value) {
  if (!isRecord(value)) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(value, SHARED_STATE_KEYS.PROMOTED)
    && Object.prototype.hasOwnProperty.call(value, SHARED_STATE_KEYS.STABLE_FRAMES)
    && Object.prototype.hasOwnProperty.call(value, SHARED_STATE_KEYS.STABILITY_WINDOW_FRAMES);
}
