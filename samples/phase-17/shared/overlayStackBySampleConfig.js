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
import {
  createOverlayExtensionContractMap,
  defineOverlayExtensionContract,
  getOverlayControllerConfigFromContract,
} from '/samples/phase-17/shared/overlayExpansionContracts.js';

const LEVEL17_OVERLAY_EXTENSION_CONTRACTS = Object.freeze([
  defineOverlayExtensionContract({
    id: '1708',
    channel: 'debug',
    overlays: Object.freeze(createMiniGameOverlayCycleMap()),
    initialOverlayId: OVERLAY_UI_LAYER,
    persistenceKey: 'phase17:1708:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  defineOverlayExtensionContract({
    id: '1709',
    channel: 'debug',
    overlays: Object.freeze(createMovementOverlayCycleMap()),
    initialOverlayId: OVERLAY_MOVEMENT_RUNTIME,
    persistenceKey: 'phase17:1709:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  defineOverlayExtensionContract({
    id: '1710',
    channel: 'debug',
    overlays: Object.freeze(createMiniGameOverlayCycleMap()),
    initialOverlayId: OVERLAY_UI_LAYER,
    persistenceKey: 'phase17:1710:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  defineOverlayExtensionContract({
    id: '1711',
    channel: 'debug',
    overlays: Object.freeze(createMovementOverlayCycleMap()),
    initialOverlayId: OVERLAY_MOVEMENT_RUNTIME,
    persistenceKey: 'phase17:1711:overlay-index',
    cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
  }),
  defineOverlayExtensionContract({
    id: '1712',
    channel: 'debug',
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
  defineOverlayExtensionContract({
    id: '1713',
    channel: 'debug',
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
]);

const LEVEL17_OVERLAY_EXTENSION_CONTRACT_MAP = createOverlayExtensionContractMap(LEVEL17_OVERLAY_EXTENSION_CONTRACTS);

const SAMPLE_OVERLAY_STACKS = Object.freeze(
  Object.fromEntries(
    Array.from(LEVEL17_OVERLAY_EXTENSION_CONTRACT_MAP.entries(), ([sampleId, contract]) => [
      sampleId,
      getOverlayControllerConfigFromContract(contract),
    ])
  )
);

export function getLevel17OverlayExtensionContract(sampleId) {
  const id = String(sampleId || '').trim();
  if (!id) {
    return null;
  }
  return LEVEL17_OVERLAY_EXTENSION_CONTRACT_MAP.get(id) ?? null;
}

export function listLevel17OverlayExtensionContracts() {
  return LEVEL17_OVERLAY_EXTENSION_CONTRACTS;
}

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
