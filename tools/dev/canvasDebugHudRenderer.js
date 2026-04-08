/*
Toolbox Aid
David Quesenberry
04/05/2026
canvasDebugHudRenderer.js
*/

import { sanitizeText } from "../../src/engine/debug/inspectors/shared/inspectorUtils.js";

function toArrayLines(lines) {
  return Array.isArray(lines)
    ? lines.map((line) => sanitizeText(String(line))).filter(Boolean)
    : [];
}

function getCanvasContext(renderer) {
  const context = renderer?.ctx;
  if (!context || typeof context.save !== "function" || typeof context.restore !== "function") {
    return null;
  }
  return context;
}

function drawPanelWithCanvasContext(ctx, panel) {
  const x = Number(panel.x) || 0;
  const y = Number(panel.y) || 0;
  const width = Math.max(80, Number(panel.width) || 280);
  const height = Math.max(60, Number(panel.height) || 120);
  const title = sanitizeText(panel.title) || "Debug HUD";
  const lines = toArrayLines(panel.lines);

  const palette = {
    fill: sanitizeText(panel.fill) || "rgba(20, 24, 38, 0.92)",
    border: sanitizeText(panel.border) || "#d8d5ff",
    title: sanitizeText(panel.titleColor) || "#ffffff",
    text: sanitizeText(panel.textColor) || "#d0d5ff"
  };

  ctx.save();
  try {
    ctx.fillStyle = palette.fill;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

    ctx.fillStyle = palette.title;
    ctx.font = "16px monospace";
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(title, x + 12, y + 24);

    ctx.fillStyle = palette.text;
    ctx.font = "14px monospace";

    const maxLines = Math.max(0, Math.floor((height - 56) / 20));
    const visibleLines = lines.slice(0, maxLines);
    for (let index = 0; index < visibleLines.length; index += 1) {
      ctx.fillText(visibleLines[index], x + 12, y + 52 + index * 20);
    }
  } finally {
    ctx.restore();
  }
}

function drawPanelWithRendererFallback(renderer, panel) {
  if (!renderer || typeof renderer.drawRect !== "function" || typeof renderer.drawText !== "function") {
    return;
  }

  const x = Number(panel.x) || 0;
  const y = Number(panel.y) || 0;
  const width = Math.max(80, Number(panel.width) || 280);
  const height = Math.max(60, Number(panel.height) || 120);
  const title = sanitizeText(panel.title) || "Debug HUD";
  const lines = toArrayLines(panel.lines);

  const palette = {
    fill: sanitizeText(panel.fill) || "rgba(20, 24, 38, 0.92)",
    border: sanitizeText(panel.border) || "#d8d5ff",
    title: sanitizeText(panel.titleColor) || "#ffffff",
    text: sanitizeText(panel.textColor) || "#d0d5ff"
  };

  renderer.drawRect(x, y, width, height, palette.fill);
  if (typeof renderer.strokeRect === "function") {
    renderer.strokeRect(x, y, width, height, palette.border, 2);
  }
  renderer.drawText(title, x + 12, y + 24, {
    color: palette.title,
    font: "16px monospace"
  });

  const maxLines = Math.max(0, Math.floor((height - 56) / 20));
  const visibleLines = lines.slice(0, maxLines);
  for (let index = 0; index < visibleLines.length; index += 1) {
    renderer.drawText(visibleLines[index], x + 12, y + 52 + index * 20, {
      color: palette.text,
      font: "14px monospace"
    });
  }
}

export function drawCanvasDebugHudPanel(renderer, panel = {}) {
  const context = getCanvasContext(renderer);
  if (context) {
    drawPanelWithCanvasContext(context, panel);
    return;
  }

  drawPanelWithRendererFallback(renderer, panel);
}

export function drawCanvasDebugHud(renderer, panels = []) {
  const safePanels = Array.isArray(panels) ? panels : [];
  for (let index = 0; index < safePanels.length; index += 1) {
    drawCanvasDebugHudPanel(renderer, safePanels[index]);
  }
}
