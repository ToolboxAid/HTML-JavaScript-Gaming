import { buildProjectPackage } from "./projectPackaging.js";
import { validateProjectAssetState } from "./projectAssetValidation.js";

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

const TARGETS = Object.freeze({
  web: { runtime: "browser", layout: "dist/web" },
  desktop: { runtime: "webview", layout: "dist/desktop" },
  archive: { runtime: "static-bundle", layout: "dist/archive" }
});

export function summarizeMultiTargetExport(result) {
  const exportResult = result?.multiTargetExport;
  if (!exportResult) {
    return "Multi-target export unavailable.";
  }
  if (exportResult.status === "ready") {
    return `Multi-target export ready for ${exportResult.targets.length} targets.`;
  }
  return "Multi-target export blocked.";
}

export function buildMultiTargetExport(options = {}) {
  const validation = options.validationResult || validateProjectAssetState({
    registry: options.registry,
    spriteProject: options.spriteProject,
    tileMapDocument: options.tileMapDocument,
    parallaxDocument: options.parallaxDocument
  });
  const packageResult = options.packageResult || buildProjectPackage({
    registry: options.registry,
    validationResult: validation,
    spriteProject: options.spriteProject,
    tileMapDocument: options.tileMapDocument,
    parallaxDocument: options.parallaxDocument
  });
  if (validation.validation.status !== "valid" || packageResult.packageStatus !== "ready") {
    return {
      multiTargetExport: {
        status: "blocked",
        targets: [],
        reports: [createReport("error", "EXPORT_BLOCKED", "Multi-target export blocked by validation or packaging state.")],
        validationResult: validation,
        packageResult
      }
    };
  }

  const targetIds = Array.isArray(options.targets) && options.targets.length > 0 ? options.targets : ["web", "desktop", "archive"];
  const targets = targetIds
    .map((targetId) => sanitizeText(targetId))
    .filter((targetId) => TARGETS[targetId])
    .sort((left, right) => left.localeCompare(right))
    .map((targetId) => ({
      targetId,
      runtime: TARGETS[targetId].runtime,
      outputPath: TARGETS[targetId].layout,
      manifest: {
        target: targetId,
        runtime: TARGETS[targetId].runtime,
        package: cloneJson(packageResult.manifest.package),
        layout: {
          root: TARGETS[targetId].layout,
          manifestPath: `${TARGETS[targetId].layout}/package-manifest.json`,
          reportPath: `${TARGETS[targetId].layout}/export-report.txt`
        }
      }
    }));

  return {
    multiTargetExport: {
      status: "ready",
      targets,
      reports: [
        createReport("info", "EXPORT_TARGETS_READY", `Prepared ${targets.length} deterministic export target manifests.`)
      ],
      validationResult: validation,
      packageResult,
      reportText: [
        `Export status: ready`,
        `Targets: ${targets.map((target) => `${target.targetId} -> ${target.outputPath}`).join(", ")}`,
        ...targets.map((target) => `[${target.targetId}] runtime=${target.runtime} manifest=${target.manifest.layout.manifestPath}`)
      ].join("\n")
    }
  };
}
