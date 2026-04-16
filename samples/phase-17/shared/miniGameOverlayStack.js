/*
Toolbox Aid
David Quesenberry
04/16/2026
miniGameOverlayStack.js
*/
export const MINI_GAME_DEBUG_CYCLE_KEY = 'KeyG';
export const OVERLAY_UI_LAYER = 'ui-layer';
export const OVERLAY_MISSION_FEED = 'mission-feed';
export const OVERLAY_MISSION_READY = 'mission-ready';
export const OVERLAY_MINI_GAME_RUNTIME = 'mini-game-runtime';

export function createMiniGameOverlayCycleMap() {
  return [
    { id: OVERLAY_UI_LAYER, label: 'UI Layer' },
    { id: OVERLAY_MISSION_FEED, label: 'Mission Feed' },
    { id: OVERLAY_MISSION_READY, label: 'MISSION READY' },
    { id: OVERLAY_MINI_GAME_RUNTIME, label: 'Mini-Game Runtime' },
  ];
}
