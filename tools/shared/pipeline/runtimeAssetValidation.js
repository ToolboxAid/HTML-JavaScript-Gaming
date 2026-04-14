import { safeString } from "../projectSystemValueUtils.js";
import { RUNTIME_ACTIVE_DOMAINS } from "./runtimeAssetBinding.js";

function asObject(value) {
  return value && typeof value === "object" ? value : {};
}

function hasText(value) {
  return safeString(value, "").length > 0;
}

function hasRuntimePath(source) {
  return hasText(source.file) || hasText(source.path);
}

function includesDataPath(pathValue) {
  return safeString(pathValue, "").includes("/data/");
}

function validateRequiredFields(domain, source) {
  const issues = [];
  const assetSource = asObject(source);

  if (!hasRuntimePath(assetSource)) {
    issues.push(`Domain ${domain} requires source.file or source.path.`);
    return issues;
  }

  if (domain === "vectors") {
    const valid = safeString(assetSource.kind, "") === "vector"
      || safeString(assetSource.type, "") === "vector"
      || safeString(assetSource.runtimeKind, "") === "vector-geometry"
      || Array.isArray(assetSource.renderables)
      || Array.isArray(assetSource.layers);
    if (!valid) {
      issues.push("Vectors require vector-kind runtime source metadata.");
    }
  } else if (domain === "tilemaps") {
    const valid = safeString(assetSource.kind, "") === "tilemap"
      || (assetSource.runtimeEntry && typeof assetSource.runtimeEntry === "object")
      || (assetSource.visualPreference && typeof assetSource.visualPreference === "object");
    if (!valid) {
      issues.push("Tilemaps require tilemap-kind runtime source metadata.");
    }
  } else if (domain === "parallax") {
    const kind = safeString(assetSource.kind, "");
    const valid = kind === "parallax" || kind === "parallaxLayer" || hasText(assetSource.role);
    if (!valid) {
      issues.push("Parallax assets require parallax-kind runtime source metadata.");
    }
  } else if (domain === "sprites") {
    const valid = safeString(assetSource.kind, "") === "sprite"
      || safeString(assetSource.type, "") === "sprite"
      || Array.isArray(assetSource.frames)
      || hasText(assetSource.imageId);
    if (!valid) {
      issues.push("Sprites require sprite-kind runtime source metadata.");
    }
  }

  return issues;
}

export function validateRuntimeResolvedAsset(options = {}) {
  const domain = safeString(options.domain, "").toLowerCase();
  const assetId = safeString(options.assetId, "");
  const source = asObject(options.source);
  const runtimePath = safeString(options.runtimePath || source.file || source.path, "");
  const issues = [];

  if (!RUNTIME_ACTIVE_DOMAINS.includes(domain)) {
    issues.push(`Unsupported runtime domain ${domain || "unknown"}.`);
  }
  if (!assetId) {
    issues.push("Runtime asset id is required.");
  }
  if (!runtimePath) {
    issues.push("Runtime asset path is required.");
  } else if (includesDataPath(runtimePath)) {
    issues.push(`Runtime asset ${assetId || "unknown"} cannot resolve from /data/ path.`);
  }
  if (includesDataPath(source.file) || includesDataPath(source.path)) {
    issues.push(`Runtime asset ${assetId || "unknown"} source cannot reference /data/ path.`);
  }
  issues.push(...validateRequiredFields(domain, source));

  return {
    valid: issues.length === 0,
    issues
  };
}
