/*
Toolbox Aid
David Quesenberry
04/05/2026
index.js
*/

export { createStandard3dProviders, registerStandard3dProviders } from "./providers/registerStandard3dProviders.js";
export {
  PROVIDER_3D_CAMERA_SUMMARY,
  createCameraSummaryProvider
} from "./providers/cameraSummaryProvider.js";
export {
  PROVIDER_3D_TRANSFORM_INSPECTOR,
  createTransformInspectorProvider
} from "./providers/transformInspectorProvider.js";
export {
  PROVIDER_3D_RENDER_PIPELINE_STAGES,
  createRenderPipelineStagesProvider
} from "./providers/renderPipelineStagesProvider.js";
export {
  PROVIDER_3D_COLLISION_OVERLAYS,
  createCollisionOverlaysProvider
} from "./providers/collisionOverlaysProvider.js";
export {
  PROVIDER_3D_SCENE_GRAPH_INSPECTOR,
  createSceneGraphInspectorProvider
} from "./providers/sceneGraphInspectorProvider.js";

export { createStandard3dPanels, registerStandard3dPanels } from "./panels/registerStandard3dPanels.js";
export { PANEL_3D_CAMERA, create3dCameraPanel } from "./panels/panel3dCamera.js";
export {
  PANEL_3D_TRANSFORM_INSPECTOR,
  create3dTransformInspectorPanel
} from "./panels/panel3dTransformInspector.js";
export {
  PANEL_3D_RENDER_PIPELINE_STAGES,
  create3dRenderPipelineStagesPanel
} from "./panels/panel3dRenderPipelineStages.js";
export {
  PANEL_3D_COLLISION_OVERLAYS,
  create3dCollisionOverlaysPanel
} from "./panels/panel3dCollisionOverlays.js";
export {
  PANEL_3D_SCENE_GRAPH_INSPECTOR,
  create3dSceneGraphInspectorPanel
} from "./panels/panel3dSceneGraphInspector.js";

export {
  STANDARD_3D_DEBUG_PRESETS,
  registerStandard3dDebugPresets
} from "./presets/registerStandard3dDebugPresets.js";
export { createStandard3dDebugPluginDefinition } from "./bootstrap/createStandard3dDebugSurfaceIntegration.js";
export * as legacySummary3d from "./legacySummarySurface.js";
