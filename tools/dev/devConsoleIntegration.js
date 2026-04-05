/*
Toolbox Aid
David Quesenberry
04/05/2026
devConsoleIntegration.js
*/
import { drawPanel } from "../../engine/debug/index.js";
import {
  createDiagnosticsCollector,
  createDevConsoleDebugOverlayRuntime
} from "../shared/devConsoleDebugOverlay.js";

const DEFAULT_WORLD_STAGES = Object.freeze([
  "parallax",
  "tilemap",
  "entities",
  "sprite-effects",
  "vector-overlay"
]);

const DEFAULT_COMBO_BINDINGS = Object.freeze({
  toggleConsole: Object.freeze({ key: "Backquote", shift: true, ctrl: false, alt: false, meta: false }),
  toggleOverlay: Object.freeze({ key: "Backquote", shift: true, ctrl: true, alt: false, meta: false }),
  reload: Object.freeze({ key: "KeyR", shift: true, ctrl: true, alt: false, meta: false }),
  nextPanel: Object.freeze({ key: "BracketRight", shift: true, ctrl: true, alt: false, meta: false }),
  previousPanel: Object.freeze({ key: "BracketLeft", shift: true, ctrl: true, alt: false, meta: false })
});

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function toContextSection(context, field) {
  return isObject(context?.[field]) ? context[field] : {};
}

function getInputEdgePress(input, keyCode, edgeState) {
  const key = sanitizeText(keyCode);
  if (!key) {
    return false;
  }

  if (typeof input?.isPressed === "function") {
    const pressed = input.isPressed(key);
    if (typeof pressed === "boolean") {
      return pressed;
    }
  }

  if (typeof input?.isDown !== "function") {
    return false;
  }

  const isDown = input.isDown(key) === true;
  const wasDown = edgeState.get(key) === true;
  edgeState.set(key, isDown);
  return isDown && !wasDown;
}

function isModifierDown(input, keyCode) {
  if (typeof input?.isDown !== "function") {
    return false;
  }
  return input.isDown(keyCode) === true;
}

function getComboEdgePress(input, combo, edgeState) {
  const normalizedCombo = isObject(combo) ? combo : {};
  const key = sanitizeText(normalizedCombo.key);
  if (!key) {
    return false;
  }

  const keyEdge = getInputEdgePress(input, key, edgeState);
  if (!keyEdge) {
    return false;
  }

  const requiresShift = normalizedCombo.shift === true;
  const requiresCtrl = normalizedCombo.ctrl === true;
  const requiresAlt = normalizedCombo.alt === true;
  const requiresMeta = normalizedCombo.meta === true;

  const shiftDown = isModifierDown(input, "ShiftLeft") || isModifierDown(input, "ShiftRight");
  const ctrlDown = isModifierDown(input, "ControlLeft") || isModifierDown(input, "ControlRight");
  const altDown = isModifierDown(input, "AltLeft") || isModifierDown(input, "AltRight");
  const metaDown = isModifierDown(input, "MetaLeft") || isModifierDown(input, "MetaRight");

  if (requiresShift !== shiftDown) {
    return false;
  }
  if (requiresCtrl !== ctrlDown) {
    return false;
  }
  if (requiresAlt !== altDown) {
    return false;
  }
  if (requiresMeta !== metaDown) {
    return false;
  }

  return true;
}

function buildCommandContext(diagnostics) {
  return {
    runtime: toContextSection(diagnostics, "runtime"),
    camera: toContextSection(diagnostics, "camera"),
    render: toContextSection(diagnostics, "render"),
    entities: toContextSection(diagnostics, "entities"),
    tilemap: toContextSection(diagnostics, "tilemap"),
    input: toContextSection(diagnostics, "input"),
    assets: toContextSection(diagnostics, "assets"),
    hotReload: toContextSection(diagnostics, "hotReload"),
    validation: toContextSection(diagnostics, "validation")
  };
}

function createDefaultAdapters() {
  return {
    runtime: (context) => toContextSection(context, "runtime"),
    camera: (context) => toContextSection(context, "camera"),
    render: (context) => toContextSection(context, "render"),
    entities: (context) => toContextSection(context, "entities"),
    tilemap: (context) => toContextSection(context, "tilemap"),
    input: (context) => toContextSection(context, "input"),
    assets: (context) => toContextSection(context, "assets"),
    hotReload: (context) => toContextSection(context, "hotReload"),
    validation: (context) => toContextSection(context, "validation")
  };
}

function flattenOverlaySections(sections, maxLines = 9) {
  const lines = [];
  const source = Array.isArray(sections) ? sections : [];

  for (let sectionIndex = 0; sectionIndex < source.length; sectionIndex += 1) {
    const section = source[sectionIndex];
    lines.push(`${sanitizeText(section?.title) || "Panel"}:`);
    const sectionLines = Array.isArray(section?.lines) ? section.lines : [];
    for (let lineIndex = 0; lineIndex < sectionLines.length; lineIndex += 1) {
      lines.push(`  ${sanitizeText(sectionLines[lineIndex])}`);
      if (lines.length >= maxLines) {
        return lines;
      }
    }
    if (lines.length >= maxLines) {
      return lines;
    }
  }

  if (lines.length === 0) {
    lines.push("No overlay diagnostics available.");
  }

  return lines.slice(0, maxLines);
}

function buildRuntimeFromOptions(options) {
  if (options?.runtime && typeof options.runtime === "object") {
    return options.runtime;
  }

  const diagnosticsCollector = createDiagnosticsCollector({
    adapters: isObject(options?.adapters) ? options.adapters : createDefaultAdapters(),
    nowProvider: typeof options?.nowProvider === "function" ? options.nowProvider : undefined
  });

  return createDevConsoleDebugOverlayRuntime({ diagnosticsCollector });
}

export function createSampleGameDevConsoleIntegration(options = {}) {
  const runtime = buildRuntimeFromOptions(options);
  const keyEdgeState = new Map();

  const comboBindings = isObject(options?.comboBindings)
    ? options.comboBindings
    : DEFAULT_COMBO_BINDINGS;

  let diagnosticsSnapshot = null;
  let diagnosticsReports = [];
  let overlayRender = { status: "hidden", sections: [], reports: [] };
  let lastCommandExecution = null;
  let lastCommandBinding = "";
  let panelCursorIndex = -1;

  function executeCommand(commandText, context = null) {
    const command = sanitizeText(commandText);
    if (!command) {
      return null;
    }

    const commandContext = context && isObject(context)
      ? context
      : buildCommandContext(diagnosticsSnapshot || {});

    const execution = runtime.executeConsoleInput(command, commandContext);
    lastCommandExecution = execution;
    lastCommandBinding = command;
    return execution;
  }

  function cyclePanel(direction) {
    if (!runtime?.panelRegistry || typeof runtime.panelRegistry.getOrderedPanels !== "function") {
      return null;
    }

    const orderedPanels = runtime.panelRegistry.getOrderedPanels(true);
    if (!Array.isArray(orderedPanels) || orderedPanels.length === 0) {
      return null;
    }

    if (panelCursorIndex < 0 || panelCursorIndex >= orderedPanels.length) {
      const currentlyEnabledIndex = orderedPanels.findIndex((panel) => panel.enabled === true);
      panelCursorIndex = currentlyEnabledIndex >= 0 ? currentlyEnabledIndex : 0;
    } else {
      panelCursorIndex = (panelCursorIndex + direction + orderedPanels.length) % orderedPanels.length;
    }

    const targetPanel = orderedPanels[panelCursorIndex];
    orderedPanels.forEach((panel) => {
      runtime.panelRegistry.setPanelEnabled(panel.id, panel.id === targetPanel.id);
    });
    runtime.showOverlay();

    const label = direction > 0 ? "panel.next" : "panel.previous";
    lastCommandBinding = `${label} -> ${targetPanel.id}`;
    lastCommandExecution = {
      status: "ready",
      output: {
        lines: [`panel=${targetPanel.id}`, `title=${targetPanel.title}`]
      },
      reports: []
    };
    return targetPanel;
  }

  function update(frame = {}) {
    const engine = frame.engine || {};
    const input = engine.input || null;

    const diagnosticsContext = isObject(frame.diagnosticsContext) ? frame.diagnosticsContext : {};
    const diagnosticsResult = runtime.collectDiagnostics(diagnosticsContext);
    diagnosticsSnapshot = diagnosticsResult?.diagnostics || null;
    diagnosticsReports = Array.isArray(diagnosticsResult?.reports) ? diagnosticsResult.reports.slice() : [];

    if (getComboEdgePress(input, comboBindings.toggleOverlay, keyEdgeState)) {
      const state = runtime.getState();
      if (state.overlayVisible) {
        runtime.hideOverlay();
      } else {
        runtime.showOverlay();
      }
    }

    if (getComboEdgePress(input, comboBindings.toggleConsole, keyEdgeState)) {
      const state = runtime.getState();
      if (state.consoleVisible) {
        runtime.hideConsole();
      } else {
        runtime.showConsole();
      }
    }

    if (getComboEdgePress(input, comboBindings.reload, keyEdgeState)) {
      const runtimeContext = buildCommandContext(diagnosticsSnapshot || {});
      executeCommand("scene.reload", runtimeContext);
      runtime.applyHotReload({
        status: "ready",
        mode: "targeted",
        runtimeState: toContextSection(diagnosticsSnapshot, "runtime")
      });
    }

    if (getComboEdgePress(input, comboBindings.nextPanel, keyEdgeState)) {
      cyclePanel(1);
    }

    if (getComboEdgePress(input, comboBindings.previousPanel, keyEdgeState)) {
      cyclePanel(-1);
    }

    return {
      diagnosticsResult,
      runtimeState: runtime.getState()
    };
  }

  function render(renderer, optionsOverride = {}) {
    if (!renderer || typeof renderer.getCanvasSize !== "function") {
      return {
        status: "failed",
        reports: [{ code: "INVALID_RENDERER", message: "Renderer unavailable for dev console integration render." }]
      };
    }

    const canvas = renderer.getCanvasSize();
    const worldStages = Array.isArray(optionsOverride?.worldStages)
      ? optionsOverride.worldStages
      : DEFAULT_WORLD_STAGES;
    const renderOrder = runtime.getDeterministicRenderOrder(worldStages);

    overlayRender = runtime.renderOverlay(diagnosticsSnapshot || {});

    const overlayX = Number.isFinite(optionsOverride?.overlayX) ? optionsOverride.overlayX : 24;
    const overlayY = Number.isFinite(optionsOverride?.overlayY) ? optionsOverride.overlayY : Math.max(220, canvas.height - 210);
    const overlayWidth = Number.isFinite(optionsOverride?.overlayWidth) ? optionsOverride.overlayWidth : Math.min(560, canvas.width - 48);
    const overlayHeight = Number.isFinite(optionsOverride?.overlayHeight) ? optionsOverride.overlayHeight : 186;

    if (overlayRender.status === "ready") {
      const overlayLines = flattenOverlaySections(overlayRender.sections, 9);
      overlayLines.push(`order: ${renderOrder.slice(-2).join(" -> ")}`);
      drawPanel(renderer, overlayX, overlayY, overlayWidth, overlayHeight, "Debug Overlay (Ctrl+Shift+`)", overlayLines.slice(0, 10));
    }

    const state = runtime.getState();
    if (state.consoleVisible) {
      const consoleX = Number.isFinite(optionsOverride?.consoleX) ? optionsOverride.consoleX : overlayX;
      const consoleY = Number.isFinite(optionsOverride?.consoleY) ? optionsOverride.consoleY : 94;
      const consoleWidth = Number.isFinite(optionsOverride?.consoleWidth) ? optionsOverride.consoleWidth : overlayWidth;
      const consoleHeight = Number.isFinite(optionsOverride?.consoleHeight) ? optionsOverride.consoleHeight : 214;

      const outputLines = Array.isArray(lastCommandExecution?.output?.lines)
        ? lastCommandExecution.output.lines.map((line) => sanitizeText(line)).filter(Boolean)
        : ["No command output yet."];

      const commandHint = [
        "Shift+`=console",
        "Ctrl+Shift+`=overlay",
        "Ctrl+Shift+R=reload",
        "Ctrl+Shift+]=next panel",
        "Ctrl+Shift+[=prev panel"
      ].join(" | ");

      const lines = [
        `last: ${lastCommandBinding || "none"}`,
        `status: ${sanitizeText(lastCommandExecution?.status) || "idle"}`,
        `history: ${state.commandHistory.length}`,
        commandHint || "No command hotkeys configured.",
        ...outputLines.slice(0, 5)
      ];

      drawPanel(renderer, consoleX, consoleY, consoleWidth, consoleHeight, "Dev Console (Shift+`)", lines.slice(0, 9));
    }

    return {
      status: "ready",
      overlayRender,
      renderOrder
    };
  }

  return {
    update,
    render,
    executeCommand,
    dispose() {
      return runtime.dispose();
    },
    getRuntime() {
      return runtime;
    },
    getState() {
      return {
        ...runtime.getState(),
        diagnosticsSnapshot,
        diagnosticsReports: diagnosticsReports.slice(),
        overlayRender,
        lastCommandExecution,
        lastCommandBinding,
        toggleCombos: cloneJson(comboBindings)
      };
    }
  };
}

export function summarizeSampleGameDevConsoleIntegration(integration) {
  if (!integration || typeof integration.getState !== "function") {
    return "Sample dev console integration unavailable.";
  }

  const state = integration.getState();
  const diagnosticsErrors = Array.isArray(state?.diagnosticsSnapshot?.errors) ? state.diagnosticsSnapshot.errors.length : 0;
  return `Sample dev console integration ready (console=${state.consoleVisible}, overlay=${state.overlayVisible}, commands=${state.commandCount}, diagnosticsErrors=${diagnosticsErrors}).`;
}
