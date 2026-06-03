import { trimSafe } from "../../../src/shared/string/strings.js";

export function sanitizeVectorText(value, fallback = "") {
  const text = trimSafe(value);
  return text || fallback;
}
