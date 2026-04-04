import { runCiValidationPipeline } from "./ciValidationPipeline.js";
import { buildMultiTargetExport } from "./multiTargetExport.js";
import { buildCloudRuntime } from "./cloudRuntime.js";

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

export function summarizePublishingPipeline(result) {
  const releases = Array.isArray(result?.publishing?.releaseTargets) ? result.publishing.releaseTargets : [];
  if (result?.publishing?.status !== "ready") {
    return "Publishing pipeline unavailable.";
  }
  return `Publishing pipeline ready with ${releases.length} release targets.`;
}

export async function runPublishingPipeline(options = {}) {
  const ciResult = options.ciValidationResult || await runCiValidationPipeline(options.ciOptions || {});
  const exportResult = options.multiTargetExportResult || buildMultiTargetExport(options.exportOptions || {});
  const cloudResult = options.cloudRuntimeResult || buildCloudRuntime({
    packageManifest: exportResult.multiTargetExport?.packageResult?.manifest || options.packageManifest || null,
    multiTargetExportResult: exportResult
  });

  if (ciResult.ciValidation.status !== "pass" || exportResult.multiTargetExport.status !== "ready") {
    return {
      publishing: {
        status: "blocked",
        releaseTargets: [],
        reports: [createReport("error", "PUBLISHING_BLOCKED", "Publishing pipeline is blocked by CI or export readiness.")],
        ciResult,
        exportResult,
        cloudResult
      }
    };
  }

  const releaseTargets = [
    ...exportResult.multiTargetExport.targets.map((target) => ({
      targetId: sanitizeText(target.targetId),
      kind: "artifact",
      destination: sanitizeText(target.outputPath)
    })),
    ...((cloudResult.cloudRuntime?.deployments || []).map((deployment) => ({
      targetId: sanitizeText(deployment.deployTargetId),
      kind: "cloud",
      destination: sanitizeText(deployment.publishPath)
    })))
  ].sort((left, right) => {
    const byKind = left.kind.localeCompare(right.kind);
    if (byKind !== 0) {
      return byKind;
    }
    return left.targetId.localeCompare(right.targetId);
  });

  return {
    publishing: {
      status: "ready",
      releaseTargets,
      reports: [
        createReport("info", "PUBLISHING_READY", `Prepared ${releaseTargets.length} deterministic publishing targets.`)
      ],
      ciResult,
      exportResult,
      cloudResult,
      reportText: [
        summarizePublishingPipeline({ publishing: { status: "ready", releaseTargets } }),
        `CI: ${ciResult.ciValidation.status}`,
        ...releaseTargets.map((target) => `${target.kind}:${target.targetId} -> ${target.destination}`)
      ].join("\n")
    }
  };
}
