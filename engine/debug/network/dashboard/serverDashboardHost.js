/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardHost.js
*/

import { asObject } from "../shared/networkDebugUtils.js";
import { createServerDashboardRegistry } from "./serverDashboardRegistry.js";
import { createServerDashboardSnapshotCollector } from "./serverDashboardProviders.js";
import {
  listServerDashboardRefreshModes,
  normalizeServerDashboardRefreshMode,
  resolveServerDashboardRefreshIntervalMs
} from "./serverDashboardRefreshModes.js";
import { renderServerDashboardSections } from "./serverDashboardRenderer.js";

export function createServerDashboardHost(options = {}) {
  const source = asObject(options);
  const registry = source.registry && typeof source.registry.listSections === "function"
    ? source.registry
    : createServerDashboardRegistry();
  const refreshModeOptions = asObject(source.refreshModes);
  let mode = normalizeServerDashboardRefreshMode(source.refreshMode, "normal");

  const collectSnapshot = createServerDashboardSnapshotCollector({
    getSnapshot: source.getSnapshot,
    snapshot: source.snapshot
  });
  const render = typeof source.render === "function"
    ? source.render
    : (snapshot, renderOptions = {}) => renderServerDashboardSections(snapshot, {
      registry,
      title: source.title
        || "Server Dashboard",
      ...asObject(renderOptions)
    });
  const onRender = typeof source.onRender === "function" ? source.onRender : null;
  const onError = typeof source.onError === "function" ? source.onError : null;

  let timer = null;
  let running = false;
  let lastSnapshot = null;
  let lastRendered = null;
  let lastRefreshTimestampMs = 0;
  let refreshCount = 0;
  let lastErrorMessage = "";

  function cloneValue(value) {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function getRefreshIntervalMs(targetMode = mode) {
    return resolveServerDashboardRefreshIntervalMs(targetMode, {
      modes: refreshModeOptions
    });
  }

  function clearRefreshTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function scheduleRefreshTimer() {
    clearRefreshTimer();
    if (!running || mode === "manual") {
      return;
    }
    const intervalMs = getRefreshIntervalMs(mode);
    timer = setInterval(() => {
      refreshNow();
    }, intervalMs);
  }

  function getStatus() {
    const snapshot = asObject(lastSnapshot);
    const sectionCount = Array.isArray(lastRendered?.sections) ? lastRendered.sections.length : 0;
    return {
      running,
      mode,
      refreshIntervalMs: getRefreshIntervalMs(mode),
      refreshModes: listServerDashboardRefreshModes(),
      refreshCount,
      lastRefreshTimestampMs,
      sectionCount,
      playerCount: Array.isArray(snapshot.players) ? snapshot.players.length : 0,
      connectionCount: Number(snapshot.connectionSessionCounts?.connections) || 0,
      sessionCount: Number(snapshot.connectionSessionCounts?.sessions) || 0,
      lastErrorMessage
    };
  }

  function refreshNow() {
    try {
      lastSnapshot = collectSnapshot();
      lastRefreshTimestampMs = Date.now();
      refreshCount += 1;
      lastRendered = render(lastSnapshot, {
        registry,
        mode,
        lastRefreshTimestampMs
      });
      lastErrorMessage = "";
      if (onRender) {
        onRender(lastRendered, lastSnapshot, getStatus());
      }
      return {
        ok: true,
        snapshot: cloneValue(lastSnapshot),
        rendered: cloneValue(lastRendered),
        status: getStatus()
      };
    } catch (error) {
      lastErrorMessage = error instanceof Error ? error.message : String(error);
      if (onError) {
        onError(error);
      }
      return {
        ok: false,
        error,
        status: getStatus()
      };
    }
  }

  function runOnce() {
    return refreshNow();
  }

  function start() {
    if (running) {
      return false;
    }

    running = true;
    refreshNow();
    scheduleRefreshTimer();
    return true;
  }

  function stop() {
    if (!running) {
      return false;
    }
    running = false;
    clearRefreshTimer();
    return true;
  }

  function destroy() {
    return stop();
  }

  function setRefreshMode(nextMode) {
    mode = normalizeServerDashboardRefreshMode(nextMode, mode);
    scheduleRefreshTimer();
    return getStatus();
  }

  function getSnapshot() {
    return cloneValue(lastSnapshot);
  }

  function isRunning() {
    return running;
  }

  function getLastSnapshot() {
    return cloneValue(lastSnapshot);
  }

  function getLastRendered() {
    return cloneValue(lastRendered);
  }

  return {
    start,
    stop,
    destroy,
    runOnce,
    refreshNow,
    isRunning,
    setRefreshMode,
    getStatus,
    getSnapshot,
    getLastSnapshot,
    getLastRendered,
    pollIntervalMs: getRefreshIntervalMs(mode),
    getRefreshIntervalMs() {
      return getRefreshIntervalMs(mode);
    }
  };
}
