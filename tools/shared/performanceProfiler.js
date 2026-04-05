import { summarizePlatformValidationSuite } from "./platformValidationSuite.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createSample(stage, units) {
  return {
    stage: sanitizeText(stage),
    units: Number.isFinite(units) ? units : 0
  };
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function sortSamples(samples) {
  return samples.slice().sort((left, right) => {
    const byUnits = right.units - left.units;
    if (byUnits !== 0) {
      return byUnits;
    }
    return left.stage.localeCompare(right.stage);
  });
}

function summarizeGeometryParticipation(runtimeResult) {
  const loadedAssets = Array.isArray(runtimeResult?.runtimeLoader?.loadedAssets) ? runtimeResult.runtimeLoader.loadedAssets : [];
  const geometryAssets = loadedAssets
    .map((entry) => entry?.asset)
    .filter((asset) => sanitizeText(asset?.runtimeKind) === "vector-geometry");
  return {
    assetCount: geometryAssets.length,
    renderableCount: geometryAssets.reduce((total, asset) => total + (Array.isArray(asset?.renderables) ? asset.renderables.length : 0), 0),
    collisionPrimitiveCount: geometryAssets.reduce((total, asset) => total + (Array.isArray(asset?.collisionPrimitives) ? asset.collisionPrimitives.length : 0), 0)
  };
}

export function summarizePerformanceProfiler(result) {
  const samples = Array.isArray(result?.performance?.samples) ? result.performance.samples : [];
  if (samples.length === 0) {
    return "Performance profiler unavailable.";
  }
  return `Performance profiler captured ${samples.length} deterministic samples.`;
}

export function buildPerformanceProfiler(options = {}) {
  const sampleMap = new Map();
  const add = (stage, units) => {
    sampleMap.set(stage, createSample(stage, units));
  };

  const validationResult = options.validationResult || null;
  const packageResult = options.packageResult || null;
  const runtimeResult = options.runtimeResult || null;
  const platformValidationSuiteResult = options.platformValidationSuiteResult || null;
  const geometryParticipation = summarizeGeometryParticipation(runtimeResult);

  add("validation", Array.isArray(validationResult?.validation?.findings) ? validationResult.validation.findings.length + 1 : 0);
  add("packaging", Array.isArray(packageResult?.manifest?.package?.assets) ? packageResult.manifest.package.assets.length : 0);
  add("runtime", Array.isArray(runtimeResult?.runtimeLoader?.loadedAssets) ? runtimeResult.runtimeLoader.loadedAssets.length : 0);
  add("suite", Array.isArray(platformValidationSuiteResult?.platformValidationSuite?.scenarios) ? platformValidationSuiteResult.platformValidationSuite.scenarios.length : 0);
  if (geometryParticipation.assetCount > 0 || geometryParticipation.renderableCount > 0) {
    add("geometry", geometryParticipation.renderableCount + geometryParticipation.collisionPrimitiveCount);
  }

  const samples = sortSamples(Array.from(sampleMap.values()));
  const bottleneck = samples[0] || createSample("none", 0);
  const summary = `${summarizePerformanceProfiler({ performance: { samples } })} Primary bottleneck stage: ${bottleneck.stage}.`;

  return {
    performance: {
      status: "ready",
      samples,
      bottleneck,
      geometryParticipation,
      reports: [
        createReport("info", "PROFILER_READY", `Deterministic profiler captured ${samples.length} platform samples.`),
        createReport("info", "PROFILER_BOTTLENECK", `Primary bottleneck stage is ${bottleneck.stage}.`),
        createReport("info", "PROFILER_GEOMETRY", `Geometry participation includes ${geometryParticipation.assetCount} vector runtime asset${geometryParticipation.assetCount === 1 ? "" : "s"} and ${geometryParticipation.renderableCount} renderable primitive${geometryParticipation.renderableCount === 1 ? "" : "s"}.`)
      ],
      reportText: [
        summary,
        ...(platformValidationSuiteResult ? [`Suite: ${summarizePlatformValidationSuite(platformValidationSuiteResult)}`] : []),
        ...samples.map((sample) => `${sample.stage}: ${sample.units}`),
        `Geometry: assets=${geometryParticipation.assetCount}, renderables=${geometryParticipation.renderableCount}, collisionPrimitives=${geometryParticipation.collisionPrimitiveCount}`,
        `Bottleneck: ${bottleneck.stage}`
      ].join("\n")
    }
  };
}
