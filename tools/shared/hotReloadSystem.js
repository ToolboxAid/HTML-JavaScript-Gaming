import { validateProjectAssetState } from "./projectAssetValidation.js";
import { buildProjectPackage } from "./projectPackaging.js";
import { loadPackagedProjectRuntime } from "./runtimeAssetLoader.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function fingerprintManifest(manifest) {
  return JSON.stringify(manifest || {});
}

export function summarizeHotReloadSystem(result) {
  const reload = result?.hotReload;
  if (!reload) {
    return "Hot reload unavailable.";
  }
  if (reload.status === "ready") {
    return `Hot reload ready with mode ${reload.reloadMode}.`;
  }
  if (reload.status === "blocked") {
    return `Hot reload blocked at ${sanitizeText(reload.blockedAt) || "validation"}.`;
  }
  return "Hot reload unavailable.";
}

export async function runHotReloadSystem(options = {}) {
  const previousManifest = options.previousPackageManifest ? cloneJson(options.previousPackageManifest) : null;
  const validation = validateProjectAssetState({
    registry: options.registry,
    spriteProject: options.spriteProject,
    tileMapDocument: options.tileMapDocument,
    parallaxDocument: options.parallaxDocument
  });
  if (validation.validation.status !== "valid") {
    return {
      hotReload: {
        status: "blocked",
        blockedAt: "validation",
        reports: [createReport("error", "HOT_RELOAD_BLOCKED", "Hot reload blocked by validation findings.")],
        validationResult: validation
      }
    };
  }

  const packageResult = buildProjectPackage({
    registry: options.registry,
    validationResult: validation,
    spriteProject: options.spriteProject,
    tileMapDocument: options.tileMapDocument,
    parallaxDocument: options.parallaxDocument
  });
  if (packageResult.packageStatus !== "ready") {
    return {
      hotReload: {
        status: "blocked",
        blockedAt: "packaging",
        reports: [createReport("error", "HOT_RELOAD_PACKAGE_BLOCKED", "Hot reload blocked because packaging was not ready.")],
        validationResult: validation,
        packageResult
      }
    };
  }

  const nextFingerprint = fingerprintManifest(packageResult.manifest);
  const previousFingerprint = fingerprintManifest(previousManifest);
  const reloadMode = previousManifest && previousFingerprint === nextFingerprint ? "no-op" : "reload-runtime";
  const runtimeResult = await loadPackagedProjectRuntime({
    packageManifest: packageResult.manifest,
    loaders: options.loaders || {},
    imageLoader: options.imageLoader,
    resolvePackagedAsset: options.resolvePackagedAsset
  });

  return {
    hotReload: {
      status: runtimeResult.runtimeLoader.status === "ready" ? "ready" : "blocked",
      reloadMode,
      packageFingerprint: nextFingerprint,
      reports: [
        createReport("info", "HOT_RELOAD_MODE", `Hot reload resolved mode ${reloadMode}.`),
        createReport(
          runtimeResult.runtimeLoader.status === "ready" ? "info" : "error",
          "HOT_RELOAD_RUNTIME",
          runtimeResult.runtimeLoader.status === "ready" ? "Runtime reload succeeded." : "Runtime reload failed."
        )
      ],
      validationResult: validation,
      packageResult,
      runtimeResult
    }
  };
}
