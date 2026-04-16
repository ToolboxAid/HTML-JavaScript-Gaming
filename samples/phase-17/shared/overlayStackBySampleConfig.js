/*
Toolbox Aid
David Quesenberry
04/16/2026
overlayStackBySampleConfig.js
*/
import { LEVEL17_OVERLAY_CYCLE_KEY } from '/samples/phase-17/shared/overlayCycleInput.js';
import {
  OVERLAY_UI_LAYER,
  createMiniGameOverlayCycleMap,
} from '/samples/phase-17/shared/miniGameOverlayStack.js';
import {
  OVERLAY_MOVEMENT_RUNTIME,
  createMovementOverlayCycleMap,
} from '/samples/phase-17/shared/movementOverlayStack.js';

const SAMPLE_OVERLAY_STACKS = Object.freeze({
  '1708': Object.freeze({
    overlays: Object.freeze(createMiniGameOverlayCycleMap()),
    initialOverlayId: OVERLAY_UI_LAYER,
    persistenceKey: 'phase17:1708:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  '1709': Object.freeze({
    overlays: Object.freeze(createMovementOverlayCycleMap()),
    initialOverlayId: OVERLAY_MOVEMENT_RUNTIME,
    persistenceKey: 'phase17:1709:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  '1710': Object.freeze({
    overlays: Object.freeze(createMiniGameOverlayCycleMap()),
    initialOverlayId: OVERLAY_UI_LAYER,
    persistenceKey: 'phase17:1710:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  '1711': Object.freeze({
    overlays: Object.freeze(createMovementOverlayCycleMap()),
    initialOverlayId: OVERLAY_MOVEMENT_RUNTIME,
    persistenceKey: 'phase17:1711:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  '1712': Object.freeze({
    overlays: Object.freeze([
      { id: 'ui-layer', label: 'UI Layer' },
      { id: 'mission-feed', label: 'Mission Feed' },
      { id: 'mission-ready', label: 'MISSION READY' },
      { id: 'telemetry', label: 'Telemetry Overlay' },
    ]),
    initialOverlayId: 'ui-layer',
    persistenceKey: 'phase17:1712:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  '1713': Object.freeze({
    overlays: Object.freeze([
      { id: 'ui-layer', label: 'UI Layer' },
      { id: 'mission-feed', label: 'Mission Feed' },
      { id: 'mission-ready', label: 'MISSION READY' },
      { id: 'final-reference-runtime', label: 'Final Reference Runtime' },
    ]),
    initialOverlayId: 'ui-layer',
    persistenceKey: 'phase17:1713:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
});

export function getLevel17OverlayStackConfig(sampleId) {
  return SAMPLE_OVERLAY_STACKS[String(sampleId || '').trim()] ?? null;
}

export function getRequiredLevel17OverlayStackConfig(sampleId) {
  const config = getLevel17OverlayStackConfig(sampleId);
  if (config) {
    return config;
  }
  throw new Error(`Missing overlay stack config for sample "${sampleId}".`);
}
