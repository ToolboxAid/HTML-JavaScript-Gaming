import { inspectVectorAssetContract } from "./vector/vectorAssetContract.js";
import { prepareVectorRenderables } from "./vector/vectorRenderPrep.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";

export const VECTOR_GEOMETRY_RUNTIME_POLICY = Object.freeze({
  contract: "vector-geometry-runtime/1",
  precision: {
    epsilon: 0.000001,
    decimalPlaces: 6,
    rounding: "round-to-fixed-6"
  },
  transformOrder: [
    "local-shape-points",
    "normalized-contract-points",
    "scale",
    "rotate",
    "translate"
  ],
  renderOrder: [
    "layer-order",
    "shape-order-within-layer"
  ],
  collisionPolicy: "collision-primitives-follow-render-order"
});

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

export function inspectVectorGeometryRuntimeAsset(asset, options = {}) {
  const inspection = inspectVectorAssetContract(asset, options);
  if (inspection.issues.length > 0) {
    return {
      status: "invalid",
      normalizedAsset: inspection.asset,
      issues: inspection.issues,
      renderPrep: null
    };
  }

  return {
    status: "ready",
    normalizedAsset: inspection.asset,
    issues: [],
    renderPrep: prepareVectorRenderables(inspection.asset, options)
  };
}

export function prepareVectorGeometryRuntimeAsset(asset, options = {}) {
  const inspection = inspectVectorGeometryRuntimeAsset(asset, options);
  if (inspection.status !== "ready") {
    const leadIssue = inspection.issues[0];
    throw new Error(leadIssue?.message || "Invalid vector asset contract.");
  }

  return {
    id: inspection.normalizedAsset.assetId,
    assetId: inspection.normalizedAsset.assetId,
    name: inspection.normalizedAsset.name,
    type: "vector",
    runtimeKind: "vector-geometry",
    format: inspection.normalizedAsset.format,
    version: inspection.normalizedAsset.version,
    path: inspection.normalizedAsset.path,
    paletteId: inspection.normalizedAsset.paletteId,
    sourceTool: inspection.normalizedAsset.sourceTool,
    viewport: cloneJson(inspection.normalizedAsset.viewport),
    origin: cloneJson(inspection.normalizedAsset.origin),
    anchors: cloneJson(inspection.normalizedAsset.anchors),
    layers: cloneJson(inspection.normalizedAsset.layers),
    bounds: cloneJson(inspection.renderPrep.bounds),
    renderables: cloneJson(inspection.renderPrep.renderables),
    collisionPrimitives: cloneJson(inspection.renderPrep.collisionPrimitives),
    runtimePolicy: cloneJson(VECTOR_GEOMETRY_RUNTIME_POLICY),
    metadata: cloneJson(inspection.normalizedAsset.metadata),
    reports: [
      createReport("info", "VECTOR_CONTRACT_ACCEPTED", `Accepted vector contract for ${inspection.normalizedAsset.assetId}.`),
      createReport("info", "VECTOR_RENDER_READY", `Prepared ${inspection.renderPrep.renderables.length} renderable primitive${inspection.renderPrep.renderables.length === 1 ? "" : "s"} for runtime.`),
      createReport("info", "VECTOR_RUNTIME_POLICY", "Applied deterministic vector runtime policy: scale -> rotate -> translate with fixed six-decimal rounding.")
    ],
    contract: cloneJson(inspection.normalizedAsset)
  };
}

export function summarizeVectorGeometryRuntime(result) {
  const assetId = sanitizeText(result?.assetId) || sanitizeText(result?.id) || "vector";
  const renderableCount = Array.isArray(result?.renderables) ? result.renderables.length : 0;
  return `Vector geometry runtime ready for ${assetId} with ${renderableCount} renderable primitive${renderableCount === 1 ? "" : "s"}.`;
}
