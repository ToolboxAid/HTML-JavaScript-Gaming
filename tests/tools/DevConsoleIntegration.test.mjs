/*
Toolbox Aid
David Quesenberry
04/05/2026
DevConsoleIntegration.test.mjs
*/
import assert from "node:assert/strict";
import {
  createSampleGameDevConsoleIntegration,
  summarizeSampleGameDevConsoleIntegration
} from "../../tools/dev/devConsoleIntegration.js";

class InputHarness {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
  }

  frame({ down = [], pressed = [] } = {}) {
    this.down = new Set(down);
    this.pressed = new Set(pressed);
  }

  isDown(code) {
    return this.down.has(code);
  }

  isPressed(code) {
    return this.pressed.has(code);
  }
}

class RendererHarness {
  constructor() {
    this.calls = [];
  }

  getCanvasSize() {
    return { width: 960, height: 540 };
  }

  drawRect(x, y, width, height, color) {
    this.calls.push({ fn: "drawRect", x, y, width, height, color });
  }

  strokeRect(x, y, width, height, color, lineWidth) {
    this.calls.push({ fn: "strokeRect", x, y, width, height, color, lineWidth });
  }

  drawText(text, x, y, options) {
    this.calls.push({ fn: "drawText", text: String(text), x, y, options });
  }
}

function buildDiagnostics(sceneId = "demo-1205") {
  return {
    runtime: {
      sceneId,
      status: "running",
      fps: 60,
      frameTimeMs: 16.67
    },
    camera: {
      x: 10,
      y: 20,
      zoom: 1
    },
    entities: {
      count: 8
    },
    tilemap: {
      width: 72,
      height: 18,
      tileSize: 48
    },
    input: {
      left: false,
      right: true,
      jump: false
    },
    hotReload: {
      enabled: false,
      pending: false
    },
    validation: {
      errorCount: 0,
      warningCount: 0
    },
    render: {
      stages: ["parallax", "tilemap", "entities", "sprite-effects", "vector-overlay"]
    },
    assets: {
      parallaxLayers: 3
    }
  };
}

export async function run() {
  const integration = createSampleGameDevConsoleIntegration();
  const input = new InputHarness();
  const engine = { input };
  const renderer = new RendererHarness();

  input.frame();
  integration.update({ engine, diagnosticsContext: buildDiagnostics() });
  let state = integration.getState();
  assert.equal(state.consoleVisible, false);
  assert.equal(state.overlayVisible, true);
  assert.equal(state.commandCount >= 17, true);
  assert.equal(state.panelCount >= 10, true);

  input.frame({ down: ["Backquote", "ShiftLeft"], pressed: ["Backquote"] });
  integration.update({ engine, diagnosticsContext: buildDiagnostics() });
  state = integration.getState();
  assert.equal(state.consoleVisible, true);

  input.frame({ down: ["Backquote", "ShiftLeft"], pressed: [] });
  integration.update({ engine, diagnosticsContext: buildDiagnostics() });
  state = integration.getState();
  assert.equal(state.consoleVisible, true);

  integration.executeCommand("help");
  state = integration.getState();
  assert.equal(state.lastCommandBinding, "help");
  assert.equal(state.lastCommandExecution.status, "ready");

  integration.executeCommand("unknown.command");
  state = integration.getState();
  assert.equal(state.lastCommandBinding, "unknown.command");
  assert.equal(state.lastCommandExecution.status, "failed");

  input.frame({ down: ["Backquote", "ShiftLeft", "ControlLeft"], pressed: ["Backquote"] });
  integration.update({ engine, diagnosticsContext: buildDiagnostics() });
  state = integration.getState();
  assert.equal(state.overlayVisible, false);

  input.frame({ down: ["Backquote", "ShiftLeft", "ControlLeft"], pressed: ["Backquote"] });
  integration.update({ engine, diagnosticsContext: buildDiagnostics() });
  state = integration.getState();
  assert.equal(state.overlayVisible, true);

  const baselineCommandCount = state.commandCount;
  const baselinePanelCount = state.panelCount;
  for (let index = 0; index < 4; index += 1) {
    input.frame({ down: ["Backquote", "ShiftLeft"], pressed: ["Backquote"] });
    integration.update({ engine, diagnosticsContext: buildDiagnostics(`demo-1205-r${index}`) });
    input.frame();
    integration.update({ engine, diagnosticsContext: buildDiagnostics(`demo-1205-r${index}`) });
  }
  state = integration.getState();
  assert.equal(state.commandCount, baselineCommandCount);
  assert.equal(state.panelCount, baselinePanelCount);

  const renderResult = integration.render(renderer, {
    worldStages: ["parallax", "tilemap", "entities", "sprite-effects", "vector-overlay"]
  });
  assert.equal(renderResult.status, "ready");
  assert.deepEqual(renderResult.renderOrder.slice(-2), ["debug-overlay", "dev-console-surface"]);
  assert.equal(
    renderer.calls.some((call) => call.fn === "drawText" && call.text === "Debug Overlay (Ctrl+Shift+`)"),
    true
  );

  if (!integration.getState().consoleVisible) {
    input.frame({ down: ["Backquote", "ShiftLeft"], pressed: ["Backquote"] });
    integration.update({ engine, diagnosticsContext: buildDiagnostics() });
  }
  renderer.calls = [];
  integration.render(renderer, {
    worldStages: ["parallax", "tilemap", "entities", "sprite-effects", "vector-overlay"]
  });
  assert.equal(renderer.calls.some((call) => call.fn === "drawText" && call.text === "Dev Console (Shift+`)"), true);

  const summary = summarizeSampleGameDevConsoleIntegration(integration);
  assert.equal(summary.startsWith("Sample dev console integration ready"), true);

  const dispose = integration.dispose();
  assert.equal(dispose.status, "ready");
  assert.equal(integration.getState().disposed, true);
}
