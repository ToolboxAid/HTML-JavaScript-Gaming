import {
  asArray,
  asObject
} from "../inspectors/shared/inspectorUtils.js";

export function toResult(status, title, code, lines, details = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    title,
    code,
    lines: asArray(lines).map((line) => String(line)),
    details: asObject(details)
  };
}

