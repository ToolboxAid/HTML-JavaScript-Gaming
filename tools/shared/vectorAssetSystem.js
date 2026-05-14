import { validateProjectAssetState, summarizeAssetValidation } from "./projectAssetValidation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "./projectPackaging.js";
import { loadPackagedProjectRuntime, summarizeRuntimeAssetLoader } from "./runtimeAssetLoader.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "./debugVisualizationLayer.js";
import { buildPerformanceProfiler, summarizePerformanceProfiler } from "./performanceProfiler.js";
import { normalizeSvgToVectorAsset, summarizeVectorAssetDefinition } from "./vector/vectorAssetBridge.js";
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

const ASTEROIDS_SHIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 48 48"><path d="M 0 -18 L 14 16 L 0 8 L -14 16 Z" /><path d="M -6 14 L 0 6 L 6 14" /></svg>`;
const ASTEROIDS_LARGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><path d="M 10 40 L 50 20 L 45 5 L 25 -10 L 50 -35 L 30 -45 L 10 -38 L -20 -45 L -43 -18 L -43 20 L -25 20 L -25 40 Z" /></svg>`;
const ASTEROIDS_MEDIUM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-28 -28 56 56"><path d="M -16 -10 L -2 -18 L 16 -14 L 20 2 L 8 18 L -10 16 L -20 4 Z" /></svg>`;
const ASTEROIDS_SMALL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -18 36 36"><path d="M -10 -6 L 0 -12 L 10 -6 L 8 8 L -6 10 L -12 0 Z" /></svg>`;
const ASTEROIDS_OBJECT_VECTOR_MANIFEST_PATH = "games/Asteroids/game.manifest.json#tools.object-vector-studio-v2.objects";

export function createVectorAssetSystemFixture() {
  const shipVector = normalizeSvgToVectorAsset({
    id: "object.asteroids.ship",
    name: "Asteroids Ship",
    path: `${ASTEROIDS_OBJECT_VECTOR_MANIFEST_PATH}.object.asteroids.ship`,
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_SHIP_SVG
  });
  const asteroidLargeVector = normalizeSvgToVectorAsset({
    id: "object.asteroids.asteroid.large",
    name: "Asteroids Large Rock",
    path: `${ASTEROIDS_OBJECT_VECTOR_MANIFEST_PATH}.object.asteroids.asteroid.large`,
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_LARGE_SVG
  });
  const asteroidMediumVector = normalizeSvgToVectorAsset({
    id: "object.asteroids.asteroid.medium",
    name: "Asteroids Medium Rock",
    path: `${ASTEROIDS_OBJECT_VECTOR_MANIFEST_PATH}.object.asteroids.asteroid.medium`,
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_MEDIUM_SVG
  });
  const asteroidSmallVector = normalizeSvgToVectorAsset({
    id: "object.asteroids.asteroid.small",
    name: "Asteroids Small Rock",
    path: `${ASTEROIDS_OBJECT_VECTOR_MANIFEST_PATH}.object.asteroids.asteroid.small`,
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_SMALL_SVG
  });

  return {
    registry: {
      version: 1,
      projectId: "object-vector-asteroids-demo",
      palettes: [
        {
          id: "palette.asteroids-hud",
          name: "Asteroids HUD Palette",
          path: "",
          colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"],
          sourceTool: "pixel-asset-studio"
        }
      ],
      sprites: [],
      vectors: [
        shipVector,
        asteroidLargeVector,
        asteroidMediumVector,
        asteroidSmallVector
      ],
      tilesets: [],
      tilemaps: [],
      images: [],
      parallaxSources: []
    },
    vectorDocument: {
      schema: "toolbox.vector/1",
      version: 1,
      name: "Asteroids Object Vector Document",
      assetRefs: {
        vectorId: "object.asteroids.ship",
        vectorIds: [
          "object.asteroids.ship",
          "object.asteroids.asteroid.large",
          "object.asteroids.asteroid.medium",
          "object.asteroids.asteroid.small"
        ],
        paletteId: "palette.asteroids-hud"
      }
    },
    runtimeAssets: {
      "palette.asteroids-hud": {
        kind: "palette",
        colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"]
      },
      "object.asteroids.ship": cloneJson(shipVector),
      "object.asteroids.asteroid.large": cloneJson(asteroidLargeVector),
      "object.asteroids.asteroid.medium": cloneJson(asteroidMediumVector),
      "object.asteroids.asteroid.small": cloneJson(asteroidSmallVector)
    }
  };
}

export async function buildVectorAssetSystem(options = {}) {
  const fixture = createVectorAssetSystemFixture();
  const registry = cloneJson(options.registry || fixture.registry);
  const vectorDocument = cloneJson(options.vectorDocument || fixture.vectorDocument);
  const runtimeAssets = cloneJson(options.runtimeAssets || fixture.runtimeAssets);
  const runtimeLookup = createRuntimeManifestAssetLookup({
    gameId: "Asteroids",
    runtimeAssetSources: runtimeAssets,
    sourceToolId: "runtime-adoption-09-13",
    missingBindingBehavior: "static"
  });

  const validationResult = validateProjectAssetState({
    registry,
    vectorDocument
  });
  const packageResult = buildProjectPackage({
    registry,
    validationResult,
    vectorDocument
  });
  const runtimeResult = await loadPackagedProjectRuntime({
    packageManifest: packageResult.manifest,
    resolvePackagedAsset: runtimeLookup.resolvePackagedAsset
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

  const reports = [
    createReport("info", "VECTOR_ASSET_SYSTEM_READY", "Vector assets integrate with validation, packaging, and runtime without engine core API changes."),
    createReport("info", "VECTOR_AUTHORING_BRIDGE", "SVG Asset Studio uses the SVG-focused tool flow as the authoring bridge for normalized vector output.")
  ];

  return {
    vectorAssetSystem: {
      status: validationResult.validation.status === "valid"
        && packageResult.packageStatus === "ready"
        && runtimeResult.runtimeLoader.status === "ready"
        ? "ready"
        : "blocked",
      registry,
      vectorDocument,
      validationResult,
      packageResult,
      runtimeResult,
      runtimeLookupDebug: runtimeLookup.getDebugState?.() || null,
      debugVisualizationResult,
      performanceResult,
      reports,
      reportText: [
        summarizeVectorAssetDefinition(registry.vectors?.[0]),
        `Validation: ${summarizeAssetValidation(validationResult)}`,
        `Packaging: ${summarizeProjectPackaging(packageResult)}`,
        `Runtime: ${summarizeRuntimeAssetLoader(runtimeResult)}`,
        `Debug: ${summarizeDebugVisualizationLayer(debugVisualizationResult)}`,
        `Profiler: ${summarizePerformanceProfiler(performanceResult)}`,
        ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
      ].join("\n")
    }
  };
}

