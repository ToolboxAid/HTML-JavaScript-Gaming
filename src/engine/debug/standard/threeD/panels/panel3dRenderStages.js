/*
Toolbox Aid
David Quesenberry
04/05/2026
panel3dRenderStages.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_RENDER_STAGES = "3d.renderStages";

export function create3dRenderStagesPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_RENDER_STAGES,
    title: "3D Render Stages",
    provider,
    priority: options.priority ?? 1120,
    enabled: options.enabled === true,
    linesBuilder(summary = {}) {
      const stages = Array.isArray(summary.enabledStages) && summary.enabledStages.length > 0
        ? summary.enabledStages.join(",")
        : "none";
      return [
        toLinePair("stageCount", summary.stageCount),
        toLinePair("drawCalls", summary.drawCalls),
        toLinePair("avgFrameTimeMs", summary.avgFrameTimeMs),
        toLinePair("enabledStages", stages)
      ];
    }
  });
}
