/*
Toolbox Aid
David Quesenberry
04/05/2026
inspectorCommandPack.js
*/

import {
  requireAtLeastArgs,
  requireNoArgs,
  safeArray,
  safeSection,
  standardDetails,
  toLinePair
} from "./packUtils.js";
import { stringifyValue } from "../../../src/shared/utils/stringifyValueUtils.js";

import { sanitizeText } from "../../../src/shared/utils/stringUtils.js";

function asPositiveInt(value, fallback) {
  const normalized = Number.isFinite(value) ? Math.floor(Number(value)) : fallback;
  return normalized > 0 ? normalized : fallback;
}

function getInspectorsSnapshot(context) {
  return safeSection(context, "inspectors");
}

function getInspectorStore(context) {
  return context?.inspectorStore && typeof context.inspectorStore.getSnapshot === "function"
    ? context.inspectorStore
    : null;
}

function findEntity(inspectors, entityId) {
  const id = sanitizeText(entityId);
  const entities = safeArray(inspectors.entities);
  if (!id) {
    return entities.find((entry) => entry.id === inspectors.selectedEntityId) || entities[0] || null;
  }
  return entities.find((entry) => entry.id === id) || null;
}

function formatTime(timestamp) {
  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : "n/a";
}

export function createInspectorCommandPack() {
  return {
    packId: "inspector",
    label: "Inspector",
    description: "Read-only inspector surfaces for entity, component, state, timeline, and events.",
    commands: [
      {
        name: "inspector.help",
        summary: "Show inspector command usage.",
        usage: "inspector.help",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler() {
          return {
            title: "Inspector Help",
            lines: [
              "inspector.help",
              "inspector.entity.list [query]",
              "inspector.entity.select <entityId>",
              "inspector.component.list [entityId]",
              "inspector.component.preview <entityId> <componentType>",
              "inspector.state.diff [limit]",
              "inspector.timeline.list [limit]",
              "inspector.events.list [limit] [severity] [category]",
              "inspector.status"
            ],
            code: "INSPECTOR_HELP"
          };
        }
      },
      {
        name: "inspector.entity.list",
        summary: "List read-only entity summaries.",
        usage: "inspector.entity.list [query]",
        handler(context, args) {
          const inspectors = getInspectorsSnapshot(context);
          const query = sanitizeText(args?.[0]).toLowerCase();
          const entities = safeArray(inspectors.entities)
            .filter((entity) => {
              if (!query) {
                return true;
              }
              return String(entity.id).toLowerCase().includes(query)
                || String(entity.label).toLowerCase().includes(query)
                || String(entity.type).toLowerCase().includes(query);
            })
            .sort((left, right) => String(left.id).localeCompare(String(right.id)));

          return {
            title: "Entity Inspector",
            lines: entities.length > 0
              ? entities.map((entity) => {
                  const selectedMark = entity.id === inspectors.selectedEntityId ? "*" : "-";
                  return `${selectedMark} id=${entity.id} label=${entity.label} type=${entity.type} components=${entity.componentCount ?? 0}`;
                })
              : ["No entity summaries available."],
            details: standardDetails({
              selectedEntityId: inspectors.selectedEntityId,
              entityCount: entities.length
            }),
            code: "INSPECTOR_ENTITY_LIST"
          };
        }
      },
      {
        name: "inspector.entity.select",
        summary: "Select the active entity for subsequent inspector commands.",
        usage: "inspector.entity.select <entityId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const entityId = sanitizeText(args?.[0]);
          const store = getInspectorStore(context);
          if (!store || typeof store.setSelectedEntityId !== "function") {
            return {
              status: "failed",
              title: "Entity Select",
              lines: ["Inspector store is unavailable."],
              code: "INSPECTOR_STORE_UNAVAILABLE"
            };
          }

          const selection = store.setSelectedEntityId(entityId);
          if (selection.status !== "ready") {
            return {
              status: "failed",
              title: "Entity Select",
              lines: [`Entity ${entityId || "n/a"} not found.`],
              details: standardDetails(selection.details || {}),
              code: selection.code || "INSPECTOR_ENTITY_NOT_FOUND"
            };
          }

          return {
            title: "Entity Select",
            lines: [toLinePair("selectedEntityId", entityId)],
            details: standardDetails(selection.details || {}),
            code: selection.code || "INSPECTOR_ENTITY_SELECTED"
          };
        }
      },
      {
        name: "inspector.component.list",
        summary: "List available component types for an entity.",
        usage: "inspector.component.list [entityId]",
        handler(context, args) {
          const inspectors = getInspectorsSnapshot(context);
          const entity = findEntity(inspectors, args?.[0]);
          if (!entity) {
            return {
              status: "failed",
              title: "Component Inspector",
              lines: ["Entity not found."],
              code: "INSPECTOR_ENTITY_NOT_FOUND"
            };
          }

          const componentsByEntity = safeSection(inspectors, "componentsByEntity");
          const componentRecord = safeSection(componentsByEntity, entity.id);
          const componentTypes = Object.keys(componentRecord).sort((left, right) => left.localeCompare(right));

          return {
            title: "Component Inspector",
            lines: componentTypes.length > 0
              ? componentTypes.map((type) => `${entity.id}.${type}`)
              : [`No component records for ${entity.id}.`],
            details: standardDetails({
              entityId: entity.id,
              componentCount: componentTypes.length
            }),
            code: "INSPECTOR_COMPONENT_LIST"
          };
        }
      },
      {
        name: "inspector.component.preview",
        summary: "Preview read-only component payload for an entity component.",
        usage: "inspector.component.preview <entityId> <componentType>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(2, { args, commandName });
        },
        handler(context, args) {
          const inspectors = getInspectorsSnapshot(context);
          const entityId = sanitizeText(args?.[0]);
          const componentType = sanitizeText(args?.[1]);

          const componentsByEntity = safeSection(inspectors, "componentsByEntity");
          const componentRecord = safeSection(componentsByEntity, entityId);
          if (!Object.prototype.hasOwnProperty.call(componentRecord, componentType)) {
            return {
              status: "failed",
              title: "Component Preview",
              lines: [`Component ${componentType || "n/a"} not found for ${entityId || "n/a"}.`],
              code: "INSPECTOR_COMPONENT_NOT_FOUND"
            };
          }

          const payload = componentRecord[componentType];
          return {
            title: "Component Preview",
            lines: [
              toLinePair("entityId", entityId),
              toLinePair("componentType", componentType),
              `payload=${stringifyValue(payload)}`
            ],
            details: standardDetails({ entityId, componentType, payload }),
            code: "INSPECTOR_COMPONENT_PREVIEW"
          };
        }
      },
      {
        name: "inspector.state.diff",
        summary: "Show deterministic read-only state differences between frames.",
        usage: "inspector.state.diff [limit]",
        handler(context, args) {
          const store = getInspectorStore(context);
          if (!store || typeof store.buildDiffSummary !== "function") {
            return {
              status: "failed",
              title: "State Diff",
              lines: ["Inspector store is unavailable."],
              code: "INSPECTOR_STORE_UNAVAILABLE"
            };
          }

          const limit = asPositiveInt(Number(args?.[0]), 12);
          const diff = store.buildDiffSummary(limit);
          const lines = [
            toLinePair("totalChanges", diff.totalChanges),
            toLinePair("shown", diff.changes.length),
            toLinePair("truncated", diff.truncated)
          ];

          diff.changes.forEach((change) => {
            const before = stringifyValue(change.before);
            const after = stringifyValue(change.after);
            lines.push(`${change.kind}:${change.key}:${before}->${after}`);
          });

          if (diff.changes.length === 0) {
            lines.push("No state changes detected.");
          }

          return {
            title: "State Diff Viewer",
            lines,
            details: standardDetails({ diff }),
            code: "INSPECTOR_STATE_DIFF"
          };
        }
      },
      {
        name: "inspector.timeline.list",
        summary: "List timestamped timeline markers.",
        usage: "inspector.timeline.list [limit]",
        handler(context, args) {
          const inspectors = getInspectorsSnapshot(context);
          const limit = asPositiveInt(Number(args?.[0]), 15);
          const markers = safeArray(inspectors.timelineMarkers)
            .slice(-limit)
            .map((marker) => `${formatTime(marker.timestamp)} frame=${marker.frameIndex} category=${marker.category} label=${marker.label}`);

          return {
            title: "Timeline Debugger",
            lines: markers.length > 0 ? markers : ["No timeline markers available."],
            details: standardDetails({
              totalMarkers: safeArray(inspectors.timelineMarkers).length,
              shown: markers.length
            }),
            code: "INSPECTOR_TIMELINE"
          };
        }
      },
      {
        name: "inspector.events.list",
        summary: "List normalized event stream entries.",
        usage: "inspector.events.list [limit] [severity] [category]",
        handler(context, args) {
          const inspectors = getInspectorsSnapshot(context);
          const limit = asPositiveInt(Number(args?.[0]), 20);
          const severityFilter = sanitizeText(args?.[1]).toLowerCase();
          const categoryFilter = sanitizeText(args?.[2]).toLowerCase();

          const events = safeArray(inspectors.eventStream)
            .filter((entry) => {
              if (severityFilter && String(entry.severity).toLowerCase() !== severityFilter) {
                return false;
              }
              if (categoryFilter && String(entry.category).toLowerCase() !== categoryFilter) {
                return false;
              }
              return true;
            })
            .slice(-limit)
            .map((entry) => `${formatTime(entry.timestamp)} severity=${entry.severity} category=${entry.category} id=${entry.eventId} message=${entry.message}`);

          return {
            title: "Event Stream Viewer",
            lines: events.length > 0 ? events : ["No event stream entries available."],
            details: standardDetails({
              totalEvents: safeArray(inspectors.eventStream).length,
              shown: events.length,
              severityFilter,
              categoryFilter
            }),
            code: "INSPECTOR_EVENTS"
          };
        }
      },
      {
        name: "inspector.status",
        summary: "Show inspector buffer bounds and selected entity state.",
        usage: "inspector.status",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler(context) {
          const inspectors = getInspectorsSnapshot(context);
          const limits = safeSection(inspectors, "limits");
          return {
            title: "Inspector Status",
            lines: [
              toLinePair("selectedEntityId", inspectors.selectedEntityId || "none"),
              toLinePair("entityCount", safeArray(inspectors.entities).length),
              toLinePair("timelineCount", safeArray(inspectors.timelineMarkers).length),
              toLinePair("eventCount", safeArray(inspectors.eventStream).length),
              toLinePair("frameBufferCount", safeArray(inspectors.frameBuffer).length),
              toLinePair("frameBufferMax", limits.frameBufferMax ?? "n/a")
            ],
            details: standardDetails({ inspectors }),
            code: "INSPECTOR_STATUS"
          };
        }
      }
    ]
  };
}
