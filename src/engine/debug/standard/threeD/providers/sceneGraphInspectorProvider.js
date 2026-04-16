/*
Toolbox Aid
David Quesenberry
04/16/2026
sceneGraphInspectorProvider.js
*/

import {
  asArray,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_SCENE_GRAPH_INSPECTOR = "provider.3d.sceneGraphInspector.snapshot";

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function toNodeRow(rawNode, index) {
  if (typeof rawNode === "string") {
    const nodeId = sanitizeText(rawNode) || `node-${index + 1}`;
    return {
      nodeId,
      parentId: "none",
      depth: 0,
      childCount: 0,
      active: true,
      order: index
    };
  }

  const source = asObject(rawNode);
  const nodeId = sanitizeText(source.nodeId) || sanitizeText(source.id) || `node-${index + 1}`;
  const parentId = sanitizeText(source.parentId) || sanitizeText(source.parent) || "none";
  const depth = asNonNegativeInteger(source.depth, 0);
  const children = asArray(source.children);
  const childCount = asNonNegativeInteger(source.childCount, children.length);
  const active = toBoolean(source.active, true);
  const order = asNonNegativeInteger(source.order, index);

  return {
    nodeId,
    parentId,
    depth,
    childCount,
    active,
    order
  };
}

function byDeterministicOrder(left, right) {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  if (left.depth !== right.depth) {
    return left.depth - right.depth;
  }
  return left.nodeId.localeCompare(right.nodeId);
}

function readSceneGraphInspector(raw) {
  const source = asObject(raw);
  const rawRows = Array.isArray(source.nodeRows)
    ? source.nodeRows
    : Array.isArray(source.nodes)
      ? source.nodes
      : asArray(source.rootNodeIds);

  const nodeRows = rawRows
    .map((node, index) => toNodeRow(node, index))
    .sort(byDeterministicOrder);

  return {
    nodeRows,
    nodeCount: nodeRows.length,
    rootCount: nodeRows.filter((node) => node.depth === 0 || node.parentId === "none").length,
    maxDepth: nodeRows.reduce((maxDepth, node) => Math.max(maxDepth, node.depth), 0)
  };
}

export function createSceneGraphInspectorProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "sceneGraphInspector");
  return createProvider(
    PROVIDER_3D_SCENE_GRAPH_INSPECTOR,
    "3D Scene Graph Inspector",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.sceneGraphInspector);
      return readSceneGraphInspector(source);
    }
  );
}
