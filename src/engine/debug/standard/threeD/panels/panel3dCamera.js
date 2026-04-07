/*
Toolbox Aid
David Quesenberry
04/05/2026
panel3dCamera.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_CAMERA = "3d.camera";

export function create3dCameraPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_CAMERA,
    title: "3D Camera",
    provider,
    priority: options.priority ?? 1110,
    enabled: options.enabled === true,
    linesBuilder(summary = {}) {
      return [
        toLinePair("activeCameraId", summary.activeCameraId),
        toLinePair("mode", summary.mode),
        toLinePair("fov", summary.fov),
        toLinePair("zoom", summary.zoom),
        toLinePair("clip", `${summary.near}..${summary.far}`)
      ];
    }
  });
}
