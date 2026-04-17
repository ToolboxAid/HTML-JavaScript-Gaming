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
import { cloneJsonData, safeJsonParse, safeJsonStringify } from '/src/shared/io/index.js';
import { asFiniteNumber } from '/src/shared/number/index.js';

const overlayRuntimePreferenceMemoryStore = new Map();
const OVERLAY_RUNTIME_SHARE_PACKAGE_FORMAT = 'overlay-runtime-share-package';
const OVERLAY_RUNTIME_SHARE_PACKAGE_VERSION = 1;
const OVERLAY_RUNTIME_PROFILE_SCHEMA_VERSION = 1;
const OVERLAY_RUNTIME_INVALID_JSON_PARSE = Symbol('overlay-runtime-invalid-json-parse');
const OVERLAY_RUNTIME_DEFAULT_PRESET_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'minimal',
    label: 'Minimal',
    description: 'Hide overlays and keep controls lightweight.',
    profile: Object.freeze({
      visibility: false,
      keybindProfile: Object.freeze({
        id: 'preset-minimal',
        cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
        contextInputMap: null,
      }),
    }),
  }),
  Object.freeze({
    id: 'debug',
    label: 'Debug',
    description: 'Enable baseline debug overlays with default cycle key.',
    profile: Object.freeze({
      visibility: true,
      keybindProfile: Object.freeze({
        id: 'preset-debug',
        cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
      }),
    }),
  }),
  Object.freeze({
    id: 'full-telemetry',
    label: 'Full Telemetry',
    description: 'Enable telemetry-focused overlay controls with top-layer emphasis mapping.',
    profile: Object.freeze({
      visibility: true,
      keybindProfile: Object.freeze({
        id: 'preset-full-telemetry',
        cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
        contextInputMap: Object.freeze({
          byStackPosition: Object.freeze({
            top: Object.freeze({
              'cycle-next': 'cycle-prev',
            }),
          }),
        }),
      }),
    }),
  }),
]);

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

function getOverlayLayoutKey(overlayId, registrationIndex = -1) {
  const normalizedOverlayId = String(overlayId || '').trim();
  if (normalizedOverlayId) {
    return `id:${normalizedOverlayId}`;
  }
  const numericIndex = Number(registrationIndex);
  if (Number.isInteger(numericIndex) && numericIndex >= 0) {
    return `idx:${numericIndex}`;
  }
  return '';
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

function normalizeLayoutOverrideRect(rect) {
  if (!rect || typeof rect !== 'object') {
    return null;
  }
  const x = Number(rect.x);
  const y = Number(rect.y);
  const width = Number(rect.width);
  const height = Number(rect.height);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }
  if (width <= 0 || height <= 0) {
    return null;
  }
  return {
    x,
    y,
    width,
    height,
  };
}

function getOverlayLayoutOverride(runtime, layoutKey) {
  if (!runtime || !layoutKey) {
    return null;
  }
  const overrides = runtime.interactionLayoutOverrides;
  if (!overrides || typeof overrides !== 'object') {
    return null;
  }
  return normalizeLayoutOverrideRect(overrides[layoutKey]);
}

function setOverlayLayoutOverride(runtime, layoutKey, rect) {
  if (!runtime || !layoutKey) {
    return false;
  }
  const normalizedRect = normalizeLayoutOverrideRect(rect);
  if (!normalizedRect) {
    return false;
  }
  if (!runtime.interactionLayoutOverrides || typeof runtime.interactionLayoutOverrides !== 'object') {
    runtime.interactionLayoutOverrides = Object.create(null);
  }
  runtime.interactionLayoutOverrides[layoutKey] = normalizedRect;
  return true;
}

function clearOverlayLayoutOverride(runtime, layoutKey) {
  if (!runtime || !layoutKey || !runtime.interactionLayoutOverrides || typeof runtime.interactionLayoutOverrides !== 'object') {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(runtime.interactionLayoutOverrides, layoutKey)) {
    return false;
  }
  delete runtime.interactionLayoutOverrides[layoutKey];
  return true;
}

function normalizeOverlayRuntimePreferenceStorageKey(preferenceStorageKey) {
  return String(preferenceStorageKey || '').trim();
}

function readOverlayRuntimePreferencePayloadFromStorage(preferenceStorageKey, storage = null) {
  const key = normalizeOverlayRuntimePreferenceStorageKey(preferenceStorageKey);
  if (!key) {
    return null;
  }

  let raw = null;
  const storageReader = storage && typeof storage.getItem === 'function'
    ? storage
    : (typeof localStorage !== 'undefined' ? localStorage : null);
  if (storageReader) {
    try {
      raw = storageReader.getItem(key);
    } catch {
      raw = null;
    }
  }
  if (raw === null || raw === undefined) {
    raw = overlayRuntimePreferenceMemoryStore.get(key) ?? null;
  }
  if (typeof raw !== 'string' || raw.length === 0) {
    return null;
  }

  const parsed = safeJsonParse(raw, null);
  return parsed && typeof parsed === 'object' ? parsed : null;
}

function writeOverlayRuntimePreferencePayloadToStorage(preferenceStorageKey, payload, storage = null) {
  const key = normalizeOverlayRuntimePreferenceStorageKey(preferenceStorageKey);
  if (!key) {
    return false;
  }
  const serialized = safeJsonStringify(payload || {}, '{}');
  overlayRuntimePreferenceMemoryStore.set(key, serialized);

  const storageWriter = storage && typeof storage.setItem === 'function'
    ? storage
    : (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!storageWriter) {
    return true;
  }
  try {
    storageWriter.setItem(key, serialized);
  } catch {
    // Keep in-memory fallback when browser storage is unavailable.
  }
  return true;
}

function validateOverlayRuntimePreferencePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: Object.freeze(['Overlay runtime profile payload must be an object.']),
      value: null,
    };
  }

  const hasVisibility = Object.prototype.hasOwnProperty.call(payload, 'visibility');
  const hasLayout = Object.prototype.hasOwnProperty.call(payload, 'layout');
  const hasKeybindProfile = Object.prototype.hasOwnProperty.call(payload, 'keybindProfile');
  if (!hasVisibility && !hasLayout && !hasKeybindProfile) {
    errors.push('Overlay runtime profile payload must include at least one of visibility, layout, or keybindProfile.');
  }

  const versionRaw = payload.version;
  if (versionRaw !== undefined) {
    const version = Number(versionRaw);
    if (!Number.isInteger(version) || version <= 0) {
      errors.push('Overlay runtime profile version must be a positive integer when provided.');
    }
  }

  let visibility = null;
  if (hasVisibility) {
    if (payload.visibility === true || payload.visibility === false) {
      visibility = payload.visibility;
    } else {
      errors.push('Overlay runtime profile visibility must be a boolean.');
    }
  }

  let layout = null;
  if (hasLayout) {
    if (!payload.layout || typeof payload.layout !== 'object' || Array.isArray(payload.layout)) {
      errors.push('Overlay runtime profile layout must be an object.');
    } else {
      layout = {};
      const entries = Object.entries(payload.layout);
      for (let i = 0; i < entries.length; i += 1) {
        const [layoutKey, layoutRect] = entries[i];
        const normalizedLayoutKey = String(layoutKey || '').trim();
        const normalizedRect = normalizeLayoutOverrideRect(layoutRect);
        if (!normalizedLayoutKey || !normalizedRect) {
          errors.push(`Overlay runtime profile layout entry "${normalizedLayoutKey || '<empty>'}" is invalid.`);
          continue;
        }
        layout[normalizedLayoutKey] = normalizedRect;
      }
    }
  }

  let keybindProfile = null;
  if (hasKeybindProfile) {
    if (!payload.keybindProfile || typeof payload.keybindProfile !== 'object' || Array.isArray(payload.keybindProfile)) {
      errors.push('Overlay runtime profile keybindProfile must be an object.');
    } else {
      keybindProfile = {};
      if (Object.prototype.hasOwnProperty.call(payload.keybindProfile, 'id')) {
        keybindProfile.id = String(payload.keybindProfile.id || '').trim();
      }
      if (Object.prototype.hasOwnProperty.call(payload.keybindProfile, 'cycleKey')) {
        const cycleKey = String(payload.keybindProfile.cycleKey || '').trim();
        if (!cycleKey) {
          errors.push('Overlay runtime profile keybindProfile.cycleKey must be a non-empty string when provided.');
        } else {
          keybindProfile.cycleKey = cycleKey;
        }
      }
      if (Object.prototype.hasOwnProperty.call(payload.keybindProfile, 'contextInputMap')) {
        const contextInputMap = payload.keybindProfile.contextInputMap;
        if (contextInputMap === null) {
          keybindProfile.contextInputMap = null;
          keybindProfile.contextInputMapSpecified = true;
        } else if (contextInputMap && typeof contextInputMap === 'object' && !Array.isArray(contextInputMap)) {
          const clonedContextInputMap = cloneJsonData(contextInputMap);
          if (clonedContextInputMap && typeof clonedContextInputMap === 'object') {
            keybindProfile.contextInputMap = clonedContextInputMap;
            keybindProfile.contextInputMapSpecified = true;
          } else {
            errors.push('Overlay runtime profile keybindProfile.contextInputMap must be JSON-compatible.');
          }
        } else {
          errors.push('Overlay runtime profile keybindProfile.contextInputMap must be an object or null.');
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors: Object.freeze(errors),
      value: null,
    };
  }

  return {
    valid: true,
    errors: Object.freeze([]),
    value: Object.freeze({
      version: Number.isInteger(Number(payload.version)) && Number(payload.version) > 0
        ? Number(payload.version)
        : 1,
      hasVisibility,
      hasLayout,
      hasKeybindProfile,
      visibility,
      layout: layout || {},
      keybindProfile: keybindProfile || {},
    }),
  };
}

function applyOverlayRuntimePreferencePayload(runtime, validatedPayload) {
  if (!runtime || !validatedPayload || typeof validatedPayload !== 'object') {
    return false;
  }
  if (validatedPayload.hasVisibility && (validatedPayload.visibility === true || validatedPayload.visibility === false)) {
    runtime.interactionVisible = validatedPayload.visibility;
  }
  if (validatedPayload.hasLayout) {
    applyOverlayRuntimeLayoutPreferences(runtime, validatedPayload.layout);
  }
  if (validatedPayload.hasKeybindProfile) {
    const keybindProfile = validatedPayload.keybindProfile || {};
    if (Object.prototype.hasOwnProperty.call(keybindProfile, 'id')) {
      runtime.interactionKeybindProfileId = String(keybindProfile.id || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(keybindProfile, 'cycleKey')) {
      runtime.interactionCycleKey = String(keybindProfile.cycleKey || '').trim() || LEVEL17_OVERLAY_CYCLE_KEY;
    }
    if (keybindProfile.contextInputMapSpecified === true) {
      runtime.interactionContextInputMap = keybindProfile.contextInputMap === null
        ? null
        : (cloneJsonData(keybindProfile.contextInputMap) ?? null);
    }
  }
  return true;
}

function createOverlayRuntimePreferencePayloadFromValidated(validatedPayload) {
  if (!validatedPayload || typeof validatedPayload !== 'object') {
    return null;
  }
  const payload = {
    version: Number.isInteger(Number(validatedPayload.version)) && Number(validatedPayload.version) > 0
      ? Number(validatedPayload.version)
      : 1,
  };
  if (validatedPayload.hasVisibility) {
    payload.visibility = validatedPayload.visibility === true;
  }
  if (validatedPayload.hasLayout) {
    payload.layout = cloneJsonData(validatedPayload.layout) || {};
  }
  if (validatedPayload.hasKeybindProfile) {
    const keybindProfile = {};
    if (Object.prototype.hasOwnProperty.call(validatedPayload.keybindProfile, 'id')) {
      keybindProfile.id = String(validatedPayload.keybindProfile.id || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(validatedPayload.keybindProfile, 'cycleKey')) {
      keybindProfile.cycleKey = String(validatedPayload.keybindProfile.cycleKey || '').trim() || LEVEL17_OVERLAY_CYCLE_KEY;
    }
    if (validatedPayload.keybindProfile.contextInputMapSpecified === true) {
      keybindProfile.contextInputMap = validatedPayload.keybindProfile.contextInputMap === null
        ? null
        : (cloneJsonData(validatedPayload.keybindProfile.contextInputMap) || {});
    }
    payload.keybindProfile = keybindProfile;
  }
  return payload;
}

function normalizeOverlayRuntimePresetEntry(preset, index = 0) {
  if (!preset || typeof preset !== 'object' || Array.isArray(preset)) {
    return null;
  }
  const id = String(preset.id || `preset-${index + 1}`).trim();
  if (!id) {
    return null;
  }
  const label = String(preset.label || id).trim() || id;
  const description = String(preset.description || '').trim();
  const profileInput = preset.profile && typeof preset.profile === 'object'
    ? preset.profile
    : (preset.preferences && typeof preset.preferences === 'object' ? preset.preferences : null);
  if (!profileInput) {
    return null;
  }
  const validatedProfile = validateOverlayRuntimePreferencePayload(profileInput);
  if (!validatedProfile.valid || !validatedProfile.value) {
    return null;
  }
  const profilePayload = createOverlayRuntimePreferencePayloadFromValidated(validatedProfile.value);
  if (!profilePayload) {
    return null;
  }
  return Object.freeze({
    id,
    label,
    description,
    profile: Object.freeze(profilePayload),
  });
}

function normalizeOverlayRuntimePresetLibrary(presets) {
  if (!Array.isArray(presets) || presets.length === 0) {
    return Object.freeze([]);
  }
  const normalized = [];
  for (let i = 0; i < presets.length; i += 1) {
    const candidate = normalizeOverlayRuntimePresetEntry(presets[i], i);
    if (!candidate) {
      continue;
    }
    if (normalized.some((entry) => entry.id === candidate.id)) {
      continue;
    }
    normalized.push(candidate);
  }
  return Object.freeze(normalized);
}

const OVERLAY_RUNTIME_DEFAULT_PRESET_LIBRARY = normalizeOverlayRuntimePresetLibrary(OVERLAY_RUNTIME_DEFAULT_PRESET_DEFINITIONS);

function resolveOverlayRuntimePresetFromLibrary(library = [], presetOrId = '') {
  if (typeof presetOrId === 'string') {
    const requestedId = String(presetOrId || '').trim();
    if (!requestedId) {
      return null;
    }
    for (let i = 0; i < library.length; i += 1) {
      if (library[i]?.id === requestedId) {
        return library[i];
      }
    }
    return null;
  }
  return normalizeOverlayRuntimePresetEntry(presetOrId);
}

function validateOverlayRuntimeSharePackagePayload(payload, runtime = null) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: Object.freeze(['Overlay runtime share package must be an object.']),
      value: null,
    };
  }

  const format = String(payload.format || '').trim();
  if (format !== OVERLAY_RUNTIME_SHARE_PACKAGE_FORMAT) {
    errors.push(`Overlay runtime share package format must be "${OVERLAY_RUNTIME_SHARE_PACKAGE_FORMAT}".`);
  }

  const packageVersion = Number(payload.packageVersion);
  if (!Number.isInteger(packageVersion) || packageVersion <= 0) {
    errors.push('Overlay runtime share package version must be a positive integer.');
  } else if (packageVersion > OVERLAY_RUNTIME_SHARE_PACKAGE_VERSION) {
    errors.push(`Overlay runtime share package version ${packageVersion} is not supported by this runtime.`);
  }

  if (payload.compatibility !== undefined) {
    if (!payload.compatibility || typeof payload.compatibility !== 'object' || Array.isArray(payload.compatibility)) {
      errors.push('Overlay runtime share package compatibility must be an object when provided.');
    } else if (payload.compatibility.profileSchemaVersion !== undefined) {
      const profileSchemaVersion = Number(payload.compatibility.profileSchemaVersion);
      if (!Number.isInteger(profileSchemaVersion) || profileSchemaVersion <= 0) {
        errors.push('Overlay runtime share package compatibility.profileSchemaVersion must be a positive integer when provided.');
      } else if (profileSchemaVersion > OVERLAY_RUNTIME_PROFILE_SCHEMA_VERSION) {
        errors.push(
          `Overlay runtime share package profile schema version ${profileSchemaVersion} is not supported by this runtime.`
        );
      }
    }
  }

  const validatedProfile = validateOverlayRuntimePreferencePayload(payload.profile);
  if (!validatedProfile.valid || !validatedProfile.value) {
    for (let i = 0; i < validatedProfile.errors.length; i += 1) {
      errors.push(`Share package profile: ${validatedProfile.errors[i]}`);
    }
  }

  let preset = null;
  if (Object.prototype.hasOwnProperty.call(payload, 'preset')) {
    const normalizedPreset = normalizeOverlayRuntimePresetEntry(payload.preset, 0);
    if (!normalizedPreset) {
      errors.push('Overlay runtime share package preset is invalid.');
    } else {
      preset = normalizedPreset;
    }
  }

  const rawPresetId = String(payload.presetId || '').trim();
  const presetId = rawPresetId || (preset ? preset.id : '');
  if (rawPresetId && preset && preset.id !== rawPresetId) {
    errors.push('Overlay runtime share package presetId does not match included preset id.');
  }
  if (presetId && !preset) {
    const availablePreset = resolveOverlayRuntimePresetFromLibrary(
      getOverlayGameplayRuntimePresetLibrary(runtime, { includeDefaults: true }),
      presetId
    );
    if (!availablePreset) {
      errors.push(`Overlay runtime share package requires preset "${presetId}" which is not available in this runtime.`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors: Object.freeze(errors),
      value: null,
    };
  }

  return {
    valid: true,
    errors: Object.freeze([]),
    value: Object.freeze({
      format,
      packageVersion,
      profile: validatedProfile.value,
      presetId,
      preset,
    }),
  };
}

function buildOverlayRuntimeLayoutPreferenceSnapshot(runtime) {
  const snapshot = {};
  const overrides = runtime?.interactionLayoutOverrides;
  if (!overrides || typeof overrides !== 'object') {
    return snapshot;
  }
  const entries = Object.entries(overrides);
  for (let i = 0; i < entries.length; i += 1) {
    const [layoutKey, layoutRect] = entries[i];
    const normalizedLayoutKey = String(layoutKey || '').trim();
    if (!normalizedLayoutKey) {
      continue;
    }
    const normalizedRect = normalizeLayoutOverrideRect(layoutRect);
    if (!normalizedRect) {
      continue;
    }
    snapshot[normalizedLayoutKey] = normalizedRect;
  }
  return snapshot;
}

function applyOverlayRuntimeLayoutPreferences(runtime, layoutPreferences = {}) {
  if (!runtime || !layoutPreferences || typeof layoutPreferences !== 'object') {
    return false;
  }
  runtime.interactionLayoutOverrides = Object.create(null);
  const entries = Object.entries(layoutPreferences);
  let applied = false;
  for (let i = 0; i < entries.length; i += 1) {
    const [layoutKey, layoutRect] = entries[i];
    const normalizedLayoutKey = String(layoutKey || '').trim();
    const normalizedRect = normalizeLayoutOverrideRect(layoutRect);
    if (!normalizedLayoutKey || !normalizedRect) {
      continue;
    }
    runtime.interactionLayoutOverrides[normalizedLayoutKey] = normalizedRect;
    applied = true;
  }
  return applied;
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

function resolveOverlayTelemetryState(context = {}, gameplayState = null) {
  if (context?.telemetry && typeof context.telemetry === 'object') {
    return context.telemetry;
  }
  if (context?.overlayTelemetry && typeof context.overlayTelemetry === 'object') {
    return context.overlayTelemetry;
  }
  if (gameplayState?.telemetry && typeof gameplayState.telemetry === 'object') {
    return gameplayState.telemetry;
  }
  if (gameplayState?.overlayTelemetry && typeof gameplayState.overlayTelemetry === 'object') {
    return gameplayState.overlayTelemetry;
  }
  if (typeof context?.scene?.getOverlayTelemetryState === 'function') {
    const telemetry = context.scene.getOverlayTelemetryState();
    if (telemetry && typeof telemetry === 'object') {
      return telemetry;
    }
  }
  return null;
}

function normalizeStringList(input) {
  if (Array.isArray(input)) {
    const normalized = [];
    for (let i = 0; i < input.length; i += 1) {
      const value = String(input[i] || '').trim();
      if (!value) {
        continue;
      }
      normalized.push(value);
    }
    return Object.freeze(normalized);
  }
  const single = String(input || '').trim();
  return single ? Object.freeze([single]) : Object.freeze([]);
}

function normalizeNumberList(input) {
  if (Array.isArray(input)) {
    const normalized = [];
    for (let i = 0; i < input.length; i += 1) {
      const value = Number(input[i]);
      if (!Number.isFinite(value)) {
        continue;
      }
      normalized.push(value);
    }
    return Object.freeze(normalized);
  }
  const single = Number(input);
  return Number.isFinite(single) ? Object.freeze([single]) : Object.freeze([]);
}

function normalizeTelemetryConstraint(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Object.freeze({
      min: value,
      max: value,
      equals: null,
    });
  }
  if (!value || typeof value !== 'object') {
    return null;
  }
  const min = Number(value.min);
  const max = Number(value.max);
  const equals = value.equals;
  return Object.freeze({
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
    equals: equals === undefined ? null : equals,
  });
}

function normalizeAdaptiveTelemetryRules(input) {
  if (!input || typeof input !== 'object') {
    return Object.freeze({});
  }
  const normalized = {};
  const entries = Object.entries(input);
  for (let i = 0; i < entries.length; i += 1) {
    const [key, value] = entries[i];
    const telemetryKey = String(key || '').trim();
    if (!telemetryKey) {
      continue;
    }
    const constraint = normalizeTelemetryConstraint(value);
    if (!constraint) {
      continue;
    }
    normalized[telemetryKey] = constraint;
  }
  return Object.freeze(normalized);
}

function normalizeAdaptiveUiRule(rule, index = 0) {
  if (!rule || typeof rule !== 'object') {
    return null;
  }
  const when = rule.when && typeof rule.when === 'object' ? rule.when : {};
  const apply = rule.apply && typeof rule.apply === 'object' ? rule.apply : {};
  const priority = Number(rule.priority);
  const sizeScale = Number(apply.sizeScale);
  const panelWidth = Number(apply.panelWidth ?? apply.width);
  const panelHeight = Number(apply.panelHeight ?? apply.height);
  const emphasis = Number(apply.emphasis);

  return Object.freeze({
    id: String(rule.id || `adaptive-ui-rule-${index + 1}`),
    priority: Number.isFinite(priority) ? priority : 0,
    when: Object.freeze({
      gameplayPhases: normalizeStringList(when.gameplayPhases ?? when.gameplayPhase),
      activeOverlayIds: normalizeStringList(when.activeOverlayIds ?? when.activeOverlayId),
      overlayIds: normalizeStringList(when.overlayIds ?? when.overlayId),
      activeStackPositions: normalizeStringList(when.activeStackPositions ?? when.activeStackPosition),
      stackPositions: normalizeStringList(when.stackPositions ?? when.stackPosition),
      activeLayerOrders: normalizeNumberList(when.activeLayerOrders ?? when.activeLayerOrder),
      layerOrders: normalizeNumberList(when.layerOrders ?? when.layerOrder),
      telemetry: normalizeAdaptiveTelemetryRules(when.telemetry),
    }),
    apply: Object.freeze({
      visible: apply.visible === true ? true : (apply.visible === false ? false : null),
      sizeScale: Number.isFinite(sizeScale) && sizeScale > 0 ? sizeScale : null,
      panelWidth: Number.isFinite(panelWidth) && panelWidth > 0 ? panelWidth : null,
      panelHeight: Number.isFinite(panelHeight) && panelHeight > 0 ? panelHeight : null,
      emphasis: Number.isFinite(emphasis) ? Math.max(0.2, Math.min(2, emphasis)) : null,
    }),
  });
}

function normalizeAdaptiveUiRules(rules) {
  if (!Array.isArray(rules) || rules.length === 0) {
    return Object.freeze([]);
  }
  const normalized = [];
  for (let i = 0; i < rules.length; i += 1) {
    const candidate = normalizeAdaptiveUiRule(rules[i], i);
    if (!candidate) {
      continue;
    }
    normalized.push(candidate);
  }
  normalized.sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return 0;
  });
  return Object.freeze(normalized);
}

function matchAdaptiveStringRule(ruleValues, value) {
  if (!Array.isArray(ruleValues) || ruleValues.length === 0) {
    return true;
  }
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) {
    return false;
  }
  return ruleValues.includes(normalizedValue);
}

function matchAdaptiveNumberRule(ruleValues, value) {
  if (!Array.isArray(ruleValues) || ruleValues.length === 0) {
    return true;
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return false;
  }
  return ruleValues.includes(numericValue);
}

function matchAdaptiveTelemetryRules(ruleTelemetry = {}, telemetry = null) {
  const keys = Object.keys(ruleTelemetry);
  if (keys.length === 0) {
    return true;
  }
  if (!telemetry || typeof telemetry !== 'object') {
    return false;
  }

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const constraint = ruleTelemetry[key];
    const telemetryValue = telemetry[key];
    if (constraint?.equals !== null) {
      if (telemetryValue !== constraint.equals) {
        return false;
      }
      continue;
    }
    const numericTelemetryValue = Number(telemetryValue);
    if (!Number.isFinite(numericTelemetryValue)) {
      return false;
    }
    if (Number.isFinite(constraint?.min) && numericTelemetryValue < constraint.min) {
      return false;
    }
    if (Number.isFinite(constraint?.max) && numericTelemetryValue > constraint.max) {
      return false;
    }
  }
  return true;
}

function resolveOverlayStackPosition(rank, count) {
  if (!Number.isInteger(rank) || rank < 0 || !Number.isInteger(count) || count <= 1) {
    return 'single';
  }
  if (rank <= 0) {
    return 'base';
  }
  if (rank >= count - 1) {
    return 'top';
  }
  return 'middle';
}

function doesAdaptiveUiRuleMatch(rule, frameContext) {
  if (!rule || !frameContext) {
    return false;
  }
  const gameplayPhase = String(
    frameContext?.gameplayState?.phase
    ?? frameContext?.gameplayState?.gameState
    ?? ''
  ).trim();
  if (!matchAdaptiveStringRule(rule.when.gameplayPhases, gameplayPhase)) {
    return false;
  }
  if (!matchAdaptiveStringRule(rule.when.activeOverlayIds, frameContext.activeOverlayId)) {
    return false;
  }
  if (!matchAdaptiveStringRule(rule.when.overlayIds, frameContext.overlayId)) {
    return false;
  }
  if (!matchAdaptiveStringRule(rule.when.activeStackPositions, frameContext.activeStackPosition)) {
    return false;
  }
  if (!matchAdaptiveStringRule(rule.when.stackPositions, frameContext.stackPosition)) {
    return false;
  }
  if (!matchAdaptiveNumberRule(rule.when.activeLayerOrders, frameContext.activeLayerOrder)) {
    return false;
  }
  if (!matchAdaptiveNumberRule(rule.when.layerOrders, frameContext.layerOrder)) {
    return false;
  }
  return matchAdaptiveTelemetryRules(rule.when.telemetry, frameContext.telemetry);
}

function resolveAdaptiveUiContextBehavior(runtime, frameContext, baseBehavior) {
  const rules = Array.isArray(runtime?.interactionAdaptiveUiRules)
    ? runtime.interactionAdaptiveUiRules
    : [];
  const behavior = {
    visible: baseBehavior?.visible !== false,
    compose: baseBehavior?.compose === true,
    panelWidth: Number(baseBehavior?.panelWidth) || 260,
    panelHeight: Number(baseBehavior?.panelHeight) || 96,
    emphasis: Number(baseBehavior?.emphasis) || 1,
  };
  if (rules.length === 0) {
    return behavior;
  }

  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];
    if (!doesAdaptiveUiRuleMatch(rule, frameContext)) {
      continue;
    }
    if (rule.apply.visible === true || rule.apply.visible === false) {
      behavior.visible = rule.apply.visible;
    }
    if (Number.isFinite(rule.apply.sizeScale)) {
      behavior.panelWidth *= rule.apply.sizeScale;
      behavior.panelHeight *= rule.apply.sizeScale;
    }
    if (Number.isFinite(rule.apply.panelWidth)) {
      behavior.panelWidth = rule.apply.panelWidth;
    }
    if (Number.isFinite(rule.apply.panelHeight)) {
      behavior.panelHeight = rule.apply.panelHeight;
    }
    if (Number.isFinite(rule.apply.emphasis)) {
      behavior.emphasis = rule.apply.emphasis;
    }
  }

  behavior.panelWidth = normalizePanelDimension(behavior.panelWidth, 260, 120);
  behavior.panelHeight = normalizePanelDimension(behavior.panelHeight, 96, 32);
  behavior.emphasis = Math.max(0.2, Math.min(2, Number(behavior.emphasis) || 1));
  return behavior;
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

function hasOverlayRuntimeSyncPatch(syncPatch) {
  if (!syncPatch || typeof syncPatch !== 'object') {
    return false;
  }
  if (syncPatch.visible === true || syncPatch.visible === false) {
    return true;
  }
  if (Number.isFinite(Number(syncPatch.interactionIndex))) {
    return true;
  }
  return String(syncPatch.activeOverlayId || '').trim().length > 0;
}

function computeOverlayRuntimeCompatSignature(syncPatch, count) {
  if (!hasOverlayRuntimeSyncPatch(syncPatch)) {
    return '';
  }
  const visibleToken = syncPatch.visible === true ? '1' : (syncPatch.visible === false ? '0' : 'x');
  const hasInteractionIndex = Number.isFinite(Number(syncPatch.interactionIndex));
  const interactionToken = hasInteractionIndex ? String(Math.trunc(Number(syncPatch.interactionIndex))) : 'x';
  const activeOverlayId = String(syncPatch.activeOverlayId || '').trim();
  return `${visibleToken}|${interactionToken}|${activeOverlayId}|${Math.max(0, Number(count) || 0)}`;
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

function consumeOverlayRuntimeSyncEvents(eventQueue = []) {
  if (!Array.isArray(eventQueue) || eventQueue.length === 0) {
    return {
      eventsProcessed: 0,
      patch: {},
    };
  }

  const patch = {};
  let eventsProcessed = 0;
  for (let i = 0; i < eventQueue.length; i += 1) {
    const event = normalizeOverlayRuntimeSyncEvent(eventQueue[i]);
    if (!event) {
      continue;
    }
    if (event.type !== 'overlay-runtime-sync' && event.type !== 'overlay-state-sync') {
      continue;
    }
    eventsProcessed += 1;
    if (event.visible === true || event.visible === false) {
      patch.visible = event.visible;
    }
    if (Number.isFinite(event.interactionIndex)) {
      patch.interactionIndex = event.interactionIndex;
    }
    if (event.activeOverlayId) {
      patch.activeOverlayId = event.activeOverlayId;
    }
  }
  eventQueue.length = 0;

  return {
    eventsProcessed,
    patch,
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
  let syncMode = 'cached';

  if (Array.isArray(eventQueue) && eventQueue.length > 0) {
    const consumedEvents = consumeOverlayRuntimeSyncEvents(eventQueue);
    eventsProcessed = consumedEvents.eventsProcessed;
    if (hasOverlayRuntimeSyncPatch(consumedEvents.patch)) {
      const corrected = applyOverlayRuntimeSyncPatch(runtime, runtimeExtensions, consumedEvents.patch);
      desyncCorrected = desyncCorrected || corrected;
    }
    if (eventsProcessed > 0) {
      syncMode = 'events';
    }
  }

  // Compatibility fallback for pre-event producers with change detection to avoid repeated polling overhead.
  if (eventsProcessed === 0 && syncState) {
    const compatSignature = computeOverlayRuntimeCompatSignature(syncState, count);
    if (compatSignature && runtime.interactionCompatSyncSignature !== compatSignature) {
      const corrected = applyOverlayRuntimeSyncPatch(runtime, runtimeExtensions, syncState);
      desyncCorrected = desyncCorrected || corrected;
      syncMode = 'compat';
      runtime.interactionCompatSyncSignature = compatSignature;
    }
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
    syncMode,
  };
  writeOverlayRuntimeSyncSnapshot(syncState, snapshot);
  runtime.interactionCompatSyncSignature = computeOverlayRuntimeCompatSignature(syncState, count);
  return snapshot;
}

function getComposedRuntimeFrames(runtime, activeOverlayId, context = {}) {
  if (!runtime || !Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length === 0) {
    return [];
  }

  const normalizedActiveOverlayId = String(activeOverlayId || '').trim();
  const activeIndex = normalizeInteractionIndex(runtime);
  const inputContext = resolveOverlayRuntimeInputContext(runtime);
  const stackRankByIndex = new Map();
  for (let i = 0; i < inputContext.stack.length; i += 1) {
    const entry = inputContext.stack[i];
    stackRankByIndex.set(entry.index, i);
  }
  const gameplayState = resolveOverlayGameplayState(context);
  const telemetry = resolveOverlayTelemetryState(context, gameplayState);
  const frames = [];

  for (let i = 0; i < runtime.runtimeExtensions.length; i += 1) {
    const extension = runtime.runtimeExtensions[i];
    const isActive = i === activeIndex;
    if (!shouldRunRuntimeExtension(extension, normalizedActiveOverlayId)) {
      continue;
    }
    const stackRank = stackRankByIndex.get(i);
    const stackPosition = resolveOverlayStackPosition(stackRank, inputContext.stack.length);
    const baseBehavior = resolveRuntimeExtensionContextBehavior(extension, context);
    const contextBehavior = resolveAdaptiveUiContextBehavior(runtime, {
      gameplayState,
      telemetry,
      activeOverlayId: inputContext.activeOverlayId,
      activeLayerOrder: inputContext.activeLayerOrder,
      activeStackPosition: inputContext.activeStackPosition,
      overlayId: String(extension?.overlayId || ''),
      layerOrder: Number(extension?.layerOrder) || 0,
      stackPosition,
    }, baseBehavior);
    if (contextBehavior.visible === false) {
      continue;
    }
    if (!isActive && contextBehavior.compose !== true) {
      continue;
    }

    frames.push({
      extension,
      registrationIndex: i,
      isActive,
      contextBehavior,
      layoutKey: getOverlayLayoutKey(extension.overlayId, i),
      stackPosition,
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
    const emphasis = Math.max(0.2, Math.min(2, Number(frame?.contextBehavior?.emphasis) || 1));
    const baseOpacity = frame.isActive === true ? 1 : 0.84;
    frame.visualPriorityRank = i;
    frame.visualTier = frame.isActive === true ? 'primary' : 'secondary';
    frame.readabilityOpacity = Math.max(0.35, Math.min(1, baseOpacity * emphasis));
    frame.adaptiveEmphasis = emphasis;
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

function attachCompositionSlots(frames, renderer, safeZones = [], layoutContext = {}, runtime = null) {
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

    const layoutKey = String(frame.layoutKey || getOverlayLayoutKey(frame.extension?.overlayId, frame.registrationIndex)).trim();
    const overrideRect = getOverlayLayoutOverride(runtime, layoutKey);
    if (overrideRect) {
      const clampedWidth = Math.max(120, Math.min(maxPanelWidth, overrideRect.width));
      const clampedHeight = Math.max(32, Math.min(maxPanelHeight, overrideRect.height));
      const clampedX = Math.max(0, Math.min(width - clampedWidth, overrideRect.x));
      const clampedY = Math.max(0, Math.min(height - clampedHeight, overrideRect.y));
      const overrideSlot = {
        x: Math.round(clampedX),
        y: Math.round(clampedY),
        width: Math.round(clampedWidth),
        height: Math.round(clampedHeight),
        anchor: 'custom',
      };
      frame.slot = Object.freeze({
        ...overrideSlot,
      });
      placedSlots.push(overrideSlot);
      continue;
    }

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

export function createOverlayGameplayRuntime({
  runtimeExtensions = [],
  preferenceStorageKey = '',
  preferenceStorage = null,
  autoLoadPreferences = true,
  keybindProfileId = '',
  cycleKey = LEVEL17_OVERLAY_CYCLE_KEY,
} = {}) {
  const runtime = {
    runtimeExtensions: normalizeRuntimeExtensions(runtimeExtensions),
    interactionVisible: true,
    interactionIndex: 0,
    interactionCycleLatch: false,
    interactionToggleLatch: false,
    interactionCycleKey: String(cycleKey || LEVEL17_OVERLAY_CYCLE_KEY).trim() || LEVEL17_OVERLAY_CYCLE_KEY,
    interactionActionCooldownSeconds: 0.03,
    interactionCooldownRemainingSeconds: 0,
    interactionMaxHoldSeconds: 1.25,
    interactionExplicitHoldSeconds: 0,
    interactionSuppressUntilRelease: false,
    interactionCompatSyncSignature: '',
    interactionLayoutOverrides: Object.create(null),
    interactionSelectedLayoutKey: '',
    interactionPointerDragState: null,
    interactionPointerLastDown: false,
    interactionGestureState: null,
    interactionGestureLastDown: false,
    interactionContextInputMap: null,
    interactionAdaptiveUiRules: Object.freeze([]),
    interactionPresetLibrary: Object.freeze([]),
    interactionPreferenceStorageKey: normalizeOverlayRuntimePreferenceStorageKey(preferenceStorageKey),
    interactionPreferenceStorage: preferenceStorage && typeof preferenceStorage === 'object'
      ? preferenceStorage
      : null,
    interactionKeybindProfileId: String(keybindProfileId || '').trim(),
  };
  if (autoLoadPreferences !== false && runtime.interactionPreferenceStorageKey) {
    loadOverlayGameplayRuntimePreferences(runtime);
  }
  return runtime;
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
  saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
  return true;
}

export function setOverlayGameplayRuntimePreferenceStorageKey(runtime, preferenceStorageKey, { loadExisting = true } = {}) {
  if (!runtime) {
    return false;
  }
  runtime.interactionPreferenceStorageKey = normalizeOverlayRuntimePreferenceStorageKey(preferenceStorageKey);
  if (runtime.interactionPreferenceStorageKey && loadExisting !== false) {
    loadOverlayGameplayRuntimePreferences(runtime);
  }
  return true;
}

export function getOverlayGameplayRuntimeDefaultPresets() {
  return OVERLAY_RUNTIME_DEFAULT_PRESET_LIBRARY;
}

export function setOverlayGameplayRuntimePresetLibrary(runtime, presets = []) {
  if (!runtime) {
    return false;
  }
  runtime.interactionPresetLibrary = normalizeOverlayRuntimePresetLibrary(presets);
  return true;
}

export function getOverlayGameplayRuntimePresetLibrary(runtime, { includeDefaults = true } = {}) {
  const customLibrary = Array.isArray(runtime?.interactionPresetLibrary)
    ? runtime.interactionPresetLibrary
    : [];
  if (includeDefaults === false) {
    return customLibrary;
  }
  if (customLibrary.length === 0) {
    return OVERLAY_RUNTIME_DEFAULT_PRESET_LIBRARY;
  }
  const combined = [...OVERLAY_RUNTIME_DEFAULT_PRESET_LIBRARY];
  for (let i = 0; i < customLibrary.length; i += 1) {
    const preset = customLibrary[i];
    if (!preset || typeof preset !== 'object') {
      continue;
    }
    const existingIndex = combined.findIndex((entry) => entry.id === preset.id);
    if (existingIndex >= 0) {
      combined[existingIndex] = preset;
      continue;
    }
    combined.push(preset);
  }
  return Object.freeze(combined);
}

export function applyOverlayGameplayRuntimePreset(runtime, presetOrId, options = {}) {
  if (!runtime) {
    return Object.freeze({
      success: false,
      errors: Object.freeze(['Overlay runtime is required for preset application.']),
      presetId: '',
    });
  }

  const presetLibrary = getOverlayGameplayRuntimePresetLibrary(runtime, {
    includeDefaults: options?.includeDefaults !== false,
  });
  const resolvedPreset = resolveOverlayRuntimePresetFromLibrary(presetLibrary, presetOrId);
  if (!resolvedPreset) {
    return Object.freeze({
      success: false,
      errors: Object.freeze(['Requested overlay preset is missing or invalid.']),
      presetId: '',
    });
  }

  const importResult = importOverlayGameplayRuntimeProfile(runtime, resolvedPreset.profile, {
    persist: options?.persist !== false,
  });
  return Object.freeze({
    success: importResult.success === true,
    errors: importResult.errors,
    presetId: resolvedPreset.id,
  });
}

export function setOverlayGameplayRuntimeKeybindProfile(runtime, { id = '', cycleKey = '', contextInputMap = undefined } = {}) {
  if (!runtime) {
    return false;
  }
  runtime.interactionKeybindProfileId = String(id || '').trim();
  const normalizedCycleKey = String(cycleKey || '').trim();
  if (normalizedCycleKey) {
    runtime.interactionCycleKey = normalizedCycleKey;
  }
  if (contextInputMap !== undefined) {
    runtime.interactionContextInputMap = contextInputMap && typeof contextInputMap === 'object'
      ? cloneJsonData(contextInputMap) ?? contextInputMap
      : null;
  }
  saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
  return true;
}

export function getOverlayGameplayRuntimePreferencesSnapshot(runtime) {
  if (!runtime) {
    return Object.freeze({
      visibility: true,
      layout: Object.freeze({}),
      keybindProfile: Object.freeze({
        id: '',
        cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
      }),
    });
  }
  const visibility = runtime.interactionVisible !== false;
  const layout = buildOverlayRuntimeLayoutPreferenceSnapshot(runtime);
  const keybindProfile = {
    id: String(runtime.interactionKeybindProfileId || '').trim(),
    cycleKey: String(runtime.interactionCycleKey || LEVEL17_OVERLAY_CYCLE_KEY).trim() || LEVEL17_OVERLAY_CYCLE_KEY,
  };
  if (runtime.interactionContextInputMap && typeof runtime.interactionContextInputMap === 'object') {
    const clonedContextInputMap = cloneJsonData(runtime.interactionContextInputMap);
    if (clonedContextInputMap && typeof clonedContextInputMap === 'object') {
      keybindProfile.contextInputMap = clonedContextInputMap;
    }
  }
  return Object.freeze({
    visibility,
    layout: Object.freeze(layout),
    keybindProfile: Object.freeze(keybindProfile),
  });
}

export function exportOverlayGameplayRuntimeProfile(runtime, { pretty = false } = {}) {
  const snapshot = getOverlayGameplayRuntimePreferencesSnapshot(runtime);
  const payload = {
    version: OVERLAY_RUNTIME_PROFILE_SCHEMA_VERSION,
    visibility: snapshot.visibility,
    layout: snapshot.layout,
    keybindProfile: snapshot.keybindProfile,
  };
  return JSON.stringify(payload, null, pretty ? 2 : 0);
}

export function exportOverlayGameplayRuntimeSharePackage(runtime, options = {}) {
  const snapshot = getOverlayGameplayRuntimePreferencesSnapshot(runtime);
  const profile = {
    version: OVERLAY_RUNTIME_PROFILE_SCHEMA_VERSION,
    visibility: snapshot.visibility,
    layout: snapshot.layout,
    keybindProfile: snapshot.keybindProfile,
  };

  const sharePackage = {
    format: OVERLAY_RUNTIME_SHARE_PACKAGE_FORMAT,
    packageVersion: OVERLAY_RUNTIME_SHARE_PACKAGE_VERSION,
    compatibility: {
      profileSchemaVersion: OVERLAY_RUNTIME_PROFILE_SCHEMA_VERSION,
    },
    source: String(options?.source || 'overlay-gameplay-runtime').trim() || 'overlay-gameplay-runtime',
    exportedAt: typeof options?.exportedAt === 'string' && options.exportedAt.trim()
      ? options.exportedAt.trim()
      : new Date().toISOString(),
    profile,
  };

  const hasPresetSelection = options?.presetOrId !== undefined && options?.presetOrId !== null && options?.presetOrId !== '';
  if (hasPresetSelection) {
    const presetLibrary = getOverlayGameplayRuntimePresetLibrary(runtime, {
      includeDefaults: options?.includeDefaults !== false,
    });
    const resolvedPreset = resolveOverlayRuntimePresetFromLibrary(presetLibrary, options.presetOrId);
    if (resolvedPreset) {
      sharePackage.presetId = resolvedPreset.id;
      if (options?.includePreset !== false) {
        sharePackage.preset = resolvedPreset;
      }
    }
  }

  return JSON.stringify(sharePackage, null, options?.pretty === true ? 2 : 0);
}

export function saveOverlayGameplayRuntimePreferences(runtime, options = {}) {
  if (!runtime) {
    return false;
  }
  const preferenceStorageKey = normalizeOverlayRuntimePreferenceStorageKey(runtime.interactionPreferenceStorageKey);
  if (!preferenceStorageKey) {
    return false;
  }

  const snapshot = getOverlayGameplayRuntimePreferencesSnapshot(runtime);
  const payload = {
    version: 1,
    visibility: snapshot.visibility,
    layout: snapshot.layout,
    keybindProfile: snapshot.keybindProfile,
  };
  const storage = options?.preferenceStorage && typeof options.preferenceStorage === 'object'
    ? options.preferenceStorage
    : runtime.interactionPreferenceStorage;
  return writeOverlayRuntimePreferencePayloadToStorage(preferenceStorageKey, payload, storage);
}

export function loadOverlayGameplayRuntimePreferences(runtime, options = {}) {
  if (!runtime) {
    return false;
  }
  const preferenceStorageKey = normalizeOverlayRuntimePreferenceStorageKey(runtime.interactionPreferenceStorageKey);
  if (!preferenceStorageKey) {
    return false;
  }
  const storage = options?.preferenceStorage && typeof options.preferenceStorage === 'object'
    ? options.preferenceStorage
    : runtime.interactionPreferenceStorage;
  const payload = readOverlayRuntimePreferencePayloadFromStorage(preferenceStorageKey, storage);
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const validated = validateOverlayRuntimePreferencePayload(payload);
  if (!validated.valid || !validated.value) {
    return false;
  }
  return applyOverlayRuntimePreferencePayload(runtime, validated.value);
}

export function importOverlayGameplayRuntimeProfile(runtime, profileInput, options = {}) {
  if (!runtime) {
    return Object.freeze({
      success: false,
      errors: Object.freeze(['Overlay runtime is required for profile import.']),
    });
  }

  let parsedInput = null;
  if (typeof profileInput === 'string') {
    parsedInput = safeJsonParse(profileInput, OVERLAY_RUNTIME_INVALID_JSON_PARSE);
    if (parsedInput === OVERLAY_RUNTIME_INVALID_JSON_PARSE) {
      return Object.freeze({
        success: false,
        errors: Object.freeze(['Overlay runtime profile JSON is invalid.']),
      });
    }
  } else {
    parsedInput = cloneJsonData(profileInput);
  }

  const validated = validateOverlayRuntimePreferencePayload(parsedInput);
  if (!validated.valid || !validated.value) {
    return Object.freeze({
      success: false,
      errors: validated.errors,
    });
  }

  applyOverlayRuntimePreferencePayload(runtime, validated.value);
  if (options?.persist !== false) {
    saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
  }
  return Object.freeze({
    success: true,
    errors: Object.freeze([]),
  });
}

export function importOverlayGameplayRuntimeSharePackage(runtime, sharePackageInput, options = {}) {
  if (!runtime) {
    return Object.freeze({
      success: false,
      errors: Object.freeze(['Overlay runtime is required for share package import.']),
      presetId: '',
      presetRegistered: false,
    });
  }

  let parsedInput = null;
  if (typeof sharePackageInput === 'string') {
    parsedInput = safeJsonParse(sharePackageInput, OVERLAY_RUNTIME_INVALID_JSON_PARSE);
    if (parsedInput === OVERLAY_RUNTIME_INVALID_JSON_PARSE) {
      return Object.freeze({
        success: false,
        errors: Object.freeze(['Overlay runtime share package JSON is invalid.']),
        presetId: '',
        presetRegistered: false,
      });
    }
  } else {
    parsedInput = cloneJsonData(sharePackageInput);
  }

  const validated = validateOverlayRuntimeSharePackagePayload(parsedInput, runtime);
  if (!validated.valid || !validated.value) {
    return Object.freeze({
      success: false,
      errors: validated.errors,
      presetId: '',
      presetRegistered: false,
    });
  }

  let presetRegistered = false;
  if (validated.value.preset && options?.registerPreset !== false) {
    const customLibrary = getOverlayGameplayRuntimePresetLibrary(runtime, { includeDefaults: false });
    setOverlayGameplayRuntimePresetLibrary(runtime, [...customLibrary, validated.value.preset]);
    presetRegistered = true;
  }

  const profilePayload = createOverlayRuntimePreferencePayloadFromValidated(validated.value.profile);
  const importResult = importOverlayGameplayRuntimeProfile(runtime, profilePayload, {
    persist: options?.persist !== false,
  });
  if (importResult.success !== true) {
    return Object.freeze({
      success: false,
      errors: importResult.errors,
      presetId: validated.value.presetId,
      presetRegistered,
    });
  }

  return Object.freeze({
    success: true,
    errors: Object.freeze([]),
    presetId: validated.value.presetId,
    presetRegistered,
  });
}

export function setOverlayGameplayRuntimeContextInputMap(runtime, contextInputMap) {
  if (!runtime) {
    return false;
  }
  runtime.interactionContextInputMap = contextInputMap && typeof contextInputMap === 'object'
    ? contextInputMap
    : null;
  saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
  return true;
}

export function setOverlayGameplayRuntimeAdaptiveUiRules(runtime, rules) {
  if (!runtime) {
    return false;
  }
  runtime.interactionAdaptiveUiRules = normalizeAdaptiveUiRules(rules);
  return true;
}

function normalizeOverlayRuntimeInputAction(action) {
  const token = String(action || '').trim().toLowerCase();
  if (!token || token === 'none' || token === 'noop') {
    return '';
  }
  if (
    token === 'toggle-visibility' ||
    token === 'toggle_visibility' ||
    token === 'toggle' ||
    token === 'toggle-overlay'
  ) {
    return 'toggle-visibility';
  }
  if (
    token === 'cycle-next' ||
    token === 'cycle_next' ||
    token === 'next' ||
    token === 'cycle'
  ) {
    return 'cycle-next';
  }
  if (
    token === 'cycle-prev' ||
    token === 'cycle_previous' ||
    token === 'cycle-prevous' ||
    token === 'prev' ||
    token === 'previous'
  ) {
    return 'cycle-prev';
  }
  return '';
}

function resolveOverlayRuntimeInputContext(runtime) {
  const runtimeExtensions = Array.isArray(runtime?.runtimeExtensions) ? runtime.runtimeExtensions : [];
  const activeIndex = normalizeInteractionIndex(runtime);
  const activeExtension = runtimeExtensions[activeIndex] || null;
  const stack = runtimeExtensions.map((extension, index) => ({
    index,
    overlayId: String(extension?.overlayId || ''),
    layerOrder: Number(extension?.layerOrder) || 0,
    visualPriority: Number(extension?.visualPriority) || 0,
    isActive: index === activeIndex,
  }));
  stack.sort((left, right) => {
    if (left.layerOrder !== right.layerOrder) {
      return left.layerOrder - right.layerOrder;
    }
    if (left.visualPriority !== right.visualPriority) {
      return left.visualPriority - right.visualPriority;
    }
    return left.index - right.index;
  });
  let activeStackPosition = 'single';
  if (stack.length > 1) {
    const activeStackRank = stack.findIndex((entry) => entry.isActive === true);
    if (activeStackRank <= 0) {
      activeStackPosition = 'base';
    } else if (activeStackRank >= stack.length - 1) {
      activeStackPosition = 'top';
    } else {
      activeStackPosition = 'middle';
    }
  }

  return {
    activeIndex,
    activeOverlayId: String(activeExtension?.overlayId || ''),
    activeLayerOrder: Number(activeExtension?.layerOrder) || 0,
    activeVisualPriority: Number(activeExtension?.visualPriority) || 0,
    activeStackPosition,
    stack,
  };
}

function resolveMappedOverlayRuntimeInputAction(contextInputMap, requestedAction, context) {
  if (!contextInputMap || typeof contextInputMap !== 'object') {
    return '';
  }

  const readActionFromMap = (mapSection, key) => {
    if (!mapSection || typeof mapSection !== 'object') {
      return '';
    }
    if (!Object.prototype.hasOwnProperty.call(mapSection, key)) {
      return '';
    }
    const candidate = mapSection[key];
    if (!candidate || typeof candidate !== 'object') {
      return '';
    }
    return normalizeOverlayRuntimeInputAction(candidate[requestedAction]);
  };

  const byOverlayId = readActionFromMap(contextInputMap.byOverlayId, context.activeOverlayId);
  if (byOverlayId) {
    return byOverlayId;
  }

  const byLayerOrder = readActionFromMap(contextInputMap.byLayerOrder, String(context.activeLayerOrder));
  if (byLayerOrder) {
    return byLayerOrder;
  }

  const byStackPosition = readActionFromMap(contextInputMap.byStackPosition, String(context.activeStackPosition));
  if (byStackPosition) {
    return byStackPosition;
  }

  const defaultMap = contextInputMap.default && typeof contextInputMap.default === 'object'
    ? contextInputMap.default
    : null;
  if (!defaultMap) {
    return '';
  }
  return normalizeOverlayRuntimeInputAction(defaultMap[requestedAction]);
}

export function resolveOverlayGameplayRuntimeInputAction(runtime, requestedAction, options = {}) {
  const normalizedRequestedAction = normalizeOverlayRuntimeInputAction(requestedAction);
  const context = resolveOverlayRuntimeInputContext(runtime);
  const contextInputMap = options?.contextInputMap && typeof options.contextInputMap === 'object'
    ? options.contextInputMap
    : runtime?.interactionContextInputMap;
  const mappedAction = resolveMappedOverlayRuntimeInputAction(contextInputMap, normalizedRequestedAction, context);
  return {
    requestedAction: normalizedRequestedAction,
    action: mappedAction || normalizedRequestedAction,
    context,
  };
}

function applyOverlayRuntimeInputAction(runtime, requestedAction, options = {}) {
  if (!runtime) {
    return {
      changed: false,
      requestedAction: '',
      action: '',
      context: resolveOverlayRuntimeInputContext(runtime),
    };
  }

  const resolution = resolveOverlayGameplayRuntimeInputAction(runtime, requestedAction, options);
  const action = resolution.action;
  if (!action) {
    return {
      ...resolution,
      changed: false,
    };
  }

  if (action === 'toggle-visibility') {
    runtime.interactionVisible = runtime.interactionVisible === false;
    saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
    return {
      ...resolution,
      changed: true,
    };
  }
  if (action === 'cycle-next' || action === 'cycle-prev') {
    if (!Array.isArray(runtime.runtimeExtensions) || runtime.runtimeExtensions.length <= 1) {
      return {
        ...resolution,
        changed: false,
      };
    }
    normalizeInteractionIndex(runtime);
    const count = runtime.runtimeExtensions.length;
    const delta = action === 'cycle-prev' ? -1 : 1;
    runtime.interactionIndex = (runtime.interactionIndex + delta + count) % count;
    saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
    return {
      ...resolution,
      changed: true,
    };
  }
  return {
    ...resolution,
    changed: false,
  };
}

export function getOverlayGameplayRuntimeInteractionSnapshot(runtime, context = {}) {
  synchronizeOverlayGameplayRuntimeState(runtime, context);
  const extensions = Array.isArray(runtime?.runtimeExtensions) ? runtime.runtimeExtensions : [];
  const index = normalizeInteractionIndex(runtime);
  const active = extensions[index] || null;
  const inputContext = resolveOverlayRuntimeInputContext(runtime);
  return {
    visible: isOverlayGameplayRuntimeVisible(runtime),
    index,
    count: extensions.length,
    activeOverlayId: active?.overlayId || '',
    activeLayerOrder: inputContext.activeLayerOrder,
    activeStackPosition: inputContext.activeStackPosition,
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
    context,
    runtime
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
    stackPosition: frame.stackPosition || 'single',
    adaptiveEmphasis: Number(frame.adaptiveEmphasis) || 1,
    slot: frame.slot,
    layoutKey: frame.layoutKey,
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
    runtime.interactionCycleLatch = true;
    const actionResult = applyOverlayRuntimeInputAction(runtime, 'toggle-visibility', options);
    if (!actionResult.changed) {
      return false;
    }
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

  const actionResult = applyOverlayRuntimeInputAction(runtime, 'cycle-next', options);
  if (!actionResult.changed) {
    return false;
  }
  runtime.interactionCooldownRemainingSeconds = runtime.interactionActionCooldownSeconds;
  return true;
}

function normalizePointerState(pointerState = {}, runtime = null) {
  const down = pointerState?.down === true;
  const previousDown = runtime?.interactionPointerLastDown === true;
  const pressed = pointerState?.pressed === true || (down && !previousDown);
  const released = pointerState?.released === true || (!down && previousDown);
  const x = asFiniteNumber(pointerState?.x, -1);
  const y = asFiniteNumber(pointerState?.y, -1);
  const modifiers = pointerState?.modifiers && typeof pointerState.modifiers === 'object'
    ? pointerState.modifiers
    : {};
  return {
    x,
    y,
    down,
    pressed,
    released,
    modifiers: {
      shift: modifiers.shift === true,
      alt: modifiers.alt === true,
      ctrl: modifiers.ctrl === true,
      meta: modifiers.meta === true,
    },
  };
}

function isPointInsideRect(x, y, rect) {
  if (!rect) {
    return false;
  }
  return x >= rect.x && y >= rect.y && x <= rect.x + rect.width && y <= rect.y + rect.height;
}

function resolveTopMostInteractiveFrame(frames, x, y) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return null;
  }
  for (let i = frames.length - 1; i >= 0; i -= 1) {
    const frame = frames[i];
    if (frame?.hiddenByClutter === true) {
      continue;
    }
    if (!isPointInsideRect(x, y, frame?.slot)) {
      continue;
    }
    return frame;
  }
  return null;
}

function clampOverlayLayoutRect(rect, canvasWidth, canvasHeight, minPanelWidth, minPanelHeight) {
  const width = Math.max(minPanelWidth, Math.min(canvasWidth, asFiniteNumber(rect?.width, minPanelWidth)));
  const height = Math.max(minPanelHeight, Math.min(canvasHeight, asFiniteNumber(rect?.height, minPanelHeight)));
  const x = Math.max(0, Math.min(canvasWidth - width, asFiniteNumber(rect?.x, 0)));
  const y = Math.max(0, Math.min(canvasHeight - height, asFiniteNumber(rect?.y, 0)));
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

function normalizeGesturePointerState(pointerState = {}, runtime = null) {
  const down = pointerState?.down === true;
  const previousDown = runtime?.interactionGestureLastDown === true;
  const pressed = pointerState?.pressed === true || (down && !previousDown);
  const released = pointerState?.released === true || (!down && previousDown);
  const x = asFiniteNumber(pointerState?.x, -1);
  const y = asFiniteNumber(pointerState?.y, -1);
  const modifiers = pointerState?.modifiers && typeof pointerState.modifiers === 'object'
    ? pointerState.modifiers
    : {};
  return {
    x,
    y,
    down,
    pressed,
    released,
    modifiers: {
      shift: modifiers.shift === true,
      alt: modifiers.alt === true,
      ctrl: modifiers.ctrl === true,
      meta: modifiers.meta === true,
    },
  };
}

function resolveSwipeDirection(dx, dy) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX >= absY) {
    return dx >= 0 ? 'right' : 'left';
  }
  return dy >= 0 ? 'down' : 'up';
}

function mapGestureToOverlayAction(gesture, direction = '') {
  if (gesture === 'hold') {
    return 'toggle-visibility';
  }
  if (gesture === 'swipe') {
    if (direction === 'left' || direction === 'up') {
      return 'cycle-prev';
    }
    return 'cycle-next';
  }
  if (gesture === 'tap') {
    return 'cycle-next';
  }
  return '';
}

export function stepOverlayGameplayRuntimeGestures(runtime, pointerState = {}, options = {}) {
  if (!runtime) {
    return {
      gesture: '',
      action: '',
      direction: '',
      consumed: false,
      changed: false,
    };
  }

  const pointer = normalizeGesturePointerState(pointerState, runtime);
  runtime.interactionGestureLastDown = pointer.down;
  const result = {
    gesture: '',
    action: '',
    direction: '',
    consumed: false,
    changed: false,
  };

  if (options?.enableGestures !== true) {
    if (!pointer.down) {
      runtime.interactionGestureState = null;
    }
    return result;
  }

  const requireModifier = options?.requireModifier !== false;
  const modifierActive = requireModifier
    ? (pointer.modifiers.alt === true && pointer.modifiers.shift === true)
    : true;
  const hasActiveGesture = runtime.interactionGestureState && typeof runtime.interactionGestureState === 'object';
  if (!modifierActive && !hasActiveGesture) {
    if (!pointer.down) {
      runtime.interactionGestureState = null;
    }
    return result;
  }

  const tapMaxSeconds = Math.max(0.05, Number(options?.tapMaxSeconds) || 0.25);
  const tapMaxDistance = Math.max(4, Number(options?.tapMaxDistance) || 18);
  const holdMinSeconds = Math.max(0.1, Number(options?.holdMinSeconds) || 0.3);
  const holdMoveTolerance = Math.max(4, Number(options?.holdMoveTolerance) || 14);
  const swipeMinDistance = Math.max(16, Number(options?.swipeMinDistance) || 48);
  const dtSeconds = Math.max(0, Math.min(0.25, Number(options?.dtSeconds) || 0.016));

  if (pointer.pressed) {
    runtime.interactionGestureState = {
      startX: pointer.x,
      startY: pointer.y,
      lastX: pointer.x,
      lastY: pointer.y,
      elapsedSeconds: 0,
      maxDistance: 0,
      holdTriggered: false,
    };
  }

  const gestureState = runtime.interactionGestureState;
  if (gestureState && pointer.down) {
    const dx = pointer.x - asFiniteNumber(gestureState.startX, pointer.x);
    const dy = pointer.y - asFiniteNumber(gestureState.startY, pointer.y);
    const distance = Math.sqrt((dx * dx) + (dy * dy));
    gestureState.lastX = pointer.x;
    gestureState.lastY = pointer.y;
    gestureState.elapsedSeconds = Math.max(0, Number(gestureState.elapsedSeconds) || 0) + dtSeconds;
    gestureState.maxDistance = Math.max(Number(gestureState.maxDistance) || 0, distance);

    if (!gestureState.holdTriggered && gestureState.elapsedSeconds >= holdMinSeconds && gestureState.maxDistance <= holdMoveTolerance) {
      const actionResult = applyOverlayRuntimeInputAction(runtime, mapGestureToOverlayAction('hold'), options);
      gestureState.holdTriggered = true;
      result.gesture = 'hold';
      result.action = actionResult.action;
      result.consumed = true;
      result.changed = actionResult.changed;
      return result;
    }
  }

  if (gestureState && pointer.released) {
    const dx = pointer.x - asFiniteNumber(gestureState.startX, pointer.x);
    const dy = pointer.y - asFiniteNumber(gestureState.startY, pointer.y);
    const distance = Math.sqrt((dx * dx) + (dy * dy));
    const elapsedSeconds = Math.max(0, Number(gestureState.elapsedSeconds) || 0);

    runtime.interactionGestureState = null;
    if (gestureState.holdTriggered) {
      const holdResult = resolveOverlayGameplayRuntimeInputAction(runtime, mapGestureToOverlayAction('hold'), options);
      result.gesture = 'hold';
      result.action = holdResult.action;
      result.consumed = true;
      result.changed = false;
      return result;
    }

    if (distance <= tapMaxDistance && elapsedSeconds <= tapMaxSeconds) {
      const actionResult = applyOverlayRuntimeInputAction(runtime, mapGestureToOverlayAction('tap'), options);
      result.gesture = 'tap';
      result.action = actionResult.action;
      result.consumed = true;
      result.changed = actionResult.changed;
      return result;
    }

    if (distance >= swipeMinDistance) {
      const direction = resolveSwipeDirection(dx, dy);
      const actionResult = applyOverlayRuntimeInputAction(runtime, mapGestureToOverlayAction('swipe', direction), options);
      result.gesture = 'swipe';
      result.action = actionResult.action;
      result.direction = direction;
      result.consumed = true;
      result.changed = actionResult.changed;
      return result;
    }
  }

  if (!pointer.down && !pointer.released) {
    runtime.interactionGestureState = null;
  }

  return result;
}

export function stepOverlayGameplayRuntimePointerInteractions(runtime, pointerState = {}, options = {}) {
  if (!runtime) {
    return {
      changed: false,
      consumed: false,
      selectedLayoutKey: '',
      activeMode: '',
    };
  }

  const normalizedPointer = normalizePointerState(pointerState, runtime);
  runtime.interactionPointerLastDown = normalizedPointer.down;
  const result = {
    changed: false,
    consumed: false,
    selectedLayoutKey: String(runtime.interactionSelectedLayoutKey || ''),
    activeMode: String(runtime?.interactionPointerDragState?.mode || ''),
  };

  if (options?.enablePointerInteractions !== true || runtime.interactionVisible === false) {
    if (normalizedPointer.released || normalizedPointer.down === false) {
      runtime.interactionPointerDragState = null;
    }
    return result;
  }

  const requireModifier = options?.requireModifier !== false;
  const modifierActive = requireModifier
    ? (normalizedPointer.modifiers.alt === true && normalizedPointer.modifiers.shift === true)
    : true;
  const hasActiveDragState = runtime?.interactionPointerDragState && typeof runtime.interactionPointerDragState === 'object';
  if (!modifierActive && !hasActiveDragState) {
    return result;
  }

  const context = {
    ...(options?.context || {}),
    renderer: options?.renderer || options?.context?.renderer,
    activeOverlayId: String(options?.activeOverlayId || options?.context?.activeOverlayId || ''),
  };
  const canvasSize = context.renderer?.getCanvasSize?.() || { width: 960, height: 540 };
  const canvasWidth = Math.max(320, asFiniteNumber(canvasSize.width, 960));
  const canvasHeight = Math.max(180, asFiniteNumber(canvasSize.height, 540));
  const minPanelWidth = Math.max(120, Number(options?.minPanelWidth) || 120);
  const minPanelHeight = Math.max(32, Number(options?.minPanelHeight) || 32);
  const resizeHandleSize = Math.max(8, Number(options?.resizeHandleSize) || 14);

  const frames = getOverlayGameplayRuntimeCompositionSnapshot(runtime, context).filter((frame) => frame?.slot);
  const activeDragState = runtime.interactionPointerDragState || null;

  if (normalizedPointer.pressed) {
    const selectedFrame = resolveTopMostInteractiveFrame(frames, normalizedPointer.x, normalizedPointer.y);
    if (selectedFrame && selectedFrame.slot) {
      const layoutKey = String(selectedFrame.layoutKey || '').trim();
      if (layoutKey) {
        const slot = selectedFrame.slot;
        const onResizeHandle = normalizedPointer.x >= slot.x + slot.width - resizeHandleSize
          && normalizedPointer.y >= slot.y + slot.height - resizeHandleSize;
        runtime.interactionSelectedLayoutKey = layoutKey;
        runtime.interactionPointerDragState = {
          layoutKey,
          mode: onResizeHandle ? 'resize' : 'drag',
          pointerStartX: normalizedPointer.x,
          pointerStartY: normalizedPointer.y,
          originRect: {
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
          },
        };
        result.selectedLayoutKey = layoutKey;
        result.activeMode = runtime.interactionPointerDragState.mode;
        result.consumed = true;
        return result;
      }
    }
  }

  if (activeDragState && normalizedPointer.down) {
    const dx = normalizedPointer.x - asFiniteNumber(activeDragState.pointerStartX, normalizedPointer.x);
    const dy = normalizedPointer.y - asFiniteNumber(activeDragState.pointerStartY, normalizedPointer.y);
    const originRect = normalizeLayoutOverrideRect(activeDragState.originRect) || {
      x: 0,
      y: 0,
      width: minPanelWidth,
      height: minPanelHeight,
    };
    let candidate = originRect;
    if (activeDragState.mode === 'resize') {
      candidate = {
        ...originRect,
        width: originRect.width + dx,
        height: originRect.height + dy,
      };
    } else {
      candidate = {
        ...originRect,
        x: originRect.x + dx,
        y: originRect.y + dy,
      };
    }
    const clamped = clampOverlayLayoutRect(candidate, canvasWidth, canvasHeight, minPanelWidth, minPanelHeight);
    const changed = setOverlayLayoutOverride(runtime, String(activeDragState.layoutKey || ''), clamped);
    if (changed) {
      saveOverlayGameplayRuntimePreferences(runtime, { silent: true });
      result.changed = true;
    }
    result.consumed = true;
    result.selectedLayoutKey = String(activeDragState.layoutKey || '');
    result.activeMode = String(activeDragState.mode || '');
  }

  if (activeDragState && normalizedPointer.released) {
    runtime.interactionPointerDragState = null;
    result.activeMode = '';
    result.consumed = true;
    result.selectedLayoutKey = String(runtime.interactionSelectedLayoutKey || '');
  }

  return result;
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
        context,
        runtime
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
