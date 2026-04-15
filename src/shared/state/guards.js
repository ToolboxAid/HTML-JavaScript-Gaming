/*
Toolbox Aid
David Quesenberry
04/14/2026
guards.js
*/
import { isFunction, isRecord } from "../types/index.js";
import { SHARED_STATE_KEYS } from "./contracts.js";

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
