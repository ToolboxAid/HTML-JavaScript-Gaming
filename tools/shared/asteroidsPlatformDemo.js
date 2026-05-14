import { validateProjectAssetState, summarizeAssetValidation } from "./projectAssetValidation.js";
import { buildProjectAssetRemediation } from "./projectAssetRemediation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "./projectPackaging.js";
import { loadPackagedProjectRuntime, summarizeRuntimeAssetLoader } from "./runtimeAssetLoader.js";
import { buildGameplaySystemLayer, summarizeGameplaySystemLayer } from "./gameplaySystemLayer.js";
import { buildGameTemplates, summarizeGameTemplates } from "./gameTemplates.js";
import { buildMultiTargetExport, summarizeMultiTargetExport } from "./multiTargetExport.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "./debugVisualizationLayer.js";
import { buildPerformanceProfiler, summarizePerformanceProfiler } from "./performanceProfiler.js";
import { runPublishingPipeline, summarizePublishingPipeline } from "./publishingPipeline.js";
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

function createRegistry() {
  return {
    version: 1,
    projectId: "asteroids-platform-demo",
    palettes: [
      {
        id: "palette.asteroids-hud",
        name: "Asteroids HUD Palette",
        path: "games/Asteroids/game.manifest.json#tools.palette-browser.palette",
        colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"],
        sourceTool: "pixel-asset-studio"
      }
    ],
    sprites: [],
    vectors: [],
    tilesets: [
      {
        id: "tileset.asteroids-ui",
        name: "Asteroids UI Tileset",
        path: "games/Asteroids/game.manifest.json#tools.tile-map-editor.tilesets.tileset.asteroids.ui",
        paletteId: "palette.asteroids-hud",
        tileWidth: 8,
        tileHeight: 8,
        sourceTool: "tilemap-studio"
      }
    ],
    tilemaps: [
      {
        id: "tilemap.asteroids-stage",
        name: "Asteroids Demo Stage",
        path: "games/Asteroids/game.manifest.json#tools.tile-map-editor.maps.tilemap.asteroids.stage.runtime",
        tilesetId: "tileset.asteroids-ui",
        sourceTool: "tilemap-studio"
      }
    ],
    images: [
      {
        id: "image.asteroids-preview",
        name: "Asteroids Preview",
        path: "games/Asteroids/assets/images/preview.png",
        sourceTool: "parallax-scene-studio"
      },
      {
        id: "image.asteroids-bezel",
        name: "Asteroids Bezel",
        path: "games/Asteroids/game.manifest.json#tools.asset-manager-v2.assets.image.asteroids.bezel.path",
        sourceTool: "parallax-scene-studio"
      }
    ],
    parallaxSources: [
      {
        id: "parallax.asteroids-title",
        name: "Asteroids Title Layer",
        path: "games/Asteroids/game.manifest.json#tools.parallax-editor.parallaxLevels.parallax.asteroids.title.runtime",
        imageId: "image.asteroids-preview",
        sourceTool: "parallax-scene-studio"
      },
      {
        id: "parallax.asteroids-overlay",
        name: "Asteroids Overlay Layer",
        path: "games/Asteroids/game.manifest.json#tools.parallax-editor.parallaxLevels.parallax.asteroids.overlay.runtime",
        imageId: "image.asteroids-bezel",
        sourceTool: "parallax-scene-studio"
      }
    ]
  };
}

function createSpriteProject() {
  return {
    schema: "toolbox.sprite/1",
    version: 1,
    name: "Asteroids Demo Historical Sprite Rollback Note",
    assetRefs: {},
    content: {
      status: "historical-only",
      note: "Sprite atlas rollback guidance is documented only and is not part of the active vector-only runtime baseline."
    }
  };
}

function createRuntimeObjectIdMap() {
  return {
    asteroidLarge: "object.asteroids.asteroid.large",
    asteroidMedium: "object.asteroids.asteroid.medium",
    asteroidSmall: "object.asteroids.asteroid.small",
    ship: "object.asteroids.ship",
    ufoLarge: "object.asteroids.ufo.large",
    ufoSmall: "object.asteroids.ufo.small"
  };
}

function createTileMapDocument() {
  return {
    schema: "toolbox.tilemap/1",
    version: 1,
    map: {
      name: "Asteroids Demo Stage",
      width: 40,
      height: 30,
      tileSize: 8
    },
    assetRefs: {
      tilemapId: "tilemap.asteroids-stage",
      tilesetId: "tileset.asteroids-ui",
      objectIds: createRuntimeObjectIdMap(),
      parallaxSourceIds: ["parallax.asteroids-overlay", "parallax.asteroids-title"]
    },
    gameplay: {
      lives: 3,
      startWave: 1,
      wavePlan: [
        { wave: 1, asteroids: 4, speed: "slow" },
        { wave: 2, asteroids: 5, speed: "medium" },
        { wave: 3, asteroids: 6, speed: "fast" }
      ],
      scoring: {
        large: 20,
        medium: 50,
        small: 100,
        saucer: 200
      }
    }
  };
}

function createParallaxDocument() {
  return {
    schema: "toolbox.parallax/1",
    version: 1,
    assetRefs: {
      parallaxSourceIds: ["parallax.asteroids-overlay", "parallax.asteroids-title"]
    },
    layers: [
      {
        id: "title-frame",
        parallaxSourceId: "parallax.asteroids-title",
        speed: 0.1
      },
      {
        id: "play-frame",
        parallaxSourceId: "parallax.asteroids-overlay",
        speed: 0.2
      }
    ]
  };
}

function createRuntimeAssetSources(registry) {
  return {
    "palette.asteroids-hud": {
      kind: "palette",
      file: "games/Asteroids/game.manifest.json#tools.palette-browser.palette",
      colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"]
    },
    "object.asteroids.ship": {
      kind: "objectVector",
      file: "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.object.asteroids.ship",
      role: "ship"
    },
    "object.asteroids.asteroid.large": {
      kind: "objectVector",
      file: "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.object.asteroids.asteroid.large",
      role: "asteroid-large"
    },
    "object.asteroids.asteroid.medium": {
      kind: "objectVector",
      file: "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.object.asteroids.asteroid.medium",
      role: "asteroid-medium"
    },
    "object.asteroids.asteroid.small": {
      kind: "objectVector",
      file: "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.object.asteroids.asteroid.small",
      role: "asteroid-small"
    },
    "object.asteroids.ufo.large": {
      kind: "objectVector",
      file: "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.object.asteroids.ufo.large",
      role: "ufo-large"
    },
    "object.asteroids.ufo.small": {
      kind: "objectVector",
      file: "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.object.asteroids.ufo.small",
      role: "ufo-small"
    },
    "tileset.asteroids-ui": {
      kind: "tileset",
      file: "games/Asteroids/game.manifest.json#tools.tile-map-editor.tilesets.tileset.asteroids.ui",
      hudFrames: ["score-panel", "lives-panel", "wave-panel"]
    },
    "tilemap.asteroids-stage": {
      kind: "tilemap",
      file: "games/Asteroids/game.manifest.json#tools.tile-map-editor.maps.tilemap.asteroids.stage.runtime",
      gameplayLoop: {
        title: true,
        start: true,
        gameplay: true,
        gameOver: true,
        restart: true
      },
      visualPreference: {
        objectIds: createRuntimeObjectIdMap(),
        preferredRuntimeIdentity: "object-vector-object"
      },
      runtimeEntry: {
        modulePath: "games/Asteroids/main.js",
        exportName: "bootAsteroids",
        canvasId: "game"
      },
      systems: {
        ship: true,
        bullets: true,
        asteroidSpawning: true,
        asteroidSplitting: true,
        scoring: true,
        lives: true,
        waves: true,
        objectVectorVisuals: true
      }
    },
    "parallax.asteroids-overlay": {
      kind: "parallaxLayer",
      file: "games/Asteroids/game.manifest.json#tools.parallax-editor.parallaxLevels.parallax.asteroids.overlay.runtime",
      role: "gameplay-overlay"
    },
    "parallax.asteroids-title": {
      kind: "parallaxLayer",
      file: "games/Asteroids/game.manifest.json#tools.parallax-editor.parallaxLevels.parallax.asteroids.title.runtime",
      role: "title-frame"
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

function createDemoDetails(definition) {
  return {
    title: "Asteroids Platform Demo",
    templateCandidate: "arcade",
    visualBaseline: {
      preferred: "object-vector",
      rollbackDocumented: true
    },
    gameplay: [
      "player ship rotation, thrust, and fire",
      "asteroid spawning, splitting, and destruction",
      "score, lives, and wave progression",
      "title, start, game-over, and restart loop"
    ],
    contentPaths: [
      ...Object.values(createRuntimeObjectIdMap()).map((objectId) => `games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects.${objectId}`),
      definition.registry.tilemaps[0].path,
      ...definition.registry.parallaxSources.map((entry) => entry.path)
    ],
    runtimeEntry: {
      modulePath: "games/Asteroids/main.js",
      exportName: "bootAsteroids"
    }
  };
}

export function createAsteroidsPlatformDemoDefinition() {
  const registry = createRegistry();
  return {
    registry,
    spriteProject: createSpriteProject(),
    tileMapDocument: createTileMapDocument(),
    parallaxDocument: createParallaxDocument(),
    runtimeAssetSources: createRuntimeAssetSources(registry),
    demo: createDemoDetails({ registry })
  };
}

export function summarizeAsteroidsPlatformDemo(result) {
  const status = sanitizeText(result?.demo?.status);
  if (status !== "ready") {
    return "Asteroids platform demo unavailable.";
  }
  const pkg = result.demo.packageResult?.manifest?.package;
  const assetCount = Array.isArray(pkg?.assets) ? pkg.assets.length : 0;
  return `Asteroids platform demo ready with ${assetCount} packaged assets.`;
}

export async function buildAsteroidsPlatformDemo(options = {}) {
  const definition = createAsteroidsPlatformDemoDefinition();
  const registry = cloneJson(options.registry || definition.registry);
  const spriteProject = cloneJson(options.spriteProject || definition.spriteProject);
  const tileMapDocument = cloneJson(options.tileMapDocument || definition.tileMapDocument);
  const parallaxDocument = cloneJson(options.parallaxDocument || definition.parallaxDocument);
  const runtimeAssetSources = cloneJson(options.runtimeAssetSources || definition.runtimeAssetSources);
  const runtimeLookup = createRuntimeManifestAssetLookup({
    gameId: "Asteroids",
    runtimeAssetSources,
    sourceToolId: "runtime-adoption-09-13",
    missingBindingBehavior: "static",
    resolveImageAsset: buildImageSource
  });
  const runtimeBinding = runtimeLookup.binding;

  const validationResult = validateProjectAssetState({
    registry,
    spriteProject,
    tileMapDocument,
    parallaxDocument
  });
  const remediationResult = buildProjectAssetRemediation({
    registry,
    validationResult
  });
  const packageResult = buildProjectPackage({
    registry,
    validationResult,
    spriteProject,
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
  const performanceResult = buildPerformanceProfiler({
    validationResult,
    packageResult,
    runtimeResult
  });
  const debugVisualizationResult = buildDebugVisualizationLayer({
    assetDependencyGraph: validationResult.assetDependencyGraph,
    validationResult,
    remediationResult,
    packageResult,
    runtimeResult,
    assetRuntimeState: runtimeLookup.getDebugState?.() || null,
    performanceResult
  });
  const templateResult = buildGameTemplates({
    gameplayResult
  });
  const multiTargetExportResult = buildMultiTargetExport({
    validationResult,
    packageResult,
    registry,
    spriteProject,
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

  const runtimeManifest = runtimeResult.bootstrap?.packageManifest?.package || null;
  const runtimeStage = runtimeResult.bootstrap?.assetTable?.["tilemap.asteroids-stage"] || null;
  const handoff = {
    modulePath: sanitizeText(runtimeStage?.runtimeEntry?.modulePath) || "games/Asteroids/main.js",
    exportName: sanitizeText(runtimeStage?.runtimeEntry?.exportName) || "bootAsteroids",
    canvasId: sanitizeText(runtimeStage?.runtimeEntry?.canvasId) || "game",
    startupAssetIds: cloneJson(runtimeResult.bootstrap?.startupAssetIds || [])
  };
  const packageAssetIds = Array.isArray(packageResult.manifest?.package?.assets)
    ? packageResult.manifest.package.assets.map((asset) => sanitizeText(asset?.id))
    : [];
  const requiredObjectIds = Object.values(createRuntimeObjectIdMap());
  const objectRuntimeSources = Object.keys(runtimeAssetSources).filter((id) => id.startsWith("object."));
  const missingRequiredObjectIds = requiredObjectIds.filter((id) => !objectRuntimeSources.includes(id));
  const hasSpriteRuntimeDependency = packageAssetIds.includes("sprite.asteroids-demo");
  const objectVectorReady = missingRequiredObjectIds.length === 0 && !hasSpriteRuntimeDependency;

  const reports = [
    createReport("info", "ASTEROIDS_PLATFORM_DEMO_READY", "Asteroids demo completed strict validation, packaging, runtime, export, and publishing flows."),
    createReport("info", "ASTEROIDS_RUNTIME_HANDOFF", `Runtime handoff preserved ${handoff.exportName} from ${handoff.modulePath}.`),
    createReport("info", "ASTEROIDS_RUNTIME_BINDING_ADOPTED", "Manifest-driven runtime asset binding active for tilemaps and parallax; Object Vector sources resolve by object ID."),
    createReport("info", "ASTEROIDS_OBJECT_VECTOR_RUNTIME", "Runtime identity and geometry resolve through Object Vector Studio V2 object IDs."),
    createReport("info", "ASTEROIDS_ROLLBACK_NOTES_ONLY", "Rollback guidance remains documented historically and is not part of the active packaged runtime dependency set.")
  ];

  const reportText = [
    summarizeAsteroidsPlatformDemo({
      demo: {
        status: "ready",
        packageResult
      }
    }),
    `Validation: ${validationResult.validation.status} (${summarizeAssetValidation(validationResult)})`,
    `Packaging: ${summarizeProjectPackaging(packageResult)}`,
    `Runtime: ${summarizeRuntimeAssetLoader(runtimeResult)}`,
    `Gameplay: ${summarizeGameplaySystemLayer(gameplayResult)}`,
    `Templates: ${summarizeGameTemplates(templateResult)}`,
    `Export: ${summarizeMultiTargetExport(multiTargetExportResult)}`,
    `Publishing: ${summarizePublishingPipeline(publishingResult)}`,
    `Debug: ${summarizeDebugVisualizationLayer(debugVisualizationResult)}`,
    `Profiler: ${summarizePerformanceProfiler(performanceResult)}`,
    `Runtime entry: ${handoff.modulePath}#${handoff.exportName}`,
    `Visual path: ${definition.demo.visualBaseline.preferred} only`,
    `Required object vectors: ${requiredObjectIds.join(", ")}`,
    `Runtime object IDs: ${Object.values(createRuntimeObjectIdMap()).join(", ")}`,
    `Rollback notes: documented=${definition.demo.visualBaseline.rollbackDocumented}`,
    `Startup roots: ${(runtimeManifest?.roots || []).map((root) => root.id).join(", ")}`,
    `Gameplay pillars: ${definition.demo.gameplay.join("; ")}`,
    `Content paths: ${definition.demo.contentPaths.join(", ")}`,
    ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
  ].join("\n");

  return {
    demo: {
      version: 1,
      status: validationResult.validation.status === "valid"
        && packageResult.packageStatus === "ready"
        && runtimeResult.runtimeLoader.status === "ready"
        && multiTargetExportResult.multiTargetExport.status === "ready"
        && publishingResult.publishing.status === "ready"
        && objectVectorReady
        ? "ready"
        : "blocked",
      definition,
      validationResult,
      remediationResult,
      packageResult,
      runtimeResult,
      gameplayResult,
      templateResult,
      multiTargetExportResult,
      publishingResult,
      debugVisualizationResult,
      performanceResult,
      runtimeHandoff: handoff,
      runtimeBinding,
      runtimeAssetSources,
      runtimeLookupDebug: runtimeLookup.getDebugState?.() || null,
      objectVector: {
        requiredObjectIds,
        missingRequiredObjectIds,
        hasSpriteRuntimeDependency
      },
      reports,
      reportText
    }
  };
}

