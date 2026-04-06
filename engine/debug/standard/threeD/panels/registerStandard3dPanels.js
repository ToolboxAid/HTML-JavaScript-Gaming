/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandard3dPanels.js
*/

import { PROVIDER_3D_CAMERA_SUMMARY } from "../providers/cameraSummaryProvider.js";
import { PROVIDER_3D_COLLISION_SUMMARY } from "../providers/collisionSummaryProvider.js";
import { PROVIDER_3D_RENDER_STAGE_SUMMARY } from "../providers/renderStageSummaryProvider.js";
import { PROVIDER_3D_SCENE_GRAPH_SUMMARY } from "../providers/sceneGraphSummaryProvider.js";
import { PROVIDER_3D_TRANSFORM_SUMMARY } from "../providers/transformSummaryProvider.js";
import { create3dCameraPanel } from "./panel3dCamera.js";
import { create3dCollisionPanel } from "./panel3dCollision.js";
import { create3dRenderStagesPanel } from "./panel3dRenderStages.js";
import { create3dSceneGraphPanel } from "./panel3dSceneGraph.js";
import { create3dTransformPanel } from "./panel3dTransform.js";

function pickProvider(providerMap, providerId) {
  if (providerMap instanceof Map) {
    return providerMap.get(providerId) || null;
  }
  return null;
}

export function createStandard3dPanels(options = {}) {
  const providerMap = options?.providerMap instanceof Map
    ? options.providerMap
    : new Map();

  const transform = create3dTransformPanel(pickProvider(providerMap, PROVIDER_3D_TRANSFORM_SUMMARY), {
    enabled: options.enabled === true
  });
  const camera = create3dCameraPanel(pickProvider(providerMap, PROVIDER_3D_CAMERA_SUMMARY), {
    enabled: options.enabled === true
  });
  const renderStages = create3dRenderStagesPanel(pickProvider(providerMap, PROVIDER_3D_RENDER_STAGE_SUMMARY), {
    enabled: options.enabled === true
  });
  const collision = create3dCollisionPanel(pickProvider(providerMap, PROVIDER_3D_COLLISION_SUMMARY), {
    enabled: options.enabled === true
  });
  const sceneGraph = create3dSceneGraphPanel(pickProvider(providerMap, PROVIDER_3D_SCENE_GRAPH_SUMMARY), {
    enabled: options.enabled === true
  });

  return [
    transform,
    camera,
    renderStages,
    collision,
    sceneGraph
  ];
}

export function registerStandard3dPanels(panelRegistry, options = {}) {
  if (!panelRegistry || typeof panelRegistry.registerPanel !== "function") {
    return [];
  }

  const source = typeof options?.source === "string" && options.source.trim()
    ? options.source.trim()
    : "standard.3d";

  const panels = createStandard3dPanels(options);
  return panels.map((panel) => panelRegistry.registerPanel(panel, source));
}
