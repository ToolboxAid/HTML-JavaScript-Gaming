import { safeString } from "../projectSystemValueUtils.js";

export const ASSET_ERROR_LEVELS = Object.freeze({
  ERROR: "error",
  WARNING: "warning",
  INFO: "info"
});

function toErrorLevel(value) {
  const level = safeString(value, "").toLowerCase();
  if (level === ASSET_ERROR_LEVELS.WARNING || level === ASSET_ERROR_LEVELS.INFO) {
    return level;
  }
  return ASSET_ERROR_LEVELS.ERROR;
}

export function createAssetError(options = {}) {
  return {
    level: toErrorLevel(options.level),
    code: safeString(options.code, "ASSET_ERROR"),
    stage: safeString(options.stage, "unknown"),
    domain: safeString(options.domain, ""),
    assetId: safeString(options.assetId, ""),
    message: safeString(options.message, "Asset processing error."),
    details: options.details && typeof options.details === "object" ? { ...options.details } : {}
  };
}

export function appendAssetError(target, error) {
  const next = Array.isArray(target) ? target : [];
  next.push(createAssetError(error));
  return next;
}

export function appendAssetErrors(target, errors) {
  const next = Array.isArray(target) ? target : [];
  (Array.isArray(errors) ? errors : []).forEach((error) => {
    appendAssetError(next, error);
  });
  return next;
}
