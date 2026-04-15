/*
Toolbox Aid
David Quesenberry
04/06/2026
eventStreamInspectorViewModel.js
*/

import {
  asArray,
  asPositiveInteger,
  asObject,
  sanitizeText
} from "../shared/inspectorUtils.js";

function normalizeEvent(input, index) {
  const source = asObject(input);
  return {
    eventId: sanitizeText(source.eventId) || sanitizeText(source.id) || `event-${index + 1}`,
    timestamp: Number.isFinite(source.timestamp) ? Number(source.timestamp) : Date.now(),
    severity: sanitizeText(source.severity) || "info",
    category: sanitizeText(source.category) || "general",
    message: sanitizeText(source.message) || "event"
  };
}

export function createEventStreamInspectorViewModel(options = {}) {
  const source = asObject(options);
  const limit = asPositiveInteger(source.limit, 30);
  const severityFilter = sanitizeText(source.severityFilter).toLowerCase();
  const categoryFilter = sanitizeText(source.categoryFilter).toLowerCase();
  const events = asArray(source.eventStream).map((entry, index) => normalizeEvent(entry, index));
  const filtered = events.filter((entry) => {
    if (severityFilter && entry.severity.toLowerCase() !== severityFilter) {
      return false;
    }
    if (categoryFilter && entry.category.toLowerCase() !== categoryFilter) {
      return false;
    }
    return true;
  });
  const tail = filtered.slice(-limit);
  const lines = tail.map((entry) => `${entry.timestamp} severity=${entry.severity} category=${entry.category} id=${entry.eventId} message=${entry.message}`);

  return {
    inspectorId: "inspector.eventStream",
    title: "Event Stream Inspector",
    totalEvents: events.length,
    shownEvents: tail.length,
    severityFilter,
    categoryFilter,
    events: tail,
    lines: lines.length > 0 ? lines : ["No event stream entries available."]
  };
}

