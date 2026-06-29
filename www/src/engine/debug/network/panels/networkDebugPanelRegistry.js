/*
Toolbox Aid
David Quesenberry
04/06/2026
networkDebugPanelRegistry.js
*/

import { asArray, asBoolean, asNumber, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

export function createTextBlockPanel(options = {}) {
  const source = asObject(options);
  const id = sanitizeText(source.id) || "network.panel";
  const title = sanitizeText(source.title) || id;
  const sourceId = sanitizeText(source.source) || "assets";
  const renderLines = typeof source.renderLines === "function" ? source.renderLines : null;
  const customRender = typeof source.render === "function" ? source.render : null;

  return {
    id,
    title,
    enabled: asBoolean(source.enabled, true),
    priority: Math.floor(asNumber(source.priority, 1160)),
    source: sourceId,
    renderMode: "text-block",
    render(panel, snapshot) {
      if (customRender) {
        return customRender(panel, snapshot);
      }

      const lines = renderLines ? asArray(renderLines(snapshot)) : [];
      return {
        id,
        title,
        lines
      };
    }
  };
}

export function createTextBlockPanels(entries = []) {
  return asArray(entries).map((entry) => createTextBlockPanel(entry));
}

export function registerNetworkDebugPanels(panelRegistry, entries = [], source = "debug.network") {
  if (!panelRegistry || typeof panelRegistry.registerPanel !== "function") {
    return [];
  }

  const normalizedSource = sanitizeText(source) || "debug.network";
  const panels = createTextBlockPanels(entries);
  return panels.map((panel) => panelRegistry.registerPanel(panel, normalizedSource));
}
