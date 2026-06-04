import { trimSafe } from "../string/strings.js";

export function sanitizeRuntimeText(value, fallback = "") {
  const text = trimSafe(value);
  return text || fallback;
}

export function createRuntimeReport(level, code, message) {
  return {
    level: sanitizeRuntimeText(level, "info"),
    code: sanitizeRuntimeText(code),
    message: sanitizeRuntimeText(message)
  };
}
