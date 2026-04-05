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

  const geometryResult = buildPerformanceProfiler({
    validationResult: { validation: { findings: [] } },
    packageResult: { manifest: { package: { assets: [{}, {}, {}] } } },
    runtimeResult: {
      runtimeLoader: {
        loadedAssets: [
          {
            asset: {
              runtimeKind: "vector-geometry",
              renderables: [{}, {}],
              collisionPrimitives: [{}, {}]
            }
          }
        ]
      }
    }
  });
  assert.equal(geometryResult.performance.samples.some((sample) => sample.stage === "geometry"), true);
  assert.equal(geometryResult.performance.geometryParticipation.assetCount, 1);
  assert.match(geometryResult.performance.reportText, /Geometry: assets=1, renderables=2, collisionPrimitives=2/);
}
