/*
Toolbox Aid
David Quesenberry
03/22/2026
DebugTools.js
*/
import { drawPanel } from './DebugPanel.js';

export function drawDebugBounds(renderer, rects = [], {
  fill = 'rgba(251, 191, 36, 0.14)',
  stroke = '#fbbf24',
  lineWidth = 2,
  labels = false,
} = {}) {
  rects.forEach((rect) => {
    renderer.drawRect(rect.x, rect.y, rect.width, rect.height, fill);
    renderer.strokeRect(rect.x, rect.y, rect.width, rect.height, stroke, lineWidth);

    if (labels && rect.label) {
      renderer.drawText(rect.label, rect.x + 4, rect.y - 6, {
        color: stroke,
        font: '12px monospace',
      });
    }
  });
}

export function drawDebugOverlay(renderer, {
  title = 'Debug Overlay',
  lines = [],
  bounds = [],
} = {}, panelOptions = {}) {
  drawPanel(
    renderer,
    panelOptions.x ?? 620,
    panelOptions.y ?? 34,
    panelOptions.width ?? 300,
    panelOptions.height ?? 150,
    title,
    lines,
  );

  if (bounds.length > 0) {
    drawDebugBounds(renderer, bounds, panelOptions.boundsOptions ?? {});
  }
}
