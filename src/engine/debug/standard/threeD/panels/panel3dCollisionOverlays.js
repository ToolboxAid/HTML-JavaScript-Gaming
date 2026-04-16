/*
Toolbox Aid
David Quesenberry
04/16/2026
panel3dCollisionOverlays.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_COLLISION_OVERLAYS = "3d.collision";

function toOverlayLine(overlay, index) {
  return toLinePair(
    `overlay.${index + 1}`,
    `${overlay.overlayId}|${overlay.kind}|${overlay.state}|enabled=${overlay.enabled === true}`
  );
}

export function create3dCollisionOverlaysPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_COLLISION_OVERLAYS,
    title: "3D Collision Overlays",
    provider,
    priority: options.priority ?? 1130,
    enabled: options.enabled === true,
    linesBuilder(snapshot = {}) {
      const overlayRows = Array.isArray(snapshot.overlayRows) ? snapshot.overlayRows : [];
      const baseLines = [
        toLinePair("overlayCount", snapshot.overlayCount),
        toLinePair("activeCount", snapshot.activeCount)
      ];

      if (overlayRows.length === 0) {
        return [
          ...baseLines,
          toLinePair("overlays", "none")
        ];
      }

      return [
        ...baseLines,
        ...overlayRows.map((overlay, index) => toOverlayLine(overlay, index))
      ];
    }
  });
}
