import { runPlatformValidationSuite } from "../tools/shared/platformValidationSuite.js";
import { runCiValidationPipeline } from "../tools/shared/ciValidationPipeline.js";

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
