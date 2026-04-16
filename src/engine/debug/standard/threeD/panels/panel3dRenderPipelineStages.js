/*
Toolbox Aid
David Quesenberry
04/16/2026
panel3dRenderPipelineStages.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_RENDER_PIPELINE_STAGES = "3d.renderStages";

function toStageLine(stage, index) {
  return toLinePair(
    `stage.${index + 1}`,
    `${stage.stageId}|${stage.status}|enabled=${stage.enabled === true}`
  );
}

export function create3dRenderPipelineStagesPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_RENDER_PIPELINE_STAGES,
    title: "3D Render Pipeline Stages",
    provider,
    priority: options.priority ?? 1120,
    enabled: options.enabled === true,
    linesBuilder(snapshot = {}) {
      const stageRows = Array.isArray(snapshot.stageRows) ? snapshot.stageRows : [];
      const baseLines = [
        toLinePair("stageCount", snapshot.stageCount),
        toLinePair("activeCount", snapshot.activeCount)
      ];

      if (stageRows.length === 0) {
        return [
          ...baseLines,
          toLinePair("stages", "none")
        ];
      }

      return [
        ...baseLines,
        ...stageRows.map((stage, index) => toStageLine(stage, index))
      ];
    }
  });
}
