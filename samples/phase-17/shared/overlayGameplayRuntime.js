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
  const compose = entry.compose === true;
  const panelWidthRaw = Number(entry.panelWidth);
  const panelHeightRaw = Number(entry.panelHeight);
  const panelWidth = Number.isFinite(panelWidthRaw) && panelWidthRaw > 0 ? panelWidthRaw : 260;
  const panelHeight = Number.isFinite(panelHeightRaw) && panelHeightRaw > 0 ? panelHeightRaw : 96;

  return Object.freeze({
    overlayId,
    onStep,
    onRender,
    compose,
    layerOrder,
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

function getComposedRuntimeFrames(runtime, activeOverlayId) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length === 0) {
    return [];
  }

  const normalizedActiveOverlayId = String(activeOverlayId || '').trim();
  const activeIndex = normalizeInteractionIndex(runtime);
  const frames = [];

  for (let i = 0; i < runtime.runtimeExtensions.length; i += 1) {
    const extension = runtime.runtimeExtensions[i];
    const isActive = i === activeIndex;
    if (!isActive && extension.compose !== true) {
      continue;
    }
    if (!shouldRunRuntimeExtension(extension, normalizedActiveOverlayId)) {
      continue;
    }

    frames.push({
      extension,
      registrationIndex: i,
      isActive,
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

function attachCompositionSlots(frames, renderer) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return frames || [];
  }

  const canvasSize = renderer?.getCanvasSize?.() || { width: 960, height: 540 };
  const width = Math.max(320, Number(canvasSize.width) || 960);
  const height = Math.max(180, Number(canvasSize.height) || 540);
  const margin = 16;
  const gap = 10;
  let cursorY = height - margin;

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    const slotWidth = Math.max(120, Number(frame.extension.panelWidth) || 260);
    const slotHeight = Math.max(32, Number(frame.extension.panelHeight) || 96);
    const slotX = Math.round(width - margin - slotWidth);
    const slotY = Math.round(cursorY - slotHeight);
    frame.slot = Object.freeze({
      x: slotX,
      y: slotY,
      width: slotWidth,
      height: slotHeight,
      anchor: 'bottom-right',
    });
    cursorY = slotY - gap;
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

export function getOverlayGameplayRuntimeInteractionSnapshot(runtime) {
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
  const activeOverlayId = String(context?.activeOverlayId || '').trim();
  const frames = attachCompositionSlots(
    getComposedRuntimeFrames(runtime, activeOverlayId),
    context?.renderer
  );
  return frames.map((frame, index) => ({
    index,
    count: frames.length,
    registrationIndex: frame.registrationIndex,
    layerOrder: frame.extension.layerOrder,
    compose: frame.extension.compose === true,
    isActive: frame.isActive === true,
    overlayId: frame.extension.overlayId,
    slot: frame.slot,
  }));
}

export function stepOverlayGameplayRuntimeControls(runtime, input, options = {}) {
  if (!runtime) {
    return false;
  }

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
  if (
    !runtime ||
    runtime.interactionVisible === false ||
    !Array.isArray(runtime.runtimeExtensions) ||
    runtime.runtimeExtensions.length === 0
  ) {
    return 0;
  }

  const activeOverlayId = String(context.activeOverlayId || '').trim();
  const frames = getComposedRuntimeFrames(runtime, activeOverlayId);
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
          compose: frame.extension.compose === true,
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
  if (
    !runtime ||
    runtime.interactionVisible === false ||
    !Array.isArray(runtime.runtimeExtensions) ||
    runtime.runtimeExtensions.length === 0
  ) {
    return 0;
  }

  const activeOverlayId = String(context.activeOverlayId || '').trim();
  const frames = attachCompositionSlots(
    getComposedRuntimeFrames(runtime, activeOverlayId),
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
          compose: frame.extension.compose === true,
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
