const DEFAULT_GRID_SIZE = 16;
const SUPPORTED_GRID_SIZES = Object.freeze([16, 32]);
const DRAWING_TOOLS = Object.freeze(["pencil", "eraser", "fill"]);

const editorState = {
  activeTool: "pencil",
  gridSize: DEFAULT_GRID_SIZE,
  paintedPixels: new Set(),
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

function updateDraftStatus() {
  const status = document.querySelector("[data-sprites-draft-status]");
  if (status) {
    status.textContent = draftStatusText();
  }
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
  } else {
    editorState.paintedPixels.add(key);
    cell.classList.add("is-painted");
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
    editorState.paintedPixels.add(key);
    cell.classList.add("is-painted");
  });
  updateDraftStatus();
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

wireGridControls();
wireDrawingTools();
setGridSize(DEFAULT_GRID_SIZE);
setActiveTool(editorState.activeTool);
