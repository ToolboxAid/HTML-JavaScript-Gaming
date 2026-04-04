import { runPlatformValidationSuite, summarizePlatformValidationSuite } from "./platformValidationSuite.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function buildArtifactEntries(result) {
  const scenarios = Array.isArray(result?.platformValidationSuite?.scenarios) ? result.platformValidationSuite.scenarios : [];
  return [
    { path: "artifacts/platform-validation-suite.txt", kind: "report" },
    ...scenarios.map((scenario) => ({
      path: `artifacts/scenarios/${scenario.id}.txt`,
      kind: "scenario-report"
    }))
  ];
}

export function summarizeCiValidationPipeline(result) {
  const summary = sanitizeText(result?.ciValidation?.summary);
  return summary || "CI validation pipeline unavailable.";
}

export async function runCiValidationPipeline(options = {}) {
  const validationSuite = options.platformValidationSuiteResult || await runPlatformValidationSuite(options.validationSuiteOptions || {});
  const suiteStatus = validationSuite?.platformValidationSuite?.status || "fail";
  const branch = sanitizeText(options.branch) || "local";
  const trigger = sanitizeText(options.trigger) || "manual";
  const profilerSummary = sanitizeText(options.performanceResult?.performance?.bottleneck?.stage)
    ? `Profiler bottleneck: ${options.performanceResult.performance.bottleneck.stage}.`
    : "";
  const reports = [
    createReport("info", "CI_TRIGGER", `CI validation pipeline evaluated trigger ${trigger} on branch ${branch}.`),
    createReport(
      suiteStatus === "pass" ? "info" : "error",
      "CI_GATE",
      suiteStatus === "pass"
        ? "Platform validation suite passed; CI gate is green."
        : "Platform validation suite failed; CI gate is blocking."
    )
  ];
  const artifactEntries = buildArtifactEntries(validationSuite);
  const summary = `${summarizePlatformValidationSuite(validationSuite)} CI gate ${suiteStatus === "pass" ? "green" : "blocking"}.`;

  return {
    ciValidation: {
      status: suiteStatus === "pass" ? "pass" : "fail",
      trigger,
      branch,
      artifactEntries,
      reports,
      summary,
      reportText: [
        summary,
        `Trigger: ${trigger}`,
        `Branch: ${branch}`,
        `Artifacts: ${artifactEntries.map((entry) => `${entry.kind}:${entry.path}`).join(", ")}`,
        profilerSummary,
        ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
      ].filter(Boolean).join("\n")
    }
  };
}
