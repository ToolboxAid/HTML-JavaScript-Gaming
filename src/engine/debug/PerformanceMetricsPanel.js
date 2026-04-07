/*
Toolbox Aid
David Quesenberry
03/22/2026
PerformanceMetricsPanel.js
*/
import { drawPanel } from './DebugPanel.js';

export function drawPerformanceMetricsPanel(renderer, metrics, {
  x = 620,
  y = 34,
  width = 300,
  height = 146,
  title = 'Performance Metrics',
} = {}) {
  const snapshot = typeof metrics?.getSnapshot === 'function' ? metrics.getSnapshot() : {};

  drawPanel(renderer, x, y, width, height, title, [
    `FPS: ${(snapshot.fps ?? 0).toFixed(1)}`,
    `Frame ms: ${(snapshot.frameMs ?? 0).toFixed(2)}`,
    `Update ms: ${(snapshot.updateMs ?? 0).toFixed(2)}`,
    `Render ms: ${(snapshot.renderMs ?? 0).toFixed(2)}`,
    `Fixed updates: ${snapshot.fixedUpdates ?? 0}`,
  ]);
}
