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

  add("validation", Array.isArray(validationResult?.validation?.findings) ? validationResult.validation.findings.length + 1 : 0);
  add("packaging", Array.isArray(packageResult?.manifest?.package?.assets) ? packageResult.manifest.package.assets.length : 0);
  add("runtime", Array.isArray(runtimeResult?.runtimeLoader?.loadedAssets) ? runtimeResult.runtimeLoader.loadedAssets.length : 0);
  add("suite", Array.isArray(platformValidationSuiteResult?.platformValidationSuite?.scenarios) ? platformValidationSuiteResult.platformValidationSuite.scenarios.length : 0);

  const samples = sortSamples(Array.from(sampleMap.values()));
  const bottleneck = samples[0] || createSample("none", 0);
  const summary = `${summarizePerformanceProfiler({ performance: { samples } })} Primary bottleneck stage: ${bottleneck.stage}.`;

  return {
    performance: {
      status: "ready",
      samples,
      bottleneck,
      reports: [
        createReport("info", "PROFILER_READY", `Deterministic profiler captured ${samples.length} platform samples.`),
        createReport("info", "PROFILER_BOTTLENECK", `Primary bottleneck stage is ${bottleneck.stage}.`)
      ],
      reportText: [
        summary,
        ...(platformValidationSuiteResult ? [`Suite: ${summarizePlatformValidationSuite(platformValidationSuiteResult)}`] : []),
        ...samples.map((sample) => `${sample.stage}: ${sample.units}`),
        `Bottleneck: ${bottleneck.stage}`
      ].join("\n")
    }
  };
}
