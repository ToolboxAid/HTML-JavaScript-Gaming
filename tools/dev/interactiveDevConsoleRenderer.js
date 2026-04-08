/*
Toolbox Aid
David Quesenberry
04/05/2026
interactiveDevConsoleRenderer.js
*/

import { sanitizeText } from "../../src/engine/debug/inspectors/shared/inspectorUtils.js";

function toLines(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }
  return lines.map((line) => sanitizeText(String(line))).filter(Boolean);
}

function getCanvasContext(renderer) {
  const context = renderer?.ctx;
  if (!context || typeof context.save !== "function" || typeof context.restore !== "function") {
    return null;
  }
  return context;
}

function drawInteractiveConsoleWithCanvasContext(ctx, consoleModel) {
  const x = Number(consoleModel.x) || 0;
  const y = Number(consoleModel.y) || 0;
  const width = Math.max(180, Number(consoleModel.width) || 420);
  const height = Math.max(140, Number(consoleModel.height) || 240);
  const title = sanitizeText(consoleModel.title) || "Dev Console";
  const prompt = sanitizeText(consoleModel.prompt) || ">";
  const inputValue = sanitizeText(consoleModel.inputValue);
  const outputLines = toLines(consoleModel.outputLines);
  const footerLines = toLines(consoleModel.footerLines);
  const caretVisible = consoleModel.caretVisible !== false;

  const palette = {
    fill: sanitizeText(consoleModel.fill) || "rgba(12, 17, 30, 0.95)",
    border: sanitizeText(consoleModel.border) || "#8ea6ff",
    title: sanitizeText(consoleModel.titleColor) || "#ffffff",
    text: sanitizeText(consoleModel.textColor) || "#d9e2ff",
    output: sanitizeText(consoleModel.outputColor) || "#c8d5ff",
    input: sanitizeText(consoleModel.inputColor) || "#ffffff",
    hint: sanitizeText(consoleModel.hintColor) || "#9fb3ff"
  };

  const lineHeight = 18;
  const paddingX = 12;
  const titleHeight = 28;
  const inputHeight = 28;
  const footerHeight = Math.max(lineHeight * footerLines.length, lineHeight);
  const bodyTop = y + titleHeight + 10;
  const bodyBottom = y + height - inputHeight - footerHeight - 14;
  const bodyHeight = Math.max(0, bodyBottom - bodyTop);
  const visibleBodyLines = Math.max(1, Math.floor(bodyHeight / lineHeight));
  const visibleOutputLines = outputLines.slice(Math.max(0, outputLines.length - visibleBodyLines));

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
    ctx.fillText(title, x + paddingX, y + 22);

    ctx.fillStyle = palette.output;
    ctx.font = "14px monospace";
    for (let index = 0; index < visibleOutputLines.length; index += 1) {
      ctx.fillText(visibleOutputLines[index], x + paddingX, bodyTop + 14 + index * lineHeight);
    }

    const footerStartY = y + height - inputHeight - footerHeight;
    ctx.fillStyle = palette.hint;
    for (let index = 0; index < footerLines.length; index += 1) {
      ctx.fillText(footerLines[index], x + paddingX, footerStartY + 14 + index * lineHeight);
    }

    const inputY = y + height - 10;
    const cursor = caretVisible ? "_" : "";
    const inputLine = `${prompt} ${inputValue}${cursor}`;
    ctx.fillStyle = palette.input;
    ctx.fillText(inputLine, x + paddingX, inputY);
  } finally {
    ctx.restore();
  }
}

function drawInteractiveConsoleWithRendererFallback(renderer, consoleModel) {
  if (!renderer || typeof renderer.drawRect !== "function" || typeof renderer.drawText !== "function") {
    return;
  }

  const x = Number(consoleModel.x) || 0;
  const y = Number(consoleModel.y) || 0;
  const width = Math.max(180, Number(consoleModel.width) || 420);
  const height = Math.max(140, Number(consoleModel.height) || 240);
  const title = sanitizeText(consoleModel.title) || "Dev Console";
  const prompt = sanitizeText(consoleModel.prompt) || ">";
  const inputValue = sanitizeText(consoleModel.inputValue);
  const outputLines = toLines(consoleModel.outputLines);
  const footerLines = toLines(consoleModel.footerLines);
  const caretVisible = consoleModel.caretVisible !== false;

  const palette = {
    fill: sanitizeText(consoleModel.fill) || "rgba(12, 17, 30, 0.95)",
    border: sanitizeText(consoleModel.border) || "#8ea6ff",
    title: sanitizeText(consoleModel.titleColor) || "#ffffff",
    text: sanitizeText(consoleModel.textColor) || "#d9e2ff",
    output: sanitizeText(consoleModel.outputColor) || "#c8d5ff",
    input: sanitizeText(consoleModel.inputColor) || "#ffffff",
    hint: sanitizeText(consoleModel.hintColor) || "#9fb3ff"
  };

  const lineHeight = 18;
  const paddingX = 12;
  const titleHeight = 28;
  const inputHeight = 28;
  const footerHeight = Math.max(lineHeight * footerLines.length, lineHeight);
  const bodyTop = y + titleHeight + 10;
  const bodyBottom = y + height - inputHeight - footerHeight - 14;
  const bodyHeight = Math.max(0, bodyBottom - bodyTop);
  const visibleBodyLines = Math.max(1, Math.floor(bodyHeight / lineHeight));
  const visibleOutputLines = outputLines.slice(Math.max(0, outputLines.length - visibleBodyLines));

  renderer.drawRect(x, y, width, height, palette.fill);
  if (typeof renderer.strokeRect === "function") {
    renderer.strokeRect(x, y, width, height, palette.border, 2);
  }

  renderer.drawText(title, x + paddingX, y + 22, {
    color: palette.title,
    font: "16px monospace"
  });

  for (let index = 0; index < visibleOutputLines.length; index += 1) {
    renderer.drawText(visibleOutputLines[index], x + paddingX, bodyTop + 14 + index * lineHeight, {
      color: palette.output,
      font: "14px monospace"
    });
  }

  const footerStartY = y + height - inputHeight - footerHeight;
  for (let index = 0; index < footerLines.length; index += 1) {
    renderer.drawText(footerLines[index], x + paddingX, footerStartY + 14 + index * lineHeight, {
      color: palette.hint,
      font: "14px monospace"
    });
  }

  const cursor = caretVisible ? "_" : "";
  renderer.drawText(`${prompt} ${inputValue}${cursor}`, x + paddingX, y + height - 10, {
    color: palette.input,
    font: "14px monospace"
  });
}

export function drawInteractiveDevConsole(renderer, consoleModel = {}) {
  const context = getCanvasContext(renderer);
  if (context) {
    drawInteractiveConsoleWithCanvasContext(context, consoleModel);
    return;
  }

  drawInteractiveConsoleWithRendererFallback(renderer, consoleModel);
}
