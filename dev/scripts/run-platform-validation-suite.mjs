import { runPlatformValidationSuite } from "../../www/src/shared/toolbox/platformValidationSuite.js";
import { runCiValidationPipeline } from "../../www/src/shared/toolbox/ciValidationPipeline.js";

const suiteResult = await runPlatformValidationSuite();
const ciResult = await runCiValidationPipeline({
  branch: process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || "local",
  trigger: process.env.GITHUB_EVENT_NAME || "manual",
  platformValidationSuiteResult: suiteResult
});

console.log(suiteResult.platformValidationSuite.reportText);
console.log("");
console.log(ciResult.ciValidation.reportText);

if (ciResult.ciValidation.status !== "pass") {
  process.exitCode = 1;
}
