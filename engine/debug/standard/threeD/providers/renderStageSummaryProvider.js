/*
Toolbox Aid
David Quesenberry
04/05/2026
renderStageSummaryProvider.js
*/

import {
  asArray,
  asFinite,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_RENDER_STAGE_SUMMARY = "provider.3d.renderStages.snapshot";

function readRenderStageSummary(raw) {
  const source = asObject(raw);
  const enabledStages = asArray(source.enabledStages)
    .map((stage) => sanitizeText(stage))
    .filter(Boolean);
  return {
    stageCount: asNonNegativeInteger(source.stageCount, enabledStages.length),
    enabledStages,
    avgFrameTimeMs: asFinite(source.avgFrameTimeMs, 0),
    drawCalls: asNonNegativeInteger(source.drawCalls, 0)
  };
}

export function createRenderStageSummaryProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "renderStageSummary");
  return createProvider(
    PROVIDER_3D_RENDER_STAGE_SUMMARY,
    "3D Render Stage Summary",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.renderStageSummary);
      return readRenderStageSummary(source);
    }
  );
}
