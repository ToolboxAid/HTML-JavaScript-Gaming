const DEFAULT_GRID_SIZE = 16;
const SUPPORTED_GRID_SIZES = Object.freeze([16, 32]);

function gridLabel(size) {
  return `Sprite Creator ${size} by ${size} pixel canvas`;
}

function buttonForSize(size) {
  return document.querySelector(`[data-sprites-grid-size="${size}"]`);
}

function setGridSize(size) {
  const grid = document.querySelector("[data-sprites-pixel-grid]");
  const status = document.querySelector("[data-sprites-grid-status]");
  if (!grid || !SUPPORTED_GRID_SIZES.includes(size)) {
    return;
  }

  grid.replaceChildren();
  grid.dataset.spritesGridSize = String(size);
  grid.setAttribute("aria-label", gridLabel(size));

  for (let index = 0; index < size * size; index += 1) {
    const row = Math.floor(index / size) + 1;
    const column = (index % size) + 1;
    const cell = document.createElement("button");
    cell.className = "sprite-canvas-cell";
    cell.type = "button";
    cell.disabled = true;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `Pixel row ${row}, column ${column}`);
    cell.dataset.spritePixelRow = String(row);
    cell.dataset.spritePixelColumn = String(column);
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

wireGridControls();
setGridSize(DEFAULT_GRID_SIZE);
