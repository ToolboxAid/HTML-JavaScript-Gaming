/*
Toolbox Aid
David Quesenberry
04/14/2026
normalization.js
*/
import { isRecord } from "../types/typeGuards.js";

export function normalizeRecord(value, fallback = {}) {
  if (isRecord(value)) {
    return value;
  }
  if (isRecord(fallback)) {
    return { ...fallback };
  }
  return fallback;
}

export function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeRecordArray(value) {
  return normalizeArray(value).map((entry) => normalizeRecord(entry));
}
