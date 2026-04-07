/*
Toolbox Aid
David Quesenberry
03/27/2026
CanvasDialogPrimitives.js
*/
const DEFAULT_MODAL_STYLE = {
  overlayFill: "rgba(2, 6, 12, 0.7)",
  panelFill: "#162435",
  panelStroke: "#4cc9f0"
};

const DEFAULT_BUTTON_STYLE = {
  fillStyle: "#27435a",
  strokeStyle: "#4cc9f0",
  textStyle: "#e6f2ff",
  textOffsetX: 28,
  textOffsetY: 20,
  font: null
};

export function drawCanvasModalFrame(ctx, viewportSize, rect, style = {}) {
  // Callers can pass only the style fields they want to override; 
  // all others fall back to DEFAULT_MODAL_STYLE.
  const {
    overlayFill = DEFAULT_MODAL_STYLE.overlayFill,
    panelFill = DEFAULT_MODAL_STYLE.panelFill,
    panelStroke = DEFAULT_MODAL_STYLE.panelStroke
  } = style;
  ctx.fillStyle = overlayFill;
  ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);
  ctx.fillStyle = panelFill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = panelStroke;
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
}

export function drawCanvasDialogButton(ctx, rect, text, options = {}) {
  // Callers can pass only the option fields they want to override; 
  // all others fall back to DEFAULT_BUTTON_STYLE.
  const {
    fillStyle = DEFAULT_BUTTON_STYLE.fillStyle,
    strokeStyle = DEFAULT_BUTTON_STYLE.strokeStyle,
    textStyle = DEFAULT_BUTTON_STYLE.textStyle,
    textOffsetX = DEFAULT_BUTTON_STYLE.textOffsetX,
    textOffsetY = DEFAULT_BUTTON_STYLE.textOffsetY,
    font = DEFAULT_BUTTON_STYLE.font
  } = options;
  if (font) ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = strokeStyle;
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
  ctx.fillStyle = textStyle;
  ctx.fillText(text, rect.x + textOffsetX, rect.y + textOffsetY);
}

export function drawCanvasCheckerboard(ctx, rect, blockSize) {
  for (let py = 0; py < rect.h; py += blockSize) {
    for (let px = 0; px < rect.w; px += blockSize) {
      ctx.fillStyle = ((Math.floor(px / blockSize) + Math.floor(py / blockSize)) % 2 === 0) ? "#f8fafc" : "#e2e8f0";
      ctx.fillRect(rect.x + px, rect.y + py, blockSize, blockSize);
    }
  }
}

export function drawCanvasPixelPreview(ctx, pixels, rect, options = {}) {
  const {
    cols = Array.isArray(pixels) && pixels[0] ? pixels[0].length : 0,
    rows = Array.isArray(pixels) ? pixels.length : 0,
    backgroundFill = "#fff",
    borderStroke = "rgba(0,0,0,0.2)"
  } = options;
  if (!pixels || !cols || !rows) return;
  const pw = Math.max(1, Math.floor(rect.w / cols));
  const ph = Math.max(1, Math.floor(rect.h / rows));
  ctx.fillStyle = backgroundFill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  for (let py = 0; py < rows; py += 1) {
    for (let px = 0; px < cols; px += 1) {
      const value = pixels[py][px];
      if (!value) continue;
      ctx.fillStyle = value;
      ctx.fillRect(rect.x + px * pw, rect.y + py * ph, pw, ph);
    }
  }
  ctx.strokeStyle = borderStroke;
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
}
