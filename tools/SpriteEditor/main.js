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
      this.sheet = { layout: "horizontal", padding: 4, spacing: 2, transparent: true, backgroundColor: "#ffffff" };
    }
    makeGrid(fill = null) { return Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => fill)); }
    cloneGrid(grid) { return grid.map((r) => r.slice()); }
    makeFrame(name) { return { id: "f_" + Math.random().toString(36).slice(2, 10), name, pixels: this.makeGrid() }; }
    get activeFrame() { return this.frames[this.activeFrameIndex]; }
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
        const c = queue.shift();
        const key = c.x + "," + c.y;
        if (seen.has(key)) continue;
        seen.add(key);
        if (c.x < 0 || c.y < 0 || c.x >= this.cols || c.y >= this.rows) continue;
        if (this.activeFrame.pixels[c.y][c.x] !== targetValue) continue;
        this.setPixel(c.x, c.y, nextValue, mirror);
        queue.push({ x: c.x + 1, y: c.y }, { x: c.x - 1, y: c.y }, { x: c.x, y: c.y + 1 }, { x: c.x, y: c.y - 1 });
      }
    }
    addFrame() { this.frames.push(this.makeFrame("Frame " + (this.frames.length + 1))); this.activeFrameIndex = this.frames.length - 1; }
    duplicateFrame() {
      const f = this.activeFrame;
      this.frames.splice(this.activeFrameIndex + 1, 0, { id: "f_" + Math.random().toString(36).slice(2, 10), name: f.name + " Copy", pixels: this.cloneGrid(f.pixels) });
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
    copyFrame() { this.frameClipboard = this.cloneGrid(this.activeFrame.pixels); }
    pasteFrame() { if (!this.frameClipboard) return false; this.activeFrame.pixels = this.cloneGrid(this.frameClipboard); return true; }
    clearFrame() { this.activeFrame.pixels = this.makeGrid(); }
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
          this.activeFrame.pixels[ty][tx] = this.selectionClipboard.pixels[py][px];
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
          this.activeFrame.pixels[this.selection.y + y][this.selection.x + x] = next[y][x];
        }
      }
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
    buildExportPayload() {
      return { version: 22, kind: "sprite-editor-v2.2", cols: this.cols, rows: this.rows, palette: this.palette, currentColor: this.currentColor, sheet: this.sheet, frames: this.frames.map((f) => ({ id: f.id, name: f.name, pixels: this.cloneGrid(f.pixels) })) };
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
        this.frames = payload.frames.map((f, i) => ({ id: f.id || "f_" + i, name: f.name || "Frame " + (i + 1), pixels: f.pixels || this.makeGrid() }));
      } else if (Array.isArray(payload.pixels)) {
        this.frames = [{ id: "f_1", name: "Frame 1", pixels: payload.pixels }];
      }
      this.activeFrameIndex = 0;
      this.selection = null;
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
      this.controls = [];
      this.hiddenTopControls = [];
      if (this.overflowPanelOpen) {
        this.rebuildOverflowPanel();
      }
      this.build();
    }

    add(kind, id, x, y, w, h, text, action, extra = {}) { this.controls.push({ kind, id, x, y, w, h, text, action, ...extra }); }

    getTopControlPolicy(effectiveMode, selectedMode) {
      const modeLabel = selectedMode === "auto"
        ? `Mode: Auto (${effectiveMode === "pro" ? "Pro" : "Std"})`
        : (selectedMode === "pro" ? "Mode: Pro" : "Mode: Standard");
      const defs = [
        { id: "top-save", tier: 1, overflowEligible: false, labels: effectiveMode === "pro" ? ["Save", "Save", "S"] : ["Save", "Save", "S"], action: () => this.app.saveLocal() },
        { id: "top-load", tier: 1, overflowEligible: false, labels: effectiveMode === "pro" ? ["Load", "Load", "L"] : ["Load", "Load", "L"], action: () => this.app.loadLocal() },
        { id: "top-import", tier: 1, overflowEligible: false, labels: effectiveMode === "pro" ? ["Import", "Imp", "I"] : ["Import", "Imp", "I"], action: () => this.app.openImport() },
        { id: "top-json", tier: 3, overflowEligible: true, labels: effectiveMode === "pro" ? ["Export", "JSON", "J"] : ["Export JSON", "JSON", "J"], action: () => this.app.exportJson(true) },
        { id: "top-png", tier: 3, overflowEligible: true, labels: effectiveMode === "pro" ? ["PNG", "PNG", "P"] : ["PNG Sheet", "PNG", "P"], action: () => this.app.downloadSheetPng() },
        { id: "top-meta", tier: 3, overflowEligible: true, labels: effectiveMode === "pro" ? ["Meta", "Meta", "M"] : ["Sheet Meta", "Meta", "M"], action: () => this.app.exportSheetMetadata() },
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
    }

    pointInRect(x, y, r) {
      return !!r && x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h;
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
      if (!this.overflowPanelOpen || !this.hiddenTopControls.length) {
        this.closeOverflowPanel();
        return;
      }
      const anchor = this.controls.find((c) => c.id === "top-overflow") || this.overflowAnchorControl;
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
      this.hiddenTopControls.forEach((item) => {
        maxW = Math.max(maxW, this.measureButtonWidth(this.app.ctx, item.text, minBtn, padX));
      });
      const panelW = Math.max(140, maxW + panelPad * 2);
      const panelH = panelPad * 2 + (this.hiddenTopControls.length * rowH) + (Math.max(0, this.hiddenTopControls.length - 1) * gap);
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
      this.hiddenTopControls.forEach((item, index) => {
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
        this.hiddenTopControls = hidden.map((c) => ({ id: c.id, text: c.labels[0], action: c.action }));
        addRight("top-overflow", overflowW, overflowText, () => this.toggleOverflowPanel(), { overflowItems: hidden.map((c) => c.id) });
      } else {
        this.hiddenTopControls = [];
        this.closeOverflowPanel();
      }
      addRight("fullscreen", topLayout.fsW, topLayout.fsLabel, () => this.app.toggleFullscreen());
      this.app.ctx.font = prevFont;

      x = left.x + d.padding;
      y = left.y + d.padding;
      const bw = left.width - (d.padding * 2);
      const bh = d.sideButtonHeight;
      this.add("label","lbl-tools",x,y,bw,d.labelHeight,"TOOLS",null); y += d.labelHeight + d.spacing;
      [["brush","Brush"],["erase","Erase"],["fill","Fill"],["eyedropper","Eye"],["select","Select"]].forEach(([tool,t]) => {
        this.add("button","tool-"+tool,x,y,bw,bh,t,()=>this.app.setTool(tool),{tool}); y += bh + d.spacing;
      });
      this.add("button","mirror-toggle",x,y,bw,bh,this.app.mirror ? "Mirror: On" : "Mirror: Off",()=>this.app.toggleMirror()); y += bh + d.spacing;
      y += d.spacing;
      this.add("label","lbl-sel",x,y,bw,d.labelHeight,"SELECTION",null); y += d.labelHeight + d.spacing;
      [["copy","Copy"],["cut","Cut"],["paste","Paste"],["fliph","Flip H"],["flipv","Flip V"],["clear","Clear"]].forEach(([id,t]) => {
        this.add("button","sel-"+id,x,y,bw,bh,t,()=>this.app.handleSelectionAction("sel-"+id)); y += bh + d.spacing;
      });

      x = right.x + d.padding;
      y = right.y + d.padding;
      const rw = right.width - (d.padding * 2);
      this.add("label","lbl-frames",x,y,rw,d.labelHeight,"FRAMES",null); y += d.labelHeight + d.spacing;
      [["add","Add Frame",()=>this.app.addFrame()],["dup","Duplicate",()=>this.app.duplicateFrame()],["del","Delete",()=>this.app.deleteFrame()],["copy","Copy Frame",()=>this.app.copyFrame()],["paste","Paste Frame",()=>this.app.pasteFrame()]].forEach(([id,t,a]) => {
        this.add("button","frame-"+id,x,y,rw,bh,t,a); y += bh + d.spacing;
      });
      this.app.document.frames.forEach((f,i) => {
        this.add("frame","frame-thumb-"+i,x,y,rw,d.frameThumbHeight,f.name,()=>this.app.selectFrame(i),{frameIndex:i});
        y += d.frameThumbHeight + d.spacing;
      });

      x = bottom.x + d.padding;
      y = bottom.y + d.padding + 4;
      this.add("label","lbl-palette",x,y-(d.labelHeight - 4),180,d.labelHeight - 4,"PALETTE",null);
      this.app.document.palette.forEach((c,i) => { this.add("palette","palette-"+i,x,y,34,34,"",()=>this.app.setCurrentColor(c),{color:c}); x += 42; });
      x += d.padding;
      this.add("button","color-next",x,y,84,34,"Next",()=>this.app.nextColor()); x += 92;
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
        const overflowButton = this.controls.find((c) => c.id === "top-overflow");
        const inOverflowButton = overflowButton &&
          x >= overflowButton.x && y >= overflowButton.y &&
          x <= overflowButton.x + overflowButton.w && y <= overflowButton.y + overflowButton.h;
        if (!inPanel && !inOverflowButton) {
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
        ctx.lineWidth = 1;
        return;
      }
      const hovered = this.hovered === c.id, pressed = this.pressed === c.id, activeFrame = c.kind === "frame" && this.app.document.activeFrameIndex === c.frameIndex, dragTarget = c.kind === "frame" && this.dragOverFrameIndex === c.frameIndex && this.dragFrameIndex !== null, toolActive = c.tool && this.app.activeTool === c.tool;
      ctx.fillStyle = pressed ? "#27435a" : (hovered ? "#223444" : "#1a2733");
      if (c.isCommandRow && c.selected) ctx.fillStyle = "#2d5169";
      if (toolActive || activeFrame) ctx.fillStyle = "#244d67";
      if (dragTarget) ctx.fillStyle = "#305c4a";
      ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = (toolActive || activeFrame || dragTarget) ? "#4cc9f0" : "rgba(255,255,255,0.15)";
      if (c.isCommandRow && c.selected) ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1);
      ctx.fillStyle = "#edf2f7"; ctx.font = c.kind === "frame" ? "12px Arial" : "13px Arial"; ctx.fillText(c.text,c.x+10,c.y+c.h/2);
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
        this.drawMiniFrame(ctx, f.pixels, c.x+c.w-54, c.y+8, 46, c.h-16);
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
      this.hoveredGridCell = null;
      this.isPointerDown = false;
      this.mirror = false;
      this.selectionStart = null;
      this.selectionPasteOrigin = { x: 0, y: 0 };
      this.selectionMoveSession = null;
      this.playback = { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, lastTick: 0 };
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
        frameClipboard: this.document.frameClipboard ? this.cloneGridData(this.document.frameClipboard) : null
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
        this.document.frameClipboard = state.frameClipboard ? this.cloneGridData(state.frameClipboard) : null;
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
        frameClipboard: state.frameClipboard
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

    requestReplaceGuard(title, message, onConfirm) {
      if (!this.isDirty) {
        if (typeof onConfirm === "function") onConfirm();
        return;
      }
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
        this.showMessage(this.isFullscreen() ? "Exited full screen." : "Entered full screen.");
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
      const frame = this.document.activeFrame.pixels;
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
      return this.executeWithHistory(`Selection Nudge ${step}`, () => this.moveSelectionBy(dx, dy));
    }

    onPointerMove(e) {
      const p = this.logicalPointFromEvent(e);
      if (!p) return;
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
          this.applyGridTool(cell.x, cell.y, e.buttons === 2);
          this.renderAll();
        }
      } else {
        this.renderAll();
      }
    }

    onPointerDown(e) {
      const p = this.logicalPointFromEvent(e);
      if (!p) return;
      if (this.replaceGuard.open) {
        this.handleReplaceGuardPointer(p);
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

      this.beginStrokeHistory(this.activeTool === "erase" || e.button === 2 ? "Erase Stroke" : "Draw Stroke");
      this.applyGridTool(cell.x, cell.y, e.button === 2);
      this.renderAll();
    }

    onPointerUp(e) {
      const p = this.logicalPointFromEvent(e);
      if (p && this.controlSurface.pointerUp(p.x, p.y)) this.renderAll();
      this.commitStrokeHistory();
      this.commitSelectionMove();
      this.isPointerDown = false;
      this.selectionStart = null;
      this.isPanning = false;
      this.panStart = null;
      this.renderAll();
    }

    onWheel(e) {
      e.preventDefault();
      if (e.deltaY < 0) this.adjustZoom(0.25);
      else this.adjustZoom(-0.25);
    }

    onKeyDown(e) {
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
        "i": "tool.eyedropper",
        "s": "tool.select",
        "p": "system.playback",
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
        { id: "tool.eyedropper", label: "Tool: Eyedropper", category: "Tool", keywords: ["picker", "sample"], aliases: ["eyedropper", "color picker", "picker"] },
        { id: "tool.select", label: "Tool: Select", category: "Tool", keywords: ["marquee", "selection"], aliases: ["select", "selection tool"] },
        { id: "view.zoomIn", label: "View: Zoom In", category: "View", keywords: ["magnify", "closer"], aliases: ["zoom in", "increase zoom"] },
        { id: "view.zoomOut", label: "View: Zoom Out", category: "View", keywords: ["farther", "shrink"], aliases: ["zoom out", "decrease zoom"] },
        { id: "view.zoomReset", label: "View: Reset Zoom/Pan", category: "View", keywords: ["reset", "center"], aliases: ["reset zoom", "zoom reset", "center view"] },
        { id: "view.pixelToggle", label: "View: Toggle Pixel Perfect", category: "View", keywords: ["pixel", "filter"], aliases: ["pixel perfect", "toggle pixel", "pixel"] },
        { id: "view.onionPrevToggle", label: "View: Toggle Onion Previous", category: "View", keywords: ["onion", "previous", "frame"], aliases: ["onion prev", "toggle onion previous"] },
        { id: "view.onionNextToggle", label: "View: Toggle Onion Next", category: "View", keywords: ["onion", "next", "frame"], aliases: ["onion next", "toggle onion next"] },
        { id: "frame.prev", label: "Frame: Previous", category: "Frame", keywords: ["animation", "back"], aliases: ["prev frame", "previous frame"] },
        { id: "frame.next", label: "Frame: Next", category: "Frame", keywords: ["animation", "forward"], aliases: ["next frame"] },
        { id: "frame.duplicate", label: "Frame: Duplicate", category: "Frame", keywords: ["copy frame"], aliases: ["dup frame", "duplicate frame"] },
        { id: "selection.copy", label: "Selection: Copy", category: "Selection", keywords: ["copy"], aliases: ["copy selection"] },
        { id: "selection.cut", label: "Selection: Cut", category: "Selection", keywords: ["cut"], aliases: ["cut selection"] },
        { id: "selection.paste", label: "Selection: Paste", category: "Selection", keywords: ["paste"], aliases: ["paste selection"] },
        { id: "selection.nudge_up", label: "Selection: Nudge Up", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection up"] },
        { id: "selection.nudge_down", label: "Selection: Nudge Down", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection down"] },
        { id: "selection.nudge_left", label: "Selection: Nudge Left", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection left"] },
        { id: "selection.nudge_right", label: "Selection: Nudge Right", category: "Selection", keywords: ["nudge", "move"], aliases: ["move selection right"] },
        { id: "system.fullscreen", label: "System: Toggle Full Screen", category: "System", keywords: ["fullscreen", "window"], aliases: ["full screen", "fullscreen", "toggle full"] },
        { id: "system.playback", label: "System: Toggle Playback", category: "System", keywords: ["play", "pause", "preview"], aliases: ["playback", "play pause", "preview animation"] },
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
      this.commandPaletteCommands = this.createCommandPaletteCommands();
      this.controlSurface.openCommandPalette(this.commandPaletteCommands);
      this.showMessage("Command palette opened.");
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
          this.showMessage("Overflow closed.");
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
      if (action === "tool.eyedropper") { this.setTool("eyedropper"); return true; }
      if (action === "tool.select") { this.setTool("select"); return true; }
      if (action === "view.zoomIn") { this.adjustZoom(0.25); return true; }
      if (action === "view.zoomOut") { this.adjustZoom(-0.25); return true; }
      if (action === "view.zoomReset") { this.resetZoom(); return true; }
      if (action === "view.pixelToggle") { this.togglePixelPerfect(); return true; }
      if (action === "view.onionPrevToggle") { this.toggleOnionPrevious(); return true; }
      if (action === "view.onionNextToggle") { this.toggleOnionNext(); return true; }
      if (action === "frame.prev") { this.selectFrame(this.document.activeFrameIndex - 1); return true; }
      if (action === "frame.next") { this.selectFrame(this.document.activeFrameIndex + 1); return true; }
      if (action === "frame.duplicate") { this.duplicateFrame(); return true; }
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
      if (action === "system.fullscreen") { this.toggleFullscreen(); return true; }
      if (action === "system.playback") { this.togglePlayback(); return true; }
      if (action === "system.delete") {
        if (this.document.selection) { this.handleSelectionAction("sel-cut"); return true; }
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

    applyGridTool(x,y,erase) {
      if (this.activeTool === "eyedropper") {
        const v = this.document.getPixel(x,y);
        if (v) this.setCurrentColor(v);
        this.showMessage("Picked color.");
        return;
      }
      if (this.activeTool === "fill") {
        this.document.floodFill(x,y,erase ? null : this.document.currentColor,this.mirror);
        return;
      }
      this.document.setPixel(x,y,(erase || this.activeTool === "erase") ? null : this.document.currentColor,this.mirror);
    }

    setTool(t) { this.activeTool = t; this.showMessage("Tool: " + t); }
    setCurrentColor(c) { this.document.currentColor = c; this.showMessage("Color selected."); }
    nextColor() {
      const p = this.document.palette, i = p.indexOf(this.document.currentColor), n = i >= 0 ? (i+1) % p.length : 0;
      this.document.currentColor = p[n];
      this.showMessage("Color cycled.");
      this.renderAll();
    }
    toggleMirror() { this.mirror = !this.mirror; this.showMessage(this.mirror ? "Mirror on." : "Mirror off."); this.renderAll(); }

    handleSelectionAction(id) {
      const isMutating = id === "sel-cut" || id === "sel-paste" || id === "sel-fliph" || id === "sel-flipv";
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
    selectFrame(i) {
      this.document.activeFrameIndex = Math.max(0, Math.min(i, this.document.frames.length - 1));
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
      if (this.playback.isPlaying) { this.playback.previewFrameIndex = 0; this.playback.lastTick = performance.now(); }
      this.showMessage(this.playback.isPlaying ? "Playback started." : "Playback paused.");
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
          if (this.playback.previewFrameIndex < this.document.frames.length - 1) this.playback.previewFrameIndex += 1;
          else if (this.playback.loop) this.playback.previewFrameIndex = 0;
          else this.playback.isPlaying = false;
          this.renderAll();
        }
      }
      requestAnimationFrame((t) => this.tick(t));
    }

    renderAll() {
      this.updateDirtyState();
      this.controlSurface.rebuildLayout();
      this.gridRect = this.computeGridRect();
      this.controlSurface.draw(this.ctx);
      this.drawMainGrid();
      this.drawPreviewPanel();
      this.drawSheetPanel();
      this.drawBottomStatus();
      this.drawReplaceGuard();
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

    drawMainGrid() {
      const r = this.gridRect, ctx = this.ctx, pixels = this.document.activeFrame.pixels;
      const prevFrame = this.document.frames[this.document.activeFrameIndex - 1];
      const nextFrame = this.document.frames[this.document.activeFrameIndex + 1];
      ctx.fillStyle = "#fff"; ctx.fillRect(r.x, r.y, r.width, r.height);
      for (let y=0; y<this.document.rows; y+=1) {
        for (let x=0; x<this.document.cols; x+=1) {
          ctx.fillStyle = ((x+y)%2===0) ? "#f8fafc" : "#e2e8f0";
          ctx.fillRect(r.x+x*r.pixelSize, r.y+y*r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      if (this.onionSkin.prev && prevFrame) {
        ctx.fillStyle = "rgba(80, 180, 255, 0.20)";
        for (let y=0; y<this.document.rows; y+=1) {
          for (let x=0; x<this.document.cols; x+=1) {
            if (!prevFrame.pixels[y][x]) continue;
            ctx.fillRect(r.x+x*r.pixelSize, r.y+y*r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      if (this.onionSkin.next && nextFrame) {
        ctx.fillStyle = "rgba(255, 170, 80, 0.18)";
        for (let y=0; y<this.document.rows; y+=1) {
          for (let x=0; x<this.document.cols; x+=1) {
            if (!nextFrame.pixels[y][x]) continue;
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
    }

    drawPreviewPanel() {
      const p = this.controlSurface.layout.rightPanel, x = p.x + 18, y = p.y + p.height - 248, w = p.width - 36, h = 98;
      this.ctx.fillStyle = "#1a2733"; this.ctx.fillRect(x,y,w,h); this.ctx.strokeStyle = "rgba(255,255,255,0.15)"; this.ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
      this.ctx.fillStyle = "#dbe7f3"; this.ctx.font = "bold 12px Arial"; this.ctx.fillText("ANIMATION PREVIEW",x+12,y+16);
      const f = this.playback.isPlaying ? this.document.frames[this.playback.previewFrameIndex] : this.document.activeFrame;
      this.drawMiniPixels(f.pixels,x+12,y+24,72,72);
      this.ctx.font = "12px Arial";
      this.ctx.fillText("Frame "+(this.document.activeFrameIndex+1)+" / "+this.document.frames.length,x+96,y+36);
      this.ctx.fillText(this.playback.isPlaying ? "Playing" : "Paused",x+96,y+58);
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
        for (let y=0; y<this.document.rows; y+=1) {
          for (let x=0; x<this.document.cols; x+=1) {
            const v = f.pixels[y][x];
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
      const b = this.controlSurface.layout.bottomPanel, y = b.y + 78;
      const sel = this.document.selection ? `Selection ${this.document.selection.width}x${this.document.selection.height} @ ${this.document.selection.x},${this.document.selection.y}` : "No selection";
      const hover = this.hoveredGridCell ? `Cell ${this.hoveredGridCell.x},${this.hoveredGridCell.y}` : "Cell -";
      const onionStatus = `Onion P:${this.onionSkin.prev ? "On" : "Off"} N:${this.onionSkin.next ? "On" : "Off"}`;
      const toolText = `Tool: ${this.activeTool}   |   ${hover}   |   ${sel}   |   Zoom ${this.zoom.toFixed(2)}x   |   PixelPerfect ${this.viewport.pixelPerfect ? "On" : "Off"}   |   ${onionStatus}${this.controlSurface.dragFeedbackText ? "   |   " + this.controlSurface.dragFeedbackText : ""}`;
      const shortcutsText = "B/E/F/I/S tools  [ ] frame  Ctrl+D dup  Ctrl+C/X/V select  O onion prev  Shift+O onion next";
      const rightMargin = 18;
      const maxRight = b.x + b.width - rightMargin;
      this.ctx.fillStyle = "#dbe7f3"; this.ctx.font = "12px Arial";
      const toolX = maxRight - this.ctx.measureText(toolText).width;
      const shortcutsX = maxRight - this.ctx.measureText(shortcutsText).width;
      this.ctx.fillText(toolText, Math.max(b.x + 18, toolX), y);
      this.ctx.fillText(shortcutsText, Math.max(b.x + 18, shortcutsX), y+22);
      this.ctx.fillStyle = "#91a3b6";
      const dirtyText = this.isDirty ? "Modified" : "Saved";
      const nextUndo = this.history.undo.length ? this.history.undo[this.history.undo.length - 1].label : "-";
      const nextRedo = this.history.redo.length ? this.history.redo[this.history.redo.length - 1].label : "-";
      this.ctx.fillText(`State: ${dirtyText}  |  Undo: ${nextUndo}  |  Redo: ${nextRedo}`, b.x + 18, y + 44);
      this.ctx.fillStyle = performance.now() < this.flashMessageUntil ? "#4cc9f0" : "#91a3b6";
      this.ctx.fillText(this.statusMessage, b.x+b.width-360, y + 44);
    }
  }

  const canvas = document.getElementById("spriteEditorCanvas");
  const fileInput = document.getElementById("spriteEditorFileInput");
  const downloadLink = document.getElementById("spriteEditorDownloadLink");
  new SpriteEditorApp(canvas,fileInput,downloadLink);
})();
