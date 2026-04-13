/*
Toolbox Aid
David Quesenberry
04/06/2026
debugInspectorRegistry.js
*/

import {
  asArray,
  asObject,
  asPositiveInteger,
  sanitizeText
} from "/src/engine/debug/inspectors/shared/inspectorUtils.js";

const DEFAULT_INSPECTORS = Object.freeze([
  Object.freeze({
    inspectorId: "inspector.entity",
    title: "Entity Inspector",
    priority: 1000,
    enabled: false,
    supportsFocus: true
  }),
  Object.freeze({
    inspectorId: "inspector.component",
    title: "Component Inspector",
    priority: 1010,
    enabled: false,
    supportsFocus: true
  }),
  Object.freeze({
    inspectorId: "inspector.stateDiff",
    title: "State Diff Viewer",
    priority: 1020,
    enabled: false,
    supportsFocus: false
  }),
  Object.freeze({
    inspectorId: "inspector.timeline",
    title: "Timeline Inspector",
    priority: 1030,
    enabled: false,
    supportsFocus: false
  }),
  Object.freeze({
    inspectorId: "inspector.eventStream",
    title: "Event Stream Inspector",
    priority: 1040,
    enabled: false,
    supportsFocus: false
  })
]);

function normalizeInspectorDefinition(input, index) {
  const source = asObject(input);
  const inspectorId = sanitizeText(source.inspectorId) || sanitizeText(source.id) || `inspector.custom.${index + 1}`;
  return {
    inspectorId,
    title: sanitizeText(source.title) || inspectorId,
    description: sanitizeText(source.description) || "",
    enabled: source.enabled === true,
    readOnly: source.readOnly !== false,
    supportsFocus: source.supportsFocus === true,
    priority: asPositiveInteger(source.priority, 1000 + index)
  };
}

function toInspectorList(map) {
  return Array.from(map.values())
    .slice()
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }
      return left.inspectorId.localeCompare(right.inspectorId);
    })
    .map((entry) => ({ ...entry }));
}

export function createDebugInspectorRegistry(options = {}) {
  const source = asObject(options);
  const inspectorMap = new Map();
  let openInspectorId = "";
  let focusedTargetId = "";

  function registerInspector(definition) {
    const normalized = normalizeInspectorDefinition(definition, inspectorMap.size);
    inspectorMap.set(normalized.inspectorId, normalized);
    return { ...normalized };
  }

  function unregisterInspector(inspectorId) {
    const id = sanitizeText(inspectorId);
    if (!id) {
      return false;
    }

    if (openInspectorId === id) {
      openInspectorId = "";
    }
    return inspectorMap.delete(id);
  }

  function listInspectors() {
    return toInspectorList(inspectorMap);
  }

  function hasInspector(inspectorId) {
    const id = sanitizeText(inspectorId);
    return id ? inspectorMap.has(id) : false;
  }

  function getInspector(inspectorId) {
    const id = sanitizeText(inspectorId);
    if (!id || !inspectorMap.has(id)) {
      return null;
    }
    return { ...asObject(inspectorMap.get(id)) };
  }

  function setInspectorEnabled(inspectorId, enabled) {
    const id = sanitizeText(inspectorId);
    if (!id || !inspectorMap.has(id)) {
      return null;
    }

    const current = asObject(inspectorMap.get(id));
    const next = {
      ...current,
      enabled: enabled === true
    };
    inspectorMap.set(id, next);
    if (openInspectorId === id && next.enabled !== true) {
      openInspectorId = "";
    }
    return { ...next };
  }

  function openInspector(inspectorId) {
    const id = sanitizeText(inspectorId);
    if (!id || !inspectorMap.has(id)) {
      return {
        status: "failed",
        code: "INSPECTOR_NOT_FOUND",
        details: {
          inspectorId: id
        }
      };
    }
    const inspector = asObject(inspectorMap.get(id));
    if (inspector.enabled !== true) {
      setInspectorEnabled(id, true);
    }
    openInspectorId = id;
    return {
      status: "ready",
      code: "INSPECTOR_OPENED",
      details: {
        inspectorId: id
      }
    };
  }

  function closeInspector(inspectorId = "") {
    const requestedId = sanitizeText(inspectorId);
    const targetId = requestedId || openInspectorId;
    if (!targetId) {
      return {
        status: "ready",
        code: "INSPECTOR_ALREADY_CLOSED",
        details: {
          inspectorId: ""
        }
      };
    }

    openInspectorId = "";
    return {
      status: "ready",
      code: "INSPECTOR_CLOSED",
      details: {
        inspectorId: targetId
      }
    };
  }

  function focusTarget(targetId) {
    focusedTargetId = sanitizeText(targetId);
    return {
      status: "ready",
      code: "INSPECTOR_TARGET_FOCUSED",
      details: {
        targetId: focusedTargetId || "none"
      }
    };
  }

  function getStatus() {
    const inspectors = listInspectors();
    return {
      inspectorCount: inspectors.length,
      enabledCount: inspectors.filter((entry) => entry.enabled === true).length,
      openInspectorId,
      focusedTargetId
    };
  }

  function getSnapshot() {
    return {
      inspectors: listInspectors(),
      ...getStatus()
    };
  }

  const configuredInspectors = asArray(source.inspectors);
  const initialInspectors = configuredInspectors.length > 0 ? configuredInspectors : DEFAULT_INSPECTORS;
  initialInspectors.forEach((definition) => {
    registerInspector(definition);
  });

  return {
    registerInspector,
    unregisterInspector,
    listInspectors,
    hasInspector,
    getInspector,
    setInspectorEnabled,
    openInspector,
    closeInspector,
    focusTarget,
    getStatus,
    getSnapshot
  };
}
