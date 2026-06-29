import { sanitizeText } from "../string/strings.js";
import { validateProjectAssetState, summarizeAssetValidation } from "./projectAssetValidation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "./projectPackaging.js";
import { loadPackagedProjectRuntime, summarizeRuntimeAssetLoader } from "./runtimeAssetLoader.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "./debugVisualizationLayer.js";
import { buildPerformanceProfiler, summarizePerformanceProfiler } from "./performanceProfiler.js";
import { normalizeSvgToVectorAsset, summarizeVectorAssetDefinition } from "./vector/vectorAssetBridge.js";
import { cloneJson } from "../json/clone.js";
import { createRuntimeManifestAssetLookup } from "./pipeline/runtimeAssetLookup.js";

const DEFAULT_VECTOR_FIXTURE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20"><path d="M 0 -8 L 6 8 L 0 4 L -6 8 Z" /></svg>';

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function createDefaultPalette() {
  return {
    id: "palette.vector-demo",
    name: "Vector Demo Palette",
    path: "",
    colors: ["#05070DFF", "#DCE8FFFF", "#78B7FFFF", "#FFBE64FF"],
    sourceTool: "pixel-asset-studio"
  };
}

function createDefaultVector(paletteId) {
  return normalizeSvgToVectorAsset({
    id: "vector.demo.ship",
    name: "Demo Ship",
    path: "src/shared/toolbox/vectorAssetSystem.js#fixture.vector.demo.ship",
    paletteId,
    svgText: DEFAULT_VECTOR_FIXTURE_SVG
  });
}

function normalizeFixtureVectors(vectors, paletteId) {
  if (Array.isArray(vectors) && vectors.length > 0) {
    return vectors.map((vector) => cloneJson(vector));
  }
  return [createDefaultVector(paletteId)];
}

function createRuntimeAssets(palette, vectors, runtimeAssets) {
  return {
    [palette.id]: {
      kind: "palette",
      colors: cloneJson(palette.colors)
    },
    ...vectors.reduce((accumulator, vector) => {
      accumulator[vector.id] = cloneJson(vector);
      return accumulator;
    }, {}),
    ...(runtimeAssets && typeof runtimeAssets === "object" ? cloneJson(runtimeAssets) : {})
  };
}

export function createVectorAssetSystemFixture(options = {}) {
  const palette = cloneJson(options.palette || createDefaultPalette());
  const vectors = normalizeFixtureVectors(options.vectors, palette.id);
  const vectorIds = vectors.map((vector) => sanitizeText(vector.id)).filter(Boolean);

  return {
    registry: {
      version: 1,
      projectId: sanitizeText(options.projectId) || "vector-asset-system-demo",
      palettes: [palette],
      sprites: [],
      vectors,
      tilesets: [],
      tilemaps: [],
      images: [],
      parallaxSources: []
    },
    vectorDocument: cloneJson(options.vectorDocument || {
      schema: "toolbox.vector/1",
      version: 1,
      name: "Vector Asset System Document",
      assetRefs: {
        vectorId: vectorIds[0] || "",
        vectorIds,
        paletteId: palette.id
      }
    }),
    runtimeAssets: createRuntimeAssets(palette, vectors, options.runtimeAssets)
  };
}

export async function buildVectorAssetSystem(options = {}) {
  const fixture = createVectorAssetSystemFixture(options.fixtureOptions || options);
  const registry = cloneJson(options.registry || fixture.registry);
  const vectorDocument = cloneJson(options.vectorDocument || fixture.vectorDocument);
  const runtimeAssets = cloneJson(options.runtimeAssets || fixture.runtimeAssets);
  const runtimeLookup = createRuntimeManifestAssetLookup({
    gameId: sanitizeText(options.gameId) || "VectorDemo",
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
    createReport("info", "VECTOR_AUTHORING_BRIDGE", "Object Vector Studio V2 is the active vector asset authoring bridge for normalized vector output.")
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
