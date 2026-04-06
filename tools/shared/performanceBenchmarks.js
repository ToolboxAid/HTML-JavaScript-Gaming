/*
Toolbox Aid
David Quesenberry
04/05/2026
performanceBenchmarks.js
*/

export const PERFORMANCE_BENCHMARK_CONTRACT_ID = "toolbox.performance.benchmarks";
export const PERFORMANCE_BENCHMARK_CONTRACT_VERSION = "1.0.0";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function createReport(level, code, message, details = {}) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code) || "BENCHMARK_REPORT",
    message: sanitizeText(message) || "Benchmark report entry.",
    details: isObject(details) ? cloneJson(details) : {}
  };
}

function normalizeThreshold(entry, index) {
  const source = isObject(entry) ? entry : {};
  return {
    stage: sanitizeText(source.stage),
    maxUnits: normalizeNumber(source.maxUnits, Number.POSITIVE_INFINITY),
    label: sanitizeText(source.label) || sanitizeText(source.stage) || `threshold-${index + 1}`,
    severity: sanitizeText(source.severity) || "error"
  };
}

function normalizeThresholds(value) {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((entry, index) => normalizeThreshold(entry, index))
    .filter((entry) => entry.stage && Number.isFinite(entry.maxUnits));
}

function normalizeSamples(value) {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((entry) => ({
      stage: sanitizeText(entry?.stage),
      units: normalizeNumber(entry?.units, NaN)
    }))
    .filter((entry) => entry.stage && Number.isFinite(entry.units));
}

function normalizeMissingStageBehavior(value) {
  const token = sanitizeText(value).toLowerCase();
  return token === "skip" ? "skip" : "fail";
}

export function createPerformanceBenchmarkSuite(options = {}) {
  const thresholds = normalizeThresholds(options.thresholds);
  return {
    contractId: PERFORMANCE_BENCHMARK_CONTRACT_ID,
    contractVersion: PERFORMANCE_BENCHMARK_CONTRACT_VERSION,
    suiteId: sanitizeText(options.suiteId) || "default.performance.benchmark.suite",
    title: sanitizeText(options.title) || "Performance Benchmark Suite",
    missingStageBehavior: normalizeMissingStageBehavior(options.missingStageBehavior),
    thresholds
  };
}

export function createDefaultPerformanceBenchmarkSuite(overrides = {}) {
  const baseThresholds = [
    { stage: "validation", maxUnits: 10, label: "Validation Budget" },
    { stage: "packaging", maxUnits: 10, label: "Packaging Budget" },
    { stage: "runtime", maxUnits: 10, label: "Runtime Budget" },
    { stage: "suite", maxUnits: 10, label: "Suite Budget" },
    { stage: "geometry", maxUnits: 12, label: "Geometry Budget" }
  ];

  return createPerformanceBenchmarkSuite({
    ...overrides,
    thresholds: Array.isArray(overrides.thresholds) ? overrides.thresholds : baseThresholds
  });
}

function evaluateThreshold(threshold, sample, missingStageBehavior) {
  if (!sample) {
    if (missingStageBehavior === "skip") {
      return {
        stage: threshold.stage,
        label: threshold.label,
        status: "skipped",
        thresholdUnits: threshold.maxUnits,
        actualUnits: null,
        message: `Stage ${threshold.stage} missing and skipped by suite rule.`
      };
    }

    return {
      stage: threshold.stage,
      label: threshold.label,
      status: "failed",
      thresholdUnits: threshold.maxUnits,
      actualUnits: null,
      message: `Stage ${threshold.stage} missing from profiler samples.`
    };
  }

  if (sample.units <= threshold.maxUnits) {
    return {
      stage: threshold.stage,
      label: threshold.label,
      status: "ready",
      thresholdUnits: threshold.maxUnits,
      actualUnits: sample.units,
      message: `${threshold.stage} within budget (${sample.units}/${threshold.maxUnits}).`
    };
  }

  return {
    stage: threshold.stage,
    label: threshold.label,
    status: "failed",
    thresholdUnits: threshold.maxUnits,
    actualUnits: sample.units,
    message: `${threshold.stage} exceeded budget (${sample.units}/${threshold.maxUnits}).`
  };
}

export function runPerformanceBenchmarkSuite(options = {}) {
  const suite = createPerformanceBenchmarkSuite(options.suite || options);
  const samples = normalizeSamples(options?.profileResult?.performance?.samples || options.samples);
  const sampleMap = new Map(samples.map((entry) => [entry.stage, entry]));

  const results = suite.thresholds.map((threshold) => (
    evaluateThreshold(threshold, sampleMap.get(threshold.stage), suite.missingStageBehavior)
  ));

  const regressions = results.filter((entry) => entry.status === "failed");
  const status = regressions.length > 0 ? "failed" : "ready";

  const reports = [];
  results.forEach((entry) => {
    if (entry.status === "failed") {
      reports.push(createReport("error", "BENCHMARK_THRESHOLD_EXCEEDED", entry.message, entry));
    } else if (entry.status === "skipped") {
      reports.push(createReport("warning", "BENCHMARK_STAGE_SKIPPED", entry.message, entry));
    } else {
      reports.push(createReport("info", "BENCHMARK_THRESHOLD_OK", entry.message, entry));
    }
  });

  return {
    performanceBenchmarks: {
      status,
      contractId: suite.contractId,
      contractVersion: suite.contractVersion,
      suiteId: suite.suiteId,
      title: suite.title,
      missingStageBehavior: suite.missingStageBehavior,
      measuredAt: Date.now(),
      sampleCount: samples.length,
      thresholdCount: suite.thresholds.length,
      results,
      regressions,
      reports,
      summary: summarizePerformanceBenchmarkSuite({
        performanceBenchmarks: {
          status,
          suiteId: suite.suiteId,
          results,
          regressions
        }
      })
    }
  };
}

export function summarizePerformanceBenchmarkSuite(value) {
  const result = value?.performanceBenchmarks;
  if (!result || !Array.isArray(result.results)) {
    return "Performance benchmark suite unavailable.";
  }

  const regressions = Array.isArray(result.regressions) ? result.regressions.length : 0;
  if (result.status === "failed") {
    return `Performance benchmark suite ${sanitizeText(result.suiteId) || "default"} failed with ${regressions} regression${regressions === 1 ? "" : "s"}.`;
  }
  return `Performance benchmark suite ${sanitizeText(result.suiteId) || "default"} passed (${result.results.length} checks).`;
}
