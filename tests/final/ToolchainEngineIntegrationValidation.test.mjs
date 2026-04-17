/*
Toolbox Aid
David Quesenberry
04/17/2026
ToolchainEngineIntegrationValidation.test.mjs
*/
import assert from "node:assert/strict";
import { run as runToolEntryLaunchContract } from "../tools/ToolEntryLaunchContract.test.mjs";
import { run as runProjectToolDataContracts } from "../tools/ProjectToolDataContracts.test.mjs";
import { run as runRuntimeAssetLoader } from "../tools/RuntimeAssetLoader.test.mjs";
import { run as runRenderPipelineContractAll4Tools } from "../tools/RenderPipelineContractAll4Tools.test.mjs";
import { run as runRuntimeSceneLoaderHotReload } from "../tools/RuntimeSceneLoaderHotReload.test.mjs";

const TRACK_E_TOOLCHAIN_VALIDATION_STAGES = Object.freeze([
  Object.freeze({
    id: "tool-entry-launch-contract",
    run: runToolEntryLaunchContract
  }),
  Object.freeze({
    id: "project-tool-data-contracts",
    run: runProjectToolDataContracts
  }),
  Object.freeze({
    id: "runtime-asset-loader",
    run: runRuntimeAssetLoader
  }),
  Object.freeze({
    id: "render-pipeline-contract-all-4-tools",
    run: runRenderPipelineContractAll4Tools
  }),
  Object.freeze({
    id: "runtime-scene-loader-hot-reload",
    run: runRuntimeSceneLoaderHotReload
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
