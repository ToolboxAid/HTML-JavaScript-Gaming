/*
Toolbox Aid
David Quesenberry
04/16/2026
renderPipelineStagesProvider.js
*/

import {
  asArray,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_RENDER_PIPELINE_STAGES = "provider.3d.renderPipelineStages.snapshot";

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function toStageRow(rawStage, index) {
  if (typeof rawStage === "string") {
    const stageId = sanitizeText(rawStage) || `stage-${index + 1}`;
    return {
      stageId,
      label: stageId,
      status: "enabled",
      enabled: true,
      order: index
    };
  }

  const source = asObject(rawStage);
  const stageId = sanitizeText(source.stageId) || sanitizeText(source.id) || `stage-${index + 1}`;
  const label = sanitizeText(source.label) || sanitizeText(source.title) || stageId;
  const status = sanitizeText(source.status) || "unknown";
  const enabled = toBoolean(source.enabled, status === "enabled");
  const order = asNonNegativeInteger(source.order, index);

  return {
    stageId,
    label,
    status,
    enabled,
    order
  };
}

function byDeterministicOrder(left, right) {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.stageId.localeCompare(right.stageId);
}

function readRenderPipelineStages(raw) {
  const source = asObject(raw);
  const rawStages = Array.isArray(source.stageRows)
    ? source.stageRows
    : Array.isArray(source.stages)
      ? source.stages
      : asArray(source.enabledStages);

  const stageRows = rawStages
    .map((stage, index) => toStageRow(stage, index))
    .sort(byDeterministicOrder);

  return {
    stageRows,
    stageCount: stageRows.length,
    activeCount: stageRows.filter((stage) => stage.enabled === true).length
  };
}

export function createRenderPipelineStagesProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "renderPipelineStages");
  return createProvider(
    PROVIDER_3D_RENDER_PIPELINE_STAGES,
    "3D Render Pipeline Stages",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.renderPipelineStages);
      return readRenderPipelineStages(source);
    }
  );
}
