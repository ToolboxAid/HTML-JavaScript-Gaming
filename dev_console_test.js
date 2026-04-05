// Simple Dev Console Test
import { createDevConsoleDebugOverlayRuntime } from './tools/shared/devConsoleDebugOverlay.js';

const devRuntime = createDevConsoleDebugOverlayRuntime();

console.log("STATE:", devRuntime.getState());

devRuntime.showConsole();
devRuntime.showOverlay();

const result = devRuntime.executeConsoleInput("help", {
  runtime: { sceneId: "scene.dev", status: "ready" },
  hotReload: { enabled: true },
  validation: { errorCount: 0, warningCount: 0 }
});

console.log("\nCOMMAND OUTPUT:");
console.log(result.output.lines);

const diagnostics = devRuntime.collectDiagnostics({
  runtime: { sceneId: "scene.dev", status: "ready" },
  render: { fps: 60, stages: ["parallax","tilemap","entities"] },
  hotReload: { enabled: true, pending: false },
  validation: { errorCount: 0, warningCount: 0 },
  camera: { x: 0, y: 0, zoom: 1 },
  entities: { count: 5 },
  tilemap: { layerCount: 2 },
  input: { lastKey: null },
  assets: { loaded: 10 }
});

const overlay = devRuntime.renderOverlay(diagnostics.diagnostics);

console.log("\nOVERLAY:");
console.log(overlay.sections.map(s => s.title));
