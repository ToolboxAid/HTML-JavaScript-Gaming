/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardRenderer.js
*/

import { asArray, asObject, sanitizeText } from "../shared/networkDebugUtils.js";
import { createServerDashboardViewModel } from "./serverDashboardViewModel.js";

const DEFAULT_SECTION_ORDER = Object.freeze([
  "network.dashboard.summary",
  "network.dashboard.connections",
  "network.dashboard.players",
  "network.dashboard.latency",
  "network.dashboard.throughput",
  "network.dashboard.refresh"
]);

export function renderServerDashboardSections(snapshot, options = {}) {
  const source = asObject(options);
  const registry = asObject(source.registry);
  const viewModel = createServerDashboardViewModel(snapshot, {
    title: source.title,
    mode: source.mode,
    lastRefreshTimestampMs: source.lastRefreshTimestampMs,
    viewState: source.viewState
  });
  const listedSections = typeof registry.listSections === "function"
    ? asArray(registry.listSections())
    : [];

  const sectionIds = listedSections.length > 0
    ? listedSections
        .filter((section) => asObject(section).enabled !== false)
        .map((section) => sanitizeText(asObject(section).sectionId))
        .filter(Boolean)
    : DEFAULT_SECTION_ORDER.slice();

  const sections = sectionIds.map((sectionId) => {
    const section = asObject(viewModel.sectionMap[sectionId]);
    if (!section.sectionId) {
      return null;
    }
    return {
      sectionId: section.sectionId,
      title: sanitizeText(section.title) || section.sectionId,
      lines: asArray(section.lines).map((line) => String(line))
    };
  }).filter(Boolean);

  return {
    title: viewModel.title,
    timestampMs: viewModel.timestampMs,
    lastRefreshTimestampMs: viewModel.lastRefreshTimestampMs,
    mode: viewModel.mode,
    metrics: { ...asObject(viewModel.metrics) },
    sections
  };
}
