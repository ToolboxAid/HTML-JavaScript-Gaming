/*
Toolbox Aid
David Quesenberry
04/05/2026
debugPanelGroupRegistry.js
*/

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";
import { asStringArray } from "../../../src/shared/utils/arrayUtils.js";
import { cloneJson } from "../../../src/shared/utils/jsonUtils.js";

function normalizeGroupDescriptor(descriptor = {}) {
  const groupId = sanitizeText(descriptor.groupId);
  const title = sanitizeText(descriptor.title) || groupId;
  return {
    groupId,
    title,
    description: sanitizeText(descriptor.description),
    panelIds: asStringArray(descriptor.panelIds)
  };
}

function validateGroupDescriptor(descriptor = {}) {
  const groupId = sanitizeText(descriptor.groupId);
  if (!groupId) {
    return "groupId is required.";
  }

  if (!groupId.startsWith("group.")) {
    return "groupId must start with group.";
  }

  if (!sanitizeText(descriptor.title)) {
    return "title is required.";
  }

  if (!Array.isArray(descriptor.panelIds)) {
    return "panelIds must be an array.";
  }

  return "";
}

export class DebugPanelGroupRegistry {
  constructor() {
    this.groupMap = new Map();
    this.reports = [];
  }

  registerGroup(descriptor, source = "shared") {
    const validationError = validateGroupDescriptor(descriptor);
    if (validationError) {
      const result = {
        status: "rejected",
        code: "INVALID_GROUP_DESCRIPTOR",
        message: validationError,
        details: {
          source: sanitizeText(source) || "shared"
        }
      };
      this.reports.push(result);
      return result;
    }

    const normalized = normalizeGroupDescriptor(descriptor);
    if (this.groupMap.has(normalized.groupId)) {
      const result = {
        status: "rejected",
        code: "GROUP_DUPLICATE",
        message: `Group ${normalized.groupId} is already registered.`,
        details: {
          groupId: normalized.groupId
        }
      };
      this.reports.push(result);
      return result;
    }

    const entry = {
      source: sanitizeText(source) || "shared",
      descriptor: normalized
    };

    this.groupMap.set(normalized.groupId, entry);

    const result = {
      status: "registered",
      code: "GROUP_REGISTERED",
      message: `Registered group ${normalized.groupId}.`,
      details: {
        groupId: normalized.groupId
      }
    };
    this.reports.push(result);
    return result;
  }

  getGroup(groupId) {
    const key = sanitizeText(groupId);
    const entry = this.groupMap.get(key);
    return entry ? cloneJson(entry.descriptor) : null;
  }

  hasGroup(groupId) {
    const key = sanitizeText(groupId);
    return this.groupMap.has(key);
  }

  listGroups() {
    return Array.from(this.groupMap.values())
      .map((entry) => cloneJson(entry.descriptor))
      .sort((left, right) => left.groupId.localeCompare(right.groupId));
  }

  getCount() {
    return this.groupMap.size;
  }

  getReports() {
    return this.reports.map((report) => cloneJson(report));
  }
}

