import { safeString } from "../projectSystemValueUtils.js";
import { RUNTIME_ACTIVE_DOMAINS } from "./runtimeAssetBinding.js";
import { appendAssetError } from "./assetErrorHandling.js";

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

function validateRequiredFields(domain, source, assetId) {
  const errors = [];
  const assetSource = asObject(source);

  if (!hasRuntimePath(assetSource)) {
    appendAssetError(errors, {
      code: "RUNTIME_SOURCE_PATH_REQUIRED",
      stage: "runtime-validation",
      domain,
      assetId,
      message: `Domain ${domain} requires source.file or source.path.`
    });
    return errors;
  }

  if (domain === "vectors") {
    const valid = safeString(assetSource.kind, "") === "vector"
      || safeString(assetSource.type, "") === "vector"
      || safeString(assetSource.runtimeKind, "") === "vector-geometry"
      || Array.isArray(assetSource.renderables)
      || Array.isArray(assetSource.layers);
    if (!valid) {
      appendAssetError(errors, {
        code: "RUNTIME_VECTOR_METADATA_REQUIRED",
        stage: "runtime-validation",
        domain,
        assetId,
        message: "Vectors require vector-kind runtime source metadata."
      });
    }
  } else if (domain === "tilemaps") {
    const valid = safeString(assetSource.kind, "") === "tilemap"
      || (assetSource.runtimeEntry && typeof assetSource.runtimeEntry === "object")
      || (assetSource.visualPreference && typeof assetSource.visualPreference === "object");
    if (!valid) {
      appendAssetError(errors, {
        code: "RUNTIME_TILEMAP_METADATA_REQUIRED",
        stage: "runtime-validation",
        domain,
        assetId,
        message: "Tilemaps require tilemap-kind runtime source metadata."
      });
    }
  } else if (domain === "parallax") {
    const kind = safeString(assetSource.kind, "");
    const valid = kind === "parallax" || kind === "parallaxLayer" || hasText(assetSource.role);
    if (!valid) {
      appendAssetError(errors, {
        code: "RUNTIME_PARALLAX_METADATA_REQUIRED",
        stage: "runtime-validation",
        domain,
        assetId,
        message: "Parallax assets require parallax-kind runtime source metadata."
      });
    }
  } else if (domain === "sprites") {
    const valid = safeString(assetSource.kind, "") === "sprite"
      || safeString(assetSource.type, "") === "sprite"
      || Array.isArray(assetSource.frames)
      || hasText(assetSource.imageId);
    if (!valid) {
      appendAssetError(errors, {
        code: "RUNTIME_SPRITE_METADATA_REQUIRED",
        stage: "runtime-validation",
        domain,
        assetId,
        message: "Sprites require sprite-kind runtime source metadata."
      });
    }
  }

  return errors;
}

export function validateRuntimeResolvedAsset(options = {}) {
  const domain = safeString(options.domain, "").toLowerCase();
  const assetId = safeString(options.assetId, "");
  const source = asObject(options.source);
  const runtimePath = safeString(options.runtimePath || source.file || source.path, "");
  const errors = [];

  if (!RUNTIME_ACTIVE_DOMAINS.includes(domain)) {
    appendAssetError(errors, {
      code: "RUNTIME_DOMAIN_UNSUPPORTED",
      stage: "runtime-validation",
      domain,
      assetId,
      message: `Unsupported runtime domain ${domain || "unknown"}.`
    });
  }
  if (!assetId) {
    appendAssetError(errors, {
      code: "RUNTIME_ASSET_ID_REQUIRED",
      stage: "runtime-validation",
      domain,
      assetId,
      message: "Runtime asset id is required."
    });
  }
  if (!runtimePath) {
    appendAssetError(errors, {
      code: "RUNTIME_PATH_REQUIRED",
      stage: "runtime-validation",
      domain,
      assetId,
      message: "Runtime asset path is required."
    });
  } else if (includesDataPath(runtimePath)) {
    appendAssetError(errors, {
      code: "RUNTIME_PATH_DATA_BLOCKED",
      stage: "runtime-validation",
      domain,
      assetId,
      message: `Runtime asset ${assetId || "unknown"} cannot resolve from /data/ path.`
    });
  }
  if (includesDataPath(source.file) || includesDataPath(source.path)) {
    appendAssetError(errors, {
      code: "RUNTIME_SOURCE_DATA_BLOCKED",
      stage: "runtime-validation",
      domain,
      assetId,
      message: `Runtime asset ${assetId || "unknown"} source cannot reference /data/ path.`
    });
  }
  errors.push(...validateRequiredFields(domain, source, assetId));

  return {
    valid: errors.length === 0,
    errors,
    issues: errors.map((entry) => entry.message)
  };
}
