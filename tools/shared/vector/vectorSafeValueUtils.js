import { trimSafe } from "../../../src/shared/utils/stringUtils.js";

export function sanitizeVectorText(value, fallback = "") {
  const text = trimSafe(value);
  return text || fallback;
}
