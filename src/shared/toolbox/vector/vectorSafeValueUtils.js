import { trimSafe } from "../../string/strings.js";

export function sanitizeVectorText(value, fallback = "") {
  const text = trimSafe(value);
  return text || fallback;
}
