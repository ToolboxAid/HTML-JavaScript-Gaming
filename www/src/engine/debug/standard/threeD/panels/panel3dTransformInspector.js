/*
Toolbox Aid
David Quesenberry
04/16/2026
panel3dTransformInspector.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_TRANSFORM_INSPECTOR = "3d.transform";

function formatVector3(vector = {}, digits = 2) {
  const x = Number.isFinite(vector.x) ? Number(vector.x).toFixed(digits) : Number(0).toFixed(digits);
  const y = Number.isFinite(vector.y) ? Number(vector.y).toFixed(digits) : Number(0).toFixed(digits);
  const z = Number.isFinite(vector.z) ? Number(vector.z).toFixed(digits) : Number(0).toFixed(digits);
  return `${x},${y},${z}`;
}

function toNodeLine(node, index) {
  return toLinePair(
    `node.${index + 1}`,
    `${node.nodeId}|pos=${formatVector3(node.position)}|rot=${formatVector3(node.rotation)}|scale=${formatVector3(node.scale)}|dirty=${node.dirty === true}|frozen=${node.frozen === true}`
  );
}

export function create3dTransformInspectorPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_TRANSFORM_INSPECTOR,
    title: "3D Transform Inspector",
    provider,
    priority: options.priority ?? 1100,
    enabled: options.enabled === true,
    linesBuilder(snapshot = {}) {
      const nodeRows = Array.isArray(snapshot.nodeRows) ? snapshot.nodeRows : [];
      const selectedIds = Array.isArray(snapshot.selectedIds) ? snapshot.selectedIds : [];
      const baseLines = [
        toLinePair("nodeCount", snapshot.nodeCount),
        toLinePair("selectedCount", snapshot.selectedCount),
        toLinePair("dirtyCount", snapshot.dirtyCount),
        toLinePair("frozenCount", snapshot.frozenCount),
        toLinePair("activeNodeId", snapshot.activeNodeId)
      ];

      if (nodeRows.length === 0) {
        return [
          ...baseLines,
          toLinePair("selectedIds", selectedIds.length > 0 ? selectedIds.join(",") : "none"),
          toLinePair("nodes", "none")
        ];
      }

      return [
        ...baseLines,
        toLinePair("selectedIds", selectedIds.length > 0 ? selectedIds.join(",") : "none"),
        ...nodeRows.map((node, index) => toNodeLine(node, index))
      ];
    }
  });
}
