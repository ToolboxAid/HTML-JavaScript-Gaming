/*
Toolbox Aid
David Quesenberry
04/17/2026
ToolchainEngineIntegrationValidation.test.mjs
*/
import assert from "node:assert/strict";
import { runRuntimeSceneLoaderHotReloadValidation } from "../helpers/runtimeSceneLoaderHotReload.helpers.mjs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");

function runNodeTestFile(relativeTestPath) {
  execFileSync(process.execPath, ["--test", relativeTestPath], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

const TRACK_E_TOOLCHAIN_VALIDATION_STAGES = Object.freeze([
  Object.freeze({
    id: "tool-entry-launch-contract",
    run: async () => runNodeTestFile("tests/tools/ToolEntryLaunchContract.test.mjs")
  }),
  Object.freeze({
    id: "project-tool-data-contracts",
    run: async () => runNodeTestFile("tests/tools/ProjectToolDataContracts.test.mjs")
  }),
  Object.freeze({
    id: "runtime-asset-loader",
    run: async () => runNodeTestFile("tests/tools/RuntimeAssetLoader.test.mjs")
  }),
  Object.freeze({
    id: "render-pipeline-contract-all-4-tools",
    run: async () => runNodeTestFile("tests/tools/RenderPipelineContractAll4Tools.test.mjs")
  }),
  Object.freeze({
    id: "runtime-scene-loader-hot-reload",
    run: runRuntimeSceneLoaderHotReloadValidation
  })
]);

export async function run() {
  const completedStages = [];

  for (let i = 0; i < TRACK_E_TOOLCHAIN_VALIDATION_STAGES.length; i += 1) {
    const stage = TRACK_E_TOOLCHAIN_VALIDATION_STAGES[i];
    try {
      await stage.run();
      completedStages.push(stage.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Track E toolchain validation failed at ${stage.id}: ${message}`);
    }
  }

  assert.deepEqual(
    completedStages,
    TRACK_E_TOOLCHAIN_VALIDATION_STAGES.map((stage) => stage.id),
    "Track E toolchain validation should execute all scoped integration stages."
  );
}
