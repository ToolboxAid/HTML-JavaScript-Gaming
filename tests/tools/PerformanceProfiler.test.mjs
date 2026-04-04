import assert from "node:assert/strict";
import { buildPerformanceProfiler, summarizePerformanceProfiler } from "../../tools/shared/performanceProfiler.js";

export async function run() {
  const result = buildPerformanceProfiler({
    validationResult: { validation: { findings: [{}, {}] } },
    packageResult: { manifest: { package: { assets: [{}, {}, {}] } } },
    runtimeResult: { runtimeLoader: { loadedAssets: [{}, {}] } },
    platformValidationSuiteResult: { platformValidationSuite: { status: "pass", scenarios: [{}, {}, {}] } }
  });
  assert.equal(result.performance.status, "ready");
  assert.equal(result.performance.bottleneck.stage, "packaging");
  assert.equal(summarizePerformanceProfiler(result), "Performance profiler captured 4 deterministic samples.");
}
