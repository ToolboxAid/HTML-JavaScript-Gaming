/*
Toolbox Aid
David Quesenberry
04/05/2026
panel3dSceneGraph.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_SCENE_GRAPH = "3d.sceneGraph";

export function create3dSceneGraphPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_SCENE_GRAPH,
    title: "3D Scene Graph",
    provider,
    priority: options.priority ?? 1140,
    enabled: options.enabled === true,
    linesBuilder(summary = {}) {
      const rootNodeIds = Array.isArray(summary.rootNodeIds) && summary.rootNodeIds.length > 0
        ? summary.rootNodeIds.join(",")
        : "none";
      return [
        toLinePair("nodeCount", summary.nodeCount),
        toLinePair("rootCount", summary.rootCount),
        toLinePair("maxDepth", summary.maxDepth),
        toLinePair("rootNodeIds", rootNodeIds)
      ];
    }
  });
}
