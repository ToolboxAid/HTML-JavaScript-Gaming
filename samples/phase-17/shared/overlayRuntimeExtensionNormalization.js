/*
Toolbox Aid
David Quesenberry
04/17/2026
overlayRuntimeExtensionNormalization.js
*/

export function normalizeOverlayRuntimeExtensionEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const overlayId = String(entry.overlayId || '').trim();
  const onStep = typeof entry.onStep === 'function' ? entry.onStep : null;
  const onRender = typeof entry.onRender === 'function' ? entry.onRender : null;
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
  const resolvePanelSize = typeof entry.resolvePanelSize === 'function' ? entry.resolvePanelSize : null;
  const resolveContextBehavior = typeof entry.resolveContextBehavior === 'function'
    ? entry.resolveContextBehavior
    : null;

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

export function normalizeOverlayRuntimeExtensions(runtimeExtensions) {
  if (!Array.isArray(runtimeExtensions) || runtimeExtensions.length === 0) {
    return Object.freeze([]);
  }

  const normalized = [];
  for (let i = 0; i < runtimeExtensions.length; i += 1) {
    const candidate = normalizeOverlayRuntimeExtensionEntry(runtimeExtensions[i]);
    if (!candidate) {
      continue;
    }
    normalized.push(candidate);
  }
  return Object.freeze(normalized);
}
