/*
Toolbox Aid
David Quesenberry
04/16/2026
tabDebugOverlayCycle.js
*/
import { isOverlayCycleReverseModifierActive } from '/samples/phase-17/shared/overlayCycleInput.js';

const overlayIndexMemoryStore = new Map();
const overlayPersistenceKeys = new Set();

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

function normalizePersistenceKey(persistenceKey) {
  return String(persistenceKey || '').trim();
}

function readPersistedOverlayIndex(persistenceKey) {
  const key = normalizePersistenceKey(persistenceKey);
  if (!key) {
    return null;
  }

  let raw = null;
  if (typeof localStorage !== 'undefined') {
    try {
      raw = localStorage.getItem(key);
    } catch {
      raw = null;
    }
  }

  if (raw === null || raw === undefined) {
    raw = overlayIndexMemoryStore.get(key);
  }

  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
}

function writePersistedOverlayIndex(persistenceKey, index) {
  const key = normalizePersistenceKey(persistenceKey);
  if (!key || !Number.isInteger(index)) {
    return false;
  }

  overlayPersistenceKeys.add(key);
  overlayIndexMemoryStore.set(key, String(index));
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, String(index));
    } catch {
      // Ignore storage write failures and keep in-memory fallback.
    }
  }
  return true;
}

function applyPersistedActiveIndex(controller) {
  const key = normalizePersistenceKey(controller?.persistenceKey);
  if (!key || !controller || !Array.isArray(controller.overlays) || controller.overlays.length === 0) {
    return false;
  }

  const persisted = readPersistedOverlayIndex(key);
  if (!Number.isInteger(persisted)) {
    return false;
  }

  const count = controller.overlays.length;
  controller.activeIndex = ((persisted % count) + count) % count;
  return true;
}

function persistActiveIndex(controller) {
  const key = normalizePersistenceKey(controller?.persistenceKey);
  if (!key) {
    return false;
  }
  const index = normalizeActiveIndex(controller);
  return writePersistedOverlayIndex(key, index);
}

export function getTabDebugOverlayActiveEntry(controller) {
  if (!controller || !Array.isArray(controller.overlays) || controller.overlays.length === 0) {
    return null;
  }
  const index = normalizeActiveIndex(controller);
  return controller.overlays[index] || null;
}

export function getTabDebugOverlayActiveId(controller) {
  return getTabDebugOverlayActiveEntry(controller)?.id || '';
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
    persistenceKey: '',
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
  applyPersistedActiveIndex(controller);
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

export function setTabDebugOverlayPersistenceKey(controller, persistenceKey) {
  if (!controller) {
    return false;
  }

  controller.persistenceKey = normalizePersistenceKey(persistenceKey);
  if (!controller.persistenceKey) {
    return false;
  }

  overlayPersistenceKeys.add(controller.persistenceKey);
  applyPersistedActiveIndex(controller);
  normalizeActiveIndex(controller);
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
  persistActiveIndex(controller);
  return true;
}

export function stepTabDebugOverlayController(controller, input) {
  if (!controller || !Array.isArray(controller.overlays)) {
    return;
  }

  const cycleKey = String(controller.cycleKey || 'Tab');
  const cyclePressed = input?.isDown(cycleKey) === true;
  if (!cyclePressed) {
    controller.cycleLatch = false;
    return;
  }
  if (controller.cycleLatch === true) {
    return;
  }
  controller.cycleLatch = true;

  normalizeActiveIndex(controller);
  if (controller.overlays.length <= 1) {
    return;
  }

  const delta = isOverlayCycleReverseModifierActive(input) ? -1 : 1;
  const count = controller.overlays.length;
  controller.activeIndex = (controller.activeIndex + delta + count) % count;
  persistActiveIndex(controller);
}

export function isTabDebugOverlayActive(controller, overlayId) {
  return getTabDebugOverlayActiveId(controller) === overlayId;
}

export function getTabDebugOverlayStatusLabel(controller) {
  const active = getTabDebugOverlayActiveEntry(controller);
  if (!active || !Array.isArray(controller?.overlays) || controller.overlays.length === 0) {
    return 'none';
  }
  const index = normalizeActiveIndex(controller);
  return `${active.label} (${index + 1}/${controller.overlays.length})`;
}

export function resetTabDebugOverlayPersistenceForTests() {
  for (const key of overlayPersistenceKeys.values()) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage deletion failures in non-browser or restricted contexts.
      }
    }
  }
  overlayPersistenceKeys.clear();
  overlayIndexMemoryStore.clear();
}
