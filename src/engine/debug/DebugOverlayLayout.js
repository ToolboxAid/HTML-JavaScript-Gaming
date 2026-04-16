/*
Toolbox Aid
David Quesenberry
04/16/2026
DebugOverlayLayout.js
*/
import { drawPanel } from './DebugPanel.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readCanvasSize(renderer) {
  const canvasSize = renderer?.getCanvasSize?.() || { width: 960, height: 540 };
  return {
    width: Math.max(1, Number(canvasSize.width) || 960),
    height: Math.max(1, Number(canvasSize.height) || 540),
  };
}

function syncStackCanvasSize(stack) {
  if (!stack) {
    return;
  }
  const canvas = readCanvasSize(stack.renderer);
  stack.canvasWidth = canvas.width;
  stack.canvasHeight = canvas.height;
  if (!Number.isFinite(stack.usedHeight) || stack.usedHeight < 0) {
    stack.usedHeight = 0;
  }
}

export function createBottomRightDebugPanelStack(renderer, {
  right = 10,
  bottom = 10,
  spacing = 10,
  minX = 8,
  minY = 8,
} = {}) {
  const canvas = readCanvasSize(renderer);
  return {
    renderer,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    right: Math.max(0, Number(right) || 0),
    bottom: Math.max(0, Number(bottom) || 0),
    spacing: Math.max(0, Number(spacing) || 0),
    minX: Math.max(0, Number(minX) || 0),
    minY: Math.max(0, Number(minY) || 0),
    usedHeight: 0,
  };
}

export function getNextBottomRightDebugPanelRect(stack, width, height) {
  if (!stack) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, Number(width) || 1),
      height: Math.max(1, Number(height) || 1),
    };
  }

  syncStackCanvasSize(stack);
  const panelWidth = Math.max(1, Number(width) || 1);
  const panelHeight = Math.max(1, Number(height) || 1);
  const x = clamp(
    stack.canvasWidth - stack.right - panelWidth,
    stack.minX,
    stack.canvasWidth - panelWidth
  );
  const y = clamp(
    stack.canvasHeight - stack.bottom - stack.usedHeight - panelHeight,
    stack.minY,
    stack.canvasHeight - panelHeight
  );

  stack.usedHeight += panelHeight + stack.spacing;
  return {
    x,
    y,
    width: panelWidth,
    height: panelHeight,
  };
}

export function drawStackedDebugPanel(renderer, stack, width, height, title, lines) {
  const rect = getNextBottomRightDebugPanelRect(stack, width, height);
  drawPanel(renderer, rect.x, rect.y, rect.width, rect.height, title, lines);
  return rect;
}
