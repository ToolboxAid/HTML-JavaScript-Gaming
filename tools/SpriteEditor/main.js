/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
(function () {
  "use strict";

  const STORAGE_KEY = "toolbox-sprite-editor-v13";
  const state = {
    cols: 16, rows: 16, pixelSize: 20, previewScale: 8, showGrid: true, dragDraw: true, mirror: false,
    activeTool: "brush", currentColor: "#00ccff", transparentColor: "#ff00ff", sheetBackground: "#ffffff",
    palette: ["#ff00ff", "#000000", "#ffffff", "#00ccff", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"],
    hoveredCell: null, isPointerDown: false, frames: [], activeFrameIndex: 0, frameClipboard: null,
    selectionClipboard: null, selection: null, selectionAnchor: null,
    playback: { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, lastTick: 0 },
    sheet: { layout: "horizontal", columns: 4, padding: 4, spacing: 2, transparent: true, labels: false, width: 0, height: 0 }
  };

  const refs = {};
  [
    "colsInput","rowsInput","pixelSizeInput","previewScaleInput","resizeBtn","toggleGridBtn",
    "brushToolBtn","eraseToolBtn","fillToolBtn","eyedropperToolBtn","selectToolBtn","dragDrawInput","mirrorInput",
    "currentColorInput","transparentColorInput","sheetBackgroundInput","addPaletteColorBtn","removePaletteColorBtn","paletteSwatches",
    "saveLocalBtn","loadLocalBtn","clearBtn","editorCanvas","previewCanvas","sheetCanvas","hoveredCellText","activeToolText",
    "filledCountText","activeFrameText","previewStateText","selectionText","statusText","exportJsonBtn","exportCompactBtn",
    "copyDataBtn","importJsonBtn","dataOutput","addFrameBtn","duplicateFrameBtn","deleteFrameBtn","prevFrameBtn","nextFrameBtn",
    "moveFrameLeftBtn","moveFrameRightBtn","copyFrameBtn","pasteFrameBtn","frameStrip","fpsInput","loopInput","playBtn","pauseBtn",
    "sheetLayoutSelect","sheetColumnsInput","sheetPaddingInput","sheetSpacingInput","sheetTransparentInput","sheetLabelsInput",
    "renderSheetBtn","downloadSheetBtn","exportSheetMetaBtn","sheetSizeText","sheetOrderText","copySelectionBtn","cutSelectionBtn",
    "pasteSelectionBtn","flipHBtn","flipVBtn","clearSelectionBtn"
  ].forEach((id) => refs[id] = document.getElementById(id));

  const editorCtx = refs.editorCanvas.getContext("2d");
  const previewCtx = refs.previewCanvas.getContext("2d");
  const sheetCtx = refs.sheetCanvas.getContext("2d");

  function makeGrid(cols, rows, fill = null) { return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill)); }
  function cloneGrid(grid) { return grid.map((row) => row.slice()); }
  function createFrame(name) { return { id: "f_" + Math.random().toString(36).slice(2, 10), name, pixels: makeGrid(state.cols, state.rows, null) }; }
  function getActiveFrame() { return state.frames[state.activeFrameIndex]; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
  function normalizeColor(value) { return value || "#000000"; }
  function syncCanvasSize() {
    refs.editorCanvas.width = state.cols * state.pixelSize; refs.editorCanvas.height = state.rows * state.pixelSize;
    refs.previewCanvas.width = state.cols * state.previewScale; refs.previewCanvas.height = state.rows * state.previewScale;
  }
  function setTool(toolName) {
    state.activeTool = toolName; refs.activeToolText.textContent = toolName.charAt(0).toUpperCase() + toolName.slice(1);
    [refs.brushToolBtn, refs.eraseToolBtn, refs.fillToolBtn, refs.eyedropperToolBtn, refs.selectToolBtn].forEach((b) => b.classList.remove("active"));
    ({brush:refs.brushToolBtn,erase:refs.eraseToolBtn,fill:refs.fillToolBtn,eyedropper:refs.eyedropperToolBtn,select:refs.selectToolBtn}[toolName]).classList.add("active");
  }
  function setStatus(message) { refs.statusText.textContent = message; }
  function syncInputsFromState() {
    refs.colsInput.value = state.cols; refs.rowsInput.value = state.rows; refs.pixelSizeInput.value = state.pixelSize; refs.previewScaleInput.value = state.previewScale;
    refs.dragDrawInput.checked = state.dragDraw; refs.mirrorInput.checked = state.mirror; refs.currentColorInput.value = state.currentColor;
    refs.transparentColorInput.value = state.transparentColor; refs.sheetBackgroundInput.value = state.sheetBackground; refs.fpsInput.value = state.playback.fps;
    refs.loopInput.checked = state.playback.loop; refs.sheetLayoutSelect.value = state.sheet.layout; refs.sheetColumnsInput.value = state.sheet.columns;
    refs.sheetPaddingInput.value = state.sheet.padding; refs.sheetSpacingInput.value = state.sheet.spacing; refs.sheetTransparentInput.checked = state.sheet.transparent;
    refs.sheetLabelsInput.checked = state.sheet.labels;
  }
  function drawCheckerboard(ctx, width, height, blockSize) {
    for (let y = 0; y < height; y += blockSize) for (let x = 0; x < width; x += blockSize) {
      ctx.fillStyle = ((Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0) ? "#f8fafc" : "#e2e8f0";
      ctx.fillRect(x, y, blockSize, blockSize);
    }
  }
  function drawPixels(ctx, pixels, scale, showGrid) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawCheckerboard(ctx, ctx.canvas.width, ctx.canvas.height, Math.max(1, scale));
    for (let y = 0; y < state.rows; y += 1) for (let x = 0; x < state.cols; x += 1) {
      const value = pixels[y][x]; if (!value) continue; ctx.fillStyle = value; ctx.fillRect(x * scale, y * scale, scale, scale);
    }
    if (showGrid) {
      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
      for (let x = 0; x <= state.cols; x += 1) { ctx.beginPath(); ctx.moveTo(x * scale + 0.5, 0); ctx.lineTo(x * scale + 0.5, ctx.canvas.height); ctx.stroke(); }
      for (let y = 0; y <= state.rows; y += 1) { ctx.beginPath(); ctx.moveTo(0, y * scale + 0.5); ctx.lineTo(ctx.canvas.width, y * scale + 0.5); ctx.stroke(); }
    }
  }
  function drawSelectionOverlay() {
    if (!state.selection) return;
    const s = state.selection;
    editorCtx.strokeStyle = "#ff9800"; editorCtx.lineWidth = 2;
    editorCtx.strokeRect(s.x * state.pixelSize + 1, s.y * state.pixelSize + 1, s.width * state.pixelSize - 2, s.height * state.pixelSize - 2);
  }
  function drawEditor() {
    drawPixels(editorCtx, getActiveFrame().pixels, state.pixelSize, state.showGrid);
    if (state.hoveredCell) { editorCtx.strokeStyle = "#4cc9f0"; editorCtx.lineWidth = 2; editorCtx.strokeRect(state.hoveredCell.x * state.pixelSize + 1, state.hoveredCell.y * state.pixelSize + 1, state.pixelSize - 2, state.pixelSize - 2); }
    drawSelectionOverlay();
  }
  function drawPreview() { const frame = state.playback.isPlaying ? state.frames[state.playback.previewFrameIndex] : getActiveFrame(); drawPixels(previewCtx, frame.pixels, state.previewScale, false); }
  function renderPalette() {
    refs.paletteSwatches.innerHTML = "";
    state.palette.forEach((colorValue) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "swatch"; if (colorValue === state.currentColor) button.classList.add("selected");
      button.style.background = colorValue; button.addEventListener("click", () => { state.currentColor = colorValue; refs.currentColorInput.value = colorValue; renderPalette(); });
      refs.paletteSwatches.appendChild(button);
    });
  }
  function renderFrameStrip() {
    refs.frameStrip.innerHTML = "";
    state.frames.forEach((frame, index) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "frame-thumb" + (index === state.activeFrameIndex ? " active" : "");
      const thumb = document.createElement("canvas"); thumb.width = state.cols * 2; thumb.height = state.rows * 2; drawPixels(thumb.getContext("2d"), frame.pixels, 2, false);
      const label = document.createElement("div"); label.className = "label"; label.textContent = `${index + 1}: ${frame.name}`;
      button.appendChild(thumb); button.appendChild(label); button.addEventListener("click", () => { state.activeFrameIndex = index; if (!state.playback.isPlaying) state.playback.previewFrameIndex = index; clearSelection(); renderAll(); });
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
    refs.selectionText.textContent = state.selection ? `${state.selection.width}x${state.selection.height} @ ${state.selection.x},${state.selection.y}` : "None";
  }
  function renderAll() { drawEditor(); drawPreview(); renderPalette(); renderFrameStrip(); updateMeta(); }
  function getCellFromEvent(event) {
    const rect = refs.editorCanvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) * (refs.editorCanvas.width / rect.width)) / state.pixelSize);
    const y = Math.floor(((event.clientY - rect.top) * (refs.editorCanvas.height / rect.height)) / state.pixelSize);
    if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return null; return { x, y };
  }
  function paintCell(x, y, value) { const frame = getActiveFrame(); frame.pixels[y][x] = value; if (state.mirror) frame.pixels[y][state.cols - 1 - x] = value; }
  function floodFill(startX, startY, nextValue) {
    const frame = getActiveFrame(); const targetValue = frame.pixels[startY][startX]; if (targetValue === nextValue) return;
    const queue = [{ x: startX, y: startY }], seen = new Set();
    while (queue.length) {
      const current = queue.shift(), key = `${current.x},${current.y}`; if (seen.has(key)) continue; seen.add(key);
      if (current.x < 0 || current.y < 0 || current.x >= state.cols || current.y >= state.rows) continue;
      if (frame.pixels[current.y][current.x] !== targetValue) continue;
      paintCell(current.x, current.y, nextValue);
      queue.push({ x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y }, { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 });
    }
  }
  function applyToolAt(x, y, sourceButton = 0) {
    if (state.activeTool === "eyedropper") { const value = getActiveFrame().pixels[y][x]; state.currentColor = value || state.transparentColor; refs.currentColorInput.value = state.currentColor; renderPalette(); renderAll(); return; }
    const nextValue = sourceButton === 2 || state.activeTool === "erase" || state.currentColor === state.transparentColor ? null : state.currentColor;
    if (state.activeTool === "fill") floodFill(x, y, nextValue); else paintCell(x, y, nextValue); renderAll();
  }
  function setSelectionFromPoints(a, b) {
    const left = Math.min(a.x, b.x), top = Math.min(a.y, b.y), right = Math.max(a.x, b.x), bottom = Math.max(a.y, b.y);
    state.selection = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
  }
  function clearSelection() { state.selection = null; state.selectionAnchor = null; renderAll(); }
  function readSelectionPixels() {
    if (!state.selection) return null; const frame = getActiveFrame(), block = [];
    for (let y = 0; y < state.selection.height; y += 1) { const row = []; for (let x = 0; x < state.selection.width; x += 1) row.push(frame.pixels[state.selection.y + y][state.selection.x + x]); block.push(row); }
    return { width: state.selection.width, height: state.selection.height, pixels: block };
  }
  function writeBlockAt(block, startX, startY) {
    const frame = getActiveFrame();
    for (let y = 0; y < block.height; y += 1) for (let x = 0; x < block.width; x += 1) {
      const tx = startX + x, ty = startY + y; if (tx < 0 || ty < 0 || tx >= state.cols || ty >= state.rows) continue; frame.pixels[ty][tx] = block.pixels[y][x];
    }
  }
  function copySelection() { const block = readSelectionPixels(); if (!block) return setStatus("No selection to copy."); state.selectionClipboard = block; setStatus("Selection copied."); }
  function cutSelection() {
    const block = readSelectionPixels(); if (!block) return setStatus("No selection to cut."); state.selectionClipboard = block;
    const frame = getActiveFrame(); for (let y = 0; y < state.selection.height; y += 1) for (let x = 0; x < state.selection.width; x += 1) frame.pixels[state.selection.y + y][state.selection.x + x] = null;
    renderAll(); setStatus("Selection cut.");
  }
  function pasteSelection() { if (!state.selectionClipboard) return setStatus("No copied selection to paste."); writeBlockAt(state.selectionClipboard, state.selection ? state.selection.x : 0, state.selection ? state.selection.y : 0); renderAll(); setStatus("Selection pasted."); }
  function flipSelection(horizontal) {
    const block = readSelectionPixels(); if (!block) return setStatus("No selection to flip.");
    const nextPixels = block.pixels.map((row) => row.slice()); if (horizontal) nextPixels.forEach((row) => row.reverse()); else nextPixels.reverse();
    writeBlockAt({ width: block.width, height: block.height, pixels: nextPixels }, state.selection.x, state.selection.y); renderAll(); setStatus(horizontal ? "Selection flipped horizontally." : "Selection flipped vertically.");
  }
  function copyFrame() { state.frameClipboard = cloneGrid(getActiveFrame().pixels); setStatus("Frame copied."); }
  function pasteFrame() { if (!state.frameClipboard) return setStatus("No copied frame to paste."); getActiveFrame().pixels = cloneGrid(state.frameClipboard); clearSelection(); renderAll(); setStatus("Frame pasted."); }
  function moveFrame(direction) {
    const target = state.activeFrameIndex + direction; if (target < 0 || target >= state.frames.length) return;
    const temp = state.frames[state.activeFrameIndex]; state.frames[state.activeFrameIndex] = state.frames[target]; state.frames[target] = temp; state.activeFrameIndex = target; state.playback.previewFrameIndex = target;
    renderSheetPreview(); renderAll(); setStatus("Frame order updated.");
  }
  function addFrame() { state.frames.push(createFrame(`Frame ${state.frames.length + 1}`)); state.activeFrameIndex = state.frames.length - 1; state.playback.previewFrameIndex = state.activeFrameIndex; clearSelection(); renderSheetPreview(); renderAll(); }
  function duplicateFrame() {
    const source = getActiveFrame(); state.frames.splice(state.activeFrameIndex + 1, 0, { id: "f_" + Math.random().toString(36).slice(2, 10), name: `${source.name} Copy`, pixels: cloneGrid(source.pixels) });
    state.activeFrameIndex += 1; state.playback.previewFrameIndex = state.activeFrameIndex; clearSelection(); renderSheetPreview(); renderAll();
  }
  function deleteFrame() {
    if (state.frames.length === 1) return setStatus("Cannot delete the last remaining frame.");
    state.frames.splice(state.activeFrameIndex, 1); state.activeFrameIndex = Math.max(0, Math.min(state.activeFrameIndex, state.frames.length - 1)); state.playback.previewFrameIndex = state.activeFrameIndex;
    clearSelection(); renderSheetPreview(); renderAll();
  }
  function resizeAllFrames(newCols, newRows) {
    state.frames = state.frames.map((frame) => {
      const next = makeGrid(newCols, newRows, null);
      for (let y = 0; y < Math.min(state.rows, newRows); y += 1) for (let x = 0; x < Math.min(state.cols, newCols); x += 1) next[y][x] = frame.pixels[y][x];
      return { ...frame, pixels: next };
    });
    state.cols = newCols; state.rows = newRows; clearSelection(); syncCanvasSize(); renderSheetPreview(); renderAll();
  }
  function buildPixels(sourcePixels) {
    const next = makeGrid(state.cols, state.rows, null);
    for (let y = 0; y < Math.min(state.rows, sourcePixels.length); y += 1) for (let x = 0; x < Math.min(state.cols, sourcePixels[y].length); x += 1) next[y][x] = sourcePixels[y][x] ? normalizeColor(sourcePixels[y][x]) : null;
    return next;
  }
  function exportJson(pretty) {
    const payload = { version: 4, kind: "sprite-animation", cols: state.cols, rows: state.rows, pixelSize: state.pixelSize, previewScale: state.previewScale, transparentColor: state.transparentColor, palette: state.palette.slice(), animation: { fps: state.playback.fps, loop: state.playback.loop }, frames: state.frames.map((frame) => ({ id: frame.id, name: frame.name, pixels: cloneGrid(frame.pixels) })) };
    refs.dataOutput.value = JSON.stringify(payload, null, pretty ? 2 : 0); setStatus(pretty ? "Exported animation JSON." : "Exported compact animation JSON.");
  }
  function computeSheetPlacement() {
    const count = state.frames.length, padding = state.sheet.padding, spacing = state.sheet.spacing; let columns = 1, rows = 1;
    if (state.sheet.layout === "horizontal") { columns = count; rows = 1; } else if (state.sheet.layout === "vertical") { columns = 1; rows = count; } else { columns = Math.max(1, Math.min(state.sheet.columns, count)); rows = Math.ceil(count / columns); }
    const labelHeight = state.sheet.labels ? 12 : 0;
    const width = padding * 2 + columns * state.cols + Math.max(0, columns - 1) * spacing;
    const height = padding * 2 + rows * (state.rows + labelHeight) + Math.max(0, rows - 1) * spacing;
    const entries = [];
    for (let index = 0; index < count; index += 1) { const col = index % columns, row = Math.floor(index / columns); entries.push({ x: padding + col * (state.cols + spacing), y: padding + row * (state.rows + labelHeight + spacing) }); }
    return { width, height, columns, rows, entries };
  }
  function buildSheetMetadata() {
    const placement = computeSheetPlacement();
    return { version: 1, kind: "sprite-sheet", frameCount: state.frames.length, frameSize: { width: state.cols, height: state.rows }, sheetSize: { width: placement.width, height: placement.height }, padding: state.sheet.padding, spacing: state.sheet.spacing, layout: state.sheet.layout, columns: placement.columns, rows: placement.rows, frames: state.frames.map((frame, index) => ({ index, id: frame.id, name: frame.name, x: placement.entries[index].x, y: placement.entries[index].y, width: state.cols, height: state.rows })) };
  }
  function exportSheetMetadata() { refs.dataOutput.value = JSON.stringify(buildSheetMetadata(), null, 2); setStatus("Exported sheet metadata."); }
  function importJson() {
    try {
      const parsed = JSON.parse(refs.dataOutput.value.trim()); state.cols = clamp(parsed.cols || 16, 4, 64); state.rows = clamp(parsed.rows || 16, 4, 64);
      state.pixelSize = clamp(parsed.pixelSize || 20, 8, 40); state.previewScale = clamp(parsed.previewScale || 8, 4, 32); state.transparentColor = normalizeColor(parsed.transparentColor || "#ff00ff");
      state.palette = Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.map(normalizeColor) : state.palette.slice(); state.playback.fps = clamp(parsed.animation?.fps || 6, 1, 24); state.playback.loop = Boolean(parsed.animation?.loop ?? true); state.playback.isPlaying = false;
      if (Array.isArray(parsed.frames) && parsed.frames.length) state.frames = parsed.frames.map((frame, index) => ({ id: frame.id || "f_" + Math.random().toString(36).slice(2, 10), name: frame.name || `Frame ${index + 1}`, pixels: buildPixels(frame.pixels) }));
      else if (Array.isArray(parsed.pixels)) state.frames = [{ id: "f_" + Math.random().toString(36).slice(2, 10), name: "Frame 1", pixels: buildPixels(parsed.pixels) }];
      else throw new Error("Missing frames or pixels payload.");
      state.activeFrameIndex = 0; state.playback.previewFrameIndex = 0; clearSelection(); syncInputsFromState(); syncCanvasSize(); renderSheetPreview(); renderAll(); setStatus("Import complete.");
    } catch (error) { setStatus(`Import failed: ${error.message}`); }
  }
  function renderSheetPreview() {
    const placement = computeSheetPlacement(); state.sheet.width = placement.width; state.sheet.height = placement.height; refs.sheetCanvas.width = placement.width; refs.sheetCanvas.height = placement.height;
    if (state.sheet.transparent) { sheetCtx.clearRect(0, 0, placement.width, placement.height); drawCheckerboard(sheetCtx, placement.width, placement.height, 8); }
    else { sheetCtx.fillStyle = state.sheetBackground; sheetCtx.fillRect(0, 0, placement.width, placement.height); }
    state.frames.forEach((frame, index) => {
      const entry = placement.entries[index];
      for (let y = 0; y < state.rows; y += 1) for (let x = 0; x < state.cols; x += 1) { const value = frame.pixels[y][x]; if (!value) continue; sheetCtx.fillStyle = value; sheetCtx.fillRect(entry.x + x, entry.y + y, 1, 1); }
    });
    updateMeta();
  }
  function downloadSheetPng() { renderSheetPreview(); const link = document.createElement("a"); link.download = "sprite-sheet.png"; link.href = refs.sheetCanvas.toDataURL("image/png"); link.click(); setStatus("Downloaded sprite sheet PNG."); }
  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cols: state.cols, rows: state.rows, pixelSize: state.pixelSize, previewScale: state.previewScale, showGrid: state.showGrid, dragDraw: state.dragDraw, mirror: state.mirror, activeTool: state.activeTool, currentColor: state.currentColor, transparentColor: state.transparentColor, sheetBackground: state.sheetBackground, palette: state.palette, activeFrameIndex: state.activeFrameIndex, playback: { fps: state.playback.fps, loop: state.playback.loop }, sheet: state.sheet, frames: state.frames, frameClipboard: state.frameClipboard, selectionClipboard: state.selectionClipboard }));
    setStatus("Saved locally.");
  }
  function loadLocal() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (!parsed) return setStatus("No saved editor state found.");
      state.cols = clamp(parsed.cols || 16, 4, 64); state.rows = clamp(parsed.rows || 16, 4, 64); state.pixelSize = clamp(parsed.pixelSize || 20, 8, 40); state.previewScale = clamp(parsed.previewScale || 8, 4, 32);
      state.showGrid = Boolean(parsed.showGrid); state.dragDraw = Boolean(parsed.dragDraw); state.mirror = Boolean(parsed.mirror); state.activeTool = parsed.activeTool || "brush"; state.currentColor = normalizeColor(parsed.currentColor || "#00ccff");
      state.transparentColor = normalizeColor(parsed.transparentColor || "#ff00ff"); state.sheetBackground = normalizeColor(parsed.sheetBackground || "#ffffff"); state.palette = Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.map(normalizeColor) : state.palette.slice();
      state.playback.fps = clamp(parsed.playback?.fps || 6, 1, 24); state.playback.loop = Boolean(parsed.playback?.loop ?? true); state.playback.isPlaying = false; Object.assign(state.sheet, parsed.sheet || {});
      state.frames = Array.isArray(parsed.frames) && parsed.frames.length ? parsed.frames.map((frame, index) => ({ id: frame.id || "f_" + Math.random().toString(36).slice(2, 10), name: frame.name || `Frame ${index + 1}`, pixels: buildPixels(frame.pixels) })) : [createFrame("Frame 1")];
      state.activeFrameIndex = Math.max(0, Math.min(parsed.activeFrameIndex || 0, state.frames.length - 1)); state.playback.previewFrameIndex = state.activeFrameIndex; state.frameClipboard = Array.isArray(parsed.frameClipboard) ? parsed.frameClipboard : null; state.selectionClipboard = parsed.selectionClipboard || null;
      clearSelection(); syncInputsFromState(); syncCanvasSize(); setTool(state.activeTool); renderSheetPreview(); renderAll(); setStatus("Loaded local editor state.");
    } catch (error) { setStatus(`Load failed: ${error.message}`); }
  }
  function clearFrame() { getActiveFrame().pixels = makeGrid(state.cols, state.rows, null); clearSelection(); renderSheetPreview(); renderAll(); }
  function playPreview() { state.playback.isPlaying = true; state.playback.previewFrameIndex = 0; state.playback.lastTick = performance.now(); renderAll(); }
  function pausePreview() { state.playback.isPlaying = false; state.playback.previewFrameIndex = state.activeFrameIndex; renderAll(); }
  function tickPreview(timestamp) {
    if (state.playback.isPlaying && state.frames.length) {
      const frameDuration = 1000 / state.playback.fps;
      if (timestamp - state.playback.lastTick >= frameDuration) {
        state.playback.lastTick = timestamp;
        if (state.playback.previewFrameIndex < state.frames.length - 1) state.playback.previewFrameIndex += 1;
        else if (state.playback.loop) state.playback.previewFrameIndex = 0;
        else pausePreview();
        drawPreview(); updateMeta();
      }
    }
    requestAnimationFrame(tickPreview);
  }
  function bindEvents() {
    refs.resizeBtn.addEventListener("click", () => { state.pixelSize = clamp(refs.pixelSizeInput.value, 8, 40); state.previewScale = clamp(refs.previewScaleInput.value, 4, 32); resizeAllFrames(clamp(refs.colsInput.value, 4, 64), clamp(refs.rowsInput.value, 4, 64)); });
    refs.toggleGridBtn.addEventListener("click", () => { state.showGrid = !state.showGrid; renderAll(); });
    refs.brushToolBtn.addEventListener("click", () => setTool("brush")); refs.eraseToolBtn.addEventListener("click", () => setTool("erase")); refs.fillToolBtn.addEventListener("click", () => setTool("fill")); refs.eyedropperToolBtn.addEventListener("click", () => setTool("eyedropper")); refs.selectToolBtn.addEventListener("click", () => setTool("select"));
    refs.dragDrawInput.addEventListener("change", () => { state.dragDraw = refs.dragDrawInput.checked; }); refs.mirrorInput.addEventListener("change", () => { state.mirror = refs.mirrorInput.checked; });
    refs.currentColorInput.addEventListener("input", () => { state.currentColor = normalizeColor(refs.currentColorInput.value); if (!state.palette.includes(state.currentColor)) state.palette.push(state.currentColor); renderPalette(); });
    refs.transparentColorInput.addEventListener("input", () => { state.transparentColor = normalizeColor(refs.transparentColorInput.value); });
    refs.sheetBackgroundInput.addEventListener("input", () => { state.sheetBackground = normalizeColor(refs.sheetBackgroundInput.value); renderSheetPreview(); });
    refs.addPaletteColorBtn.addEventListener("click", () => { const next = normalizeColor(refs.currentColorInput.value); if (!state.palette.includes(next)) state.palette.push(next); renderPalette(); });
    refs.removePaletteColorBtn.addEventListener("click", () => { if (state.palette.length <= 1) return; state.palette.pop(); renderPalette(); });
    refs.copySelectionBtn.addEventListener("click", copySelection); refs.cutSelectionBtn.addEventListener("click", cutSelection); refs.pasteSelectionBtn.addEventListener("click", pasteSelection); refs.flipHBtn.addEventListener("click", () => flipSelection(true)); refs.flipVBtn.addEventListener("click", () => flipSelection(false)); refs.clearSelectionBtn.addEventListener("click", clearSelection);
    refs.addFrameBtn.addEventListener("click", addFrame); refs.duplicateFrameBtn.addEventListener("click", duplicateFrame); refs.deleteFrameBtn.addEventListener("click", deleteFrame);
    refs.prevFrameBtn.addEventListener("click", () => { state.activeFrameIndex = (state.activeFrameIndex - 1 + state.frames.length) % state.frames.length; if (!state.playback.isPlaying) state.playback.previewFrameIndex = state.activeFrameIndex; clearSelection(); renderAll(); });
    refs.nextFrameBtn.addEventListener("click", () => { state.activeFrameIndex = (state.activeFrameIndex + 1) % state.frames.length; if (!state.playback.isPlaying) state.playback.previewFrameIndex = state.activeFrameIndex; clearSelection(); renderAll(); });
    refs.moveFrameLeftBtn.addEventListener("click", () => moveFrame(-1)); refs.moveFrameRightBtn.addEventListener("click", () => moveFrame(1)); refs.copyFrameBtn.addEventListener("click", copyFrame); refs.pasteFrameBtn.addEventListener("click", pasteFrame);
    refs.fpsInput.addEventListener("change", () => { state.playback.fps = clamp(refs.fpsInput.value, 1, 24); renderAll(); }); refs.loopInput.addEventListener("change", () => { state.playback.loop = refs.loopInput.checked; renderAll(); });
    refs.playBtn.addEventListener("click", playPreview); refs.pauseBtn.addEventListener("click", pausePreview); refs.saveLocalBtn.addEventListener("click", saveLocal); refs.loadLocalBtn.addEventListener("click", loadLocal); refs.clearBtn.addEventListener("click", clearFrame);
    refs.exportJsonBtn.addEventListener("click", () => exportJson(true)); refs.exportCompactBtn.addEventListener("click", () => exportJson(false)); refs.copyDataBtn.addEventListener("click", async () => { try { await navigator.clipboard.writeText(refs.dataOutput.value); setStatus("Copied output."); } catch (_error) { setStatus("Copy failed."); } }); refs.importJsonBtn.addEventListener("click", importJson);
    refs.sheetLayoutSelect.addEventListener("change", () => { state.sheet.layout = refs.sheetLayoutSelect.value; renderSheetPreview(); }); refs.sheetColumnsInput.addEventListener("change", () => { state.sheet.columns = clamp(refs.sheetColumnsInput.value, 1, 32); renderSheetPreview(); }); refs.sheetPaddingInput.addEventListener("change", () => { state.sheet.padding = clamp(refs.sheetPaddingInput.value, 0, 64); renderSheetPreview(); }); refs.sheetSpacingInput.addEventListener("change", () => { state.sheet.spacing = clamp(refs.sheetSpacingInput.value, 0, 32); renderSheetPreview(); }); refs.sheetTransparentInput.addEventListener("change", () => { state.sheet.transparent = refs.sheetTransparentInput.checked; renderSheetPreview(); }); refs.sheetLabelsInput.addEventListener("change", () => { state.sheet.labels = refs.sheetLabelsInput.checked; renderSheetPreview(); }); refs.renderSheetBtn.addEventListener("click", renderSheetPreview); refs.downloadSheetBtn.addEventListener("click", downloadSheetPng); refs.exportSheetMetaBtn.addEventListener("click", exportSheetMetadata);
    refs.editorCanvas.addEventListener("contextmenu", (event) => event.preventDefault());
    refs.editorCanvas.addEventListener("pointermove", (event) => {
      const cell = getCellFromEvent(event); state.hoveredCell = cell;
      if (state.activeTool === "select" && state.isPointerDown && state.selectionAnchor && cell) { setSelectionFromPoints(state.selectionAnchor, cell); renderAll(); return; }
      if (cell && state.isPointerDown && state.dragDraw && state.activeTool !== "select") applyToolAt(cell.x, cell.y, event.button || 0); else renderAll();
    });
    refs.editorCanvas.addEventListener("pointerdown", (event) => {
      event.preventDefault(); const cell = getCellFromEvent(event); if (!cell) return; state.isPointerDown = true; state.hoveredCell = cell;
      if (state.activeTool === "select") { state.selectionAnchor = cell; setSelectionFromPoints(cell, cell); renderAll(); return; }
      applyToolAt(cell.x, cell.y, event.button || 0);
    });
    window.addEventListener("pointerup", () => { state.isPointerDown = false; state.selectionAnchor = null; });
    refs.editorCanvas.addEventListener("mouseleave", () => { state.hoveredCell = null; renderAll(); });
  }
  function init() {
    state.frames = [createFrame("Frame 1")]; state.playback.previewFrameIndex = 0; syncInputsFromState(); syncCanvasSize(); setTool("brush"); bindEvents(); renderSheetPreview(); renderAll(); exportJson(true); requestAnimationFrame(tickPreview); setStatus("Sprite Editor v1.3 ready.");
  }
  init();
})();
