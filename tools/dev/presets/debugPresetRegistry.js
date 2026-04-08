/*
Toolbox Aid
David Quesenberry
04/05/2026
debugPresetRegistry.js
*/

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";

function asStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const unique = new Set();
  value.forEach((item) => {
    const token = sanitizeText(String(item));
    if (token) {
      unique.add(token);
    }
  });
  return Array.from(unique.values());
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function normalizePresetDescriptor(descriptor = {}) {
  const presetId = sanitizeText(descriptor.presetId);
  const title = sanitizeText(descriptor.title) || presetId;
  const panels = isObject(descriptor.panels) ? descriptor.panels : {};

  const enabled = asStringArray(panels.enabled);
  const disabled = asStringArray(panels.disabled).filter((panelId) => !enabled.includes(panelId));
  const order = asStringArray(panels.order);

  return {
    presetId,
    title,
    description: sanitizeText(descriptor.description),
    panels: {
      enabled,
      disabled,
      order
    }
  };
}

function validatePresetDescriptor(descriptor = {}) {
  const presetId = sanitizeText(descriptor.presetId);
  if (!presetId) {
    return "presetId is required.";
  }

  if (!presetId.startsWith("preset.")) {
    return "presetId must start with preset.";
  }

  if (!sanitizeText(descriptor.title)) {
    return "title is required.";
  }

  if (!isObject(descriptor.panels)) {
    return "panels is required.";
  }

  if (!Array.isArray(descriptor.panels.enabled)) {
    return "panels.enabled must be an array.";
  }

  if (!Array.isArray(descriptor.panels.disabled)) {
    return "panels.disabled must be an array.";
  }

  if (descriptor.panels.order !== undefined && !Array.isArray(descriptor.panels.order)) {
    return "panels.order must be an array when provided.";
  }

  return "";
}

export class DebugPresetRegistry {
  constructor() {
    this.presetMap = new Map();
    this.reports = [];
  }

  registerPreset(descriptor, source = "shared") {
    const validationError = validatePresetDescriptor(descriptor);
    if (validationError) {
      const result = {
        status: "rejected",
        code: "INVALID_PRESET_DESCRIPTOR",
        message: validationError,
        details: {
          source: sanitizeText(source) || "shared"
        }
      };
      this.reports.push(result);
      return result;
    }

    const normalized = normalizePresetDescriptor(descriptor);
    if (this.presetMap.has(normalized.presetId)) {
      const result = {
        status: "rejected",
        code: "PRESET_DUPLICATE",
        message: `Preset ${normalized.presetId} is already registered.`,
        details: {
          presetId: normalized.presetId
        }
      };
      this.reports.push(result);
      return result;
    }

    const entry = {
      source: sanitizeText(source) || "shared",
      descriptor: normalized
    };
    this.presetMap.set(normalized.presetId, entry);

    const result = {
      status: "registered",
      code: "PRESET_REGISTERED",
      message: `Registered preset ${normalized.presetId}.`,
      details: {
        presetId: normalized.presetId
      }
    };
    this.reports.push(result);
    return result;
  }

  getPreset(presetId) {
    const key = sanitizeText(presetId);
    const entry = this.presetMap.get(key);
    return entry ? cloneJson(entry.descriptor) : null;
  }

  hasPreset(presetId) {
    const key = sanitizeText(presetId);
    return this.presetMap.has(key);
  }

  listPresets() {
    return Array.from(this.presetMap.values())
      .map((entry) => cloneJson(entry.descriptor))
      .sort((left, right) => left.presetId.localeCompare(right.presetId));
  }

  getCount() {
    return this.presetMap.size;
  }

  getReports() {
    return this.reports.map((report) => cloneJson(report));
  }
}
