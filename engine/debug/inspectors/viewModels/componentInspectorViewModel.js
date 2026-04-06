/*
Toolbox Aid
David Quesenberry
04/06/2026
componentInspectorViewModel.js
*/

import {
  asObject,
  sanitizeText
} from "../shared/inspectorUtils.js";

function summarizePayload(payload) {
  if (payload === null) {
    return "null";
  }
  if (Array.isArray(payload)) {
    return `array(${payload.length})`;
  }
  if (payload !== null && typeof payload === "object") {
    return `object(${Object.keys(payload).length})`;
  }
  return String(payload);
}

export function createComponentInspectorViewModel(options = {}) {
  const source = asObject(options);
  const selectedEntityId = sanitizeText(source.selectedEntityId);
  const componentsByEntity = asObject(source.componentsByEntity);
  const componentRecord = asObject(componentsByEntity[selectedEntityId]);
  const componentTypes = Object.keys(componentRecord).sort((left, right) => left.localeCompare(right));

  const lines = componentTypes.map((componentType) => {
    const payload = componentRecord[componentType];
    return `${selectedEntityId}.${componentType} ${summarizePayload(payload)}`;
  });

  if (lines.length === 0) {
    lines.push(`No component snapshot for ${selectedEntityId || "n/a"}.`);
  }

  return {
    inspectorId: "inspector.component",
    title: "Component Inspector",
    selectedEntityId,
    componentTypes,
    components: componentRecord,
    lines
  };
}
