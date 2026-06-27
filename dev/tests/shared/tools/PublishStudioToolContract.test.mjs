/*
Toolbox Aid
David Quesenberry
06/02/2026
PublishStudioToolContract.test.mjs
*/
import {
  PUBLISH_STUDIO_TOOL_CONTRACT,
} from "../../../../src/shared/contracts/tools/publishStudioContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PUBLISH_STUDIO_TOOL_CONTRACT, "publish-studio");
}
