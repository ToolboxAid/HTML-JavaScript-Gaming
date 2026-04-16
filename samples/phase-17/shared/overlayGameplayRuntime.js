/*
Toolbox Aid
David Quesenberry
04/16/2026
overlayGameplayRuntime.js
*/
import {
  isOverlayRuntimeCycleModifierActive,
  isOverlayRuntimeToggleModifierActive,
  LEVEL17_OVERLAY_CYCLE_KEY,
} from '/samples/phase-17/shared/overlayCycleInput.js';

function normalizeRuntimeExtensionEntry(entry) {
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
  const compose = entry.compose === true;
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
    compose,
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

function shouldRunRuntimeExtension(extension, activeOverlayId) {
  if (!extension) {
    return false;
  }
  if (!extension.overlayId) {
    return true;
  }
  return extension.overlayId === activeOverlayId;
}

function normalizeInteractionIndex(runtime) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length === 0) {
    if (runtime) {
      runtime.interactionIndex = 0;
    }
    return 0;
  }

  const count = runtime.runtimeExtensions.length;
  const current = Number.isInteger(runtime.interactionIndex) ? runtime.interactionIndex : 0;
  const normalized = ((current % count) + count) % count;
  runtime.interactionIndex = normalized;
  return normalized;
}

function findRuntimeExtensionIndexByOverlayId(runtime, overlayId) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions)) {
    return -1;
  }
  const requestedOverlayId = String(overlayId || '').trim();
  if (!requestedOverlayId) {
    return -1;
  }
  for (let i = 0; i < runtime.runtimeExtensions.length; i += 1) {
    if (String(runtime.runtimeExtensions[i]?.overlayId || '').trim() === requestedOverlayId) {
      return i;
    }
  }
  return -1;
}

function normalizeSafeZoneEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const x = Number(entry.x);
  const y = Number(entry.y);
  const width = Number(entry.width);
  const height = Number(entry.height);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }
  if (width <= 0 || height <= 0) {
    return null;
  }
  return Object.freeze({
    id: String(entry.id || '').trim(),
    x,
    y,
    width,
    height,
  });
}

function normalizeSafeZones(safeZones) {
  if (!Array.isArray(safeZones) || safeZones.length === 0) {
    return Object.freeze([]);
  }
  const normalized = [];
  for (let i = 0; i < safeZones.length; i += 1) {
    const candidate = normalizeSafeZoneEntry(safeZones[i]);
    if (!candidate) {
      continue;
    }
    normalized.push(candidate);
  }
  return Object.freeze(normalized);
}

function resolveLayoutSafeZones(context = {}) {
  const fromContext = normalizeSafeZones(context?.safeZones);
  if (fromContext.length > 0) {
    return fromContext;
  }
  if (typeof context?.scene?.getOverlayLayoutSafeZones === 'function') {
    return normalizeSafeZones(context.scene.getOverlayLayoutSafeZones());
  }
  return Object.freeze([]);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function resolveOverlayGameplayState(context = {}) {
  if (!context || typeof context !== 'object') {
    return null;
  }

  if (context.gameplayState && typeof context.gameplayState === 'object') {
    return context.gameplayState;
  }

  const scene = context.scene;
  if (!scene || typeof scene !== 'object') {
    return null;
  }

  if (typeof scene.getOverlayGameplayState === 'function') {
    const value = scene.getOverlayGameplayState();
    if (value && typeof value === 'object') {
      return value;
    }
  }

  if (typeof scene.getGameplayState === 'function') {
    const value = scene.getGameplayState();
    if (value && typeof value === 'object') {
      return value;
    }
  }

  if (scene.gameplayState && typeof scene.gameplayState === 'object') {
    return scene.gameplayState;
  }

  if (scene.state && typeof scene.state === 'object') {
    return scene.state;
  }

  return null;
}

function resolveRuntimeExtensionContextBehavior(extension, context = {}) {
  const defaultBehavior = {
    visible: true,
    compose: extension?.compose === true,
    panelWidth: Number(extension?.panelWidth) || 260,
    panelHeight: Number(extension?.panelHeight) || 96,
  };

  if (!extension || typeof extension.resolveContextBehavior !== 'function') {
    return defaultBehavior;
  }

  try {
    const gameplayState = resolveOverlayGameplayState(context);
    const resolved = extension.resolveContextBehavior({
      ...context,
      gameplayState,
    });
    return {
      visible: resolved?.visible !== false,
      compose: resolved?.compose === true || resolved?.compose === false
        ? resolved.compose
        : defaultBehavior.compose,
      panelWidth: Number.isFinite(Number(resolved?.panelWidth))
        ? Number(resolved.panelWidth)
        : defaultBehavior.panelWidth,
      panelHeight: Number.isFinite(Number(resolved?.panelHeight))
        ? Number(resolved.panelHeight)
        : defaultBehavior.panelHeight,
    };
  } catch {
    return defaultBehavior;
  }
}

function resolveOverlayRuntimeSyncStateContainer(context = {}, gameplayState = null) {
  if (context?.overlayRuntimeState && typeof context.overlayRuntimeState === 'object') {
    return context.overlayRuntimeState;
  }
  if (gameplayState?.overlayRuntimeState && typeof gameplayState.overlayRuntimeState === 'object') {
    return gameplayState.overlayRuntimeState;
  }
  if (gameplayState && typeof gameplayState === 'object') {
    try {
      gameplayState.overlayRuntimeState = {};
      if (gameplayState.overlayRuntimeState && typeof gameplayState.overlayRuntimeState === 'object') {
        return gameplayState.overlayRuntimeState;
      }
    } catch {
      // Sync state creation is best effort only.
    }
  }
  return null;
}

function resolveOverlayRuntimeEventQueue(context = {}, gameplayState = null, syncState = null) {
  if (Array.isArray(context?.overlayRuntimeEvents)) {
    return context.overlayRuntimeEvents;
  }
  if (Array.isArray(gameplayState?.overlayRuntimeEvents)) {
    return gameplayState.overlayRuntimeEvents;
  }
  if (Array.isArray(syncState?.events)) {
    return syncState.events;
  }
  return null;
}

export function enqueueOverlayGameplayRuntimeSyncEvent(target, event = {}) {
  if (!target || typeof target !== 'object') {
    return false;
  }
  if (!Array.isArray(target.overlayRuntimeEvents)) {
    target.overlayRuntimeEvents = [];
  }
  if (!Array.isArray(target.overlayRuntimeEvents)) {
    return false;
  }
  target.overlayRuntimeEvents.push({
    type: String(event?.type || 'overlay-runtime-sync').trim() || 'overlay-runtime-sync',
    ...(event || {}),
  });
  return true;
}

function normalizeOverlayRuntimeSyncEvent(event) {
  if (!event || typeof event !== 'object') {
    return null;
  }
  const normalizedType = String(event.type || 'overlay-runtime-sync').trim() || 'overlay-runtime-sync';
  const hasVisible = event.visible === true || event.visible === false;
  const hasInteractionIndex = Number.isFinite(Number(event.interactionIndex));
  const hasActiveOverlayId = String(event.activeOverlayId || '').trim().length > 0;
  if (!hasVisible && !hasInteractionIndex && !hasActiveOverlayId && normalizedType === 'overlay-runtime-sync') {
    return null;
  }
  return {
    type: normalizedType,
    visible: hasVisible ? event.visible : undefined,
    interactionIndex: hasInteractionIndex ? Number(event.interactionIndex) : undefined,
    activeOverlayId: hasActiveOverlayId ? String(event.activeOverlayId || '').trim() : '',
  };
}

function applyOverlayRuntimeSyncPatch(runtime, runtimeExtensions, patch = {}) {
  const count = runtimeExtensions.length;
  let desyncCorrected = false;
  if (patch.visible === true || patch.visible === false) {
    runtime.interactionVisible = patch.visible;
  }

  if (Number.isFinite(patch.interactionIndex) && count > 0) {
    const incomingIndexRaw = Number(patch.interactionIndex);
    const incomingIndex = Math.trunc(incomingIndexRaw);
    if (incomingIndex < 0 || incomingIndex >= count || incomingIndex !== incomingIndexRaw) {
      desyncCorrected = true;
    }
    runtime.interactionIndex = ((incomingIndex % count) + count) % count;
  }

  const requestedOverlayId = String(patch.activeOverlayId || '').trim();
  const resolvedOverlayIndex = findRuntimeExtensionIndexByOverlayId(runtime, requestedOverlayId);
  if (requestedOverlayId) {
    if (resolvedOverlayIndex >= 0) {
      if (runtime.interactionIndex !== resolvedOverlayIndex) {
        runtime.interactionIndex = resolvedOverlayIndex;
      }
    } else {
      desyncCorrected = true;
    }
  }

  if (Number.isFinite(patch.interactionIndex) && requestedOverlayId && resolvedOverlayIndex >= 0 && count > 0) {
    const incomingIndex = ((Math.trunc(Number(patch.interactionIndex)) % count) + count) % count;
    if (incomingIndex !== resolvedOverlayIndex) {
      desyncCorrected = true;
    }
  }

  return desyncCorrected;
}

function writeOverlayRuntimeSyncSnapshot(container, snapshot) {
  if (!container || typeof container !== 'object' || !snapshot || typeof snapshot !== 'object') {
    return false;
  }
  try {
    container.visible = snapshot.visible;
    container.interactionIndex = snapshot.interactionIndex;
    container.activeOverlayId = snapshot.activeOverlayId;
    container.count = snapshot.count;
    container.cycleKey = snapshot.cycleKey;
    container.desyncCorrected = snapshot.desyncCorrected;
    container.eventsProcessed = snapshot.eventsProcessed;
    container.syncMode = snapshot.syncMode;
    return true;
  } catch {
    return false;
  }
}

export function synchronizeOverlayGameplayRuntimeState(runtime, context = {}) {
  if (!runtime) {
    return null;
  }

  const gameplayState = resolveOverlayGameplayState(context);
  const syncState = resolveOverlayRuntimeSyncStateContainer(context, gameplayState);
  const eventQueue = resolveOverlayRuntimeEventQueue(context, gameplayState, syncState);
  const runtimeExtensions = Array.isArray(runtime.runtimeExtensions) ? runtime.runtimeExtensions : [];
  const count = runtimeExtensions.length;
  let desyncCorrected = false;
  let eventsProcessed = 0;

  if (Array.isArray(eventQueue) && eventQueue.length > 0) {
    const pending = eventQueue.splice(0, eventQueue.length);
    for (let i = 0; i < pending.length; i += 1) {
      const event = normalizeOverlayRuntimeSyncEvent(pending[i]);
      if (!event) {
        continue;
      }
      if (event.type !== 'overlay-runtime-sync' && event.type !== 'overlay-state-sync') {
        continue;
      }
      const corrected = applyOverlayRuntimeSyncPatch(runtime, runtimeExtensions, event);
      desyncCorrected = desyncCorrected || corrected;
      eventsProcessed += 1;
    }
  }

  // Compatibility fallback for pre-event producers.
  if (eventsProcessed === 0 && syncState) {
    const corrected = applyOverlayRuntimeSyncPatch(runtime, runtimeExtensions, syncState);
    desyncCorrected = desyncCorrected || corrected;
  }

  const interactionIndex = normalizeInteractionIndex(runtime);
  const active = runtimeExtensions[interactionIndex] || null;
  const snapshot = {
    visible: runtime.interactionVisible !== false,
    interactionIndex,
    activeOverlayId: active?.overlayId || '',
    count,
    cycleKey: String(runtime.interactionCycleKey || LEVEL17_OVERLAY_CYCLE_KEY),
    desyncCorrected,
    eventsProcessed,
    syncMode: eventsProcessed > 0 ? 'events' : 'compat',
  };
  writeOverlayRuntimeSyncSnapshot(syncState, snapshot);
  return snapshot;
}

function getComposedRuntimeFrames(runtime, activeOverlayId, context = {}) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length === 0) {
    return [];
  }

  const normalizedActiveOverlayId = String(activeOverlayId || '').trim();
  const activeIndex = normalizeInteractionIndex(runtime);
  const frames = [];

  for (let i = 0; i < runtime.runtimeExtensions.length; i += 1) {
    const extension = runtime.runtimeExtensions[i];
    const contextBehavior = resolveRuntimeExtensionContextBehavior(extension, context);
    if (contextBehavior.visible === false) {
      continue;
    }
    const isActive = i === activeIndex;
    if (!isActive && contextBehavior.compose !== true) {
      continue;
    }
    if (!shouldRunRuntimeExtension(extension, normalizedActiveOverlayId)) {
      continue;
    }

    frames.push({
      extension,
      registrationIndex: i,
      isActive,
      contextBehavior,
    });
  }

  frames.sort((left, right) => {
    if (left.extension.layerOrder !== right.extension.layerOrder) {
      return left.extension.layerOrder - right.extension.layerOrder;
    }
    return left.registrationIndex - right.registrationIndex;
  });

  return frames;
}

function deriveRenderHierarchy(frames) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return [];
  }

  const ordered = [...frames];
  ordered.sort((left, right) => {
    const leftIsActive = left.isActive === true;
    const rightIsActive = right.isActive === true;
    if (leftIsActive !== rightIsActive) {
      return leftIsActive ? 1 : -1;
    }
    if (left.extension.visualPriority !== right.extension.visualPriority) {
      return left.extension.visualPriority - right.extension.visualPriority;
    }
    if (left.extension.layerOrder !== right.extension.layerOrder) {
      return left.extension.layerOrder - right.extension.layerOrder;
    }
    return left.registrationIndex - right.registrationIndex;
  });

  for (let i = 0; i < ordered.length; i += 1) {
    const frame = ordered[i];
    frame.visualPriorityRank = i;
    frame.visualTier = frame.isActive === true ? 'primary' : 'secondary';
    frame.readabilityOpacity = frame.isActive === true ? 1 : 0.84;
    frame.hiddenByClutter = false;
  }

  return ordered;
}

function resolveMaxVisibleCompositionLayers(renderer) {
  const canvasSize = renderer?.getCanvasSize?.() || { width: 960, height: 540 };
  const height = Math.max(180, Number(canvasSize.height) || 540);
  if (height <= 360) {
    return 2;
  }
  if (height <= 540) {
    return 3;
  }
  return 4;
}

function applyCompositionReadabilityLimits(frames, renderer) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return [];
  }

  const maxVisibleLayers = Math.max(2, resolveMaxVisibleCompositionLayers(renderer));
  for (let i = 0; i < frames.length; i += 1) {
    frames[i].hiddenByClutter = false;
  }
  if (frames.length <= maxVisibleLayers) {
    return frames;
  }

  const activeFrame = frames.find((frame) => frame.isActive === true) || null;
  const selected = [];
  if (activeFrame) {
    const supportFrames = frames.filter((frame) => frame !== activeFrame);
    const supportLimit = Math.max(0, maxVisibleLayers - 1);
    const start = Math.max(0, supportFrames.length - supportLimit);
    for (let i = start; i < supportFrames.length; i += 1) {
      selected.push(supportFrames[i]);
    }
    selected.push(activeFrame);
  } else {
    const start = Math.max(0, frames.length - maxVisibleLayers);
    for (let i = start; i < frames.length; i += 1) {
      selected.push(frames[i]);
    }
  }

  const selectedSet = new Set(selected);
  for (let i = 0; i < frames.length; i += 1) {
    frames[i].hiddenByClutter = !selectedSet.has(frames[i]);
  }
  return frames.filter((frame) => selectedSet.has(frame));
}

function normalizePanelDimension(value, fallback, minimum) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(minimum, fallback);
  }
  return Math.max(minimum, numeric);
}

function resolveDynamicPanelSize(extension, layoutContext, fallbackWidth, fallbackHeight) {
  if (!extension || typeof extension.resolvePanelSize !== 'function') {
    return {
      width: fallbackWidth,
      height: fallbackHeight,
    };
  }

  try {
    const computed = extension.resolvePanelSize(layoutContext || {});
    return {
      width: normalizePanelDimension(computed?.width, fallbackWidth, 120),
      height: normalizePanelDimension(computed?.height, fallbackHeight, 32),
    };
  } catch {
    return {
      width: fallbackWidth,
      height: fallbackHeight,
    };
  }
}

function attachCompositionSlots(frames, renderer, safeZones = [], layoutContext = {}) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return frames || [];
  }

  const canvasSize = renderer?.getCanvasSize?.() || { width: 960, height: 540 };
  const width = Math.max(320, Number(canvasSize.width) || 960);
  const height = Math.max(180, Number(canvasSize.height) || 540);
  const margin = 16;
  const gap = 10;
  const anchorCounts = {
    'bottom-right': 0,
    'top-right': 0,
    'bottom-left': 0,
    'top-left': 0,
  };
  const placedSlots = [];

  function createAnchorSlot(anchor, slotWidth, slotHeight, index = 0) {
    const stackOffset = index * (slotHeight + gap);
    const x = anchor.endsWith('right')
      ? Math.round(width - margin - slotWidth)
      : Math.round(margin);
    const y = anchor.startsWith('bottom')
      ? Math.round(height - margin - slotHeight - stackOffset)
      : Math.round(margin + stackOffset);
    return {
      x,
      y,
      width: slotWidth,
      height: slotHeight,
      anchor,
    };
  }

  function isSlotWithinBounds(slot) {
    if (!slot) {
      return false;
    }
    return !(slot.x < 0 || slot.y < 0 || slot.x + slot.width > width || slot.y + slot.height > height);
  }

  function slotOverlapsPlaced(slot) {
    if (!slot) {
      return false;
    }
    for (let i = 0; i < placedSlots.length; i += 1) {
      if (rectsOverlap(slot, placedSlots[i])) {
        return true;
      }
    }
    return false;
  }

  function slotOverlapsSafeZones(slot) {
    if (!slot) {
      return false;
    }
    for (let i = 0; i < safeZones.length; i += 1) {
      if (rectsOverlap(slot, safeZones[i])) {
        return true;
      }
    }
    return false;
  }

  function isSlotUsable(slot) {
    if (!isSlotWithinBounds(slot)) {
      return false;
    }
    return !slotOverlapsPlaced(slot) && !slotOverlapsSafeZones(slot);
  }

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    const fallbackWidth = Math.max(
      120,
      Number(frame.contextBehavior?.panelWidth) || Number(frame.extension.panelWidth) || 260
    );
    const fallbackHeight = Math.max(
      32,
      Number(frame.contextBehavior?.panelHeight) || Number(frame.extension.panelHeight) || 96
    );
    const dynamicPanelSize = resolveDynamicPanelSize(frame.extension, {
      ...layoutContext,
      renderer,
      canvasSize: { width, height },
      gameplayState: resolveOverlayGameplayState(layoutContext),
      frameIndex: i,
      frameCount: frames.length,
      safeZones,
    }, fallbackWidth, fallbackHeight);
    const maxPanelWidth = Math.max(120, width - margin * 2);
    const maxPanelHeight = Math.max(32, height - margin * 2);
    const slotWidth = Math.min(maxPanelWidth, Math.max(120, Number(dynamicPanelSize.width) || fallbackWidth));
    const slotHeight = Math.min(maxPanelHeight, Math.max(32, Number(dynamicPanelSize.height) || fallbackHeight));
    const anchorOrder = ['bottom-right', 'top-right', 'bottom-left', 'top-left'];

    let slot = null;
    for (let j = 0; j < anchorOrder.length; j += 1) {
      const anchor = anchorOrder[j];
      const startStackIndex = anchorCounts[anchor] || 0;
      const maxStackIndexExclusive = Math.max(
        startStackIndex + 1,
        startStackIndex + frames.length + safeZones.length + 2
      );
      for (let stackIndex = startStackIndex; stackIndex < maxStackIndexExclusive; stackIndex += 1) {
        const candidate = createAnchorSlot(anchor, slotWidth, slotHeight, stackIndex);
        if (!isSlotUsable(candidate)) {
          continue;
        }
        slot = candidate;
        anchorCounts[anchor] = stackIndex + 1;
        break;
      }
      if (slot) {
        break;
      }
    }

    if (!slot) {
      for (let j = 0; j < anchorOrder.length; j += 1) {
        const anchor = anchorOrder[j];
        const startStackIndex = anchorCounts[anchor] || 0;
        const maxStackIndexExclusive = Math.max(
          startStackIndex + 1,
          startStackIndex + frames.length + safeZones.length + 2
        );
        for (let stackIndex = startStackIndex; stackIndex < maxStackIndexExclusive; stackIndex += 1) {
          const candidate = createAnchorSlot(anchor, slotWidth, slotHeight, stackIndex);
          if (!isSlotWithinBounds(candidate) || slotOverlapsPlaced(candidate)) {
            continue;
          }
          slot = candidate;
          anchorCounts[anchor] = stackIndex + 1;
          break;
        }
        if (slot) {
          break;
        }
      }
    }

    if (!slot) {
      const fallbackAnchor = 'bottom-right';
      const fallbackStackIndex = anchorCounts[fallbackAnchor] || 0;
      slot = createAnchorSlot(fallbackAnchor, slotWidth, slotHeight, fallbackStackIndex);
      anchorCounts[fallbackAnchor] = fallbackStackIndex + 1;
    }

    frame.slot = Object.freeze({
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      anchor: slot.anchor,
    });
    placedSlots.push(slot);
  }

  return frames;
}

export function createOverlayGameplayRuntime({ runtimeExtensions = [] } = {}) {
  return {
    runtimeExtensions: normalizeRuntimeExtensions(runtimeExtensions),
    interactionVisible: true,
    interactionIndex: 0,
    interactionCycleLatch: false,
    interactionToggleLatch: false,
    interactionCycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
    interactionActionCooldownSeconds: 0.03,
    interactionCooldownRemainingSeconds: 0,
    interactionMaxHoldSeconds: 1.25,
    interactionExplicitHoldSeconds: 0,
    interactionSuppressUntilRelease: false,
  };
}

export function setOverlayGameplayRuntimeExtensions(runtime, runtimeExtensions) {
  if (!runtime) {
    return false;
  }
  runtime.runtimeExtensions = normalizeRuntimeExtensions(runtimeExtensions);
  normalizeInteractionIndex(runtime);
  return true;
}

export function isOverlayGameplayRuntimeVisible(runtime) {
  return runtime?.interactionVisible !== false;
}

export function setOverlayGameplayRuntimeVisible(runtime, visible) {
  if (!runtime) {
    return false;
  }
  runtime.interactionVisible = visible !== false;
  return true;
}

export function getOverlayGameplayRuntimeInteractionSnapshot(runtime, context = {}) {
  synchronizeOverlayGameplayRuntimeState(runtime, context);
  const extensions = Array.isArray(runtime?.runtimeExtensions) ? runtime.runtimeExtensions : [];
  const index = normalizeInteractionIndex(runtime);
  const active = extensions[index] || null;
  return {
    visible: isOverlayGameplayRuntimeVisible(runtime),
    index,
    count: extensions.length,
    activeOverlayId: active?.overlayId || '',
    cycleKey: String(runtime?.interactionCycleKey || LEVEL17_OVERLAY_CYCLE_KEY),
    suppressUntilRelease: runtime?.interactionSuppressUntilRelease === true,
    cooldownRemainingSeconds: Math.max(0, Number(runtime?.interactionCooldownRemainingSeconds) || 0),
  };
}

export function getOverlayGameplayRuntimeCompositionSnapshot(runtime, context = {}) {
  synchronizeOverlayGameplayRuntimeState(runtime, context);
  const activeOverlayId = String(context?.activeOverlayId || '').trim();
  const safeZones = resolveLayoutSafeZones(context);
  const frames = deriveRenderHierarchy(attachCompositionSlots(
    getComposedRuntimeFrames(runtime, activeOverlayId, context),
    context?.renderer,
    safeZones,
    context
  ));
  const visibleFrames = applyCompositionReadabilityLimits(frames, context?.renderer);
  const visibleSet = new Set(visibleFrames);
  return frames.map((frame, index) => ({
    index,
    count: frames.length,
    visibleCount: visibleFrames.length,
    registrationIndex: frame.registrationIndex,
    layerOrder: frame.extension.layerOrder,
    visualPriority: frame.extension.visualPriority,
    visualPriorityRank: frame.visualPriorityRank,
    visualTier: frame.visualTier,
    readabilityOpacity: frame.readabilityOpacity,
    hiddenByClutter: !visibleSet.has(frame),
    compose: frame.contextBehavior?.compose === true,
    isActive: frame.isActive === true,
    overlayId: frame.extension.overlayId,
    slot: frame.slot,
  }));
}

export function stepOverlayGameplayRuntimeControls(runtime, input, options = {}) {
  if (!runtime) {
    return false;
  }
  synchronizeOverlayGameplayRuntimeState(runtime, options);

  const dtSeconds = Math.max(0, Math.min(0.25, Number(options?.dtSeconds) || 0));
  if (runtime.interactionCooldownRemainingSeconds > 0 && dtSeconds > 0) {
    runtime.interactionCooldownRemainingSeconds = Math.max(
      0,
      runtime.interactionCooldownRemainingSeconds - dtSeconds
    );
  }

  const cycleKey = String(runtime.interactionCycleKey || LEVEL17_OVERLAY_CYCLE_KEY);
  const cyclePressed = input?.isDown(cycleKey) === true;
  const toggleModifierActive = isOverlayRuntimeToggleModifierActive(input);
  const cycleModifierActive = isOverlayRuntimeCycleModifierActive(input);
  const explicitActionPressed = cyclePressed && toggleModifierActive;
  const togglePressed = explicitActionPressed && !cycleModifierActive;
  const runtimeCyclePressed = explicitActionPressed && cycleModifierActive;

  if (!explicitActionPressed) {
    runtime.interactionToggleLatch = false;
    runtime.interactionCycleLatch = false;
    runtime.interactionExplicitHoldSeconds = 0;
    runtime.interactionSuppressUntilRelease = false;
    return false;
  }

  const holdDt = dtSeconds > 0 ? dtSeconds : 0.016;
  runtime.interactionExplicitHoldSeconds += holdDt;
  if (runtime.interactionExplicitHoldSeconds >= runtime.interactionMaxHoldSeconds) {
    runtime.interactionSuppressUntilRelease = true;
  }
  if (runtime.interactionSuppressUntilRelease === true) {
    return false;
  }

  if (runtime.interactionCooldownRemainingSeconds > 0) {
    if (togglePressed) {
      runtime.interactionToggleLatch = true;
    }
    if (runtimeCyclePressed) {
      runtime.interactionCycleLatch = true;
    }
    return false;
  }

  if (togglePressed && runtime.interactionToggleLatch === false) {
    runtime.interactionToggleLatch = true;
    runtime.interactionVisible = runtime.interactionVisible === false;
    runtime.interactionCycleLatch = true;
    runtime.interactionCooldownRemainingSeconds = runtime.interactionActionCooldownSeconds;
    return true;
  }

  if (!runtimeCyclePressed) {
    if (!togglePressed) {
      runtime.interactionCycleLatch = false;
    }
    return false;
  }

  if (runtime.interactionCycleLatch === true) {
    return false;
  }
  runtime.interactionCycleLatch = true;

  if (!Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length <= 1) {
    return false;
  }

  normalizeInteractionIndex(runtime);
  const count = runtime.runtimeExtensions.length;
  runtime.interactionIndex = (runtime.interactionIndex + 1 + count) % count;
  runtime.interactionCooldownRemainingSeconds = runtime.interactionActionCooldownSeconds;
  return true;
}

export function stepOverlayGameplayRuntime(runtime, context = {}) {
  synchronizeOverlayGameplayRuntimeState(runtime, context);
  if (
    !runtime ||
    runtime.interactionVisible === false ||
    !Array.isArray(runtime.runtimeExtensions) ||
    runtime.runtimeExtensions.length === 0
  ) {
    return 0;
  }

  const activeOverlayId = String(context.activeOverlayId || '').trim();
  const frames = getComposedRuntimeFrames(runtime, activeOverlayId, context);
  if (frames.length === 0) {
    return 0;
  }

  let invoked = 0;
  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    if (!frame.extension.onStep) {
      continue;
    }
    try {
      frame.extension.onStep({
        ...context,
        overlayComposition: {
          index: i,
          count: frames.length,
          registrationIndex: frame.registrationIndex,
          layerOrder: frame.extension.layerOrder,
          compose: frame.contextBehavior?.compose === true,
          isActive: frame.isActive === true,
          slot: frame.slot || null,
        },
      });
      invoked += 1;
    } catch {
      // Runtime overlays must never break gameplay execution.
    }
  }
  return invoked;
}

export function renderOverlayGameplayRuntime(runtime, context = {}) {
  synchronizeOverlayGameplayRuntimeState(runtime, context);
  if (
    !runtime ||
    runtime.interactionVisible === false ||
    !Array.isArray(runtime.runtimeExtensions) ||
    runtime.runtimeExtensions.length === 0
  ) {
    return 0;
  }

  const activeOverlayId = String(context.activeOverlayId || '').trim();
  const safeZones = resolveLayoutSafeZones(context);
  const frames = applyCompositionReadabilityLimits(
    deriveRenderHierarchy(
      attachCompositionSlots(
        getComposedRuntimeFrames(runtime, activeOverlayId, context),
        context.renderer,
        safeZones,
        context
      )
    ),
    context.renderer
  );
  if (frames.length === 0) {
    return 0;
  }

  let invoked = 0;
  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    if (!frame.extension.onRender) {
      continue;
    }
    try {
      frame.extension.onRender({
        ...context,
        overlayComposition: {
          index: i,
          count: frames.length,
          registrationIndex: frame.registrationIndex,
          layerOrder: frame.extension.layerOrder,
          visualPriority: frame.extension.visualPriority,
          visualPriorityRank: frame.visualPriorityRank,
          visualTier: frame.visualTier,
          readabilityOpacity: frame.readabilityOpacity,
          hiddenByClutter: frame.hiddenByClutter === true,
          compose: frame.contextBehavior?.compose === true,
          isActive: frame.isActive === true,
          slot: frame.slot,
        },
      });
      invoked += 1;
    } catch {
      // Runtime overlays must never break gameplay rendering.
    }
  }
  return invoked;
}
