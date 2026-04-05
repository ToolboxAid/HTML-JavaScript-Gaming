/*
Toolbox Aid
David Quesenberry
04/05/2026
devConsoleIntegration.js
*/
import { drawCanvasDebugHud } from "./canvasDebugHudRenderer.js";
import { createDevConsoleCommandRegistry } from "./devConsoleCommandRegistry.js";
import { drawInteractiveDevConsole } from "./interactiveDevConsoleRenderer.js";
import { createDebugCommandPack } from "./commandPacks/debugCommandPack.js";
import { createEntityCommandPack } from "./commandPacks/entityCommandPack.js";
import { createHotReloadCommandPack } from "./commandPacks/hotReloadCommandPack.js";
import { createInputCommandPack } from "./commandPacks/inputCommandPack.js";
import { createRenderCommandPack } from "./commandPacks/renderCommandPack.js";
import { createSceneCommandPack } from "./commandPacks/sceneCommandPack.js";
import { createValidationCommandPack } from "./commandPacks/validationCommandPack.js";
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

const MAX_CONSOLE_INPUT_CHARS = 120;
const MAX_CONSOLE_OUTPUT_LINES = 60;
const MAX_CONSOLE_COMMAND_HISTORY = 120;

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

function getKeyboardEventTarget() {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return null;
  }
  return window;
}

function isPrintableCharacter(key) {
  if (typeof key !== "string" || key.length !== 1) {
    return false;
  }
  const code = key.charCodeAt(0);
  return code >= 32 && code <= 126;
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
  let consoleInputBuffer = "";
  let consoleCursorIndex = 0;
  let consoleHistoryCursor = -1;
  let consoleOutputHistory = [];
  let consoleScrollOffset = 0;
  let consoleTypingMode = true;
  let consoleCommandHistory = [];
  const keyboardEventTarget = getKeyboardEventTarget();
  const commandRegistry = createDevConsoleCommandRegistry({
    packs: [
      createSceneCommandPack(),
      createRenderCommandPack(),
      createEntityCommandPack(),
      createDebugCommandPack(),
      createInputCommandPack(),
      createHotReloadCommandPack(),
      createValidationCommandPack()
    ]
  });

  function resetConsoleUiState() {
    consoleInputBuffer = "";
    consoleCursorIndex = 0;
    consoleHistoryCursor = -1;
    consoleOutputHistory = [];
    consoleScrollOffset = 0;
    consoleTypingMode = true;
  }

  function normalizeRuntimeDelegationResult(commandName, execution) {
    const outputLines = Array.isArray(execution?.output?.lines)
      ? execution.output.lines.map((line) => String(line)).filter(Boolean)
      : [];

    const runtimeCode = sanitizeText(execution?.reports?.[0]?.code)
      || (execution?.status === "ready" ? "RUNTIME_COMMAND_OK" : "RUNTIME_COMMAND_FAILED");

    return {
      status: execution?.status === "ready" ? "ready" : "failed",
      title: `Runtime: ${commandName}`,
      lines: outputLines.length > 0 ? outputLines : [commandName],
      details: {
        runtimeCommand: commandName
      },
      code: runtimeCode
    };
  }

  function executeRuntimeCommand(commandName, context = {}) {
    const execution = runtime.executeConsoleInput(commandName, context);
    return normalizeRuntimeDelegationResult(commandName, execution);
  }

  function buildRegistryCommandContext(baseContext = {}) {
    const normalizedBase = isObject(baseContext)
      ? baseContext
      : buildCommandContext(diagnosticsSnapshot || {});

    return {
      ...normalizedBase,
      consoleRuntime: runtime,
      executeRuntimeCommand,
      resetConsoleUiState
    };
  }

  function pushConsoleOutputLine(value) {
    const line = typeof value === "string" ? value : String(value ?? "");
    if (!line) {
      return;
    }
    consoleOutputHistory.push(line);
    if (consoleOutputHistory.length > MAX_CONSOLE_OUTPUT_LINES) {
      const trimCount = consoleOutputHistory.length - MAX_CONSOLE_OUTPUT_LINES;
      consoleOutputHistory.splice(0, trimCount);
    }
    if (consoleTypingMode) {
      consoleScrollOffset = 0;
    }
  }

  function pushConsoleOutputLines(lines) {
    const source = Array.isArray(lines) ? lines : [];
    source.forEach((line) => pushConsoleOutputLine(line));
  }

  function captureCommandHistory(command) {
    if (!command) {
      return;
    }
    consoleCommandHistory.push(command);
    if (consoleCommandHistory.length > MAX_CONSOLE_COMMAND_HISTORY) {
      const trimCount = consoleCommandHistory.length - MAX_CONSOLE_COMMAND_HISTORY;
      consoleCommandHistory.splice(0, trimCount);
    }
    consoleHistoryCursor = -1;
    consoleScrollOffset = 0;
  }

  function clampConsoleCursor() {
    consoleCursorIndex = Math.max(0, Math.min(consoleCursorIndex, consoleInputBuffer.length));
  }

  function setConsoleInputBuffer(value, moveCursorToEnd = true) {
    consoleInputBuffer = String(value ?? "");
    if (consoleInputBuffer.length > MAX_CONSOLE_INPUT_CHARS) {
      consoleInputBuffer = consoleInputBuffer.slice(0, MAX_CONSOLE_INPUT_CHARS);
    }

    if (moveCursorToEnd) {
      consoleCursorIndex = consoleInputBuffer.length;
    } else {
      clampConsoleCursor();
    }
  }

  function insertConsoleText(text) {
    const chunk = String(text ?? "");
    if (!chunk) {
      return;
    }

    const before = consoleInputBuffer.slice(0, consoleCursorIndex);
    const after = consoleInputBuffer.slice(consoleCursorIndex);
    const next = `${before}${chunk}${after}`;
    setConsoleInputBuffer(next, false);
    consoleCursorIndex = Math.min(before.length + chunk.length, consoleInputBuffer.length);
    clampConsoleCursor();
  }

  function deleteBeforeCursor() {
    if (consoleCursorIndex <= 0) {
      return;
    }
    const before = consoleInputBuffer.slice(0, consoleCursorIndex - 1);
    const after = consoleInputBuffer.slice(consoleCursorIndex);
    setConsoleInputBuffer(`${before}${after}`, false);
    consoleCursorIndex = before.length;
    clampConsoleCursor();
  }

  function deleteAtCursor() {
    if (consoleCursorIndex >= consoleInputBuffer.length) {
      return;
    }
    const before = consoleInputBuffer.slice(0, consoleCursorIndex);
    const after = consoleInputBuffer.slice(consoleCursorIndex + 1);
    setConsoleInputBuffer(`${before}${after}`, false);
    consoleCursorIndex = before.length;
    clampConsoleCursor();
  }

  function scrollConsoleHistory(direction) {
    if (direction === 0) {
      return;
    }
    const maxOffset = Math.max(0, consoleOutputHistory.length - 1);
    consoleScrollOffset = Math.max(0, Math.min(maxOffset, consoleScrollOffset + direction));
  }

  function getConsoleHistoryLines() {
    const source = consoleOutputHistory.length > 0
      ? consoleOutputHistory.slice()
      : [
          "Type a command and press Enter.",
          "Try: help, status, scene.info"
        ];

    if (consoleTypingMode) {
      return source;
    }

    const maxOffset = Math.max(0, source.length - 1);
    const safeOffset = Math.max(0, Math.min(maxOffset, consoleScrollOffset));
    if (safeOffset === 0) {
      return source;
    }
    return source.slice(0, source.length - safeOffset);
  }

  function getConsoleInputDisplay() {
    const before = consoleInputBuffer.slice(0, consoleCursorIndex);
    const after = consoleInputBuffer.slice(consoleCursorIndex);
    return `${before}|${after}`;
  }

  function appendExecutionToConsole(command, execution) {
    if (!command) {
      return;
    }

    pushConsoleOutputLine(`> ${command}`);

    const title = sanitizeText(execution?.title);
    if (title) {
      pushConsoleOutputLine(`[${title}]`);
    }

    const outputLines = Array.isArray(execution?.lines)
      ? execution.lines.map((line) => String(line)).filter(Boolean)
      : Array.isArray(execution?.output?.lines)
        ? execution.output.lines.map((line) => String(line)).filter(Boolean)
        : [];

    if (outputLines.length > 0) {
      pushConsoleOutputLines(outputLines.slice(0, 8));
    } else if (execution?.status === "ready") {
      pushConsoleOutputLine("(ok)");
    }

    if (execution?.status !== "ready") {
      pushConsoleOutputLine("(failed)");
      const code = sanitizeText(execution?.code) || sanitizeText(execution?.reports?.[0]?.code) || "EXECUTION_ERROR";
      if (code) {
        pushConsoleOutputLine(`! ${code}`);
      }
    }
  }

  function submitConsoleInput() {
    const command = sanitizeText(consoleInputBuffer);
    if (!command) {
      return null;
    }
    const commandContext = buildRegistryCommandContext(buildCommandContext(diagnosticsSnapshot || {}));
    const execution = executeCommand(command, commandContext);
    setConsoleInputBuffer("", true);
    consoleTypingMode = true;
    consoleScrollOffset = 0;
    return execution;
  }

  function navigateConsoleHistory(direction) {
    if (consoleCommandHistory.length === 0) {
      return;
    }

    if (consoleHistoryCursor < 0) {
      consoleHistoryCursor = consoleCommandHistory.length;
    }

    consoleHistoryCursor = Math.min(
      consoleCommandHistory.length,
      Math.max(0, consoleHistoryCursor + direction)
    );

    if (consoleHistoryCursor >= consoleCommandHistory.length) {
      setConsoleInputBuffer("", true);
      return;
    }

    setConsoleInputBuffer(consoleCommandHistory[consoleHistoryCursor] || "", true);
    consoleTypingMode = true;
    consoleScrollOffset = 0;
  }

  function onConsoleKeyDown(event) {
    if (!runtime.getState().consoleVisible) {
      return;
    }

    const code = sanitizeText(event?.code);
    const key = typeof event?.key === "string" ? event.key : "";
    const hasControlModifier = event?.ctrlKey === true || event?.metaKey === true || event?.altKey === true;
    const isShiftArrow = event?.shiftKey === true && (code === "ArrowUp" || code === "ArrowDown");

    if (hasControlModifier) {
      return;
    }

    if (code === "Backquote") {
      return;
    }

    if (code === "Enter") {
      consoleTypingMode = true;
      submitConsoleInput();
      event.preventDefault();
      return;
    }

    if (code === "Backspace") {
      consoleTypingMode = true;
      deleteBeforeCursor();
      event.preventDefault();
      return;
    }

    if (code === "Delete") {
      consoleTypingMode = true;
      deleteAtCursor();
      event.preventDefault();
      return;
    }

    if (code === "Escape") {
      if (consoleInputBuffer.length > 0) {
        setConsoleInputBuffer("", true);
        consoleTypingMode = true;
      } else {
        consoleTypingMode = !consoleTypingMode;
      }
      event.preventDefault();
      return;
    }

    if (code === "ArrowLeft") {
      consoleTypingMode = true;
      consoleCursorIndex = Math.max(0, consoleCursorIndex - 1);
      event.preventDefault();
      return;
    }

    if (code === "ArrowRight") {
      consoleTypingMode = true;
      consoleCursorIndex = Math.min(consoleInputBuffer.length, consoleCursorIndex + 1);
      event.preventDefault();
      return;
    }

    if (code === "ArrowUp") {
      if (isShiftArrow) {
        consoleTypingMode = false;
        scrollConsoleHistory(1);
      } else if (consoleTypingMode) {
        navigateConsoleHistory(-1);
      } else {
        scrollConsoleHistory(1);
      }
      event.preventDefault();
      return;
    }

    if (code === "ArrowDown") {
      if (isShiftArrow) {
        consoleTypingMode = false;
        scrollConsoleHistory(-1);
      } else if (consoleTypingMode) {
        navigateConsoleHistory(1);
      } else {
        scrollConsoleHistory(-1);
      }
      event.preventDefault();
      return;
    }

    if (code === "Tab") {
      event.preventDefault();
      return;
    }

    if (!isPrintableCharacter(key) || key === "`" || key === "~") {
      return;
    }

    if (consoleInputBuffer.length >= MAX_CONSOLE_INPUT_CHARS) {
      event.preventDefault();
      return;
    }

    consoleTypingMode = true;
    insertConsoleText(key);
    consoleScrollOffset = 0;
    event.preventDefault();
  }

  if (keyboardEventTarget) {
    keyboardEventTarget.addEventListener("keydown", onConsoleKeyDown);
  }

  function executeCommand(commandText, context = null) {
    const command = sanitizeText(commandText);
    if (!command) {
      return null;
    }

    const commandContext = buildRegistryCommandContext(
      context && isObject(context)
        ? context
        : buildCommandContext(diagnosticsSnapshot || {})
    );

    const execution = commandRegistry.execute(command, commandContext);
    lastCommandExecution = execution;
    lastCommandBinding = command;
    captureCommandHistory(command);
    appendExecutionToConsole(command, execution);
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
      title: "Panel Cycle",
      lines: [`panel=${targetPanel.id}`, `title=${targetPanel.title}`],
      details: {
        panelId: targetPanel.id
      },
      code: "PANEL_CYCLE"
    };
    captureCommandHistory(label);
    appendExecutionToConsole(label, lastCommandExecution);
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
        consoleHistoryCursor = -1;
      } else {
        runtime.showConsole();
        consoleHistoryCursor = -1;
        consoleTypingMode = true;
        consoleScrollOffset = 0;
        clampConsoleCursor();
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
      drawCanvasDebugHud(renderer, [
        {
          x: overlayX,
          y: overlayY,
          width: overlayWidth,
          height: overlayHeight,
          title: "Debug Overlay (Ctrl+Shift+`)",
          lines: overlayLines.slice(0, 10)
        }
      ]);
    }

    const state = runtime.getState();
    if (state.consoleVisible) {
      const consoleX = Number.isFinite(optionsOverride?.consoleX) ? optionsOverride.consoleX : overlayX;
      const consoleY = Number.isFinite(optionsOverride?.consoleY) ? optionsOverride.consoleY : 94;
      const consoleWidth = Number.isFinite(optionsOverride?.consoleWidth) ? optionsOverride.consoleWidth : overlayWidth;
      const consoleHeight = Number.isFinite(optionsOverride?.consoleHeight) ? optionsOverride.consoleHeight : 234;

      const historyLines = getConsoleHistoryLines();

      const commandHint = "Shift+` console | Ctrl+Shift+` overlay | Ctrl+Shift+R reload";
      const inputHint = consoleTypingMode
        ? "Typing: Left/Right cursor | Up/Down history | Shift+Up/Down scroll | Backspace/Delete | Esc mode"
        : "Scroll: Up/Down output | Esc mode";
      const statusHint = `mode: ${consoleTypingMode ? "typing" : "scroll"} | scroll: ${consoleScrollOffset} | last: ${lastCommandBinding || "none"} | status: ${sanitizeText(lastCommandExecution?.status) || "idle"} | history: ${consoleCommandHistory.length}`;

      drawInteractiveDevConsole(renderer, {
        x: consoleX,
        y: consoleY,
        width: consoleWidth,
        height: consoleHeight,
        title: "Dev Console (Shift+`)",
        prompt: ">",
        inputValue: getConsoleInputDisplay(),
        outputLines: historyLines,
        footerLines: [commandHint, inputHint, statusHint],
        caretVisible: Math.floor(Date.now() / 450) % 2 === 0
      });
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
      if (keyboardEventTarget) {
        keyboardEventTarget.removeEventListener("keydown", onConsoleKeyDown);
      }
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
        consoleInputBuffer,
        consoleCursorIndex,
        consoleScrollOffset,
        consoleTypingMode,
        consoleOutputHistory: consoleOutputHistory.slice(),
        consoleCommandHistory: consoleCommandHistory.slice(),
        commandPackCount: commandRegistry.getPackCount(),
        commandRegistryCount: commandRegistry.getCommandCount(),
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
  const commandCount = Number.isFinite(state?.commandRegistryCount) ? state.commandRegistryCount : state.commandCount;
  return `Sample dev console integration ready (console=${state.consoleVisible}, overlay=${state.overlayVisible}, commands=${commandCount}, diagnosticsErrors=${diagnosticsErrors}).`;
}
