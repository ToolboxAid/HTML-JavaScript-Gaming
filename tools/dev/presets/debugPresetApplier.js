/*
Toolbox Aid
David Quesenberry
04/05/2026
debugPresetApplier.js
*/

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";
import { isObject } from "../../../src/shared/utils/objectUtils.js";
import { cloneJson } from "../../../src/shared/utils/jsonUtils.js";
import { getRuntimeAndRegistry } from "../shared/runtimeRegistryUtils.js";

function getAllPanels(panelRegistry) {
  const panels = panelRegistry.getOrderedPanels(true);
  return Array.isArray(panels) ? panels : [];
}

function buildPanelSnapshot(panelRegistry) {
  const orderedPanels = getAllPanels(panelRegistry);
  return {
    version: "1",
    updatedAt: Date.now(),
    panels: orderedPanels.map((panel) => ({
      id: sanitizeText(panel?.id),
      enabled: Boolean(panel?.enabled)
    }))
  };
}

function toPanelMap(panelRegistry) {
  const map = new Map();
  getAllPanels(panelRegistry).forEach((panel) => {
    const panelId = sanitizeText(panel?.id);
    if (panelId) {
      map.set(panelId, panel);
    }
  });
  return map;
}

function toResult(status, title, code, lines, details = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    title,
    code,
    lines: Array.isArray(lines) ? lines : [],
    details: isObject(details) ? details : {}
  };
}

export class DebugPresetApplier {
  constructor(options = {}) {
    this.presetRegistry = options.presetRegistry || null;
    this.currentPresetId = "";
    this.baselineByPanelId = new Map();
    this.baselineCaptured = false;
  }

  getCurrentPresetId() {
    return this.currentPresetId;
  }

  captureBaseline(panelRegistry) {
    if (this.baselineCaptured) {
      return;
    }

    this.baselineByPanelId.clear();
    getAllPanels(panelRegistry).forEach((panel) => {
      const panelId = sanitizeText(panel?.id);
      if (!panelId) {
        return;
      }
      this.baselineByPanelId.set(panelId, Boolean(panel?.enabled));
    });
    this.baselineCaptured = true;
  }

  persistSnapshotIfAvailable(context, panelRegistry) {
    const persist = context?.persistOverlayPanelState;
    if (typeof persist !== "function") {
      return {
        status: "skipped",
        code: "PERSISTENCE_NOT_CONFIGURED"
      };
    }

    const snapshot = buildPanelSnapshot(panelRegistry);
    try {
      persist(cloneJson(snapshot));
      return {
        status: "ready",
        code: "PERSISTENCE_UPDATED",
        snapshot
      };
    } catch (error) {
      return {
        status: "failed",
        code: "PERSISTENCE_UPDATE_FAILED",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  applyPreset(presetId, context = {}) {
    const runtimeContext = getRuntimeAndRegistry(context);
    if (runtimeContext.status !== "ready") {
      return toResult(
        "failed",
        "Preset Apply",
        runtimeContext.code,
        [runtimeContext.message],
        {
          presetId: sanitizeText(presetId)
        }
      );
    }

    if (!this.presetRegistry || typeof this.presetRegistry.getPreset !== "function") {
      return toResult(
        "failed",
        "Preset Apply",
        "MISSING_PRESET_REGISTRY",
        ["Preset registry is unavailable."],
        {
          presetId: sanitizeText(presetId)
        }
      );
    }

    const descriptor = this.presetRegistry.getPreset(presetId);
    if (!descriptor) {
      return toResult(
        "failed",
        "Preset Apply",
        "PRESET_NOT_FOUND",
        [`Preset ${sanitizeText(presetId) || "n/a"} was not found.`],
        {
          presetId: sanitizeText(presetId)
        }
      );
    }

    const panelRegistry = runtimeContext.panelRegistry;
    this.captureBaseline(panelRegistry);

    const panelMap = toPanelMap(panelRegistry);
    const ignoredPanelIds = [];
    let changedCount = 0;

    const enabledPanelIds = Array.isArray(descriptor?.panels?.enabled) ? descriptor.panels.enabled : [];
    const disabledPanelIds = Array.isArray(descriptor?.panels?.disabled) ? descriptor.panels.disabled : [];

    enabledPanelIds.forEach((panelId) => {
      const id = sanitizeText(panelId);
      if (!id) {
        return;
      }
      const panel = panelMap.get(id);
      if (!panel) {
        ignoredPanelIds.push(id);
        return;
      }
      const before = Boolean(panel.enabled);
      const update = panelRegistry.setPanelEnabled(id, true);
      if (sanitizeText(update?.status) === "ready" && before !== true) {
        changedCount += 1;
      }
    });

    disabledPanelIds.forEach((panelId) => {
      const id = sanitizeText(panelId);
      if (!id) {
        return;
      }
      const panel = panelMap.get(id);
      if (!panel) {
        ignoredPanelIds.push(id);
        return;
      }
      const before = Boolean(panel.enabled);
      const update = panelRegistry.setPanelEnabled(id, false);
      if (sanitizeText(update?.status) === "ready" && before !== false) {
        changedCount += 1;
      }
    });

    const orderRequested = Array.isArray(descriptor?.panels?.order) ? descriptor.panels.order : [];
    const orderIgnored = orderRequested
      .map((panelId) => sanitizeText(panelId))
      .filter((panelId) => panelId && panelMap.has(panelId));

    this.currentPresetId = descriptor.presetId;
    const persistence = this.persistSnapshotIfAvailable(context, panelRegistry);

    const lines = [
      `presetId=${descriptor.presetId}`,
      `title=${descriptor.title}`,
      `changedCount=${changedCount}`,
      `ignoredPanelCount=${ignoredPanelIds.length}`,
      `orderRequestedCount=${orderRequested.length}`,
      `orderApplied=false`,
      `persistence=${persistence.code}`
    ];

    if (ignoredPanelIds.length > 0) {
      lines.push(`ignoredPanelIds=${ignoredPanelIds.join(",")}`);
    }

    if (orderIgnored.length > 0) {
      lines.push(`orderDeferred=${orderIgnored.join(",")}`);
    }

    if (persistence.status === "failed") {
      lines.push(`persistenceError=${persistence.error}`);
    }

    return toResult(
      "ready",
      "Preset Apply",
      "PRESET_APPLY_READY",
      lines,
      {
        presetId: descriptor.presetId,
        changedCount,
        ignoredPanelIds,
        orderRequested,
        persistence
      }
    );
  }

  resetPreset(context = {}) {
    const runtimeContext = getRuntimeAndRegistry(context);
    if (runtimeContext.status !== "ready") {
      return toResult(
        "failed",
        "Preset Reset",
        runtimeContext.code,
        [runtimeContext.message]
      );
    }

    const panelRegistry = runtimeContext.panelRegistry;
    this.captureBaseline(panelRegistry);

    const panelMap = toPanelMap(panelRegistry);
    let changedCount = 0;

    this.baselineByPanelId.forEach((enabled, panelId) => {
      if (!panelMap.has(panelId)) {
        return;
      }
      const panel = panelMap.get(panelId);
      const before = Boolean(panel?.enabled);
      const update = panelRegistry.setPanelEnabled(panelId, enabled === true);
      if (sanitizeText(update?.status) === "ready" && before !== (enabled === true)) {
        changedCount += 1;
      }
    });

    this.currentPresetId = "";
    const persistence = this.persistSnapshotIfAvailable(context, panelRegistry);

    const lines = [
      `baselinePanels=${this.baselineByPanelId.size}`,
      `changedCount=${changedCount}`,
      `persistence=${persistence.code}`
    ];

    if (persistence.status === "failed") {
      lines.push(`persistenceError=${persistence.error}`);
    }

    return toResult(
      "ready",
      "Preset Reset",
      "PRESET_RESET_READY",
      lines,
      {
        changedCount,
        baselinePanels: this.baselineByPanelId.size,
        persistence
      }
    );
  }
}
