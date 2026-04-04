function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createLine(label, value) {
  return `${label}: ${sanitizeText(value) || "none"}`;
}

function toFindingLines(validationResult) {
  const findings = Array.isArray(validationResult?.validation?.findings) ? validationResult.validation.findings : [];
  return findings
    .slice()
    .sort((left, right) => {
      const byCode = sanitizeText(left?.code).localeCompare(sanitizeText(right?.code));
      if (byCode !== 0) {
        return byCode;
      }
      const bySourceType = sanitizeText(left?.sourceType).localeCompare(sanitizeText(right?.sourceType));
      if (bySourceType !== 0) {
        return bySourceType;
      }
      return sanitizeText(left?.sourceId).localeCompare(sanitizeText(right?.sourceId));
    })
    .map((finding) => `${sanitizeText(finding.severity) || "error"} ${sanitizeText(finding.code)} @ ${sanitizeText(finding.sourceId) || "project"}${finding.blocking ? " [blocking]" : ""}`);
}

function toActionLines(remediationResult) {
  const actions = Array.isArray(remediationResult?.remediation?.actions) ? remediationResult.remediation.actions : [];
  return actions
    .slice()
    .sort((left, right) => {
      const byType = sanitizeText(left?.actionType).localeCompare(sanitizeText(right?.actionType));
      if (byType !== 0) {
        return byType;
      }
      const byLabel = sanitizeText(left?.label).localeCompare(sanitizeText(right?.label));
      if (byLabel !== 0) {
        return byLabel;
      }
      return sanitizeText(left?.sourceId).localeCompare(sanitizeText(right?.sourceId));
    })
    .slice(0, 5)
    .map((action) => `${sanitizeText(action.actionType) || "inspect"} ${sanitizeText(action.label)} -> ${sanitizeText(action.sourceId) || "project"}`);
}

function toDependencyLines(graph) {
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  return edges
    .slice()
    .sort((left, right) => {
      const bySource = sanitizeText(left?.source).localeCompare(sanitizeText(right?.source));
      if (bySource !== 0) {
        return bySource;
      }
      const byType = sanitizeText(left?.type).localeCompare(sanitizeText(right?.type));
      if (byType !== 0) {
        return byType;
      }
      return sanitizeText(left?.target).localeCompare(sanitizeText(right?.target));
    })
    .map((edge) => `${sanitizeText(edge.source)} -[${sanitizeText(edge.type)}]-> ${sanitizeText(edge.target)}`);
}

function toPackageLines(packageResult) {
  const manifest = packageResult?.manifest?.package;
  if (!manifest || !Array.isArray(manifest.assets)) {
    return ["Packaging has not been run in this session."];
  }
  return [
    createLine("status", packageResult?.packageStatus || "unknown"),
    createLine("project", manifest.projectId),
    createLine("roots", manifest.roots.map((root) => sanitizeText(root?.id)).filter(Boolean).join(", ")),
    createLine("assets", String(manifest.assets.length)),
    createLine("dependencies", String(Array.isArray(manifest.dependencies) ? manifest.dependencies.length : 0))
  ];
}

function toRuntimeLines(runtimeResult) {
  const loader = runtimeResult?.runtimeLoader;
  if (!loader || typeof loader !== "object") {
    return ["Runtime load has not been run in this session."];
  }
  return [
    createLine("status", loader.status),
    createLine("loadedAssets", String(Array.isArray(loader.loadedAssets) ? loader.loadedAssets.length : 0)),
    createLine("failedAt", sanitizeText(loader.failedAt) || "none")
  ];
}

function buildReportText(sections) {
  return sections
    .map((section) => {
      const lines = Array.isArray(section.lines) ? section.lines : [];
      return [`[${section.title}]`, ...lines].join("\n");
    })
    .join("\n\n");
}

export function summarizeEditorExperienceLayer(result) {
  const summary = sanitizeText(result?.experience?.summary);
  return summary || "Editor experience snapshot unavailable.";
}

export function buildEditorExperienceLayer(options = {}) {
  const graph = options.assetDependencyGraph || options.validationResult?.assetDependencyGraph || { nodes: {}, edges: [] };
  const nodeCount = Object.keys(graph?.nodes || {}).length;
  const edgeCount = Array.isArray(graph?.edges) ? graph.edges.length : 0;
  const findingLines = toFindingLines(options.validationResult);
  const actionLines = toActionLines(options.remediationResult);
  const sections = [
    {
      title: "Validation",
      lines: [
        createLine("status", options.validationResult?.validation?.status || "unknown"),
        createLine("findings", String(findingLines.length)),
        ...findingLines.slice(0, 5)
      ]
    },
    {
      title: "Dependencies",
      lines: [
        createLine("nodes", String(nodeCount)),
        createLine("edges", String(edgeCount)),
        ...toDependencyLines(graph).slice(0, 6)
      ]
    },
    {
      title: "Remediation",
      lines: [
        createLine("status", options.remediationResult?.remediation?.status || "unavailable"),
        createLine("actions", String(actionLines.length)),
        ...actionLines
      ]
    },
    {
      title: "Packaging",
      lines: toPackageLines(options.packageResult)
    },
    {
      title: "Runtime",
      lines: toRuntimeLines(options.runtimeResult)
    }
  ];
  const summary = `Experience snapshot: ${nodeCount} assets, ${edgeCount} dependencies, ${findingLines.length} findings, ${actionLines.length} remediation actions.`;

  return {
    experience: {
      status: "ready",
      summary,
      sections,
      reportText: buildReportText(sections)
    }
  };
}
