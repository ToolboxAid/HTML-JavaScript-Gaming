import { spawnSync } from "node:child_process";

const validationLanes = Object.freeze([
  {
    id: "DELTA_001 runtime tick optimization",
    args: ["tests/engine/RuntimeTickLoop.test.mjs"],
  },
  {
    id: "DELTA_002 replay clone consolidation",
    args: ["tests/replay/ReplaySystem.test.mjs"],
  },
  {
    id: "DELTA_003 API client standardization",
    args: ["tests/dev-runtime/ServerApiClientStandardization.test.mjs"],
  },
  {
    id: "DELTA_004 event system coverage",
    args: ["tests/engine/RuntimeEventSystem.test.mjs"],
  },
  {
    id: "DELTA_005 event clone cleanup",
    args: ["tests/engine/RuntimeTriggerProcessing.test.mjs"],
  },
  {
    id: "DELTA_005 action/event integration",
    args: ["tests/engine/RuntimeActionSystem.test.mjs"],
  },
  {
    id: "Delta closeout systems regression",
    args: ["tests/final/FinalSystems.test.mjs"],
  },
]);

let passed = 0;

for (const lane of validationLanes) {
  console.log(`\n[Delta runtime] ${lane.id}`);
  const result = spawnSync(process.execPath, lane.args, {
    stdio: "inherit",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    console.error(`[Delta runtime] FAIL ${lane.id}`);
    process.exit(result.status || 1);
  }
  passed += 1;
  console.log(`[Delta runtime] PASS ${lane.id}`);
}

console.log(`\n[Delta runtime] PASS ${passed}/${validationLanes.length} lanes`);
