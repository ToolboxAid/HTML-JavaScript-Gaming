/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardRegistry.js
*/

import { asArray, asNumber, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

function normalizeSection(section, index) {
  const source = asObject(section);
  const sectionId = sanitizeText(source.sectionId) || sanitizeText(source.id) || `network.dashboard.section.${index + 1}`;
  const title = sanitizeText(source.title) || sectionId;

  return {
    sectionId,
    title,
    priority: Math.floor(asNumber(source.priority, 1000 + index)),
    enabled: source.enabled !== false
  };
}

export function createServerDashboardRegistry(options = {}) {
  const sectionMap = new Map();

  function registerSection(section) {
    const normalized = normalizeSection(section, sectionMap.size);
    sectionMap.set(normalized.sectionId, normalized);
    return normalized;
  }

  function unregisterSection(sectionId) {
    const normalizedSectionId = sanitizeText(sectionId);
    if (!normalizedSectionId) {
      return false;
    }
    return sectionMap.delete(normalizedSectionId);
  }

  function listSections() {
    return Array.from(sectionMap.values())
      .slice()
      .sort((left, right) => {
        if (left.priority !== right.priority) {
          return left.priority - right.priority;
        }
        return left.sectionId.localeCompare(right.sectionId);
      })
      .map((section) => ({ ...section }));
  }

  function clear() {
    sectionMap.clear();
  }

  function hasSection(sectionId) {
    const normalizedSectionId = sanitizeText(sectionId);
    if (!normalizedSectionId) {
      return false;
    }
    return sectionMap.has(normalizedSectionId);
  }

  asArray(asObject(options).sections).forEach((section) => {
    registerSection(section);
  });

  return {
    registerSection,
    unregisterSection,
    listSections,
    hasSection,
    clear
  };
}
