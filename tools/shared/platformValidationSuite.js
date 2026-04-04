import { validateProjectAssetState } from "./projectAssetValidation.js";
import { buildProjectAssetRemediation, getPrimaryRemediationAction } from "./projectAssetRemediation.js";
import { buildProjectPackage } from "./projectPackaging.js";
import { loadPackagedProjectRuntime } from "./runtimeAssetLoader.js";
import { buildRuntimeStreamingManifest, loadRuntimeStreamingChunks } from "./runtimeStreaming.js";
import { buildPluginArchitecture } from "./pluginArchitecture.js";
import { buildProjectVersioning } from "./projectVersioning.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function createScenario(id, status, summary, details = []) {
  return {
    id: sanitizeText(id),
    status: status === "pass" ? "pass" : "fail",
    summary: sanitizeText(summary),
    details: details.map((detail) => sanitizeText(detail)).filter(Boolean)
  };
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function formatScenarioReport(scenario) {
  return [
    `${scenario.status.toUpperCase()} ${scenario.id}`,
    `Summary: ${scenario.summary}`,
    ...scenario.details.map((detail) => `- ${detail}`)
  ].join("\n");
}

function createBaseRegistry() {
  return {
    version: 1,
    projectId: "platform-demo",
    palettes: [
      { id: "palette.hero", name: "Hero Palette", path: "assets/palettes/hero.json", colors: ["#112233FF"], sourceTool: "sprite-editor" }
    ],
    sprites: [
      { id: "sprite.hero", name: "Hero", path: "assets/sprites/hero.json", paletteId: "palette.hero", sourceTool: "sprite-editor" }
    ],
    tilesets: [
      { id: "tileset.overworld", name: "Overworld Tileset", path: "assets/tilesets/overworld.json", paletteId: "palette.hero", sourceTool: "tile-map-editor" }
    ],
    tilemaps: [
      { id: "tilemap.overworld", name: "Overworld", path: "assets/tilemaps/overworld.json", tilesetId: "tileset.overworld", sourceTool: "tile-map-editor" }
    ],
    images: [
      { id: "image.sky", name: "Sky", path: "assets/images/sky.png", sourceTool: "parallax-editor" }
    ],
    parallaxSources: [
      { id: "parallax.sky", name: "Sky Layer", path: "assets/parallax/sky.json", imageId: "image.sky", sourceTool: "parallax-editor" }
    ]
  };
}

function createValidTilemapDocument() {
  return {
    schema: "toolbox.tilemap/1",
    version: 1,
    map: { name: "Overworld", width: 32, height: 18, tileSize: 24 },
    assetRefs: {
      tilemapId: "tilemap.overworld",
      tilesetId: "tileset.overworld",
      parallaxSourceIds: ["parallax.sky"]
    }
  };
}

function createLoaders(loadOrder) {
  return {
    data: async (id) => {
      loadOrder.push(id);
      return { id, loaded: true };
    }
  };
}

async function runGoldenPathScenario(registry, tileMapDocument) {
  const validation = validateProjectAssetState({ registry, tileMapDocument });
  const packageResult = buildProjectPackage({ registry, validationResult: validation, tileMapDocument });
  const loadOrder = [];
  const runtime = await loadPackagedProjectRuntime({
    packageManifest: packageResult.manifest,
    loaders: createLoaders(loadOrder),
    imageLoader: {
      load: async (id) => {
        loadOrder.push(id);
        return { id, loaded: true };
      }
    }
  });

  const passed = validation.validation.status === "valid"
    && packageResult.packageStatus === "ready"
    && runtime.runtimeLoader.status === "ready";
  return createScenario(
    "baseline-valid-flow",
    passed ? "pass" : "fail",
    passed ? "Valid baseline project passed validation, packaging, and runtime." : "Valid baseline flow failed.",
    [
      `validation=${validation.validation.status}`,
      `package=${packageResult.packageStatus}`,
      `runtime=${runtime.runtimeLoader.status}`,
      `loadOrder=${loadOrder.join(", ")}`
    ]
  );
}

function runInvalidReferenceScenario(registry) {
  const invalidDocument = createValidTilemapDocument();
  invalidDocument.assetRefs.tilesetId = "tileset.missing";
  const validation = validateProjectAssetState({ registry, tileMapDocument: invalidDocument });
  const packageResult = buildProjectPackage({ registry, validationResult: validation, tileMapDocument: invalidDocument });
  const passed = validation.validation.status === "invalid" && packageResult.packageStatus === "blocked";
  return createScenario(
    "invalid-reference-flow",
    passed ? "pass" : "fail",
    passed ? "Invalid project failed at enforced validation and packaging boundaries." : "Invalid reference flow did not fail at the expected boundary.",
    [
      `validation=${validation.validation.status}`,
      `blockingFindings=${validation.validation.findings.filter((finding) => finding.blocking).length}`,
      `package=${packageResult.packageStatus}`
    ]
  );
}

function runRemediationScenario(registry) {
  const invalidDocument = createValidTilemapDocument();
  invalidDocument.assetRefs.tilesetId = "tileset.missing";
  const invalidValidation = validateProjectAssetState({ registry, tileMapDocument: invalidDocument });
  const remediation = buildProjectAssetRemediation({ validationResult: invalidValidation, registry });
  const primaryFix = getPrimaryRemediationAction(remediation, "confirmable-fix");
  if (primaryFix?.payload?.fixKind === "relink-reference") {
    invalidDocument.assetRefs.tilesetId = primaryFix.payload.candidateId || invalidDocument.assetRefs.tilesetId;
  }
  const fixedValidation = validateProjectAssetState({ registry, tileMapDocument: invalidDocument });
  const passed = primaryFix?.payload?.candidateId === "tileset.overworld" && fixedValidation.validation.status === "valid";
  return createScenario(
    "remediation-recovery-flow",
    passed ? "pass" : "fail",
    passed ? "Remediation guidance restored the project to a valid state." : "Remediation did not recover the invalid project.",
    [
      `fixAction=${primaryFix?.actionId || "none"}`,
      `candidate=${primaryFix?.payload?.candidateId || "none"}`,
      `postValidation=${fixedValidation.validation.status}`
    ]
  );
}

async function runPackagingAndRuntimeDeterminismScenario(registry, tileMapDocument) {
  const firstValidation = validateProjectAssetState({ registry, tileMapDocument });
  const firstPackage = buildProjectPackage({ registry, validationResult: firstValidation, tileMapDocument });
  const secondValidation = validateProjectAssetState({ registry, tileMapDocument });
  const secondPackage = buildProjectPackage({ registry, validationResult: secondValidation, tileMapDocument });
  const firstOrder = [];
  const secondOrder = [];
  const firstRuntime = await loadPackagedProjectRuntime({
    packageManifest: firstPackage.manifest,
    loaders: createLoaders(firstOrder),
    imageLoader: { load: async (id) => { firstOrder.push(id); return { id, loaded: true }; } }
  });
  const secondRuntime = await loadPackagedProjectRuntime({
    packageManifest: secondPackage.manifest,
    loaders: createLoaders(secondOrder),
    imageLoader: { load: async (id) => { secondOrder.push(id); return { id, loaded: true }; } }
  });
  const passed = JSON.stringify(firstPackage.manifest) === JSON.stringify(secondPackage.manifest)
    && JSON.stringify(firstOrder) === JSON.stringify(secondOrder)
    && firstRuntime.runtimeLoader.status === "ready"
    && secondRuntime.runtimeLoader.status === "ready";
  return createScenario(
    "deterministic-packaging-runtime-flow",
    passed ? "pass" : "fail",
    passed ? "Packaging and runtime ordering remained deterministic across repeated runs." : "Packaging or runtime ordering was not deterministic.",
    [
      `packageStable=${JSON.stringify(firstPackage.manifest) === JSON.stringify(secondPackage.manifest)}`,
      `runtimeStable=${JSON.stringify(firstOrder) === JSON.stringify(secondOrder)}`,
      `loadOrder=${firstOrder.join(", ")}`
    ]
  );
}

async function runRuntimeFailureScenario() {
  const result = await loadPackagedProjectRuntime({
    packageManifest: {
      package: {
        version: 1,
        projectId: "broken-runtime",
        roots: [{ id: "sprite.hero", type: "sprite" }],
        assets: [{ id: "sprite.hero", type: "sprite", path: "assets/sprites/hero.json" }],
        dependencies: []
      }
    },
    resolvePackagedAsset: () => null
  });
  const passed = result.runtimeLoader.status === "failed" && result.runtimeLoader.failedAt === "sprite.hero";
  return createScenario(
    "runtime-fail-fast-flow",
    passed ? "pass" : "fail",
    passed ? "Runtime loader failed fast on missing packaged asset input." : "Runtime loader did not fail at the expected packaged boundary.",
    [
      `runtime=${result.runtimeLoader.status}`,
      `failedAt=${result.runtimeLoader.failedAt || "none"}`,
      `code=${result.runtimeLoader.reports.at(-1)?.code || "none"}`
    ]
  );
}

async function runStreamingScenario(registry, tileMapDocument) {
  const validation = validateProjectAssetState({ registry, tileMapDocument });
  const packageResult = buildProjectPackage({ registry, validationResult: validation, tileMapDocument });
  const plan = buildRuntimeStreamingManifest({ packageManifest: packageResult.manifest, chunkSize: 1 });
  const loadOrder = [];
  const streamResult = await loadRuntimeStreamingChunks({
    streamingManifest: plan.streaming.packageManifest,
    chunkIds: plan.streaming.chunks.map((chunk) => chunk.id),
    loaders: createLoaders(loadOrder),
    imageLoader: { load: async (id) => { loadOrder.push(id); return { id, loaded: true }; } }
  });
  const passed = plan.streaming.status === "ready" && streamResult.streaming.status === "ready";
  return createScenario(
    "streaming-flow",
    passed ? "pass" : "fail",
    passed ? "Streaming preserved strict packaged correctness." : "Streaming failed to preserve strict packaged correctness.",
    [
      `chunks=${plan.streaming.chunks.map((chunk) => `${chunk.id}:${chunk.assetIds.join(",")}`).join(" | ")}`,
      `streamStatus=${streamResult.streaming.status}`,
      `loaded=${streamResult.streaming.loadedAssets.map((asset) => asset.id).join(", ")}`
    ]
  );
}

function runPluginScenario(registry, tileMapDocument) {
  const validation = validateProjectAssetState({ registry, tileMapDocument });
  const packageResult = buildProjectPackage({ registry, validationResult: validation, tileMapDocument });
  const pluginResult = buildPluginArchitecture({
    hostPackageManifest: packageResult.manifest,
    pluginManifests: [
      {
        plugin: {
          id: "weatherpack",
          version: 1,
          roots: [{ id: "weatherpack.layer", type: "parallaxLayer" }],
          assets: [{ id: "weatherpack.layer", type: "parallaxLayer", path: "plugins/weatherpack/layer.json" }],
          dependencies: [{ from: "weatherpack.layer", to: "parallax.sky", type: "extendsRuntime" }]
        }
      }
    ]
  });
  const passed = pluginResult.plugins.status === "ready"
    && pluginResult.plugins.mergedPackageManifest.package.assets.some((asset) => asset.id === "weatherpack.layer");
  return createScenario(
    "plugin-integration-flow",
    passed ? "pass" : "fail",
    passed ? "Plugin integration remained isolated and packaging-safe." : "Plugin integration violated packaging or isolation rules.",
    [
      `pluginStatus=${pluginResult.plugins.status}`,
      `accepted=${pluginResult.plugins.acceptedPlugins.length}`,
      `roots=${pluginResult.plugins.mergedPackageManifest?.package?.roots?.map((root) => root.id).join(", ") || "none"}`
    ]
  );
}

function runVersioningScenario(registry, tileMapDocument) {
  const validation = validateProjectAssetState({ registry, tileMapDocument });
  const packageResult = buildProjectPackage({ registry, validationResult: validation, tileMapDocument });
  const compatible = buildProjectVersioning({
    currentSchemaVersion: 1,
    projectDocument: { schema: tileMapDocument.schema, version: tileMapDocument.version },
    packageManifest: packageResult.manifest
  });
  const migrationNeeded = buildProjectVersioning({
    currentSchemaVersion: 2,
    projectDocument: { schema: tileMapDocument.schema, version: tileMapDocument.version },
    packageManifest: packageResult.manifest
  });
  const passed = compatible.versioning.status === "compatible" && migrationNeeded.versioning.status === "migration-needed";
  return createScenario(
    "versioning-compatibility-flow",
    passed ? "pass" : "fail",
    passed ? "Versioning reported compatibility and migration-needed states correctly." : "Versioning compatibility checks failed.",
    [
      `compatible=${compatible.versioning.status}`,
      `migrationNeeded=${migrationNeeded.versioning.status}`,
      `steps=${migrationNeeded.versioning.migrationSteps.join(" | ")}`
    ]
  );
}

export function summarizePlatformValidationSuite(result) {
  const suite = result?.platformValidationSuite;
  if (!suite || typeof suite !== "object") {
    return "Platform validation suite unavailable.";
  }
  const passCount = Array.isArray(suite.scenarios) ? suite.scenarios.filter((scenario) => scenario.status === "pass").length : 0;
  const totalCount = Array.isArray(suite.scenarios) ? suite.scenarios.length : 0;
  return `Platform validation suite ${suite.status} with ${passCount}/${totalCount} scenarios passing.`;
}

export async function runPlatformValidationSuite(options = {}) {
  const registry = cloneJson(options.registry || createBaseRegistry());
  const tileMapDocument = cloneJson(options.tileMapDocument || createValidTilemapDocument());
  const scenarios = [
    await runGoldenPathScenario(registry, tileMapDocument),
    runInvalidReferenceScenario(registry),
    runRemediationScenario(registry),
    await runPackagingAndRuntimeDeterminismScenario(registry, tileMapDocument),
    await runRuntimeFailureScenario(),
    await runStreamingScenario(registry, tileMapDocument),
    runPluginScenario(registry, tileMapDocument),
    runVersioningScenario(registry, tileMapDocument)
  ];
  const status = scenarios.every((scenario) => scenario.status === "pass") ? "pass" : "fail";
  const reports = [
    createReport("info", "SUITE_STATUS", `Platform validation suite completed with status ${status}.`),
    createReport("info", "SCENARIO_COUNT", `Validated ${scenarios.length} deterministic platform scenarios.`)
  ];

  return {
    platformValidationSuite: {
      version: 1,
      status,
      scenarios,
      reports,
      reportText: [
        summarizePlatformValidationSuite({ platformValidationSuite: { scenarios, status } }),
        ...scenarios.map((scenario) => formatScenarioReport(scenario)),
        ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
      ].join("\n\n")
    }
  };
}
