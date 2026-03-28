import { DEFAULT_PALETTE, DEFAULT_PALETTE_NAMED_ENTRIES } from "../../../engine/paletteDefaults.js";

class SpriteEditorDocument {
    constructor() {
      this.cols = 16;
      this.rows = 16;
      this.palette = this.getDefaultPalette();
      this.currentColor = "#00ccff";
      this.frames = [this.makeFrame("Frame 1"), this.makeFrame("Frame 2"), this.makeFrame("Frame 3")];
      this.activeFrameIndex = 0;
      this.selection = null;
      this.selectionClipboard = null;
      this.frameClipboard = null;
      this.soloState = null;
      this.blendPreviewMode = "normal";
      this.sheet = { layout: "horizontal", padding: 4, spacing: 2, transparent: true, backgroundColor: "#ffffff" };
      this.palettePresetName = "";
      this.paletteSelectionRequired = true;
      this.customPalettes = {};
      this.playbackOrderOverride = { enabled: false, order: [] };
    }
    getDefaultPalette() { return DEFAULT_PALETTE.slice(); }
    getDefaultPaletteNamedEntries() {
      return DEFAULT_PALETTE_NAMED_ENTRIES.map((entry) => ({ ...entry }));
    }
    sanitizeCustomPalettes(input) {
      const output = {};
      const source = input && typeof input === "object" ? input : {};
      Object.keys(source).forEach((name) => {
        const key = String(name || "").trim();
        if (!key) return;
        const entries = Array.isArray(source[name]) ? source[name] : [];
        const normalized = entries
          .map((entry, i) => ({
            hex: entry && typeof entry.hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(entry.hex) ? entry.hex : null,
            name: entry && typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : `Color ${i + 1}`
          }))
          .filter((entry) => !!entry.hex);
        if (normalized.length) output[key] = normalized;
      });
      return output;
    }
    sanitizePlaybackOrderOverride(input) {
      const source = input && typeof input === "object" ? input : {};
      const raw = Array.isArray(source.order) ? source.order : [];
      const order = raw
        .map((idx) => Number(idx))
        .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < this.frames.length);
      return { enabled: !!source.enabled && order.length > 0, order };
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
    ensureDocumentState() {
      const nextCols = Math.max(1, Math.min(256, Math.floor(Number(this.cols) || 16)));
      const nextRows = Math.max(1, Math.min(256, Math.floor(Number(this.rows) || 16)));
      this.cols = nextCols;
      this.rows = nextRows;
      const palette = Array.isArray(this.palette)
        ? this.palette.filter((hex) => typeof hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(hex))
        : [];
      this.palette = palette.length ? palette : this.getDefaultPalette();
      if (this.palette.indexOf(this.currentColor) < 0) this.currentColor = this.palette[0];
      this.palettePresetName = typeof this.palettePresetName === "string" ? this.palettePresetName : "";
      this.paletteSelectionRequired = this.paletteSelectionRequired === true;
      this.customPalettes = this.sanitizeCustomPalettes(this.customPalettes);
      if (!Array.isArray(this.frames) || !this.frames.length) this.frames = [this.makeFrame("Frame 1")];
      this.frames = this.frames.map((frame, index) => {
        const next = frame && typeof frame === "object" ? frame : this.makeFrame(`Frame ${index + 1}`);
        if (!next.id) next.id = "f_" + Math.random().toString(36).slice(2, 10);
        if (!next.name) next.name = `Frame ${index + 1}`;
        return this.ensureFrameLayers(next);
      });
      this.activeFrameIndex = Math.max(0, Math.min(Math.floor(Number(this.activeFrameIndex) || 0), this.frames.length - 1));
      this.ensureFrameLayers(this.frames[this.activeFrameIndex]);
      this.playbackOrderOverride = this.sanitizePlaybackOrderOverride(this.playbackOrderOverride);
      return true;
    }
    get activeFrame() { this.ensureDocumentState(); return this.frames[this.activeFrameIndex]; }
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
        palettePresetName: this.palettePresetName || "",
        paletteSelectionRequired: this.paletteSelectionRequired === true,
        customPalettes: this.sanitizeCustomPalettes(this.customPalettes),
        playbackOrderOverride: this.sanitizePlaybackOrderOverride(this.playbackOrderOverride),
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
      const data = payload && typeof payload === "object" ? payload : {};
      this.cols = data.cols || 16;
      this.rows = data.rows || 16;
      this.palette = Array.isArray(data.palette) && data.palette.length ? data.palette : this.palette;
      this.currentColor = data.currentColor || this.palette[0];
      this.palettePresetName = typeof data.palettePresetName === "string" ? data.palettePresetName : "";
      this.paletteSelectionRequired = data.paletteSelectionRequired === true;
      this.customPalettes = this.sanitizeCustomPalettes(data.customPalettes);
      this.sheet = { ...this.sheet, ...(data.sheet || {}) };
      if (Array.isArray(data.frames) && data.frames.length) {
        this.frames = data.frames.map((f, i) => this.ensureFrameLayers({ id: f.id || "f_" + i, name: f.name || "Frame " + (i + 1), activeLayerIndex: f.activeLayerIndex || 0, layers: f.layers, pixels: f.pixels }));
      } else if (Array.isArray(data.pixels)) {
        this.frames = [this.ensureFrameLayers({ id: "f_1", name: "Frame 1", pixels: data.pixels })];
      }
      this.activeFrameIndex = 0;
      this.selection = null;
      this.soloState = null;
      this.ensureDocumentState();
      this.playbackOrderOverride = this.sanitizePlaybackOrderOverride(data.playbackOrderOverride);
    }
}

export { SpriteEditorDocument };
