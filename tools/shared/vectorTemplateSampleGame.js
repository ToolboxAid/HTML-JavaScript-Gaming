import { validateProjectAssetState, summarizeAssetValidation } from "./projectAssetValidation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "./projectPackaging.js";
import { loadPackagedProjectRuntime, summarizeRuntimeAssetLoader } from "./runtimeAssetLoader.js";
import { buildGameplaySystemLayer, summarizeGameplaySystemLayer } from "./gameplaySystemLayer.js";
import { buildGameTemplates, summarizeGameTemplates } from "./gameTemplates.js";
import { buildMultiTargetExport, summarizeMultiTargetExport } from "./multiTargetExport.js";
import { runPublishingPipeline, summarizePublishingPipeline } from "./publishingPipeline.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "./debugVisualizationLayer.js";
import { buildPerformanceProfiler, summarizePerformanceProfiler } from "./performanceProfiler.js";
import { createVectorNativeTemplateDefinition } from "./vectorNativeTemplate.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function remapPath(pathValue) {
  return sanitizeText(pathValue).replace("templates/vector-native-arcade/", "games/vector-arcade-sample/");
}

function remapRegistry(registry) {
  const next = cloneJson(registry);
  next.projectId = "vector-arcade-sample";
  ["palettes", "vectors", "tilesets", "tilemaps", "images", "parallaxSources"].forEach((section) => {
    const entries = Array.isArray(next[section]) ? next[section] : [];
    entries.forEach((entry) => {
      if (entry.path) {
        entry.path = remapPath(entry.path);
      }
      if (entry.source?.path) {
        entry.source.path = remapPath(entry.source.path);
      }
    });
  });
  return next;
}

function remapRuntimeSources(sources) {
  const next = cloneJson(sources);
  Object.keys(next).forEach((key) => {
    if (next[key]?.file) {
      next[key].file = remapPath(next[key].file);
    }
    if (next[key]?.path) {
      next[key].path = remapPath(next[key].path);
    }
    if (next[key]?.source?.path) {
      next[key].source.path = remapPath(next[key].source.path);
    }
  });
  return next;
}

export function createVectorTemplateSampleGameDefinition() {
  const template = createVectorNativeTemplateDefinition();
  return {
    gamePath: "games/vector-arcade-sample/",
    registry: remapRegistry(template.registry),
    vectorDocument: cloneJson(template.vectorDocument),
    tileMapDocument: cloneJson(template.tileMapDocument),
    parallaxDocument: cloneJson(template.parallaxDocument),
    runtimeAssetSources: remapRuntimeSources(template.runtimeAssetSources),
    configPath: "games/vector-arcade-sample/config/sample.project.json",
    runtimeBootstrapPath: "games/vector-arcade-sample/runtime/bootstrap.runtime.json",
    docsPath: "games/vector-arcade-sample/docs/STARTER_GUIDE.md",
    rollbackNotesPath: "games/vector-arcade-sample/docs/ROLLBACK_NOTES.md",
    runtimeEntry: {
      modulePath: "games/vector-arcade-sample/main.js",
      exportName: "bootVectorArcadeSample"
    }
  };
}

function buildImageSource(asset) {
  return {
    image: {
      width: 960,
      height: 720,
      src: sanitizeText(asset?.path)
    },
    status: "provided-loaded"
  };
}

function createResolvePackagedAsset(assetSources) {
  return (asset) => {
    const assetId = sanitizeText(asset?.id);
    if (sanitizeText(asset?.type) === "image") {
      return buildImageSource(asset);
    }
    return assetSources[assetId] ? cloneJson(assetSources[assetId]) : null;
  };
}

export function summarizeVectorTemplateSampleGame(result) {
  const status = sanitizeText(result?.sampleGame?.status);
  if (status !== "ready") {
    return "Vector template sample game unavailable.";
  }
  const assetCount = Array.isArray(result?.sampleGame?.packageResult?.manifest?.package?.assets)
    ? result.sampleGame.packageResult.manifest.package.assets.length
    : 0;
  return `Vector template sample game ready with ${assetCount} packaged assets.`;
}

export async function buildVectorTemplateSampleGame(options = {}) {
  const definition = createVectorTemplateSampleGameDefinition();
  const registry = cloneJson(options.registry || definition.registry);
  const vectorDocument = cloneJson(options.vectorDocument || definition.vectorDocument);
  const tileMapDocument = cloneJson(options.tileMapDocument || definition.tileMapDocument);
  const parallaxDocument = cloneJson(options.parallaxDocument || definition.parallaxDocument);
  const runtimeAssetSources = cloneJson(options.runtimeAssetSources || definition.runtimeAssetSources);

  const validationResult = validateProjectAssetState({
    registry,
    vectorDocument,
    tileMapDocument,
    parallaxDocument
  });
  const packageResult = buildProjectPackage({
    registry,
    validationResult,
    vectorDocument,
    tileMapDocument,
    parallaxDocument
  });
  const runtimeResult = await loadPackagedProjectRuntime({
    packageManifest: packageResult.manifest,
    resolvePackagedAsset: createResolvePackagedAsset(runtimeAssetSources)
  });
  const gameplayResult = buildGameplaySystemLayer({
    runtimeResult
  });
  const templateResult = buildGameTemplates({
    gameplayResult
  });
  const performanceResult = buildPerformanceProfiler({
    validationResult,
    packageResult,
    runtimeResult
  });
  const debugVisualizationResult = buildDebugVisualizationLayer({
    assetDependencyGraph: validationResult.assetDependencyGraph,
    validationResult,
    packageResult,
    runtimeResult,
    performanceResult
  });
  const multiTargetExportResult = buildMultiTargetExport({
    validationResult,
    packageResult,
    registry,
    vectorDocument,
    tileMapDocument,
    parallaxDocument
  });
  const publishingResult = await runPublishingPipeline({
    ciValidationResult: {
      ciValidation: {
        status: validationResult.validation.status === "valid" ? "pass" : "fail"
      }
    },
    multiTargetExportResult
  });

  const packageAssetIds = Array.isArray(packageResult.manifest?.package?.assets)
    ? packageResult.manifest.package.assets.map((asset) => sanitizeText(asset?.id))
    : [];
  const hasSpriteRuntimeDependency = packageAssetIds.some((id) => id.startsWith("sprite."));

  const reports = [
    createReport("info", "VECTOR_TEMPLATE_SAMPLE_GAME_READY", "Standalone vector sample game completed validation, packaging, runtime, debug, profiler, export, and publishing flows."),
    createReport("info", "VECTOR_TEMPLATE_SAMPLE_GAME_CONTRACT", "Vector assets remain the only active visual runtime dependency for the sample game."),
    createReport("info", "VECTOR_TEMPLATE_SAMPLE_GAME_REUSE", "Sample game proves the vector-native arcade template is reusable outside the Asteroids-owned project path.")
  ];

  return {
    sampleGame: {
      status: validationResult.validation.status === "valid"
        && packageResult.packageStatus === "ready"
        && runtimeResult.runtimeLoader.status === "ready"
        && templateResult.templates.status === "ready"
        && multiTargetExportResult.multiTargetExport.status === "ready"
        && publishingResult.publishing.status === "ready"
        && !hasSpriteRuntimeDependency
        ? "ready"
        : "blocked",
      definition,
      validationResult,
      packageResult,
      runtimeResult,
      gameplayResult,
      templateResult,
      debugVisualizationResult,
      performanceResult,
      multiTargetExportResult,
      publishingResult,
      vectorOnly: {
        hasSpriteRuntimeDependency
      },
      reports,
      reportText: [
        summarizeVectorTemplateSampleGame({
          sampleGame: {
            status: "ready",
            packageResult
          }
        }),
        `Game path: ${definition.gamePath}`,
        `Validation: ${summarizeAssetValidation(validationResult)}`,
        `Packaging: ${summarizeProjectPackaging(packageResult)}`,
        `Runtime: ${summarizeRuntimeAssetLoader(runtimeResult)}`,
        `Gameplay: ${summarizeGameplaySystemLayer(gameplayResult)}`,
        `Templates: ${summarizeGameTemplates(templateResult)}`,
        `Debug: ${summarizeDebugVisualizationLayer(debugVisualizationResult)}`,
        `Profiler: ${summarizePerformanceProfiler(performanceResult)}`,
        `Export: ${summarizeMultiTargetExport(multiTargetExportResult)}`,
        `Publishing: ${summarizePublishingPipeline(publishingResult)}`,
        `Runtime entry: ${definition.runtimeEntry.modulePath}#${definition.runtimeEntry.exportName}`,
        `Vector-only runtime: ${hasSpriteRuntimeDependency ? "failed" : "ready"}`,
        `Config: ${definition.configPath}`,
        `Runtime bootstrap: ${definition.runtimeBootstrapPath}`,
        ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
      ].join("\n")
    }
  };
}
