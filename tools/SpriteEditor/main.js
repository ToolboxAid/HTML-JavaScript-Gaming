/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
(function () {
  "use strict";

  const LOGICAL_W = 1600;
  const LOGICAL_H = 900;
  const STORAGE_KEY = "sprite-editor-v22";
  const RECENT_ACTIONS_KEY = "sprite-editor-command-recent-v30";
  const FAVORITE_ACTIONS_KEY = "sprite-editor-command-favorites-v32";
  const MACRO_DEFINITIONS_KEY = "sprite-editor-command-macros-v33";

  class SpriteEditorViewport {
    constructor(canvas) {
      this.canvas = canvas;
      this.logicalWidth = LOGICAL_W;
      this.logicalHeight = LOGICAL_H;
      this.displayRect = { x: 0, y: 0, width: LOGICAL_W, height: LOGICAL_H, scale: 1 };
      this.pixelPerfect = true;
    }

    updateFromCanvasElement() {
      const rect = this.canvas.getBoundingClientRect();
      const scale = rect.width / this.logicalWidth;
      const width = rect.width;
      const height = rect.height;
      this.displayRect = {
        x: 0,
        y: 0,
        width,
        height,
        scale
      };
      this.canvas.width = this.logicalWidth;
      this.canvas.height = this.logicalHeight;
    }

    screenToLogical(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const dr = this.displayRect;
      if (localX < dr.x || localY < dr.y || localX > dr.x + dr.width || localY > dr.y + dr.height) return null;
      const nx = (localX - dr.x) / dr.width;
      const ny = (localY - dr.y) / dr.height;
      return {
        x: nx * this.logicalWidth,
        y: ny * this.logicalHeight
      };
    }

    togglePixelPerfect() {
      this.pixelPerfect = !this.pixelPerfect;
      this.canvas.style.imageRendering = this.pixelPerfect ? "pixelated" : "auto";
    }
  }

  class SpriteEditorDocument {
    constructor() {
      this.cols = 16;
      this.rows = 16;
      this.palette = ["#000000", "#ffffff", "#00ccff", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"];
      this.currentColor = "#00ccff";
      this.frames = [this.makeFrame("Frame 1"), this.makeFrame("Frame 2"), this.makeFrame("Frame 3")];
      this.activeFrameIndex = 0;
      this.selection = null;
      this.selectionClipboard = null;
      this.frameClipboard = null;
      this.soloState = null;
      this.blendPreviewMode = "normal";
      this.sheet = { layout: "horizontal", padding: 4, spacing: 2, transparent: true, backgroundColor: "#ffffff" };
    }
    makeGrid(fill = null) { return Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => fill)); }
    cloneGrid(grid) { return grid.map((r) => r.slice()); }
    cloneLayer(layer, fallbackIndex = 0) {
      return {
        id: "l_" + Math.random().toString(36).slice(2, 10),
        name: layer.name || `Layer ${fallbackIndex + 1}`,
        visible: layer.visible !== false,
        locked: layer.locked === true,
        opacity: typeof layer.opacity === "number" ? Math.max(0, Math.min(1, layer.opacity)) : 1,
        pixels: this.cloneGrid(layer.pixels || this.makeGrid())
      };
    }
    cloneFrame(frame, fallbackIndex = 0) {
      const f = this.ensureFrameLayers(frame);
      return {
        id: "f_" + Math.random().toString(36).slice(2, 10),
        name: f.name || `Frame ${fallbackIndex + 1}`,
        activeLayerIndex: Math.max(0, Math.min(f.activeLayerIndex || 0, f.layers.length - 1)),
        layers: f.layers.map((layer, i) => this.cloneLayer(layer, i))
      };
    }
    makeLayer(name = "Layer 1", pixels = null) {
      return {
        id: "l_" + Math.random().toString(36).slice(2, 10),
        name,
        visible: true,
        locked: false,
        opacity: 1,
        pixels: pixels ? this.cloneGrid(pixels) : this.makeGrid()
      };
    }
    makeFrame(name) {
      return {
        id: "f_" + Math.random().toString(36).slice(2, 10),
        name,
        layers: [this.makeLayer("Layer 1")],
        activeLayerIndex: 0
      };
    }
    get activeFrame() { return this.frames[this.activeFrameIndex]; }
    ensureFrameLayers(frame) {
      if (!frame.layers || !Array.isArray(frame.layers) || !frame.layers.length) {
        const basePixels = frame.pixels ? this.cloneGrid(frame.pixels) : this.makeGrid();
        frame.layers = [this.makeLayer("Layer 1", basePixels)];
      } else {
        frame.layers = frame.layers.map((l, i) => ({
          id: l.id || "l_" + i,
          name: l.name || `Layer ${i + 1}`,
          visible: l.visible !== false,
          locked: l.locked === true,
          opacity: typeof l.opacity === "number" ? Math.max(0, Math.min(1, l.opacity)) : 1,
          pixels: l.pixels ? this.cloneGrid(l.pixels) : this.makeGrid()
        }));
      }
      if (typeof frame.activeLayerIndex !== "number") frame.activeLayerIndex = 0;
      frame.activeLayerIndex = Math.max(0, Math.min(frame.activeLayerIndex, frame.layers.length - 1));
      delete frame.pixels;
      return frame;
    }
    get activeLayer() {
      const f = this.ensureFrameLayers(this.activeFrame);
      return f.layers[f.activeLayerIndex];
    }
    getCompositedPixels(frame = this.activeFrame, options = {}) {
      const f = this.ensureFrameLayers(frame);
      const out = this.makeGrid();
      const respectSolo = options.respectSolo !== false;
      const blendMode = options.blendMode || this.blendPreviewMode;
      const solo = respectSolo ? this.soloState : null;
      for (let li = 0; li < f.layers.length; li += 1) {
        const layer = f.layers[li];
        if (solo && solo.frameId === f.id && solo.layerIndex !== li) continue;
        if (layer.visible === false) continue;
        const layerOpacity = typeof layer.opacity === "number" ? Math.max(0, Math.min(1, layer.opacity)) : 1;
        if (layerOpacity <= 0) continue;
        for (let y = 0; y < this.rows; y += 1) {
          for (let x = 0; x < this.cols; x += 1) {
            const v = layer.pixels[y][x];
            if (!v) continue;
            out[y][x] = this.compositeColor(out[y][x], v, layerOpacity, blendMode);
          }
        }
      }
      return out;
    }
    colorToRgba(color, opacity = 1) {
      if (!color || typeof color !== "string") return null;
      const c = color.trim();
      if (c[0] === "#") {
        if (c.length === 7 || c.length === 9) {
          const r = parseInt(c.slice(1, 3), 16);
          const g = parseInt(c.slice(3, 5), 16);
          const b = parseInt(c.slice(5, 7), 16);
          const a = c.length === 9 ? (parseInt(c.slice(7, 9), 16) / 255) : 1;
          return { r, g, b, a: Math.max(0, Math.min(1, a * opacity)) };
        }
        return null;
      }
      const m = c.match(/^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*([0-9]*\.?[0-9]+))?\s*\)$/i);
      if (m) {
        const r = Math.max(0, Math.min(255, Number(m[1])));
        const g = Math.max(0, Math.min(255, Number(m[2])));
        const b = Math.max(0, Math.min(255, Number(m[3])));
        const aSrc = typeof m[4] === "string" ? Number(m[4]) : 1;
        return { r, g, b, a: Math.max(0, Math.min(1, aSrc * opacity)) };
      }
      return null;
    }
    rgbaToCss(rgba) {
      const a = Math.max(0, Math.min(1, rgba.a));
      return `rgba(${rgba.r},${rgba.g},${rgba.b},${Number(a.toFixed(3))})`;
    }
    compositeColor(baseColor, overColor, overOpacity, blendPreviewMode = "normal") {
      const over = this.colorToRgba(overColor, overOpacity);
      if (!over || over.a <= 0) return baseColor || null;
      const base = this.colorToRgba(baseColor || "rgba(0,0,0,0)", 1) || { r: 0, g: 0, b: 0, a: 0 };
      let oa = over.a;
      if (blendPreviewMode === "boost") oa = Math.min(1, oa * 1.35);
      const outA = oa + base.a * (1 - oa);
      if (outA <= 0) return null;
      const outR = Math.round(((over.r * oa) + (base.r * base.a * (1 - oa))) / outA);
      const outG = Math.round(((over.g * oa) + (base.g * base.a * (1 - oa))) / outA);
      const outB = Math.round(((over.b * oa) + (base.b * base.a * (1 - oa))) / outA);
      return this.rgbaToCss({ r: outR, g: outG, b: outB, a: outA });
    }
    setPixel(x, y, value, mirror = false) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
      this.activeLayer.pixels[y][x] = value;
      if (mirror) {
        const mx = this.cols - 1 - x;
        if (mx >= 0 && mx < this.cols) this.activeLayer.pixels[y][mx] = value;
      }
    }
    getPixel(x, y) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return null;
      return this.activeLayer.pixels[y][x];
    }
    floodFill(startX, startY, nextValue, mirror = false) {
      const targetValue = this.getPixel(startX, startY);
      if (targetValue === nextValue) return;
      const queue = [{ x: startX, y: startY }];
      const seen = new Set();
      while (queue.length) {
        const c = queue.shift();
        const key = c.x + "," + c.y;
        if (seen.has(key)) continue;
        seen.add(key);
        if (c.x < 0 || c.y < 0 || c.x >= this.cols || c.y >= this.rows) continue;
        if (this.activeLayer.pixels[c.y][c.x] !== targetValue) continue;
        this.setPixel(c.x, c.y, nextValue, mirror);
        queue.push({ x: c.x + 1, y: c.y }, { x: c.x - 1, y: c.y }, { x: c.x, y: c.y + 1 }, { x: c.x, y: c.y - 1 });
      }
    }
    addFrame() { this.frames.push(this.makeFrame("Frame " + (this.frames.length + 1))); this.activeFrameIndex = this.frames.length - 1; }
    duplicateFrame() {
      const f = this.activeFrame;
      const copyFrame = this.cloneFrame(f, this.activeFrameIndex);
      copyFrame.name = f.name + " Copy";
      this.frames.splice(this.activeFrameIndex + 1, 0, copyFrame);
      this.activeFrameIndex += 1;
    }
    deleteFrame() {
      if (this.frames.length === 1) return false;
      this.frames.splice(this.activeFrameIndex, 1);
      this.activeFrameIndex = Math.max(0, Math.min(this.activeFrameIndex, this.frames.length - 1));
      return true;
    }
    moveFrame(from, to) {
      if (from === to || from < 0 || to < 0 || from >= this.frames.length || to >= this.frames.length) return false;
      const [moved] = this.frames.splice(from, 1);
      this.frames.splice(to, 0, moved);
      this.activeFrameIndex = to;
      return true;
    }
    copyFrame() {
      const f = this.ensureFrameLayers(this.activeFrame);
      this.frameClipboard = {
        layers: f.layers.map((l) => ({ name: l.name, visible: l.visible !== false, locked: l.locked === true, opacity: typeof l.opacity === "number" ? l.opacity : 1, pixels: this.cloneGrid(l.pixels) })),
        activeLayerIndex: f.activeLayerIndex || 0
      };
    }
    pasteFrame() {
      if (!this.frameClipboard || !Array.isArray(this.frameClipboard.layers) || !this.frameClipboard.layers.length) return false;
      const layers = this.frameClipboard.layers.map((l, i) => ({
        id: "l_" + Math.random().toString(36).slice(2, 10),
        name: l.name || `Layer ${i + 1}`,
        visible: l.visible !== false,
        locked: l.locked === true,
        opacity: typeof l.opacity === "number" ? l.opacity : 1,
        pixels: this.cloneGrid(l.pixels || this.makeGrid())
      }));
      this.activeFrame.layers = layers;
      this.activeFrame.activeLayerIndex = Math.max(0, Math.min(this.frameClipboard.activeLayerIndex || 0, layers.length - 1));
      return true;
    }
    clearFrame() { this.activeLayer.pixels = this.makeGrid(); }
    setSelection(rect) { this.selection = rect; }
    clearSelection() { this.selection = null; }
    readSelection() {
      if (!this.selection) return null;
      const block = [];
      for (let y = 0; y < this.selection.height; y += 1) {
        const row = [];
        for (let x = 0; x < this.selection.width; x += 1) row.push(this.getPixel(this.selection.x + x, this.selection.y + y));
        block.push(row);
      }
      return { width: this.selection.width, height: this.selection.height, pixels: block };
    }
    copySelection() { const block = this.readSelection(); if (!block) return false; this.selectionClipboard = block; return true; }
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
    pasteSelection(x, y) {
      if (!this.selectionClipboard) return false;
      for (let py = 0; py < this.selectionClipboard.height; py += 1) {
        for (let px = 0; px < this.selectionClipboard.width; px += 1) {
          const tx = x + px, ty = y + py;
          if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) continue;
          this.activeLayer.pixels[ty][tx] = this.selectionClipboard.pixels[py][px];
        }
      }
      return true;
    }
    flipSelection(horizontal) {
      const block = this.readSelection();
      if (!block) return false;
      const next = block.pixels.map((r) => r.slice());
      if (horizontal) next.forEach((r) => r.reverse());
      else next.reverse();
      for (let y = 0; y < block.height; y += 1) {
        for (let x = 0; x < block.width; x += 1) {
          this.activeLayer.pixels[this.selection.y + y][this.selection.x + x] = next[y][x];
        }
      }
      return true;
    }
    addLayer() {
      const f = this.ensureFrameLayers(this.activeFrame);
      f.layers.push(this.makeLayer("Layer " + (f.layers.length + 1)));
      f.activeLayerIndex = f.layers.length - 1;
      return true;
    }
    duplicateLayer() {
      const f = this.ensureFrameLayers(this.activeFrame);
      const src = f.layers[f.activeLayerIndex];
      const dup = this.makeLayer(src.name + " Copy", src.pixels);
      dup.visible = src.visible !== false;
      dup.locked = src.locked === true;
      dup.opacity = typeof src.opacity === "number" ? src.opacity : 1;
      f.layers.splice(f.activeLayerIndex + 1, 0, dup);
      f.activeLayerIndex += 1;
      return true;
    }
    deleteLayer() {
      const f = this.ensureFrameLayers(this.activeFrame);
      if (f.layers.length === 1) return false;
      f.layers.splice(f.activeLayerIndex, 1);
      f.activeLayerIndex = Math.max(0, Math.min(f.activeLayerIndex, f.layers.length - 1));
      return true;
    }
    toggleLayerVisibility() {
      const l = this.activeLayer;
      l.visible = l.visible === false ? true : false;
      return true;
    }
    toggleLayerLock() {
      const l = this.activeLayer;
      l.locked = l.locked === true ? false : true;
      return true;
    }
    adjustActiveLayerOpacity(delta) {
      const l = this.activeLayer;
      const next = Math.max(0, Math.min(1, Number((((typeof l.opacity === "number" ? l.opacity : 1) + delta)).toFixed(2))));
      if (next === (typeof l.opacity === "number" ? l.opacity : 1)) return false;
      l.opacity = next;
      return true;
    }
    resetActiveLayerOpacity() {
      const l = this.activeLayer;
      if ((typeof l.opacity === "number" ? l.opacity : 1) === 1) return false;
      l.opacity = 1;
      return true;
    }
    toggleBlendPreviewMode() {
      this.blendPreviewMode = this.blendPreviewMode === "normal" ? "boost" : "normal";
      return this.blendPreviewMode;
    }
    mergeLayerDown() {
      const f = this.ensureFrameLayers(this.activeFrame);
      const from = f.activeLayerIndex;
      if (from <= 0) return false;
      const top = f.layers[from];
      const bottom = f.layers[from - 1];
      const merged = this.makeGrid();
      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          let out = null;
          if (bottom.visible !== false && (typeof bottom.opacity === "number" ? bottom.opacity : 1) > 0 && bottom.pixels[y][x]) {
            out = this.compositeColor(null, bottom.pixels[y][x], typeof bottom.opacity === "number" ? bottom.opacity : 1, "normal");
          }
          if (top.visible !== false && (typeof top.opacity === "number" ? top.opacity : 1) > 0 && top.pixels[y][x]) {
            out = this.compositeColor(out, top.pixels[y][x], typeof top.opacity === "number" ? top.opacity : 1, "normal");
          }
          merged[y][x] = out;
        }
      }
      bottom.pixels = merged;
      bottom.visible = true;
      bottom.opacity = 1;
      f.layers.splice(from, 1);
      f.activeLayerIndex = from - 1;
      if (this.soloState && this.soloState.frameId === f.id) {
        if (this.soloState.layerIndex === from) this.soloState.layerIndex = from - 1;
        else if (this.soloState.layerIndex > from) this.soloState.layerIndex -= 1;
      }
      return true;
    }
    flattenActiveFrame() {
      const f = this.ensureFrameLayers(this.activeFrame);
      const before = JSON.stringify({
        layers: f.layers.map((l) => ({ name: l.name, visible: l.visible !== false, locked: l.locked === true, opacity: typeof l.opacity === "number" ? l.opacity : 1, pixels: l.pixels })),
        activeLayerIndex: f.activeLayerIndex
      });
      const flat = this.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" });
      const layerName = f.layers.length === 1 ? (f.layers[0].name || "Layer 1") : "Flattened";
      f.layers = [this.makeLayer(layerName, flat)];
      f.layers[0].visible = true;
      f.layers[0].locked = false;
      f.layers[0].opacity = 1;
      f.activeLayerIndex = 0;
      if (this.soloState && this.soloState.frameId === f.id) this.soloState = null;
      const after = JSON.stringify({
        layers: f.layers.map((l) => ({ name: l.name, visible: l.visible !== false, locked: l.locked === true, opacity: typeof l.opacity === "number" ? l.opacity : 1, pixels: l.pixels })),
        activeLayerIndex: f.activeLayerIndex
      });
      return before !== after;
    }
    duplicateFrameRange(start, end) {
      const s = Math.max(0, Math.min(start, end));
      const e = Math.min(this.frames.length - 1, Math.max(start, end));
      if (s < 0 || e < s) return null;
      const clones = [];
      for (let i = s; i <= e; i += 1) {
        const cloned = this.cloneFrame(this.frames[i], i);
        cloned.name = `${this.frames[i].name} Copy`;
        clones.push(cloned);
      }
      if (!clones.length) return null;
      this.frames.splice(e + 1, 0, ...clones);
      this.activeFrameIndex = e + 1;
      return { start: e + 1, end: e + clones.length };
    }
    deleteFrameRange(start, end) {
      const s = Math.max(0, Math.min(start, end));
      const e = Math.min(this.frames.length - 1, Math.max(start, end));
      const count = e - s + 1;
      if (count <= 0 || count >= this.frames.length) return false;
      this.frames.splice(s, count);
      this.activeFrameIndex = Math.max(0, Math.min(s, this.frames.length - 1));
      return true;
    }
    shiftFrameRange(start, end, direction) {
      const s = Math.max(0, Math.min(start, end));
      const e = Math.min(this.frames.length - 1, Math.max(start, end));
      if (e <= s && direction !== 0) {
        if (direction < 0 && s <= 0) return null;
        if (direction > 0 && e >= this.frames.length - 1) return null;
      }
      if (direction < 0) {
        if (s <= 0) return null;
        const block = this.frames.splice(s, e - s + 1);
        this.frames.splice(s - 1, 0, ...block);
        this.activeFrameIndex = Math.max(0, this.activeFrameIndex - 1);
        return { start: s - 1, end: e - 1 };
      }
      if (direction > 0) {
        if (e >= this.frames.length - 1) return null;
        const block = this.frames.splice(s, e - s + 1);
        this.frames.splice(s + 1, 0, ...block);
        this.activeFrameIndex = Math.min(this.frames.length - 1, this.activeFrameIndex + 1);
        return { start: s + 1, end: e + 1 };
      }
      return null;
    }
    selectLayer(index) {
      const f = this.ensureFrameLayers(this.activeFrame);
      f.activeLayerIndex = Math.max(0, Math.min(index, f.layers.length - 1));
      return true;
    }
    selectNextLayer() { return this.selectLayer(this.activeFrame.activeLayerIndex + 1); }
    selectPrevLayer() { return this.selectLayer(this.activeFrame.activeLayerIndex - 1); }
    moveLayer(from, to) {
      const f = this.ensureFrameLayers(this.activeFrame);
      if (from === to || from < 0 || to < 0 || from >= f.layers.length || to >= f.layers.length) return false;
      const [moved] = f.layers.splice(from, 1);
      f.layers.splice(to, 0, moved);
      f.activeLayerIndex = to;
      return true;
    }
    renameActiveLayer(name) {
      const f = this.ensureFrameLayers(this.activeFrame);
      const n = String(name || "").trim();
      if (!n) return false;
      f.layers[f.activeLayerIndex].name = n;
      return true;
    }
    computeSheetPlacement() {
      const count = this.frames.length, p = this.sheet.padding, s = this.sheet.spacing;
      let cols = 1, rows = 1;
      if (this.sheet.layout === "horizontal") { cols = count; rows = 1; }
      else if (this.sheet.layout === "vertical") { cols = 1; rows = count; }
      else { cols = Math.min(4, count); rows = Math.ceil(count / cols); }
      const entries = [];
      for (let i = 0; i < count; i += 1) {
        const col = i % cols, row = Math.floor(i / cols);
        entries.push({ x: p + col * (this.cols + s), y: p + row * (this.rows + s) });
      }
      return { width: p * 2 + cols * this.cols + Math.max(0, cols - 1) * s, height: p * 2 + rows * this.rows + Math.max(0, rows - 1) * s, entries };
    }
    computeSheetPlacementForCount(count) {
      const p = this.sheet.padding, s = this.sheet.spacing;
      let cols = 1, rows = 1;
      if (this.sheet.layout === "horizontal") { cols = count; rows = 1; }
      else if (this.sheet.layout === "vertical") { cols = 1; rows = count; }
      else { cols = Math.min(4, Math.max(1, count)); rows = Math.ceil(Math.max(1, count) / cols); }
      const entries = [];
      for (let i = 0; i < count; i += 1) {
        const col = i % cols, row = Math.floor(i / cols);
        entries.push({ x: p + col * (this.cols + s), y: p + row * (this.rows + s) });
      }
      return { width: p * 2 + cols * this.cols + Math.max(0, cols - 1) * s, height: p * 2 + rows * this.rows + Math.max(0, rows - 1) * s, entries };
    }
    buildExportPayload() {
      return {
        version: 40,
        kind: "sprite-editor-v4.0",
        cols: this.cols,
        rows: this.rows,
        palette: this.palette,
        currentColor: this.currentColor,
        sheet: this.sheet,
        frames: this.frames.map((f) => {
          const fr = this.ensureFrameLayers(f);
          return {
            id: fr.id,
            name: fr.name,
            activeLayerIndex: fr.activeLayerIndex || 0,
            layers: fr.layers.map((l) => ({
              id: l.id,
              name: l.name,
              visible: l.visible !== false,
              locked: l.locked === true,
              opacity: typeof l.opacity === "number" ? l.opacity : 1,
              pixels: this.cloneGrid(l.pixels)
            }))
          };
        })
      };
    }
    buildSheetMetadata() {
      const plc = this.computeSheetPlacement();
      return { version: 1, kind: "sprite-sheet", frames: this.frames.map((f, i) => ({ index: i, id: f.id, name: f.name, x: plc.entries[i].x, y: plc.entries[i].y, width: this.cols, height: this.rows })) };
    }
    importPayload(payload) {
      this.cols = payload.cols || 16;
      this.rows = payload.rows || 16;
      this.palette = Array.isArray(payload.palette) && payload.palette.length ? payload.palette : this.palette;
      this.currentColor = payload.currentColor || this.palette[0];
      this.sheet = { ...this.sheet, ...(payload.sheet || {}) };
      if (Array.isArray(payload.frames) && payload.frames.length) {
        this.frames = payload.frames.map((f, i) => this.ensureFrameLayers({ id: f.id || "f_" + i, name: f.name || "Frame " + (i + 1), activeLayerIndex: f.activeLayerIndex || 0, layers: f.layers, pixels: f.pixels }));
      } else if (Array.isArray(payload.pixels)) {
        this.frames = [this.ensureFrameLayers({ id: "f_1", name: "Frame 1", pixels: payload.pixels })];
      }
      this.activeFrameIndex = 0;
      this.selection = null;
      this.soloState = null;
    }
  }

  class SpriteEditorCanvasControlSurface {
    constructor(app) {
      this.app = app;
      this.controls = [];
      this.overflowPanelOpen = false;
      this.overflowPanelBounds = null;
      this.overflowPanelControls = [];
      this.overflowAnchorControl = null;
      this.hiddenTopControls = [];
      this.menuItems = [];
      this.topMenuSource = null;
      this.commandPaletteOpen = false;
      this.commandPaletteQuery = "";
      this.commandPaletteItems = [];
      this.commandPaletteFiltered = [];
      this.commandPaletteSelectedIndex = 0;
      this.commandPaletteBounds = null;
      this.commandPaletteRowControls = [];
      this.hovered = null;
      this.pressed = null;
      this.dragFrameIndex = null;
      this.dragOverFrameIndex = null;
      this.layout = null;
      this.dragFeedbackText = "";
    }

    getDensityPresets() {
      return {
        pro: {
          topButtonHeight: 36,
          sideButtonHeight: 32,
          spacing: 6,
          padding: 14,
          frameThumbHeight: 50,
          labelHeight: 20,
          topPanelHeight: 74,
          bottomPanelHeight: 122,
          leftPanelWidth: 214,
          rightPanelWidth: 292
        },
        standard: {
          topButtonHeight: 42,
          sideButtonHeight: 38,
          spacing: 8,
          padding: 18,
          frameThumbHeight: 58,
          labelHeight: 24,
          topPanelHeight: 82,
          bottomPanelHeight: 138,
          leftPanelWidth: 230,
          rightPanelWidth: 310
        }
      };
    }

    resolveDensity() {
      const selectedMode = this.app.uiDensityMode;
      const presets = this.getDensityPresets();
      const display = this.app.viewport.displayRect || { width: LOGICAL_W, height: LOGICAL_H };
      const scaleW = display.width / LOGICAL_W;
      const scaleH = display.height / LOGICAL_H;
      const fitScale = Math.min(scaleW, scaleH);
      const effectiveMode = selectedMode === "auto"
        ? (fitScale < 0.86 ? "pro" : "standard")
        : selectedMode;
      return { selectedMode, effectiveMode, config: presets[effectiveMode] };
    }

    rebuildLayout() {
      const density = this.resolveDensity();
      const d = density.config;
      const frame = { x: 18, y: 18, width: LOGICAL_W - 36, height: LOGICAL_H - 36 };
      const top = d.topPanelHeight;
      const bottom = d.bottomPanelHeight;
      const left = d.leftPanelWidth;
      const right = d.rightPanelWidth;
      const pad = d.padding;
      this.layout = {
        appFrame: frame,
        topPanel: { x: frame.x, y: frame.y, width: frame.width, height: top },
        leftPanel: { x: frame.x, y: frame.y + top, width: left, height: frame.height - top - bottom },
        rightPanel: { x: frame.x + frame.width - right, y: frame.y + top, width: right, height: frame.height - top - bottom },
        bottomPanel: { x: frame.x, y: frame.y + frame.height - bottom, width: frame.width, height: bottom },
        gridArea: { x: frame.x + left + pad, y: frame.y + top + pad, width: frame.width - left - right - pad * 2, height: frame.height - top - bottom - pad * 2 }
      };
      this.app.uiDensityEffectiveMode = density.effectiveMode;
      const openMenuItems = this.menuItems.slice();
      this.controls = [];
      this.hiddenTopControls = [];
      if (this.overflowPanelOpen) {
        this.menuItems = openMenuItems;
        this.rebuildOverflowPanel();
      }
      this.build();
    }

    add(kind, id, x, y, w, h, text, action, extra = {}) { this.controls.push({ kind, id, x, y, w, h, text, action, ...extra }); }

    getTopControlPolicy(effectiveMode, selectedMode) {
      const modeLabel = selectedMode === "auto"
        ? `Mode: Auto (${effectiveMode === "pro" ? "Pro" : "Std"})`
        : (selectedMode === "pro" ? "Mode: Pro" : "Mode: Standard");
      const fileMenuItems = [
        { id: "file-save", text: "Save Local", action: () => this.app.saveLocal() },
        { id: "file-load", text: "Load Local", action: () => this.app.loadLocal() },
        { id: "file-import", text: "Import JSON", action: () => this.app.openImport() },
        { id: "file-export-menu", text: "Export...", action: () => this.app.openExportMenu() },
        { id: "file-export-editor", text: "Export Editor JSON", action: () => this.app.exportJson(true) }
      ];
      const defs = [
        {
          id: "top-file",
          tier: 1,
          overflowEligible: false,
          labels: effectiveMode === "pro" ? ["File", "File", "F"] : ["File", "File", "F"],
          action: () => this.toggleTopMenu("file", fileMenuItems)
        },
        {
          id: "top-edit",
          tier: 1,
          overflowEligible: false,
          labels: ["Edit", "Edit", "E"],
          action: () => this.app.openEditMenu()
        },
        {
          id: "top-frame",
          tier: 1,
          overflowEligible: false,
          labels: ["Frame", "Frame", "Fr"],
          action: () => this.app.openFrameMenu()
        },
        {
          id: "top-layer",
          tier: 1,
          overflowEligible: false,
          labels: ["Layer", "Layer", "L"],
          action: () => this.app.openLayerMenu()
        },
        { id: "top-pixel", tier: 2, overflowEligible: true, labels: this.app.viewport.pixelPerfect ? ["Pixel: On", "Pixel", "Px"] : ["Pixel: Off", "Pixel", "Px"], action: () => this.app.togglePixelPerfect() }
      ];
      return {
        mode: { id: "top-mode", tier: 1, labels: [modeLabel, selectedMode === "auto" ? "Mode: Auto" : (selectedMode === "pro" ? "Mode: Pro" : "Mode: Std"), "Mode"], action: () => this.app.toggleDensityMode() },
        zoom: {
          out: { id: "top-zoom-out", label: "Zoom -" },
          in: { id: "top-zoom-in", label: "Zoom +" },
          reset: { id: "top-zoom-reset", labels: ["Reset", "Reset", "R"] }
        },
        controls: defs
      };
    }

    measureButtonWidth(ctx, text, minWidth, padX) {
      return Math.max(minWidth, Math.ceil(ctx.measureText(text).width + padX * 2));
    }

    closeOverflowPanel() {
      this.overflowPanelOpen = false;
      this.overflowPanelBounds = null;
      this.overflowPanelControls = [];
      this.overflowAnchorControl = null;
      this.menuItems = [];
      this.topMenuSource = null;
    }
    getMenuAnchorId() {
      if (this.topMenuSource === "file") return "top-file";
      if (this.topMenuSource === "edit") return "top-edit";
      if (this.topMenuSource === "frame") return "top-frame";
      if (this.topMenuSource === "layer") return "top-layer";
      if (this.topMenuSource === "overflow") return "top-overflow";
      return this.topMenuSource;
    }

    pointInRect(x, y, r) {
      return !!r && x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h;
    }

    getOpenPanelItems() {
      if (this.topMenuSource === "overflow") {
        return Array.isArray(this.hiddenTopControls) ? this.hiddenTopControls : [];
      }
      return Array.isArray(this.menuItems) ? this.menuItems : [];
    }

    toggleFavoriteAt(x, y) {
      if (!this.commandPaletteOpen) return false;
      for (let i = 0; i < this.commandPaletteRowControls.length; i += 1) {
        const c = this.commandPaletteRowControls[i];
        if (!c.isCommandRow || !c.favoriteToggleRect) continue;
        if (this.pointInRect(x, y, c.favoriteToggleRect)) {
          this.app.toggleFavoriteAction(c.commandId);
          this.rebuildCommandPaletteRows();
          return true;
        }
      }
      return false;
    }

    openCommandPalette(items) {
      this.commandPaletteItems = Array.isArray(items) ? items.slice() : [];
      this.commandPaletteQuery = "";
      this.commandPaletteOpen = true;
      this.commandPaletteSelectedIndex = 0;
      this.rebuildCommandPaletteRows();
    }

    closeCommandPalette() {
      this.commandPaletteOpen = false;
      this.commandPaletteBounds = null;
      this.commandPaletteRowControls = [];
      this.commandPaletteFiltered = [];
      this.commandPaletteQuery = "";
      this.commandPaletteSelectedIndex = 0;
    }

    setCommandPaletteQuery(query) {
      this.commandPaletteQuery = query;
      this.commandPaletteSelectedIndex = 0;
      this.rebuildCommandPaletteRows();
    }

    moveCommandPaletteSelection(delta) {
      if (!this.commandPaletteOpen || !this.commandPaletteFiltered.length) return;
      const next = this.commandPaletteSelectedIndex + delta;
      const max = this.commandPaletteFiltered.length - 1;
      this.commandPaletteSelectedIndex = Math.max(0, Math.min(max, next));
      this.rebuildCommandPaletteRows();
    }

    activateCommandPaletteSelection() {
      if (!this.commandPaletteOpen || !this.commandPaletteFiltered.length) return false;
      const selected = this.commandPaletteFiltered[this.commandPaletteSelectedIndex];
      if (!selected || typeof selected.action !== "function") return false;
      selected.action();
      this.closeCommandPalette();
      return true;
    }

    rebuildCommandPaletteRows() {
      if (!this.commandPaletteOpen) return;
      const frame = this.layout.appFrame;
      const panelW = Math.min(760, frame.width - 160);
      const topBiasY = frame.y + Math.floor(frame.height * 0.16);
      const panelX = frame.x + Math.floor((frame.width - panelW) * 0.5);
      const rowH = 36;
      const headerH = 64;
      const footerH = 20;
      const maxRows = 10;
      this.commandPaletteFiltered = this.app.getRankedCommandPaletteItems(this.commandPaletteItems, this.commandPaletteQuery);
      const rowCount = Math.min(maxRows, Math.max(1, this.commandPaletteFiltered.length));
      const panelH = headerH + footerH + rowCount * rowH + 16;
      const panelY = Math.max(frame.y + 12, Math.min(topBiasY, frame.y + frame.height - panelH - 12));
      this.commandPaletteBounds = { x: panelX, y: panelY, w: panelW, h: panelH, rowH, headerH, footerH, rowCount };
      this.commandPaletteSelectedIndex = Math.max(0, Math.min(this.commandPaletteSelectedIndex, Math.max(0, this.commandPaletteFiltered.length - 1)));
      this.commandPaletteRowControls = [];
      const visible = this.commandPaletteFiltered.slice(0, maxRows);
      visible.forEach((item, idx) => {
        this.commandPaletteRowControls.push({
          kind: "button",
          id: `cmd-row-${idx}`,
          x: panelX + 12,
          y: panelY + headerH + (idx * rowH),
          w: panelW - 24,
          h: rowH - 4,
          text: item.label,
          action: item.action,
          isCommandRow: true,
          selected: idx === this.commandPaletteSelectedIndex,
          shortcut: item.shortcut || "",
          category: item.category || "",
          score: item.score || 0,
          commandId: item.id,
          favorite: !!item.favorite,
          favoriteToggleRect: { x: panelX + panelW - 30, y: panelY + headerH + (idx * rowH) + 6, w: 18, h: 18 }
        });
      });
    }

    rebuildOverflowPanel() {
      const panelItems = this.getOpenPanelItems();
      const hasItems = panelItems.length > 0;
      if (!this.overflowPanelOpen) {
        this.closeOverflowPanel();
        return;
      }
      const anchorId = this.getMenuAnchorId();
      const anchor = this.controls.find((c) => c.id === anchorId) || this.overflowAnchorControl;
      if (!anchor) {
        this.closeOverflowPanel();
        return;
      }
      this.overflowAnchorControl = anchor;
      const d = this.resolveDensity().config;
      const panelPad = 8;
      const rowH = d.topButtonHeight;
      const gap = Math.max(4, d.spacing - 2);
      const minBtn = this.app.uiDensityEffectiveMode === "pro" ? 52 : 58;
      const padX = this.app.uiDensityEffectiveMode === "pro" ? 10 : 12;
      const prevFont = this.app.ctx.font;
      this.app.ctx.font = "13px Arial";
      let maxW = 0;
      const itemsForMeasure = hasItems ? panelItems : [{ text: "No menu items (ERROR)" }];
      itemsForMeasure.forEach((item) => {
        maxW = Math.max(maxW, this.measureButtonWidth(this.app.ctx, item.text, minBtn, padX));
      });
      const visibleItems = hasItems ? panelItems : [{ id: "menu-error-empty", text: "No menu items (ERROR)", action: null }];
      const panelW = Math.max(160, maxW + panelPad * 2);
      const panelH = Math.max(rowH + panelPad * 2, panelPad * 2 + (visibleItems.length * rowH) + (Math.max(0, visibleItems.length - 1) * gap));
      const frame = this.layout.appFrame;
      let panelX = anchor.x + anchor.w - panelW;
      panelX = Math.max(frame.x + 8, Math.min(panelX, frame.x + frame.width - panelW - 8));
      let panelY = anchor.y + anchor.h + 8;
      if (panelY + panelH > frame.y + frame.height - 8) {
        panelY = anchor.y - panelH - 8;
      }
      panelY = Math.max(frame.y + 8, Math.min(panelY, frame.y + frame.height - panelH - 8));
      this.overflowPanelBounds = { x: panelX, y: panelY, w: panelW, h: panelH };
      this.overflowPanelControls = [];
      let y = panelY + panelPad;
      visibleItems.forEach((item, index) => {
        this.overflowPanelControls.push({
          kind: "button",
          id: `overflow-item-${index}`,
          x: panelX + panelPad,
          y,
          w: panelW - panelPad * 2,
          h: rowH,
          text: item.text,
          action: item.action
        });
        y += rowH + gap;
      });
      this.app.ctx.font = prevFont;
    }

    toggleOverflowPanel() {
      if (this.overflowPanelOpen) {
        this.closeOverflowPanel();
        return;
      }
      if (!this.hiddenTopControls.length) return;
      this.menuItems = [];
      this.topMenuSource = "overflow";
      this.overflowPanelOpen = true;
      this.rebuildOverflowPanel();
    }

    toggleTopMenu(source, items) {
      if (this.overflowPanelOpen && this.topMenuSource === source) {
        this.closeOverflowPanel();
        return;
      }
      this.menuItems = Array.isArray(items) ? items.slice() : [];
      this.topMenuSource = source || "menu";
      this.overflowPanelOpen = true;
      this.rebuildOverflowPanel();
    }

    build() {
      const density = this.resolveDensity();
      const d = density.config;
      const selectedMode = density.selectedMode;
      const effectiveMode = density.effectiveMode;
      const top = this.layout.topPanel, left = this.layout.leftPanel, right = this.layout.rightPanel, bottom = this.layout.bottomPanel;
      let x = top.x + d.padding;
      let y = top.y + Math.floor((top.height - d.topButtonHeight) / 2);
      const h = d.topButtonHeight;
      const policy = this.getTopControlPolicy(effectiveMode, selectedMode);
      const prevFont = this.app.ctx.font;
      this.app.ctx.font = "13px Arial";
      const minBtn = effectiveMode === "pro" ? 52 : 58;
      const padX = effectiveMode === "pro" ? 10 : 12;
      const spacingBase = d.spacing;
      const spacing = Math.max(4, spacingBase - (effectiveMode === "pro" ? 1 : 0));

      const fullscreenLabel = this.app.isFullscreen() ? "Exit Full" : "Full Screen";
      const fullscreenShort = this.app.isFullscreen() ? "Exit" : "Full";
      const fullscreenWLong = this.measureButtonWidth(this.app.ctx, fullscreenLabel, minBtn, padX);
      const fullscreenWShort = this.measureButtonWidth(this.app.ctx, fullscreenShort, minBtn, padX);
      const zoomBtnW = this.measureButtonWidth(this.app.ctx, "Zoom +", minBtn, padX - 2);
      const zoomResetW = this.measureButtonWidth(this.app.ctx, policy.zoom.reset.labels[0], minBtn, padX - 2);

      let level = 0;
      let hidden = [];
      const computeLayout = (fitLevel) => {
        const tryShortFullscreen = fitLevel >= 1;
        const fsLabel = tryShortFullscreen ? fullscreenShort : fullscreenLabel;
        const fsW = tryShortFullscreen ? fullscreenWShort : fullscreenWLong;
        const modeText = policy.mode.labels[Math.min(fitLevel, 2)];
        const modeW = this.measureButtonWidth(this.app.ctx, modeText, minBtn + 10, padX);
        const showZoom = fitLevel <= 2;
        const zoomW = showZoom ? (zoomBtnW * 2 + zoomResetW + spacing * 2 + spacing) : 0;
        const overflowSlots = fitLevel >= 2 ? 1 : 0;
        const overflowW = overflowSlots ? this.measureButtonWidth(this.app.ctx, "More", minBtn, padX) : 0;
        const rightReserve = fsW + spacing + modeW + (showZoom ? (spacing + zoomW) : 0) + (overflowSlots ? (spacing + overflowW) : 0);
        const rightStart = top.x + top.width - d.padding - rightReserve;
        const availableRight = rightStart - spacing;
        const leftControls = [];
        hidden = [];
        let leftX = x;
        const visibleMaxTier = fitLevel >= 3 ? 1 : (fitLevel >= 2 ? 2 : 3);
        for (const c of policy.controls) {
          if (c.tier > visibleMaxTier && c.overflowEligible) {
            hidden.push(c);
            continue;
          }
          const label = c.labels[Math.min(fitLevel, 2)];
          const w = this.measureButtonWidth(this.app.ctx, label, minBtn, padX);
          if ((leftX + w) > availableRight) {
            if (c.overflowEligible) hidden.push(c);
            continue;
          }
          leftControls.push({ ...c, text: label, w, x: leftX });
          leftX += w + spacing;
        }
        return {
          fsLabel, fsW, modeText, modeW, showZoom, overflowSlots, overflowW, rightStart, leftControls
        };
      };

      let topLayout = computeLayout(level);
      while (level < 3 && topLayout.rightStart <= x) {
        level += 1;
        topLayout = computeLayout(level);
      }

      topLayout.leftControls.forEach((c) => this.add("button", c.id, c.x, y, c.w, h, c.text, c.action));

      let rightX = topLayout.rightStart;
      const addRight = (id, w, text, action, extra = {}) => {
        this.add("button", id, rightX, y, w, h, text, action, extra);
        rightX += w + spacing;
      };

      if (topLayout.showZoom) {
        addRight(policy.zoom.out.id, zoomBtnW, policy.zoom.out.label, () => this.app.adjustZoom(-0.25));
        addRight(policy.zoom.in.id, zoomBtnW, policy.zoom.in.label, () => this.app.adjustZoom(0.25));
        addRight(policy.zoom.reset.id, zoomResetW, policy.zoom.reset.labels[Math.min(level, 2)], () => this.app.resetZoom());
      }
      addRight(policy.mode.id, topLayout.modeW, topLayout.modeText, policy.mode.action);
      if (topLayout.overflowSlots && hidden.length) {
        const overflowText = `More (${hidden.length})`;
        const overflowW = this.measureButtonWidth(this.app.ctx, overflowText, minBtn, padX);
        if (this.topMenuSource === "overflow") {
          this.hiddenTopControls = hidden.map((c) => ({ id: c.id, text: c.labels[0], action: c.action }));
        }
        addRight("top-overflow", overflowW, overflowText, () => this.toggleOverflowPanel(), { overflowItems: hidden.map((c) => c.id) });
      } else {
        if (this.topMenuSource === "overflow") {
          this.hiddenTopControls = [];
          if (this.overflowPanelOpen) this.closeOverflowPanel();
        }
      }
      addRight("fullscreen", topLayout.fsW, topLayout.fsLabel, () => this.app.toggleFullscreen());
      this.app.ctx.font = prevFont;

      x = left.x + d.padding;
      y = left.y + d.padding;
      const bw = left.width - (d.padding * 2);
      const bh = d.sideButtonHeight;
      this.add("label","lbl-tools",x,y,bw,d.labelHeight,"TOOLS",null); y += d.labelHeight + d.spacing;
      [["brush","Brush"],["erase","Erase"],["fill","Fill"],["line","Line"],["rect","Rect"],["fillrect","Fill Rect"],["eyedropper","Eye"],["select","Select"]].forEach(([tool,t]) => {
        this.add("button","tool-"+tool,x,y,bw,bh,t,()=>this.app.setTool(tool),{tool}); y += bh + d.spacing;
      });
      const brushToolActive = this.app.activeTool === "brush" || this.app.activeTool === "erase";
      const shapeToolActive = this.app.activeTool === "line" || this.app.activeTool === "rect" || this.app.activeTool === "fillrect";
      if (brushToolActive) {
        y += d.spacing;
        this.add("label","lbl-brush",x,y,bw,d.labelHeight,"BRUSH",null); y += d.labelHeight + d.spacing;
        this.add("button","brush-size-down",x,y,Math.floor((bw - d.spacing) / 2),bh,`Size - (${this.app.brush.size})`,()=>this.app.adjustBrushSize(-1)); 
        this.add("button","brush-size-up",x + Math.floor((bw - d.spacing) / 2) + d.spacing,y,Math.ceil((bw - d.spacing) / 2),bh,"Size +",()=>this.app.adjustBrushSize(1));
        y += bh + d.spacing;
        this.add("button","brush-shape-toggle",x,y,bw,bh,`Shape: ${this.app.brush.shape}`,()=>this.app.toggleBrushShape());
        y += bh + d.spacing;
      } else if (shapeToolActive) {
        y += d.spacing;
        this.add("label","lbl-shape",x,y,bw,d.labelHeight,"SHAPE",null); y += d.labelHeight + d.spacing;
        this.add("label","shape-help",x,y,bw,bh,"Drag on canvas to preview",null);
        y += bh + d.spacing;
      }
      this.add("button","mirror-toggle",x,y,bw,bh,this.app.mirror ? "Mirror: On" : "Mirror: Off",()=>this.app.toggleMirror()); y += bh + d.spacing;
      y += d.spacing;
      this.add("label","lbl-sel",x,y,bw,d.labelHeight,"SELECTION",null); y += d.labelHeight + d.spacing;
      const hasSelection = !!this.app.document.selection;
      const hasClipboard = !!this.app.document.selectionClipboard;
      if (hasSelection) {
        const selectionText = `${this.app.document.selection.width}x${this.app.document.selection.height} ready`;
        this.add("label","sel-state",x,y,bw,bh,selectionText,null); y += bh + d.spacing;
        this.add("label","sel-hint-actions",x,y,bw,bh,"Edit menu for copy/cut/paste",null); y += bh + d.spacing;
      } else if (hasClipboard) {
        this.add("label","sel-hint-paste",x,y,bw,bh,"Clipboard ready",null); y += bh + d.spacing;
        this.add("label","sel-hint-actions",x,y,bw,bh,"Edit menu to paste",null); y += bh + d.spacing;
      } else {
        this.add("label","sel-hint",x,y,bw,bh,"No selection",null); y += bh + d.spacing;
        this.add("label","sel-hint-2",x,y,bw,bh,"Use Select tool to create one",null); y += bh + d.spacing;
      }

      x = right.x + d.padding;
      y = right.y + d.padding;
      const rw = right.width - (d.padding * 2);
      this.add("label","lbl-frames",x,y,rw,d.labelHeight,"FRAMES",null); y += d.labelHeight + d.spacing;
      this.add("button","frame-add",x,y,rw,bh,"Add Frame",()=>this.app.addFrame()); y += bh + d.spacing;
      const playbackRange = this.app.getPlaybackRange();
      if (playbackRange.enabled || this.app.getFrameRangeSelection().explicit) {
        y += d.spacing;
        this.add("label","lbl-playback-range",x,y,rw,d.labelHeight,"PLAYBACK RANGE",null); y += d.labelHeight + d.spacing;
        this.add("label","playback-range-state",x,y,rw,bh,playbackRange.enabled ? `Loop ${playbackRange.startFrame + 1}-${playbackRange.endFrame + 1}` : "Use Frame menu for range actions",null); y += bh + d.spacing;
      }
      y += d.spacing;
      this.add("label","lbl-layers",x,y,rw,d.labelHeight,"LAYERS",null); y += d.labelHeight + d.spacing;
      this.add("button","layer-add",x,y,rw,bh,"Add Layer",()=>this.app.addLayer()); y += bh + d.spacing;
      const af = this.app.document.ensureFrameLayers(this.app.document.activeFrame);
      const layers = af.layers || [];
      layers.forEach((l, i) => {
        const hidden = !this.app.isLayerVisibleEffective(af, i);
        const solo = this.app.isLayerSoloActiveFor(af, i);
        const opacityPct = `${Math.round(((typeof l.opacity === "number" ? l.opacity : 1) * 100))}%`;
        const label = `${i === af.activeLayerIndex ? ">" : " "} ${hidden ? "[H]" : "[V]"} ${l.locked ? "[L]" : "[ ]"} ${solo ? "[S]" : "[ ]"} ${l.name} ${opacityPct}`;
        this.add("button", "layer-item-" + i, x, y, rw, Math.max(24, bh - 8), label, () => this.app.selectLayer(i), {
          layerIndex: i,
          layerHidden: hidden,
          layerLocked: l.locked === true,
          layerSolo: solo
        });
        y += Math.max(24, bh - 8) + d.spacing;
      });
      this.app.document.frames.forEach((f,i) => {
        this.add("frame","frame-thumb-"+i,x,y,rw,d.frameThumbHeight,f.name,()=>this.app.selectFrame(i),{frameIndex:i});
        y += d.frameThumbHeight + d.spacing;
      });

      x = bottom.x + d.padding;
      y = bottom.y + d.padding + 4;
      this.add("label","lbl-palette",x,y-(d.labelHeight - 4),220,d.labelHeight - 4,`PALETTE ${String(this.app.currentPalettePreset || "Custom").toUpperCase()}`,null);
      this.app.document.palette.forEach((c,i) => { this.add("palette","palette-"+i,x,y,34,34,"",()=>this.app.setCurrentColor(c),{color:c}); x += 42; });
      x += d.padding;
      this.add("button","color-prev",x,y,84,34,"Prev",()=>this.app.prevColor()); x += 92;
      this.add("button","color-next",x,y,84,34,"Next",()=>this.app.nextColor()); x += 92;
      this.add("button","palette-menu",x,y,96,34,"Palette",()=>this.app.openPaletteWorkflowMenu());
    }

    getControlAt(x,y) {
      if (this.commandPaletteOpen) {
        for (let i = this.commandPaletteRowControls.length - 1; i >= 0; i -= 1) {
          const c = this.commandPaletteRowControls[i];
          if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
        }
      }
      if (this.overflowPanelOpen) {
        for (let i = this.overflowPanelControls.length - 1; i >= 0; i -= 1) {
          const c = this.overflowPanelControls[i];
          if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
        }
      }
      for (let i = this.controls.length - 1; i >= 0; i -= 1) {
        const c = this.controls[i];
        if (c.kind === "label") continue;
        if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
      }
      return null;
    }
    updateHover(x,y) {
      const c = this.getControlAt(x,y);
      this.hovered = c ? c.id : null;
      if (this.dragFrameIndex !== null) this.dragOverFrameIndex = c && c.kind === "frame" ? c.frameIndex : null;
    }
    pointerDown(x,y) {
      if (this.commandPaletteOpen) {
        if (!this.pointInRect(x, y, this.commandPaletteBounds)) {
          this.closeCommandPalette();
          this.pressed = null;
          return { id: "command-palette-dismiss", kind: "button" };
        }
        if (this.toggleFavoriteAt(x, y)) {
          this.pressed = null;
          return { id: "command-palette-favorite", kind: "button" };
        }
      }
      if (this.overflowPanelOpen) {
        const inPanel = this.overflowPanelBounds &&
          x >= this.overflowPanelBounds.x && y >= this.overflowPanelBounds.y &&
          x <= this.overflowPanelBounds.x + this.overflowPanelBounds.w &&
          y <= this.overflowPanelBounds.y + this.overflowPanelBounds.h;
        const anchorId = this.getMenuAnchorId();
        const anchorButton = this.controls.find((c) => c.id === anchorId);
        const inAnchorButton = anchorButton &&
          x >= anchorButton.x && y >= anchorButton.y &&
          x <= anchorButton.x + anchorButton.w && y <= anchorButton.y + anchorButton.h;
        if (!inPanel && !inAnchorButton) {
          this.closeOverflowPanel();
          this.pressed = null;
          return { id: "overflow-dismiss", kind: "button" };
        }
      }
      const c = this.getControlAt(x,y);
      this.pressed = c ? c.id : null;
      if (c && c.kind === "frame") {
        this.dragFrameIndex = c.frameIndex;
        this.dragOverFrameIndex = c.frameIndex;
        this.dragFeedbackText = "Dragging frame " + (c.frameIndex + 1);
      }
      return c;
    }
    pointerUp(x,y) {
      const c = this.getControlAt(x,y);
      const from = this.dragFrameIndex, to = this.dragOverFrameIndex;
      this.dragFrameIndex = null; this.dragOverFrameIndex = null;
      this.dragFeedbackText = "";
      if (from !== null && to !== null && from !== to) { this.pressed = null; this.app.reorderFrame(from,to); return true; }
      const ok = c && c.id === this.pressed;
      this.pressed = null;
      if (!ok) return false;
      if (typeof c.action === "function") {
        c.action();
        if (c.isCommandRow) this.closeCommandPalette();
        if (c.id.indexOf("overflow-item-") === 0) this.closeOverflowPanel();
        return true;
      }
      return false;
    }

    draw(ctx) {
      const L = this.layout, F = L.appFrame;
      ctx.fillStyle = "#0c1118"; ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);
      ctx.fillStyle = "#121b25"; ctx.fillRect(F.x,F.y,F.width,F.height);
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.strokeRect(F.x+0.5,F.y+0.5,F.width-1,F.height-1);
      [L.topPanel,L.leftPanel,L.rightPanel,L.bottomPanel].forEach((p) => {
        ctx.fillStyle = "#16202b"; ctx.fillRect(p.x,p.y,p.width,p.height);
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.strokeRect(p.x+0.5,p.y+0.5,p.width-1,p.height-1);
      });
      ctx.font = "13px Arial"; ctx.textBaseline = "middle";
      this.controls.forEach((c) => this.drawControl(ctx,c));
      this.drawOverflowPanel(ctx);
      this.drawCommandPalette(ctx);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Sprite Editor v2.2", L.topPanel.x + (L.topPanel.width * 0.5), L.topPanel.y + 10);
      ctx.textAlign = "left";
      if (this.dragFrameIndex !== null && this.dragOverFrameIndex !== null) {
        const from = this.dragFrameIndex + 1;
        const to = this.dragOverFrameIndex + 1;
        ctx.fillStyle = "#4cc9f0";
        ctx.font = "12px Arial";
        ctx.fillText(`Reorder: ${from} -> ${to}`, L.rightPanel.x + 18, L.rightPanel.y + L.rightPanel.height - 14);
      }
    }

    drawControl(ctx,c) {
      if (c.kind === "label") { ctx.fillStyle = "#91a3b6"; ctx.font = "bold 12px Arial"; ctx.fillText(c.text,c.x,c.y+c.h/2); return; }
      if (c.kind === "palette") {
        ctx.fillStyle = c.color; ctx.fillRect(c.x,c.y,c.w,c.h);
        const current = this.app.document.currentColor === c.color;
        ctx.strokeStyle = current ? "#4cc9f0" : "rgba(255,255,255,0.2)";
        ctx.lineWidth = current ? 3 : 1;
        ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1);
        if (this.app.paletteWorkflow.source === c.color) {
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(c.x + 2, c.y + 2, 8, 8);
        }
        if (this.app.paletteWorkflow.target === c.color) {
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(c.x + c.w - 10, c.y + 2, 8, 8);
        }
        ctx.lineWidth = 1;
        return;
      }
      const hovered = this.hovered === c.id, pressed = this.pressed === c.id, activeFrame = c.kind === "frame" && this.app.document.activeFrameIndex === c.frameIndex, activeLayerItem = typeof c.layerIndex === "number" && this.app.document.activeFrame.activeLayerIndex === c.layerIndex, dragTarget = c.kind === "frame" && this.dragOverFrameIndex === c.frameIndex && this.dragFrameIndex !== null, toolActive = c.tool && this.app.activeTool === c.tool;
      ctx.fillStyle = pressed ? "#27435a" : (hovered ? "#223444" : "#1a2733");
      if (c.isCommandRow && c.selected) ctx.fillStyle = "#2d5169";
      if (toolActive || activeFrame || activeLayerItem) ctx.fillStyle = "#244d67";
      if (dragTarget) ctx.fillStyle = "#305c4a";
      ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = (toolActive || activeFrame || activeLayerItem || dragTarget) ? "#4cc9f0" : "rgba(255,255,255,0.15)";
      if (c.isCommandRow && c.selected) ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1);
      ctx.fillStyle = c.layerHidden ? "#8fa0b2" : "#edf2f7";
      ctx.font = c.kind === "frame" ? "12px Arial" : "13px Arial";
      ctx.fillText(c.text,c.x+10,c.y+c.h/2);
      if (activeLayerItem) {
        ctx.fillStyle = "#4cc9f0";
        ctx.fillRect(c.x + 2, c.y + 2, 4, c.h - 4);
        ctx.font = "bold 11px Arial";
        const badge = "ACTIVE";
        const bw = ctx.measureText(badge).width;
        ctx.fillText(badge, c.x + c.w - bw - 10, c.y + c.h / 2);
      }
      if (c.layerLocked) {
        ctx.strokeStyle = "#f59e0b";
        ctx.strokeRect(c.x + c.w - 22.5, c.y + 6.5, 14, 14);
      }
      if (c.layerSolo) {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(c.x + c.w - 8, c.y + 6, 4, c.h - 12);
      }
      if (c.isCommandRow && c.category) {
        ctx.fillStyle = "#4cc9f0";
        ctx.font = "11px Arial";
        ctx.fillText(`[${String(c.category).slice(0, 10)}]`, c.x + 10, c.y + 11);
        ctx.fillStyle = "#edf2f7";
        ctx.font = "13px Arial";
      }
      if (c.isCommandRow && c.shortcut) {
        ctx.fillStyle = "#91a3b6";
        const t = `[${c.shortcut}]`;
        const w = ctx.measureText(t).width;
        ctx.fillText(t, c.x + c.w - w - 10, c.y + c.h / 2);
      }
      if (c.isCommandRow && c.favoriteToggleRect) {
        ctx.fillStyle = c.favorite ? "#fbbf24" : "#6b7b8e";
        ctx.font = "15px Arial";
        ctx.fillText(c.favorite ? "★" : "☆", c.favoriteToggleRect.x + 1, c.favoriteToggleRect.y + 9);
      }
      if (c.kind === "frame") {
        const f = this.app.document.frames[c.frameIndex];
        this.drawMiniFrame(ctx, this.app.document.getCompositedPixels(f), c.x+c.w-54, c.y+8, 46, c.h-16);
      }
    }

    drawMiniFrame(ctx,pixels,x,y,w,h) {
      const cols = this.app.document.cols, rows = this.app.document.rows, pw = Math.max(1, Math.floor(w/cols)), ph = Math.max(1, Math.floor(h/rows));
      ctx.fillStyle = "#fff"; ctx.fillRect(x,y,w,h);
      for (let py=0; py<rows; py+=1) for (let px=0; px<cols; px+=1) {
        const v = pixels[py][px];
        if (!v) continue;
        ctx.fillStyle = v; ctx.fillRect(x+px*pw, y+py*ph, pw, ph);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
    }

    drawOverflowPanel(ctx) {
      if (!this.overflowPanelOpen || !this.overflowPanelBounds) return;
      const p = this.overflowPanelBounds;
      ctx.fillStyle = "rgba(7, 12, 18, 0.86)";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#182432";
      ctx.fillRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
      ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
      this.overflowPanelControls.forEach((c) => this.drawControl(ctx, c));
    }

    drawCommandPalette(ctx) {
      if (!this.commandPaletteOpen || !this.commandPaletteBounds) return;
      const p = this.commandPaletteBounds;
      ctx.fillStyle = "rgba(2, 6, 12, 0.58)";
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.fillStyle = "#162435";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 15px Arial";
      ctx.fillText("Command Palette", p.x + 14, p.y + 20);
      ctx.font = "13px Arial";
      const q = this.commandPaletteQuery ? this.commandPaletteQuery : "(type to search)";
      ctx.fillStyle = this.commandPaletteQuery ? "#e6f2ff" : "#91a3b6";
      ctx.fillText(`> ${q}`, p.x + 14, p.y + 44);
      if (!this.commandPaletteFiltered.length) {
        ctx.fillStyle = "#91a3b6";
        ctx.fillText("No matching commands.", p.x + 14, p.y + p.headerH + 20);
      } else {
        this.commandPaletteRowControls.forEach((c) => this.drawControl(ctx, c));
      }
      ctx.fillStyle = "#91a3b6";
      ctx.font = "12px Arial";
      ctx.fillText("Up/Down navigate  Enter execute  Esc close", p.x + 14, p.y + p.h - 10);
    }
  }

  class SpriteEditorApp {
    constructor(canvas,fileInput,downloadLink) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.fileInput = fileInput;
      this.downloadLink = downloadLink;
      this.viewport = new SpriteEditorViewport(canvas);
      this.document = new SpriteEditorDocument();
      this.controlSurface = new SpriteEditorCanvasControlSurface(this);
      this.activeTool = "brush";
      this.brush = { size: 1, shape: "square" };
      this.hoveredGridCell = null;
      this.isPointerDown = false;
      this.mirror = false;
      this.selectionStart = null;
      this.selectionPasteOrigin = { x: 0, y: 0 };
      this.selectionMoveSession = null;
      this.timelineInteraction = null;
      this.timelineStripRect = null;
      this.frameRangeSelection = null;
      this.playbackRange = { enabled: false, startFrame: 0, endFrame: 0 };
      this.timelineHoverIndex = null;
      this.playback = { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, lastTick: 0 };
      this.strokeLastCell = null;
      this.shapePreview = null;
      this.currentPalettePreset = "Custom";
      this.paletteWorkflow = { source: null, target: null, scope: "active_layer" };
      this.exportMode = "all_frames";
      this.onionSkin = { prev: false, next: false };
      this.statusMessage = "Locked 16:9 viewport ready.";
      this.flashMessageUntil = 0;
      this.gridRect = null;
      this.uiDensityMode = "auto";
      this.uiDensityEffectiveMode = "standard";
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.isPanning = false;
      this.panStart = null;
      this.keybindings = this.createKeybindingMap();
      this.macroDefinitions = this.loadMacroDefinitions();
      this.commandDefinitions = this.getCommandDefinitions();
      this.recentActions = this.loadRecentActions();
      this.favoriteActions = this.loadFavoriteActions();
      this.commandPaletteCommands = this.createCommandPaletteCommands();
      this.history = { undo: [], redo: [], maxEntries: 120 };
      this.activeStrokeHistory = null;
      this.historySuppressedDepth = 0;
      this.dirtyBaselineSignature = "";
      this.isDirty = false;
      this.replaceGuard = { open: false, title: "", message: "", onConfirm: null, confirmRect: null, cancelRect: null };
      this.layerRenamePrompt = { open: false, text: "", title: "Rename Layer", panelRect: null, confirmRect: null, cancelRect: null };
      this.canvas.style.imageRendering = "pixelated";

      this.resize();
      this.dirtyBaselineSignature = this.historySignature(this.captureHistoryState());
      this.updateDirtyState();
      this.bindEvents();
      this.renderAll();
      requestAnimationFrame((ts) => this.tick(ts));
    }

    loadRecentActions() {
      try {
        const raw = localStorage.getItem(RECENT_ACTIONS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 40) : [];
      } catch (_e) {
        return [];
      }
    }

    saveRecentActions() {
      try {
        localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(this.recentActions.slice(0, 40)));
      } catch (_e) {
        // Ignore localStorage failures.
      }
    }

    trackRecentAction(actionId) {
      if (!actionId || actionId === "system.commandPalette") return;
      const next = [actionId].concat(this.recentActions.filter((x) => x !== actionId));
      this.recentActions = next.slice(0, 40);
      this.saveRecentActions();
    }

    cloneGridData(grid) {
      if (!Array.isArray(grid)) return null;
      return grid.map((row) => Array.isArray(row) ? row.slice() : row);
    }
    cloneFrameClipboardData(clip) {
      if (!clip || !Array.isArray(clip.layers)) return null;
      return {
        activeLayerIndex: clip.activeLayerIndex || 0,
        layers: clip.layers.map((l, i) => ({
          name: l.name || `Layer ${i + 1}`,
          visible: l.visible !== false,
          locked: l.locked === true,
          opacity: typeof l.opacity === "number" ? l.opacity : 1,
          pixels: this.cloneGridData(l.pixels || this.document.makeGrid())
        }))
      };
    }

    captureHistoryState() {
      const sel = this.document.selection ? { ...this.document.selection } : null;
      const selClip = this.document.selectionClipboard ? {
        width: this.document.selectionClipboard.width,
        height: this.document.selectionClipboard.height,
        pixels: this.cloneGridData(this.document.selectionClipboard.pixels)
      } : null;
      return {
        doc: this.document.buildExportPayload(),
        activeFrameIndex: this.document.activeFrameIndex,
        selection: sel,
        selectionClipboard: selClip,
        frameClipboard: this.cloneFrameClipboardData(this.document.frameClipboard),
        soloState: this.document.soloState ? { ...this.document.soloState } : null,
        frameRangeSelection: this.frameRangeSelection ? { ...this.frameRangeSelection } : null
      };
    }

    restoreHistoryState(state) {
      if (!state || !state.doc) return false;
      try {
        this.document.importPayload(state.doc);
        this.document.activeFrameIndex = Math.max(0, Math.min(state.activeFrameIndex || 0, this.document.frames.length - 1));
        this.document.selection = state.selection ? { ...state.selection } : null;
        this.document.selectionClipboard = state.selectionClipboard ? {
          width: state.selectionClipboard.width,
          height: state.selectionClipboard.height,
          pixels: this.cloneGridData(state.selectionClipboard.pixels)
        } : null;
        this.document.frameClipboard = this.cloneFrameClipboardData(state.frameClipboard);
        this.document.soloState = state.soloState ? { ...state.soloState } : null;
        this.frameRangeSelection = state.frameRangeSelection ? { ...state.frameRangeSelection } : null;
        this.playback.previewFrameIndex = this.document.activeFrameIndex;
        this.gridRect = this.computeGridRect();
        return true;
      } catch (_e) {
        return false;
      }
    }

    historySignature(state) {
      if (!state) return "";
      return JSON.stringify({
        doc: state.doc,
        activeFrameIndex: state.activeFrameIndex,
        selection: state.selection,
        selectionClipboard: state.selectionClipboard,
        frameClipboard: state.frameClipboard,
        soloState: state.soloState,
        frameRangeSelection: state.frameRangeSelection
      });
    }

    pushHistoryEntry(entry) {
      if (!entry || !entry.before || !entry.after) return;
      this.history.undo.push(entry);
      if (this.history.undo.length > this.history.maxEntries) this.history.undo.shift();
      this.history.redo = [];
      this.updateDirtyState();
    }

    executeWithHistory(label, mutator, options = {}) {
      const before = this.captureHistoryState();
      const result = mutator();
      if (!result) return result;
      if (options.suppressHistory || this.historySuppressedDepth > 0) return result;
      const after = this.captureHistoryState();
      if (this.historySignature(before) !== this.historySignature(after)) {
        this.pushHistoryEntry({ label, before, after });
      }
      return result;
    }

    beginStrokeHistory(label) {
      if (this.activeStrokeHistory) return;
      this.activeStrokeHistory = { label, before: this.captureHistoryState() };
    }

    commitStrokeHistory() {
      if (!this.activeStrokeHistory) return;
      const after = this.captureHistoryState();
      if (this.historySignature(this.activeStrokeHistory.before) !== this.historySignature(after)) {
        this.pushHistoryEntry({ label: this.activeStrokeHistory.label, before: this.activeStrokeHistory.before, after });
      }
      this.activeStrokeHistory = null;
    }

    undoHistory() {
      const entry = this.history.undo.pop();
      if (!entry) {
        this.showMessage("Nothing to undo.");
        return false;
      }
      if (!this.restoreHistoryState(entry.before)) {
        this.showMessage("Undo failed.");
        return false;
      }
      this.history.redo.push(entry);
      this.updateDirtyState();
      this.showMessage(`Undo: ${entry.label}`);
      return true;
    }

    redoHistory() {
      const entry = this.history.redo.pop();
      if (!entry) {
        this.showMessage("Nothing to redo.");
        return false;
      }
      if (!this.restoreHistoryState(entry.after)) {
        this.showMessage("Redo failed.");
        return false;
      }
      this.history.undo.push(entry);
      this.updateDirtyState();
      this.showMessage(`Redo: ${entry.label}`);
      return true;
    }

    updateDirtyState() {
      this.isDirty = this.historySignature(this.captureHistoryState()) !== this.dirtyBaselineSignature;
    }

    markCleanBaseline() {
      this.dirtyBaselineSignature = this.historySignature(this.captureHistoryState());
      this.updateDirtyState();
    }

    clearHistoryStacks() {
      this.history.undo = [];
      this.history.redo = [];
    }

    requestReplaceGuard(title, message, onConfirm, forcePrompt = false) {
      if (!forcePrompt && !this.isDirty) {
        if (typeof onConfirm === "function") onConfirm();
        return;
      }
      this.controlSurface.closeOverflowPanel();
      this.controlSurface.closeCommandPalette();
      this.closeLayerRenamePrompt();
      this.replaceGuard = {
        open: true,
        title,
        message,
        onConfirm,
        confirmRect: null,
        cancelRect: null
      };
      this.showMessage("Unsaved changes. Confirm or cancel.");
    }

    closeReplaceGuard() {
      this.replaceGuard.open = false;
      this.replaceGuard.onConfirm = null;
      this.replaceGuard.confirmRect = null;
      this.replaceGuard.cancelRect = null;
    }

    handleReplaceGuardPointer(p) {
      if (!this.replaceGuard.open || !p) return false;
      const inRect = (r) => r && p.x >= r.x && p.y >= r.y && p.x <= r.x + r.w && p.y <= r.y + r.h;
      if (inRect(this.replaceGuard.confirmRect)) {
        const fn = this.replaceGuard.onConfirm;
        this.closeReplaceGuard();
        if (typeof fn === "function") fn();
        this.renderAll();
        return true;
      }
      if (inRect(this.replaceGuard.cancelRect)) {
        this.closeReplaceGuard();
        this.showMessage("Replace canceled.");
        this.renderAll();
        return true;
      }
      return true;
    }

    isLayerRenameOpen() {
      return !!(this.layerRenamePrompt && this.layerRenamePrompt.open);
    }

    canOpenTransientSurface() {
      if (this.replaceGuard.open) {
        this.showMessage("Finish current confirm/cancel first.");
        return false;
      }
      if (this.isLayerRenameOpen()) {
        this.showMessage("Finish layer rename first.");
        return false;
      }
      return true;
    }

    closeMenuLikeSurfaces() {
      this.controlSurface.closeOverflowPanel();
      this.controlSurface.closeCommandPalette();
    }

    clearHoverPreviewState() {
      this.timelineHoverIndex = null;
      this.hoveredGridCell = null;
      this.controlSurface.hovered = null;
    }

    openLayerRenamePrompt() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeMenuLikeSurfaces();
      const af = this.document.ensureFrameLayers(this.document.activeFrame);
      const active = af.layers[af.activeLayerIndex];
      this.layerRenamePrompt.open = true;
      this.layerRenamePrompt.text = active && active.name ? active.name : `Layer ${af.activeLayerIndex + 1}`;
      this.showMessage("Rename layer: type, Enter apply, Esc cancel.");
      this.renderAll();
      return true;
    }

    closeLayerRenamePrompt() {
      this.layerRenamePrompt.open = false;
      this.layerRenamePrompt.panelRect = null;
      this.layerRenamePrompt.confirmRect = null;
      this.layerRenamePrompt.cancelRect = null;
    }

    confirmLayerRename() {
      if (!this.isLayerRenameOpen()) return false;
      const nextName = String(this.layerRenamePrompt.text || "").trim();
      const ok = this.executeWithHistory("Layer Rename", () => {
        const done = this.document.renameActiveLayer(nextName);
        if (done) this.showMessage(`Layer renamed: ${this.document.activeLayer.name}`);
        return done;
      });
      if (!ok) this.showMessage("Layer rename canceled.");
      this.closeLayerRenamePrompt();
      this.renderAll();
      return !!ok;
    }

    handleLayerRenamePointer(p) {
      if (!this.isLayerRenameOpen() || !p) return false;
      const inRect = (r) => r && p.x >= r.x && p.y >= r.y && p.x <= r.x + r.w && p.y <= r.y + r.h;
      if (inRect(this.layerRenamePrompt.confirmRect)) {
        this.confirmLayerRename();
        return true;
      }
      if (inRect(this.layerRenamePrompt.cancelRect)) {
        this.closeLayerRenamePrompt();
        this.showMessage("Layer rename canceled.");
        this.renderAll();
        return true;
      }
      if (this.layerRenamePrompt.panelRect && !inRect(this.layerRenamePrompt.panelRect)) {
        this.closeLayerRenamePrompt();
        this.showMessage("Layer rename canceled.");
        this.renderAll();
        return true;
      }
      return true;
    }

    loadFavoriteActions() {
      try {
        const raw = localStorage.getItem(FAVORITE_ACTIONS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 80) : [];
      } catch (_e) {
        return [];
      }
    }

    getBuiltInMacros() {
      return [
        {
          id: "macro:prep_brush_center",
          label: "Macro: Prep Brush Center",
          category: "Macro",
          aliases: ["prep brush", "reset and brush"],
          keywords: ["macro", "reset", "brush"],
          actions: ["view.zoomReset", "tool.brush"]
        },
        {
          id: "macro:animate_preview_cycle",
          label: "Macro: Animate Preview Cycle",
          category: "Macro",
          aliases: ["preview cycle", "animation preview"],
          keywords: ["macro", "playback", "preview"],
          actions: ["frame.next", "frame.next", "system.playback"]
        }
      ];
    }

    normalizeMacroDefinition(input) {
      if (!input || typeof input !== "object") return null;
      const id = String(input.id || "").trim();
      const label = String(input.label || "").trim();
      if (!id || !label || id.indexOf("macro:") !== 0) return null;
      const actions = Array.isArray(input.actions) ? input.actions.filter((a) => typeof a === "string" && a.trim()).map((a) => a.trim()) : [];
      if (!actions.length) return null;
      const aliases = Array.isArray(input.aliases) ? input.aliases.filter((a) => typeof a === "string") : [];
      const keywords = Array.isArray(input.keywords) ? input.keywords.filter((k) => typeof k === "string") : [];
      return {
        id,
        label,
        category: "Macro",
        aliases,
        keywords,
        actions
      };
    }

    loadMacroDefinitions() {
      const builtIns = this.getBuiltInMacros().map((m) => this.normalizeMacroDefinition(m)).filter(Boolean);
      try {
        const raw = localStorage.getItem(MACRO_DEFINITIONS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return builtIns;
        const custom = parsed.map((m) => this.normalizeMacroDefinition(m)).filter(Boolean);
        const byId = new Map();
        builtIns.forEach((m) => byId.set(m.id, m));
        custom.forEach((m) => byId.set(m.id, m));
        return Array.from(byId.values());
      } catch (_e) {
        return builtIns;
      }
    }

    saveMacroDefinitions() {
      try {
        localStorage.setItem(MACRO_DEFINITIONS_KEY, JSON.stringify(this.macroDefinitions));
      } catch (_e) {
        // Ignore localStorage failures.
      }
    }

    saveFavoriteActions() {
      try {
        localStorage.setItem(FAVORITE_ACTIONS_KEY, JSON.stringify(this.favoriteActions.slice(0, 80)));
      } catch (_e) {
        // Ignore localStorage failures.
      }
    }

    toggleFavoriteAction(actionId) {
      if (!actionId) return;
      if (this.favoriteActions.indexOf(actionId) >= 0) {
        this.favoriteActions = this.favoriteActions.filter((id) => id !== actionId);
        this.showMessage("Favorite removed.");
      } else {
        this.favoriteActions = [actionId].concat(this.favoriteActions.filter((id) => id !== actionId)).slice(0, 80);
        this.showMessage("Favorite pinned.");
      }
      this.saveFavoriteActions();
    }

    bindEvents() {
      window.addEventListener("resize", () => { this.resize(); this.renderAll(); });
      document.addEventListener("fullscreenchange", () => { this.resize(); this.renderAll(); });
      this.canvas.addEventListener("pointermove", (e) => this.onPointerMove(e));
      this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
      this.canvas.addEventListener("pointerleave", () => {
        if (this.isPointerDown || this.timelineInteraction) return;
        this.clearHoverPreviewState();
        this.renderAll();
      });
      window.addEventListener("pointerup", (e) => this.onPointerUp(e));
      this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
      this.canvas.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
      window.addEventListener("keydown", (e) => this.onKeyDown(e));
      this.fileInput.addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        try {
          const payload = JSON.parse(await file.text());
          this.requestReplaceGuard("Import JSON", "Replace current document with imported JSON?", () => {
            this.document.importPayload(payload);
            this.clearHistoryStacks();
            this.markCleanBaseline();
            this.showMessage("Imported sprite JSON.");
          });
        } catch (_error) {
          this.showMessage("Import failed.");
        }
        this.fileInput.value = "";
        this.renderAll();
      });
    }

    resize() {
      this.viewport.updateFromCanvasElement();
      this.controlSurface.rebuildLayout();
      this.gridRect = this.computeGridRect();
    }

    isFullscreen() {
      return document.fullscreenElement === this.canvas.closest(".sprite-editor-shell");
    }

    async toggleFullscreen() {
      const stage = this.canvas.closest(".sprite-editor-shell");
      try {
        if (this.isFullscreen()) await document.exitFullscreen();
        else await stage.requestFullscreen();
      } catch (_error) {
        this.showMessage("Full screen unavailable.");
      }
      this.renderAll();
    }

    computeGridRect() {
      const a = this.controlSurface.layout.gridArea;
      const basePixelSize = Math.max(12, Math.floor(Math.min(a.width / this.document.cols, a.height / this.document.rows)));
      const pixelSize = Math.max(4, Math.floor(basePixelSize * this.zoom));
      const width = this.document.cols * pixelSize;
      const height = this.document.rows * pixelSize;
      const maxPanX = Math.max(0, Math.floor((width - a.width) / 2) + 40);
      const maxPanY = Math.max(0, Math.floor((height - a.height) / 2) + 40);
      this.pan.x = Math.max(-maxPanX, Math.min(maxPanX, this.pan.x));
      this.pan.y = Math.max(-maxPanY, Math.min(maxPanY, this.pan.y));
      return {
        x: a.x + Math.floor((a.width - width) / 2) + this.pan.x,
        y: a.y + Math.floor((a.height - height) / 2) + this.pan.y,
        width,
        height,
        pixelSize
      };
    }

    logicalPointFromEvent(e) {
      return this.viewport.screenToLogical(e.clientX, e.clientY);
    }

    getGridCellAtLogical(x, y) {
      const r = this.gridRect;
      if (!r || x < r.x || y < r.y || x > r.x + r.width || y > r.y + r.height) return null;
      return { x: Math.floor((x - r.x) / r.pixelSize), y: Math.floor((y - r.y) / r.pixelSize) };
    }

    computeTimelineLayout() {
      const p = this.controlSurface.layout.rightPanel;
      const x = p.x + 18;
      const y = p.y + p.height - 356;
      const w = p.width - 36;
      const h = 96;
      const transportY = y + 16;
      const transportH = 18;
      const transport = [
        { id: "play_pause", x: x + 8, y: transportY, w: 54, h: transportH },
        { id: "stop", x: x + 66, y: transportY, w: 42, h: transportH },
        { id: "loop", x: x + 112, y: transportY, w: 50, h: transportH },
        { id: "range", x: x + 166, y: transportY, w: 56, h: transportH },
        { id: "fps_down", x: x + w - 92, y: transportY, w: 20, h: transportH },
        { id: "fps_up", x: x + w - 24, y: transportY, w: 20, h: transportH }
      ];
      const innerX = x + 8;
      const innerY = y + 40;
      const innerW = w - 16;
      const innerH = h - 48;
      const count = Math.max(1, this.document.frames.length);
      const slotGap = 6;
      const maxSlotW = 52;
      const slotW = Math.max(24, Math.min(maxSlotW, Math.floor((innerW - (count - 1) * slotGap) / count)));
      const slotH = innerH;
      const totalW = count * slotW + (count - 1) * slotGap;
      const startX = innerX + Math.max(0, Math.floor((innerW - totalW) * 0.5));
      const slots = [];
      for (let i = 0; i < count; i += 1) {
        slots.push({ index: i, x: startX + i * (slotW + slotGap), y: innerY, w: slotW, h: slotH });
      }
      return { x, y, w, h, slots, transport };
    }

    getTimelineIndexAt(p) {
      if (!this.timelineStripRect || !p) return null;
      const slots = this.timelineStripRect.slots;
      for (let i = 0; i < slots.length; i += 1) {
        const s = slots[i];
        if (p.x >= s.x && p.y >= s.y && p.x <= s.x + s.w && p.y <= s.y + s.h) return s.index;
      }
      return null;
    }

    getTimelineControlAt(p) {
      if (!this.timelineStripRect || !p) return null;
      const controls = this.timelineStripRect.transport || [];
      for (let i = 0; i < controls.length; i += 1) {
        const c = controls[i];
        if (p.x >= c.x && p.y >= c.y && p.x <= c.x + c.w && p.y <= c.y + c.h) return c.id;
      }
      return null;
    }
    getFrameRangeSelection() {
      if (!this.frameRangeSelection) return { start: this.document.activeFrameIndex, end: this.document.activeFrameIndex, explicit: false };
      const start = Math.max(0, Math.min(this.frameRangeSelection.start, this.frameRangeSelection.end, this.document.frames.length - 1));
      const end = Math.max(0, Math.min(Math.max(this.frameRangeSelection.start, this.frameRangeSelection.end), this.document.frames.length - 1));
      return { start, end, explicit: true };
    }
    isFrameInSelectedRange(index) {
      const range = this.getFrameRangeSelection();
      return index >= range.start && index <= range.end;
    }
    setFrameRangeSelection(start, end, anchor = start) {
      const s = Math.max(0, Math.min(start, end, this.document.frames.length - 1));
      const e = Math.max(0, Math.min(Math.max(start, end), this.document.frames.length - 1));
      this.frameRangeSelection = { start: s, end: e, anchor };
    }
    clearFrameRangeSelection(showMessage = false) {
      this.frameRangeSelection = null;
      if (showMessage) this.showMessage("Frame range cleared.");
    }
    getPlaybackRange() {
      const max = Math.max(0, this.document.frames.length - 1);
      const start = Math.max(0, Math.min(this.playbackRange.startFrame, this.playbackRange.endFrame, max));
      const end = Math.max(0, Math.min(Math.max(this.playbackRange.startFrame, this.playbackRange.endFrame), max));
      return { enabled: !!this.playbackRange.enabled, startFrame: start, endFrame: end };
    }
    setPlaybackRange(startFrame, endFrame, enabled = true) {
      const max = Math.max(0, this.document.frames.length - 1);
      const start = Math.max(0, Math.min(startFrame, endFrame, max));
      const end = Math.max(0, Math.min(Math.max(startFrame, endFrame), max));
      this.playbackRange = { enabled: !!enabled, startFrame: start, endFrame: end };
    }
    clearPlaybackRange(showMessage = false) {
      this.playbackRange.enabled = false;
      this.playbackRange.startFrame = 0;
      this.playbackRange.endFrame = Math.max(0, this.document.frames.length - 1);
      if (showMessage) this.showMessage("Playback range cleared.");
    }
    isFrameInPlaybackRange(index) {
      const range = this.getPlaybackRange();
      if (!range.enabled) return false;
      return index >= range.startFrame && index <= range.endFrame;
    }
    setPlaybackRangeFromSelection() {
      const range = this.getFrameRangeSelection();
      if (!range.explicit || range.start === range.end) {
        this.showMessage("Select at least two frames first.");
        return false;
      }
      this.setPlaybackRange(range.start, range.end, true);
      this.showMessage(`Playback range: ${range.start + 1}-${range.end + 1}`);
      this.renderAll();
      return true;
    }
    jumpToPlaybackRangeEdge(toEnd) {
      const range = this.getPlaybackRange();
      if (!range.enabled) {
        this.showMessage("Playback range not set.");
        return false;
      }
      this.selectFrame(toEnd ? range.endFrame : range.startFrame);
      this.showMessage(toEnd ? "Jumped to range end." : "Jumped to range start.");
      return true;
    }
    openPlaybackRangeMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "playback-menu-set", text: "Set Range From Selection", action: () => this.setPlaybackRangeFromSelection() },
        { id: "playback-menu-clear", text: "Clear Range", action: () => this.dispatchKeybinding("playback.clearRange") },
        { id: "playback-menu-toggle", text: "Toggle Range Loop", action: () => this.dispatchKeybinding("playback.toggleRangeLoop") },
        { id: "playback-menu-start", text: "Jump To Range Start", action: () => this.jumpToPlaybackRangeEdge(false) },
        { id: "playback-menu-end", text: "Jump To Range End", action: () => this.jumpToPlaybackRangeEdge(true) }
      ];
      this.controlSurface.toggleTopMenu("playback-range-menu", items);
      this.renderAll();
      return true;
    }
    openEditMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeCommandPalette();
      const hasSelection = !!this.document.selection;
      const hasClipboard = !!this.document.selectionClipboard;
      const items = [
        { id: "edit-menu-undo", text: "Undo", action: () => this.undoHistory() },
        { id: "edit-menu-redo", text: "Redo", action: () => this.redoHistory() },
        { id: "edit-menu-copy", text: "Copy", action: () => this.handleSelectionAction("sel-copy") },
        { id: "edit-menu-cut", text: "Cut", action: () => this.handleSelectionAction("sel-cut") },
        { id: "edit-menu-paste", text: "Paste", action: () => this.handleSelectionAction("sel-paste") },
        { id: "edit-menu-clear", text: hasSelection ? "Clear Selection" : "Clear Selection (none)", action: () => this.handleSelectionAction("sel-clear") },
        { id: "edit-menu-dup-frame", text: "Duplicate Frame", action: () => this.duplicateFrame() },
        { id: "edit-menu-del-frame", text: "Delete Frame", action: () => this.deleteFrame() }
      ];
      if (!hasSelection && !hasClipboard) {
        items.splice(2, 0, { id: "edit-menu-hint", text: "Selection tools via Select tool", action: null });
      }
      this.controlSurface.toggleTopMenu("edit", items);
      this.renderAll();
      return true;
    }
    openFrameMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeCommandPalette();
      const range = this.getFrameRangeSelection();
      const playbackRange = this.getPlaybackRange();
      const items = [
        { id: "frame-menu-add", text: "Add Frame", action: () => this.addFrame() },
        { id: "frame-menu-dup", text: "Duplicate Frame", action: () => this.duplicateFrame() },
        { id: "frame-menu-del", text: "Delete Frame", action: () => this.deleteFrame() },
        { id: "frame-menu-copy", text: "Copy Frame", action: () => this.copyFrame() },
        { id: "frame-menu-paste", text: "Paste Frame", action: () => this.pasteFrame() },
        { id: "frame-menu-range-dup", text: `Duplicate Range${range.explicit ? ` (${range.start + 1}-${range.end + 1})` : ""}`, action: () => this.duplicateSelectedFrameRange() },
        { id: "frame-menu-range-del", text: `Delete Range${range.explicit ? ` (${range.start + 1}-${range.end + 1})` : ""}`, action: () => this.deleteSelectedFrameRange() },
        { id: "frame-menu-range-left", text: "Shift Range Left", action: () => this.shiftSelectedFrameRange(-1) },
        { id: "frame-menu-range-right", text: "Shift Range Right", action: () => this.shiftSelectedFrameRange(1) },
        { id: "frame-menu-range-clear", text: "Clear Range Selection", action: () => this.clearFrameRangeSelection(true) },
        { id: "frame-menu-playback-set", text: "Set Playback Range From Selection", action: () => this.setPlaybackRangeFromSelection() },
        { id: "frame-menu-playback-clear", text: playbackRange.enabled ? "Clear Playback Range" : "Clear Playback Range (none)", action: () => this.dispatchKeybinding("playback.clearRange") }
      ];
      this.controlSurface.toggleTopMenu("frame", items);
      this.renderAll();
      return true;
    }
    openLayerMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeCommandPalette();
      const af = this.document.ensureFrameLayers(this.document.activeFrame);
      const activeLayer = af.layers[af.activeLayerIndex];
      const layerName = activeLayer ? activeLayer.name : "Layer";
      const items = [
        { id: "layer-menu-add", text: "Add Layer", action: () => this.addLayer() },
        { id: "layer-menu-dup", text: "Duplicate Layer", action: () => this.duplicateLayer() },
        { id: "layer-menu-del", text: "Delete Layer", action: () => this.deleteLayer() },
        { id: "layer-menu-rename", text: `Rename ${layerName}`, action: () => this.openLayerRenamePrompt() },
        { id: "layer-menu-up", text: "Move Up", action: () => this.moveLayerUp() },
        { id: "layer-menu-down", text: "Move Down", action: () => this.moveLayerDown() },
        { id: "layer-menu-vis", text: "Toggle Visibility", action: () => this.toggleLayerVisibility() },
        { id: "layer-menu-solo", text: "Solo", action: () => this.toggleLayerSolo() },
        { id: "layer-menu-lock", text: "Lock", action: () => this.toggleLayerLock() },
        { id: "layer-menu-merge", text: "Merge Down", action: () => this.mergeLayerDown() },
        { id: "layer-menu-flatten", text: "Flatten Frame", action: () => this.requestFlattenFrame() },
        { id: "layer-menu-opacity-down", text: "Opacity -", action: () => this.adjustLayerOpacity(-0.1) },
        { id: "layer-menu-opacity-up", text: "Opacity +", action: () => this.adjustLayerOpacity(0.1) },
        { id: "layer-menu-opacity-reset", text: "Opacity 100%", action: () => this.resetLayerOpacity() },
        { id: "layer-menu-blend", text: "Blend Preview", action: () => this.toggleBlendPreview() }
      ];
      this.controlSurface.toggleTopMenu("layer", items);
      this.renderAll();
      return true;
    }
    openLayerActionsMenu() {
      this.openLayerMenu();
    }

    isCellInsideSelection(cell) {
      const s = this.document.selection;
      if (!s || !cell) return false;
      return cell.x >= s.x && cell.y >= s.y && cell.x < s.x + s.width && cell.y < s.y + s.height;
    }

    moveSelectionBy(dx, dy) {
      const s = this.document.selection;
      if (!s || (!dx && !dy)) return false;
      const maxLeft = -s.x;
      const maxRight = this.document.cols - (s.x + s.width);
      const maxUp = -s.y;
      const maxDown = this.document.rows - (s.y + s.height);
      const cdx = Math.max(maxLeft, Math.min(maxRight, dx));
      const cdy = Math.max(maxUp, Math.min(maxDown, dy));
      if (!cdx && !cdy) return false;
      const block = this.document.readSelection();
      if (!block) return false;
      const frame = this.document.activeLayer.pixels;
      for (let y = 0; y < s.height; y += 1) {
        for (let x = 0; x < s.width; x += 1) {
          frame[s.y + y][s.x + x] = null;
        }
      }
      const nx = s.x + cdx;
      const ny = s.y + cdy;
      for (let y = 0; y < block.height; y += 1) {
        for (let x = 0; x < block.width; x += 1) {
          frame[ny + y][nx + x] = block.pixels[y][x];
        }
      }
      this.document.setSelection({ x: nx, y: ny, width: s.width, height: s.height });
      this.selectionPasteOrigin = { x: nx, y: ny };
      return true;
    }

    beginSelectionMove(cell) {
      if (!this.isCellInsideSelection(cell)) return false;
      if (!this.canEditActiveLayer(true)) return false;
      this.selectionMoveSession = {
        before: this.captureHistoryState(),
        lastCell: { x: cell.x, y: cell.y }
      };
      return true;
    }

    commitSelectionMove() {
      if (!this.selectionMoveSession) return;
      const after = this.captureHistoryState();
      if (this.historySignature(this.selectionMoveSession.before) !== this.historySignature(after)) {
        this.pushHistoryEntry({ label: "Selection Move", before: this.selectionMoveSession.before, after });
      }
      this.selectionMoveSession = null;
    }

    nudgeSelection(dx, dy, step) {
      if (!this.canEditActiveLayer(true)) return false;
      return this.executeWithHistory(`Selection Nudge ${step}`, () => this.moveSelectionBy(dx, dy));
    }

    onPointerMove(e) {
      const p = this.logicalPointFromEvent(e);
      if (!p) return;
      if (this.timelineInteraction) {
        const idx = this.getTimelineIndexAt(p);
        if (idx !== null) {
          if (this.timelineInteraction.mode === "scrub") {
            this.selectFrame(idx);
          } else if (this.timelineInteraction.mode === "reorder") {
            this.timelineInteraction.targetIndex = idx;
            this.controlSurface.dragFeedbackText = `Timeline reorder ${this.timelineInteraction.startIndex + 1} -> ${idx + 1}`;
          }
        }
        this.renderAll();
        return;
      }
      const hoverTimelineIndex = this.getTimelineIndexAt(p);
      this.timelineHoverIndex = hoverTimelineIndex;
      this.controlSurface.updateHover(p.x, p.y);
      const cell = this.getGridCellAtLogical(p.x, p.y);
      this.hoveredGridCell = cell;

      if (this.isPanning && this.panStart) {
        this.pan.x = this.panStart.baseX + (p.x - this.panStart.x);
        this.pan.y = this.panStart.baseY + (p.y - this.panStart.y);
        this.gridRect = this.computeGridRect();
        this.renderAll();
        return;
      }

      if (this.isPointerDown) {
        if (this.shapePreview && cell) {
          this.shapePreview.current = { x: cell.x, y: cell.y };
          this.renderAll();
          return;
        }
        if (this.selectionMoveSession && cell) {
          const dx = cell.x - this.selectionMoveSession.lastCell.x;
          const dy = cell.y - this.selectionMoveSession.lastCell.y;
          if (dx || dy) {
            this.moveSelectionBy(dx, dy);
            this.selectionMoveSession.lastCell = { x: cell.x, y: cell.y };
          }
          this.renderAll();
          return;
        }
        if (this.activeTool === "select" && this.selectionStart && cell) {
          this.setSelectionFromTwoCells(this.selectionStart, cell);
          this.renderAll();
          return;
        }
        if (cell && this.activeTool !== "select") {
          if (this.activeTool === "brush" || this.activeTool === "erase") {
            const erase = e.buttons === 2 || this.activeTool === "erase";
            this.applyStrokeSegment(this.strokeLastCell || cell, cell, erase);
            this.strokeLastCell = { x: cell.x, y: cell.y };
          } else {
            this.applyGridTool(cell.x, cell.y, e.buttons === 2);
          }
          this.renderAll();
        }
      } else {
        this.renderAll();
      }
    }

    onPointerDown(e) {
      const p = this.logicalPointFromEvent(e);
      if (!p) return;
      if (this.isLayerRenameOpen()) {
        this.handleLayerRenamePointer(p);
        return;
      }
      if (this.replaceGuard.open) {
        this.handleReplaceGuardPointer(p);
        return;
      }
      const timelineControl = this.getTimelineControlAt(p);
      if (timelineControl) {
        if (timelineControl === "play_pause") this.togglePlayback();
        else if (timelineControl === "stop") this.stopPlayback();
        else if (timelineControl === "loop") this.togglePlaybackLoop();
        else if (timelineControl === "range") this.openPlaybackRangeMenu();
        else if (timelineControl === "fps_down") this.adjustPlaybackFps(-1);
        else if (timelineControl === "fps_up") this.adjustPlaybackFps(1);
        this.renderAll();
        return;
      }
      const timelineIndex = this.getTimelineIndexAt(p);
      if (timelineIndex !== null) {
        if (e.shiftKey && e.altKey) {
          this.timelineInteraction = { mode: "reorder", startIndex: timelineIndex, targetIndex: timelineIndex };
          this.controlSurface.dragFeedbackText = `Timeline reorder ${timelineIndex + 1}`;
        } else if (e.shiftKey) {
          const anchor = this.frameRangeSelection ? this.frameRangeSelection.anchor : this.document.activeFrameIndex;
          this.setFrameRangeSelection(anchor, timelineIndex, anchor);
          this.selectFrame(timelineIndex);
          this.showMessage(`Frame range: ${Math.min(anchor, timelineIndex) + 1}-${Math.max(anchor, timelineIndex) + 1}`);
        } else {
          this.setFrameRangeSelection(timelineIndex, timelineIndex, timelineIndex);
          this.timelineInteraction = { mode: "scrub", startIndex: timelineIndex, targetIndex: timelineIndex };
          this.selectFrame(timelineIndex);
        }
        this.isPointerDown = true;
        this.renderAll();
        return;
      }

      if (e.button === 1 || e.shiftKey) {
        this.isPanning = true;
        this.panStart = { x: p.x, y: p.y, baseX: this.pan.x, baseY: this.pan.y };
        return;
      }

      const control = this.controlSurface.pointerDown(p.x, p.y);
      if (control) { this.renderAll(); return; }

      const cell = this.getGridCellAtLogical(p.x, p.y);
      if (!cell) return;
      this.isPointerDown = true;
      this.hoveredGridCell = cell;

      if (this.activeTool === "select") {
        if (this.beginSelectionMove(cell)) {
          this.isPointerDown = true;
          this.renderAll();
          return;
        }
        this.selectionStart = cell;
        this.setSelectionFromTwoCells(cell, cell);
        this.renderAll();
        return;
      }

      if (this.activeTool === "line" || this.activeTool === "rect" || this.activeTool === "fillrect") {
        if (!this.canEditActiveLayer(true)) return;
        this.shapePreview = {
          tool: this.activeTool,
          start: { x: cell.x, y: cell.y },
          current: { x: cell.x, y: cell.y },
          erase: e.button === 2
        };
        this.renderAll();
        return;
      }

      this.beginStrokeHistory(this.activeTool === "erase" || e.button === 2 ? "Erase Stroke" : "Draw Stroke");
      this.strokeLastCell = { x: cell.x, y: cell.y };
      this.applyGridTool(cell.x, cell.y, e.button === 2);
      this.renderAll();
    }

    onPointerUp(e) {
      const p = this.logicalPointFromEvent(e);
      if (this.timelineInteraction) {
        if (this.timelineInteraction.mode === "reorder") {
          const from = this.timelineInteraction.startIndex;
          const to = this.timelineInteraction.targetIndex;
          if (typeof to === "number" && from !== to) this.reorderFrame(from, to);
          else this.showMessage("Timeline reorder canceled.");
        }
        this.timelineInteraction = null;
        this.controlSurface.dragFeedbackText = "";
        this.isPointerDown = false;
        this.renderAll();
        return;
      }
      if (p && this.controlSurface.pointerUp(p.x, p.y)) this.renderAll();
      if (this.shapePreview) {
        this.commitShapePreview();
        this.shapePreview = null;
      }
      this.commitStrokeHistory();
      this.commitSelectionMove();
      this.isPointerDown = false;
      this.selectionStart = null;
      this.strokeLastCell = null;
      this.isPanning = false;
      this.panStart = null;
      if (!p || this.getTimelineIndexAt(p) === null) this.timelineHoverIndex = null;
      this.renderAll();
    }

    onWheel(e) {
      e.preventDefault();
      if (e.deltaY < 0) this.adjustZoom(0.25);
      else this.adjustZoom(-0.25);
    }

    onKeyDown(e) {
      if (this.isLayerRenameOpen()) {
        const k = (e.key || "").toLowerCase();
        if (k === "escape") {
          this.closeLayerRenamePrompt();
          this.showMessage("Layer rename canceled.");
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (k === "enter") {
          this.confirmLayerRename();
          e.preventDefault();
          return;
        }
        if (k === "backspace") {
          this.layerRenamePrompt.text = this.layerRenamePrompt.text.slice(0, -1);
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (this.layerRenamePrompt.text.length < 40) this.layerRenamePrompt.text += e.key;
          e.preventDefault();
          this.renderAll();
          return;
        }
      }
      if (this.replaceGuard.open) {
        const k = (e.key || "").toLowerCase();
        if (k === "escape") {
          this.closeReplaceGuard();
          this.showMessage("Replace canceled.");
          e.preventDefault();
          this.renderAll();
          return;
        }
      }
      if (this.isTypingTarget(e.target)) return;
      if (this.controlSurface.commandPaletteOpen) {
        const k = (e.key || "").toLowerCase();
        if (k === "escape") {
          this.controlSurface.closeCommandPalette();
          this.showMessage("Command palette closed.");
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (k === "arrowdown") {
          this.controlSurface.moveCommandPaletteSelection(1);
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (k === "arrowup") {
          this.controlSurface.moveCommandPaletteSelection(-1);
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (k === "enter") {
          if (this.controlSurface.activateCommandPaletteSelection()) {
            e.preventDefault();
            this.renderAll();
            return;
          }
        }
        if (k === "backspace") {
          this.controlSurface.setCommandPaletteQuery(this.controlSurface.commandPaletteQuery.slice(0, -1));
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.controlSurface.setCommandPaletteQuery(this.controlSurface.commandPaletteQuery + e.key);
          e.preventDefault();
          this.renderAll();
          return;
        }
      }
      const gesture = this.getKeyGesture(e);
      const action = this.keybindings[gesture];
      if (!action) return;
      const handled = this.dispatchKeybinding(action);
      if (!handled) return;
      this.trackRecentAction(action);
      e.preventDefault();
      this.renderAll();
    }

    createKeybindingMap() {
      return {
        "b": "tool.brush",
        "e": "tool.erase",
        "f": "tool.fill",
        "l": "tool.line",
        "r": "tool.rect",
        "g": "tool.fillrect",
        "i": "tool.eyedropper",
        "s": "tool.select",
        "1": "brush.size_1",
        "2": "brush.size_2",
        "3": "brush.size_3",
        "4": "brush.size_4",
        "5": "brush.size_5",
        "p": "system.playback",
        " ": "system.playback",
        "=": "view.zoomIn",
        "+": "view.zoomIn",
        "-": "view.zoomOut",
        "0": "view.zoomReset",
        "x": "view.pixelToggle",
        "o": "view.onionPrevToggle",
        "shift+o": "view.onionNextToggle",
        "[": "frame.prev",
        "]": "frame.next",
        "ctrl+d": "frame.duplicate",
        "ctrl+c": "selection.copy",
        "ctrl+x": "selection.cut",
        "ctrl+v": "selection.paste",
        "ctrl+z": "system.undo",
        "ctrl+y": "system.redo",
        "ctrl+shift+z": "system.redo",
        "ctrl+k": "system.commandPalette",
        "ctrl+shift+r": "layer.rename",
        "alt+arrowup": "layer.moveUp",
        "alt+arrowdown": "layer.moveDown",
        "arrowup": "selection.nudge_up",
        "arrowdown": "selection.nudge_down",
        "arrowleft": "selection.nudge_left",
        "arrowright": "selection.nudge_right",
        "shift+arrowup": "selection.nudge_up_big",
        "shift+arrowdown": "selection.nudge_down_big",
        "shift+arrowleft": "selection.nudge_left_big",
        "shift+arrowright": "selection.nudge_right_big",
        "shift+f": "system.fullscreen",
        "escape": "system.escape",
        "delete": "system.delete"
      };
    }

    getShortcutHintForAction(action) {
      const pairs = Object.entries(this.keybindings);
      for (let i = 0; i < pairs.length; i += 1) {
        if (pairs[i][1] === action) return pairs[i][0];
      }
      return "";
    }

    getCommandDefinitions() {
      const commands = [
        { id: "tool.brush", label: "Tool: Brush", category: "Tool", keywords: ["draw", "paint", "pen"], aliases: ["brush", "brush tool", "switch brush"] },
        { id: "tool.erase", label: "Tool: Erase", category: "Tool", keywords: ["eraser", "remove"], aliases: ["erase", "eraser", "switch erase"] },
        { id: "tool.fill", label: "Tool: Fill", category: "Tool", keywords: ["bucket", "flood"], aliases: ["fill", "bucket fill"] },
        { id: "tool.line", label: "Tool: Line", category: "Tool", keywords: ["line", "shape"], aliases: ["line tool", "draw line"] },
        { id: "tool.rect", label: "Tool: Rectangle", category: "Tool", keywords: ["rectangle", "rect", "shape"], aliases: ["rectangle tool", "rect tool"] },
        { id: "tool.fillrect", label: "Tool: Fill Rectangle", category: "Tool", keywords: ["filled", "rectangle", "rect", "shape"], aliases: ["fill rectangle", "filled rect", "fill rect"] },
        { id: "tool.eyedropper", label: "Tool: Eyedropper", category: "Tool", keywords: ["picker", "sample"], aliases: ["eyedropper", "color picker", "picker"] },
        { id: "tool.select", label: "Tool: Select", category: "Tool", keywords: ["marquee", "selection"], aliases: ["select", "selection tool"] },
        { id: "brush.sizeUp", label: "Brush: Size Up", category: "Brush", keywords: ["brush", "size", "up"], aliases: ["increase brush size", "brush bigger"] },
        { id: "brush.sizeDown", label: "Brush: Size Down", category: "Brush", keywords: ["brush", "size", "down"], aliases: ["decrease brush size", "brush smaller"] },
        { id: "brush.toggleShape", label: "Brush: Toggle Shape", category: "Brush", keywords: ["brush", "shape", "square", "circle"], aliases: ["toggle brush shape", "brush shape"] },
        { id: "palette.prevColor", label: "Palette: Previous Color", category: "Palette", keywords: ["palette", "previous", "color"], aliases: ["previous color", "prev color"] },
        { id: "palette.nextColor", label: "Palette: Next Color", category: "Palette", keywords: ["palette", "next", "color"], aliases: ["next color"] },
        { id: "palette.replaceColor", label: "Palette: Replace Color", category: "Palette", keywords: ["palette", "replace", "color"], aliases: ["replace color", "palette replace"] },
        { id: "palette.scopeActiveLayer", label: "Palette: Set Scope Active Layer", category: "Palette", keywords: ["palette", "scope", "layer"], aliases: ["scope active layer", "palette scope layer"] },
        { id: "palette.scopeCurrentFrame", label: "Palette: Set Scope Current Frame", category: "Palette", keywords: ["palette", "scope", "frame"], aliases: ["scope current frame", "palette scope frame"] },
        { id: "palette.scopeSelectedRange", label: "Palette: Set Scope Selected Range", category: "Palette", keywords: ["palette", "scope", "range"], aliases: ["scope selected range", "palette scope range"] },
        { id: "view.zoomIn", label: "View: Zoom In", category: "View", keywords: ["magnify", "closer"], aliases: ["zoom in", "increase zoom"] },
        { id: "view.zoomOut", label: "View: Zoom Out", category: "View", keywords: ["farther", "shrink"], aliases: ["zoom out", "decrease zoom"] },
        { id: "view.zoomReset", label: "View: Reset Zoom/Pan", category: "View", keywords: ["reset", "center"], aliases: ["reset zoom", "zoom reset", "center view"] },
        { id: "view.pixelToggle", label: "View: Toggle Pixel Perfect", category: "View", keywords: ["pixel", "filter"], aliases: ["pixel perfect", "toggle pixel", "pixel"] },
        { id: "view.onionPrevToggle", label: "View: Toggle Onion Previous", category: "View", keywords: ["onion", "previous", "frame"], aliases: ["onion prev", "toggle onion previous"] },
        { id: "view.onionNextToggle", label: "View: Toggle Onion Next", category: "View", keywords: ["onion", "next", "frame"], aliases: ["onion next", "toggle onion next"] },
        { id: "frame.prev", label: "Frame: Previous", category: "Frame", keywords: ["animation", "back"], aliases: ["prev frame", "previous frame"] },
        { id: "frame.next", label: "Frame: Next", category: "Frame", keywords: ["animation", "forward"], aliases: ["next frame"] },
        { id: "frame.duplicate", label: "Frame: Duplicate", category: "Frame", keywords: ["copy frame"], aliases: ["dup frame", "duplicate frame"] },
        { id: "frame.duplicateRange", label: "Frame: Duplicate Range", category: "Frame", keywords: ["frame", "range", "duplicate", "batch"], aliases: ["duplicate range", "duplicate selected frames"] },
        { id: "frame.deleteRange", label: "Frame: Delete Range", category: "Frame", keywords: ["frame", "range", "delete", "batch"], aliases: ["delete range", "delete selected frames"] },
        { id: "frame.shiftRangeLeft", label: "Frame: Shift Range Left", category: "Frame", keywords: ["frame", "range", "shift", "left"], aliases: ["shift range left", "move range left"] },
        { id: "frame.shiftRangeRight", label: "Frame: Shift Range Right", category: "Frame", keywords: ["frame", "range", "shift", "right"], aliases: ["shift range right", "move range right"] },
        { id: "frame.clearRangeSelection", label: "Frame: Clear Range Selection", category: "Frame", keywords: ["frame", "range", "clear", "selection"], aliases: ["clear frame range", "clear range selection"] },
        { id: "selection.copy", label: "Selection: Copy", category: "Selection", keywords: ["copy"], aliases: ["copy selection"] },
        { id: "selection.cut", label: "Selection: Cut", category: "Selection", keywords: ["cut"], aliases: ["cut selection"] },
        { id: "selection.paste", label: "Selection: Paste", category: "Selection", keywords: ["paste"], aliases: ["paste selection"] },
        { id: "selection.nudge_up", label: "Selection: Nudge Up", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection up"] },
        { id: "selection.nudge_down", label: "Selection: Nudge Down", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection down"] },
        { id: "selection.nudge_left", label: "Selection: Nudge Left", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection left"] },
        { id: "selection.nudge_right", label: "Selection: Nudge Right", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection right"] },
        { id: "layer.add", label: "Layer: Add", category: "Layer", keywords: ["layer", "add"], aliases: ["add layer"] },
        { id: "layer.duplicate", label: "Layer: Duplicate", category: "Layer", keywords: ["layer", "duplicate"], aliases: ["dup layer", "duplicate layer"] },
        { id: "layer.delete", label: "Layer: Delete", category: "Layer", keywords: ["layer", "delete"], aliases: ["delete layer"] },
        { id: "layer.toggleVisibility", label: "Layer: Toggle Visibility", category: "Layer", keywords: ["layer", "visibility", "hide", "show"], aliases: ["toggle layer visibility", "hide layer", "show layer"] },
        { id: "layer.next", label: "Layer: Select Next", category: "Layer", keywords: ["layer", "next"], aliases: ["next layer"] },
        { id: "layer.prev", label: "Layer: Select Previous", category: "Layer", keywords: ["layer", "previous"], aliases: ["prev layer", "previous layer"] },
        { id: "layer.moveUp", label: "Layer: Move Up", category: "Layer", keywords: ["layer", "move", "up", "reorder"], aliases: ["move layer up", "layer up", "reorder layer up"] },
        { id: "layer.moveDown", label: "Layer: Move Down", category: "Layer", keywords: ["layer", "move", "down", "reorder"], aliases: ["move layer down", "layer down", "reorder layer down"] },
        { id: "layer.rename", label: "Layer: Rename", category: "Layer", keywords: ["layer", "rename", "name"], aliases: ["rename layer", "layer name"] },
        { id: "layer.solo", label: "Layer: Toggle Solo", category: "Layer", keywords: ["layer", "solo", "isolate"], aliases: ["solo layer", "isolate layer", "toggle solo"] },
        { id: "layer.toggleLock", label: "Layer: Toggle Lock", category: "Layer", keywords: ["layer", "lock", "unlock"], aliases: ["lock layer", "unlock layer", "toggle lock"] },
        { id: "layer.opacityUp", label: "Layer: Opacity Up", category: "Layer", keywords: ["layer", "opacity", "alpha", "up"], aliases: ["opacity up", "increase opacity", "alpha up"] },
        { id: "layer.opacityDown", label: "Layer: Opacity Down", category: "Layer", keywords: ["layer", "opacity", "alpha", "down"], aliases: ["opacity down", "decrease opacity", "alpha down"] },
        { id: "layer.opacityReset", label: "Layer: Opacity Reset", category: "Layer", keywords: ["layer", "opacity", "reset"], aliases: ["opacity 100", "reset opacity", "alpha reset"] },
        { id: "layer.mergeDown", label: "Layer: Merge Down", category: "Layer", keywords: ["layer", "merge", "down"], aliases: ["merge down", "merge layer down"] },
        { id: "layer.flattenFrame", label: "Layer: Flatten Frame", category: "Layer", keywords: ["layer", "flatten", "frame"], aliases: ["flatten", "flatten frame", "flatten layers"] },
        { id: "view.blendPreviewToggle", label: "View: Toggle Blend Preview", category: "View", keywords: ["blend", "preview", "opacity"], aliases: ["blend preview", "toggle blend preview"] },
        { id: "system.fullscreen", label: "System: Toggle Full Screen", category: "System", keywords: ["fullscreen", "window"], aliases: ["full screen", "fullscreen", "toggle full"] },
        { id: "system.playback", label: "System: Toggle Playback", category: "System", keywords: ["play", "pause", "preview"], aliases: ["playback", "play pause", "preview animation"] },
        { id: "system.playbackPlay", label: "System: Playback Play", category: "System", keywords: ["play", "transport"], aliases: ["play"] },
        { id: "system.playbackPause", label: "System: Playback Pause", category: "System", keywords: ["pause", "transport"], aliases: ["pause"] },
        { id: "system.playbackStop", label: "System: Playback Stop/Reset", category: "System", keywords: ["stop", "reset", "transport"], aliases: ["stop playback", "reset playback"] },
        { id: "system.playbackLoopToggle", label: "System: Toggle Playback Loop", category: "System", keywords: ["loop", "playback"], aliases: ["toggle loop", "loop"] },
        { id: "system.playbackFpsUp", label: "System: Increase Playback FPS", category: "System", keywords: ["fps", "speed", "increase"], aliases: ["fps up", "increase fps"] },
        { id: "system.playbackFpsDown", label: "System: Decrease Playback FPS", category: "System", keywords: ["fps", "speed", "decrease"], aliases: ["fps down", "decrease fps"] },
        { id: "playback.setRangeFromSelection", label: "Playback: Set Range From Selection", category: "Playback", keywords: ["playback", "range", "selection", "loop"], aliases: ["set playback range", "range from selection", "set range from selection"] },
        { id: "playback.clearRange", label: "Playback: Clear Range", category: "Playback", keywords: ["playback", "range", "clear"], aliases: ["clear playback range", "clear range"] },
        { id: "playback.toggleRangeLoop", label: "Playback: Toggle Range Loop", category: "Playback", keywords: ["playback", "range", "loop"], aliases: ["toggle range loop", "range loop"] },
        { id: "playback.jumpRangeStart", label: "Playback: Jump To Range Start", category: "Playback", keywords: ["playback", "range", "start", "jump"], aliases: ["jump to range start", "range start"] },
        { id: "playback.jumpRangeEnd", label: "Playback: Jump To Range End", category: "Playback", keywords: ["playback", "range", "end", "jump"], aliases: ["jump to range end", "range end"] },
        { id: "export.spriteSheetPng", label: "Export: Sprite Sheet PNG", category: "Export", keywords: ["export", "sprite", "sheet", "png"], aliases: ["export sprite sheet", "sheet png"] },
        { id: "export.animationJson", label: "Export: Animation JSON", category: "Export", keywords: ["export", "animation", "json"], aliases: ["export animation json", "animation json"] },
        { id: "export.package", label: "Export: Export Package", category: "Export", keywords: ["export", "package", "metadata"], aliases: ["export package", "package json"] },
        { id: "export.modeCurrentFrame", label: "Export: Current Frame", category: "Export", keywords: ["export", "current", "frame"], aliases: ["export current frame", "current frame export"] },
        { id: "export.modeAllFrames", label: "Export: All Frames", category: "Export", keywords: ["export", "all", "frames"], aliases: ["export all frames", "all frames export"] },
        { id: "export.modeSelectedRange", label: "Export: Selected Range", category: "Export", keywords: ["export", "selected", "range"], aliases: ["export selected range", "selected range export"] },
        { id: "system.delete", label: "System: Delete/Clear", category: "System", keywords: ["delete", "clear"], aliases: ["clear", "delete"] },
        { id: "system.saveLocal", label: "System: Save Local", category: "System", keywords: ["save", "local"], aliases: ["save"] },
        { id: "system.loadLocal", label: "System: Load Local", category: "System", keywords: ["load", "local"], aliases: ["load"] },
        { id: "system.importJson", label: "System: Import JSON", category: "System", keywords: ["import", "json"], aliases: ["import json", "import"] },
        { id: "system.undo", label: "System: Undo", category: "System", keywords: ["undo", "history"], aliases: ["undo action", "revert"] },
        { id: "system.redo", label: "System: Redo", category: "System", keywords: ["redo", "history"], aliases: ["redo action", "reapply"] },
        { id: "system.commandPalette", label: "System: Open Command Palette", category: "System", keywords: ["command", "search"], aliases: ["command palette", "open command search"] }
      ];
      const list = (typeof palettesList === "object" && palettesList) ? palettesList : null;
      if (list) {
        Object.keys(list).forEach((name) => {
          commands.push({ id: `palette.apply:${name}`, label: `Palette: Apply ${name}`, category: "Palette", keywords: ["palette", "color", name], aliases: [`use ${name}`, `set palette ${name}`] });
        });
      }
      this.macroDefinitions.forEach((macro) => {
        commands.push({
          id: macro.id,
          label: macro.label,
          category: "Macro",
          keywords: (macro.keywords || []).concat(["macro"]),
          aliases: macro.aliases || [],
          actions: macro.actions || []
        });
      });
      return commands;
    }

    createCommandPaletteCommands() {
      const commands = this.commandDefinitions;
      return commands.map((cmd) => ({
        ...cmd,
        shortcut: this.getShortcutHintForAction(cmd.id),
        favorite: this.favoriteActions.indexOf(cmd.id) >= 0,
        action: () => this.dispatchCommandAction(cmd.id)
      }));
    }

    normalizeCommandText(input) {
      const raw = String(input || "").toLowerCase().trim();
      const noPunct = raw.replace(/[^\w\s]/g, " ");
      const collapsed = noPunct.replace(/\s+/g, " ").trim();
      const filler = new Set(["to", "the", "tool"]);
      const tokens = collapsed.split(" ").filter((t) => t && !filler.has(t));
      return tokens.join(" ");
    }

    fuzzyMatchScore(text, query) {
      const t = text.toLowerCase();
      const q = query.toLowerCase();
      if (!q) return 0;
      const prefix = t.indexOf(q) === 0;
      const substringIndex = t.indexOf(q);
      let qi = 0;
      let lastMatch = -1;
      let gaps = 0;
      for (let i = 0; i < t.length && qi < q.length; i += 1) {
        if (t[i] === q[qi]) {
          if (lastMatch >= 0 && i !== lastMatch + 1) gaps += (i - lastMatch - 1);
          lastMatch = i;
          qi += 1;
        }
      }
      const fuzzyMatched = qi === q.length;
      if (!fuzzyMatched && substringIndex < 0) return -1;
      let score = 0;
      if (prefix) score += 1200;
      if (substringIndex >= 0) score += Math.max(0, 600 - substringIndex * 8);
      if (fuzzyMatched) score += Math.max(0, 420 - gaps * 7);
      score += Math.max(0, 120 - (t.length - q.length));
      return score;
    }

    scoreCommandItem(item, normalizedQuery) {
      if (!normalizedQuery) return 0;
      const label = this.normalizeCommandText(item.label || "");
      const aliases = Array.isArray(item.aliases) ? item.aliases.map((a) => this.normalizeCommandText(a)) : [];
      const keywords = Array.isArray(item.keywords) ? item.keywords.map((k) => this.normalizeCommandText(k)) : [];
      const shortcut = this.normalizeCommandText(item.shortcut || "");
      if (label.indexOf(normalizedQuery) === 0) return 2400;
      for (let i = 0; i < aliases.length; i += 1) {
        if (aliases[i] === normalizedQuery) return 2200;
        if (aliases[i].indexOf(normalizedQuery) === 0) return 2000;
      }
      if (label.indexOf(normalizedQuery) >= 0) return 1600 - label.indexOf(normalizedQuery) * 5;
      for (let i = 0; i < aliases.length; i += 1) {
        const pos = aliases[i].indexOf(normalizedQuery);
        if (pos >= 0) return 1450 - pos * 4;
      }
      for (let i = 0; i < keywords.length; i += 1) {
        if (keywords[i].indexOf(normalizedQuery) >= 0) return 1200;
      }
      const hay = `${label} ${aliases.join(" ")} ${keywords.join(" ")} ${shortcut}`;
      return this.fuzzyMatchScore(hay, normalizedQuery);
    }

    getRankedCommandPaletteItems(items, query) {
      const q = this.normalizeCommandText(query);
      const recentIndex = new Map();
      this.recentActions.forEach((id, i) => recentIndex.set(id, i));
      const ranked = items.map((item) => {
        const score = q ? this.scoreCommandItem(item, q) : 0;
        const recency = recentIndex.has(item.id) ? Math.max(0, 500 - recentIndex.get(item.id) * 20) : 0;
        const favoriteBias = this.favoriteActions.indexOf(item.id) >= 0 ? (q ? 280 : 600) : 0;
        const total = (q ? score : 200) + recency + favoriteBias;
        return { ...item, favorite: this.favoriteActions.indexOf(item.id) >= 0, score: total, _match: q ? score >= 0 : true, _recent: recency };
      }).filter((item) => item._match);
      ranked.sort((a, b) => (b.score - a.score) || String(a.label).localeCompare(String(b.label)));
      return ranked;
    }

    openCommandPalette() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeOverflowPanel();
      this.commandPaletteCommands = this.createCommandPaletteCommands();
      this.controlSurface.openCommandPalette(this.commandPaletteCommands);
      this.showMessage("Command palette opened.");
      return true;
    }

    applyNamedPalette(paletteName) {
      return this.executeWithHistory(`Apply Palette: ${paletteName}`, () => {
        if (typeof palettesList !== "object" || !palettesList || !Array.isArray(palettesList[paletteName])) return false;
        const next = palettesList[paletteName]
          .map((entry) => entry && entry.hex)
          .filter((hex) => typeof hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(hex))
          .slice(0, 32);
        if (!next.length) return false;
        this.document.palette = next;
        if (this.document.palette.indexOf(this.document.currentColor) < 0) {
          this.document.currentColor = this.document.palette[0];
        }
        this.currentPalettePreset = paletteName;
        this.showMessage(`Palette applied: ${paletteName}`);
        return true;
      });
    }

    dispatchCommandAction(actionId) {
      if (actionId.indexOf("macro:") === 0) {
        const ok = this.executeMacroCommand(actionId, new Set());
        if (ok) this.trackRecentAction(actionId);
        return ok;
      }
      if (actionId.indexOf("palette.apply:") === 0) {
        const ok = this.applyNamedPalette(actionId.slice("palette.apply:".length));
        if (ok) this.trackRecentAction(actionId);
        return ok;
      }
      const ok = this.dispatchKeybinding(actionId);
      if (ok) this.trackRecentAction(actionId);
      return ok;
    }

    executeMacroCommand(macroId, activeSet) {
      const macro = this.macroDefinitions.find((m) => m.id === macroId);
      if (!macro) {
        this.showMessage("Macro missing.");
        return false;
      }
      if (activeSet.has(macroId)) {
        this.showMessage("Macro loop blocked.");
        return false;
      }
      const macroBefore = this.captureHistoryState();
      activeSet.add(macroId);
      this.historySuppressedDepth += 1;
      let successCount = 0;
      for (let i = 0; i < macro.actions.length; i += 1) {
        const actionId = macro.actions[i];
        let ok = false;
        if (typeof actionId !== "string" || !actionId) {
          this.showMessage(`Macro step invalid (${i + 1}).`);
          break;
        }
        if (actionId.indexOf("macro:") === 0) {
          ok = this.executeMacroCommand(actionId, activeSet);
        } else if (actionId.indexOf("palette.apply:") === 0) {
          ok = this.applyNamedPalette(actionId.slice("palette.apply:".length));
        } else {
          ok = this.dispatchKeybinding(actionId);
        }
        if (!ok) {
          this.showMessage(`Macro stopped at step ${i + 1}.`);
          break;
        }
        successCount += 1;
      }
      this.historySuppressedDepth = Math.max(0, this.historySuppressedDepth - 1);
      activeSet.delete(macroId);
      const macroAfter = this.captureHistoryState();
      if (this.historySignature(macroBefore) !== this.historySignature(macroAfter)) {
        this.pushHistoryEntry({ label: `Macro: ${macro.label}`, before: macroBefore, after: macroAfter });
      }
      if (successCount === macro.actions.length) {
        this.showMessage(`Macro ran: ${macro.label}`);
        return true;
      }
      return false;
    }

    isTypingTarget(target) {
      if (!target) return false;
      const tag = (target.tagName || "").toLowerCase();
      if (target.isContentEditable) return true;
      return tag === "input" || tag === "textarea" || tag === "select";
    }

    getKeyGesture(e) {
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push((e.key || "").toLowerCase());
      return parts.join("+");
    }

    dispatchKeybinding(action) {
      if (action === "system.commandPalette") {
        this.openCommandPalette();
        return true;
      }
      if (action === "system.saveLocal") { this.saveLocal(); return true; }
      if (action === "system.loadLocal") { this.loadLocal(); return true; }
      if (action === "system.importJson") { this.openImport(); return true; }
      if (action === "system.undo") return this.undoHistory();
      if (action === "system.redo") return this.redoHistory();
      if (action === "system.escape") {
        if (this.controlSurface.commandPaletteOpen) {
          this.controlSurface.closeCommandPalette();
          this.showMessage("Command palette closed.");
          return true;
        }
        if (this.selectionMoveSession) {
          this.restoreHistoryState(this.selectionMoveSession.before);
          this.selectionMoveSession = null;
          this.showMessage("Selection move canceled.");
          return true;
        }
        if (this.controlSurface.overflowPanelOpen) {
          this.controlSurface.closeOverflowPanel();
          this.showMessage("Menu closed.");
          return true;
        }
        if (this.selectionStart) {
          this.selectionStart = null;
          this.showMessage("Transient selection canceled.");
          return true;
        }
        return false;
      }
      if (action === "tool.brush") { this.setTool("brush"); return true; }
      if (action === "tool.erase") { this.setTool("erase"); return true; }
      if (action === "tool.fill") { this.setTool("fill"); return true; }
      if (action === "tool.line") { this.setTool("line"); return true; }
      if (action === "tool.rect") { this.setTool("rect"); return true; }
      if (action === "tool.fillrect") { this.setTool("fillrect"); return true; }
      if (action === "tool.eyedropper") { this.setTool("eyedropper"); return true; }
      if (action === "tool.select") { this.setTool("select"); return true; }
      if (action === "brush.sizeUp") { this.adjustBrushSize(1); return true; }
      if (action === "brush.sizeDown") { this.adjustBrushSize(-1); return true; }
      if (action === "brush.toggleShape") { this.toggleBrushShape(); return true; }
      if (action === "palette.prevColor") { this.prevColor(); return true; }
      if (action === "palette.nextColor") { this.nextColor(); return true; }
      if (action === "palette.replaceColor") return this.replacePaletteColor();
      if (action === "palette.scopeActiveLayer") return this.setPaletteReplaceScope("active_layer");
      if (action === "palette.scopeCurrentFrame") return this.setPaletteReplaceScope("current_frame");
      if (action === "palette.scopeSelectedRange") return this.setPaletteReplaceScope("selected_range");
      if (action.indexOf("brush.size_") === 0) {
        const next = Number(action.slice("brush.size_".length));
        if (!Number.isFinite(next)) return false;
        this.setBrushSize(next);
        return true;
      }
      if (action === "view.zoomIn") { this.adjustZoom(0.25); return true; }
      if (action === "view.zoomOut") { this.adjustZoom(-0.25); return true; }
      if (action === "view.zoomReset") { this.resetZoom(); return true; }
      if (action === "view.pixelToggle") { this.togglePixelPerfect(); return true; }
      if (action === "view.onionPrevToggle") { this.toggleOnionPrevious(); return true; }
      if (action === "view.onionNextToggle") { this.toggleOnionNext(); return true; }
      if (action === "frame.prev") { this.selectFrame(this.document.activeFrameIndex - 1); return true; }
      if (action === "frame.next") { this.selectFrame(this.document.activeFrameIndex + 1); return true; }
      if (action === "frame.duplicate") { this.duplicateFrame(); return true; }
      if (action === "frame.duplicateRange") { this.duplicateSelectedFrameRange(); return true; }
      if (action === "frame.deleteRange") { this.deleteSelectedFrameRange(); return true; }
      if (action === "frame.shiftRangeLeft") { this.shiftSelectedFrameRange(-1); return true; }
      if (action === "frame.shiftRangeRight") { this.shiftSelectedFrameRange(1); return true; }
      if (action === "frame.clearRangeSelection") { this.clearFrameRangeSelection(true); return true; }
      if (action === "selection.copy") {
        if (this.document.selection) { this.handleSelectionAction("sel-copy"); return true; }
        return false;
      }
      if (action === "selection.cut") {
        if (this.document.selection) { this.handleSelectionAction("sel-cut"); return true; }
        return false;
      }
      if (action === "selection.paste") {
        if (this.document.selectionClipboard) { this.handleSelectionAction("sel-paste"); return true; }
        return false;
      }
      if (action === "selection.nudge_up") return this.nudgeSelection(0, -1, "Up");
      if (action === "selection.nudge_down") return this.nudgeSelection(0, 1, "Down");
      if (action === "selection.nudge_left") return this.nudgeSelection(-1, 0, "Left");
      if (action === "selection.nudge_right") return this.nudgeSelection(1, 0, "Right");
      if (action === "selection.nudge_up_big") return this.nudgeSelection(0, -8, "Up x8");
      if (action === "selection.nudge_down_big") return this.nudgeSelection(0, 8, "Down x8");
      if (action === "selection.nudge_left_big") return this.nudgeSelection(-8, 0, "Left x8");
      if (action === "selection.nudge_right_big") return this.nudgeSelection(8, 0, "Right x8");
      if (action === "layer.add") { this.addLayer(); return true; }
      if (action === "layer.duplicate") { this.duplicateLayer(); return true; }
      if (action === "layer.delete") { this.deleteLayer(); return true; }
      if (action === "layer.toggleVisibility") { this.toggleLayerVisibility(); return true; }
      if (action === "layer.next") { this.selectNextLayer(); return true; }
      if (action === "layer.prev") { this.selectPrevLayer(); return true; }
      if (action === "layer.moveUp") { this.moveLayerUp(); return true; }
      if (action === "layer.moveDown") { this.moveLayerDown(); return true; }
      if (action === "layer.rename") { this.openLayerRenamePrompt(); return true; }
      if (action === "layer.solo") { this.toggleLayerSolo(); return true; }
      if (action === "layer.toggleLock") { this.toggleLayerLock(); return true; }
      if (action === "layer.opacityUp") { this.adjustLayerOpacity(0.1); return true; }
      if (action === "layer.opacityDown") { this.adjustLayerOpacity(-0.1); return true; }
      if (action === "layer.opacityReset") { this.resetLayerOpacity(); return true; }
      if (action === "layer.mergeDown") { this.mergeLayerDown(); return true; }
      if (action === "layer.flattenFrame") { this.requestFlattenFrame(); return true; }
      if (action === "view.blendPreviewToggle") { this.toggleBlendPreview(); return true; }
      if (action === "system.fullscreen") { this.toggleFullscreen(); return true; }
      if (action === "system.playback") { this.togglePlayback(); return true; }
      if (action === "system.playbackPlay") { this.togglePlayback(true); return true; }
      if (action === "system.playbackPause") { this.togglePlayback(false); return true; }
      if (action === "system.playbackStop") { this.stopPlayback(); return true; }
      if (action === "system.playbackLoopToggle") { this.togglePlaybackLoop(); return true; }
      if (action === "system.playbackFpsUp") { this.adjustPlaybackFps(1); return true; }
      if (action === "system.playbackFpsDown") { this.adjustPlaybackFps(-1); return true; }
      if (action === "playback.setRangeFromSelection") return this.setPlaybackRangeFromSelection();
      if (action === "playback.clearRange") {
        const hadRange = this.getPlaybackRange().enabled;
        if (!hadRange) {
          this.showMessage("Playback range already clear.");
          return false;
        }
        this.clearPlaybackRange(true);
        this.renderAll();
        return true;
      }
      if (action === "playback.toggleRangeLoop") {
        const range = this.getPlaybackRange();
        if (range.enabled) {
          this.clearPlaybackRange(true);
        } else {
          if (!this.setPlaybackRangeFromSelection()) return false;
        }
        this.renderAll();
        return true;
      }
      if (action === "playback.jumpRangeStart") return this.jumpToPlaybackRangeEdge(false);
      if (action === "playback.jumpRangeEnd") return this.jumpToPlaybackRangeEdge(true);
      if (action === "export.spriteSheetPng") return this.downloadSpriteSheetPng();
      if (action === "export.animationJson") return this.exportAnimationJson();
      if (action === "export.package") return this.exportPackageJson();
      if (action === "export.modeCurrentFrame") return this.setExportMode("current_frame");
      if (action === "export.modeAllFrames") return this.setExportMode("all_frames");
      if (action === "export.modeSelectedRange") return this.setExportMode("selected_range");
      if (action === "system.delete") {
        if (this.document.selection) { this.handleSelectionAction("sel-cut"); return true; }
        if (!this.canEditActiveLayer(true)) return false;
        return this.executeWithHistory("Clear Frame", () => {
          this.document.clearFrame();
          this.showMessage("Frame cleared.");
          return true;
        });
      }
      return false;
    }

    adjustZoom(delta) {
      this.zoom = Math.max(0.5, Math.min(8, Number((this.zoom + delta).toFixed(2))));
      this.gridRect = this.computeGridRect();
      this.showMessage("Zoom: " + this.zoom.toFixed(2) + "x");
      this.renderAll();
    }

    resetZoom() {
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.gridRect = this.computeGridRect();
      this.showMessage("Zoom/pan reset.");
      this.renderAll();
    }

    togglePixelPerfect() {
      this.viewport.togglePixelPerfect();
      this.resize();
      this.showMessage(this.viewport.pixelPerfect ? "Pixel perfect on." : "Pixel perfect off.");
      this.renderAll();
    }

    toggleOnionPrevious() {
      this.onionSkin.prev = !this.onionSkin.prev;
      this.showMessage(this.onionSkin.prev ? "Onion previous on." : "Onion previous off.");
      this.renderAll();
    }

    toggleOnionNext() {
      this.onionSkin.next = !this.onionSkin.next;
      this.showMessage(this.onionSkin.next ? "Onion next on." : "Onion next off.");
      this.renderAll();
    }

    toggleDensityMode() {
      const order = ["auto", "standard", "pro"];
      const i = order.indexOf(this.uiDensityMode);
      this.uiDensityMode = order[(i + 1) % order.length];
      if (this.uiDensityMode === "auto") {
        this.showMessage("Mode: Auto.");
      } else {
        this.showMessage(this.uiDensityMode === "pro" ? "Mode: Pro." : "Mode: Standard.");
      }
      this.renderAll();
    }

    setSelectionFromTwoCells(a,b) {
      const l = Math.min(a.x,b.x), t = Math.min(a.y,b.y), r = Math.max(a.x,b.x), bt = Math.max(a.y,b.y);
      this.document.setSelection({ x: l, y: t, width: r-l+1, height: bt-t+1 });
      this.selectionPasteOrigin = { x: l, y: t };
    }

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
    }
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
    }
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
    }
    getShapeCells(start, end, tool) {
      if (!start || !end) return [];
      if (tool === "line") return this.getLineCells(start, end);
      if (tool === "rect") return this.getRectCells(start, end, false);
      if (tool === "fillrect") return this.getRectCells(start, end, true);
      return [];
    }
    applyBrushStamp(x, y, erase) {
      const value = erase ? null : this.document.currentColor;
      const cells = this.getBrushCellsAt(x, y);
      cells.forEach((cell) => this.document.setPixel(cell.x, cell.y, value, this.mirror));
    }
    applyStrokeSegment(from, to, erase) {
      const path = this.getLineCells(from, to);
      path.forEach((cell) => this.applyBrushStamp(cell.x, cell.y, erase));
    }
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
    }
    applyGridTool(x,y,erase) {
      if (this.activeTool === "eyedropper") {
        const v = this.document.getPixel(x,y);
        if (v) this.setCurrentColor(v);
        this.showMessage("Picked color.");
        return;
      }
      if (!this.canEditActiveLayer(true)) return;
      if (this.activeTool === "fill") {
        this.document.floodFill(x,y,erase ? null : this.document.currentColor,this.mirror);
        return;
      }
      this.applyBrushStamp(x,y,erase || this.activeTool === "erase");
    }

    setTool(t) {
      this.activeTool = t;
      this.shapePreview = null;
      this.showMessage("Tool: " + t);
    }
    setBrushSize(size) {
      this.brush.size = Math.max(1, Math.min(5, Math.floor(size || 1)));
      this.showMessage(`Brush size: ${this.brush.size}`);
      this.renderAll();
    }
    adjustBrushSize(delta) { this.setBrushSize(this.brush.size + delta); }
    toggleBrushShape() {
      this.brush.shape = this.brush.shape === "square" ? "circle" : "square";
      this.showMessage(`Brush shape: ${this.brush.shape}`);
      this.renderAll();
    }
    setCurrentColor(c) { this.document.currentColor = c; this.showMessage("Color selected."); }
    prevColor() {
      const p = this.document.palette, i = p.indexOf(this.document.currentColor), n = i >= 0 ? (i - 1 + p.length) % p.length : 0;
      this.document.currentColor = p[n];
      this.showMessage("Color cycled.");
      this.renderAll();
    }
    nextColor() {
      const p = this.document.palette, i = p.indexOf(this.document.currentColor), n = i >= 0 ? (i+1) % p.length : 0;
      this.document.currentColor = p[n];
      this.showMessage("Color cycled.");
      this.renderAll();
    }
    getPaletteScopeLabel() {
      if (this.paletteWorkflow.scope === "active_layer") return "Scope: Layer";
      if (this.paletteWorkflow.scope === "current_frame") return "Scope: Frame";
      return "Scope: Range";
    }
    cyclePaletteReplaceScope() {
      const order = ["active_layer", "current_frame", "selected_range"];
      const current = order.indexOf(this.paletteWorkflow.scope);
      this.paletteWorkflow.scope = order[(current + 1) % order.length];
      this.showMessage(this.getPaletteScopeLabel());
      this.renderAll();
    }
    setPaletteReplaceScope(scope) {
      this.paletteWorkflow.scope = scope;
      this.showMessage(this.getPaletteScopeLabel());
      this.renderAll();
      return true;
    }
    setPaletteReplaceSource() {
      this.paletteWorkflow.source = this.document.currentColor;
      this.showMessage("Replace source set.");
      this.renderAll();
    }
    setPaletteReplaceTarget() {
      this.paletteWorkflow.target = this.document.currentColor;
      this.showMessage("Replace target set.");
      this.renderAll();
    }
    openPaletteWorkflowMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "palette-menu-src", text: "Set Src From Current", action: () => this.setPaletteReplaceSource() },
        { id: "palette-menu-dst", text: "Set Dst From Current", action: () => this.setPaletteReplaceTarget() },
        { id: "palette-menu-scope-layer", text: "Scope Active Layer", action: () => this.setPaletteReplaceScope("active_layer") },
        { id: "palette-menu-scope-frame", text: "Scope Current Frame", action: () => this.setPaletteReplaceScope("current_frame") },
        { id: "palette-menu-scope-range", text: "Scope Selected Range", action: () => this.setPaletteReplaceScope("selected_range") },
        { id: "palette-menu-replace", text: "Replace Color", action: () => this.replacePaletteColor() }
      ];
      if (typeof palettesList === "object" && palettesList) {
        Object.keys(palettesList).slice(0, 12).forEach((name) => {
          items.push({ id: `palette-menu-preset-${name}`, text: `Preset: ${name}`, action: () => this.applyNamedPalette(name) });
        });
      }
      this.controlSurface.toggleTopMenu("palette-menu", items);
      this.renderAll();
      return true;
    }
    getExportModeLabel() {
      if (this.exportMode === "current_frame") return "Current Frame";
      if (this.exportMode === "selected_range") return "Selected Range";
      return "All Frames";
    }
    setExportMode(mode) {
      this.exportMode = mode;
      this.showMessage(`Export mode: ${this.getExportModeLabel()}`);
      this.renderAll();
      return true;
    }
    getExportFrameIndices(mode = this.exportMode) {
      if (mode === "current_frame") return [this.document.activeFrameIndex];
      if (mode === "selected_range") {
        const range = this.getFrameRangeSelection();
        if (!range.explicit) return null;
        const indices = [];
        for (let i = range.start; i <= range.end; i += 1) indices.push(i);
        return indices;
      }
      return this.document.frames.map((_f, i) => i);
    }
    buildExportContext(mode = this.exportMode) {
      const indices = this.getExportFrameIndices(mode);
      if (!indices || !indices.length) return null;
      const range = this.getPlaybackRange();
      const frames = indices.map((index, order) => {
        const frame = this.document.ensureFrameLayers(this.document.frames[index]);
        return {
          exportIndex: order,
          frameIndex: index,
          id: frame.id,
          name: frame.name || `Frame ${index + 1}`,
          pixels: this.document.getCompositedPixels(frame, { respectSolo: false, blendMode: "normal" })
        };
      });
      return {
        mode,
        modeLabel: this.getExportModeLabel(),
        indices,
        frames,
        frameWidth: this.document.cols,
        frameHeight: this.document.rows,
        frameCount: frames.length,
        fps: this.playback.fps,
        loop: this.playback.loop,
        playbackRange: range.enabled ? { startFrame: range.startFrame, endFrame: range.endFrame } : null,
        palettePreset: this.currentPalettePreset || "Custom",
        palette: (this.document.palette || []).slice(),
        layerExport: "composited_visible_only",
        soloIgnored: true
      };
    }
    buildAnimationExportData(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) return null;
      return {
        version: 1,
        kind: "sprite-animation-export",
        exportMode: context.mode,
        frameWidth: context.frameWidth,
        frameHeight: context.frameHeight,
        frameCount: context.frameCount,
        fps: context.fps,
        loop: context.loop,
        playbackRange: context.playbackRange,
        palettePreset: context.palettePreset,
        palette: context.palette,
        layerExport: context.layerExport,
        soloIgnored: context.soloIgnored,
        frames: context.frames.map((frame) => ({
          exportIndex: frame.exportIndex,
          frameIndex: frame.frameIndex,
          id: frame.id,
          name: frame.name
        }))
      };
    }
    buildExportPackageData(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) return null;
      return {
        version: 1,
        kind: "sprite-export-package",
        exportMode: context.mode,
        frameWidth: context.frameWidth,
        frameHeight: context.frameHeight,
        frameCount: context.frameCount,
        frameOrder: context.frames.map((frame) => frame.frameIndex),
        frameNames: context.frames.map((frame) => frame.name),
        fps: context.fps,
        loop: context.loop,
        playbackRange: context.playbackRange,
        palettePreset: context.palettePreset,
        palette: context.palette,
        layerExport: context.layerExport,
        soloIgnored: context.soloIgnored,
        outputs: {
          spriteSheetPng: `sprite-sheet-${context.mode}.png`,
          animationJson: `animation-${context.mode}.json`,
          packageJson: `export-package-${context.mode}.json`
        }
      };
    }
    downloadSpriteSheetPng(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Export unavailable.");
        return false;
      }
      const plc = this.document.computeSheetPlacementForCount(context.frameCount);
      const temp = document.createElement("canvas");
      temp.width = plc.width;
      temp.height = plc.height;
      const ctx = temp.getContext("2d");
      if (this.document.sheet.transparent) this.drawCheckerboard(ctx, 0, 0, plc.width, plc.height, 4);
      else {
        ctx.fillStyle = this.document.sheet.backgroundColor;
        ctx.fillRect(0, 0, plc.width, plc.height);
      }
      context.frames.forEach((frame, i) => {
        const entry = plc.entries[i];
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            const v = frame.pixels[y][x];
            if (!v) continue;
            ctx.fillStyle = v;
            ctx.fillRect(entry.x + x, entry.y + y, 1, 1);
          }
        }
      });
      this.downloadLink.download = `sprite-sheet-${mode}.png`;
      this.downloadLink.href = temp.toDataURL("image/png");
      this.downloadLink.click();
      this.showMessage(`Sprite sheet exported (${context.modeLabel}).`);
      return true;
    }
    exportAnimationJson(mode = this.exportMode) {
      const data = this.buildAnimationExportData(mode);
      if (!data) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Animation export unavailable.");
        return false;
      }
      this.downloadBlob(`animation-${mode}.json`, JSON.stringify(data, null, 2), "application/json");
      this.showMessage(`Animation JSON exported (${data.frameCount} frames).`);
      return true;
    }
    exportPackageJson(mode = this.exportMode) {
      const data = this.buildExportPackageData(mode);
      if (!data) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Export package unavailable.");
        return false;
      }
      this.downloadBlob(`export-package-${mode}.json`, JSON.stringify(data, null, 2), "application/json");
      this.showMessage(`Export package saved (${data.exportMode}).`);
      return true;
    }
    openExportMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "export-menu-mode-current", text: `Mode: Current Frame${this.exportMode === "current_frame" ? " *" : ""}`, action: () => this.setExportMode("current_frame") },
        { id: "export-menu-mode-all", text: `Mode: All Frames${this.exportMode === "all_frames" ? " *" : ""}`, action: () => this.setExportMode("all_frames") },
        { id: "export-menu-mode-range", text: `Mode: Selected Range${this.exportMode === "selected_range" ? " *" : ""}`, action: () => this.setExportMode("selected_range") },
        { id: "export-menu-editor-json", text: "Editor JSON", action: () => this.exportJson(true) },
        { id: "export-menu-sheet", text: "Sprite Sheet PNG", action: () => this.downloadSpriteSheetPng() },
        { id: "export-menu-meta", text: "Sheet Meta", action: () => this.exportSheetMetadata() },
        { id: "export-menu-animation", text: "Animation JSON", action: () => this.exportAnimationJson() },
        { id: "export-menu-package", text: "Export Package", action: () => this.exportPackageJson() }
      ];
      this.controlSurface.toggleTopMenu("file", items);
      this.renderAll();
      return true;
    }
    replacePaletteColor() {
      const source = this.paletteWorkflow.source;
      const target = this.paletteWorkflow.target;
      if (!source || !target) {
        this.showMessage("Set source and target first.");
        return false;
      }
      if (source === target) {
        this.showMessage("Source and target are the same.");
        return false;
      }
      let replacementCount = 0;
      const applyLayer = (layer) => {
        if (!layer || layer.locked === true) return;
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            if (layer.pixels[y][x] === source) {
              layer.pixels[y][x] = target;
              replacementCount += 1;
            }
          }
        }
      };
      const scope = this.paletteWorkflow.scope;
      const run = () => {
        if (scope === "active_layer") {
          if (this.document.activeLayer.locked === true) return false;
          applyLayer(this.document.activeLayer);
        } else if (scope === "current_frame") {
          const frame = this.document.ensureFrameLayers(this.document.activeFrame);
          frame.layers.forEach((layer) => applyLayer(layer));
        } else if (scope === "selected_range") {
          const range = this.getFrameRangeSelection();
          if (!range.explicit) return false;
          for (let i = range.start; i <= range.end; i += 1) {
            const frame = this.document.ensureFrameLayers(this.document.frames[i]);
            frame.layers.forEach((layer) => applyLayer(layer));
          }
        }
        return replacementCount > 0;
      };
      const ok = this.executeWithHistory("Palette Replace Color", run);
      if (!ok) {
        this.showMessage(scope === "selected_range" && !this.getFrameRangeSelection().explicit ? "Select a frame range first." : "No matching pixels to replace.");
        this.renderAll();
        return false;
      }
      this.showMessage(`Replaced ${replacementCount} pixels.`);
      this.renderAll();
      return true;
    }
    toggleMirror() { this.mirror = !this.mirror; this.showMessage(this.mirror ? "Mirror on." : "Mirror off."); this.renderAll(); }

    handleSelectionAction(id) {
      const isMutating = id === "sel-cut" || id === "sel-paste" || id === "sel-fliph" || id === "sel-flipv";
      if (isMutating && !this.canEditActiveLayer(true)) { this.renderAll(); return; }
      let ok = false;
      const run = () => {
        if (id === "sel-copy") ok = this.document.copySelection();
        else if (id === "sel-cut") ok = this.document.cutSelection();
        else if (id === "sel-paste") ok = this.document.pasteSelection(this.selectionPasteOrigin.x,this.selectionPasteOrigin.y);
        else if (id === "sel-fliph") ok = this.document.flipSelection(true);
        else if (id === "sel-flipv") ok = this.document.flipSelection(false);
        else if (id === "sel-clear") { this.document.clearSelection(); ok = true; }
        return ok;
      };
      if (isMutating) this.executeWithHistory("Selection Edit", run);
      else run();
      this.showMessage(ok ? "Selection updated." : "No active selection.");
      this.renderAll();
    }

    addFrame() { this.executeWithHistory("Frame Add", () => { this.document.addFrame(); this.showMessage("Frame added."); return true; }); this.renderAll(); }
    duplicateFrame() { this.executeWithHistory("Frame Duplicate", () => { this.document.duplicateFrame(); this.showMessage("Frame duplicated."); return true; }); this.renderAll(); }
    deleteFrame() { this.executeWithHistory("Frame Delete", () => { const ok = this.document.deleteFrame(); this.showMessage(ok ? "Frame deleted." : "Cannot delete last frame."); return ok; }); this.renderAll(); }
    reorderFrame(from,to) { this.executeWithHistory("Frame Reorder", () => { const ok = this.document.moveFrame(from,to); this.showMessage(ok ? "Frame reordered." : "Frame reorder failed."); return ok; }); this.renderAll(); }
    duplicateSelectedFrameRange() {
      this.executeWithHistory("Frame Range Duplicate", () => {
        const range = this.getFrameRangeSelection();
        const result = this.document.duplicateFrameRange(range.start, range.end);
        if (!result) {
          this.showMessage("Duplicate range unavailable.");
          return false;
        }
        this.setFrameRangeSelection(result.start, result.end, result.start);
        this.document.activeFrameIndex = result.start;
        this.playback.previewFrameIndex = this.document.activeFrameIndex;
        this.sanitizePlaybackRange();
        this.showMessage(`Duplicated frames ${result.start + 1}-${result.end + 1}.`);
        return true;
      });
      this.renderAll();
    }
    deleteSelectedFrameRange() {
      this.executeWithHistory("Frame Range Delete", () => {
        const range = this.getFrameRangeSelection();
        const ok = this.document.deleteFrameRange(range.start, range.end);
        if (!ok) {
          this.showMessage("Cannot delete selected frame range.");
          return false;
        }
        this.setFrameRangeSelection(this.document.activeFrameIndex, this.document.activeFrameIndex, this.document.activeFrameIndex);
        this.playback.previewFrameIndex = this.document.activeFrameIndex;
        this.sanitizePlaybackRange();
        this.showMessage(`Deleted frames ${range.start + 1}-${range.end + 1}.`);
        return true;
      });
      this.renderAll();
    }
    shiftSelectedFrameRange(direction) {
      this.executeWithHistory(direction < 0 ? "Frame Range Shift Left" : "Frame Range Shift Right", () => {
        const range = this.getFrameRangeSelection();
        const result = this.document.shiftFrameRange(range.start, range.end, direction);
        if (!result) {
          this.showMessage(direction < 0 ? "Range already at start." : "Range already at end.");
          return false;
        }
        this.setFrameRangeSelection(result.start, result.end, result.start);
        this.playback.previewFrameIndex = this.document.activeFrameIndex;
        this.sanitizePlaybackRange();
        this.showMessage(`Shifted frames ${result.start + 1}-${result.end + 1}.`);
        return true;
      });
      this.renderAll();
    }
    addLayer() { this.executeWithHistory("Layer Add", () => { const ok = this.document.addLayer(); this.showMessage(ok ? "Layer added." : "Layer add failed."); return ok; }); this.renderAll(); }
    duplicateLayer() { this.executeWithHistory("Layer Duplicate", () => { const ok = this.document.duplicateLayer(); this.showMessage(ok ? "Layer duplicated." : "Layer duplicate failed."); return ok; }); this.renderAll(); }
    deleteLayer() { this.executeWithHistory("Layer Delete", () => { const ok = this.document.deleteLayer(); this.showMessage(ok ? "Layer deleted." : "Cannot delete last layer."); return ok; }); this.renderAll(); }
    toggleLayerVisibility() {
      this.executeWithHistory("Layer Visibility", () => {
        const ok = this.document.toggleLayerVisibility();
        this.showMessage(ok ? (this.document.activeLayer.visible === false ? "Layer hidden." : "Layer visible.") : "Layer visibility failed.");
        return ok;
      });
      this.renderAll();
    }
    toggleLayerLock() { this.executeWithHistory("Layer Lock", () => { const ok = this.document.toggleLayerLock(); this.showMessage(ok ? (this.document.activeLayer.locked ? "Layer locked." : "Layer unlocked.") : "Layer lock failed."); return ok; }); this.renderAll(); }
    toggleLayerSolo() {
      this.executeWithHistory("Layer Solo", () => {
        const af = this.document.ensureFrameLayers(this.document.activeFrame);
        const index = af.activeLayerIndex;
        const activeSolo = this.document.soloState && this.document.soloState.frameId === af.id && this.document.soloState.layerIndex === index;
        this.document.soloState = activeSolo ? null : { frameId: af.id, layerIndex: index };
        this.showMessage(activeSolo ? "Layer solo cleared." : `Layer solo: ${af.layers[index].name}`);
        return true;
      });
      this.renderAll();
    }
    adjustLayerOpacity(delta) {
      this.executeWithHistory("Layer Opacity", () => {
        const ok = this.document.adjustActiveLayerOpacity(delta);
        if (ok) this.showMessage(`Layer opacity: ${Math.round(this.document.activeLayer.opacity * 100)}%`);
        else this.showMessage("Layer opacity unchanged.");
        return ok;
      });
      this.renderAll();
    }
    resetLayerOpacity() {
      this.executeWithHistory("Layer Opacity Reset", () => {
        const ok = this.document.resetActiveLayerOpacity();
        if (ok) this.showMessage("Layer opacity: 100%");
        else this.showMessage("Layer opacity already 100%.");
        return ok;
      });
      this.renderAll();
    }
    toggleBlendPreview() {
      const mode = this.document.toggleBlendPreviewMode();
      this.showMessage(mode === "boost" ? "Blend preview: Boost" : "Blend preview: Normal");
      this.renderAll();
    }
    mergeLayerDown() {
      this.executeWithHistory("Layer Merge Down", () => {
        const ok = this.document.mergeLayerDown();
        this.showMessage(ok ? "Merged layer down." : "Merge down unavailable.");
        return ok;
      });
      this.renderAll();
    }
    requestFlattenFrame() {
      this.requestReplaceGuard("Flatten Frame", "Flatten all layers in current frame into one layer?", () => {
        this.executeWithHistory("Layer Flatten Frame", () => {
          const ok = this.document.flattenActiveFrame();
          this.showMessage(ok ? "Frame flattened." : "Flatten produced no changes.");
          return ok;
        });
        this.renderAll();
      }, true);
      this.renderAll();
    }
    isLayerSoloActiveFor(frame, layerIndex) {
      const solo = this.document.soloState;
      return !!(solo && frame && solo.frameId === frame.id && solo.layerIndex === layerIndex);
    }
    isLayerVisibleEffective(frame, layerIndex) {
      const f = this.document.ensureFrameLayers(frame || this.document.activeFrame);
      const layer = f.layers[layerIndex];
      if (!layer) return false;
      const solo = this.document.soloState;
      if (solo && solo.frameId === f.id) return solo.layerIndex === layerIndex;
      return layer.visible !== false;
    }
    canEditActiveLayer(showFeedback = true) {
      const l = this.document.activeLayer;
      if (l && l.locked) {
        if (showFeedback) this.showMessage(`Layer locked: ${l.name}`);
        return false;
      }
      return true;
    }
    sanitizeSoloState() {
      const solo = this.document.soloState;
      if (!solo) return;
      const frame = this.document.frames.find((f) => f.id === solo.frameId);
      if (!frame) {
        this.document.soloState = null;
        return;
      }
      const fr = this.document.ensureFrameLayers(frame);
      if (solo.layerIndex < 0 || solo.layerIndex >= fr.layers.length) {
        this.document.soloState = null;
      }
    }
    sanitizeFrameRangeSelection() {
      if (!this.frameRangeSelection) return;
      const max = this.document.frames.length - 1;
      if (max < 0) {
        this.frameRangeSelection = null;
        return;
      }
      const start = Math.max(0, Math.min(this.frameRangeSelection.start, max));
      const end = Math.max(0, Math.min(this.frameRangeSelection.end, max));
      this.frameRangeSelection = {
        start: Math.min(start, end),
        end: Math.max(start, end),
        anchor: Math.max(0, Math.min(this.frameRangeSelection.anchor, max))
      };
    }
    sanitizePlaybackRange() {
      const max = Math.max(0, this.document.frames.length - 1);
      this.playbackRange.startFrame = Math.max(0, Math.min(this.playbackRange.startFrame, max));
      this.playbackRange.endFrame = Math.max(0, Math.min(this.playbackRange.endFrame, max));
      if (this.playbackRange.endFrame < this.playbackRange.startFrame) {
        const next = this.playbackRange.startFrame;
        this.playbackRange.startFrame = this.playbackRange.endFrame;
        this.playbackRange.endFrame = next;
      }
      if (this.document.frames.length <= 1) this.playbackRange.enabled = false;
      if (this.timelineHoverIndex !== null && (this.timelineHoverIndex < 0 || this.timelineHoverIndex > max)) {
        this.timelineHoverIndex = null;
      }
    }
    syncCurrentPalettePreset() {
      if (typeof palettesList !== "object" || !palettesList) {
        this.currentPalettePreset = "Custom";
        return;
      }
      const paletteSig = JSON.stringify(this.document.palette || []);
      const names = Object.keys(palettesList);
      for (let i = 0; i < names.length; i += 1) {
        const entries = palettesList[names[i]];
        if (!Array.isArray(entries)) continue;
        const hexes = entries.map((entry) => entry && entry.hex).filter((hex) => typeof hex === "string").slice(0, 32);
        if (JSON.stringify(hexes) === paletteSig) {
          this.currentPalettePreset = names[i];
          return;
        }
      }
      this.currentPalettePreset = "Custom";
    }
    moveLayerUp() {
      this.executeWithHistory("Layer Reorder Up", () => {
        const af = this.document.ensureFrameLayers(this.document.activeFrame);
        const from = af.activeLayerIndex;
        const ok = this.document.moveLayer(from, from - 1);
        this.showMessage(ok ? "Layer moved up." : "Layer already at top.");
        return ok;
      });
      this.renderAll();
    }
    moveLayerDown() {
      this.executeWithHistory("Layer Reorder Down", () => {
        const af = this.document.ensureFrameLayers(this.document.activeFrame);
        const from = af.activeLayerIndex;
        const ok = this.document.moveLayer(from, from + 1);
        this.showMessage(ok ? "Layer moved down." : "Layer already at bottom.");
        return ok;
      });
      this.renderAll();
    }
    selectLayer(i) { this.document.selectLayer(i); this.showMessage(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`); this.renderAll(); }
    selectNextLayer() { this.document.selectNextLayer(); this.showMessage(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`); this.renderAll(); }
    selectPrevLayer() { this.document.selectPrevLayer(); this.showMessage(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`); this.renderAll(); }
    selectFrame(i) {
      this.document.activeFrameIndex = Math.max(0, Math.min(i, this.document.frames.length - 1));
      this.document.ensureFrameLayers(this.document.activeFrame);
      this.playback.previewFrameIndex = this.document.activeFrameIndex;
      this.document.clearSelection();
      this.renderAll();
    }
    copyFrame() { this.document.copyFrame(); this.showMessage("Frame copied."); this.renderAll(); }
    pasteFrame() { this.executeWithHistory("Frame Paste", () => { const ok = this.document.pasteFrame(); this.showMessage(ok ? "Frame pasted." : "No copied frame."); return ok; }); this.renderAll(); }

    cycleSheetLayout() {
      const order = ["horizontal","vertical","grid"];
      const i = order.indexOf(this.document.sheet.layout);
      this.document.sheet.layout = order[(i+1) % order.length];
      this.showMessage("Sheet layout: " + this.document.sheet.layout);
      this.renderAll();
    }
    adjustSheetPadding(d) { this.document.sheet.padding = Math.max(0, Math.min(64, this.document.sheet.padding + d)); this.showMessage("Sheet padding: " + this.document.sheet.padding); this.renderAll(); }
    adjustSheetSpacing(d) { this.document.sheet.spacing = Math.max(0, Math.min(32, this.document.sheet.spacing + d)); this.showMessage("Sheet spacing: " + this.document.sheet.spacing); this.renderAll(); }
    toggleSheetBackgroundMode() { this.document.sheet.transparent = !this.document.sheet.transparent; this.showMessage(this.document.sheet.transparent ? "Sheet background transparent." : "Sheet background solid."); this.renderAll(); }

    togglePlayback(force) {
      if (typeof force === "boolean") this.playback.isPlaying = force;
      else this.playback.isPlaying = !this.playback.isPlaying;
      if (this.playback.isPlaying) {
        const range = this.getPlaybackRange();
        if (range.enabled) {
          this.playback.previewFrameIndex = Math.max(range.startFrame, Math.min(range.endFrame, this.document.activeFrameIndex));
          this.document.activeFrameIndex = this.playback.previewFrameIndex;
        } else {
          this.playback.previewFrameIndex = this.document.activeFrameIndex;
        }
        this.playback.lastTick = performance.now();
      }
      this.showMessage(this.playback.isPlaying ? "Playback started." : "Playback paused.");
      this.renderAll();
    }

    stopPlayback() {
      this.playback.isPlaying = false;
      const range = this.getPlaybackRange();
      const nextIndex = range.enabled ? range.startFrame : 0;
      this.playback.previewFrameIndex = nextIndex;
      this.selectFrame(nextIndex);
      this.showMessage("Playback stopped.");
    }

    togglePlaybackLoop() {
      this.playback.loop = !this.playback.loop;
      this.showMessage(this.playback.loop ? "Loop on." : "Loop off.");
      this.renderAll();
    }

    adjustPlaybackFps(delta) {
      this.playback.fps = Math.max(1, Math.min(30, this.playback.fps + delta));
      this.showMessage(`FPS: ${this.playback.fps}`);
      this.renderAll();
    }

    saveLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        doc: this.document.buildExportPayload(),
        uiDensityMode: this.uiDensityMode
      }));
      this.markCleanBaseline();
      this.showMessage("Saved locally.");
    }
    loadLocal() {
      this.requestReplaceGuard("Load Local", "Replace current document with local save?", () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { this.showMessage("No local save."); return; }
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.doc) {
            this.document.importPayload(parsed.doc);
            this.uiDensityMode = ["auto", "standard", "pro"].includes(parsed.uiDensityMode) ? parsed.uiDensityMode : "standard";
          } else {
            this.document.importPayload(parsed);
            this.uiDensityMode = "auto";
          }
          this.clearHistoryStacks();
          this.markCleanBaseline();
          this.showMessage("Loaded local save.");
        }
        catch (_e) { this.showMessage("Load failed."); }
      });
      this.renderAll();
    }
    openImport() { this.fileInput.click(); }
    exportJson(pretty) {
      this.downloadBlob("sprite-editor.json", JSON.stringify(this.document.buildExportPayload(), null, pretty ? 2 : 0), "application/json");
      this.markCleanBaseline();
      this.showMessage("JSON exported.");
    }
    exportSheetMetadata() { this.downloadBlob("sprite-sheet-meta.json", JSON.stringify(this.document.buildSheetMetadata(), null, 2), "application/json"); this.showMessage("Sheet metadata exported."); }
    downloadSheetPng() {
      const plc = this.document.computeSheetPlacement();
      const temp = document.createElement("canvas");
      temp.width = plc.width; temp.height = plc.height;
      const ctx = temp.getContext("2d");
      this.drawSheetPreview(ctx, { x: 0, y: 0, width: plc.width, height: plc.height }, false);
      this.downloadLink.download = "sprite-sheet.png";
      this.downloadLink.href = temp.toDataURL("image/png");
      this.downloadLink.click();
      this.showMessage("PNG sheet exported.");
    }
    downloadBlob(name,text,mime) {
      const blob = new Blob([text], { type: mime });
      const url = URL.createObjectURL(blob);
      this.downloadLink.download = name;
      this.downloadLink.href = url;
      this.downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    showMessage(m) { this.statusMessage = m; this.flashMessageUntil = performance.now() + 1800; }

    tick(ts) {
      if (this.playback.isPlaying) {
        const fd = 1000 / this.playback.fps;
        if (ts - this.playback.lastTick >= fd) {
          this.playback.lastTick = ts;
          const range = this.getPlaybackRange();
          const start = range.enabled ? range.startFrame : 0;
          const end = range.enabled ? range.endFrame : Math.max(0, this.document.frames.length - 1);
          if (this.playback.previewFrameIndex < start || this.playback.previewFrameIndex > end) {
            this.playback.previewFrameIndex = start;
          } else if (this.playback.previewFrameIndex < end) {
            this.playback.previewFrameIndex += 1;
          } else if (this.playback.loop) {
            this.playback.previewFrameIndex = start;
          } else {
            this.playback.isPlaying = false;
          }
          this.document.activeFrameIndex = this.playback.previewFrameIndex;
          this.renderAll();
        }
      }
      requestAnimationFrame((t) => this.tick(t));
    }

    renderAll() {
      this.sanitizeSoloState();
      this.sanitizeFrameRangeSelection();
      this.sanitizePlaybackRange();
      this.syncCurrentPalettePreset();
      this.updateDirtyState();
      this.controlSurface.rebuildLayout();
      this.gridRect = this.computeGridRect();
      this.timelineStripRect = this.computeTimelineLayout();
      this.controlSurface.draw(this.ctx);
      this.drawMainGrid();
      this.drawTimelinePanel();
      this.drawPreviewPanel();
      this.drawSheetPanel();
      this.drawBottomStatus();
      this.drawReplaceGuard();
      this.drawLayerRenamePrompt();
    }

    drawTimelinePanel() {
      const t = this.timelineStripRect;
      if (!t) return;
      const ctx = this.ctx;
      ctx.fillStyle = "#1a2733";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 12px Arial";
      ctx.fillText("TIMELINE", t.x + 10, t.y + 14);
      (t.transport || []).forEach((c) => {
        ctx.fillStyle = "#1a2733";
        if (c.id === "play_pause" && this.playback.isPlaying) ctx.fillStyle = "#244d67";
        if (c.id === "loop" && this.playback.loop) ctx.fillStyle = "#244d67";
        if (c.id === "range" && this.getPlaybackRange().enabled) ctx.fillStyle = "#6b4f1d";
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "11px Arial";
        if (c.id === "play_pause") ctx.fillText(this.playback.isPlaying ? "Pause" : "Play", c.x + 8, c.y + 12);
        else if (c.id === "stop") ctx.fillText("Stop", c.x + 8, c.y + 12);
        else if (c.id === "loop") ctx.fillText("Loop", c.x + 9, c.y + 12);
        else if (c.id === "range") ctx.fillText("Range", c.x + 8, c.y + 12);
        else if (c.id === "fps_down") ctx.fillText("-", c.x + 7, c.y + 12);
        else if (c.id === "fps_up") ctx.fillText("+", c.x + 6, c.y + 12);
      });
      ctx.fillStyle = "#91a3b6";
      ctx.font = "11px Arial";
      ctx.fillText(`FPS ${this.playback.fps}`, t.x + t.w - 62, t.y + 14);
      t.slots.forEach((slot) => {
        const f = this.document.frames[slot.index];
        const active = slot.index === this.document.activeFrameIndex;
        const inRange = this.isFrameInSelectedRange(slot.index);
        const inPlaybackRange = this.isFrameInPlaybackRange(slot.index);
        const hoverPreview = this.timelineHoverIndex === slot.index;
        const reorderTarget = this.timelineInteraction && this.timelineInteraction.mode === "reorder" && slot.index === this.timelineInteraction.targetIndex;
        ctx.fillStyle = inRange ? "#1d3950" : "#101a24";
        if (inPlaybackRange) ctx.fillStyle = "#28344f";
        if (active) ctx.fillStyle = "#244d67";
        if (hoverPreview && !active) ctx.fillStyle = "#2f4858";
        if (reorderTarget) ctx.fillStyle = "#305c4a";
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.strokeStyle = active ? "#4cc9f0" : (inRange ? "#7dd3fc" : "rgba(255,255,255,0.22)");
        if (inPlaybackRange && !active) ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(slot.x + 0.5, slot.y + 0.5, slot.w - 1, slot.h - 1);
        const thumbH = slot.h - 18;
        const thumbW = slot.w - 8;
        this.drawMiniPixels(this.document.getCompositedPixels(f), slot.x + 4, slot.y + 2, thumbW, thumbH);
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "11px Arial";
        ctx.fillText(String(slot.index + 1), slot.x + 4, slot.y + slot.h - 6);
        if (inPlaybackRange) {
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(slot.x + 2, slot.y + slot.h - 4, slot.w - 4, 2);
        }
      });
    }

    drawReplaceGuard() {
      if (!this.replaceGuard.open) return;
      const ctx = this.ctx;
      const w = 560, h = 190;
      const x = Math.floor((LOGICAL_W - w) * 0.5);
      const y = Math.floor((LOGICAL_H - h) * 0.28);
      ctx.fillStyle = "rgba(2, 6, 12, 0.62)";
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.fillStyle = "#162435";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 18px Arial";
      ctx.fillText(this.replaceGuard.title || "Confirm Replace", x + 18, y + 28);
      ctx.font = "13px Arial";
      ctx.fillStyle = "#b9c8d8";
      ctx.fillText(this.replaceGuard.message || "Unsaved changes will be lost.", x + 18, y + 64);
      ctx.fillText("This action replaces the current editor state.", x + 18, y + 86);
      const cancelRect = { x: x + w - 230, y: y + h - 56, w: 96, h: 34 };
      const confirmRect = { x: x + w - 122, y: y + h - 56, w: 104, h: 34 };
      this.replaceGuard.cancelRect = cancelRect;
      this.replaceGuard.confirmRect = confirmRect;
      ctx.fillStyle = "#1a2733";
      ctx.fillRect(cancelRect.x, cancelRect.y, cancelRect.w, cancelRect.h);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.strokeRect(cancelRect.x + 0.5, cancelRect.y + 0.5, cancelRect.w - 1, cancelRect.h - 1);
      ctx.fillStyle = "#edf2f7";
      ctx.fillText("Cancel", cancelRect.x + 22, cancelRect.y + 22);
      ctx.fillStyle = "#27435a";
      ctx.fillRect(confirmRect.x, confirmRect.y, confirmRect.w, confirmRect.h);
      ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(confirmRect.x + 0.5, confirmRect.y + 0.5, confirmRect.w - 1, confirmRect.h - 1);
      ctx.fillStyle = "#e6f2ff";
      ctx.fillText("Replace", confirmRect.x + 24, confirmRect.y + 22);
    }

    drawLayerRenamePrompt() {
      if (!this.isLayerRenameOpen()) return;
      const frame = this.controlSurface.layout.appFrame;
      const panelW = 480;
      const panelH = 154;
      const x = frame.x + Math.floor((frame.width - panelW) * 0.5);
      const y = frame.y + Math.floor((frame.height - panelH) * 0.24);
      this.layerRenamePrompt.panelRect = { x, y, w: panelW, h: panelH };
      this.ctx.fillStyle = "rgba(2, 6, 12, 0.58)";
      this.ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      this.ctx.fillStyle = "#162435";
      this.ctx.fillRect(x, y, panelW, panelH);
      this.ctx.strokeStyle = "#4cc9f0";
      this.ctx.strokeRect(x + 0.5, y + 0.5, panelW - 1, panelH - 1);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 16px Arial";
      this.ctx.fillText("Rename Layer", x + 16, y + 24);
      this.ctx.font = "12px Arial";
      this.ctx.fillStyle = "#91a3b6";
      this.ctx.fillText("Enter apply  Esc cancel", x + 16, y + 44);
      this.ctx.fillStyle = "#101a24";
      this.ctx.fillRect(x + 16, y + 56, panelW - 32, 36);
      this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
      this.ctx.strokeRect(x + 16.5, y + 56.5, panelW - 33, 35);
      this.ctx.fillStyle = "#e6f2ff";
      this.ctx.font = "13px Arial";
      const renameText = (this.layerRenamePrompt.text || "").slice(0, 40) || "Layer";
      this.ctx.fillText(renameText, x + 24, y + 74);
      const btnW = 120;
      const btnH = 30;
      const gap = 10;
      const by = y + panelH - btnH - 14;
      this.layerRenamePrompt.confirmRect = { x: x + panelW - btnW * 2 - gap - 16, y: by, w: btnW, h: btnH };
      this.layerRenamePrompt.cancelRect = { x: x + panelW - btnW - 16, y: by, w: btnW, h: btnH };
      this.ctx.fillStyle = "#244d67";
      this.ctx.fillRect(this.layerRenamePrompt.confirmRect.x, by, btnW, btnH);
      this.ctx.strokeStyle = "#4cc9f0";
      this.ctx.strokeRect(this.layerRenamePrompt.confirmRect.x + 0.5, by + 0.5, btnW - 1, btnH - 1);
      this.ctx.fillStyle = "#edf2f7";
      this.ctx.fillText("Apply", this.layerRenamePrompt.confirmRect.x + 43, by + 19);
      this.ctx.fillStyle = "#1a2733";
      this.ctx.fillRect(this.layerRenamePrompt.cancelRect.x, by, btnW, btnH);
      this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
      this.ctx.strokeRect(this.layerRenamePrompt.cancelRect.x + 0.5, by + 0.5, btnW - 1, btnH - 1);
      this.ctx.fillStyle = "#edf2f7";
      this.ctx.fillText("Cancel", this.layerRenamePrompt.cancelRect.x + 38, by + 19);
    }

    drawMainGrid() {
      const r = this.gridRect, ctx = this.ctx, pixels = this.document.getCompositedPixels(this.document.activeFrame);
      const prevFrame = this.document.frames[this.document.activeFrameIndex - 1];
      const nextFrame = this.document.frames[this.document.activeFrameIndex + 1];
      const prevPixels = prevFrame ? this.document.getCompositedPixels(prevFrame) : null;
      const nextPixels = nextFrame ? this.document.getCompositedPixels(nextFrame) : null;
      ctx.fillStyle = "#fff"; ctx.fillRect(r.x, r.y, r.width, r.height);
      for (let y=0; y<this.document.rows; y+=1) {
        for (let x=0; x<this.document.cols; x+=1) {
          ctx.fillStyle = ((x+y)%2===0) ? "#f8fafc" : "#e2e8f0";
          ctx.fillRect(r.x+x*r.pixelSize, r.y+y*r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      if (this.onionSkin.prev && prevPixels) {
        ctx.fillStyle = "rgba(80, 180, 255, 0.20)";
        for (let y=0; y<this.document.rows; y+=1) {
          for (let x=0; x<this.document.cols; x+=1) {
            if (!prevPixels[y][x]) continue;
            ctx.fillRect(r.x+x*r.pixelSize, r.y+y*r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      if (this.onionSkin.next && nextPixels) {
        ctx.fillStyle = "rgba(255, 170, 80, 0.18)";
        for (let y=0; y<this.document.rows; y+=1) {
          for (let x=0; x<this.document.cols; x+=1) {
            if (!nextPixels[y][x]) continue;
            ctx.fillRect(r.x+x*r.pixelSize, r.y+y*r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      for (let y=0; y<this.document.rows; y+=1) {
        for (let x=0; x<this.document.cols; x+=1) {
          const v = pixels[y][x];
          if (!v) continue;
          ctx.fillStyle = v;
          ctx.fillRect(r.x+x*r.pixelSize, r.y+y*r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      for (let x=0; x<=this.document.cols; x+=1) { ctx.beginPath(); ctx.moveTo(r.x+x*r.pixelSize+0.5,r.y); ctx.lineTo(r.x+x*r.pixelSize+0.5,r.y+r.height); ctx.stroke(); }
      for (let y=0; y<=this.document.rows; y+=1) { ctx.beginPath(); ctx.moveTo(r.x,r.y+y*r.pixelSize+0.5); ctx.lineTo(r.x+r.width,r.y+y*r.pixelSize+0.5); ctx.stroke(); }
      if (this.hoveredGridCell) {
        ctx.strokeStyle = "#4cc9f0"; ctx.lineWidth = 2;
        ctx.strokeRect(r.x+this.hoveredGridCell.x*r.pixelSize+1, r.y+this.hoveredGridCell.y*r.pixelSize+1, r.pixelSize-2, r.pixelSize-2);
      }
      if (this.document.selection) {
        ctx.strokeStyle = "#ff9800"; ctx.lineWidth = 3;
        ctx.strokeRect(r.x+this.document.selection.x*r.pixelSize+1, r.y+this.document.selection.y*r.pixelSize+1, this.document.selection.width*r.pixelSize-2, this.document.selection.height*r.pixelSize-2);
        const sx = r.x + this.document.selection.x * r.pixelSize;
        const sy = r.y + this.document.selection.y * r.pixelSize;
        const sw = this.document.selection.width * r.pixelSize;
        const sh = this.document.selection.height * r.pixelSize;
        const hs = Math.max(6, Math.min(12, Math.floor(r.pixelSize * 0.6)));
        const handles = [
          { x: sx - hs / 2, y: sy - hs / 2 },
          { x: sx + sw - hs / 2, y: sy - hs / 2 },
          { x: sx - hs / 2, y: sy + sh - hs / 2 },
          { x: sx + sw - hs / 2, y: sy + sh - hs / 2 }
        ];
        ctx.fillStyle = "#ff9800";
        handles.forEach((h) => {
          ctx.fillRect(Math.floor(h.x), Math.floor(h.y), hs, hs);
        });
        const cx = Math.floor(sx + sw * 0.5);
        const cy = Math.floor(sy + sh * 0.5);
        ctx.strokeStyle = "#4cc9f0";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8); ctx.stroke();
      }
      if (this.shapePreview && this.shapePreview.start && this.shapePreview.current) {
        const previewCells = this.getShapeCells(this.shapePreview.start, this.shapePreview.current, this.shapePreview.tool);
        ctx.fillStyle = this.shapePreview.erase ? "rgba(239,68,68,0.35)" : "rgba(76,201,240,0.35)";
        previewCells.forEach((cell) => {
          if (cell.x < 0 || cell.y < 0 || cell.x >= this.document.cols || cell.y >= this.document.rows) return;
          ctx.fillRect(r.x + cell.x * r.pixelSize, r.y + cell.y * r.pixelSize, r.pixelSize, r.pixelSize);
        });
        ctx.strokeStyle = this.shapePreview.erase ? "#ef4444" : "#4cc9f0";
        ctx.lineWidth = 2;
        previewCells.forEach((cell) => {
          if (cell.x < 0 || cell.y < 0 || cell.x >= this.document.cols || cell.y >= this.document.rows) return;
          ctx.strokeRect(r.x + cell.x * r.pixelSize + 1, r.y + cell.y * r.pixelSize + 1, r.pixelSize - 2, r.pixelSize - 2);
        });
      }
    }

    drawPreviewPanel() {
      const p = this.controlSurface.layout.rightPanel, x = p.x + 18, y = p.y + p.height - 248, w = p.width - 36, h = 98;
      this.ctx.fillStyle = "#1a2733"; this.ctx.fillRect(x,y,w,h); this.ctx.strokeStyle = "rgba(255,255,255,0.15)"; this.ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
      this.ctx.fillStyle = "#dbe7f3"; this.ctx.font = "bold 12px Arial"; this.ctx.fillText("ANIMATION PREVIEW",x+12,y+16);
      const previewIndex = this.playback.isPlaying
        ? this.playback.previewFrameIndex
        : (this.timelineHoverIndex !== null ? this.timelineHoverIndex : this.document.activeFrameIndex);
      const f = this.document.frames[Math.max(0, Math.min(previewIndex, this.document.frames.length - 1))];
      this.drawMiniPixels(this.document.getCompositedPixels(f),x+12,y+24,72,72);
      this.ctx.font = "12px Arial";
      this.ctx.fillText("Frame "+(previewIndex+1)+" / "+this.document.frames.length,x+96,y+36);
      this.ctx.fillText(this.playback.isPlaying ? "Playing" : (this.timelineHoverIndex !== null ? "Hover Preview" : "Paused"),x+96,y+58);
      this.ctx.fillText("P play/pause  [ ] frame",x+96,y+80);
    }

    drawSheetPanel() {
      const p = this.controlSurface.layout.rightPanel, x = p.x + 18, y = p.y + p.height - 140, w = p.width - 36, h = 104;
      this.drawSheetPreview(this.ctx, { x, y, width: w, height: h }, true);
    }

    drawSheetPreview(ctx, rect, withChrome) {
      const plc = this.document.computeSheetPlacement();
      const titleH = withChrome ? 18 : 0;
      const footerH = withChrome ? 20 : 0;
      const innerPad = withChrome ? 12 : 0;
      if (withChrome) {
        ctx.fillStyle = "#1a2733"; ctx.fillRect(rect.x,rect.y,rect.width,rect.height);
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.strokeRect(rect.x+0.5,rect.y+0.5,rect.width-1,rect.height-1);
        ctx.fillStyle = "#dbe7f3"; ctx.font = "bold 12px Arial"; ctx.fillText("SHEET PREVIEW",rect.x+12,rect.y+16);
      }
      const cx = rect.x + innerPad;
      const cy = rect.y + innerPad + titleH;
      const cw = rect.width - innerPad * 2;
      const ch = rect.height - innerPad * 2 - titleH - footerH;
      const scale = Math.max(1, Math.floor(Math.min(cw/plc.width, ch/plc.height)));
      const drawW = plc.width * scale;
      const drawH = plc.height * scale;
      const drawX = cx + Math.floor((cw - drawW) * 0.5);
      const drawY = cy + Math.floor((ch - drawH) * 0.5);
      if (this.document.sheet.transparent) this.drawCheckerboard(ctx,drawX,drawY,drawW,drawH,Math.max(4,scale));
      else { ctx.fillStyle = this.document.sheet.backgroundColor; ctx.fillRect(drawX,drawY,drawW,drawH); }
      this.document.frames.forEach((f,i) => {
        const e = plc.entries[i];
        const cpx = this.document.getCompositedPixels(f);
        for (let y=0; y<this.document.rows; y+=1) {
          for (let x=0; x<this.document.cols; x+=1) {
            const v = cpx[y][x];
            if (!v) continue;
            ctx.fillStyle = v;
            ctx.fillRect(drawX+(e.x+x)*scale, drawY+(e.y+y)*scale, scale, scale);
          }
        }
      });
      if (withChrome) {
        const footerY = rect.y + rect.height - 8;
        ctx.fillStyle = "rgba(10, 15, 24, 0.9)";
        ctx.fillRect(rect.x + 8, rect.y + rect.height - footerH - 8, rect.width - 16, footerH);
        ctx.fillStyle = "#e6f2ff";
        ctx.font = "11px Arial";
        const order = this.document.frames.length <= 8
          ? this.document.frames.map((_,i)=>i+1).join(", ")
          : `1..${this.document.frames.length}`;
        ctx.fillText(`Frames: ${this.document.frames.length}  Order: ${order}`, rect.x+12, footerY);
      }
    }

    drawMiniPixels(pixels,x,y,w,h) {
      const cols = this.document.cols, rows = this.document.rows, pw = Math.max(1, Math.floor(w/cols)), ph = Math.max(1, Math.floor(h/rows));
      this.ctx.fillStyle = "#fff"; this.ctx.fillRect(x,y,w,h);
      for (let py=0; py<rows; py+=1) {
        for (let px=0; px<cols; px+=1) {
          const v = pixels[py][px];
          if (!v) continue;
          this.ctx.fillStyle = v; this.ctx.fillRect(x+px*pw, y+py*ph, pw, ph);
        }
      }
      this.ctx.strokeStyle = "rgba(0,0,0,0.2)"; this.ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
    }

    drawCheckerboard(ctx,x,y,w,h,b) {
      for (let py=0; py<h; py+=b) {
        for (let px=0; px<w; px+=b) {
          ctx.fillStyle = ((Math.floor(px/b)+Math.floor(py/b))%2===0) ? "#f8fafc" : "#e2e8f0";
          ctx.fillRect(x+px,y+py,b,b);
        }
      }
    }

    drawBottomStatus() {
      const b = this.controlSurface.layout.bottomPanel, y = b.y + 40;
      const sel = this.document.selection ? `Sel ${this.document.selection.width}x${this.document.selection.height} @ ${this.document.selection.x},${this.document.selection.y}` : "Sel -";
      const hover = this.hoveredGridCell ? `Cell ${this.hoveredGridCell.x},${this.hoveredGridCell.y}` : "Cell -";
      const frameRange = this.getFrameRangeSelection();
      const frameRangeText = frameRange.explicit ? `Frames ${frameRange.start + 1}-${frameRange.end + 1}` : `Frame ${this.document.activeFrameIndex + 1}`;
      const playbackRange = this.getPlaybackRange();
      const playbackRangeText = playbackRange.enabled ? `Range ${playbackRange.startFrame + 1}-${playbackRange.endFrame + 1}` : "Range Off";
      const hoverPreviewText = this.timelineHoverIndex !== null ? `Hover ${this.timelineHoverIndex + 1}` : "Hover -";
      const paletteReplaceText = `Replace ${this.paletteWorkflow.source ? "S" : "-"}>${this.paletteWorkflow.target ? "T" : "-"} ${this.getPaletteScopeLabel().replace("Scope: ", "")}`;
      const af = this.document.ensureFrameLayers(this.document.activeFrame);
      const activeLayer = af.layers[af.activeLayerIndex];
      const layerFlags = [
        activeLayer && activeLayer.locked ? "Locked" : null,
        this.isLayerSoloActiveFor(af, af.activeLayerIndex) ? "Solo" : null,
        activeLayer ? `${Math.round(((typeof activeLayer.opacity === "number" ? activeLayer.opacity : 1) * 100))}%` : null
      ].filter(Boolean).join(" ");
      const brushText = (this.activeTool === "brush" || this.activeTool === "erase")
        ? `Brush ${this.brush.size}/${this.brush.shape}`
        : (this.activeTool === "line" || this.activeTool === "rect" || this.activeTool === "fillrect" ? "Shape drag preview" : "Brush -");
      const topLine = `Tool ${this.activeTool} | ${brushText} | ${frameRangeText} | ${hoverPreviewText} | ${hover}`;
      const middleLine = `Layer ${activeLayer ? activeLayer.name : "-"}${layerFlags ? ` (${layerFlags})` : ""} | ${paletteReplaceText} | Zoom ${this.zoom.toFixed(2)}x | Pixel ${this.viewport.pixelPerfect ? "On" : "Off"}`;
      const playbackText = `Playback ${this.playback.isPlaying ? "Play" : "Pause"} ${this.playback.fps}fps ${this.playback.loop ? "Loop" : "Once"} | ${playbackRangeText} | Onion ${this.onionSkin.prev ? "P" : "-"}${this.onionSkin.next ? "N" : "-"}`;
      const shortcutsText = this.controlSurface.dragFeedbackText
        ? this.controlSurface.dragFeedbackText
        : `${sel} | ${playbackText}`;
      const rightMargin = 18;
      const maxRight = b.x + b.width - rightMargin;
      this.ctx.fillStyle = "#dbe7f3"; this.ctx.font = "12px Arial";
      const toolX = maxRight - this.ctx.measureText(topLine).width;
      const middleX = maxRight - this.ctx.measureText(middleLine).width;
      const shortcutsX = maxRight - this.ctx.measureText(shortcutsText).width;
      this.ctx.fillText(topLine, Math.max(b.x + 18, toolX), y);
      this.ctx.fillText(middleLine, Math.max(b.x + 18, middleX), y + 22);
      this.ctx.fillText(shortcutsText, Math.max(b.x + 18, shortcutsX), y + 44);
      this.ctx.fillStyle = "#91a3b6";
      const dirtyText = this.isDirty ? "Modified" : "Saved";
      const nextUndo = this.history.undo.length ? this.history.undo[this.history.undo.length - 1].label : "-";
      const nextRedo = this.history.redo.length ? this.history.redo[this.history.redo.length - 1].label : "-";
      this.ctx.fillText(`State: ${dirtyText} | Undo: ${nextUndo} | Redo: ${nextRedo}`, b.x + 18, y + 66);
      this.ctx.fillStyle = performance.now() < this.flashMessageUntil ? "#4cc9f0" : "#91a3b6";
      const message = this.statusMessage || "Ready.";
      const messageX = Math.max(b.x + 18, maxRight - this.ctx.measureText(message).width);
      this.ctx.fillText(message, messageX, y + 66);
    }
  }

  const canvas = document.getElementById("spriteEditorCanvas");
  const fileInput = document.getElementById("spriteEditorFileInput");
  const downloadLink = document.getElementById("spriteEditorDownloadLink");
  new SpriteEditorApp(canvas,fileInput,downloadLink);
})();
