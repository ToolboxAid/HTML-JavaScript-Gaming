import { findRegistryEntryById, sanitizeAssetRegistry } from "./projectAssetRegistry.js";
import { hasBlockingAssetValidationFindings, summarizeAssetValidation, validateProjectAssetState } from "./projectAssetValidation.js";

const SECTION_BY_NODE_TYPE = Object.freeze({
  palette: "palettes",
  sprite: "sprites",
  vector: "vectors",
  tileset: "tilesets",
  tilemap: "tilemaps",
  image: "images",
  parallaxLayer: "parallaxSources"
});

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sortStrings(values) {
  return values.slice().sort((left, right) => left.localeCompare(right));
}

function collectPackagingRoots(options) {
  const roots = [];

  const spriteId = sanitizeText(options.spriteProject?.assetRefs?.spriteId);
  if (spriteId) {
    roots.push(spriteId);
  }

  const vectorId = sanitizeText(options.vectorDocument?.assetRefs?.vectorId);
  if (vectorId) {
    roots.push(vectorId);
  }
  const vectorIds = Array.isArray(options.vectorDocument?.assetRefs?.vectorIds)
    ? options.vectorDocument.assetRefs.vectorIds
    : [];
  vectorIds.forEach((id) => {
    const safeId = sanitizeText(id);
    if (safeId) {
      roots.push(safeId);
    }
  });

  const tilemapId = sanitizeText(options.tileMapDocument?.assetRefs?.tilemapId);
  if (tilemapId) {
    roots.push(tilemapId);
  }

  const parallaxSourceIds = Array.isArray(options.parallaxDocument?.assetRefs?.parallaxSourceIds)
    ? options.parallaxDocument.assetRefs.parallaxSourceIds
    : Array.isArray(options.tileMapDocument?.assetRefs?.parallaxSourceIds)
      ? options.tileMapDocument.assetRefs.parallaxSourceIds
      : [];
  parallaxSourceIds.forEach((id) => {
    const safeId = sanitizeText(id);
    if (safeId) {
      roots.push(safeId);
    }
  });

  return sortStrings(Array.from(new Set(roots)));
}

function createPackagingReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function createBlockedResult(validationResult, reports) {
  return {
    packageStatus: "blocked",
    manifest: {
      package: {
        version: 1,
        projectId: sanitizeText(validationResult?.registry?.projectId) || "project",
        createdFrom: {
          registryVersion: Number.isFinite(validationResult?.registry?.version) ? validationResult.registry.version : 1,
          graphVersion: Number.isFinite(validationResult?.assetDependencyGraph?.version) ? validationResult.assetDependencyGraph.version : 1
        },
        roots: [],
        assets: [],
        dependencies: [],
        reports
      }
    },
    reportText: reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`).join("\n")
  };
}

function buildAssetRecord(registry, node) {
  const section = SECTION_BY_NODE_TYPE[sanitizeText(node?.type)];
  const entry = section ? findRegistryEntryById(registry, section, node?.id) : null;
  return {
    id: sanitizeText(node?.id),
    type: sanitizeText(node?.type),
    name: sanitizeText(node?.name) || sanitizeText(entry?.name) || sanitizeText(node?.id),
    path: sanitizeText(entry?.path) || sanitizeText(node?.path),
    sourceTool: sanitizeText(entry?.sourceTool) || sanitizeText(node?.sourceTool)
  };
}

function traverseDependencies(graph, rootIds) {
  const adjacency = new Map();
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, []);
    }
    adjacency.get(edge.source).push(edge);
  });
  adjacency.forEach((nodeEdges) => {
    nodeEdges.sort((left, right) => {
      const byType = left.type.localeCompare(right.type);
      if (byType !== 0) {
        return byType;
      }
      return left.target.localeCompare(right.target);
    });
  });

  const includedIds = new Set();
  const dependencyEntries = [];
  const visitedEdges = new Set();
  const visit = (nodeId) => {
    if (includedIds.has(nodeId)) {
      return;
    }
    includedIds.add(nodeId);
    const nodeEdges = adjacency.get(nodeId) || [];
    nodeEdges.forEach((edge) => {
      const edgeKey = `${edge.source}|${edge.type}|${edge.target}`;
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.add(edgeKey);
        dependencyEntries.push({
          from: edge.source,
          to: edge.target,
          type: edge.type
        });
      }
      visit(edge.target);
    });
  };

  rootIds.forEach((rootId) => visit(rootId));

  dependencyEntries.sort((left, right) => {
    const byFrom = left.from.localeCompare(right.from);
    if (byFrom !== 0) {
      return byFrom;
    }
    const byType = left.type.localeCompare(right.type);
    if (byType !== 0) {
      return byType;
    }
    return left.to.localeCompare(right.to);
  });

  return {
    assetIds: sortStrings(Array.from(includedIds)),
    dependencies: dependencyEntries
  };
}

export function summarizeProjectPackaging(result) {
  if (result?.packageStatus === "blocked") {
    return "Packaging blocked.";
  }
  const assetCount = Array.isArray(result?.manifest?.package?.assets) ? result.manifest.package.assets.length : 0;
  const dependencyCount = Array.isArray(result?.manifest?.package?.dependencies) ? result.manifest.package.dependencies.length : 0;
  return `Package ready with ${assetCount} assets and ${dependencyCount} dependencies.`;
}

export function buildProjectPackage(options = {}) {
  const validationResult = options.validationResult || validateProjectAssetState(options);
  const registry = sanitizeAssetRegistry(options.registry || validationResult.registry);
  const graph = validationResult.assetDependencyGraph;
  const reports = [];

  if (hasBlockingAssetValidationFindings(validationResult)) {
    reports.push(createPackagingReport(
      "error",
      "VALIDATION_BLOCKED",
      `Strict packaging blocked by validation: ${summarizeAssetValidation(validationResult)}.`
    ));
    return createBlockedResult(validationResult, reports);
  }

  const rootIds = collectPackagingRoots(options);
  if (rootIds.length === 0) {
    reports.push(createPackagingReport(
      "error",
      "NO_PACKAGE_ROOTS",
      "No registry-valid package roots were available for packaging."
    ));
    return createBlockedResult(validationResult, reports);
  }

  const graphNodeIds = new Set(Object.keys(graph?.nodes || {}));
  const missingRootIds = rootIds.filter((rootId) => !graphNodeIds.has(rootId));
  if (missingRootIds.length > 0) {
    reports.push(createPackagingReport(
      "error",
      "MISSING_PACKAGE_ROOT",
      `Package root IDs are missing from the dependency graph: ${missingRootIds.join(", ")}.`
    ));
    return createBlockedResult(validationResult, reports);
  }

  const traversal = traverseDependencies(graph, rootIds);
  const assets = traversal.assetIds.map((assetId) => buildAssetRecord(registry, graph.nodes?.[assetId] || { id: assetId }));
  reports.push(createPackagingReport(
    "info",
    "PACKAGE_READY",
    `Strict packaging succeeded for ${rootIds.length} root${rootIds.length === 1 ? "" : "s"} with ${assets.length} included assets.`
  ));

  const manifest = {
    package: {
      version: 1,
      projectId: sanitizeText(registry.projectId) || "project",
      createdFrom: {
        registryVersion: Number.isFinite(registry.version) ? registry.version : 1,
        graphVersion: Number.isFinite(graph?.version) ? graph.version : 1
      },
      roots: rootIds.map((id) => ({
        id,
        type: sanitizeText(graph.nodes?.[id]?.type)
      })),
      assets,
      dependencies: traversal.dependencies,
      reports
    }
  };

  const reportText = [
    `Packaging status: ready`,
    `Project: ${manifest.package.projectId}`,
    `Roots: ${manifest.package.roots.map((root) => `${root.id} (${root.type})`).join(", ")}`,
    `Assets: ${manifest.package.assets.map((asset) => `${asset.id} -> ${asset.path || "[no-path]"}`).join(", ")}`,
    `Dependencies: ${manifest.package.dependencies.map((dependency) => `${dependency.from} -[${dependency.type}]-> ${dependency.to}`).join(", ")}`,
    `Reports: ${reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`).join(" | ")}`
  ].join("\n");

  return {
    packageStatus: "ready",
    manifest,
    reportText
  };
}
