function installSpriteEditorViewToolMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    computeGridRect() {
      const area = this.controlSurface.layout.gridArea;
      const basePixelSize = Math.max(12, Math.floor(Math.min(area.width / this.document.cols, area.height / this.document.rows)));
      const pixelSize = Math.max(4, Math.floor(basePixelSize * this.zoom));
      const width = this.document.cols * pixelSize;
      const height = this.document.rows * pixelSize;
      const maxPanX = Math.max(0, Math.floor((width - area.width) / 2) + 40);
      const maxPanY = Math.max(0, Math.floor((height - area.height) / 2) + 40);
      this.pan.x = Math.max(-maxPanX, Math.min(maxPanX, this.pan.x));
      this.pan.y = Math.max(-maxPanY, Math.min(maxPanY, this.pan.y));
      return {
        x: area.x + Math.floor((area.width - width) / 2) + this.pan.x,
        y: area.y + Math.floor((area.height - height) / 2) + this.pan.y,
        width,
        height,
        pixelSize
      };
    },

    logicalPointFromEvent(event) {
      return this.viewport.screenToLogical(event.clientX, event.clientY);
    },

    getGridCellAtLogical(x, y) {
      const rect = this.gridRect;
      if (!rect || x < rect.x || y < rect.y || x > rect.x + rect.width || y > rect.y + rect.height) return null;
      return { x: Math.floor((x - rect.x) / rect.pixelSize), y: Math.floor((y - rect.y) / rect.pixelSize) };
    },

    getToolLabel(tool) {
      const labels = {
        brush: "Brush",
        erase: "Erase",
        fill: "Fill",
        line: "Line",
        rect: "Rectangle",
        fillrect: "Fill Rectangle",
        eyedropper: "Eyedropper",
        select: "Select",
        reference: "Reference Image"
      };
      return labels[tool] || String(tool || "Tool");
    },

    getActiveToolDescription() {
      const descriptions = {
        brush: { primary: "Paint pixels with the active color.", secondary: "Drag for continuous strokes. 1-9 changes size." },
        erase: { primary: "Remove pixels from the active layer.", secondary: "Right-click also erases while drawing." },
        fill: { primary: "Flood fill connected pixels.", secondary: "Use when you want solid retro regions fast." },
        line: { primary: "Draw a straight pixel-perfect line.", secondary: "Click and drag to preview before committing." },
        rect: { primary: "Draw a rectangle outline.", secondary: "Drag to size the shape before release." },
        fillrect: { primary: "Draw a filled rectangle.", secondary: "Good for blocks, panels, and tile silhouettes." },
        eyedropper: { primary: "Sample a color from artwork.", secondary: "Click any painted cell to set the active color." },
        select: { primary: "Create or move a rectangular selection.", secondary: "Use arrows to nudge after selecting." },
        reference: { primary: "Adjust reference image workflow controls.", secondary: "Use left panel to import, scale, and auto-fit." }
      };
      return descriptions[this.activeTool] || { primary: "Choose a tool from the top Tools menu.", secondary: "Tool details appear here while you work." };
    },

    adjustZoom(delta) {
      this.zoom = Math.max(0.5, Math.min(8, Number((this.zoom + delta).toFixed(2))));
      this.gridRect = this.computeGridRect();
      this.showMessageAndRender("Zoom: " + this.zoom.toFixed(2) + "x");
    },

    resizeDocumentGrid(nextCols, nextRows) {
      return this.executeWithHistory(`Grid Resize ${nextCols}x${nextRows}`, () => {
        const prevCols = this.document.cols;
        const prevRows = this.document.rows;
        const cols = Math.max(1, Math.min(256, Math.floor(Number(nextCols) || this.document.cols)));
        const rows = Math.max(1, Math.min(256, Math.floor(Number(nextRows) || this.document.rows)));
        if (cols === this.document.cols && rows === this.document.rows) return false;
        const resizeGrid = (source) => Array.from({ length: rows }, (_row, y) =>
          Array.from({ length: cols }, (_col, x) => (source && source[y] && typeof source[y][x] !== "undefined") ? source[y][x] : null)
        );
        this.document.frames.forEach((frame) => {
          const normalized = this.document.ensureFrameLayers(frame);
          normalized.layers.forEach((layer) => {
            layer.pixels = resizeGrid(layer.pixels);
          });
        });
        if (this.document.frameClipboard && Array.isArray(this.document.frameClipboard.layers)) {
          this.document.frameClipboard.layers = this.document.frameClipboard.layers.map((layer) => ({
            ...layer,
            pixels: resizeGrid(layer && layer.pixels ? layer.pixels : null)
          }));
        }
        this.document.cols = cols;
        this.document.rows = rows;
        if (this.document.referenceImage && this.document.referenceImage.src) {
          const ref = this.document.referenceImage;
          const scaleX = cols / Math.max(1, prevCols);
          const scaleY = rows / Math.max(1, prevRows);
          ref.xCells = Math.round((Number(ref.xCells) || 0) * scaleX);
          ref.yCells = Math.round((Number(ref.yCells) || 0) * scaleY);
          ref.widthCells = Math.max(1, Math.round((Number(ref.widthCells) || prevCols) * scaleX));
          ref.heightCells = Math.max(1, Math.round((Number(ref.heightCells) || prevRows) * scaleY));
        }
        this.document.clearSelection();
        this.selectionMoveSession = null;
        this.gridRect = this.computeGridRect();
        this.showMessage(`Grid size: ${cols} x ${rows} (display rebuilt).`);
        return true;
      });
    },

    adjustGridCols(delta) {
      const ok = this.resizeDocumentGrid(this.document.cols + delta, this.document.rows);
      if (!ok) this.showMessage("Grid columns unchanged.");
      this.renderAll();
      return ok;
    },

    adjustGridRows(delta) {
      const ok = this.resizeDocumentGrid(this.document.cols, this.document.rows + delta);
      if (!ok) this.showMessage("Grid rows unchanged.");
      this.renderAll();
      return ok;
    },

    resetZoom() {
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.gridRect = this.computeGridRect();
      this.showMessageAndRender("Zoom/pan reset.");
    },

    togglePixelPerfect() {
      this.viewport.togglePixelPerfect();
      this.resize();
      this.showMessageAndRender(this.viewport.pixelPerfect ? "Pixel perfect on." : "Pixel perfect off.");
    },

    toggleOnionPrevious() {
      this.onionSkin.prev = !this.onionSkin.prev;
      this.showMessageAndRender(this.onionSkin.prev ? "Onion previous on." : "Onion previous off.");
    },

    toggleOnionNext() {
      this.onionSkin.next = !this.onionSkin.next;
      this.showMessageAndRender(this.onionSkin.next ? "Onion next on." : "Onion next off.");
    },

    setSelectionFromTwoCells(a, b) {
      const left = Math.min(a.x, b.x);
      const top = Math.min(a.y, b.y);
      const right = Math.max(a.x, b.x);
      const bottom = Math.max(a.y, b.y);
      this.document.setSelection({ x: left, y: top, width: right - left + 1, height: bottom - top + 1 });
      this.selectionPasteOrigin = { x: left, y: top };
    },

    getBrushCellsAt(x, y, size = this.brush.size, shape = this.brush.shape) {
      const cells = [];
      const radius = Math.floor(Math.max(1, size) / 2);
      for (let oy = -radius; oy <= radius; oy += 1) {
        for (let ox = -radius; ox <= radius; ox += 1) {
          if (shape === "circle") {
            const limit = radius + 0.25;
            if (Math.sqrt((ox * ox) + (oy * oy)) > limit) continue;
          }
          cells.push({ x: x + ox, y: y + oy });
        }
      }
      return cells;
    },

    getLineCells(a, b) {
      const cells = [];
      let x0 = a.x;
      let y0 = a.y;
      const x1 = b.x;
      const y1 = b.y;
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      while (true) {
        cells.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const e2 = err * 2;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
      return cells;
    },

    getRectCells(a, b, filled) {
      const left = Math.min(a.x, b.x);
      const right = Math.max(a.x, b.x);
      const top = Math.min(a.y, b.y);
      const bottom = Math.max(a.y, b.y);
      const cells = [];
      for (let y = top; y <= bottom; y += 1) {
        for (let x = left; x <= right; x += 1) {
          if (filled || x === left || x === right || y === top || y === bottom) {
            cells.push({ x, y });
          }
        }
      }
      return cells;
    },

    getShapeCells(start, end, tool) {
      if (!start || !end) return [];
      if (tool === "line") return this.getLineCells(start, end);
      if (tool === "rect") return this.getRectCells(start, end, false);
      if (tool === "fillrect") return this.getRectCells(start, end, true);
      return [];
    },

    applyBrushStamp(x, y, erase) {
      const value = erase ? null : this.document.currentColor;
      const cells = this.getBrushCellsAt(x, y);
      cells.forEach((cell) => this.document.setPixel(cell.x, cell.y, value, this.mirror));
    },

    applyStrokeSegment(from, to, erase) {
      const path = this.getLineCells(from, to);
      path.forEach((cell) => this.applyBrushStamp(cell.x, cell.y, erase));
    },

    commitShapePreview() {
      if (!this.shapePreview || !this.shapePreview.start || !this.shapePreview.current) return false;
      return this.executeWithHistory("Shape Draw", () => {
        const cells = this.getShapeCells(this.shapePreview.start, this.shapePreview.current, this.shapePreview.tool);
        if (!cells.length) return false;
        const erase = !!this.shapePreview.erase;
        const value = erase ? null : this.document.currentColor;
        cells.forEach((cell) => this.document.setPixel(cell.x, cell.y, value, this.mirror));
        this.showMessage(`Shape: ${this.shapePreview.tool}`);
        return true;
      });
    },

    applyGridTool(x, y, erase) {
      if (this.activeTool === "reference") {
        this.showMessage("Reference tool: use left panel controls.");
        return;
      }
      if (this.activeTool === "eyedropper") {
        const value = this.document.getPixel(x, y);
        if (value) this.setCurrentColor(value);
        this.showMessage("Picked color.");
        return;
      }
      if (!this.canEditActiveLayer(true)) return;
      if (this.activeTool === "fill") {
        this.document.floodFill(x, y, erase ? null : this.document.currentColor, this.mirror);
        return;
      }
      this.applyBrushStamp(x, y, erase || this.activeTool === "erase");
    },

    setTool(tool) {
      this.activeTool = tool;
      this.shapePreview = null;
      if (tool !== "select") {
        if (this.selectionMoveSession) this.commitSelectionMove();
        this.clearSelection(false);
        this.selectionStart = null;
      }
      this.syncLeftPanelSectionForTool(tool);
      this.showMessage("Tool: " + tool);
    },

    setBrushSize(size) {
      this.brush.size = Math.max(1, Math.min(9, Math.floor(size || 1)));
      this.showMessageAndRender(`Brush size: ${this.brush.size}`);
    },

    adjustBrushSize(delta) {
      this.setBrushSize(this.brush.size + delta);
    },

    toggleBrushShape() {
      this.brush.shape = this.brush.shape === "square" ? "circle" : "square";
      this.showMessageAndRender(`Brush shape: ${this.brush.shape}`);
    },

    toggleMirror() {
      this.mirror = !this.mirror;
      this.showMessageAndRender(this.mirror ? "Mirror on." : "Mirror off.");
    }
  });
}

export { installSpriteEditorViewToolMethods };
