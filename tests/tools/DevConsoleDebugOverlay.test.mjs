/*
Toolbox Aid
David Quesenberry
04/05/2026
DevConsoleDebugOverlay.test.mjs
*/
import assert from "node:assert/strict";
import {
  DEV_CONSOLE_ENGINE_MAPPINGS,
  createCommandRegistry,
  createDevConsoleDebugOverlayRuntime,
  createDiagnosticsCollector,
  createOverlayPanelRegistry,
  getDeterministicRenderOrder,
  summarizeDevConsoleDebugOverlay
} from "../../tools/shared/devConsoleDebugOverlay.js";

export async function run() {
  assert.equal(typeof DEV_CONSOLE_ENGINE_MAPPINGS.runtime, "string");
  assert.equal(typeof DEV_CONSOLE_ENGINE_MAPPINGS.hotReload, "string");

  const diagnosticsCollector = createDiagnosticsCollector({
    nowProvider: () => 123,
    adapters: {
      runtime: () => ({ sceneId: "scene.dev", status: "ready" }),
      render: () => ({ fps: 60, stages: ["parallax", "tilemap", "entities", "sprite-effects", "vector-overlay"] }),
      hotReload: () => ({ enabled: true, pending: false }),
      validation: () => ({ errorCount: 0, warningCount: 1 }),
      input: () => {
        throw new Error("input adapter unavailable");
      }
    }
  });

  const diagnostics = diagnosticsCollector.collect();
  assert.equal(diagnostics.status, "ready");
  assert.equal(diagnostics.diagnostics.contractVersion, "1.0.0");
  assert.equal(diagnostics.diagnostics.timestamp, 123);
  assert.equal(diagnostics.diagnostics.errors.length, 1);
  assert.equal(diagnostics.reports[0].code, "DIAGNOSTICS_ADAPTER_UNAVAILABLE");

  const commandRegistry = createCommandRegistry({ includeCoreCommands: true });
  assert.equal(commandRegistry.getCount() >= 17, true);
  const duplicateExtension = commandRegistry.registerCommand(
    {
      name: "status",
      category: "core",
      description: "conflict",
      usage: "status",
      execute: () => ({ lines: ["conflict"] })
    },
    "extension"
  );
  assert.equal(duplicateExtension.status, "rejected");
  assert.equal(duplicateExtension.report.code, "COMMAND_EXTENSION_CONFLICT");

  const commandResult = commandRegistry.execute("status", {
    runtime: { sceneId: "scene.dev", status: "ready" },
    hotReload: { enabled: true },
    validation: { errorCount: 0, warningCount: 0 }
  });
  assert.equal(commandResult.status, "ready");

  const missingResult = commandRegistry.execute("unknown.command", {});
  assert.equal(missingResult.status, "failed");
  assert.equal(missingResult.reports[0].code, "COMMAND_NOT_FOUND");

  const panelRegistry = createOverlayPanelRegistry({ includeCorePanels: true });
  const panelConflict = panelRegistry.registerPanel(
    {
      id: "runtime-summary",
      title: "Conflict",
      enabled: true,
      priority: 100,
      source: "runtime",
      renderMode: "text-block"
    },
    "extension"
  );
  assert.equal(panelConflict.status, "rejected");
  assert.equal(panelConflict.report.code, "PANEL_EXTENSION_CONFLICT");

  const failingPanelRegister = panelRegistry.registerPanel(
    {
      id: "failing-panel",
      title: "Failing",
      enabled: true,
      priority: 150,
      source: "runtime",
      renderMode: "text-block",
      render: () => {
        throw new Error("panel exploded");
      }
    },
    "extension"
  );
  assert.equal(failingPanelRegister.status, "registered");

  const panelRender = panelRegistry.render(diagnostics.diagnostics);
  assert.equal(panelRender.status, "ready");
  assert.equal(panelRender.sections.length >= 1, true);
  assert.equal(panelRender.reports.some((report) => report.code === "PANEL_RENDER_FAILED"), true);

  const order = getDeterministicRenderOrder(["entities", "parallax", "tilemap", "vector", "sprite"]);
  assert.deepEqual(order.slice(-2), ["debug-overlay", "dev-console-surface"]);
  assert.deepEqual(order.slice(0, 5), ["parallax", "tilemap", "entities", "sprite-effects", "vector-overlay"]);

  const runtime = createDevConsoleDebugOverlayRuntime({
    diagnosticsCollector,
    commandRegistry,
    panelRegistry
  });

  runtime.showConsole();
  runtime.showOverlay();

  const help = runtime.executeConsoleInput("help", {
    runtime: { sceneId: "scene.dev", status: "ready" },
    hotReload: { enabled: true },
    validation: { errorCount: 0, warningCount: 1 }
  });
  assert.equal(help.status, "ready");
  assert.equal(help.output.lines.length > 0, true);

  runtime.executeConsoleInput("overlay.toggle runtime-summary", {
    runtime: { sceneId: "scene.dev", status: "ready" },
    hotReload: { enabled: true },
    validation: { errorCount: 0, warningCount: 1 }
  });

  const beforeReload = runtime.getState();
  assert.equal(beforeReload.commandHistory.length >= 2, true);
  assert.equal(beforeReload.commandCount, commandRegistry.getCount());
  assert.equal(beforeReload.panelCount, panelRegistry.getCount());

  const reloadReady = runtime.applyHotReload({
    status: "ready",
    mode: "targeted",
    runtimeState: {
      sceneId: "scene.dev",
      revision: "r1"
    }
  });
  assert.equal(reloadReady.status, "ready");
  assert.equal(reloadReady.reloadGeneration, 1);

  for (let index = 0; index < 3; index += 1) {
    const repeated = runtime.applyHotReload({
      status: "ready",
      mode: "targeted",
      runtimeState: {
        sceneId: "scene.dev",
        revision: `r${index + 2}`
      }
    });
    assert.equal(repeated.status, "ready");
    assert.equal(runtime.getState().commandCount, beforeReload.commandCount);
    assert.equal(runtime.getState().panelCount, beforeReload.panelCount);
  }

  const reloadFailed = runtime.applyHotReload({
    status: "failed",
    mode: "targeted",
    reason: "contract-invalid"
  });
  assert.equal(reloadFailed.status, "failed");
  assert.equal(reloadFailed.reports[0].code, "RELOAD_REJECTED_KEEP_LAST_GOOD");
  assert.equal(runtime.getState().lastKnownGoodRuntime.revision, "r4");

  runtime.hideOverlay();
  const hiddenOverlay = runtime.renderOverlay(diagnostics.diagnostics);
  assert.equal(hiddenOverlay.status, "hidden");

  runtime.showOverlay();
  const visibleOverlay = runtime.renderOverlay(diagnostics.diagnostics);
  assert.equal(visibleOverlay.status, "ready");

  const disposeResult = runtime.dispose();
  assert.equal(disposeResult.status, "ready");
  assert.equal(runtime.getState().disposed, true);

  const summary = summarizeDevConsoleDebugOverlay({
    status: "ready",
    console: { commandCount: runtime.getState().commandCount },
    overlay: { panelCount: runtime.getState().panelCount }
  });
  assert.equal(summary.startsWith("Dev console/debug overlay ready"), true);
}
