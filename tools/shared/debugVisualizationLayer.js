function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createSection(title, lines) {
  return {
    title: sanitizeText(title),
    lines: Array.isArray(lines) ? lines.map((line) => sanitizeText(line)).filter(Boolean) : []
  };
}

function formatSection(section) {
  return [`[${section.title}]`, ...section.lines].join("\n");
}

function toGraphLines(graph) {
  const nodes = Object.keys(graph?.nodes || {}).sort((left, right) => left.localeCompare(right));
  const edges = Array.isArray(graph?.edges) ? graph.edges.slice() : [];
  edges.sort((left, right) => {
    const bySource = sanitizeText(left?.source).localeCompare(sanitizeText(right?.source));
    if (bySource !== 0) {
      return bySource;
    }
    const byType = sanitizeText(left?.type).localeCompare(sanitizeText(right?.type));
    if (byType !== 0) {
      return byType;
    }
    return sanitizeText(left?.target).localeCompare(sanitizeText(right?.target));
  });
  return [
    `nodes=${nodes.length}`,
    `edges=${edges.length}`,
    ...nodes.slice(0, 8).map((nodeId) => `node ${nodeId}`),
    ...edges.slice(0, 8).map((edge) => `edge ${edge.source} -[${edge.type}]-> ${edge.target}`)
  ];
}

function toValidationLines(validationResult) {
  const findings = Array.isArray(validationResult?.validation?.findings) ? validationResult.validation.findings : [];
  return [
    `status=${sanitizeText(validationResult?.validation?.status) || "unknown"}`,
    `findings=${findings.length}`,
    ...findings.slice(0, 6).map((finding) => `${finding.blocking ? "BLOCK" : "INFO"} ${finding.code} @ ${finding.sourceId || "project"}`)
  ];
}

function toPackagingLines(packageResult) {
  const manifest = packageResult?.manifest?.package;
  if (!manifest) {
    return ["packaging=unavailable"];
  }
  return [
    `status=${sanitizeText(packageResult?.packageStatus) || "unknown"}`,
    `roots=${manifest.roots.map((root) => sanitizeText(root?.id)).join(", ")}`,
    `assets=${manifest.assets.length}`,
    `dependencies=${manifest.dependencies.length}`,
    `report=${sanitizeText(manifest.reports?.[0]?.code) || "none"}`
  ];
}

function toRuntimeLines(runtimeResult) {
  const loader = runtimeResult?.runtimeLoader;
  if (!loader) {
    return ["runtime=unavailable"];
  }
  return [
    `status=${sanitizeText(loader.status) || "unknown"}`,
    `loadedAssets=${Array.isArray(loader.loadedAssets) ? loader.loadedAssets.length : 0}`,
    `failedAt=${sanitizeText(loader.failedAt) || "none"}`,
    ...((Array.isArray(loader.reports) ? loader.reports : []).slice(0, 4).map((report) => `${report.code}: ${report.message}`))
  ];
}

function toProfilerLines(performanceResult) {
  const performance = performanceResult?.performance;
  if (!performance) {
    return ["profiler=unavailable"];
  }
  return [
    `status=${sanitizeText(performance.status) || "unknown"}`,
    `bottleneck=${sanitizeText(performance.bottleneck?.stage) || "none"}`,
    ...((Array.isArray(performance.samples) ? performance.samples : []).slice(0, 5).map((sample) => `${sample.stage}=${sample.units}`))
  ];
}

function toRemediationLines(remediationResult) {
  const actions = Array.isArray(remediationResult?.remediation?.actions) ? remediationResult.remediation.actions : [];
  return [
    `status=${sanitizeText(remediationResult?.remediation?.status) || "unavailable"}`,
    `actions=${actions.length}`,
    ...actions.slice(0, 4).map((action) => `${action.actionType} ${action.label} -> ${action.sourceId || "project"}`)
  ];
}

export function summarizeDebugVisualizationLayer(result) {
  const summary = sanitizeText(result?.debugVisualization?.summary);
  return summary || "Debug visualization unavailable.";
}

export function buildDebugVisualizationLayer(options = {}) {
  const graph = options.assetDependencyGraph || options.validationResult?.assetDependencyGraph || { nodes: {}, edges: [] };
  const sections = [
    createSection("Dependency Graph", toGraphLines(graph)),
    createSection("Validation Overlay", toValidationLines(options.validationResult)),
    createSection("Remediation Navigation", toRemediationLines(options.remediationResult)),
    createSection("Packaging Report", toPackagingLines(options.packageResult)),
    createSection("Runtime Trace", toRuntimeLines(options.runtimeResult)),
    createSection("Profiler", toProfilerLines(options.performanceResult))
  ];
  const summary = `Debug view: ${Object.keys(graph.nodes || {}).length} nodes, ${(graph.edges || []).length} edges, ${options.validationResult?.validation?.findings?.length || 0} findings.`;
  return {
    debugVisualization: {
      status: "ready",
      summary,
      sections,
      reportText: sections.map((section) => formatSection(section)).join("\n\n")
    }
  };
}
