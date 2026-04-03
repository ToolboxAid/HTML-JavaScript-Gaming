/*
Toolbox Aid
David Quesenberry
04/03/2026
spriteEditorApp.js
*/
import {
  DEFAULT_FPS,
  DEFAULT_HEIGHT,
  DEFAULT_PIXEL_SIZE,
  DEFAULT_WIDTH,
  MAX_RECENT_COLORS,
  TOOL_IDS
} from "./constants.js";
import { colorToPickerValue, dedupeColors, isTransparent, normalizeColor, rgbaToHex, withOpaqueAlpha } from "./colorUtils.js";
import {
  cloneFrame,
  createEmptyFrame,
  createNewProject,
  ensureProjectShape,
  frameIndex,
  resizeProject,
  serializeProject
} from "./projectModel.js";

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }
  return element;
}

function clamp(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create blob from canvas."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Failed to decode PNG image."));
      image.onload = () => resolve(image);
      image.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}

function createCheckerboard(context, width, height, size) {
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const even = ((x / size) + (y / size)) % 2 === 0;
      context.fillStyle = even ? "#314c66" : "#22374d";
      context.fillRect(x, y, size, size);
    }
  }
}

function drawFramePixels(context, frame, width, height, pixelSize, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = frame.pixels[frameIndex(width, x, y)];
      if (!color) {
        continue;
      }
      context.fillStyle = color;
      context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  context.restore();
}

function createImageFromFrame(frame, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Could not acquire 2D context for export.");
  }

  const imageData = context.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = frame.pixels[frameIndex(width, x, y)];
      const offset = frameIndex(width, x, y) * 4;
      if (!color) {
        imageData.data[offset + 3] = 0;
        continue;
      }

      const normalized = normalizeColor(color);
      imageData.data[offset] = Number.parseInt(normalized.slice(1, 3), 16);
      imageData.data[offset + 1] = Number.parseInt(normalized.slice(3, 5), 16);
      imageData.data[offset + 2] = Number.parseInt(normalized.slice(5, 7), 16);
      imageData.data[offset + 3] = Number.parseInt(normalized.slice(7, 9), 16);
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

function createSpriteSheetCanvas(project) {
  const sheetCanvas = document.createElement("canvas");
  sheetCanvas.width = project.width * project.frames.length;
  sheetCanvas.height = project.height;

  const context = sheetCanvas.getContext("2d");
  if (!context) {
    throw new Error("Could not acquire 2D context for sprite sheet export.");
  }

  for (let i = 0; i < project.frames.length; i += 1) {
    const frameCanvas = createImageFromFrame(project.frames[i], project.width, project.height);
    context.drawImage(frameCanvas, i * project.width, 0);
  }

  return sheetCanvas;
}

function pushRecentColor(project, color) {
  const normalized = normalizeColor(color);
  const merged = dedupeColors([normalized, ...project.recentColors]);
  project.recentColors = merged.slice(0, MAX_RECENT_COLORS);
}

function selectColor(project, color) {
  project.activeColor = normalizeColor(color);
  pushRecentColor(project, project.activeColor);
}

function setPixel(frame, width, height, x, y, color) {
  if (x < 0 || y < 0) {
    return false;
  }
  if (x >= width || y >= height) {
    return false;
  }

  const index = frameIndex(width, x, y);
  const nextValue = color ? normalizeColor(color) : null;

  if (frame.pixels[index] === nextValue) {
    return false;
  }

  frame.pixels[index] = nextValue;
  return true;
}

function floodFill(frame, width, height, startX, startY, replacement) {
  const startIndex = frameIndex(width, startX, startY);
  const target = frame.pixels[startIndex] ?? null;
  const nextValue = replacement ? normalizeColor(replacement) : null;
  if (target === nextValue) {
    return false;
  }

  const queue = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) {
      continue;
    }

    const idx = frameIndex(width, x, y);
    if (visited[idx] === 1) {
      continue;
    }
    visited[idx] = 1;

    const value = frame.pixels[idx] ?? null;
    if (value !== target) {
      continue;
    }

    frame.pixels[idx] = nextValue;
    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  return true;
}

function bresenhamLine(x0, y0, x1, y1, drawPoint) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;

  while (true) {
    drawPoint(x, y);
    if (x === x1 && y === y1) {
      break;
    }

    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y += sy;
    }
  }
}

function getCanvasPixelFromEvent(canvas, event, project) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const relativeY = ((event.clientY - rect.top) * canvas.height) / rect.height;

  const x = Math.floor(relativeX / project.pixelSize);
  const y = Math.floor(relativeY / project.pixelSize);

  return {
    x: Math.max(0, Math.min(project.width - 1, x)),
    y: Math.max(0, Math.min(project.height - 1, y))
  };
}

function setStatus(state, message) {
  state.elements.statusText.textContent = message;
}

function updateToolStateText(state) {
  const toolName = state.projectTool[0].toUpperCase() + state.projectTool.slice(1);
  state.elements.toolStateText.textContent = `Tool: ${toolName} | Color: ${state.project.activeColor} | Frame: ${state.project.currentFrameIndex + 1}`;
}

function renderPalette(state) {
  const paletteRoot = state.elements.paletteButtons;
  paletteRoot.textContent = "";

  state.project.palette.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button";
    if (normalizeColor(color) === state.project.activeColor) {
      button.classList.add("active");
    }
    if (isTransparent(color)) {
      button.style.background = "linear-gradient(45deg, #2c445d 25%, #4d6a87 25%, #4d6a87 50%, #2c445d 50%, #2c445d 75%, #4d6a87 75%, #4d6a87 100%)";
      button.style.backgroundSize = "10px 10px";
    } else {
      button.style.background = normalizeColor(color);
    }
    button.title = normalizeColor(color);
    button.addEventListener("click", () => {
      selectColor(state.project, color);
      state.elements.colorPicker.value = colorToPickerValue(state.project.activeColor);
      renderHud(state);
      renderEditor(state);
    });
    paletteRoot.appendChild(button);
  });
}

function renderRecentColors(state) {
  const root = state.elements.recentColorButtons;
  root.textContent = "";

  state.project.recentColors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button";
    if (normalizeColor(color) === state.project.activeColor) {
      button.classList.add("active");
    }
    button.style.background = normalizeColor(color);
    button.title = normalizeColor(color);
    button.addEventListener("click", () => {
      selectColor(state.project, color);
      state.elements.colorPicker.value = colorToPickerValue(state.project.activeColor);
      renderHud(state);
      renderEditor(state);
    });
    root.appendChild(button);
  });
}

function renderToolButtons(state) {
  state.elements.toolButtons.querySelectorAll("[data-tool]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const isActive = button.dataset.tool === state.projectTool;
    button.classList.toggle("active", isActive);
  });
}

function renderHud(state) {
  state.elements.activeColorSwatch.style.background = isTransparent(state.project.activeColor)
    ? "linear-gradient(45deg, #2c445d 25%, #4d6a87 25%, #4d6a87 50%, #2c445d 50%, #2c445d 75%, #4d6a87 75%, #4d6a87 100%)"
    : state.project.activeColor;
  state.elements.activeColorSwatch.style.backgroundSize = "12px 12px";

  state.elements.frameCounter.textContent = `Frame ${state.project.currentFrameIndex + 1} / ${state.project.frames.length}`;
  state.elements.pixelSizeValue.textContent = String(state.project.pixelSize);
  state.elements.fpsValue.textContent = String(state.preview.fps);
  state.elements.colorPicker.value = colorToPickerValue(state.project.activeColor);

  renderToolButtons(state);
  renderPalette(state);
  renderRecentColors(state);
  updateToolStateText(state);
}

function renderEditor(state) {
  const { editorCanvas } = state.elements;
  const project = state.project;
  editorCanvas.width = project.width * project.pixelSize;
  editorCanvas.height = project.height * project.pixelSize;

  const context = editorCanvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, editorCanvas.width, editorCanvas.height);

  if (project.onionSkin && project.frames.length > 1) {
    const prevIndex = (project.currentFrameIndex - 1 + project.frames.length) % project.frames.length;
    drawFramePixels(context, project.frames[prevIndex], project.width, project.height, project.pixelSize, 0.35);
  }

  drawFramePixels(context, project.frames[project.currentFrameIndex], project.width, project.height, project.pixelSize, 1);

  if (project.showGrid && project.pixelSize >= 6) {
    context.strokeStyle = "rgba(181, 221, 255, 0.22)";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 0; x <= project.width; x += 1) {
      const drawX = x * project.pixelSize + 0.5;
      context.moveTo(drawX, 0);
      context.lineTo(drawX, editorCanvas.height);
    }
    for (let y = 0; y <= project.height; y += 1) {
      const drawY = y * project.pixelSize + 0.5;
      context.moveTo(0, drawY);
      context.lineTo(editorCanvas.width, drawY);
    }
    context.stroke();
  }
}

function renderPreview(state) {
  const { previewCanvas } = state.elements;
  const project = state.project;

  const maxTarget = 220;
  const previewScale = Math.max(1, Math.floor(maxTarget / Math.max(project.width, project.height)));
  previewCanvas.width = project.width * previewScale;
  previewCanvas.height = project.height * previewScale;

  const context = previewCanvas.getContext("2d");
  if (!context) {
    return;
  }

  createCheckerboard(context, previewCanvas.width, previewCanvas.height, Math.max(6, Math.floor(previewScale * 1.5)));

  const frameIndexToRender = state.preview.playing
    ? state.preview.frameIndex
    : project.currentFrameIndex;

  drawFramePixels(
    context,
    project.frames[frameIndexToRender],
    project.width,
    project.height,
    previewScale,
    1
  );
}

function renderAll(state) {
  renderHud(state);
  renderEditor(state);
  renderPreview(state);
}

function resetProject(state) {
  const width = clamp(state.elements.canvasWidthInput.value, 1, 256, DEFAULT_WIDTH);
  const height = clamp(state.elements.canvasHeightInput.value, 1, 256, DEFAULT_HEIGHT);

  state.project = createNewProject({
    width,
    height,
    pixelSize: state.project.pixelSize,
    showGrid: state.project.showGrid,
    onionSkin: state.project.onionSkin,
    activeColor: state.project.activeColor,
    palette: state.project.palette
  });

  state.preview.frameIndex = 0;
  setStatus(state, `Created new ${width}x${height} sprite canvas.`);
  renderAll(state);
}

function addFrame(state) {
  const insertAt = state.project.currentFrameIndex + 1;
  const frame = createEmptyFrame(state.project.width, state.project.height);
  state.project.frames.splice(insertAt, 0, frame);
  state.project.currentFrameIndex = insertAt;
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, "Added frame.");
  renderAll(state);
}

function duplicateFrame(state) {
  const current = state.project.frames[state.project.currentFrameIndex];
  const copy = cloneFrame(current);
  const insertAt = state.project.currentFrameIndex + 1;
  state.project.frames.splice(insertAt, 0, copy);
  state.project.currentFrameIndex = insertAt;
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, "Duplicated current frame.");
  renderAll(state);
}

function deleteFrame(state) {
  if (state.project.frames.length === 1) {
    state.project.frames[0] = createEmptyFrame(state.project.width, state.project.height);
    setStatus(state, "Cleared the only frame (at least one frame is required).");
    renderAll(state);
    return;
  }

  state.project.frames.splice(state.project.currentFrameIndex, 1);
  state.project.currentFrameIndex = Math.max(0, Math.min(state.project.currentFrameIndex, state.project.frames.length - 1));
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, "Deleted frame.");
  renderAll(state);
}

function shiftFrame(state, direction) {
  const nextIndex = (state.project.currentFrameIndex + direction + state.project.frames.length) % state.project.frames.length;
  state.project.currentFrameIndex = nextIndex;
  if (!state.preview.playing) {
    state.preview.frameIndex = nextIndex;
  }
  setStatus(state, `Moved to frame ${nextIndex + 1}.`);
  renderAll(state);
}

async function importPngIntoCurrentFrame(state, file) {
  const image = await fileToImage(file);

  if (image.width !== state.project.width || image.height !== state.project.height) {
    const shouldResize = window.confirm(
      `Imported PNG is ${image.width}x${image.height} but project is ${state.project.width}x${state.project.height}. Resize project to match the PNG?`
    );

    if (shouldResize) {
      state.project = resizeProject(state.project, image.width, image.height);
      state.elements.canvasWidthInput.value = String(state.project.width);
      state.elements.canvasHeightInput.value = String(state.project.height);
    }
  }

  const targetWidth = state.project.width;
  const targetHeight = state.project.height;

  const stagingCanvas = document.createElement("canvas");
  stagingCanvas.width = targetWidth;
  stagingCanvas.height = targetHeight;
  const stagingContext = stagingCanvas.getContext("2d", { willReadFrequently: true });

  if (!stagingContext) {
    throw new Error("Could not decode PNG frame.");
  }

  stagingContext.imageSmoothingEnabled = false;
  stagingContext.clearRect(0, 0, targetWidth, targetHeight);
  stagingContext.drawImage(image, 0, 0, targetWidth, targetHeight);

  const data = stagingContext.getImageData(0, 0, targetWidth, targetHeight).data;
  const frame = createEmptyFrame(targetWidth, targetHeight);

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const idx = frameIndex(targetWidth, x, y);
      const offset = idx * 4;
      const a = data[offset + 3];
      frame.pixels[idx] = a === 0 ? null : rgbaToHex(data[offset], data[offset + 1], data[offset + 2], a);
    }
  }

  state.project.frames[state.project.currentFrameIndex] = frame;
  setStatus(state, `Imported PNG into frame ${state.project.currentFrameIndex + 1}.`);
  renderAll(state);
}

async function exportCurrentFramePng(state) {
  const frame = state.project.frames[state.project.currentFrameIndex];
  const frameCanvas = createImageFromFrame(frame, state.project.width, state.project.height);
  const blob = await canvasToBlob(frameCanvas);
  const filename = `sprite-frame-${state.project.currentFrameIndex + 1}.png`;
  downloadBlob(blob, filename);
  setStatus(state, `Exported ${filename}.`);
}

async function exportSpriteSheetPng(state) {
  const sheetCanvas = createSpriteSheetCanvas(state.project);
  const blob = await canvasToBlob(sheetCanvas);
  const filename = `sprite-sheet-${state.project.frames.length}f.png`;
  downloadBlob(blob, filename);
  setStatus(state, `Exported ${filename}.`);
}

async function saveProjectJson(state) {
  const payload = serializeProject(state.project);
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json" });
  const filename = `sprite-project-${state.project.width}x${state.project.height}-${state.project.frames.length}f.json`;
  downloadBlob(blob, filename);
  setStatus(state, `Saved ${filename}.`);
}

async function loadProjectJson(state, file) {
  const text = await fileToText(file);
  const parsed = JSON.parse(text);
  state.project = ensureProjectShape(parsed);
  state.elements.canvasWidthInput.value = String(state.project.width);
  state.elements.canvasHeightInput.value = String(state.project.height);
  state.elements.pixelSizeInput.value = String(state.project.pixelSize);
  state.elements.gridToggle.checked = state.project.showGrid;
  state.elements.onionSkinToggle.checked = state.project.onionSkin;
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, "Loaded project JSON.");
  renderAll(state);
}

function bindPointerDrawing(state) {
  const canvas = state.elements.editorCanvas;
  let pointerDown = false;
  let lastPoint = null;

  const applyDrawAt = (x, y) => {
    const frame = state.project.frames[state.project.currentFrameIndex];
    const color = state.projectTool === TOOL_IDS.ERASER ? null : state.project.activeColor;
    return setPixel(frame, state.project.width, state.project.height, x, y, color);
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    const point = getCanvasPixelFromEvent(canvas, event, state.project);

    if (state.projectTool === TOOL_IDS.FILL) {
      const frame = state.project.frames[state.project.currentFrameIndex];
      const fillColor = state.project.activeColor;
      const changed = floodFill(frame, state.project.width, state.project.height, point.x, point.y, fillColor);
      if (changed) {
        setStatus(state, "Fill applied.");
        renderEditor(state);
        renderPreview(state);
      }
      return;
    }

    pointerDown = true;
    canvas.setPointerCapture(event.pointerId);
    lastPoint = point;
    const changed = applyDrawAt(point.x, point.y);
    if (changed) {
      renderEditor(state);
      renderPreview(state);
    }
  };

  const onPointerMove = (event) => {
    if (!pointerDown || !lastPoint) {
      return;
    }

    const point = getCanvasPixelFromEvent(canvas, event, state.project);
    let changed = false;

    bresenhamLine(lastPoint.x, lastPoint.y, point.x, point.y, (x, y) => {
      const didChange = applyDrawAt(x, y);
      if (didChange) {
        changed = true;
      }
    });

    lastPoint = point;
    if (changed) {
      renderEditor(state);
      renderPreview(state);
    }
  };

  const onPointerUp = (event) => {
    if (!pointerDown) {
      return;
    }

    pointerDown = false;
    lastPoint = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
}

function bindControls(state) {
  const {
    addFrameButton,
    canvasHeightInput,
    canvasWidthInput,
    colorPicker,
    deleteFrameButton,
    duplicateFrameButton,
    exportPngButton,
    exportSheetButton,
    fpsInput,
    gridToggle,
    importPngButton,
    importPngInput,
    loadProjectButton,
    loadProjectInput,
    newCanvasButton,
    nextFrameButton,
    onionSkinToggle,
    pixelSizeInput,
    playPreviewButton,
    prevFrameButton,
    saveProjectButton,
    stopPreviewButton,
    toolButtons
  } = state.elements;

  newCanvasButton.addEventListener("click", () => {
    resetProject(state);
  });

  canvasWidthInput.addEventListener("change", () => {
    const width = clamp(canvasWidthInput.value, 1, 256, state.project.width);
    state.project = resizeProject(state.project, width, state.project.height);
    canvasWidthInput.value = String(state.project.width);
    setStatus(state, `Updated width to ${state.project.width}.`);
    renderAll(state);
  });

  canvasHeightInput.addEventListener("change", () => {
    const height = clamp(canvasHeightInput.value, 1, 256, state.project.height);
    state.project = resizeProject(state.project, state.project.width, height);
    canvasHeightInput.value = String(state.project.height);
    setStatus(state, `Updated height to ${state.project.height}.`);
    renderAll(state);
  });

  pixelSizeInput.addEventListener("input", () => {
    state.project.pixelSize = clamp(pixelSizeInput.value, 4, 40, DEFAULT_PIXEL_SIZE);
    setStatus(state, `Zoom set to ${state.project.pixelSize}.`);
    renderAll(state);
  });

  gridToggle.addEventListener("change", () => {
    state.project.showGrid = gridToggle.checked;
    setStatus(state, `Grid ${state.project.showGrid ? "enabled" : "disabled"}.`);
    renderEditor(state);
    renderHud(state);
  });

  onionSkinToggle.addEventListener("change", () => {
    state.project.onionSkin = onionSkinToggle.checked;
    setStatus(state, `Onion skin ${state.project.onionSkin ? "enabled" : "disabled"}.`);
    renderEditor(state);
    renderHud(state);
  });

  colorPicker.addEventListener("input", () => {
    const nextColor = withOpaqueAlpha(colorPicker.value);
    if (!state.project.palette.includes(nextColor)) {
      state.project.palette = dedupeColors([nextColor, ...state.project.palette]).slice(0, 32);
    }
    selectColor(state.project, nextColor);
    setStatus(state, `Selected color ${state.project.activeColor}.`);
    renderAll(state);
  });

  toolButtons.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.getAttribute("data-tool");
      if (!tool) {
        return;
      }
      state.projectTool = tool;
      setStatus(state, `${tool[0].toUpperCase()}${tool.slice(1)} tool selected.`);
      renderHud(state);
    });
  });

  addFrameButton.addEventListener("click", () => addFrame(state));
  duplicateFrameButton.addEventListener("click", () => duplicateFrame(state));
  deleteFrameButton.addEventListener("click", () => deleteFrame(state));
  prevFrameButton.addEventListener("click", () => shiftFrame(state, -1));
  nextFrameButton.addEventListener("click", () => shiftFrame(state, 1));

  playPreviewButton.addEventListener("click", () => {
    state.preview.playing = true;
    setStatus(state, "Preview playback started.");
  });

  stopPreviewButton.addEventListener("click", () => {
    state.preview.playing = false;
    state.preview.frameIndex = state.project.currentFrameIndex;
    setStatus(state, "Preview playback stopped.");
    renderPreview(state);
  });

  fpsInput.addEventListener("input", () => {
    state.preview.fps = clamp(fpsInput.value, 1, 24, DEFAULT_FPS);
    renderHud(state);
  });

  importPngButton.addEventListener("click", () => importPngInput.click());
  importPngInput.addEventListener("change", async () => {
    const file = importPngInput.files?.[0];
    importPngInput.value = "";
    if (!file) {
      return;
    }

    try {
      await importPngIntoCurrentFrame(state, file);
    } catch (error) {
      setStatus(state, `PNG import failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  exportPngButton.addEventListener("click", async () => {
    try {
      await exportCurrentFramePng(state);
    } catch (error) {
      setStatus(state, `PNG export failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  exportSheetButton.addEventListener("click", async () => {
    try {
      await exportSpriteSheetPng(state);
    } catch (error) {
      setStatus(state, `Sprite sheet export failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  saveProjectButton.addEventListener("click", async () => {
    try {
      await saveProjectJson(state);
    } catch (error) {
      setStatus(state, `JSON save failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  loadProjectButton.addEventListener("click", () => loadProjectInput.click());
  loadProjectInput.addEventListener("change", async () => {
    const file = loadProjectInput.files?.[0];
    loadProjectInput.value = "";
    if (!file) {
      return;
    }

    try {
      await loadProjectJson(state, file);
    } catch (error) {
      setStatus(state, `JSON load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });
}

function startPreviewLoop(state) {
  const step = (timestamp) => {
    if (!state.preview.lastTimestamp) {
      state.preview.lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - state.preview.lastTimestamp;
    state.preview.lastTimestamp = timestamp;

    if (state.preview.playing) {
      const frameDuration = 1000 / Math.max(1, state.preview.fps);
      state.preview.accumulatorMs += deltaMs;

      while (state.preview.accumulatorMs >= frameDuration) {
        state.preview.accumulatorMs -= frameDuration;
        state.preview.frameIndex = (state.preview.frameIndex + 1) % state.project.frames.length;
      }

      renderPreview(state);
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}

export function initializeSpriteEditorApp() {
  const state = {
    project: createNewProject({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      pixelSize: DEFAULT_PIXEL_SIZE
    }),
    projectTool: TOOL_IDS.PENCIL,
    preview: {
      playing: false,
      fps: DEFAULT_FPS,
      frameIndex: 0,
      lastTimestamp: 0,
      accumulatorMs: 0
    },
    elements: {
      activeColorSwatch: getRequiredElement("activeColorSwatch"),
      addFrameButton: getRequiredElement("addFrameButton"),
      canvasHeightInput: getRequiredElement("canvasHeightInput"),
      canvasWidthInput: getRequiredElement("canvasWidthInput"),
      colorPicker: getRequiredElement("colorPicker"),
      deleteFrameButton: getRequiredElement("deleteFrameButton"),
      duplicateFrameButton: getRequiredElement("duplicateFrameButton"),
      editorCanvas: getRequiredElement("editorCanvas"),
      exportPngButton: getRequiredElement("exportPngButton"),
      exportSheetButton: getRequiredElement("exportSheetButton"),
      fpsInput: getRequiredElement("fpsInput"),
      fpsValue: getRequiredElement("fpsValue"),
      frameCounter: getRequiredElement("frameCounter"),
      gridToggle: getRequiredElement("gridToggle"),
      importPngButton: getRequiredElement("importPngButton"),
      importPngInput: getRequiredElement("importPngInput"),
      loadProjectButton: getRequiredElement("loadProjectButton"),
      loadProjectInput: getRequiredElement("loadProjectInput"),
      newCanvasButton: getRequiredElement("newCanvasButton"),
      nextFrameButton: getRequiredElement("nextFrameButton"),
      onionSkinToggle: getRequiredElement("onionSkinToggle"),
      paletteButtons: getRequiredElement("paletteButtons"),
      pixelSizeInput: getRequiredElement("pixelSizeInput"),
      pixelSizeValue: getRequiredElement("pixelSizeValue"),
      playPreviewButton: getRequiredElement("playPreviewButton"),
      prevFrameButton: getRequiredElement("prevFrameButton"),
      previewCanvas: getRequiredElement("previewCanvas"),
      recentColorButtons: getRequiredElement("recentColorButtons"),
      saveProjectButton: getRequiredElement("saveProjectButton"),
      statusText: getRequiredElement("statusText"),
      stopPreviewButton: getRequiredElement("stopPreviewButton"),
      toolButtons: getRequiredElement("toolButtons"),
      toolStateText: getRequiredElement("toolStateText")
    }
  };

  state.elements.canvasWidthInput.value = String(state.project.width);
  state.elements.canvasHeightInput.value = String(state.project.height);
  state.elements.pixelSizeInput.value = String(state.project.pixelSize);
  state.elements.gridToggle.checked = state.project.showGrid;
  state.elements.onionSkinToggle.checked = state.project.onionSkin;
  state.elements.fpsInput.value = String(state.preview.fps);

  bindControls(state);
  bindPointerDrawing(state);
  renderAll(state);
  startPreviewLoop(state);
}
