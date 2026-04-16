/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19OverlayExpansionFramework.js
*/
import { LEVEL17_OVERLAY_CYCLE_KEY } from '/samples/phase-17/shared/overlayCycleInput.js';
import {
  defineOverlayExtensionContract,
  getOverlayControllerConfigFromContract,
} from '/samples/phase-17/shared/overlayExpansionContracts.js';
import { createOverlayGameplayRuntime } from '/samples/phase-17/shared/overlayGameplayRuntime.js';

const DEFAULT_CHANNEL = 'gameplay';

function normalizeContractId(contractId) {
  return String(contractId || '').trim();
}

export function definePhase19OverlayExtension({
  id = '',
  overlays = [],
  initialOverlayId = '',
  cycleKey = LEVEL17_OVERLAY_CYCLE_KEY,
  persistenceKey = '',
  channel = DEFAULT_CHANNEL,
  runtimeExtensions = [],
  metadata = {},
} = {}) {
  return defineOverlayExtensionContract({
    id,
    overlays,
    initialOverlayId,
    cycleKey: String(cycleKey || LEVEL17_OVERLAY_CYCLE_KEY).trim() || LEVEL17_OVERLAY_CYCLE_KEY,
    persistenceKey,
    channel: String(channel || DEFAULT_CHANNEL).trim() || DEFAULT_CHANNEL,
    runtimeExtensions,
    metadata: {
      phase: '19',
      ...(metadata || {}),
    },
  });
}

function normalizeExtensionContract(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Overlay extension registration requires a contract-like object.');
  }

  const id = normalizeContractId(candidate.id);
  if (!id || !Array.isArray(candidate.overlays)) {
    throw new Error('Overlay extension registration requires contract id and overlays.');
  }

  if (Object.isFrozen(candidate) && typeof candidate.initialOverlayId === 'string') {
    return candidate;
  }

  return definePhase19OverlayExtension(candidate);
}

export default function createPhase19OverlayExpansionFramework({ extensions = [] } = {}) {
  const contractMap = new Map();

  function registerExtension(extension) {
    const contract = normalizeExtensionContract(extension);
    contractMap.set(contract.id, contract);
    return contract;
  }

  function unregisterExtension(id) {
    const normalizedId = normalizeContractId(id);
    if (!normalizedId) {
      return false;
    }
    return contractMap.delete(normalizedId);
  }

  function getExtension(id) {
    const normalizedId = normalizeContractId(id);
    if (!normalizedId) {
      return null;
    }
    return contractMap.get(normalizedId) ?? null;
  }

  function listExtensions() {
    return Object.freeze(Array.from(contractMap.values()));
  }

  function listExtensionIds() {
    return Object.freeze(Array.from(contractMap.keys()));
  }

  function getControllerConfig(id) {
    const extension = getExtension(id);
    if (!extension) {
      return null;
    }
    return getOverlayControllerConfigFromContract(extension);
  }

  function createRuntimeForExtension(id) {
    const extension = getExtension(id);
    if (!extension) {
      return null;
    }
    const preferenceStorageKey = String(extension.persistenceKey || '').trim()
      ? `${String(extension.persistenceKey || '').trim()}:runtime-preferences`
      : '';
    const runtime = createOverlayGameplayRuntime({
      runtimeExtensions: extension.runtimeExtensions,
      preferenceStorageKey,
      autoLoadPreferences: true,
      cycleKey: String(extension.cycleKey || LEVEL17_OVERLAY_CYCLE_KEY).trim() || LEVEL17_OVERLAY_CYCLE_KEY,
    });
    return runtime;
  }

  if (Array.isArray(extensions)) {
    for (let i = 0; i < extensions.length; i += 1) {
      registerExtension(extensions[i]);
    }
  }

  return {
    registerExtension,
    unregisterExtension,
    getExtension,
    listExtensions,
    listExtensionIds,
    getControllerConfig,
    createRuntimeForExtension,
  };
}
