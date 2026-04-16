/*
Toolbox Aid
David Quesenberry
04/16/2026
movementOverlayStack.js
*/
export const MOVEMENT_DEBUG_CYCLE_KEY = 'KeyG';
export const OVERLAY_MOVEMENT_RUNTIME = 'movement-runtime';
export const OVERLAY_MOVEMENT_HUD = 'movement-lab-hud';

export function createMovementOverlayCycleMap() {
  return [
    { id: OVERLAY_MOVEMENT_RUNTIME, label: 'Movement Runtime' },
    { id: OVERLAY_MOVEMENT_HUD, label: 'Movement Lab HUD' },
  ];
}
