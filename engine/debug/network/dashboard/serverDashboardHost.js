/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardHost.js
*/

import { asNumber, asObject } from "../shared/networkDebugUtils.js";
import { createServerDashboardSnapshotCollector } from "./serverDashboardProviders.js";
import { renderServerDashboardSections } from "./serverDashboardRenderer.js";

const MIN_REFRESH_INTERVAL_MS = 250;

export function createServerDashboardHost(options = {}) {
  const source = asObject(options);
  const pollIntervalMs = Math.max(
    MIN_REFRESH_INTERVAL_MS,
    Math.floor(asNumber(source.pollIntervalMs, 1000))
  );
  const collectSnapshot = createServerDashboardSnapshotCollector({
    getSnapshot: source.getSnapshot,
    snapshot: source.snapshot
  });
  const render = typeof source.render === "function"
    ? source.render
    : (snapshot) => renderServerDashboardSections(snapshot, {
      registry: source.registry,
      title: source.title
    });
  const onRender = typeof source.onRender === "function" ? source.onRender : null;
  const onError = typeof source.onError === "function" ? source.onError : null;

  let timer = null;
  let running = false;
  let lastSnapshot = null;
  let lastRendered = null;

  function runOnce() {
    try {
      lastSnapshot = collectSnapshot();
      lastRendered = render(lastSnapshot);
      if (onRender) {
        onRender(lastRendered, lastSnapshot);
      }
      return {
        ok: true,
        snapshot: lastSnapshot,
        rendered: lastRendered
      };
    } catch (error) {
      if (onError) {
        onError(error);
      }
      return {
        ok: false,
        error
      };
    }
  }

  function start() {
    if (running) {
      return false;
    }

    running = true;
    runOnce();
    timer = setInterval(() => {
      runOnce();
    }, pollIntervalMs);
    return true;
  }

  function stop() {
    if (!running) {
      return false;
    }
    running = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    return true;
  }

  function isRunning() {
    return running;
  }

  function getLastSnapshot() {
    return lastSnapshot;
  }

  function getLastRendered() {
    return lastRendered;
  }

  return {
    start,
    stop,
    runOnce,
    isRunning,
    getLastSnapshot,
    getLastRendered,
    pollIntervalMs
  };
}
