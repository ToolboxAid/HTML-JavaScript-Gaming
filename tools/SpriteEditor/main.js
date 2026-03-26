/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
(function () {
  "use strict";

  const STORAGE_KEY = "toolbox-sprite-editor-v12";

  const state = {
    cols: 16,
    rows: 16,
    pixelSize: 20,
    previewScale: 8,
    showGrid: true,
    dragDraw: true,
    mirror: false,
    activeTool: "brush",
    currentColor: "#00ccff",
    transparentColor: "#ff00ff",
    sheetBackground: "#ffffff",
    palette: ["#ff00ff", "#000000", "#ffffff", "#00ccff", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"],
    hoveredCell: null,
    isPointerDown: false,
    frames: [],
    activeFrameIndex: 0,
    playback: {
      isPlaying: false,
      fps: 6,
      loop: true,
      previewFrameIndex: 0,
      lastTick: 0
    },
    sheet: {
      layout: "horizontal",
      columns: 4,
      padding: 4,
      spacing: 2,
      transparent: true,
      labels: false,
      width: 0,
      height: 0
    }
  };

  const refs = {
    colsInput: document.getElementById("colsInput"),
    rowsInput: document.getElementById("rowsInput"),
    pixelSizeInput: document.getElementById("pixelSizeInput"),
    previewScaleInput: document.getElementById("previewScaleInput"),
    resizeBtn: document.getElementById("resizeBtn"),
    toggleGridBtn: document.getElementById("toggleGridBtn"),
    brushToolBtn: document.getElementById("brushToolBtn"),
    eraseToolBtn: document.getElementById("eraseToolBtn"),
    fillToolBtn: document.getElementById("fillToolBtn"),
    eyedropperToolBtn: document.getElementById("eyedropperToolBtn"),
    dragDrawInput: document.getElementById("dragDrawInput"),
    mirrorInput: document.getElementById("mirrorInput"),
    currentColorInput: document.getElementById("currentColorInput"),
    transparentColorInput: document.getElementById("transparentColorInput"),
    sheetBackgroundInput: document.getElementById("sheetBackgroundInput"),
    addPaletteColorBtn: document.getElementById("addPaletteColorBtn"),
    removePaletteColorBtn: document.getElementById("removePaletteColorBtn"),
    paletteSwatches: document.getElementById("paletteSwatches"),
    saveLocalBtn: document.getElementById("saveLocalBtn"),
    loadLocalBtn: document.getElementById("loadLocalBtn"),
    clearBtn: document.getElementById("clearBtn"),
    editorCanvas: document.getElementById("editorCanvas"),
    previewCanvas: document.getElementById("previewCanvas"),
    sheetCanvas: document.getElementById("sheetCanvas"),
    hoveredCellText: document.getElementById("hoveredCellText"),
    activeToolText: document.getElementById("activeToolText"),
    filledCountText: document.getElementById("filledCountText"),
    activeFrameText: document.getElementById("activeFrameText"),
    previewStateText: document.getElementById("previewStateText"),
    statusText: document.getElementById("statusText"),
    exportJsonBtn: document.getElementById("exportJsonBtn"),
    exportCompactBtn: document.getElementById("exportCompactBtn"),
    copyDataBtn: document.getElementById("copyDataBtn"),
    importJsonBtn: document.getElementById("importJsonBtn"),
    dataOutput: document.getElementById("dataOutput"),
    addFrameBtn: document.getElementById("addFrameBtn"),
    duplicateFrameBtn: document.getElementById("duplicateFrameBtn"),
    deleteFrameBtn: document.getElementById("deleteFrameBtn"),
    prevFrameBtn: document.getElementById("prevFrameBtn"),
    nextFrameBtn: document.getElementById("nextFrameBtn"),
    frameStrip: document.getElementById("frameStrip"),
    fpsInput: document.getElementById("fpsInput"),
    loopInput: document.getElementById("loopInput"),
    playBtn: document.getElementById("playBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    sheetLayoutSelect: document.getElementById("sheetLayoutSelect"),
    sheetColumnsInput: document.getElementById("sheetColumnsInput"),
    sheetPaddingInput: document.getElementById("sheetPaddingInput"),
    sheetSpacingInput: document.getElementById("sheetSpacingInput"),
    sheetTransparentInput: document.getElementById("sheetTransparentInput"),
    sheetLabelsInput: document.getElementById("sheetLabelsInput"),
    renderSheetBtn: document.getElementById("renderSheetBtn"),
    downloadSheetBtn: document.getElementById("downloadSheetBtn"),
    exportSheetMetaBtn: document.getElementById("exportSheetMetaBtn"),
    sheetSizeText: document.getElementById("sheetSizeText"),
    sheetOrderText: document.getElementById("sheetOrderText")
  };

  const editorCtx = refs.editorCanvas.getContext("2d");
  const previewCtx = refs.previewCanvas.getContext("2d");
  const sheetCtx = refs.sheetCanvas.getContext("2d");

  function makeGrid(cols, rows, fill = null) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  function createFrame(name) {
    return {
      id: "f_" + Math.random().toString(36).slice(2, 10),
      name,
      pixels: makeGrid(state.cols, state.rows, null)
    };
  }

  function getActiveFrame() {
    return state.frames[state.activeFrameIndex];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value)));
  }

  function normalizeColor(value) {
    if (!value) return "#000000";
    const temp = document.createElement("div");
    temp.style.color = value;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const matches = computed.match(/\d+/g);
    if (!matches || matches.length < 3) return value;
    const [r, g, b] = matches.map(Number);
    return "#" + [r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("");
  }

  function syncCanvasSize() {
    refs.editorCanvas.width = state.cols * state.pixelSize;
    refs.editorCanvas.height = state.rows * state.pixelSize;
    refs.previewCanvas.width = state.cols * state.previewScale;
    refs.previewCanvas.height = state.rows * state.previewScale;
  }

  function setTool(toolName) {
    state.activeTool = toolName;
    refs.activeToolText.textContent = toolName.charAt(0).toUpperCase() + toolName.slice(1);
    [refs.brushToolBtn, refs.eraseToolBtn, refs.fillToolBtn, refs.eyedropperToolBtn].forEach((button) => button.classList.remove("active"));
    if (toolName === "brush") refs.brushToolBtn.classList.add("active");
    if (toolName === "erase") refs.eraseToolBtn.classList.add("active");
    if (toolName === "fill") refs.fillToolBtn.classList.add("active");
    if (toolName === "eyedropper") refs.eyedropperToolBtn.classList.add("active");
  }

  function setStatus(message) {
    refs.statusText.textContent = message;
  }

  function syncInputsFromState() {
    refs.colsInput.value = String(state.cols);
    refs.rowsInput.value = String(state.rows);
    refs.pixelSizeInput.value = String(state.pixelSize);
    refs.previewScaleInput.value = String(state.previewScale);
    refs.dragDrawInput.checked = state.dragDraw;
    refs.mirrorInput.checked = state.mirror;
    refs.currentColorInput.value = normalizeColor(state.currentColor);
    refs.transparentColorInput.value = normalizeColor(state.transparentColor);
    refs.sheetBackgroundInput.value = normalizeColor(state.sheetBackground);
    refs.fpsInput.value = String(state.playback.fps);
    refs.loopInput.checked = state.playback.loop;
    refs.sheetLayoutSelect.value = state.sheet.layout;
    refs.sheetColumnsInput.value = String(state.sheet.columns);
    refs.sheetPaddingInput.value = String(state.sheet.padding);
    refs.sheetSpacingInput.value = String(state.sheet.spacing);
    refs.sheetTransparentInput.checked = state.sheet.transparent;
    refs.sheetLabelsInput.checked = state.sheet.labels;
  }

  function drawCheckerboard(ctx, width, height, blockSize) {
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        ctx.fillStyle = ((Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0) ? "#f8fafc" : "#e2e8f0";
        ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
  }

  function drawPixels(ctx, pixels, scale, showGrid) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawCheckerboard(ctx, ctx.canvas.width, ctx.canvas.height, Math.max(1, scale));
    for (let y = 0; y < state.rows; y += 1) {
      for (let x = 0; x < state.cols; x += 1) {
        const value = pixels[y][x];
        if (!value) continue;
        ctx.fillStyle = value;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    if (showGrid) {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      for (let x = 0; x <= state.cols; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * scale + 0.5, 0);
        ctx.lineTo(x * scale + 0.5, ctx.canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= state.rows; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale + 0.5);
        ctx.lineTo(ctx.canvas.width, y * scale + 0.5);
        ctx.stroke();
      }
    }
  }

  function drawEditor() {
    drawPixels(editorCtx, getActiveFrame().pixels, state.pixelSize, state.showGrid);
    if (state.hoveredCell) {
      editorCtx.strokeStyle = "#4cc9f0";
      editorCtx.lineWidth = 2;
      editorCtx.strokeRect(
        state.hoveredCell.x * state.pixelSize + 1,
        state.hoveredCell.y * state.pixelSize + 1,
        state.pixelSize - 2,
        state.pixelSize - 2
      );
    }
  }

  function drawPreview() {
    const frame = state.playback.isPlaying ? state.frames[state.playback.previewFrameIndex] : getActiveFrame();
    drawPixels(previewCtx, frame.pixels, state.previewScale, false);
  }

  function renderPalette() {
    refs.paletteSwatches.innerHTML = "";
    state.palette.forEach((colorValue) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch";
      if (colorValue === state.currentColor) button.classList.add("selected");
      button.style.background = colorValue;
      button.addEventListener("click", () => {
        state.currentColor = colorValue;
        refs.currentColorInput.value = normalizeColor(colorValue);
        renderPalette();
      });
      refs.paletteSwatches.appendChild(button);
    });
  }

  function renderFrameStrip() {
    refs.frameStrip.innerHTML = "";
    state.frames.forEach((frame, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "frame-thumb" + (index === state.activeFrameIndex ? " active" : "");
      const thumb = document.createElement("canvas");
      thumb.width = state.cols * 2;
      thumb.height = state.rows * 2;
      drawPixels(thumb.getContext("2d"), frame.pixels, 2, false);
      const label = document.createElement("div");
      label.className = "label";
      label.textContent = `${index + 1}: ${frame.name}`;
      button.appendChild(thumb);
      button.appendChild(label);
      button.addEventListener("click", () => {
        state.activeFrameIndex = index;
        if (!state.playback.isPlaying) state.playback.previewFrameIndex = index;
        renderAll();
      });
      refs.frameStrip.appendChild(button);
    });
  }

  function updateMeta() {
    refs.hoveredCellText.textContent = state.hoveredCell ? `${state.hoveredCell.x}, ${state.hoveredCell.y}` : "-";
    refs.filledCountText.textContent = String(getActiveFrame().pixels.flat().reduce((count, cell) => count + (cell ? 1 : 0), 0));
    refs.activeFrameText.textContent = `${state.activeFrameIndex + 1} / ${state.frames.length}`;
    refs.previewStateText.textContent = state.playback.isPlaying ? `Playing (${state.playback.fps} FPS)` : "Paused";
    refs.sheetSizeText.textContent = state.sheet.width && state.sheet.height ? `${state.sheet.width} x ${state.sheet.height}` : "-";
    refs.sheetOrderText.textContent = state.frames.map((_, index) => index + 1).join(", ");
  }

  function renderAll() {
    drawEditor();
    drawPreview();
    renderPalette();
    renderFrameStrip();
    updateMeta();
  }

  function getCellFromEvent(event) {
    const rect = refs.editorCanvas.getBoundingClientRect();
    const scaleX = refs.editorCanvas.width / rect.width;
    const scaleY = refs.editorCanvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const x = Math.floor(canvasX / state.pixelSize);
    const y = Math.floor(canvasY / state.pixelSize);
    if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return null;
    return { x, y };
  }

  function paintCell(x, y, value) {
    const frame = getActiveFrame();
    frame.pixels[y][x] = value;
    if (state.mirror) {
      const mirrorX = state.cols - 1 - x;
      frame.pixels[y][mirrorX] = value;
    }
  }

  function floodFill(startX, startY, nextValue) {
    const frame = getActiveFrame();
    const targetValue = frame.pixels[startY][startX];
    if (targetValue === nextValue) return;
    const queue = [{ x: startX, y: startY }];
    const seen = new Set();
    while (queue.length) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (current.x < 0 || current.y < 0 || current.x >= state.cols || current.y >= state.rows) continue;
      if (frame.pixels[current.y][current.x] !== targetValue) continue;
      paintCell(current.x, current.y, nextValue);
      queue.push({ x: current.x + 1, y: current.y });
      queue.push({ x: current.x - 1, y: current.y });
      queue.push({ x: current.x, y: current.y + 1 });
      queue.push({ x: current.x, y: current.y - 1 });
    }
  }

  function applyToolAt(x, y, sourceButton = 0) {
    if (state.activeTool === "eyedropper") {
      const value = getActiveFrame().pixels[y][x];
      state.currentColor = value || state.transparentColor;
      refs.currentColorInput.value = normalizeColor(state.currentColor);
      renderPalette();
      renderAll();
      return;
    }
    const nextValue = sourceButton === 2 || state.activeTool === "erase" || state.currentColor === state.transparentColor ? null : state.currentColor;
    if (state.activeTool === "fill") floodFill(x, y, nextValue);
    else paintCell(x, y, nextValue);
    renderAll();
  }

  function addFrame() {
    state.frames.push(createFrame(`Frame ${state.frames.length + 1}`));
    state.activeFrameIndex = state.frames.length - 1;
    state.playback.previewFrameIndex = state.activeFrameIndex;
    renderAll();
  }

  function duplicateFrame() {
    const source = getActiveFrame();
    state.frames.splice(state.activeFrameIndex + 1, 0, {
      id: "f_" + Math.random().toString(36).slice(2, 10),
      name: `${source.name} Copy`,
      pixels: cloneGrid(source.pixels)
    });
    state.activeFrameIndex += 1;
    state.playback.previewFrameIndex = state.activeFrameIndex;
    renderAll();
  }

  function deleteFrame() {
    if (state.frames.length === 1) {
      setStatus("Cannot delete the last remaining frame.");
      return;
    }
    state.frames.splice(state.activeFrameIndex, 1);
    state.activeFrameIndex = Math.max(0, Math.min(state.activeFrameIndex, state.frames.length - 1));
    state.playback.previewFrameIndex = state.activeFrameIndex;
    renderAll();
  }

  function resizeAllFrames(newCols, newRows) {
    state.frames = state.frames.map((frame) => {
      const next = makeGrid(newCols, newRows, null);
      for (let y = 0; y < Math.min(state.rows, newRows); y += 1) {
        for (let x = 0; x < Math.min(state.cols, newCols); x += 1) {
          next[y][x] = frame.pixels[y][x];
        }
      }
      return { ...frame, pixels: next };
    });
    state.cols = newCols;
    state.rows = newRows;
    syncCanvasSize();
    renderAll();
  }

  function buildPixels(sourcePixels) {
    const next = makeGrid(state.cols, state.rows, null);
    for (let y = 0; y < Math.min(state.rows, sourcePixels.length); y += 1) {
      const row = sourcePixels[y];
      for (let x = 0; x < Math.min(state.cols, row.length); x += 1) {
        next[y][x] = row[x] ? normalizeColor(row[x]) : null;
      }
    }
    return next;
  }

  function exportJson(pretty) {
    const payload = {
      version: 3,
      kind: "sprite-animation",
      cols: state.cols,
      rows: state.rows,
      pixelSize: state.pixelSize,
      previewScale: state.previewScale,
      transparentColor: state.transparentColor,
      palette: state.palette.slice(),
      animation: { fps: state.playback.fps, loop: state.playback.loop },
      frames: state.frames.map((frame) => ({ id: frame.id, name: frame.name, pixels: cloneGrid(frame.pixels) }))
    };
    refs.dataOutput.value = JSON.stringify(payload, null, pretty ? 2 : 0);
    setStatus(pretty ? "Exported animation JSON." : "Exported compact animation JSON.");
  }

  function exportSheetMetadata() {
    const sheetMeta = buildSheetMetadata();
    refs.dataOutput.value = JSON.stringify(sheetMeta, null, 2);
    setStatus("Exported sheet metadata.");
  }

  function buildSheetMetadata() {
    const placement = computeSheetPlacement();
    return {
      version: 1,
      kind: "sprite-sheet",
      frameCount: state.frames.length,
      frameSize: { width: state.cols, height: state.rows },
      sheetSize: { width: placement.width, height: placement.height },
      padding: state.sheet.padding,
      spacing: state.sheet.spacing,
      layout: state.sheet.layout,
      columns: placement.columns,
      rows: placement.rows,
      frames: state.frames.map((frame, index) => ({
        index,
        id: frame.id,
        name: frame.name,
        x: placement.entries[index].x,
        y: placement.entries[index].y,
        width: state.cols,
        height: state.rows
      }))
    };
  }

  function importJson() {
    try {
      const raw = refs.dataOutput.value.trim();
      if (!raw) {
        setStatus("Import failed: paste JSON into the output area first.");
        return;
      }
      const parsed = JSON.parse(raw);
      state.cols = clamp(parsed.cols || 16, 4, 64);
      state.rows = clamp(parsed.rows || 16, 4, 64);
      state.pixelSize = clamp(parsed.pixelSize || 20, 8, 40);
      state.previewScale = clamp(parsed.previewScale || 8, 4, 32);
      state.transparentColor = normalizeColor(parsed.transparentColor || "#ff00ff");
      state.palette = Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.map(normalizeColor) : state.palette.slice();
      state.playback.fps = clamp(parsed.animation?.fps || 6, 1, 24);
      state.playback.loop = Boolean(parsed.animation?.loop ?? true);
      state.playback.isPlaying = false;

      if (Array.isArray(parsed.frames) && parsed.frames.length) {
        state.frames = parsed.frames.map((frame, index) => ({
          id: frame.id || "f_" + Math.random().toString(36).slice(2, 10),
          name: frame.name || `Frame ${index + 1}`,
          pixels: buildPixels(frame.pixels)
        }));
      } else if (Array.isArray(parsed.pixels)) {
        state.frames = [{
          id: "f_" + Math.random().toString(36).slice(2, 10),
          name: "Frame 1",
          pixels: buildPixels(parsed.pixels)
        }];
      } else {
        throw new Error("Missing frames or pixels payload.");
      }

      state.activeFrameIndex = 0;
      state.playback.previewFrameIndex = 0;
      syncInputsFromState();
      syncCanvasSize();
      renderSheetPreview();
      renderAll();
      setStatus("Import complete.");
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  }

  function computeSheetPlacement() {
    const count = state.frames.length;
    const padding = state.sheet.padding;
    const spacing = state.sheet.spacing;
    let columns = 1;
    let rows = 1;

    if (state.sheet.layout === "horizontal") {
      columns = count;
      rows = 1;
    } else if (state.sheet.layout === "vertical") {
      columns = 1;
      rows = count;
    } else {
      columns = Math.max(1, Math.min(state.sheet.columns, count));
      rows = Math.ceil(count / columns);
    }

    const labelHeight = state.sheet.labels ? 12 : 0;
    const width = padding * 2 + columns * state.cols + Math.max(0, columns - 1) * spacing;
    const height = padding * 2 + rows * (state.rows + labelHeight) + Math.max(0, rows - 1) * spacing;

    const entries = [];
    for (let index = 0; index < count; index += 1) {
      const col = index % columns;
      const row = Math.floor(index / columns);
      entries.push({
        x: padding + col * (state.cols + spacing),
        y: padding + row * (state.rows + labelHeight + spacing)
      });
    }

    return { width, height, columns, rows, labelHeight, entries };
  }

  function renderSheetPreview() {
    const placement = computeSheetPlacement();
    state.sheet.width = placement.width;
    state.sheet.height = placement.height;
    refs.sheetCanvas.width = placement.width;
    refs.sheetCanvas.height = placement.height;

    if (state.sheet.transparent) {
      sheetCtx.clearRect(0, 0, placement.width, placement.height);
      drawCheckerboard(sheetCtx, placement.width, placement.height, 8);
    } else {
      sheetCtx.fillStyle = state.sheetBackground;
      sheetCtx.fillRect(0, 0, placement.width, placement.height);
    }

    state.frames.forEach((frame, index) => {
      const entry = placement.entries[index];
      for (let y = 0; y < state.rows; y += 1) {
        for (let x = 0; x < state.cols; x += 1) {
          const value = frame.pixels[y][x];
          if (!value) continue;
          sheetCtx.fillStyle = value;
          sheetCtx.fillRect(entry.x + x, entry.y + y, 1, 1);
        }
      }
      if (state.sheet.labels) {
        sheetCtx.fillStyle = "#111111";
        sheetCtx.font = "10px Arial";
        sheetCtx.fillText(String(index + 1), entry.x, entry.y + state.rows + 10);
      }
    });

    updateMeta();
  }

  function downloadSheetPng() {
    renderSheetPreview();
    const link = document.createElement("a");
    link.download = "sprite-sheet.png";
    link.href = refs.sheetCanvas.toDataURL("image/png");
    link.click();
    setStatus("Downloaded sprite sheet PNG.");
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cols: state.cols,
      rows: state.rows,
      pixelSize: state.pixelSize,
      previewScale: state.previewScale,
      showGrid: state.showGrid,
      dragDraw: state.dragDraw,
      mirror: state.mirror,
      activeTool: state.activeTool,
      currentColor: state.currentColor,
      transparentColor: state.transparentColor,
      sheetBackground: state.sheetBackground,
      palette: state.palette,
      activeFrameIndex: state.activeFrameIndex,
      playback: { fps: state.playback.fps, loop: state.playback.loop },
      sheet: {
        layout: state.sheet.layout,
        columns: state.sheet.columns,
        padding: state.sheet.padding,
        spacing: state.sheet.spacing,
        transparent: state.sheet.transparent,
        labels: state.sheet.labels
      },
      frames: state.frames
    }));
    setStatus("Saved locally.");
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStatus("No saved editor state found.");
        return;
      }
      const parsed = JSON.parse(raw);
      state.cols = clamp(parsed.cols || 16, 4, 64);
      state.rows = clamp(parsed.rows || 16, 4, 64);
      state.pixelSize = clamp(parsed.pixelSize || 20, 8, 40);
      state.previewScale = clamp(parsed.previewScale || 8, 4, 32);
      state.showGrid = Boolean(parsed.showGrid);
      state.dragDraw = Boolean(parsed.dragDraw);
      state.mirror = Boolean(parsed.mirror);
      state.activeTool = parsed.activeTool || "brush";
      state.currentColor = normalizeColor(parsed.currentColor || "#00ccff");
      state.transparentColor = normalizeColor(parsed.transparentColor || "#ff00ff");
      state.sheetBackground = normalizeColor(parsed.sheetBackground || "#ffffff");
      state.palette = Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.map(normalizeColor) : state.palette.slice();
      state.playback.fps = clamp(parsed.playback?.fps || 6, 1, 24);
      state.playback.loop = Boolean(parsed.playback?.loop ?? true);
      state.playback.isPlaying = false;
      state.sheet.layout = parsed.sheet?.layout || "horizontal";
      state.sheet.columns = clamp(parsed.sheet?.columns || 4, 1, 32);
      state.sheet.padding = clamp(parsed.sheet?.padding || 4, 0, 64);
      state.sheet.spacing = clamp(parsed.sheet?.spacing || 2, 0, 32);
      state.sheet.transparent = Boolean(parsed.sheet?.transparent ?? true);
      state.sheet.labels = Boolean(parsed.sheet?.labels);
      state.frames = Array.isArray(parsed.frames) && parsed.frames.length
        ? parsed.frames.map((frame, index) => ({
          id: frame.id || "f_" + Math.random().toString(36).slice(2, 10),
          name: frame.name || `Frame ${index + 1}`,
          pixels: buildPixels(frame.pixels)
        }))
        : [createFrame("Frame 1")];
      state.activeFrameIndex = Math.max(0, Math.min(parsed.activeFrameIndex || 0, state.frames.length - 1));
      state.playback.previewFrameIndex = state.activeFrameIndex;
      syncInputsFromState();
      syncCanvasSize();
      setTool(state.activeTool);
      renderSheetPreview();
      renderAll();
      setStatus("Loaded local editor state.");
    } catch (error) {
      setStatus(`Load failed: ${error.message}`);
    }
  }

  function clearFrame() {
    getActiveFrame().pixels = makeGrid(state.cols, state.rows, null);
    renderAll();
  }

  function playPreview() {
    state.playback.isPlaying = true;
    state.playback.previewFrameIndex = 0;
    state.playback.lastTick = performance.now();
    renderAll();
  }

  function pausePreview() {
    state.playback.isPlaying = false;
    state.playback.previewFrameIndex = state.activeFrameIndex;
    renderAll();
  }

  function tickPreview(timestamp) {
    if (state.playback.isPlaying && state.frames.length) {
      const frameDuration = 1000 / state.playback.fps;
      if (timestamp - state.playback.lastTick >= frameDuration) {
        state.playback.lastTick = timestamp;
        if (state.playback.previewFrameIndex < state.frames.length - 1) {
          state.playback.previewFrameIndex += 1;
        } else if (state.playback.loop) {
          state.playback.previewFrameIndex = 0;
        } else {
          pausePreview();
        }
        drawPreview();
        updateMeta();
      }
    }
    requestAnimationFrame(tickPreview);
  }

  function bindEvents() {
    refs.resizeBtn.addEventListener("click", () => {
      state.pixelSize = clamp(refs.pixelSizeInput.value, 8, 40);
      state.previewScale = clamp(refs.previewScaleInput.value, 4, 32);
      resizeAllFrames(clamp(refs.colsInput.value, 4, 64), clamp(refs.rowsInput.value, 4, 64));
      renderSheetPreview();
    });
    refs.toggleGridBtn.addEventListener("click", () => {
      state.showGrid = !state.showGrid;
      renderAll();
    });
    refs.brushToolBtn.addEventListener("click", () => setTool("brush"));
    refs.eraseToolBtn.addEventListener("click", () => setTool("erase"));
    refs.fillToolBtn.addEventListener("click", () => setTool("fill"));
    refs.eyedropperToolBtn.addEventListener("click", () => setTool("eyedropper"));
    refs.dragDrawInput.addEventListener("change", () => { state.dragDraw = refs.dragDrawInput.checked; });
    refs.mirrorInput.addEventListener("change", () => { state.mirror = refs.mirrorInput.checked; });
    refs.currentColorInput.addEventListener("input", () => {
      state.currentColor = normalizeColor(refs.currentColorInput.value);
      if (!state.palette.includes(state.currentColor)) state.palette.push(state.currentColor);
      renderPalette();
    });
    refs.transparentColorInput.addEventListener("input", () => { state.transparentColor = normalizeColor(refs.transparentColorInput.value); });
    refs.sheetBackgroundInput.addEventListener("input", () => { state.sheetBackground = normalizeColor(refs.sheetBackgroundInput.value); renderSheetPreview(); });
    refs.addPaletteColorBtn.addEventListener("click", () => {
      const next = normalizeColor(refs.currentColorInput.value);
      if (!state.palette.includes(next)) state.palette.push(next);
      renderPalette();
    });
    refs.removePaletteColorBtn.addEventListener("click", () => {
      if (state.palette.length <= 1) return;
      state.palette.pop();
      renderPalette();
    });
    refs.addFrameBtn.addEventListener("click", () => { addFrame(); renderSheetPreview(); });
    refs.duplicateFrameBtn.addEventListener("click", () => { duplicateFrame(); renderSheetPreview(); });
    refs.deleteFrameBtn.addEventListener("click", () => { deleteFrame(); renderSheetPreview(); });
    refs.prevFrameBtn.addEventListener("click", () => {
      state.activeFrameIndex = (state.activeFrameIndex - 1 + state.frames.length) % state.frames.length;
      if (!state.playback.isPlaying) state.playback.previewFrameIndex = state.activeFrameIndex;
      renderAll();
    });
    refs.nextFrameBtn.addEventListener("click", () => {
      state.activeFrameIndex = (state.activeFrameIndex + 1) % state.frames.length;
      if (!state.playback.isPlaying) state.playback.previewFrameIndex = state.activeFrameIndex;
      renderAll();
    });
    refs.fpsInput.addEventListener("change", () => { state.playback.fps = clamp(refs.fpsInput.value, 1, 24); renderAll(); });
    refs.loopInput.addEventListener("change", () => { state.playback.loop = refs.loopInput.checked; renderAll(); });
    refs.playBtn.addEventListener("click", playPreview);
    refs.pauseBtn.addEventListener("click", pausePreview);
    refs.saveLocalBtn.addEventListener("click", saveLocal);
    refs.loadLocalBtn.addEventListener("click", loadLocal);
    refs.clearBtn.addEventListener("click", () => { clearFrame(); renderSheetPreview(); });
    refs.exportJsonBtn.addEventListener("click", () => exportJson(true));
    refs.exportCompactBtn.addEventListener("click", () => exportJson(false));
    refs.copyDataBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(refs.dataOutput.value);
        setStatus("Copied output.");
      } catch (_error) {
        setStatus("Copy failed.");
      }
    });
    refs.importJsonBtn.addEventListener("click", importJson);
    refs.sheetLayoutSelect.addEventListener("change", () => { state.sheet.layout = refs.sheetLayoutSelect.value; renderSheetPreview(); });
    refs.sheetColumnsInput.addEventListener("change", () => { state.sheet.columns = clamp(refs.sheetColumnsInput.value, 1, 32); renderSheetPreview(); });
    refs.sheetPaddingInput.addEventListener("change", () => { state.sheet.padding = clamp(refs.sheetPaddingInput.value, 0, 64); renderSheetPreview(); });
    refs.sheetSpacingInput.addEventListener("change", () => { state.sheet.spacing = clamp(refs.sheetSpacingInput.value, 0, 32); renderSheetPreview(); });
    refs.sheetTransparentInput.addEventListener("change", () => { state.sheet.transparent = refs.sheetTransparentInput.checked; renderSheetPreview(); });
    refs.sheetLabelsInput.addEventListener("change", () => { state.sheet.labels = refs.sheetLabelsInput.checked; renderSheetPreview(); });
    refs.renderSheetBtn.addEventListener("click", renderSheetPreview);
    refs.downloadSheetBtn.addEventListener("click", downloadSheetPng);
    refs.exportSheetMetaBtn.addEventListener("click", exportSheetMetadata);

    refs.editorCanvas.addEventListener("contextmenu", (event) => event.preventDefault());
    refs.editorCanvas.addEventListener("pointermove", (event) => {
      const cell = getCellFromEvent(event);
      state.hoveredCell = cell;
      if (cell && state.isPointerDown && state.dragDraw) applyToolAt(cell.x, cell.y, event.button || 0);
      else renderAll();
    });
    refs.editorCanvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const cell = getCellFromEvent(event);
      if (!cell) return;
      state.isPointerDown = true;
      state.hoveredCell = cell;
      applyToolAt(cell.x, cell.y, event.button || 0);
    });
    window.addEventListener("pointerup", () => { state.isPointerDown = false; });
    refs.editorCanvas.addEventListener("mouseleave", () => { state.hoveredCell = null; renderAll(); });
  }

  function init() {
    state.frames = [createFrame("Frame 1")];
    state.playback.previewFrameIndex = 0;
    syncInputsFromState();
    syncCanvasSize();
    setTool("brush");
    bindEvents();
    renderSheetPreview();
    renderAll();
    exportJson(true);
    requestAnimationFrame(tickPreview);
    setStatus("Sprite Editor v1.2 ready.");
  }

  init();
})();
