/*
Toolbox Aid
David Quesenberry
04/05/2026
PerformanceBenchmarks.test.mjs
*/
import assert from "node:assert/strict";
import {
  PERFORMANCE_BENCHMARK_CONTRACT_ID,
  PERFORMANCE_BENCHMARK_CONTRACT_VERSION,
  createDefaultPerformanceBenchmarkSuite,
  createPerformanceBenchmarkSuite,
  runPerformanceBenchmarkSuite,
  summarizePerformanceBenchmarkSuite
} from "../../tools/shared/performanceBenchmarks.js";

export async function run() {
  const suite = createPerformanceBenchmarkSuite({
    suiteId: "bench.default",
    title: "Default Bench",
    thresholds: [
      { stage: "validation", maxUnits: 5 },
      { stage: "packaging", maxUnits: 5 }
    ]
  });

  assert.equal(suite.contractId, PERFORMANCE_BENCHMARK_CONTRACT_ID);
  assert.equal(suite.contractVersion, PERFORMANCE_BENCHMARK_CONTRACT_VERSION);
  assert.equal(suite.thresholds.length, 2);

  const passResult = runPerformanceBenchmarkSuite({
    suite,
    profileResult: {
      performance: {
        samples: [
          { stage: "validation", units: 2 },
          { stage: "packaging", units: 3 }
        ]
      }
    }
  });
  assert.equal(passResult.performanceBenchmarks.status, "ready");
  assert.equal(passResult.performanceBenchmarks.regressions.length, 0);
  assert.match(passResult.performanceBenchmarks.summary, /passed/);

  const failResult = runPerformanceBenchmarkSuite({
    suite,
    profileResult: {
      performance: {
        samples: [
          { stage: "validation", units: 2 },
          { stage: "packaging", units: 9 }
        ]
      }
    }
  });
  assert.equal(failResult.performanceBenchmarks.status, "failed");
  assert.equal(failResult.performanceBenchmarks.regressions.length, 1);
  assert.equal(failResult.performanceBenchmarks.regressions[0].stage, "packaging");

  const missingFailResult = runPerformanceBenchmarkSuite({
    suite: createPerformanceBenchmarkSuite({
      suiteId: "missing.fail",
      thresholds: [{ stage: "runtime", maxUnits: 2 }]
    }),
    samples: [{ stage: "validation", units: 1 }]
  });
  assert.equal(missingFailResult.performanceBenchmarks.status, "failed");
  assert.equal(missingFailResult.performanceBenchmarks.regressions[0].stage, "runtime");

  const missingSkipResult = runPerformanceBenchmarkSuite({
    suite: createPerformanceBenchmarkSuite({
      suiteId: "missing.skip",
      missingStageBehavior: "skip",
      thresholds: [{ stage: "runtime", maxUnits: 2 }]
    }),
    samples: [{ stage: "validation", units: 1 }]
  });
  assert.equal(missingSkipResult.performanceBenchmarks.status, "ready");
  assert.equal(
    missingSkipResult.performanceBenchmarks.results.some((entry) => entry.status === "skipped"),
    true
  );

  const defaults = createDefaultPerformanceBenchmarkSuite();
  assert.equal(defaults.thresholds.length >= 4, true);
  assert.match(
    summarizePerformanceBenchmarkSuite(passResult),
    /Performance benchmark suite bench\.default passed/
  );
}
