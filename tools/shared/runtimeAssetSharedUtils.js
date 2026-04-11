import { trimSafe } from "../../src/shared/utils/stringUtils.js";

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
