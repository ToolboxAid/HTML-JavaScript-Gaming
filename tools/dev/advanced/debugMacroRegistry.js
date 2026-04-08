/*
Toolbox Aid
David Quesenberry
04/05/2026
debugMacroRegistry.js
*/

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";
import { cloneJson } from "../../../src/shared/utils/jsonUtils.js";

function asStepArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((step) => sanitizeText(step))
    .filter(Boolean);
}

function normalizeMacroDescriptor(descriptor = {}) {
  const macroId = sanitizeText(descriptor.macroId);
  const title = sanitizeText(descriptor.title) || macroId;
  return {
    macroId,
    title,
    description: sanitizeText(descriptor.description),
    steps: asStepArray(descriptor.steps)
  };
}

function validateMacroDescriptor(descriptor = {}) {
  const macroId = sanitizeText(descriptor.macroId);
  if (!macroId) {
    return "macroId is required.";
  }

  if (!macroId.startsWith("macro.")) {
    return "macroId must start with macro.";
  }

  if (!sanitizeText(descriptor.title)) {
    return "title is required.";
  }

  if (!Array.isArray(descriptor.steps) || descriptor.steps.length === 0) {
    return "steps must be a non-empty array.";
  }

  return "";
}

export class DebugMacroRegistry {
  constructor() {
    this.macroMap = new Map();
    this.reports = [];
  }

  registerMacro(descriptor, source = "shared") {
    const validationError = validateMacroDescriptor(descriptor);
    if (validationError) {
      const result = {
        status: "rejected",
        code: "INVALID_MACRO_DESCRIPTOR",
        message: validationError,
        details: {
          source: sanitizeText(source) || "shared"
        }
      };
      this.reports.push(result);
      return result;
    }

    const normalized = normalizeMacroDescriptor(descriptor);
    if (this.macroMap.has(normalized.macroId)) {
      const result = {
        status: "rejected",
        code: "MACRO_DUPLICATE",
        message: `Macro ${normalized.macroId} is already registered.`,
        details: {
          macroId: normalized.macroId
        }
      };
      this.reports.push(result);
      return result;
    }

    const entry = {
      source: sanitizeText(source) || "shared",
      descriptor: normalized
    };

    this.macroMap.set(normalized.macroId, entry);

    const result = {
      status: "registered",
      code: "MACRO_REGISTERED",
      message: `Registered macro ${normalized.macroId}.`,
      details: {
        macroId: normalized.macroId
      }
    };
    this.reports.push(result);
    return result;
  }

  getMacro(macroId) {
    const key = sanitizeText(macroId);
    const entry = this.macroMap.get(key);
    return entry ? cloneJson(entry.descriptor) : null;
  }

  hasMacro(macroId) {
    const key = sanitizeText(macroId);
    return this.macroMap.has(key);
  }

  listMacros() {
    return Array.from(this.macroMap.values())
      .map((entry) => cloneJson(entry.descriptor))
      .sort((left, right) => left.macroId.localeCompare(right.macroId));
  }

  getCount() {
    return this.macroMap.size;
  }

  getReports() {
    return this.reports.map((report) => cloneJson(report));
  }
}
