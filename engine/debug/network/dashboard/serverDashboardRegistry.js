/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardRegistry.js
*/

import { asArray, asNumber, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

const DEFAULT_SECTIONS = Object.freeze([
  Object.freeze({
    sectionId: "network.dashboard.summary",
    title: "Dashboard Summary",
    priority: 1000,
    enabled: true
  }),
  Object.freeze({
    sectionId: "network.dashboard.connections",
    title: "Connection / Session Overview",
    priority: 1010,
    enabled: true
  }),
  Object.freeze({
    sectionId: "network.dashboard.players",
    title: "Per-Player Status",
    priority: 1020,
    enabled: true
  }),
  Object.freeze({
    sectionId: "network.dashboard.latency",
    title: "Latency View",
    priority: 1030,
    enabled: true
  }),
  Object.freeze({
    sectionId: "network.dashboard.throughput",
    title: "RX / TX Bytes View",
    priority: 1040,
    enabled: true
  }),
  Object.freeze({
    sectionId: "network.dashboard.refresh",
    title: "Refresh Strategy",
    priority: 1050,
    enabled: true
  })
]);

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
  const source = asObject(options);
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

  function getSection(sectionId) {
    const normalizedSectionId = sanitizeText(sectionId);
    if (!normalizedSectionId) {
      return null;
    }
    const section = sectionMap.get(normalizedSectionId);
    return section ? { ...section } : null;
  }

  function updateSection(sectionId, patch = {}) {
    const normalizedSectionId = sanitizeText(sectionId);
    if (!normalizedSectionId || !sectionMap.has(normalizedSectionId)) {
      return null;
    }

    const current = asObject(sectionMap.get(normalizedSectionId));
    const sourcePatch = asObject(patch);
    const next = normalizeSection(
      {
        ...current,
        ...sourcePatch,
        sectionId: normalizedSectionId
      },
      0
    );
    sectionMap.set(normalizedSectionId, next);
    return { ...next };
  }

  function setSectionEnabled(sectionId, enabled) {
    return updateSection(sectionId, { enabled: enabled === true });
  }

  function setSectionPriority(sectionId, priority) {
    return updateSection(sectionId, { priority: asNumber(priority, 0) });
  }

  function getSnapshot() {
    return {
      sections: listSections()
    };
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

  const configuredSections = asArray(source.sections);
  const seedSections = configuredSections.length > 0 ? configuredSections : DEFAULT_SECTIONS;
  seedSections.forEach((section) => {
    registerSection(section);
  });

  return {
    registerSection,
    unregisterSection,
    listSections,
    getSection,
    updateSection,
    setSectionEnabled,
    setSectionPriority,
    getSnapshot,
    hasSection,
    clear
  };
}
