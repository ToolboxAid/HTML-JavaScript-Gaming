/*
Toolbox Aid
David Quesenberry
04/05/2026
panel3dCollision.js
*/

import {
  createPanelDescriptor,
  toLinePair
} from "../shared/threeDDebugUtils.js";

export const PANEL_3D_COLLISION = "3d.collision";

export function create3dCollisionPanel(provider, options = {}) {
  return createPanelDescriptor({
    id: PANEL_3D_COLLISION,
    title: "3D Collision",
    provider,
    priority: options.priority ?? 1130,
    enabled: options.enabled === true,
    linesBuilder(summary = {}) {
      return [
        toLinePair("colliderCount", summary.colliderCount),
        toLinePair("triggerCount", summary.triggerCount),
        toLinePair("broadphasePairs", summary.broadphasePairs),
        toLinePair("narrowphasePairs", summary.narrowphasePairs),
        toLinePair("activeContacts", summary.activeContacts)
      ];
    }
  });
}
