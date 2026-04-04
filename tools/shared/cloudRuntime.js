function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

const DEPLOY_TARGETS = Object.freeze({
  edge: { runtime: "edge-worker", path: "cloud/edge" },
  node: { runtime: "node-service", path: "cloud/node" }
});

export function summarizeCloudRuntime(result) {
  const deployments = Array.isArray(result?.cloudRuntime?.deployments) ? result.cloudRuntime.deployments : [];
  if (result?.cloudRuntime?.status !== "ready") {
    return "Cloud runtime unavailable.";
  }
  return `Cloud runtime ready with ${deployments.length} deployment targets.`;
}

export function buildCloudRuntime(options = {}) {
  const packageManifest = options.packageManifest && typeof options.packageManifest === "object" ? cloneJson(options.packageManifest) : null;
  const multiTargetExport = options.multiTargetExportResult?.multiTargetExport || null;
  const pkg = packageManifest?.package;
  if (!pkg || !Array.isArray(pkg.assets) || pkg.assets.length === 0) {
    return {
      cloudRuntime: {
        status: "blocked",
        deployments: [],
        reports: [createReport("error", "CLOUD_RUNTIME_INPUT_MISSING", "Cloud runtime requires strict packaged project input.")]
      }
    };
  }

  const baseTargets = Array.isArray(multiTargetExport?.targets) && multiTargetExport.targets.length > 0
    ? multiTargetExport.targets
    : [{ targetId: "web", outputPath: "dist/web" }];

  const deployments = Object.keys(DEPLOY_TARGETS)
    .sort((left, right) => left.localeCompare(right))
    .map((deployTargetId) => ({
      deployTargetId,
      runtime: DEPLOY_TARGETS[deployTargetId].runtime,
      publishPath: DEPLOY_TARGETS[deployTargetId].path,
      sourceTargets: baseTargets.map((target) => sanitizeText(target.targetId)).sort((left, right) => left.localeCompare(right)),
      packageManifest
    }));

  return {
    cloudRuntime: {
      status: "ready",
      deployments,
      reports: [
        createReport("info", "CLOUD_RUNTIME_READY", `Prepared ${deployments.length} deterministic cloud deployment targets.`)
      ],
      reportText: [
        summarizeCloudRuntime({ cloudRuntime: { status: "ready", deployments } }),
        ...deployments.map((deployment) => `${deployment.deployTargetId}: ${deployment.runtime} from ${deployment.sourceTargets.join(", ")}`),
        `[info] package=${sanitizeText(pkg.projectId) || "project"} assets=${pkg.assets.length}`
      ].join("\n")
    }
  };
}
