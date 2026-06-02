/*
Toolbox Aid
David Quesenberry
06/02/2026
StorageInspectorV2ToolContract.test.mjs
*/
import {
  STORAGE_INSPECTOR_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/storageInspectorV2Contract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(STORAGE_INSPECTOR_V2_TOOL_CONTRACT, "storage-inspector-v2");
}
