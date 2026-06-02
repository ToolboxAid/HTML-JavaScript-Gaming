/*
Toolbox Aid
David Quesenberry
06/02/2026
ThreeDJsonPayloadToolContract.test.mjs
*/
import {
  THREE_D_JSON_PAYLOAD_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/threeDJsonPayloadContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(THREE_D_JSON_PAYLOAD_TOOL_CONTRACT, "3d-json-payload");
}
