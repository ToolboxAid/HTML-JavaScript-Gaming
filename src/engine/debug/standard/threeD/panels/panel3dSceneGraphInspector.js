/*
Toolbox Aid
David Quesenberry
04/16/2026
panel3dSceneGraphInspector.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_SCENE_GRAPH_INSPECTOR = "3d.sceneGraph";

function toNodeLine(node, index) {
  const indent = node.depth > 0 ? `${".".repeat(node.depth)} ` : "";
  const label = `${indent}${node.nodeId}`;
  return toLinePair(
    `node.${index + 1}`,
    `${label}|parent=${node.parentId}|children=${node.childCount}|active=${node.active === true}`
  );
}

export function create3dSceneGraphInspectorPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_SCENE_GRAPH_INSPECTOR,
    title: "3D Scene Graph Inspector",
    provider,
    priority: options.priority ?? 1140,
    enabled: options.enabled === true,
    linesBuilder(snapshot = {}) {
      const nodeRows = Array.isArray(snapshot.nodeRows) ? snapshot.nodeRows : [];
      const baseLines = [
        toLinePair("nodeCount", snapshot.nodeCount),
        toLinePair("rootCount", snapshot.rootCount),
        toLinePair("maxDepth", snapshot.maxDepth)
      ];

      if (nodeRows.length === 0) {
        return [
          ...baseLines,
          toLinePair("nodes", "none")
        ];
      }

      return [
        ...baseLines,
        ...nodeRows.map((node, index) => toNodeLine(node, index))
      ];
    }
  });
}
