/*
Toolbox Aid
David Quesenberry
04/16/2026
tabDebugOverlayCycle.js
*/
import { isOverlayCycleReverseModifierActive } from '/samples/phase-17/shared/overlayCycleInput.js';

function normalizeOverlayEntry(entry) {
  const id = String(entry?.id ?? '').trim();
  if (!id) {
    return null;
  }
  const label = String(entry?.label ?? id).trim() || id;
  return { id, label };
}

function normalizeActiveIndex(controller) {
  if (!controller || !Array.isArray(controller.overlays) || controller.overlays.length === 0) {
    if (controller) {
      controller.activeIndex = 0;
    }
    return 0;
  }

  const count = controller.overlays.length;
  const current = Number.isInteger(controller.activeIndex) ? controller.activeIndex : 0;
  const normalized = ((current % count) + count) % count;
  controller.activeIndex = normalized;
  return normalized;
}

export function createTabDebugOverlayController({ overlays = [], initialOverlayId = '' } = {}) {
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

  let activeIndex = 0;
  if (initialOverlayId && normalized.length > 0) {
    const lookupIndex = normalized.findIndex((overlay) => overlay.id === initialOverlayId);
    if (lookupIndex >= 0) {
      activeIndex = lookupIndex;
    }
  }

  return {
    overlays: normalized,
    activeIndex: normalized.length > 0 ? Math.max(0, Math.min(activeIndex, normalized.length - 1)) : 0,
    cycleKey: 'Tab',
    cycleLatch: false,
  };
}

export function setTabDebugOverlayMap(controller, { overlays = [], initialOverlayId = '' } = {}) {
  if (!controller) {
    return false;
  }

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

  controller.overlays = normalized;
  controller.activeIndex = 0;
  if (initialOverlayId && normalized.length > 0) {
    const lookupIndex = normalized.findIndex((overlay) => overlay.id === initialOverlayId);
    if (lookupIndex >= 0) {
      controller.activeIndex = lookupIndex;
    }
  }
  normalizeActiveIndex(controller);
  controller.cycleLatch = false;
  return true;
}

export function setTabDebugOverlayCycleKey(controller, cycleKey) {
  if (!controller) {
    return false;
  }
  const normalized = String(cycleKey || '').trim();
  controller.cycleKey = normalized || 'Tab';
  controller.cycleLatch = false;
  return true;
}

export function appendTabDebugOverlay(controller, entry) {
  if (!controller) {
    return false;
  }
  const normalized = normalizeOverlayEntry(entry);
  if (!normalized) {
    return false;
  }
  if (!Array.isArray(controller.overlays)) {
    controller.overlays = [];
  }
  if (controller.overlays.some((overlay) => overlay.id === normalized.id)) {
    return false;
  }
  controller.overlays.push(normalized);
  if (!Number.isInteger(controller.activeIndex) || controller.activeIndex < 0) {
    controller.activeIndex = 0;
  }
  return true;
}

export function setTabDebugOverlayActive(controller, overlayId) {
  if (!controller || !Array.isArray(controller.overlays)) {
    return false;
  }
  const nextIndex = controller.overlays.findIndex((overlay) => overlay.id === overlayId);
  if (nextIndex < 0) {
    return false;
  }
  controller.activeIndex = nextIndex;
  normalizeActiveIndex(controller);
  return true;
}

export function stepTabDebugOverlayController(controller, input) {
  if (!controller || !Array.isArray(controller.overlays)) {
    return;
  }

  const cycleKey = String(controller.cycleKey || 'Tab');
  const cyclePressed = input?.isDown(cycleKey) === true;
  normalizeActiveIndex(controller);
  if (cyclePressed && controller.cycleLatch === false && controller.overlays.length > 1) {
    const delta = isOverlayCycleReverseModifierActive(input) ? -1 : 1;
    const count = controller.overlays.length;
    controller.activeIndex = (controller.activeIndex + delta + count) % count;
  }
  controller.cycleLatch = cyclePressed;
}

export function isTabDebugOverlayActive(controller, overlayId) {
  if (!controller || !Array.isArray(controller.overlays) || controller.overlays.length === 0) {
    return false;
  }
  normalizeActiveIndex(controller);
  const active = controller.overlays[controller.activeIndex];
  return active?.id === overlayId;
}

export function getTabDebugOverlayStatusLabel(controller) {
  if (!controller || !Array.isArray(controller.overlays) || controller.overlays.length === 0) {
    return 'none';
  }
  const index = normalizeActiveIndex(controller);
  const active = controller.overlays[index];
  return `${active.label} (${index + 1}/${controller.overlays.length})`;
}
