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

function createRegistry() {
  return {
    version: 1,
    projectId: "asteroids-platform-demo",
    palettes: [
      {
        id: "palette.asteroids-hud",
        name: "Asteroids HUD Palette",
        path: "games/Asteroids/platform/assets/palettes/asteroids-hud.palette.json",
        colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"],
        sourceTool: "sprite-editor"
      }
    ],
    sprites: [
      {
        id: "sprite.asteroids-demo",
        name: "Asteroids Demo Atlas",
        path: "games/Asteroids/platform/assets/sprites/asteroids-demo.sprite.json",
        paletteId: "palette.asteroids-hud",
        sourceTool: "sprite-editor"
      }
    ],
    tilesets: [
      {
        id: "tileset.asteroids-ui",
        name: "Asteroids UI Tileset",
        path: "games/Asteroids/platform/assets/tilesets/asteroids-ui.tileset.json",
        paletteId: "palette.asteroids-hud",
        tileWidth: 8,
        tileHeight: 8,
        sourceTool: "tile-map-editor"
      }
    ],
    tilemaps: [
      {
        id: "tilemap.asteroids-stage",
        name: "Asteroids Demo Stage",
        path: "games/Asteroids/platform/assets/tilemaps/asteroids-stage.tilemap.json",
        tilesetId: "tileset.asteroids-ui",
        sourceTool: "tile-map-editor"
      }
    ],
    images: [
      {
        id: "image.asteroids-preview",
        name: "Asteroids Preview",
        path: "games/Asteroids/assets/preview.png",
        sourceTool: "parallax-editor"
      },
      {
        id: "image.asteroids-bezel",
        name: "Asteroids Bezel",
        path: "games/Asteroids/assets/asteroids-bezel.png",
        sourceTool: "parallax-editor"
      }
    ],
    parallaxSources: [
      {
        id: "parallax.asteroids-title",
        name: "Asteroids Title Layer",
        path: "games/Asteroids/platform/assets/parallax/asteroids-title.parallax.json",
        imageId: "image.asteroids-preview",
        sourceTool: "parallax-editor"
      },
      {
        id: "parallax.asteroids-overlay",
        name: "Asteroids Overlay Layer",
        path: "games/Asteroids/platform/assets/parallax/asteroids-overlay.parallax.json",
        imageId: "image.asteroids-bezel",
        sourceTool: "parallax-editor"
      }
    ]
  };
}

function createSpriteProject() {
  return {
    schema: "toolbox.sprite/1",
    version: 1,
    name: "Asteroids Demo Sprite Project",
    assetRefs: {
      spriteId: "sprite.asteroids-demo",
      paletteId: "palette.asteroids-hud"
    },
    content: {
      ship: "player-ship",
      bullet: "player-bullet",
      asteroidLarge: "asteroid-large",
      asteroidMedium: "asteroid-medium",
      asteroidSmall: "asteroid-small",
      ui: ["title-logo", "score-label", "lives-icon", "game-over-label"]
    }
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

function createRuntimeAssetSources() {
  return {
    "palette.asteroids-hud": {
      kind: "palette",
      file: "games/Asteroids/platform/assets/palettes/asteroids-hud.palette.json",
      colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"]
    },
    "sprite.asteroids-demo": {
      kind: "sprite",
      file: "games/Asteroids/platform/assets/sprites/asteroids-demo.sprite.json",
      content: {
        ship: "player-ship",
        bullets: ["player-bullet"],
        asteroids: ["asteroid-large", "asteroid-medium", "asteroid-small"],
        ui: ["title-logo", "score-label", "lives-icon", "wave-label", "game-over-label"]
      }
    },
    "tileset.asteroids-ui": {
      kind: "tileset",
      file: "games/Asteroids/platform/assets/tilesets/asteroids-ui.tileset.json",
      hudFrames: ["score-panel", "lives-panel", "wave-panel"]
    },
    "tilemap.asteroids-stage": {
      kind: "tilemap",
      file: "games/Asteroids/platform/assets/tilemaps/asteroids-stage.tilemap.json",
      gameplayLoop: {
        title: true,
        start: true,
        gameplay: true,
        gameOver: true,
        restart: true
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
        waves: true
      }
    },
    "parallax.asteroids-overlay": {
      kind: "parallaxLayer",
      file: "games/Asteroids/platform/assets/parallax/asteroids-overlay.parallax.json",
      role: "gameplay-overlay"
    },
    "parallax.asteroids-title": {
      kind: "parallaxLayer",
      file: "games/Asteroids/platform/assets/parallax/asteroids-title.parallax.json",
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

function createResolvePackagedAsset(assetSources) {
  return (asset) => {
    const assetId = sanitizeText(asset?.id);
    if (sanitizeText(asset?.type) === "image") {
      return buildImageSource(asset);
    }
    return assetSources[assetId] ? cloneJson(assetSources[assetId]) : null;
  };
}

function createDemoDetails(definition) {
  return {
    title: "Asteroids Platform Demo",
    templateCandidate: "arcade",
    gameplay: [
      "player ship rotation, thrust, and fire",
      "asteroid spawning, splitting, and destruction",
      "score, lives, and wave progression",
      "title, start, game-over, and restart loop"
    ],
    contentPaths: [
      definition.registry.sprites[0].path,
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
    runtimeAssetSources: createRuntimeAssetSources(),
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
    resolvePackagedAsset: createResolvePackagedAsset(runtimeAssetSources)
  });
  const gameplayResult = buildGameplaySystemLayer({
    runtimeResult
  });
  const debugVisualizationResult = buildDebugVisualizationLayer({
    assetDependencyGraph: validationResult.assetDependencyGraph,
    validationResult,
    remediationResult,
    packageResult,
    runtimeResult
  });
  const performanceResult = buildPerformanceProfiler({
    validationResult,
    packageResult,
    runtimeResult
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

  const reports = [
    createReport("info", "ASTEROIDS_PLATFORM_DEMO_READY", "Asteroids demo completed strict validation, packaging, runtime, export, and publishing flows."),
    createReport("info", "ASTEROIDS_RUNTIME_HANDOFF", `Runtime handoff preserved ${handoff.exportName} from ${handoff.modulePath}.`)
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
      reports,
      reportText
    }
  };
}
