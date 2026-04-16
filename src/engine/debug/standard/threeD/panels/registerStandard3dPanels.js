/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandard3dPanels.js
*/

import { PROVIDER_3D_CAMERA_SUMMARY } from "../providers/cameraSummaryProvider.js";
import { PROVIDER_3D_COLLISION_OVERLAYS } from "../providers/collisionOverlaysProvider.js";
import { PROVIDER_3D_RENDER_PIPELINE_STAGES } from "../providers/renderPipelineStagesProvider.js";
import { PROVIDER_3D_SCENE_GRAPH_INSPECTOR } from "../providers/sceneGraphInspectorProvider.js";
import { PROVIDER_3D_TRANSFORM_SUMMARY } from "../providers/transformSummaryProvider.js";
import { create3dCameraPanel } from "./panel3dCamera.js";
import { create3dCollisionOverlaysPanel } from "./panel3dCollisionOverlays.js";
import { create3dRenderPipelineStagesPanel } from "./panel3dRenderPipelineStages.js";
import { create3dSceneGraphInspectorPanel } from "./panel3dSceneGraphInspector.js";
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
  const renderStages = create3dRenderPipelineStagesPanel(pickProvider(providerMap, PROVIDER_3D_RENDER_PIPELINE_STAGES), {
    enabled: options.enabled === true
  });
  const collision = create3dCollisionOverlaysPanel(pickProvider(providerMap, PROVIDER_3D_COLLISION_OVERLAYS), {
    enabled: options.enabled === true
  });
  const sceneGraph = create3dSceneGraphInspectorPanel(pickProvider(providerMap, PROVIDER_3D_SCENE_GRAPH_INSPECTOR), {
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
