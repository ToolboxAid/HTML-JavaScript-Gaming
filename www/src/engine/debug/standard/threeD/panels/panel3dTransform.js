/*
Toolbox Aid
David Quesenberry
04/05/2026
panel3dTransform.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_TRANSFORM = "3d.transform";

export function create3dTransformPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_TRANSFORM,
    title: "3D Transform",
    provider,
    priority: options.priority ?? 1100,
    enabled: options.enabled === true,
    linesBuilder(summary = {}) {
      return [
        toLinePair("nodeCount", summary.nodeCount),
        toLinePair("selectedCount", summary.selectedCount),
        toLinePair("dirtyCount", summary.dirtyCount),
        toLinePair("frozenCount", summary.frozenCount),
        toLinePair("activeNodeId", summary.activeNodeId)
      ];
    }
  });
}
