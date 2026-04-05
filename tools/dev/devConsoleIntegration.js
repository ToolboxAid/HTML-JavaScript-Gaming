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

const DEFAULT_COMMAND_BINDINGS = Object.freeze([
  { key: "F6", command: "help", label: "help" },
  { key: "F7", command: "status", label: "status" },
  { key: "F8", command: "scene.info", label: "scene.info" },
  { key: "F9", command: "unknown.command", label: "invalid" }
]);

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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

  const toggleConsoleKey = sanitizeText(options?.toggleConsoleKey) || "Backquote";
  const toggleOverlayKey = sanitizeText(options?.toggleOverlayKey) || "F3";
  const commandBindings = Array.isArray(options?.commandBindings)
    ? options.commandBindings
    : DEFAULT_COMMAND_BINDINGS;

  let diagnosticsSnapshot = null;
  let diagnosticsReports = [];
  let overlayRender = { status: "hidden", sections: [], reports: [] };
  let lastCommandExecution = null;
  let lastCommandBinding = "";

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

  function update(frame = {}) {
    const engine = frame.engine || {};
    const input = engine.input || null;

    if (getInputEdgePress(input, toggleConsoleKey, keyEdgeState)) {
      const state = runtime.getState();
      if (state.consoleVisible) {
        runtime.hideConsole();
      } else {
        runtime.showConsole();
      }
    }

    if (getInputEdgePress(input, toggleOverlayKey, keyEdgeState)) {
      const state = runtime.getState();
      if (state.overlayVisible) {
        runtime.hideOverlay();
      } else {
        runtime.showOverlay();
      }
    }

    const diagnosticsContext = isObject(frame.diagnosticsContext) ? frame.diagnosticsContext : {};
    const diagnosticsResult = runtime.collectDiagnostics(diagnosticsContext);
    diagnosticsSnapshot = diagnosticsResult?.diagnostics || null;
    diagnosticsReports = Array.isArray(diagnosticsResult?.reports) ? diagnosticsResult.reports.slice() : [];

    const runtimeState = runtime.getState();
    if (runtimeState.consoleVisible) {
      for (let index = 0; index < commandBindings.length; index += 1) {
        const binding = commandBindings[index];
        const key = sanitizeText(binding?.key);
        const command = sanitizeText(binding?.command);
        if (!key || !command) {
          continue;
        }
        if (!getInputEdgePress(input, key, keyEdgeState)) {
          continue;
        }
        executeCommand(command);
      }
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
      drawPanel(renderer, overlayX, overlayY, overlayWidth, overlayHeight, "Debug Overlay (F3)", overlayLines.slice(0, 10));
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

      const commandHint = commandBindings
        .map((binding) => `${sanitizeText(binding?.key)}=${sanitizeText(binding?.label) || sanitizeText(binding?.command)}`)
        .filter(Boolean)
        .join(" | ");

      const lines = [
        `last: ${lastCommandBinding || "none"}`,
        `status: ${sanitizeText(lastCommandExecution?.status) || "idle"}`,
        `history: ${state.commandHistory.length}`,
        commandHint || "No command hotkeys configured.",
        ...outputLines.slice(0, 5)
      ];

      drawPanel(renderer, consoleX, consoleY, consoleWidth, consoleHeight, "Dev Console (`)", lines.slice(0, 9));
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
        toggleKeys: {
          console: toggleConsoleKey,
          overlay: toggleOverlayKey
        }
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
