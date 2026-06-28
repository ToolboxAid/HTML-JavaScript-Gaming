const DEFAULT_GRID_SIZE = 16;
const SUPPORTED_GRID_SIZES = Object.freeze([16, 32]);
const DRAWING_TOOLS = Object.freeze(["pencil", "eraser", "fill"]);
const EDITOR_COLOR_KEYS = Object.freeze(["ink", "orange", "gold", "green", "blue"]);
const EDITOR_COLOR_CSS_VARIABLES = Object.freeze({
  blue: "--electric-blue",
  gold: "--forge-gold",
  green: "--green",
  ink: "--text",
  orange: "--molten-orange",
});

const editorState = {
  activeTool: "pencil",
  activeColor: "ink",
  gridSize: DEFAULT_GRID_SIZE,
  paintedPixels: new Map(),
};

function gridLabel(size) {
  return `Sprite Creator ${size} by ${size} pixel canvas`;
}

function buttonForSize(size) {
  return document.querySelector(`[data-sprites-grid-size="${size}"]`);
}

function pixelKey(row, column) {
  return `${row}:${column}`;
}

function draftStatusText() {
  const count = editorState.paintedPixels.size;
  if (count === 0) {
    return "Unsaved editor state: empty draft.";
  }
  return `Unsaved editor state: ${count} draft pixel${count === 1 ? "" : "s"} painted.`;
}

function normalizeColorKey(colorKey) {
  return EDITOR_COLOR_KEYS.includes(colorKey) ? colorKey : "ink";
}

function clearCellColor(cell) {
  cell.classList.remove(...EDITOR_COLOR_KEYS.map((colorKey) => `sprite-canvas-cell--${colorKey}`));
  delete cell.dataset.spriteColorKey;
}

function setCellColor(cell, colorKey) {
  const normalizedColorKey = normalizeColorKey(colorKey);
  clearCellColor(cell);
  cell.classList.add("is-painted", `sprite-canvas-cell--${normalizedColorKey}`);
  cell.dataset.spriteColorKey = normalizedColorKey;
}

function updateDraftStatus() {
  const status = document.querySelector("[data-sprites-draft-status]");
  if (status) {
    status.textContent = draftStatusText();
  }
  renderPreview();
}

function updatePaletteStatus() {
  const status = document.querySelector("[data-sprites-palette-status]");
  if (status) {
    status.textContent = `Active editor color: ${editorState.activeColor[0].toUpperCase()}${editorState.activeColor.slice(1)}. Palette/Colors remains the reusable color source for future saved sprite records.`;
  }
}

function setActiveColor(colorKey) {
  const normalizedColorKey = normalizeColorKey(colorKey);
  editorState.activeColor = normalizedColorKey;
  document.querySelectorAll("[data-sprite-color-button]").forEach((button) => {
    const isActive = button.dataset.spriteColorButton === normalizedColorKey;
    button.classList.toggle("primary", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  updatePaletteStatus();
}

function setActiveTool(toolName) {
  if (!DRAWING_TOOLS.includes(toolName)) {
    return;
  }
  editorState.activeTool = toolName;
  document.querySelectorAll("[data-sprite-tool-button]").forEach((button) => {
    const isActive = button.dataset.spriteToolButton === toolName;
    button.classList.toggle("primary", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  const status = document.querySelector("[data-sprites-tool-status]");
  if (status) {
    status.textContent = `${toolName[0].toUpperCase()}${toolName.slice(1)} is active. Drawing stays in unsaved editor state for this page session only.`;
  }
}

function paintCell(cell) {
  const key = pixelKey(cell.dataset.spritePixelRow, cell.dataset.spritePixelColumn);
  if (editorState.activeTool === "eraser") {
    editorState.paintedPixels.delete(key);
    cell.classList.remove("is-painted");
    clearCellColor(cell);
  } else {
    editorState.paintedPixels.set(key, editorState.activeColor);
    setCellColor(cell, editorState.activeColor);
  }
  updateDraftStatus();
}

function fillGrid() {
  const grid = document.querySelector("[data-sprites-pixel-grid]");
  if (!grid) {
    return;
  }
  editorState.paintedPixels.clear();
  grid.querySelectorAll("[data-sprite-pixel-row]").forEach((cell) => {
    const key = pixelKey(cell.dataset.spritePixelRow, cell.dataset.spritePixelColumn);
    editorState.paintedPixels.set(key, editorState.activeColor);
    setCellColor(cell, editorState.activeColor);
  });
  updateDraftStatus();
}

function editorColorValue(colorKey) {
  const variableName = EDITOR_COLOR_CSS_VARIABLES[normalizeColorKey(colorKey)];
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || "#111111";
}

function renderPreview() {
  const canvas = document.querySelector("[data-sprites-preview-canvas]");
  if (!canvas) {
    return;
  }
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const size = editorState.gridSize;
  const cellSize = canvas.width / size;
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const [key, colorKey] of editorState.paintedPixels.entries()) {
    const [rowText, columnText] = key.split(":");
    const row = Number(rowText);
    const column = Number(columnText);
    if (!Number.isFinite(row) || !Number.isFinite(column)) {
      continue;
    }
    context.fillStyle = editorColorValue(colorKey);
    context.fillRect((column - 1) * cellSize, (row - 1) * cellSize, cellSize, cellSize);
  }
}

function exportPreviewPng() {
  const canvas = document.querySelector("[data-sprites-preview-canvas]");
  const status = document.querySelector("[data-sprites-export-status]");
  if (!canvas) {
    return;
  }
  canvas.toBlob((blob) => {
    if (!blob) {
      if (status) {
        status.textContent = "PNG export is unavailable in this browser session.";
      }
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "sprite-creator-draft.png";
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    if (status) {
      status.textContent = "PNG downloaded from unsaved editor draft.";
    }
  }, "image/png");
}

function setGridSize(size) {
  const grid = document.querySelector("[data-sprites-pixel-grid]");
  const status = document.querySelector("[data-sprites-grid-status]");
  if (!grid || !SUPPORTED_GRID_SIZES.includes(size)) {
    return;
  }

  grid.replaceChildren();
  editorState.gridSize = size;
  editorState.paintedPixels.clear();
  grid.dataset.spritesGridSize = String(size);
  grid.setAttribute("aria-label", gridLabel(size));

  for (let index = 0; index < size * size; index += 1) {
    const row = Math.floor(index / size) + 1;
    const column = (index % size) + 1;
    const cell = document.createElement("button");
    cell.className = "sprite-canvas-cell";
    cell.type = "button";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `Pixel row ${row}, column ${column}`);
    cell.dataset.spritePixelRow = String(row);
    cell.dataset.spritePixelColumn = String(column);
    cell.addEventListener("click", () => paintCell(cell));
    grid.append(cell);
  }

  document.querySelectorAll("[data-sprites-grid-size]").forEach((button) => {
    const isActive = button.dataset.spritesGridSize === String(size);
    button.classList.toggle("primary", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (status) {
    status.textContent = `Canvas display mode: ${size}x${size}. No pixel data is saved.`;
  }
  updateDraftStatus();
}

function wireGridControls() {
  SUPPORTED_GRID_SIZES.forEach((size) => {
    const button = buttonForSize(size);
    if (!button) {
      return;
    }
    button.addEventListener("click", () => setGridSize(size));
  });
}

function wireDrawingTools() {
  document.querySelectorAll("[data-sprite-tool-button]").forEach((button) => {
    const toolName = button.dataset.spriteToolButton;
    if (!DRAWING_TOOLS.includes(toolName) || button.disabled) {
      return;
    }
    button.addEventListener("click", () => {
      setActiveTool(toolName);
      if (toolName === "fill") {
        fillGrid();
      }
    });
  });
}

function wirePaletteButtons() {
  document.querySelectorAll("[data-sprite-color-button]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveColor(button.dataset.spriteColorButton);
    });
  });
}

function wireExportButton() {
  const button = document.querySelector("[data-sprites-export-png]");
  if (button) {
    button.addEventListener("click", exportPreviewPng);
  }
}

wireGridControls();
wireDrawingTools();
wirePaletteButtons();
wireExportButton();
setGridSize(DEFAULT_GRID_SIZE);
setActiveTool(editorState.activeTool);
setActiveColor(editorState.activeColor);
renderPreview();
