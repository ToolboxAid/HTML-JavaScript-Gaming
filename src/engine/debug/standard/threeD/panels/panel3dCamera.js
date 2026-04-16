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

function formatVector3(value = {}) {
  const x = Number.isFinite(value.x) ? Number(value.x).toFixed(2) : "0.00";
  const y = Number.isFinite(value.y) ? Number(value.y).toFixed(2) : "0.00";
  const z = Number.isFinite(value.z) ? Number(value.z).toFixed(2) : "0.00";
  return `${x},${y},${z}`;
}

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
        toLinePair("position", formatVector3(summary.position)),
        toLinePair("rotation", formatVector3(summary.rotation)),
        toLinePair("fov", summary.fov),
        toLinePair("zoom", summary.zoom),
        toLinePair("clip", `${summary.near}..${summary.far}`)
      ];
    }
  });
}
