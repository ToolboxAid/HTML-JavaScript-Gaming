import { normalizeText } from "../string/strings.js";

export const TOOL_UX_LIFECYCLE = Object.freeze({
  INIT: "INIT",
  LOADING: "LOADING",
  READY_EMPTY: "READY_EMPTY",
  READY_SELECTED: "READY_SELECTED",
  INTERACTING: "INTERACTING"
});

const ALLOWED_STATES = new Set(Object.values(TOOL_UX_LIFECYCLE));

function getBodyElement() {
  return typeof document !== "undefined" ? document.body : null;
}

export function setToolUxLifecycleState(toolId, state, details = {}) {
  const safeToolId = normalizeText(toolId);
  const safeState = normalizeText(state).toUpperCase();
  if (!safeToolId || !ALLOWED_STATES.has(safeState)) {
    return;
  }

  const body = getBodyElement();
  if (body instanceof HTMLElement) {
    body.dataset.toolUxLifecycle = safeState;
    body.dataset.toolUxId = safeToolId;
  }

  if (typeof console !== "undefined") {
    const writer = typeof console.debug === "function" ? console.debug : console.log;
    writer.call(console, "[tool-ux:lifecycle]", {
      toolId: safeToolId,
      state: safeState,
      ...details
    });
  }
}

export function applyUnifiedLayoutZones(zoneMap = {}) {
  if (!zoneMap || typeof zoneMap !== "object") {
    return;
  }
  Object.entries(zoneMap).forEach(([zoneName, selectorOrElement]) => {
    const safeZoneName = normalizeText(zoneName);
    if (!safeZoneName) {
      return;
    }
    let element = null;
    if (selectorOrElement instanceof Element) {
      element = selectorOrElement;
    } else if (typeof selectorOrElement === "string" && selectorOrElement.trim()) {
      element = document.querySelector(selectorOrElement);
    }
    if (!(element instanceof HTMLElement)) {
      return;
    }
    element.dataset.toolUxZone = safeZoneName;
  });
}

export function getUnifiedEmptyStateMessage() {
  return "No data loaded. Load or create asset.";
}
