/*
Toolbox Aid
David Quesenberry
04/05/2026
inspectorStore.js
*/

const DEFAULT_LIMITS = Object.freeze({
  frameBufferMax: 180,
  timelineMax: 240,
  eventStreamMax: 300
});

import { asArray, asObject, sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";
import { isObject } from "../../../src/shared/utils/objectUtils.js";

function asFinite(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function asPositiveInt(value, fallback) {
  const normalized = Number.isFinite(value) ? Math.floor(Number(value)) : fallback;
  return normalized > 0 ? normalized : fallback;
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function boundedPush(buffer, item, max) {
  buffer.push(item);
  if (buffer.length > max) {
    buffer.splice(0, buffer.length - max);
  }
}

function safeId(value, prefix, index) {
  const id = sanitizeText(value);
  return id || `${prefix}-${index + 1}`;
}

function normalizeEntity(raw, index) {
  const source = asObject(raw);
  const componentTypes = asArray(source.componentTypes)
    .map((item) => sanitizeText(item))
    .filter(Boolean);

  return {
    id: safeId(source.id, "entity", index),
    label: sanitizeText(source.label) || safeId(source.id, "entity", index),
    type: sanitizeText(source.type) || "unknown",
    componentTypes,
    componentCount: componentTypes.length
  };
}

function normalizeComponentMap(raw) {
  const source = asObject(raw);
  const result = {};
  Object.keys(source)
    .sort((left, right) => left.localeCompare(right))
    .forEach((entityId) => {
      const key = sanitizeText(entityId);
      if (!key) {
        return;
      }
      const componentRecord = asObject(source[entityId]);
      const normalizedRecord = {};
      Object.keys(componentRecord)
        .sort((left, right) => left.localeCompare(right))
        .forEach((componentType) => {
          const typeKey = sanitizeText(componentType);
          if (!typeKey) {
            return;
          }
          normalizedRecord[typeKey] = cloneJson(componentRecord[componentType]);
        });
      result[key] = normalizedRecord;
    });
  return result;
}

function normalizeTimelineEvent(raw, index, fallbackNow) {
  const source = asObject(raw);
  const timestamp = asFinite(source.timestamp, fallbackNow);
  const markerId = safeId(source.markerId || source.id, "marker", index);
  return {
    markerId,
    timestamp,
    frameIndex: asFinite(source.frameIndex, -1),
    category: sanitizeText(source.category) || "general",
    label: sanitizeText(source.label) || markerId
  };
}

function normalizeStreamEvent(raw, index, fallbackNow) {
  const source = asObject(raw);
  const timestamp = asFinite(source.timestamp, fallbackNow);
  const eventId = safeId(source.eventId || source.id, "event", index);
  return {
    eventId,
    timestamp,
    severity: sanitizeText(source.severity) || "info",
    category: sanitizeText(source.category) || "general",
    message: sanitizeText(source.message) || eventId
  };
}

function createSyntheticEntitySnapshot(diagnosticsSnapshot) {
  const entities = asObject(diagnosticsSnapshot?.entities);
  const entityKeys = Object.keys(entities).sort((left, right) => left.localeCompare(right));
  return [
    {
      id: "entity-summary",
      label: "Entity Summary",
      type: "summary",
      componentTypes: entityKeys,
      componentCount: entityKeys.length
    }
  ];
}

function createSyntheticComponents(entitiesSnapshot, diagnosticsSnapshot) {
  const entities = asObject(diagnosticsSnapshot?.entities);
  const byEntity = {};
  entitiesSnapshot.forEach((entity) => {
    if (!entity || !entity.id) {
      return;
    }
    const record = {};
    Object.keys(entities)
      .sort((left, right) => left.localeCompare(right))
      .forEach((key) => {
        record[key] = entities[key];
      });
    byEntity[entity.id] = record;
  });
  return byEntity;
}

export function createInspectorStore(options = {}) {
  const limits = {
    frameBufferMax: asPositiveInt(options?.limits?.frameBufferMax, DEFAULT_LIMITS.frameBufferMax),
    timelineMax: asPositiveInt(options?.limits?.timelineMax, DEFAULT_LIMITS.timelineMax),
    eventStreamMax: asPositiveInt(options?.limits?.eventStreamMax, DEFAULT_LIMITS.eventStreamMax)
  };

  const frameBuffer = [];
  const timelineMarkers = [];
  const eventStream = [];

  let frameCounter = 0;
  let selectedEntityId = "";
  let entitiesSnapshot = [];
  let componentsByEntity = {};
  let previousState = {};
  let currentState = {};

  function getStateSection(diagnosticsContext, diagnosticsSnapshot) {
    const inspectors = asObject(diagnosticsContext?.inspectors);
    const stateSection = asObject(inspectors.state);
    if (isObject(stateSection.current)) {
      return cloneJson(stateSection.current);
    }

    return {
      runtime: asObject(diagnosticsSnapshot?.runtime),
      render: asObject(diagnosticsSnapshot?.render),
      validation: asObject(diagnosticsSnapshot?.validation)
    };
  }

  function buildDiffSummary(limit = 24) {
    const maxLines = asPositiveInt(limit, 24);
    const keys = new Set([
      ...Object.keys(previousState),
      ...Object.keys(currentState)
    ]);

    const orderedKeys = Array.from(keys.values()).sort((left, right) => left.localeCompare(right));
    const changes = [];

    orderedKeys.forEach((key) => {
      const before = previousState[key];
      const after = currentState[key];
      const hasBefore = Object.prototype.hasOwnProperty.call(previousState, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(currentState, key);

      if (!hasBefore && hasAfter) {
        changes.push({ kind: "added", key, before: undefined, after });
        return;
      }
      if (hasBefore && !hasAfter) {
        changes.push({ kind: "removed", key, before, after: undefined });
        return;
      }

      const beforeText = JSON.stringify(before);
      const afterText = JSON.stringify(after);
      if (beforeText !== afterText) {
        changes.push({ kind: "changed", key, before, after });
      }
    });

    const truncated = Math.max(0, changes.length - maxLines);
    return {
      totalChanges: changes.length,
      truncated,
      changes: changes.slice(0, maxLines)
    };
  }

  function update(input = {}) {
    const diagnosticsSnapshot = asObject(input.diagnosticsSnapshot);
    const diagnosticsContext = asObject(input.diagnosticsContext);
    const inspectors = asObject(diagnosticsContext.inspectors);
    const now = asFinite(input.timestamp, Date.now());

    const entitiesInput = asArray(inspectors.entities);
    entitiesSnapshot = entitiesInput.length > 0
      ? entitiesInput.map((entity, index) => normalizeEntity(entity, index))
      : createSyntheticEntitySnapshot(diagnosticsSnapshot);

    const componentInput = normalizeComponentMap(inspectors.components);
    componentsByEntity = Object.keys(componentInput).length > 0
      ? componentInput
      : createSyntheticComponents(entitiesSnapshot, diagnosticsSnapshot);

    if (!selectedEntityId || !entitiesSnapshot.some((entry) => entry.id === selectedEntityId)) {
      selectedEntityId = entitiesSnapshot[0]?.id || "";
    }

    previousState = cloneJson(currentState);
    currentState = getStateSection(diagnosticsContext, diagnosticsSnapshot);

    const markerInput = asArray(inspectors.timelineMarkers);
    if (markerInput.length > 0) {
      markerInput.forEach((marker, index) => {
        boundedPush(timelineMarkers, normalizeTimelineEvent(marker, index, now), limits.timelineMax);
      });
    } else {
      boundedPush(timelineMarkers, {
        markerId: `frame-${frameCounter + 1}`,
        timestamp: now,
        frameIndex: frameCounter,
        category: "frame",
        label: `frame ${frameCounter + 1}`
      }, limits.timelineMax);
    }

    const streamInput = asArray(inspectors.eventStream);
    if (streamInput.length > 0) {
      streamInput.forEach((eventRecord, index) => {
        boundedPush(eventStream, normalizeStreamEvent(eventRecord, index, now), limits.eventStreamMax);
      });
    } else {
      const validationErrors = asArray(diagnosticsSnapshot?.errors);
      validationErrors.forEach((record, index) => {
        boundedPush(eventStream, normalizeStreamEvent({
          eventId: `diag-${frameCounter + 1}-${index + 1}`,
          timestamp: now,
          severity: sanitizeText(record?.level) || "warning",
          category: sanitizeText(record?.stage) || "diagnostics",
          message: sanitizeText(record?.message) || "diagnostic event"
        }, index, now), limits.eventStreamMax);
      });
    }

    frameCounter += 1;
    boundedPush(frameBuffer, {
      frameIndex: frameCounter,
      timestamp: now,
      entityCount: entitiesSnapshot.length,
      timelineCount: timelineMarkers.length,
      eventCount: eventStream.length
    }, limits.frameBufferMax);
  }

  function setSelectedEntityId(entityId) {
    const target = sanitizeText(entityId);
    if (!target) {
      return {
        status: "failed",
        code: "INSPECTOR_ENTITY_ID_REQUIRED"
      };
    }

    const exists = entitiesSnapshot.some((entry) => entry.id === target);
    if (!exists) {
      return {
        status: "failed",
        code: "INSPECTOR_ENTITY_NOT_FOUND",
        details: {
          entityId: target
        }
      };
    }

    selectedEntityId = target;
    return {
      status: "ready",
      code: "INSPECTOR_ENTITY_SELECTED",
      details: {
        entityId: target
      }
    };
  }

  function getSnapshot() {
    return {
      selectedEntityId,
      entities: cloneJson(entitiesSnapshot),
      componentsByEntity: cloneJson(componentsByEntity),
      state: {
        previous: cloneJson(previousState),
        current: cloneJson(currentState)
      },
      timelineMarkers: cloneJson(timelineMarkers),
      eventStream: cloneJson(eventStream),
      frameBuffer: cloneJson(frameBuffer),
      limits: cloneJson(limits)
    };
  }

  return {
    update,
    getSnapshot,
    setSelectedEntityId,
    buildDiffSummary
  };
}
