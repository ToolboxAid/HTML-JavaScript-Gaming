/*
Toolbox Aid
David Quesenberry
04/06/2026
timelineInspectorViewModel.js
*/

import {
  asArray,
  asPositiveInteger,
  asObject,
  sanitizeText
} from "/src/engine/debug/inspectors/shared/inspectorUtils.js";

function normalizeTimelineMarker(input, index) {
  const source = asObject(input);
  return {
    markerId: sanitizeText(source.markerId) || sanitizeText(source.id) || `marker-${index + 1}`,
    timestamp: Number.isFinite(source.timestamp) ? Number(source.timestamp) : Date.now(),
    frameIndex: Number.isFinite(source.frameIndex) ? Math.floor(Number(source.frameIndex)) : -1,
    category: sanitizeText(source.category) || "general",
    label: sanitizeText(source.label) || "marker"
  };
}

export function createTimelineInspectorViewModel(options = {}) {
  const source = asObject(options);
  const limit = asPositiveInteger(source.limit, 24);
  const markers = asArray(source.timelineMarkers).map((marker, index) => normalizeTimelineMarker(marker, index));
  const tail = markers.slice(-limit);
  const lines = tail.map((marker) => `${marker.timestamp} frame=${marker.frameIndex} category=${marker.category} label=${marker.label}`);

  return {
    inspectorId: "inspector.timeline",
    title: "Timeline Inspector",
    markerCount: markers.length,
    markers: tail,
    lines: lines.length > 0 ? lines : ["No timeline markers available."]
  };
}
