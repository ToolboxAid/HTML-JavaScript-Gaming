/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
(function () {
  "use strict";

  const STORAGE_KEY = "toolbox-sprite-editor-v20";

  class SpriteEditorDocument {
    constructor() {
      this.cols = 16;
      this.rows = 16;
      this.transparentColor = null;
      this.palette = ["#000000", "#ffffff", "#00ccff", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"];
      this.currentColor = "#00ccff";
      this.frames = [this.createFrame("Frame 1")];
      this.activeFrameIndex = 0;
      this.frameClipboard = null;
      this.selectionClipboard = null;
      this.selection = null;
      this.sheet = {
        layout: "horizontal",
        columns: 4,
        padding: 4,
        spacing: 2,
        transparent: true,
        backgroundColor: "#ffffff"
      };
    }

    createFrame(name) {
      return {
        id: "f_" + Math.random().toString(36).slice(2, 10),
        name,
        pixels: this.makeGrid(this.cols, this.rows, null)
      };
    }

    makeGrid(cols, rows, fill = null) {
      return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
    }

    cloneGrid(grid) {
      return grid.map((row) => row.slice());
    }

    get activeFrame() {
      return this.frames[this.activeFrameIndex];
    }

    ensureFrameIndex(index) {
      this.activeFrameIndex = Math.max(0, Math.min(index, this.frames.length - 1));
    }

    setPixel(x, y, value, mirror = false) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
      this.activeFrame.pixels[y][x] = value;
      if (mirror) {
        const mx = this.cols - 1 - x;
        if (mx >= 0 && mx < this.cols) this.activeFrame.pixels[y][mx] = value;
      }
    }

    getPixel(x, y) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return null;
      return this.activeFrame.pixels[y][x];
    }

    floodFill(startX, startY, nextValue, mirror = false) {
      const targetValue = this.getPixel(startX, startY);
      if (targetValue === nextValue) return;
      const queue = [{ x: startX, y: startY }];
      const seen = new Set();
      while (queue.length) {
        const current = queue.shift();
        const key = current.x + "," + current.y;
        if (seen.has(key)) continue;
        seen.add(key);
        if (current.x < 0 || current.y < 0 || current.x >= this.cols || current.y >= this.rows) continue;
        if (this.activeFrame.pixels[current.y][current.x] !== targetValue) continue;
        this.setPixel(current.x, current.y, nextValue, mirror);
        queue.push({ x: current.x + 1, y: current.y });
        queue.push({ x: current.x - 1, y: current.y });
        queue.push({ x: current.x, y: current.y + 1 });
        queue.push({ x: current.x, y: current.y - 1 });
      }
    }

    addFrame() {
      this.frames.push(this.createFrame("Frame " + (this.frames.length + 1)));
      this.activeFrameIndex = this.frames.length - 1;
    }

    duplicateFrame() {
      const source = this.activeFrame;
      this.frames.splice(this.activeFrameIndex + 1, 0, {
        id: "f_" + Math.random().toString(36).slice(2, 10),
        name: source.name + " Copy",
        pixels: this.cloneGrid(source.pixels)
      });
      this.activeFrameIndex += 1;
    }

    deleteFrame() {
      if (this.frames.length === 1) return false;
      this.frames.splice(this.activeFrameIndex, 1);
      this.ensureFrameIndex(this.activeFrameIndex);
      return true;
    }

    moveFrame(delta) {
      const target = this.activeFrameIndex + delta;
      if (target < 0 || target >= this.frames.length) return false;
      const temp = this.frames[this.activeFrameIndex];
      this.frames[this.activeFrameIndex] = this.frames[target];
      this.frames[target] = temp;
      this.activeFrameIndex = target;
      return true;
    }

    copyFrame() {
      this.frameClipboard = this.cloneGrid(this.activeFrame.pixels);
    }

    pasteFrame() {
      if (!this.frameClipboard) return false;
      this.activeFrame.pixels = this.cloneGrid(this.frameClipboard);
      return true;
    }

    clearFrame() {
      this.activeFrame.pixels = this.makeGrid(this.cols, this.rows, null);
    }

    resizeAllFrames(newCols, newRows) {
      this.frames = this.frames.map((frame) => {
        const next = this.makeGrid(newCols, newRows, null);
        for (let y = 0; y < Math.min(this.rows, newRows); y += 1) {
          for (let x = 0; x < Math.min(this.cols, newCols); x += 1) {
            next[y][x] = frame.pixels[y][x];
          }
        }
        return { ...frame, pixels: next };
      });
      this.cols = newCols;
      this.rows = newRows;
      this.selection = null;
    }

    setSelection(rect) {
      this.selection = rect;
    }

    clearSelection() {
      this.selection = null;
    }

    readSelection() {
      if (!this.selection) return null;
      const block = [];
      for (let y = 0; y < this.selection.height; y += 1) {
        const row = [];
        for (let x = 0; x < this.selection.width; x += 1) {
          row.push(this.getPixel(this.selection.x + x, this.selection.y + y));
        }
        block.push(row);
      }
      return { width: this.selection.width, height: this.selection.height, pixels: block };
    }

    copySelection() {
      const block = this.readSelection();
      if (!block) return false;
      this.selectionClipboard = block;
      return true;
    }

    cutSelection() {
      const block = this.readSelection();
      if (!block) return false;
      this.selectionClipboard = block;
      for (let y = 0; y < this.selection.height; y += 1) {
        for (let x = 0; x < this.selection.width; x += 1) {
          this.setPixel(this.selection.x + x, this.selection.y + y, null, false);
        }
      }
      return true;
    }

    pasteSelection(targetX, targetY) {
      if (!this.selectionClipboard) return false;
      for (let y = 0; y < this.selectionClipboard.height; y += 1) {
        for (let x = 0; x < this.selectionClipboard.width; x += 1) {
          const tx = targetX + x;
          const ty = targetY + y;
          if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) continue;
          this.activeFrame.pixels[ty][tx] = this.selectionClipboard.pixels[y][x];
        }
      }
      return true;
    }

    flipSelection(horizontal) {
      const block = this.readSelection();
      if (!block) return false;
      const next = block.pixels.map((row) => row.slice());
      if (horizontal) next.forEach((row) => row.reverse());
      else next.reverse();
      for (let y = 0; y < block.height; y += 1) {
        for (let x = 0; x < block.width; x += 1) {
          this.activeFrame.pixels[this.selection.y + y][this.selection.x + x] = next[y][x];
        }
      }
      return true;
    }

    buildExportPayload() {
      return {
        version: 20,
        kind: "sprite-editor-v2",
        cols: this.cols,
        rows: this.rows,
        transparentColor: this.transparentColor,
        palette: this.palette.slice(),
        currentColor: this.currentColor,
        sheet: { ...this.sheet },
        frames: this.frames.map((frame) => ({
          id: frame.id,
          name: frame.name,
          pixels: this.cloneGrid(frame.pixels)
        }))
      };
    }

    importPayload(payload) {
      this.cols = Math.max(4, Math.min(64, Number(payload.cols || 16)));
      this.rows = Math.max(4, Math.min(64, Number(payload.rows || 16)));
      this.transparentColor = payload.transparentColor ?? null;
      this.palette = Array.isArray(payload.palette) && payload.palette.length ? payload.palette.slice() : this.palette.slice();
      this.currentColor = payload.currentColor || this.palette[0];
      this.sheet = { ...this.sheet, ...(payload.sheet || {}) };

      if (Array.isArray(payload.frames) && payload.frames.length) {
        this.frames = payload.frames.map((frame, index) => ({
          id: frame.id || "f_" + Math.random().toString(36).slice(2, 10),
          name: frame.name || ("Frame " + (index + 1)),
          pixels: this.importPixels(frame.pixels)
        }));
      } else if (Array.isArray(payload.pixels)) {
        this.frames = [{
          id: "f_" + Math.random().toString(36).slice(2, 10),
          name: "Frame 1",
          pixels: this.importPixels(payload.pixels)
        }];
      } else {
        this.frames = [this.createFrame("Frame 1")];
      }

      this.activeFrameIndex = 0;
      this.selection = null;
    }

    importPixels(sourcePixels) {
      const next = this.makeGrid(this.cols, this.rows, null);
      if (!Array.isArray(sourcePixels)) return next;
      for (let y = 0; y < Math.min(this.rows, sourcePixels.length); y += 1) {
        const row = sourcePixels[y];
        if (!Array.isArray(row)) continue;
        for (let x = 0; x < Math.min(this.cols, row.length); x += 1) {
          next[y][x] = row[x] || null;
        }
      }
      return next;
    }

    computeSheetPlacement() {
      const count = this.frames.length;
      const padding = this.sheet.padding;
      const spacing = this.sheet.spacing;
      let columns = 1;
      let rows = 1;

      if (this.sheet.layout === "horizontal") {
        columns = count;
        rows = 1;
      } else if (this.sheet.layout === "vertical") {
        columns = 1;
        rows = count;
      } else {
        columns = Math.max(1, Math.min(this.sheet.columns || 1, count));
        rows = Math.ceil(count / columns);
      }

      const width = padding * 2 + columns * this.cols + Math.max(0, columns - 1) * spacing;
      const height = padding * 2 + rows * this.rows + Math.max(0, rows - 1) * spacing;
      const entries = [];

      for (let index = 0; index < count; index += 1) {
        const col = index % columns;
        const row = Math.floor(index / columns);
        entries.push({
          x: padding + col * (this.cols + spacing),
          y: padding + row * (this.rows + spacing)
        });
      }

      return { width, height, columns, rows, entries };
    }

    buildSheetMetadata() {
      const placement = this.computeSheetPlacement();
      return {
        version: 1,
        kind: "sprite-sheet",
        frameCount: this.frames.length,
        frameSize: { width: this.cols, height: this.rows },
        sheetSize: { width: placement.width, height: placement.height },
        layout: this.sheet.layout,
        padding: this.sheet.padding,
        spacing: this.sheet.spacing,
        frames: this.frames.map((frame, index) => ({
          index,
          id: frame.id,
          name: frame.name,
          x: placement.entries[index].x,
          y: placement.entries[index].y,
          width: this.cols,
          height: this.rows
        }))
      };
    }
  }

  class SpriteEditorCanvasControlSurface {
    constructor(app) {
      this.app = app;
      this.controls = [];
      this.hoveredControlId = null;
      this.pressedControlId = null;
      this.layout = null;
    }

    rebuildLayout(canvasWidth, canvasHeight) {
      const sidebarLeft = 220;
      const sidebarRight = 300;
      const topBar = 78;
      const bottomBar = 132;
      const pad = 16;
      const gridArea = {
        x: sidebarLeft + pad,
        y: topBar + pad,
        width: canvasWidth - sidebarLeft - sidebarRight - pad * 2,
        height: canvasHeight - topBar - bottomBar - pad * 2
      };

      this.layout = {
        canvasWidth,
        canvasHeight,
        topBar,
        bottomBar,
        sidebarLeft,
        sidebarRight,
        pad,
        gridArea,
        leftPanel: { x: 0, y: topBar, width: sidebarLeft, height: canvasHeight - topBar - bottomBar },
        rightPanel: { x: canvasWidth - sidebarRight, y: topBar, width: sidebarRight, height: canvasHeight - topBar - bottomBar },
        bottomPanel: { x: 0, y: canvasHeight - bottomBar, width: canvasWidth, height: bottomBar }
      };

      this.controls = [];
      this.buildTopBarControls();
      this.buildLeftToolControls();
      this.buildRightFrameControls();
      this.buildBottomControls();
    }

    buildTopBarControls() {
      const { pad } = this.layout;
      let x = pad;
      const y = 18;
      const h = 42;

      this.addButton("file-save", x, y, 92, h, "Save", () => this.app.saveLocal()); x += 100;
      this.addButton("file-load", x, y, 92, h, "Load", () => this.app.loadLocal()); x += 100;
      this.addButton("file-import", x, y, 92, h, "Import", () => this.app.openImport()); x += 100;
      this.addButton("file-export-json", x, y, 120, h, "Export JSON", () => this.app.exportJson(true)); x += 128;
      this.addButton("file-export-png", x, y, 110, h, "PNG Sheet", () => this.app.downloadSheetPng()); x += 118;
      this.addButton("file-export-meta", x, y, 128, h, "Sheet Meta", () => this.app.exportSheetMetadata()); x += 136;
      this.addButton("anim-play", x, y, 78, h, "Play", () => this.app.togglePlayback(true)); x += 86;
      this.addButton("anim-pause", x, y, 84, h, "Pause", () => this.app.togglePlayback(false));
    }

    buildLeftToolControls() {
      const left = this.layout.leftPanel;
      let x = 20;
      let y = left.y + 18;
      const w = left.width - 40;
      const h = 38;

      this.addLabel("tools-label", x, y, w, 24, "TOOLS"); y += 28;
      [["tool-brush", "Brush"], ["tool-erase", "Erase"], ["tool-fill", "Fill"], ["tool-eyedropper", "Eye"], ["tool-select", "Select"]]
        .forEach(([id, label]) => {
          this.addButton(id, x, y, w, h, label, () => this.app.setTool(label.toLowerCase() === "eye" ? "eyedropper" : label.toLowerCase()), { activeKey: "tool:" + (label.toLowerCase() === "eye" ? "eyedropper" : label.toLowerCase()) });
          y += 46;
        });

      y += 6;
      this.addLabel("selection-label", x, y, w, 24, "SELECTION"); y += 28;
      [["sel-copy", "Copy"], ["sel-cut", "Cut"], ["sel-paste", "Paste"], ["sel-fliph", "Flip H"], ["sel-flipv", "Flip V"], ["sel-clear", "Clear"]]
        .forEach(([id, label]) => {
          this.addButton(id, x, y, w, h, label, () => this.app.handleSelectionAction(id));
          y += 46;
        });

      y += 6;
      this.addLabel("sheet-label", x, y, w, 24, "SHEET"); y += 28;
      this.addButton("sheet-layout", x, y, w, h, "Layout: " + this.app.document.sheet.layout, () => this.app.cycleSheetLayout()); y += 46;
      this.addButton("sheet-padding", x, y, w, h, "Padding: " + this.app.document.sheet.padding, () => this.app.adjustSheetPadding(1)); y += 46;
      this.addButton("sheet-spacing", x, y, w, h, "Spacing: " + this.app.document.sheet.spacing, () => this.app.adjustSheetSpacing(1)); y += 46;
      this.addButton("sheet-bg", x, y, w, h, this.app.document.sheet.transparent ? "BG: Transparent" : "BG: Solid", () => this.app.toggleSheetBackgroundMode()); y += 46;
      this.addButton("sheet-render", x, y, w, h, "Render Sheet", () => this.app.renderAll());
    }

    buildRightFrameControls() {
      const right = this.layout.rightPanel;
      const x = right.x + 20;
      let y = right.y + 18;
      const w = right.width - 40;
      const h = 38;

      this.addLabel("frames-label", x, y, w, 24, "FRAMES"); y += 28;
      this.addButton("frame-add", x, y, w, h, "Add Frame", () => this.app.addFrame()); y += 46;
      this.addButton("frame-duplicate", x, y, w, h, "Duplicate", () => this.app.duplicateFrame()); y += 46;
      this.addButton("frame-delete", x, y, w, h, "Delete", () => this.app.deleteFrame()); y += 46;
      this.addButton("frame-left", x, y, w, h, "Move Left", () => this.app.moveFrame(-1)); y += 46;
      this.addButton("frame-right", x, y, w, h, "Move Right", () => this.app.moveFrame(1)); y += 46;
      this.addButton("frame-copy", x, y, w, h, "Copy Frame", () => this.app.copyFrame()); y += 46;
      this.addButton("frame-paste", x, y, w, h, "Paste Frame", () => this.app.pasteFrame()); y += 54;

      const thumbH = 60;
      this.app.document.frames.forEach((frame, index) => {
        this.addFrameThumb("frame-thumb-" + index, x, y, w, thumbH, frame.name, index);
        y += thumbH + 8;
      });
    }

    buildBottomControls() {
      const bottom = this.layout.bottomPanel;
      const swatchSize = 34;
      const gap = 8;
      const x0 = 18;
      let x = x0;
      const y = bottom.y + 20;

      this.addLabel("palette-label", x, y - 16, 240, 16, "PALETTE");
      this.app.document.palette.forEach((color, index) => {
        this.addPalette("palette-" + index, x, y, swatchSize, swatchSize, color, index);
        x += swatchSize + gap;
      });

      x += 20;
      this.addButton("color-next", x, y, 90, 34, "Next", () => this.app.nextColor()); x += 98;
      this.addButton("mirror-toggle", x, y, 108, 34, this.app.mirror ? "Mirror: On" : "Mirror: Off", () => this.app.toggleMirror());
    }

    addButton(id, x, y, width, height, text, action, options = {}) {
      this.controls.push({ kind: "button", id, x, y, width, height, text, action, options });
    }

    addLabel(id, x, y, width, height, text) {
      this.controls.push({ kind: "label", id, x, y, width, height, text });
    }

    addPalette(id, x, y, width, height, color, index) {
      this.controls.push({ kind: "palette", id, x, y, width, height, color, index });
    }

    addFrameThumb(id, x, y, width, height, text, frameIndex) {
      this.controls.push({ kind: "frame-thumb", id, x, y, width, height, text, frameIndex });
    }

    getControlAt(x, y) {
      for (let i = this.controls.length - 1; i >= 0; i -= 1) {
        const c = this.controls[i];
        if (c.kind === "label") continue;
        if (x >= c.x && y >= c.y && x <= c.x + c.width && y <= c.y + c.height) return c;
      }
      return null;
    }

    updateHover(x, y) {
      const control = this.getControlAt(x, y);
      this.hoveredControlId = control ? control.id : null;
    }

    pointerDown(x, y) {
      const control = this.getControlAt(x, y);
      this.pressedControlId = control ? control.id : null;
      return control;
    }

    pointerUp(x, y) {
      const control = this.getControlAt(x, y);
      const shouldTrigger = control && control.id === this.pressedControlId;
      this.pressedControlId = null;
      if (!shouldTrigger) return false;

      if (control.kind === "palette") {
        this.app.setCurrentColor(control.color);
        return true;
      }

      if (control.kind === "frame-thumb") {
        this.app.selectFrame(control.frameIndex);
        return true;
      }

      if (typeof control.action === "function") {
        control.action();
        return true;
      }

      return false;
    }

    draw(ctx) {
      if (!this.layout) return;

      const { canvasWidth, canvasHeight, topBar, leftPanel, rightPanel, bottomPanel } = this.layout;

      ctx.fillStyle = "#10151d";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "#16202b";
      ctx.fillRect(0, 0, canvasWidth, topBar);
      ctx.fillRect(leftPanel.x, leftPanel.y, leftPanel.width, leftPanel.height);
      ctx.fillRect(rightPanel.x, rightPanel.y, rightPanel.width, rightPanel.height);
      ctx.fillRect(bottomPanel.x, bottomPanel.y, bottomPanel.width, bottomPanel.height);

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.strokeRect(0, 0, canvasWidth, topBar);
      ctx.strokeRect(leftPanel.x, leftPanel.y, leftPanel.width, leftPanel.height);
      ctx.strokeRect(rightPanel.x, rightPanel.y, rightPanel.width, rightPanel.height);
      ctx.strokeRect(bottomPanel.x, bottomPanel.y, bottomPanel.width, bottomPanel.height);

      ctx.font = "13px Arial";
      ctx.textBaseline = "middle";

      this.controls.forEach((control) => this.drawControl(ctx, control));

      ctx.fillStyle = "#d8e2ee";
      ctx.font = "bold 18px Arial";
      ctx.fillText("Sprite Editor v2.0", canvasWidth / 2 - 90, 39);
    }

    drawControl(ctx, control) {
      if (control.kind === "label") {
        ctx.fillStyle = "#91a3b6";
        ctx.font = "bold 12px Arial";
        ctx.fillText(control.text, control.x, control.y + control.height / 2);
        return;
      }

      if (control.kind === "palette") {
        ctx.fillStyle = control.color;
        ctx.fillRect(control.x, control.y, control.width, control.height);
        const isCurrent = this.app.document.currentColor === control.color;
        ctx.strokeStyle = isCurrent ? "#4cc9f0" : "rgba(255,255,255,0.2)";
        ctx.lineWidth = isCurrent ? 3 : 1;
        ctx.strokeRect(control.x + 0.5, control.y + 0.5, control.width - 1, control.height - 1);
        return;
      }

      const isHovered = this.hoveredControlId === control.id;
      const isPressed = this.pressedControlId === control.id;
      const isFrameThumb = control.kind === "frame-thumb";
      const isActiveFrame = isFrameThumb && this.app.document.activeFrameIndex === control.frameIndex;
      const toolActive = control.options && control.options.activeKey === ("tool:" + this.app.activeTool);

      ctx.fillStyle = isPressed ? "#27435a" : (isHovered ? "#223444" : "#1a2733");
      if (toolActive || isActiveFrame) ctx.fillStyle = "#244d67";
      ctx.fillRect(control.x, control.y, control.width, control.height);
      ctx.strokeStyle = toolActive || isActiveFrame ? "#4cc9f0" : "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(control.x + 0.5, control.y + 0.5, control.width - 1, control.height - 1);

      ctx.fillStyle = "#edf2f7";
      ctx.font = isFrameThumb ? "12px Arial" : "13px Arial";
      ctx.fillText(control.text, control.x + 10, control.y + control.height / 2);

      if (isFrameThumb) {
        const frame = this.app.document.frames[control.frameIndex];
        this.drawMiniFrame(ctx, frame.pixels, control.x + control.width - 54, control.y + 8, 46, control.height - 16);
      }
    }

    drawMiniFrame(ctx, pixels, x, y, width, height) {
      const cols = this.app.document.cols;
      const rows = this.app.document.rows;
      const pixelW = Math.max(1, Math.floor(width / cols));
      const pixelH = Math.max(1, Math.floor(height / rows));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, width, height);
      for (let py = 0; py < rows; py += 1) {
        for (let px = 0; px < cols; px += 1) {
          const value = pixels[py][px];
          if (!value) continue;
          ctx.fillStyle = value;
          ctx.fillRect(x + px * pixelW, y + py * pixelH, pixelW, pixelH);
        }
      }
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    }
  }

  class SpriteEditorApp {
    constructor(canvas, fileInput, downloadLink) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.fileInput = fileInput;
      this.downloadLink = downloadLink;
      this.document = new SpriteEditorDocument();
      this.controlSurface = new SpriteEditorCanvasControlSurface(this);
      this.activeTool = "brush";
      this.hoveredGridCell = null;
      this.isPointerDown = false;
      this.mirror = false;
      this.selectionPasteOrigin = { x: 0, y: 0 };
      this.playback = { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, lastTick: 0 };
      this.statusMessage = "Canvas-native editor ready.";
      this.flashMessageUntil = 0;
      this.gridRect = null;

      this.resizeCanvas();
      this.bindEvents();
      this.renderAll();
      requestAnimationFrame((ts) => this.tick(ts));
    }

    bindEvents() {
      window.addEventListener("resize", () => {
        this.resizeCanvas();
        this.renderAll();
      });

      this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
      this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
      window.addEventListener("pointerup", (event) => this.onPointerUp(event));
      this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());

      window.addEventListener("keydown", (event) => this.onKeyDown(event));

      this.fileInput.addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
          this.document.importPayload(JSON.parse(text));
          this.showMessage("Imported sprite JSON.");
          this.renderAll();
        } catch (error) {
          this.showMessage("Import failed.");
        }
        this.fileInput.value = "";
      });
    }

    resizeCanvas() {
      this.canvas.width = Math.max(1200, window.innerWidth);
      this.canvas.height = Math.max(820, window.innerHeight);
      this.controlSurface.rebuildLayout(this.canvas.width, this.canvas.height);
      this.gridRect = this.computeGridRect();
    }

    computeGridRect() {
      const area = this.controlSurface.layout.gridArea;
      const pixelSize = Math.max(12, Math.floor(Math.min(area.width / this.document.cols, area.height / this.document.rows)));
      const width = this.document.cols * pixelSize;
      const height = this.document.rows * pixelSize;
      return {
        x: area.x + Math.floor((area.width - width) / 2),
        y: area.y + Math.floor((area.height - height) / 2),
        width,
        height,
        pixelSize
      };
    }

    onPointerMove(event) {
      const pos = this.getCanvasPoint(event);
      this.controlSurface.updateHover(pos.x, pos.y);
      const gridCell = this.getGridCellAt(pos.x, pos.y);
      this.hoveredGridCell = gridCell;

      if (this.isPointerDown) {
        if (this.activeTool === "select" && this.selectionStart && gridCell) {
          this.setSelectionFromTwoCells(this.selectionStart, gridCell);
          this.renderAll();
          return;
        }

        if (gridCell && this.activeTool !== "select") {
          this.applyGridTool(gridCell.x, gridCell.y, event.buttons === 2);
          this.renderAll();
        }
      } else {
        this.renderAll();
      }
    }

    onPointerDown(event) {
      const pos = this.getCanvasPoint(event);
      const control = this.controlSurface.pointerDown(pos.x, pos.y);
      if (control) {
        this.renderAll();
        return;
      }

      const gridCell = this.getGridCellAt(pos.x, pos.y);
      if (!gridCell) return;

      this.isPointerDown = true;
      this.hoveredGridCell = gridCell;

      if (this.activeTool === "select") {
        this.selectionStart = gridCell;
        this.setSelectionFromTwoCells(gridCell, gridCell);
        this.renderAll();
        return;
      }

      this.applyGridTool(gridCell.x, gridCell.y, event.button === 2);
      this.renderAll();
    }

    onPointerUp(event) {
      const pos = this.getCanvasPoint(event);
      const activated = this.controlSurface.pointerUp(pos.x, pos.y);
      if (activated) {
        this.renderAll();
      }
      this.isPointerDown = false;
      this.selectionStart = null;
    }

    onKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key === "b") this.setTool("brush");
      else if (key === "e") this.setTool("erase");
      else if (key === "f") this.setTool("fill");
      else if (key === "i") this.setTool("eyedropper");
      else if (key === "s") this.setTool("select");
      else if (key === "p") this.togglePlayback();
      else if (key === "[") this.selectFrame(this.document.activeFrameIndex - 1);
      else if (key === "]") this.selectFrame(this.document.activeFrameIndex + 1);
      else if (event.ctrlKey && key === "c") {
        if (this.document.selection) this.handleSelectionAction("sel-copy");
        else this.copyFrame();
      } else if (event.ctrlKey && key === "x") {
        if (this.document.selection) this.handleSelectionAction("sel-cut");
      } else if (event.ctrlKey && key === "v") {
        if (this.document.selectionClipboard) this.handleSelectionAction("sel-paste");
        else this.pasteFrame();
      } else if (key === "delete") {
        if (this.document.selection) this.handleSelectionAction("sel-cut");
        else this.document.clearFrame();
      } else {
        return;
      }
      event.preventDefault();
      this.renderAll();
    }

    getCanvasPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
      };
    }

    getGridCellAt(x, y) {
      if (!this.gridRect) return null;
      if (x < this.gridRect.x || y < this.gridRect.y || x > this.gridRect.x + this.gridRect.width || y > this.gridRect.y + this.gridRect.height) return null;
      return {
        x: Math.floor((x - this.gridRect.x) / this.gridRect.pixelSize),
        y: Math.floor((y - this.gridRect.y) / this.gridRect.pixelSize)
      };
    }

    setSelectionFromTwoCells(a, b) {
      const left = Math.min(a.x, b.x);
      const top = Math.min(a.y, b.y);
      const right = Math.max(a.x, b.x);
      const bottom = Math.max(a.y, b.y);
      this.document.setSelection({ x: left, y: top, width: right - left + 1, height: bottom - top + 1 });
      this.selectionPasteOrigin = { x: left, y: top };
    }

    applyGridTool(x, y, eraseWithButton) {
      if (this.activeTool === "eyedropper") {
        const value = this.document.getPixel(x, y);
        if (value) this.setCurrentColor(value);
        this.showMessage("Picked color.");
        return;
      }

      if (this.activeTool === "fill") {
        const value = eraseWithButton ? null : this.document.currentColor;
        this.document.floodFill(x, y, value, this.mirror);
        return;
      }

      const value = (eraseWithButton || this.activeTool === "erase") ? null : this.document.currentColor;
      this.document.setPixel(x, y, value, this.mirror);
    }

    setTool(tool) {
      this.activeTool = tool;
      this.showMessage("Tool: " + tool);
    }

    setCurrentColor(color) {
      this.document.currentColor = color;
      this.showMessage("Color selected.");
    }

    nextColor() {
      const palette = this.document.palette;
      const index = palette.indexOf(this.document.currentColor);
      const nextIndex = index >= 0 ? (index + 1) % palette.length : 0;
      this.document.currentColor = palette[nextIndex];
      this.showMessage("Color cycled.");
      this.renderAll();
    }

    toggleMirror() {
      this.mirror = !this.mirror;
      this.showMessage(this.mirror ? "Mirror on." : "Mirror off.");
      this.renderAll();
    }

    handleSelectionAction(actionId) {
      let ok = false;
      if (actionId === "sel-copy") ok = this.document.copySelection();
      else if (actionId === "sel-cut") ok = this.document.cutSelection();
      else if (actionId === "sel-paste") ok = this.document.pasteSelection(this.selectionPasteOrigin.x, this.selectionPasteOrigin.y);
      else if (actionId === "sel-fliph") ok = this.document.flipSelection(true);
      else if (actionId === "sel-flipv") ok = this.document.flipSelection(false);
      else if (actionId === "sel-clear") {
        this.document.clearSelection();
        ok = true;
      }
      this.showMessage(ok ? "Selection updated." : "No active selection.");
      this.renderAll();
    }

    addFrame() {
      this.document.addFrame();
      this.showMessage("Frame added.");
      this.renderAll();
    }

    duplicateFrame() {
      this.document.duplicateFrame();
      this.showMessage("Frame duplicated.");
      this.renderAll();
    }

    deleteFrame() {
      this.showMessage(this.document.deleteFrame() ? "Frame deleted." : "Cannot delete last frame.");
      this.renderAll();
    }

    moveFrame(delta) {
      this.showMessage(this.document.moveFrame(delta) ? "Frame moved." : "Cannot move frame further.");
      this.renderAll();
    }

    selectFrame(index) {
      const clamped = Math.max(0, Math.min(index, this.document.frames.length - 1));
      this.document.activeFrameIndex = clamped;
      this.playback.previewFrameIndex = clamped;
      this.document.clearSelection();
      this.renderAll();
    }

    copyFrame() {
      this.document.copyFrame();
      this.showMessage("Frame copied.");
      this.renderAll();
    }

    pasteFrame() {
      this.showMessage(this.document.pasteFrame() ? "Frame pasted." : "No copied frame.");
      this.renderAll();
    }

    cycleSheetLayout() {
      const order = ["horizontal", "vertical", "grid"];
      const current = order.indexOf(this.document.sheet.layout);
      this.document.sheet.layout = order[(current + 1) % order.length];
      this.showMessage("Sheet layout: " + this.document.sheet.layout);
      this.renderAll();
    }

    adjustSheetPadding(delta) {
      this.document.sheet.padding = Math.max(0, Math.min(64, this.document.sheet.padding + delta));
      this.showMessage("Sheet padding: " + this.document.sheet.padding);
      this.renderAll();
    }

    adjustSheetSpacing(delta) {
      this.document.sheet.spacing = Math.max(0, Math.min(32, this.document.sheet.spacing + delta));
      this.showMessage("Sheet spacing: " + this.document.sheet.spacing);
      this.renderAll();
    }

    toggleSheetBackgroundMode() {
      this.document.sheet.transparent = !this.document.sheet.transparent;
      this.showMessage(this.document.sheet.transparent ? "Sheet background transparent." : "Sheet background solid.");
      this.renderAll();
    }

    togglePlayback(forceState = null) {
      if (typeof forceState === "boolean") this.playback.isPlaying = forceState;
      else this.playback.isPlaying = !this.playback.isPlaying;
      if (this.playback.isPlaying) {
        this.playback.previewFrameIndex = 0;
        this.playback.lastTick = performance.now();
      }
      this.showMessage(this.playback.isPlaying ? "Playback started." : "Playback paused.");
      this.renderAll();
    }

    saveLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.document.buildExportPayload()));
      this.showMessage("Saved locally.");
    }

    loadLocal() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.showMessage("No local save.");
        return;
      }
      try {
        this.document.importPayload(JSON.parse(raw));
        this.showMessage("Loaded local save.");
        this.renderAll();
      } catch (error) {
        this.showMessage("Load failed.");
      }
    }

    openImport() {
      this.fileInput.click();
    }

    exportJson(pretty) {
      const payload = JSON.stringify(this.document.buildExportPayload(), null, pretty ? 2 : 0);
      this.downloadBlob("sprite-editor.json", payload, "application/json");
      this.showMessage("JSON exported.");
    }

    exportSheetMetadata() {
      const payload = JSON.stringify(this.document.buildSheetMetadata(), null, 2);
      this.downloadBlob("sprite-sheet-meta.json", payload, "application/json");
      this.showMessage("Sheet metadata exported.");
    }

    downloadSheetPng() {
      const { width, height } = this.document.computeSheetPlacement();
      const temp = document.createElement("canvas");
      temp.width = width;
      temp.height = height;
      const ctx = temp.getContext("2d");
      this.drawSheetPreview(ctx, { x: 0, y: 0, width, height }, false);
      this.downloadLink.download = "sprite-sheet.png";
      this.downloadLink.href = temp.toDataURL("image/png");
      this.downloadLink.click();
      this.showMessage("PNG sheet exported.");
    }

    downloadBlob(filename, text, mimeType) {
      const blob = new Blob([text], { type: mimeType });
      const url = URL.createObjectURL(blob);
      this.downloadLink.download = filename;
      this.downloadLink.href = url;
      this.downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    showMessage(message) {
      this.statusMessage = message;
      this.flashMessageUntil = performance.now() + 1800;
    }

    tick(timestamp) {
      if (this.playback.isPlaying) {
        const frameDuration = 1000 / this.playback.fps;
        if (timestamp - this.playback.lastTick >= frameDuration) {
          this.playback.lastTick = timestamp;
          if (this.playback.previewFrameIndex < this.document.frames.length - 1) {
            this.playback.previewFrameIndex += 1;
          } else if (this.playback.loop) {
            this.playback.previewFrameIndex = 0;
          } else {
            this.playback.isPlaying = false;
          }
          this.renderAll();
        }
      }
      requestAnimationFrame((ts) => this.tick(ts));
    }

    renderAll() {
      this.controlSurface.rebuildLayout(this.canvas.width, this.canvas.height);
      this.gridRect = this.computeGridRect();
      this.controlSurface.draw(this.ctx);
      this.drawMainGrid();
      this.drawPreviewPanel();
      this.drawSheetPanel();
      this.drawBottomStatus();
    }

    drawMainGrid() {
      const r = this.gridRect;
      const ctx = this.ctx;
      const pixels = this.document.activeFrame.pixels;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(r.x, r.y, r.width, r.height);

      for (let y = 0; y < this.document.rows; y += 1) {
        for (let x = 0; x < this.document.cols; x += 1) {
          const value = pixels[y][x];
          if (!value) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#f8fafc" : "#e2e8f0";
          } else {
            ctx.fillStyle = value;
          }
          ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }

      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      for (let x = 0; x <= this.document.cols; x += 1) {
        ctx.beginPath();
        ctx.moveTo(r.x + x * r.pixelSize + 0.5, r.y);
        ctx.lineTo(r.x + x * r.pixelSize + 0.5, r.y + r.height);
        ctx.stroke();
      }
      for (let y = 0; y <= this.document.rows; y += 1) {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + y * r.pixelSize + 0.5);
        ctx.lineTo(r.x + r.width, r.y + y * r.pixelSize + 0.5);
        ctx.stroke();
      }

      if (this.hoveredGridCell) {
        ctx.strokeStyle = "#4cc9f0";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          r.x + this.hoveredGridCell.x * r.pixelSize + 1,
          r.y + this.hoveredGridCell.y * r.pixelSize + 1,
          r.pixelSize - 2,
          r.pixelSize - 2
        );
      }

      if (this.document.selection) {
        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          r.x + this.document.selection.x * r.pixelSize + 1,
          r.y + this.document.selection.y * r.pixelSize + 1,
          this.document.selection.width * r.pixelSize - 2,
          this.document.selection.height * r.pixelSize - 2
        );
      }
    }

    drawPreviewPanel() {
      const panel = this.controlSurface.layout.rightPanel;
      const x = panel.x + 24;
      const y = panel.y + panel.height - 250;
      const width = panel.width - 48;
      const height = 96;

      this.ctx.fillStyle = "#1a2733";
      this.ctx.fillRect(x, y, width, height);
      this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
      this.ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 12px Arial";
      this.ctx.fillText("ANIMATION PREVIEW", x + 12, y + 16);

      const previewFrame = this.playback.isPlaying ? this.document.frames[this.playback.previewFrameIndex] : this.document.activeFrame;
      this.drawMiniPixels(previewFrame.pixels, x + 12, y + 24, 72, 72);

      this.ctx.font = "12px Arial";
      this.ctx.fillText("Frame " + (this.document.activeFrameIndex + 1) + " / " + this.document.frames.length, x + 96, y + 36);
      this.ctx.fillText(this.playback.isPlaying ? "Playing" : "Paused", x + 96, y + 58);
      this.ctx.fillText("P play/pause  [ ] frame", x + 96, y + 80);
    }

    drawSheetPanel() {
      const panel = this.controlSurface.layout.rightPanel;
      const x = panel.x + 24;
      const y = panel.y + panel.height - 140;
      const width = panel.width - 48;
      const height = 104;
      this.drawSheetPreview(this.ctx, { x, y, width, height }, true);
    }

    drawSheetPreview(ctx, rect, withChrome) {
      const placement = this.document.computeSheetPlacement();
      if (withChrome) {
        ctx.fillStyle = "#1a2733";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "bold 12px Arial";
        ctx.fillText("SHEET PREVIEW", rect.x + 12, rect.y + 16);
      }

      const contentX = rect.x + (withChrome ? 12 : 0);
      const contentY = rect.y + (withChrome ? 24 : 0);
      const contentW = rect.width - (withChrome ? 24 : 0);
      const contentH = rect.height - (withChrome ? 32 : 0);

      const scale = Math.max(1, Math.floor(Math.min(contentW / placement.width, contentH / placement.height)));

      if (this.document.sheet.transparent) {
        this.drawCheckerboard(ctx, contentX, contentY, placement.width * scale, placement.height * scale, Math.max(4, scale));
      } else {
        ctx.fillStyle = this.document.sheet.backgroundColor;
        ctx.fillRect(contentX, contentY, placement.width * scale, placement.height * scale);
      }

      this.document.frames.forEach((frame, index) => {
        const entry = placement.entries[index];
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            const value = frame.pixels[y][x];
            if (!value) continue;
            ctx.fillStyle = value;
            ctx.fillRect(contentX + (entry.x + x) * scale, contentY + (entry.y + y) * scale, scale, scale);
          }
        }
      });

      if (withChrome) {
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "11px Arial";
        ctx.fillText("Order: " + this.document.frames.map((_, i) => i + 1).join(", "), rect.x + 12, rect.y + rect.height - 10);
      }
    }

    drawMiniPixels(pixels, x, y, width, height) {
      const cols = this.document.cols;
      const rows = this.document.rows;
      const pixelW = Math.max(1, Math.floor(width / cols));
      const pixelH = Math.max(1, Math.floor(height / rows));
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(x, y, width, height);
      for (let py = 0; py < rows; py += 1) {
        for (let px = 0; px < cols; px += 1) {
          const value = pixels[py][px];
          if (!value) continue;
          this.ctx.fillStyle = value;
          this.ctx.fillRect(x + px * pixelW, y + py * pixelH, pixelW, pixelH);
        }
      }
      this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
      this.ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    }

    drawCheckerboard(ctx, x, y, width, height, blockSize) {
      for (let py = 0; py < height; py += blockSize) {
        for (let px = 0; px < width; px += blockSize) {
          ctx.fillStyle = ((Math.floor(px / blockSize) + Math.floor(py / blockSize)) % 2 === 0) ? "#f8fafc" : "#e2e8f0";
          ctx.fillRect(x + px, y + py, blockSize, blockSize);
        }
      }
    }

    drawBottomStatus() {
      const bottom = this.controlSurface.layout.bottomPanel;
      const y = bottom.y + 78;
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "12px Arial";
      const selectionText = this.document.selection
        ? `Selection ${this.document.selection.width}x${this.document.selection.height} @ ${this.document.selection.x},${this.document.selection.y}`
        : "No selection";
      const hoverText = this.hoveredGridCell ? `Cell ${this.hoveredGridCell.x},${this.hoveredGridCell.y}` : "Cell -";
      this.ctx.fillText(`Tool: ${this.activeTool}   |   ${hoverText}   |   ${selectionText}`, 18, y);
      this.ctx.fillText("B brush  E erase  F fill  I eye  S select  P play/pause  [ ] frame  Ctrl+C/X/V", 18, y + 22);

      if (performance.now() < this.flashMessageUntil) {
        this.ctx.fillStyle = "#4cc9f0";
      } else {
        this.ctx.fillStyle = "#91a3b6";
      }
      this.ctx.fillText(this.statusMessage, this.canvas.width - 360, y);
    }
  }

  const canvas = document.getElementById("spriteEditorCanvas");
  const fileInput = document.getElementById("spriteEditorFileInput");
  const downloadLink = document.getElementById("spriteEditorDownloadLink");
  new SpriteEditorApp(canvas, fileInput, downloadLink);
})();
