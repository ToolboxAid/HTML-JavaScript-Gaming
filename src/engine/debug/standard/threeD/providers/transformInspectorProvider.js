/*
Toolbox Aid
David Quesenberry
04/16/2026
transformInspectorProvider.js
*/

import {
  asArray,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_TRANSFORM_INSPECTOR = "provider.3d.transformInspector.snapshot";

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function toFiniteOrDefault(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function toTransformRow(rawNode, index) {
  if (typeof rawNode === "string") {
    const nodeId = sanitizeText(rawNode) || `node-${index + 1}`;
    return {
      nodeId,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      frozen: false,
      dirty: false,
      order: index
    };
  }

  const source = asObject(rawNode);
  const position = asObject(source.position);
  const rotation = asObject(source.rotation);
  const scale = asObject(source.scale);
  const nodeId = sanitizeText(source.nodeId) || sanitizeText(source.id) || `node-${index + 1}`;
  const order = asNonNegativeInteger(source.order, index);

  return {
    nodeId,
    position: {
      x: toFiniteOrDefault(position.x, 0),
      y: toFiniteOrDefault(position.y, 0),
      z: toFiniteOrDefault(position.z, 0)
    },
    rotation: {
      x: toFiniteOrDefault(rotation.x, 0),
      y: toFiniteOrDefault(rotation.y, 0),
      z: toFiniteOrDefault(rotation.z, 0)
    },
    scale: {
      x: toFiniteOrDefault(scale.x, 1),
      y: toFiniteOrDefault(scale.y, 1),
      z: toFiniteOrDefault(scale.z, 1)
    },
    frozen: toBoolean(source.frozen, false),
    dirty: toBoolean(source.dirty, false),
    order
  };
}

function byDeterministicOrder(left, right) {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.nodeId.localeCompare(right.nodeId);
}

function readTransformInspector(raw) {
  const source = asObject(raw);
  const selectedIds = asArray(source.selectedIds)
    .map((id) => sanitizeText(id))
    .filter(Boolean);

  const rawRows = Array.isArray(source.nodeRows)
    ? source.nodeRows
    : Array.isArray(source.nodes)
      ? source.nodes
      : selectedIds;

  const nodeRows = rawRows
    .map((node, index) => toTransformRow(node, index))
    .sort(byDeterministicOrder);

  const activeNodeId = sanitizeText(source.activeNodeId) || (nodeRows[0]?.nodeId ?? "none");

  return {
    nodeRows,
    nodeCount: asNonNegativeInteger(source.nodeCount, nodeRows.length),
    selectedCount: asNonNegativeInteger(source.selectedCount, selectedIds.length),
    selectedIds,
    frozenCount: asNonNegativeInteger(
      source.frozenCount,
      nodeRows.filter((row) => row.frozen === true).length
    ),
    dirtyCount: asNonNegativeInteger(
      source.dirtyCount,
      nodeRows.filter((row) => row.dirty === true).length
    ),
    activeNodeId
  };
}

export function createTransformInspectorProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "transformInspector");
  return createProvider(
    PROVIDER_3D_TRANSFORM_INSPECTOR,
    "3D Transform Inspector",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.transformInspector);
      return readTransformInspector(source);
    }
  );
}
