/*
Toolbox Aid
David Quesenberry
04/06/2026
entityInspectorViewModel.js
*/

import {
  asArray,
  asPositiveInteger,
  asObject,
  sanitizeText
} from "../shared/inspectorUtils.js";

function normalizeEntity(input, index) {
  const source = asObject(input);
  const id = sanitizeText(source.id) || `entity-${index + 1}`;
  const componentTypes = asArray(source.componentTypes)
    .map((type) => sanitizeText(type))
    .filter(Boolean);
  return {
    id,
    label: sanitizeText(source.label) || id,
    type: sanitizeText(source.type) || "unknown",
    componentTypes,
    componentCount: Number.isFinite(source.componentCount)
      ? Math.max(0, Math.floor(Number(source.componentCount)))
      : componentTypes.length
  };
}

export function createEntityInspectorViewModel(options = {}) {
  const source = asObject(options);
  const selectedEntityId = sanitizeText(source.selectedEntityId);
  const limit = asPositiveInteger(source.limit, 24);
  const entities = asArray(source.entities).map((entry, index) => normalizeEntity(entry, index));
  const lines = entities.slice(0, limit).map((entity) => {
    const marker = entity.id === selectedEntityId ? "*" : "-";
    return `${marker} id=${entity.id} label=${entity.label} type=${entity.type} components=${entity.componentCount}`;
  });

  return {
    inspectorId: "inspector.entity",
    title: "Entity Inspector",
    selectedEntityId: selectedEntityId || entities[0]?.id || "",
    entityCount: entities.length,
    entities,
    lines: lines.length > 0 ? lines : ["No entities available."]
  };
}

