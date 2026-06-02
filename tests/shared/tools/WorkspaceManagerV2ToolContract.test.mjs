/*
Toolbox Aid
David Quesenberry
06/02/2026
WorkspaceManagerV2ToolContract.test.mjs
*/
import {
  WORKSPACE_MANAGER_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/workspaceManagerV2Contract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(WORKSPACE_MANAGER_V2_TOOL_CONTRACT, "workspace-manager-v2");
}
