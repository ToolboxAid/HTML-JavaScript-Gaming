/*
Toolbox Aid
David Quesenberry
04/16/2026
overlayExpansionContracts.js
*/

const DEFAULT_CHANNEL = 'debug';

function normalizeOverlayEntry(entry) {
  const id = String(entry?.id ?? '').trim();
  if (!id) {
    return null;
  }
  const label = String(entry?.label ?? id).trim() || id;
  return { id, label };
}

function normalizeOverlayStack(overlays) {
  const normalized = [];
  for (let i = 0; i < overlays.length; i += 1) {
    const candidate = normalizeOverlayEntry(overlays[i]);
    if (!candidate) {
      continue;
    }
    if (normalized.some((overlay) => overlay.id === candidate.id)) {
      continue;
    }
    normalized.push(candidate);
  }
  return normalized;
}

function resolveInitialOverlayId(overlays, initialOverlayId) {
  if (overlays.length === 0) {
    return '';
  }

  const requestedId = String(initialOverlayId || '').trim();
  if (!requestedId) {
    return overlays[0].id;
  }

  const exists = overlays.some((overlay) => overlay.id === requestedId);
  return exists ? requestedId : overlays[0].id;
}

function normalizeRuntimeExtensionEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const overlayId = String(entry.overlayId || '').trim();
  const onStep = typeof entry.onStep === 'function' ? entry.onStep : null;
  const onRender = typeof entry.onRender === 'function' ? entry.onRender : null;
  const resolvePanelSize = typeof entry.resolvePanelSize === 'function' ? entry.resolvePanelSize : null;
  const resolveContextBehavior = typeof entry.resolveContextBehavior === 'function'
    ? entry.resolveContextBehavior
    : null;
  if (!onStep && !onRender) {
    return null;
  }

  const layerOrderRaw = Number(entry.layerOrder);
  const layerOrder = Number.isFinite(layerOrderRaw) ? layerOrderRaw : 0;
  const visualPriorityRaw = Number(entry.visualPriority);
  const visualPriority = Number.isFinite(visualPriorityRaw) ? visualPriorityRaw : layerOrder;
  const panelWidthRaw = Number(entry.panelWidth);
  const panelHeightRaw = Number(entry.panelHeight);
  const panelWidth = Number.isFinite(panelWidthRaw) && panelWidthRaw > 0 ? panelWidthRaw : 260;
  const panelHeight = Number.isFinite(panelHeightRaw) && panelHeightRaw > 0 ? panelHeightRaw : 96;

  return Object.freeze({
    overlayId,
    onStep,
    onRender,
    resolvePanelSize,
    resolveContextBehavior,
    compose: entry.compose === true,
    layerOrder,
    visualPriority,
    panelWidth,
    panelHeight,
  });
}

function normalizeRuntimeExtensions(runtimeExtensions) {
  if (!Array.isArray(runtimeExtensions) || runtimeExtensions.length === 0) {
    return Object.freeze([]);
  }

  const normalized = [];
  for (let i = 0; i < runtimeExtensions.length; i += 1) {
    const candidate = normalizeRuntimeExtensionEntry(runtimeExtensions[i]);
    if (!candidate) {
      continue;
    }
    normalized.push(candidate);
  }
  return Object.freeze(normalized);
}

export function defineOverlayExtensionContract({
  id = '',
  overlays = [],
  initialOverlayId = '',
  cycleKey = '',
  persistenceKey = '',
  channel = DEFAULT_CHANNEL,
  runtimeExtensions = [],
  metadata = {},
} = {}) {
  const normalizedId = String(id || '').trim();
  if (!normalizedId) {
    throw new Error('Overlay extension contract requires a non-empty id.');
  }

  const normalizedOverlays = normalizeOverlayStack(Array.isArray(overlays) ? overlays : []);
  if (normalizedOverlays.length === 0) {
    throw new Error(`Overlay extension contract "${normalizedId}" requires at least one overlay entry.`);
  }

  const normalizedCycleKey = String(cycleKey || '').trim();
  const normalizedPersistenceKey = String(persistenceKey || '').trim();
  const normalizedChannel = String(channel || DEFAULT_CHANNEL).trim() || DEFAULT_CHANNEL;
  const normalizedInitialOverlayId = resolveInitialOverlayId(normalizedOverlays, initialOverlayId);
  const normalizedRuntimeExtensions = normalizeRuntimeExtensions(runtimeExtensions);

  return Object.freeze({
    id: normalizedId,
    channel: normalizedChannel,
    overlays: Object.freeze(normalizedOverlays),
    initialOverlayId: normalizedInitialOverlayId,
    cycleKey: normalizedCycleKey,
    persistenceKey: normalizedPersistenceKey,
    runtimeExtensions: normalizedRuntimeExtensions,
    metadata: Object.freeze({ ...(metadata || {}) }),
  });
}

export function createOverlayExtensionContractMap(contracts = []) {
  const map = new Map();
  for (let i = 0; i < contracts.length; i += 1) {
    const contract = contracts[i];
    if (!contract || typeof contract !== 'object') {
      continue;
    }
    const id = String(contract.id || '').trim();
    if (!id) {
      continue;
    }
    map.set(id, contract);
  }
  return map;
}

export function getOverlayControllerConfigFromContract(contract) {
  if (!contract || typeof contract !== 'object') {
    throw new Error('Overlay contract is required to resolve overlay controller config.');
  }
  return Object.freeze({
    overlays: contract.overlays,
    initialOverlayId: contract.initialOverlayId,
    cycleKey: contract.cycleKey,
    persistenceKey: contract.persistenceKey,
    runtimeExtensions: contract.runtimeExtensions,
  });
}
