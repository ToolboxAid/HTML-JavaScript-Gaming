const DEFAULT_GRID_SIZE = 16;
const SUPPORTED_GRID_SIZES = Object.freeze([16, 32]);
const SUPPORTED_ZOOM_LEVELS = Object.freeze([1, 2, 4]);
const SHAPE_TOOLS = Object.freeze(["line", "rectangle", "circle"]);
const EDITOR_TOOLS = Object.freeze(["pencil", "eraser", "fill", "picker", "zoom", ...SHAPE_TOOLS]);
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
  shapeAnchor: null,
  zoomLevel: 1,
};
const editorHistory = {
  redoStack: [],
  undoStack: [],
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

function cellCoordinates(cell) {
  return {
    column: Number(cell.dataset.spritePixelColumn),
    row: Number(cell.dataset.spritePixelRow),
  };
}

function isInsideGrid(row, column) {
  return row >= 1 && row <= editorState.gridSize && column >= 1 && column <= editorState.gridSize;
}

function stateSnapshot() {
  return {
    gridSize: editorState.gridSize,
    paintedPixels: Array.from(editorState.paintedPixels.entries()),
  };
}

function sameSnapshot(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function pushUndoSnapshot() {
  const snapshot = stateSnapshot();
  const lastSnapshot = editorHistory.undoStack[editorHistory.undoStack.length - 1];
  if (!lastSnapshot || !sameSnapshot(snapshot, lastSnapshot)) {
    editorHistory.undoStack.push(snapshot);
  }
  editorHistory.redoStack = [];
  updateHistoryControls();
}

function historyStatusText() {
  if (editorHistory.undoStack.length === 0 && editorHistory.redoStack.length === 0) {
    return "Undo history is empty.";
  }
  return `Undo steps: ${editorHistory.undoStack.length}. Redo steps: ${editorHistory.redoStack.length}.`;
}

function updateHistoryControls() {
  const undoButton = document.querySelector("[data-sprites-undo]");
  const redoButton = document.querySelector("[data-sprites-redo]");
  const status = document.querySelector("[data-sprites-history-status]");
  if (undoButton) {
    undoButton.disabled = editorHistory.undoStack.length === 0;
  }
  if (redoButton) {
    redoButton.disabled = editorHistory.redoStack.length === 0;
  }
  if (status) {
    status.textContent = historyStatusText();
  }
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

function colorLabel(colorKey) {
  const normalizedColorKey = normalizeColorKey(colorKey);
  return `${normalizedColorKey[0].toUpperCase()}${normalizedColorKey.slice(1)}`;
}

function normalizeZoomLevel(zoomLevel) {
  const value = Number(zoomLevel);
  return SUPPORTED_ZOOM_LEVELS.includes(value) ? value : 1;
}

function clearCellColor(cell) {
  cell.classList.remove("is-painted");
  cell.classList.remove(...EDITOR_COLOR_KEYS.map((colorKey) => `sprite-canvas-cell--${colorKey}`));
  delete cell.dataset.spriteColorKey;
}

function setCellColor(cell, colorKey) {
  const normalizedColorKey = normalizeColorKey(colorKey);
  clearCellColor(cell);
  cell.classList.add("is-painted", `sprite-canvas-cell--${normalizedColorKey}`);
  cell.dataset.spriteColorKey = normalizedColorKey;
}

function applyPaintedPixelsToGrid() {
  const grid = document.querySelector("[data-sprites-pixel-grid]");
  if (!grid) {
    return;
  }
  grid.querySelectorAll("[data-sprite-pixel-row]").forEach((cell) => {
    const key = pixelKey(cell.dataset.spritePixelRow, cell.dataset.spritePixelColumn);
    const colorKey = editorState.paintedPixels.get(key);
    if (colorKey) {
      setCellColor(cell, colorKey);
    } else {
      clearCellColor(cell);
    }
  });
}

function applySnapshot(snapshot) {
  setGridSize(snapshot.gridSize, { recordHistory: false });
  editorState.paintedPixels = new Map(snapshot.paintedPixels);
  editorState.shapeAnchor = null;
  applyPaintedPixelsToGrid();
  updateDraftStatus();
  updateHistoryControls();
}

function updateDraftStatus() {
  applyPaintedPixelsToGrid();
  const status = document.querySelector("[data-sprites-draft-status]");
  if (status) {
    status.textContent = draftStatusText();
  }
  renderPreview();
}

function updatePaletteStatus() {
  const status = document.querySelector("[data-sprites-palette-status]");
  if (status) {
    status.textContent = `Active editor color: ${colorLabel(editorState.activeColor)}. Palette/Colors remains the reusable color source for future saved sprite records.`;
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
  if (!EDITOR_TOOLS.includes(toolName)) {
    return;
  }
  editorState.activeTool = toolName;
  editorState.shapeAnchor = null;
  document.querySelectorAll("[data-sprite-tool-button]").forEach((button) => {
    const isActive = button.dataset.spriteToolButton === toolName;
    button.classList.toggle("primary", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  const status = document.querySelector("[data-sprites-tool-status]");
  if (status) {
    if (SHAPE_TOOLS.includes(toolName)) {
      status.textContent = `${toolName[0].toUpperCase()}${toolName.slice(1)} is active. Choose a start pixel, then an end pixel. Drawing stays in unsaved editor state for this page session only.`;
    } else {
      status.textContent = `${toolName[0].toUpperCase()}${toolName.slice(1)} is active. Drawing stays in unsaved editor state for this page session only.`;
    }
  }
}

function setZoomLevel(zoomLevel) {
  const normalizedZoomLevel = normalizeZoomLevel(zoomLevel);
  const shell = document.querySelector("[data-sprites-grid-shell]");
  const status = document.querySelector("[data-sprites-zoom-status]");
  editorState.zoomLevel = normalizedZoomLevel;

  if (shell) {
    shell.dataset.spritesZoomLevel = String(normalizedZoomLevel);
  }

  document.querySelectorAll("[data-sprites-zoom-level]").forEach((button) => {
    const isActive = button.dataset.spritesZoomLevel === String(normalizedZoomLevel);
    button.classList.toggle("primary", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (status) {
    status.textContent = `Canvas zoom display: ${normalizedZoomLevel * 100}%.`;
  }
  applyPaintedPixelsToGrid();
  renderPreview();
}

function pickCellColor(cell) {
  const colorKey = cell.dataset.spriteColorKey;
  const status = document.querySelector("[data-sprites-tool-status]");
  if (!colorKey) {
    if (status) {
      status.textContent = "Picker found an empty pixel. Active color was not changed.";
    }
    return;
  }
  setActiveColor(colorKey);
  if (status) {
    status.textContent = `Picker selected ${colorLabel(colorKey)} from the unsaved editor canvas.`;
  }
  applyPaintedPixelsToGrid();
  renderPreview();
}

function setPixel(row, column, colorKey) {
  if (!isInsideGrid(row, column)) {
    return;
  }
  const key = pixelKey(row, column);
  const normalizedColorKey = normalizeColorKey(colorKey);
  const cell = document.querySelector(`[data-sprite-pixel-row="${row}"][data-sprite-pixel-column="${column}"]`);
  editorState.paintedPixels.set(key, normalizedColorKey);
  if (cell) {
    setCellColor(cell, normalizedColorKey);
  }
}

function drawLine(start, end) {
  let row = start.row;
  let column = start.column;
  const rowStep = Math.sign(end.row - start.row);
  const columnStep = Math.sign(end.column - start.column);
  const rowDistance = Math.abs(end.row - start.row);
  const columnDistance = Math.abs(end.column - start.column);
  let error = columnDistance - rowDistance;

  while (true) {
    setPixel(row, column, editorState.activeColor);
    if (row === end.row && column === end.column) {
      break;
    }
    const doubledError = error * 2;
    if (doubledError > -rowDistance) {
      error -= rowDistance;
      column += columnStep;
    }
    if (doubledError < columnDistance) {
      error += columnDistance;
      row += rowStep;
    }
  }
}

function drawRectangle(start, end) {
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minColumn = Math.min(start.column, end.column);
  const maxColumn = Math.max(start.column, end.column);
  for (let column = minColumn; column <= maxColumn; column += 1) {
    setPixel(minRow, column, editorState.activeColor);
    setPixel(maxRow, column, editorState.activeColor);
  }
  for (let row = minRow; row <= maxRow; row += 1) {
    setPixel(row, minColumn, editorState.activeColor);
    setPixel(row, maxColumn, editorState.activeColor);
  }
}

function drawCircle(start, end) {
  const radius = Math.max(Math.abs(end.row - start.row), Math.abs(end.column - start.column));
  if (radius === 0) {
    setPixel(start.row, start.column, editorState.activeColor);
    return;
  }
  for (let rowOffset = -radius; rowOffset <= radius; rowOffset += 1) {
    for (let columnOffset = -radius; columnOffset <= radius; columnOffset += 1) {
      const distance = Math.sqrt(rowOffset * rowOffset + columnOffset * columnOffset);
      if (Math.abs(distance - radius) <= 0.6) {
        setPixel(start.row + rowOffset, start.column + columnOffset, editorState.activeColor);
      }
    }
  }
}

function drawShape(start, end, toolName) {
  if (toolName === "line") {
    drawLine(start, end);
  } else if (toolName === "rectangle") {
    drawRectangle(start, end);
  } else if (toolName === "circle") {
    drawCircle(start, end);
  }
}

function useShapeTool(cell) {
  const coordinates = cellCoordinates(cell);
  const status = document.querySelector("[data-sprites-tool-status]");
  if (!Number.isFinite(coordinates.row) || !Number.isFinite(coordinates.column)) {
    return;
  }
  if (!editorState.shapeAnchor || editorState.shapeAnchor.toolName !== editorState.activeTool) {
    editorState.shapeAnchor = { ...coordinates, toolName: editorState.activeTool };
    if (status) {
      status.textContent = `${editorState.activeTool[0].toUpperCase()}${editorState.activeTool.slice(1)} start selected at row ${coordinates.row}, column ${coordinates.column}. Choose an end pixel.`;
    }
    return;
  }

  pushUndoSnapshot();
  drawShape(editorState.shapeAnchor, coordinates, editorState.activeTool);
  if (status) {
    status.textContent = `${editorState.activeTool[0].toUpperCase()}${editorState.activeTool.slice(1)} added to the unsaved editor draft.`;
  }
  editorState.shapeAnchor = null;
  updateDraftStatus();
}

function paintCell(cell) {
  const key = pixelKey(cell.dataset.spritePixelRow, cell.dataset.spritePixelColumn);
  if (editorState.activeTool === "picker") {
    pickCellColor(cell);
    return;
  }
  if (editorState.activeTool === "zoom") {
    return;
  }
  if (SHAPE_TOOLS.includes(editorState.activeTool)) {
    useShapeTool(cell);
    return;
  }
  if (editorState.activeTool === "eraser") {
    if (!editorState.paintedPixels.has(key)) {
      return;
    }
    pushUndoSnapshot();
    editorState.paintedPixels.delete(key);
    clearCellColor(cell);
  } else {
    if (editorState.paintedPixels.get(key) === editorState.activeColor) {
      return;
    }
    pushUndoSnapshot();
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
  editorState.shapeAnchor = null;
  pushUndoSnapshot();
  editorState.paintedPixels.clear();
  grid.querySelectorAll("[data-sprite-pixel-row]").forEach((cell) => {
    const key = pixelKey(cell.dataset.spritePixelRow, cell.dataset.spritePixelColumn);
    editorState.paintedPixels.set(key, editorState.activeColor);
    setCellColor(cell, editorState.activeColor);
  });
  updateDraftStatus();
}

function clearCanvas(options = {}) {
  const grid = document.querySelector("[data-sprites-pixel-grid]");
  editorState.shapeAnchor = null;
  if (options.recordHistory !== false && editorState.paintedPixels.size > 0) {
    pushUndoSnapshot();
  }
  editorState.paintedPixels.clear();
  if (grid) {
    grid.querySelectorAll("[data-sprite-pixel-row]").forEach(clearCellColor);
  }
  updateDraftStatus();
}

function resetGridToDefault() {
  pushUndoSnapshot();
  setGridSize(DEFAULT_GRID_SIZE, { recordHistory: false });
  clearCanvas({ recordHistory: false });
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

function setGridSize(size, options = {}) {
  const grid = document.querySelector("[data-sprites-pixel-grid]");
  const status = document.querySelector("[data-sprites-grid-status]");
  if (!grid || !SUPPORTED_GRID_SIZES.includes(size)) {
    return;
  }

  if (options.recordHistory && (editorState.gridSize !== size || editorState.paintedPixels.size > 0)) {
    pushUndoSnapshot();
  }

  grid.replaceChildren();
  editorState.gridSize = size;
  editorState.paintedPixels.clear();
  editorState.shapeAnchor = null;
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
    button.addEventListener("click", () => setGridSize(size, { recordHistory: true }));
  });
}

function wireDrawingTools() {
  document.querySelectorAll("[data-sprite-tool-button]").forEach((button) => {
    const toolName = button.dataset.spriteToolButton;
    if (!EDITOR_TOOLS.includes(toolName) || button.disabled) {
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

function wireZoomControls() {
  document.querySelectorAll("[data-sprites-zoom-level]").forEach((button) => {
    button.addEventListener("click", () => setZoomLevel(button.dataset.spritesZoomLevel));
  });
}

function wirePaletteButtons() {
  document.querySelectorAll("[data-sprite-color-button]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveColor(button.dataset.spriteColorButton);
    });
  });
}

function wireCanvasActions() {
  const clearButton = document.querySelector("[data-sprites-clear-canvas]");
  if (clearButton) {
    clearButton.addEventListener("click", clearCanvas);
  }

  const resetButton = document.querySelector("[data-sprites-reset-grid]");
  if (resetButton) {
    resetButton.addEventListener("click", resetGridToDefault);
  }
}

function wireHistoryActions() {
  const undoButton = document.querySelector("[data-sprites-undo]");
  if (undoButton) {
    undoButton.addEventListener("click", () => {
      const snapshot = editorHistory.undoStack.pop();
      if (!snapshot) {
        updateHistoryControls();
        return;
      }
      editorHistory.redoStack.push(stateSnapshot());
      applySnapshot(snapshot);
    });
  }

  const redoButton = document.querySelector("[data-sprites-redo]");
  if (redoButton) {
    redoButton.addEventListener("click", () => {
      const snapshot = editorHistory.redoStack.pop();
      if (!snapshot) {
        updateHistoryControls();
        return;
      }
      editorHistory.undoStack.push(stateSnapshot());
      applySnapshot(snapshot);
    });
  }
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
wireCanvasActions();
wireHistoryActions();
wireZoomControls();
wireExportButton();
setGridSize(DEFAULT_GRID_SIZE);
setActiveTool(editorState.activeTool);
setActiveColor(editorState.activeColor);
setZoomLevel(editorState.zoomLevel);
updateHistoryControls();
renderPreview();
