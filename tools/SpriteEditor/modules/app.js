import {
  FAVORITE_ACTIONS_KEY,
  MACRO_DEFINITIONS_KEY,
  RECENT_ACTIONS_KEY,
} from "./constants.js";
import { SpriteEditorViewport } from "./viewport.js";
import { SpriteEditorDocument } from "./document.js";
import { SpriteEditorCanvasControlSurface } from "./controlSurface.js";
import { installSpriteEditorPopupMethods } from "./appPopups.js";
import { installSpriteEditorMenuMethods } from "./appMenus.js";
import { installSpriteEditorRenderMethods } from "./appRender.js";
import { installSpriteEditorActionMethods } from "./appActions.js";
import { installSpriteEditorIOMethods } from "./appIO.js";
import { installSpriteEditorInputMethods } from "./appInput.js";
import { installSpriteEditorCommandMethods } from "./appCommands.js";
import { installSpriteEditorPaletteMethods } from "./appPalette.js";
import { installSpriteEditorExportMethods } from "./appExport.js";
import { installSpriteEditorTimelineMethods } from "./appTimeline.js";
import { installSpriteEditorHistoryMethods } from "./appHistory.js";

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
      this.uiDensityMode = "pro";
      this.uiDensityEffectiveMode = "pro";
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
      this.helpDetailPopup = { open: false, section: "", panelRect: null, closeRect: null };
      this.aboutPopup = { open: false, panelRect: null, closeRect: null };
      this.palettePresetPopup = { open: false, panelRect: null, closeRect: null, backRect: null, rowRects: [] };
      this.paletteSidebarScroll = 0;
      this.paletteSidebarMetrics = null;
      this.paletteSortMode = "name";
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

    isPointInRect(point, rect) {
      return !!(point && rect && point.x >= rect.x && point.y >= rect.y && point.x <= rect.x + rect.w && point.y <= rect.y + rect.h);
    }

    getPaletteLibrary() {
      return (typeof globalThis.palettesList === "object" && globalThis.palettesList) ? globalThis.palettesList : null;
    }

    clearHoverPreviewState() {
      this.timelineHoverIndex = null;
      this.hoveredGridCell = null;
      this.controlSurface.hovered = null;
    }
    cancelActiveInteraction() {
      if (this.timelineInteraction) {
        this.timelineInteraction = null;
        this.controlSurface.dragFrameIndex = null;
        this.controlSurface.dragOverFrameIndex = null;
        this.controlSurface.dragFeedbackText = "";
        this.clearHoverPreviewState();
        this.isPointerDown = false;
        return "Timeline interaction canceled.";
      }
      if (this.selectionMoveSession) {
        this.selectionMoveSession = null;
        this.isPointerDown = false;
        return "Selection move canceled.";
      }
      if (this.activeStrokeHistory) {
        this.restoreHistoryState(this.activeStrokeHistory.before);
        this.activeStrokeHistory = null;
        this.shapePreview = null;
        this.strokeLastCell = null;
        this.selectionStart = null;
        this.isPointerDown = false;
        return "Drawing canceled.";
      }
      if (this.shapePreview) {
        this.shapePreview = null;
        this.selectionStart = null;
        this.isPointerDown = false;
        return "Shape preview canceled.";
      }
      if (this.selectionStart) {
        this.selectionStart = null;
        this.isPointerDown = false;
        return "Transient selection canceled.";
      }
      if (this.isPanning) {
        this.isPanning = false;
        this.panStart = null;
        return "Pan canceled.";
      }
      return "";
    }
    normalizeExportMode() {
      if (!["all_frames", "current_frame", "selected_range"].includes(this.exportMode)) {
        this.exportMode = "all_frames";
      }
    }
    normalizeEditorState() {
      this.document.ensureDocumentState();
      this.normalizeExportMode();
      this.sanitizeSoloState();
      this.sanitizeFrameRangeSelection();
      this.sanitizePlaybackRange();
      this.playback.previewFrameIndex = Math.max(0, Math.min(this.playback.previewFrameIndex || 0, this.document.frames.length - 1));
      if (this.selectionMoveSession && !this.document.selection) this.selectionMoveSession = null;
      if (this.hoveredGridCell && (this.hoveredGridCell.x < 0 || this.hoveredGridCell.y < 0 || this.hoveredGridCell.x >= this.document.cols || this.hoveredGridCell.y >= this.document.rows)) {
        this.hoveredGridCell = null;
      }
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

    getToolLabel(tool) {
      const labels = {
        brush: "Brush",
        erase: "Erase",
        fill: "Fill",
        line: "Line",
        rect: "Rectangle",
        fillrect: "Fill Rectangle",
        eyedropper: "Eyedropper",
        select: "Select"
      };
      return labels[tool] || String(tool || "Tool");
    }
    getActiveToolDescription() {
      const map = {
        brush: { primary: "Paint pixels with the active color.", secondary: "Drag for continuous strokes. 1-9 changes size." },
        erase: { primary: "Remove pixels from the active layer.", secondary: "Right-click also erases while drawing." },
        fill: { primary: "Flood fill connected pixels.", secondary: "Use when you want solid retro regions fast." },
        line: { primary: "Draw a straight pixel-perfect line.", secondary: "Click and drag to preview before committing." },
        rect: { primary: "Draw a rectangle outline.", secondary: "Drag to size the shape before release." },
        fillrect: { primary: "Draw a filled rectangle.", secondary: "Good for blocks, panels, and tile silhouettes." },
        eyedropper: { primary: "Sample a color from artwork.", secondary: "Click any painted cell to set the active color." },
        select: { primary: "Create or move a rectangular selection.", secondary: "Use arrows to nudge after selecting." }
      };
      return map[this.activeTool] || { primary: "Choose a tool from the top Tools menu.", secondary: "Tool details appear here while you work." };
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

    adjustZoom(delta) {
      this.zoom = Math.max(0.5, Math.min(8, Number((this.zoom + delta).toFixed(2))));
      this.gridRect = this.computeGridRect();
      this.showMessage("Zoom: " + this.zoom.toFixed(2) + "x");
      this.renderAll();
    }

    resizeDocumentGrid(nextCols, nextRows) {
      return this.executeWithHistory(`Grid Resize ${nextCols}x${nextRows}`, () => {
        const cols = Math.max(1, Math.min(256, Math.floor(Number(nextCols) || this.document.cols)));
        const rows = Math.max(1, Math.min(256, Math.floor(Number(nextRows) || this.document.rows)));
        if (cols === this.document.cols && rows === this.document.rows) return false;
        const resizeGrid = (source) => {
          const out = Array.from({ length: rows }, (_row, y) =>
            Array.from({ length: cols }, (_col, x) => (source && source[y] && typeof source[y][x] !== "undefined") ? source[y][x] : null)
          );
          return out;
        };
        this.document.frames.forEach((frame) => {
          const normalized = this.document.ensureFrameLayers(frame);
          normalized.layers.forEach((layer) => {
            layer.pixels = resizeGrid(layer.pixels);
          });
        });
        this.document.cols = cols;
        this.document.rows = rows;
        this.document.clearSelection();
        this.gridRect = this.computeGridRect();
        this.showMessage(`Grid size: ${cols} x ${rows}`);
        return true;
      });
    }

    adjustGridCols(delta) {
      const next = this.document.cols + delta;
      const ok = this.resizeDocumentGrid(next, this.document.rows);
      if (!ok) this.showMessage("Grid columns unchanged.");
      this.renderAll();
      return ok;
    }

    adjustGridRows(delta) {
      const next = this.document.rows + delta;
      const ok = this.resizeDocumentGrid(this.document.cols, next);
      if (!ok) this.showMessage("Grid rows unchanged.");
      this.renderAll();
      return ok;
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
      this.brush.size = Math.max(1, Math.min(9, Math.floor(size || 1)));
      this.showMessage(`Brush size: ${this.brush.size}`);
      this.renderAll();
    }
    adjustBrushSize(delta) { this.setBrushSize(this.brush.size + delta); }
    toggleBrushShape() {
      this.brush.shape = this.brush.shape === "square" ? "circle" : "square";
      this.showMessage(`Brush shape: ${this.brush.shape}`);
      this.renderAll();
    }
    toggleMirror() { this.mirror = !this.mirror; this.showMessage(this.mirror ? "Mirror on." : "Mirror off."); this.renderAll(); }
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
    syncCurrentPalettePreset() {
      const paletteLibrary = this.getPaletteLibrary();
      if (!paletteLibrary) {
        this.currentPalettePreset = "Custom";
        return;
      }
      const paletteSig = JSON.stringify(this.document.palette || []);
      const names = Object.keys(paletteLibrary);
      for (let i = 0; i < names.length; i += 1) {
        const entries = paletteLibrary[names[i]];
        if (!Array.isArray(entries)) continue;
        const hexes = entries.map((entry) => entry && entry.hex).filter((hex) => typeof hex === "string");
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
        const ok = this.document.moveLayer(from, from + 1);
        this.showMessage(ok ? "Layer moved up." : "Layer already at top.");
        return ok;
      });
      this.renderAll();
    }
    moveLayerDown() {
      this.executeWithHistory("Layer Reorder Down", () => {
        const af = this.document.ensureFrameLayers(this.document.activeFrame);
        const from = af.activeLayerIndex;
        const ok = this.document.moveLayer(from, from - 1);
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

    showMessage(m) { this.statusMessage = m; this.flashMessageUntil = performance.now() + 1800; }
}

installSpriteEditorPopupMethods(SpriteEditorApp);
installSpriteEditorMenuMethods(SpriteEditorApp);
installSpriteEditorRenderMethods(SpriteEditorApp);
installSpriteEditorActionMethods(SpriteEditorApp);
installSpriteEditorIOMethods(SpriteEditorApp);
installSpriteEditorInputMethods(SpriteEditorApp);
installSpriteEditorCommandMethods(SpriteEditorApp);
installSpriteEditorPaletteMethods(SpriteEditorApp);
installSpriteEditorExportMethods(SpriteEditorApp);
installSpriteEditorTimelineMethods(SpriteEditorApp);
installSpriteEditorHistoryMethods(SpriteEditorApp);

export { SpriteEditorApp };
