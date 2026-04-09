/*
Toolbox Aid
David Quesenberry
04/06/2026
debugInspectorHost.js
*/

import { createDebugInspectorRegistry } from "../registry/debugInspectorRegistry.js";
import {
  asArray,
  asNonNegativeInteger,
  asObject,
  boundedPush,
  cloneJson,
  sanitizeText
} from "/src/engine/debug/inspectors/shared/inspectorUtils.js";
import { asPositiveInteger } from "../../../../shared/utils/numberUtils.js";
import { createComponentInspectorViewModel } from "../viewModels/componentInspectorViewModel.js";
import { createEntityInspectorViewModel } from "../viewModels/entityInspectorViewModel.js";
import { createEventStreamInspectorViewModel } from "../viewModels/eventStreamInspectorViewModel.js";
import { createStateDiffInspectorViewModel } from "../viewModels/stateDiffInspectorViewModel.js";
import { createTimelineInspectorViewModel } from "../viewModels/timelineInspectorViewModel.js";

const DEFAULT_LIMITS = Object.freeze({
  timelineMax: 240,
  eventStreamMax: 300,
  stateDiffLimit: 24,
  entityLinesLimit: 32
});

function normalizeTimelineMarker(input, index, frameIndex, timestamp) {
  const source = asObject(input);
  return {
    markerId: sanitizeText(source.markerId) || sanitizeText(source.id) || `frame-${frameIndex}-${index + 1}`,
    timestamp: Number.isFinite(source.timestamp) ? Number(source.timestamp) : timestamp,
    frameIndex: Number.isFinite(source.frameIndex) ? Math.floor(Number(source.frameIndex)) : frameIndex,
    category: sanitizeText(source.category) || "frame",
    label: sanitizeText(source.label) || `frame ${frameIndex}`
  };
}

function normalizeEvent(input, index, frameIndex, timestamp) {
  const source = asObject(input);
  return {
    eventId: sanitizeText(source.eventId) || sanitizeText(source.id) || `event-${frameIndex}-${index + 1}`,
    timestamp: Number.isFinite(source.timestamp) ? Number(source.timestamp) : timestamp,
    severity: sanitizeText(source.severity) || "info",
    category: sanitizeText(source.category) || "general",
    message: sanitizeText(source.message) || "event"
  };
}

function createFallbackEntities(context) {
  const entities = asObject(context.entities);
  const keys = Object.keys(entities).sort((left, right) => left.localeCompare(right));
  return [
    {
      id: "entity-summary",
      label: "Entity Summary",
      type: "summary",
      componentTypes: keys,
      componentCount: keys.length
    }
  ];
}

function createFallbackComponents(context, entities) {
  const entitySection = asObject(context.entities);
  const sharedRecord = {};
  Object.keys(entitySection)
    .sort((left, right) => left.localeCompare(right))
    .forEach((key) => {
      sharedRecord[key] = entitySection[key];
    });

  const result = {};
  entities.forEach((entity) => {
    const id = sanitizeText(asObject(entity).id);
    if (id) {
      result[id] = cloneJson(sharedRecord);
    }
  });
  return result;
}

export function createDebugInspectorHost(options = {}) {
  const source = asObject(options);
  const registry = source.registry && typeof source.registry.getStatus === "function"
    ? source.registry
    : createDebugInspectorRegistry();
  const limits = {
    timelineMax: asPositiveInteger(source.limits?.timelineMax, DEFAULT_LIMITS.timelineMax),
    eventStreamMax: asPositiveInteger(source.limits?.eventStreamMax, DEFAULT_LIMITS.eventStreamMax),
    stateDiffLimit: asPositiveInteger(source.limits?.stateDiffLimit, DEFAULT_LIMITS.stateDiffLimit),
    entityLinesLimit: asPositiveInteger(source.limits?.entityLinesLimit, DEFAULT_LIMITS.entityLinesLimit)
  };

  let frameIndex = 0;
  let lastUpdatedMs = 0;
  let selectedEntityId = "";
  let previousState = {};
  let currentState = {};
  let entities = [];
  let componentsByEntity = {};
  const timelineBuffer = [];
  const eventStreamBuffer = [];

  function update(context = {}) {
    const sourceContext = asObject(context);
    const inspectors = asObject(sourceContext.inspectors);
    const timestamp = Date.now();

    const entityInput = asArray(inspectors.entities);
    entities = entityInput.length > 0
      ? entityInput.map((entry) => ({ ...asObject(entry) }))
      : createFallbackEntities(sourceContext);

    const componentInput = asObject(inspectors.components);
    componentsByEntity = Object.keys(componentInput).length > 0
      ? cloneJson(componentInput)
      : createFallbackComponents(sourceContext, entities);

    if (!selectedEntityId || !entities.some((entity) => sanitizeText(asObject(entity).id) === selectedEntityId)) {
      selectedEntityId = sanitizeText(asObject(entities[0]).id);
      if (selectedEntityId) {
        registry.focusTarget(selectedEntityId);
      }
    }

    previousState = cloneJson(currentState);
    if (asObject(inspectors.state).current && typeof asObject(inspectors.state).current === "object") {
      currentState = cloneJson(asObject(asObject(inspectors.state).current));
    } else {
      currentState = cloneJson({
        runtime: asObject(sourceContext.runtime),
        render: asObject(sourceContext.render),
        validation: asObject(sourceContext.validation)
      });
    }

    frameIndex += 1;
    const timelineInput = asArray(inspectors.timelineMarkers);
    if (timelineInput.length > 0) {
      timelineInput.forEach((entry, index) => {
        boundedPush(
          timelineBuffer,
          normalizeTimelineMarker(entry, index, frameIndex, timestamp),
          limits.timelineMax
        );
      });
    } else {
      boundedPush(
        timelineBuffer,
        normalizeTimelineMarker({}, 0, frameIndex, timestamp),
        limits.timelineMax
      );
    }

    const eventInput = asArray(inspectors.eventStream);
    if (eventInput.length > 0) {
      eventInput.forEach((entry, index) => {
        boundedPush(
          eventStreamBuffer,
          normalizeEvent(entry, index, frameIndex, timestamp),
          limits.eventStreamMax
        );
      });
    } else {
      asArray(sourceContext.errors).forEach((errorEntry, index) => {
        const errorSource = asObject(errorEntry);
        boundedPush(
          eventStreamBuffer,
          normalizeEvent(
            {
              eventId: `error-${frameIndex}-${index + 1}`,
              timestamp,
              severity: sanitizeText(errorSource.level) || "warning",
              category: sanitizeText(errorSource.stage) || "validation",
              message: sanitizeText(errorSource.message) || "diagnostic event"
            },
            index,
            frameIndex,
            timestamp
          ),
          limits.eventStreamMax
        );
      });
    }

    lastUpdatedMs = timestamp;
    return getSnapshot();
  }

  function focusTarget(targetId) {
    selectedEntityId = sanitizeText(targetId);
    return registry.focusTarget(selectedEntityId);
  }

  function openInspector(inspectorId) {
    return registry.openInspector(inspectorId);
  }

  function closeInspector(inspectorId = "") {
    return registry.closeInspector(inspectorId);
  }

  function getStatus() {
    return {
      ...registry.getStatus(),
      frameIndex,
      selectedEntityId,
      timelineCount: timelineBuffer.length,
      eventCount: eventStreamBuffer.length,
      lastUpdatedMs
    };
  }

  function getSnapshot() {
    const entityModel = createEntityInspectorViewModel({
      entities,
      selectedEntityId,
      limit: limits.entityLinesLimit
    });
    const componentModel = createComponentInspectorViewModel({
      componentsByEntity,
      selectedEntityId
    });
    const stateDiffModel = createStateDiffInspectorViewModel({
      previousState,
      currentState,
      limit: limits.stateDiffLimit
    });
    const timelineModel = createTimelineInspectorViewModel({
      timelineMarkers: timelineBuffer,
      limit: limits.timelineMax
    });
    const eventModel = createEventStreamInspectorViewModel({
      eventStream: eventStreamBuffer,
      limit: limits.eventStreamMax
    });

    return {
      status: getStatus(),
      registry: registry.getSnapshot(),
      models: {
        entity: entityModel,
        component: componentModel,
        stateDiff: stateDiffModel,
        timeline: timelineModel,
        eventStream: eventModel
      },
      selectedEntityId,
      frameIndex,
      counts: {
        entityCount: asArray(entityModel.entities).length,
        timelineCount: asNonNegativeInteger(timelineModel.markerCount, 0),
        eventCount: asNonNegativeInteger(eventModel.totalEvents, 0)
      }
    };
  }

  return {
    update,
    focusTarget,
    openInspector,
    closeInspector,
    getStatus,
    getSnapshot,
    getRegistry() {
      return registry;
    }
  };
}
