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
const ASTEROIDS_LARGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 80 80"><path d="M -28 -12 L -10 -30 L 20 -26 L 32 -8 L 26 18 L 6 32 L -22 24 L -34 2 Z" /></svg>`;
const ASTEROIDS_TITLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48"><path d="M 6 40 L 24 6 L 42 40 Z" /><path d="M 58 40 L 58 8 L 88 8 L 88 18 L 70 18 L 70 22 L 86 22 L 86 32 L 70 32 L 70 40 Z" /><path d="M 100 40 L 100 8 L 112 8 L 128 26 L 128 8 L 140 8 L 140 40 L 128 40 L 112 22 L 112 40 Z" /><path d="M 154 40 L 154 8 L 184 8 L 184 18 L 166 18 L 166 22 L 182 22 L 182 32 L 166 32 L 166 40 Z" /><path d="M 194 40 L 212 6 L 214 40 Z" /></svg>`;

export function createVectorAssetSystemFixture() {
  const shipVector = normalizeSvgToVectorAsset({
    id: "vector.asteroids.ship",
    name: "Asteroids Ship",
    path: "games/Asteroids/assets/vectors/asteroids-ship.vector.json",
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_SHIP_SVG
  });
  const asteroidLargeVector = normalizeSvgToVectorAsset({
    id: "vector.asteroids.asteroid.large",
    name: "Asteroids Large Rock",
    path: "games/Asteroids/assets/vectors/asteroids-asteroid-large.vector.json",
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_LARGE_SVG
  });
  const titleVector = normalizeSvgToVectorAsset({
    id: "vector.asteroids.ui.title",
    name: "Asteroids Title Vector",
    path: "games/Asteroids/assets/vectors/asteroids-title.vector.json",
    paletteId: "palette.asteroids-hud",
    svgText: ASTEROIDS_TITLE_SVG
  });

  return {
    registry: {
      version: 1,
      projectId: "vector-asteroids-demo",
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
      vectors: [shipVector, asteroidLargeVector, titleVector],
      tilesets: [],
      tilemaps: [],
      images: [],
      parallaxSources: []
    },
    vectorDocument: {
      schema: "toolbox.vector/1",
      version: 1,
      name: "Asteroids Ship Vector Document",
      assetRefs: {
        vectorId: "vector.asteroids.ship",
        paletteId: "palette.asteroids-hud"
      }
    },
    runtimeAssets: {
      "palette.asteroids-hud": {
        kind: "palette",
        colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"]
      },
      "vector.asteroids.ship": cloneJson(shipVector)
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
    performanceResult
  });

  const reports = [
    createReport("info", "VECTOR_ASSET_SYSTEM_READY", "Vector assets integrate with validation, packaging, and runtime without engine core API changes."),
    createReport("info", "VECTOR_AUTHORING_BRIDGE", "Vector Asset Studio uses the SVG-focused tool flow as the authoring bridge for normalized vector output.")
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

