import { validateProjectAssetState, summarizeAssetValidation } from "./projectAssetValidation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "./projectPackaging.js";
import { loadPackagedProjectRuntime, summarizeRuntimeAssetLoader } from "./runtimeAssetLoader.js";
import { buildGameplaySystemLayer, summarizeGameplaySystemLayer } from "./gameplaySystemLayer.js";
import { buildGameTemplates, summarizeGameTemplates } from "./gameTemplates.js";
import { buildMultiTargetExport, summarizeMultiTargetExport } from "./multiTargetExport.js";
import { runCiValidationPipeline, summarizeCiValidationPipeline } from "./ciValidationPipeline.js";
import { runPublishingPipeline, summarizePublishingPipeline } from "./publishingPipeline.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "./debugVisualizationLayer.js";
import { buildPerformanceProfiler, summarizePerformanceProfiler } from "./performanceProfiler.js";
import { normalizeSvgToVectorAsset } from "./vector/vectorAssetBridge.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";
import { createRuntimeManifestAssetLookup } from "./pipeline/runtimeAssetLookup.js";

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

function findRegistryEntry(entries, id) {
  return (Array.isArray(entries) ? entries : []).find((entry) => sanitizeText(entry?.id) === sanitizeText(id)) || null;
}

function createRegistry() {
  return {
    version: 1,
    projectId: "vector-native-arcade-template",
    palettes: [
      {
        id: "palette.vector-native.primary",
        name: "Vector Native Primary Palette",
        path: "tools/templates/vector-native-arcade/assets/data/palettes/vector-native-primary.palette.json",
        colors: ["#05070DFF", "#E8F0FFFF", "#6FD3FFFF", "#FFB347FF"],
        sourceTool: "pixel-asset-studio"
      }
    ],
    sprites: [],
    vectors: [
      normalizeSvgToVectorAsset({
        id: "vector.template.player",
        name: "Template Player",
        path: "tools/templates/vector-native-arcade/assets/data/vectors/template-player.vector.json",
        paletteId: "palette.vector-native.primary",
        sourceTool: "vector-asset-studio",
        svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 40"><path d="M 0 -16 L 12 12 L 0 6 L -12 12 Z" /><path d="M -4 10 L 0 4 L 4 10" /></svg>'
      }),
      normalizeSvgToVectorAsset({
        id: "vector.template.obstacle.large",
        name: "Template Obstacle Large",
        path: "tools/templates/vector-native-arcade/assets/data/vectors/template-obstacle-large.vector.json",
        paletteId: "palette.vector-native.primary",
        sourceTool: "vector-asset-studio",
        svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-34 -34 68 68"><path d="M -20 -14 L 0 -24 L 22 -18 L 28 6 L 14 24 L -10 22 L -26 4 Z" /></svg>'
      }),
      normalizeSvgToVectorAsset({
        id: "vector.template.obstacle.small",
        name: "Template Obstacle Small",
        path: "tools/templates/vector-native-arcade/assets/data/vectors/template-obstacle-small.vector.json",
        paletteId: "palette.vector-native.primary",
        sourceTool: "vector-asset-studio",
        svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -18 36 36"><path d="M -8 -8 L 2 -12 L 10 -2 L 6 10 L -6 12 L -12 0 Z" /></svg>'
      }),
      normalizeSvgToVectorAsset({
        id: "vector.template.ui.title",
        name: "Template Title",
        path: "tools/templates/vector-native-arcade/assets/data/vectors/template-title.vector.json",
        paletteId: "palette.vector-native.primary",
        sourceTool: "vector-asset-studio",
        svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48"><path d="M 8 40 L 24 8 L 40 40 Z" /><path d="M 56 40 L 56 8 L 84 8 L 84 18 L 68 18 L 68 22 L 82 22 L 82 32 L 68 32 L 68 40 Z" /><path d="M 96 40 L 96 8 L 108 8 L 124 24 L 124 8 L 136 8 L 136 40 L 124 40 L 108 24 L 108 40 Z" /></svg>'
      }),
      normalizeSvgToVectorAsset({
        id: "vector.template.ui.hud",
        name: "Template HUD",
        path: "tools/templates/vector-native-arcade/assets/data/vectors/template-hud.vector.json",
        paletteId: "palette.vector-native.primary",
        sourceTool: "vector-asset-studio",
        svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32"><path d="M 4 4 L 156 4 L 156 28 L 4 28 Z" /><path d="M 18 10 L 28 10 L 28 22 L 18 22 Z" /><path d="M 40 10 L 70 10" /><path d="M 90 10 L 120 10" /></svg>'
      })
    ],
    tilesets: [
      {
        id: "tileset.template.ui",
        name: "Template UI Tileset",
        path: "tools/templates/vector-native-arcade/assets/data/tilemaps/template-ui.tileset.json",
        paletteId: "palette.vector-native.primary",
        tileWidth: 8,
        tileHeight: 8,
        sourceTool: "tilemap-studio"
      }
    ],
    tilemaps: [
      {
        id: "tilemap.template.arena",
        name: "Template Arena",
        path: "tools/templates/vector-native-arcade/assets/data/tilemaps/template-arena.tilemap.json",
        tilesetId: "tileset.template.ui",
        sourceTool: "tilemap-studio"
      }
    ],
    images: [
      {
        id: "image.template.backdrop",
        name: "Template Backdrop",
        path: "tools/templates/vector-native-arcade/assets/data/parallax/template-backdrop.svg",
        sourceTool: "parallax-scene-studio"
      }
    ],
    parallaxSources: [
      {
        id: "parallax.template.backdrop",
        name: "Template Backdrop Layer",
        path: "tools/templates/vector-native-arcade/assets/data/parallax/template-backdrop.parallax.json",
        imageId: "image.template.backdrop",
        sourceTool: "parallax-scene-studio"
      }
    ]
  };
}

function createVectorDocument() {
  return {
    schema: "toolbox.vector/1",
    version: 1,
    name: "Vector Native Arcade Template",
    assetRefs: {
      vectorId: "vector.template.player",
      vectorIds: [
        "vector.template.player",
        "vector.template.obstacle.large",
        "vector.template.obstacle.small",
        "vector.template.ui.title",
        "vector.template.ui.hud"
      ],
      paletteId: "palette.vector-native.primary"
    },
    requiredVisualContract: "vector-only",
    preferredVisuals: {
      player: "vector.template.player",
      obstacleLarge: "vector.template.obstacle.large",
      obstacleSmall: "vector.template.obstacle.small",
      title: "vector.template.ui.title",
      hud: "vector.template.ui.hud"
    }
  };
}

function createTileMapDocument() {
  return {
    schema: "toolbox.tilemap/1",
    version: 1,
    map: {
      name: "Vector Native Arcade Arena",
      width: 32,
      height: 24,
      tileSize: 8
    },
    assetRefs: {
      tilemapId: "tilemap.template.arena",
      tilesetId: "tileset.template.ui",
      parallaxSourceIds: ["parallax.template.backdrop"]
    },
    gameplay: {
      states: ["title", "start", "gameplay", "restart"],
      extensionPoints: ["spawn-patterns", "score-rules", "victory-conditions"]
    }
  };
}

function createParallaxDocument() {
  return {
    schema: "toolbox.parallax/1",
    version: 1,
    assetRefs: {
      parallaxSourceIds: ["parallax.template.backdrop"]
    },
    layers: [
      {
        id: "template-backdrop",
        parallaxSourceId: "parallax.template.backdrop",
        speed: 0.12
      }
    ]
  };
}

function createRuntimeAssetSources(registry) {
  return {
    "palette.vector-native.primary": {
      kind: "palette",
      file: "tools/templates/vector-native-arcade/assets/data/palettes/vector-native-primary.palette.json",
      colors: ["#05070DFF", "#E8F0FFFF", "#6FD3FFFF", "#FFB347FF"]
    },
    "vector.template.player": {
      ...cloneJson(findRegistryEntry(registry?.vectors, "vector.template.player")),
      kind: "vector",
      file: "tools/templates/vector-native-arcade/assets/data/vectors/template-player.vector.json",
      role: "player"
    },
    "vector.template.obstacle.large": {
      ...cloneJson(findRegistryEntry(registry?.vectors, "vector.template.obstacle.large")),
      kind: "vector",
      file: "tools/templates/vector-native-arcade/assets/data/vectors/template-obstacle-large.vector.json",
      role: "obstacle-large"
    },
    "vector.template.obstacle.small": {
      ...cloneJson(findRegistryEntry(registry?.vectors, "vector.template.obstacle.small")),
      kind: "vector",
      file: "tools/templates/vector-native-arcade/assets/data/vectors/template-obstacle-small.vector.json",
      role: "obstacle-small"
    },
    "vector.template.ui.title": {
      ...cloneJson(findRegistryEntry(registry?.vectors, "vector.template.ui.title")),
      kind: "vector",
      file: "tools/templates/vector-native-arcade/assets/data/vectors/template-title.vector.json",
      role: "title"
    },
    "vector.template.ui.hud": {
      ...cloneJson(findRegistryEntry(registry?.vectors, "vector.template.ui.hud")),
      kind: "vector",
      file: "tools/templates/vector-native-arcade/assets/data/vectors/template-hud.vector.json",
      role: "hud"
    },
    "tileset.template.ui": {
      kind: "tileset",
      file: "tools/templates/vector-native-arcade/assets/data/tilemaps/template-ui.tileset.json",
      role: "ui-tileset"
    },
    "tilemap.template.arena": {
      kind: "tilemap",
      file: "tools/templates/vector-native-arcade/assets/data/tilemaps/template-arena.tilemap.json",
      runtimeEntry: {
        modulePath: "games/Asteroids/main.js",
        exportName: "bootAsteroids",
        canvasId: "game"
      },
      visualPreference: {
        requiredAssetType: "vector",
        vectorIds: [
          "vector.template.player",
          "vector.template.obstacle.large",
          "vector.template.obstacle.small",
          "vector.template.ui.title",
          "vector.template.ui.hud"
        ]
      }
    },
    "parallax.template.backdrop": {
      kind: "parallaxLayer",
      file: "tools/templates/vector-native-arcade/assets/data/parallax/template-backdrop.parallax.json",
      role: "backdrop"
    }
  };
}

export function createVectorNativeTemplateDefinition() {
  const registry = createRegistry();
  return {
    templatePath: "tools/templates/vector-native-arcade/",
    registry,
    vectorDocument: createVectorDocument(),
    tileMapDocument: createTileMapDocument(),
    parallaxDocument: createParallaxDocument(),
    runtimeAssetSources: createRuntimeAssetSources(registry),
    configPath: "tools/templates/vector-native-arcade/config/template.project.json",
    runtimeBootstrapPath: "tools/templates/vector-native-arcade/runtime/bootstrap.runtime.json",
    docsPath: "tools/templates/vector-native-arcade/docs/STARTER_GUIDE.md",
    rollbackNotesPath: "tools/templates/vector-native-arcade/docs/ROLLBACK_NOTES.md"
  };
}

export function summarizeVectorNativeTemplate(result) {
  const status = sanitizeText(result?.template?.status);
  if (status !== "ready") {
    return "Vector native template unavailable.";
  }
  const assetCount = Array.isArray(result?.template?.packageResult?.manifest?.package?.assets)
    ? result.template.packageResult.manifest.package.assets.length
    : 0;
  return `Vector native template ready with ${assetCount} packaged assets.`;
}

export async function buildVectorNativeTemplate(options = {}) {
  const definition = createVectorNativeTemplateDefinition();
  const registry = cloneJson(options.registry || definition.registry);
  const vectorDocument = cloneJson(options.vectorDocument || definition.vectorDocument);
  const tileMapDocument = cloneJson(options.tileMapDocument || definition.tileMapDocument);
  const parallaxDocument = cloneJson(options.parallaxDocument || definition.parallaxDocument);
  const runtimeAssetSources = cloneJson(options.runtimeAssetSources || definition.runtimeAssetSources);
  const runtimeLookup = createRuntimeManifestAssetLookup({
    gameId: "vector-native-arcade-template",
    runtimeAssetSources,
    sourceToolId: "runtime-adoption-09-13",
    missingBindingBehavior: "static"
  });

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
    resolvePackagedAsset: runtimeLookup.resolvePackagedAsset
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
    assetRuntimeState: runtimeLookup.getDebugState?.() || null,
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
  const ciValidationResult = await runCiValidationPipeline({
    branch: "tools/templates/vector-native-arcade",
    trigger: "template-build",
    performanceResult
  });
  const publishingResult = await runPublishingPipeline({
    ciValidationResult,
    multiTargetExportResult
  });

  const packageAssetIds = Array.isArray(packageResult.manifest?.package?.assets)
    ? packageResult.manifest.package.assets.map((asset) => sanitizeText(asset?.id))
    : [];
  const vectorIds = cloneJson(vectorDocument.assetRefs?.vectorIds || []);
  const missingVectorIds = vectorIds.filter((id) => !packageAssetIds.includes(id));
  const hasSpriteRuntimeDependency = packageAssetIds.some((id) => id.startsWith("sprite."));

  const reports = [
    createReport("info", "VECTOR_NATIVE_TEMPLATE_READY", "Vector-native arcade template completed validation, packaging, runtime, CI, export, and publishing flows."),
    createReport("info", "VECTOR_NATIVE_TEMPLATE_CONTRACT", "First-class vector assets are the required visual contract for the template baseline."),
    createReport("info", "VECTOR_NATIVE_TEMPLATE_REUSE", "Template provides reusable starter structure for future vector-led arcade games without sprite fallback.")
  ];

  return {
    template: {
      status: validationResult.validation.status === "valid"
        && packageResult.packageStatus === "ready"
        && runtimeResult.runtimeLoader.status === "ready"
        && templateResult.templates.status === "ready"
        && multiTargetExportResult.multiTargetExport.status === "ready"
        && ciValidationResult.ciValidation.status === "pass"
        && publishingResult.publishing.status === "ready"
        && missingVectorIds.length === 0
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
      ciValidationResult,
      publishingResult,
      runtimeLookupDebug: runtimeLookup.getDebugState?.() || null,
      vectorOnly: {
        requiredVectorIds: vectorIds,
        missingVectorIds,
        hasSpriteRuntimeDependency
      },
      reports,
      reportText: [
        summarizeVectorNativeTemplate({
          template: {
            status: "ready",
            packageResult
          }
        }),
        `Template path: ${definition.templatePath}`,
        `Validation: ${summarizeAssetValidation(validationResult)}`,
        `Packaging: ${summarizeProjectPackaging(packageResult)}`,
        `Runtime: ${summarizeRuntimeAssetLoader(runtimeResult)}`,
        `Gameplay: ${summarizeGameplaySystemLayer(gameplayResult)}`,
        `Templates: ${summarizeGameTemplates(templateResult)}`,
        `Debug: ${summarizeDebugVisualizationLayer(debugVisualizationResult)}`,
        `Profiler: ${summarizePerformanceProfiler(performanceResult)}`,
        `Export: ${summarizeMultiTargetExport(multiTargetExportResult)}`,
        `CI: ${summarizeCiValidationPipeline(ciValidationResult)}`,
        `Publishing: ${summarizePublishingPipeline(publishingResult)}`,
        `Vector-only runtime: ${hasSpriteRuntimeDependency ? "failed" : "ready"}`,
        `Required vectors: ${vectorIds.join(", ")}`,
        `Config: ${definition.configPath}`,
        `Runtime bootstrap: ${definition.runtimeBootstrapPath}`,
        `Docs: ${definition.docsPath}`,
        ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
      ].join("\n")
    }
  };
}

