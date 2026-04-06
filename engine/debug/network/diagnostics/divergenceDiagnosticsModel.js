/*
Toolbox Aid
David Quesenberry
04/06/2026
divergenceDiagnosticsModel.js
*/

import { asArray, asNumber, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

export function createDivergenceDiagnosticsModel(snapshot = {}) {
  const source = asObject(snapshot);
  const divergence = asObject(source.divergence);
  const entities = asArray(divergence.entities);

  const selectedEntityId = sanitizeText(divergence.selectedEntityId);
  const selectedEntity = entities.find((entity) => {
    const row = asObject(entity);
    return sanitizeText(row.entityId) === selectedEntityId;
  }) || asObject(entities[0]);

  return {
    status: sanitizeText(divergence.status) || "unknown",
    overallStatus: sanitizeText(divergence.overallStatus) || sanitizeText(divergence.status) || "unknown",
    selectedEntityId,
    selectedFrameDelta: asNumber(divergence.selectedFrameDelta, asNumber(divergence.frameDelta, 0)),
    overallFrameDelta: asNumber(divergence.overallFrameDelta, asNumber(divergence.frameDelta, 0)),
    entityCount: entities.length,
    selectedEntity: {
      entityId: sanitizeText(selectedEntity.entityId),
      label: sanitizeText(selectedEntity.label),
      frameDelta: asNumber(selectedEntity.frameDelta, 0),
      status: sanitizeText(selectedEntity.divergenceStatus || selectedEntity.status) || "unknown",
      severity: sanitizeText(selectedEntity.severity) || "low"
    }
  };
}
