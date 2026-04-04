import {
  buildAssetDependencyGraph,
  findRegistryEntryById,
  sanitizeAssetRegistry
} from "./projectAssetRegistry.js";

const SECTION_SOURCE_TYPES = Object.freeze({
  palettes: "palette",
  sprites: "sprite",
  tilesets: "tileset",
  tilemaps: "tilemap",
  images: "image",
  parallaxSources: "parallaxLayer"
});

const SEVERITY_ORDER = Object.freeze({
  error: 0,
  warning: 1,
  info: 2
});

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createFinding(code, severity, blocking, sourceType, sourceId, message) {
  return {
    code: sanitizeText(code),
    severity: severity === "warning" || severity === "info" ? severity : "error",
    blocking: blocking === true,
    sourceType: sanitizeText(sourceType) || "registry",
    sourceId: sanitizeText(sourceId),
    message: sanitizeText(message)
  };
}

function canonicalizeGraph(rawGraph) {
  const source = rawGraph && typeof rawGraph === "object" ? rawGraph : {};
  const rawNodes = source.nodes && typeof source.nodes === "object" ? source.nodes : {};
  const nodes = Object.keys(rawNodes)
    .map((nodeId) => {
      const entry = rawNodes[nodeId] && typeof rawNodes[nodeId] === "object" ? rawNodes[nodeId] : {};
      const id = sanitizeText(entry.id) || sanitizeText(nodeId);
      if (!id) {
        return null;
      }
      return {
        id,
        type: sanitizeText(entry.type),
        name: sanitizeText(entry.name),
        path: sanitizeText(entry.path),
        sourceTool: sanitizeText(entry.sourceTool)
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id))
    .reduce((accumulator, node) => {
      accumulator[node.id] = node;
      return accumulator;
    }, {});

  const edges = (Array.isArray(source.edges) ? source.edges : [])
    .map((edge) => ({
      id: sanitizeText(edge?.id),
      type: sanitizeText(edge?.type),
      source: sanitizeText(edge?.source),
      target: sanitizeText(edge?.target)
    }))
    .filter((edge) => edge.type && edge.source && edge.target)
    .sort((left, right) => {
      const byType = left.type.localeCompare(right.type);
      if (byType !== 0) {
        return byType;
      }
      const bySource = left.source.localeCompare(right.source);
      if (bySource !== 0) {
        return bySource;
      }
      return left.target.localeCompare(right.target);
    });

  return {
    version: Number.isFinite(source.version) ? source.version : 1,
    nodes,
    edges
  };
}

function graphsMatch(left, right) {
  return JSON.stringify(canonicalizeGraph(left)) === JSON.stringify(canonicalizeGraph(right));
}

function collectDuplicateRegistryIdFindings(rawRegistry) {
  const findings = [];
  const sections = Object.keys(SECTION_SOURCE_TYPES);
  const ownersById = new Map();

  sections.forEach((section) => {
    const entries = Array.isArray(rawRegistry?.[section]) ? rawRegistry[section] : [];
    entries.forEach((entry, index) => {
      const id = sanitizeText(entry?.id);
      if (!id) {
        return;
      }
      if (!ownersById.has(id)) {
        ownersById.set(id, []);
      }
      ownersById.get(id).push(`${section}[${index}]`);
    });
  });

  Array.from(ownersById.keys())
    .sort((left, right) => left.localeCompare(right))
    .forEach((id) => {
      const owners = ownersById.get(id) || [];
      if (owners.length < 2) {
        return;
      }
      findings.push(createFinding(
        "DUPLICATE_REGISTRY_ID",
        "error",
        true,
        "registry",
        id,
        `Registry asset ID ${id} is duplicated across ${owners.join(", ")}.`
      ));
    });

  return findings;
}

function mapGraphFindingToValidationFinding(graphFinding, graph) {
  const node = graph?.nodes?.[graphFinding?.nodeId] || null;
  const sourceType = sanitizeText(node?.type) || "graph";
  const sourceId = sanitizeText(graphFinding?.nodeId);
  const kind = sanitizeText(graphFinding?.kind);
  const targetId = sanitizeText(graphFinding?.targetId);

  if (kind === "duplicateNodeId") {
    return createFinding(
      "DUPLICATE_REGISTRY_ID",
      "error",
      true,
      sourceType,
      sourceId,
      graphFinding?.message || `Duplicate asset ID detected for ${sourceId}.`
    );
  }

  if (kind === "missingTarget") {
    return createFinding(
      "INVALID_GRAPH_TARGET",
      "error",
      true,
      sourceType,
      sourceId,
      graphFinding?.message || `Dependency target ${targetId} referenced by ${sourceId} is missing from the registry.`
    );
  }

  if (kind === "orphanedAsset") {
    return createFinding(
      "ORPHANED_GRAPH_NODE",
      "warning",
      false,
      sourceType,
      sourceId,
      graphFinding?.message || `Asset ${sourceId} is currently orphaned in the dependency graph.`
    );
  }

  return createFinding(
    "GRAPH_VALIDATION_NOTE",
    "info",
    false,
    sourceType,
    sourceId,
    graphFinding?.message || "Graph validation note."
  );
}

function collectCycleFindings(graph) {
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  const adjacency = new Map();
  const nodeIds = Object.keys(graph?.nodes || {}).sort((left, right) => left.localeCompare(right));
  const findings = [];
  const visited = new Set();
  const stack = [];
  const stackSet = new Set();
  const seenCycles = new Set();

  nodeIds.forEach((nodeId) => {
    adjacency.set(nodeId, []);
  });
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, []);
    }
    adjacency.get(edge.source).push(edge.target);
  });
  adjacency.forEach((targets) => {
    targets.sort((left, right) => left.localeCompare(right));
  });

  const visit = (nodeId) => {
    visited.add(nodeId);
    stack.push(nodeId);
    stackSet.add(nodeId);

    const targets = adjacency.get(nodeId) || [];
    for (let index = 0; index < targets.length; index += 1) {
      const targetId = targets[index];
      if (!visited.has(targetId)) {
        visit(targetId);
        continue;
      }
      if (!stackSet.has(targetId)) {
        continue;
      }

      const cycleStart = stack.indexOf(targetId);
      const cyclePath = stack.slice(cycleStart).concat(targetId);
      const cycleKey = cyclePath.join(" -> ");
      if (seenCycles.has(cycleKey)) {
        continue;
      }
      seenCycles.add(cycleKey);
      findings.push(createFinding(
        "ILLEGAL_CIRCULAR_DEPENDENCY",
        "error",
        true,
        graph?.nodes?.[targetId]?.type || "graph",
        targetId,
        `Illegal circular dependency detected: ${cycleKey}.`
      ));
    }

    stack.pop();
    stackSet.delete(nodeId);
  };

  nodeIds.forEach((nodeId) => {
    if (!visited.has(nodeId)) {
      visit(nodeId);
    }
  });

  return findings;
}

function collectSpriteProjectFindings(project, registry) {
  if (!project || typeof project !== "object") {
    return [];
  }

  const findings = [];
  const spriteId = sanitizeText(project.assetRefs?.spriteId);
  const paletteId = sanitizeText(project.assetRefs?.paletteId);
  const sourceId = spriteId || "sprite-project";

  if (spriteId && !findRegistryEntryById(registry, "sprites", spriteId)) {
    findings.push(createFinding(
      "MISSING_ASSET_ID",
      "error",
      true,
      "sprite",
      sourceId,
      `Sprite asset reference ${spriteId} is missing from the registry.`
    ));
  }

  if (paletteId && !findRegistryEntryById(registry, "palettes", paletteId)) {
    findings.push(createFinding(
      "UNRESOLVED_PALETTE_LINK",
      "error",
      true,
      "sprite",
      sourceId,
      `Palette asset reference ${paletteId} is missing from the registry.`
    ));
  }

  return findings;
}

function collectTileMapDocumentFindings(documentModel, registry) {
  if (!documentModel || typeof documentModel !== "object") {
    return [];
  }

  const findings = [];
  const tilemapId = sanitizeText(documentModel.assetRefs?.tilemapId);
  const tilesetId = sanitizeText(documentModel.assetRefs?.tilesetId);
  const sourceId = tilemapId || sanitizeText(documentModel.map?.name) || "tilemap-project";

  if (tilemapId && !findRegistryEntryById(registry, "tilemaps", tilemapId)) {
    findings.push(createFinding(
      "MISSING_ASSET_ID",
      "error",
      true,
      "tilemap",
      sourceId,
      `Tile map asset reference ${tilemapId} is missing from the registry.`
    ));
  }

  if (tilesetId && !findRegistryEntryById(registry, "tilesets", tilesetId)) {
    findings.push(createFinding(
      "UNRESOLVED_TILESET_LINK",
      "error",
      true,
      "tilemap",
      sourceId,
      `Tileset asset reference ${tilesetId} is missing from the registry.`
    ));
  }

  return findings;
}

function collectParallaxDocumentFindings(documentModel, registry) {
  if (!documentModel || typeof documentModel !== "object") {
    return [];
  }

  const findings = [];
  const layers = Array.isArray(documentModel.layers) ? documentModel.layers : [];

  layers.forEach((layer, index) => {
    const parallaxSourceId = sanitizeText(layer?.parallaxSourceId);
    if (!parallaxSourceId) {
      return;
    }
    if (findRegistryEntryById(registry, "parallaxSources", parallaxSourceId)) {
      return;
    }
    const layerId = sanitizeText(layer?.id) || `parallax-layer-${index + 1}`;
    findings.push(createFinding(
      "UNRESOLVED_IMAGE_LINK",
      "error",
      true,
      "parallaxLayer",
      layerId,
      `Parallax source reference ${parallaxSourceId} is missing from the registry.`
    ));
  });

  return findings;
}

function sortFindings(findings) {
  return findings.sort((left, right) => {
    const byBlocking = Number(right.blocking) - Number(left.blocking);
    if (byBlocking !== 0) {
      return byBlocking;
    }
    const bySeverity = (SEVERITY_ORDER[left.severity] ?? 99) - (SEVERITY_ORDER[right.severity] ?? 99);
    if (bySeverity !== 0) {
      return bySeverity;
    }
    const byCode = left.code.localeCompare(right.code);
    if (byCode !== 0) {
      return byCode;
    }
    const bySourceType = left.sourceType.localeCompare(right.sourceType);
    if (bySourceType !== 0) {
      return bySourceType;
    }
    const bySourceId = left.sourceId.localeCompare(right.sourceId);
    if (bySourceId !== 0) {
      return bySourceId;
    }
    return left.message.localeCompare(right.message);
  });
}

export function hasBlockingAssetValidationFindings(result) {
  const findings = Array.isArray(result?.validation?.findings) ? result.validation.findings : [];
  return findings.some((finding) => finding.blocking === true);
}

export function summarizeAssetValidation(result) {
  const findings = Array.isArray(result?.validation?.findings) ? result.validation.findings : [];
  const blockingCount = findings.filter((finding) => finding.blocking === true).length;
  const warningCount = findings.filter((finding) => finding.severity === "warning").length;

  if (blockingCount > 0) {
    return `${blockingCount} blocking finding${blockingCount === 1 ? "" : "s"}, ${warningCount} warning${warningCount === 1 ? "" : "s"}`;
  }
  if (warningCount > 0) {
    return `0 blocking findings, ${warningCount} warning${warningCount === 1 ? "" : "s"}`;
  }
  return "0 blocking findings, 0 warnings";
}

export function getBlockingAssetValidationMessage(actionLabel, result) {
  const findings = Array.isArray(result?.validation?.findings) ? result.validation.findings : [];
  const lead = findings.find((finding) => finding.blocking === true);
  if (!lead) {
    return `${actionLabel} is allowed.`;
  }
  return `${actionLabel} blocked: ${lead.message}`;
}

export function validateProjectAssetState(options = {}) {
  const registry = sanitizeAssetRegistry(options.registry);
  const { graph, findings: graphFindings } = buildAssetDependencyGraph(registry);
  const findings = [];

  findings.push(...collectDuplicateRegistryIdFindings(options.registry));
  graphFindings.forEach((graphFinding) => {
    findings.push(mapGraphFindingToValidationFinding(graphFinding, graph));
  });
  findings.push(...collectCycleFindings(graph));

  if (options.assetDependencyGraph && !graphsMatch(options.assetDependencyGraph, graph)) {
    findings.push(createFinding(
      "STALE_GRAPH_SNAPSHOT",
      "warning",
      false,
      "graph",
      registry.projectId || "project",
      "Asset dependency graph snapshot does not match the deterministic graph rebuilt from the registry."
    ));
  }

  findings.push(...collectSpriteProjectFindings(options.spriteProject, registry));
  findings.push(...collectTileMapDocumentFindings(options.tileMapDocument, registry));
  findings.push(...collectParallaxDocumentFindings(options.parallaxDocument, registry));

  const orderedFindings = sortFindings(findings);
  return {
    registry,
    assetDependencyGraph: graph,
    validation: {
      status: hasBlockingAssetValidationFindings({ validation: { findings: orderedFindings } }) ? "invalid" : "valid",
      findings: orderedFindings
    }
  };
}
