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
        this.normalizeEditorState();
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
      const b = this.controlSurface.layout.bottomPanel;
      const x = Math.max(b.x + 18, b.x + b.width - 420);
      const y = b.y + 14;
      const w = Math.min(402, b.width - 36);
      const h = 100;
      const transportX = x + 8;
      const transportY = y + 6;
      const transportW = 58;
      const transportH = 16;
      const transportGap = 4;
      const transport = [
        { id: "play_pause", x: transportX, y: transportY, w: transportW, h: transportH },
        { id: "stop", x: transportX, y: transportY + (transportH + transportGap), w: transportW, h: transportH },
        { id: "loop", x: transportX, y: transportY + (transportH + transportGap) * 2, w: transportW, h: transportH },
        { id: "fps_down", x: x + w - 92, y: transportY, w: 20, h: transportH },
        { id: "fps_up", x: x + w - 24, y: transportY, w: 20, h: transportH }
      ];
      const innerX = x + 76;
      const innerY = y + 40;
      const innerW = w - 84;
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
    isCellInsideSelection(cell) {
      const s = this.document.selection;
      if (!s || !cell) return false;
      return cell.x >= s.x && cell.y >= s.y && cell.x < s.x + s.width && cell.y < s.y + s.height;
    }

    moveSelectionBy(dx, dy) {
      const session = this.selectionMoveSession;
      const s = session && session.sourceRect ? session.sourceRect : this.document.selection;
      if (!s || (!dx && !dy)) return false;
      const nextOffsetX = (session ? session.offsetX : 0) + dx;
      const nextOffsetY = (session ? session.offsetY : 0) + dy;
      const maxLeft = -s.x;
      const maxRight = this.document.cols - (s.x + s.width);
      const maxUp = -s.y;
      const maxDown = this.document.rows - (s.y + s.height);
      const clampedOffsetX = Math.max(maxLeft, Math.min(maxRight, nextOffsetX));
      const clampedOffsetY = Math.max(maxUp, Math.min(maxDown, nextOffsetY));
      if (session) {
        if (clampedOffsetX === session.offsetX && clampedOffsetY === session.offsetY) return false;
        session.offsetX = clampedOffsetX;
        session.offsetY = clampedOffsetY;
        return true;
      }
      return false;
    }

    beginSelectionMove(cell) {
      if (!this.isCellInsideSelection(cell)) return false;
      if (!this.canEditActiveLayer(true)) return false;
      const block = this.document.readSelection();
      if (!block) return false;
      const sourceRect = { ...this.document.selection };
      this.selectionMoveSession = {
        before: this.captureHistoryState(),
        sourceRect,
        block: {
          width: block.width,
          height: block.height,
          pixels: this.cloneGridData(block.pixels)
        },
        offsetX: 0,
        offsetY: 0,
        startCell: { x: cell.x, y: cell.y },
        lastCell: { x: cell.x, y: cell.y }
      };
      return true;
    }

    commitSelectionMove() {
      if (!this.selectionMoveSession) return;
      const session = this.selectionMoveSession;
      const sourceRect = session.sourceRect;
      const offsetX = session.offsetX || 0;
      const offsetY = session.offsetY || 0;
      if (!sourceRect) {
        this.selectionMoveSession = null;
        return;
      }
      if (offsetX || offsetY) {
        const frame = this.document.activeLayer.pixels;
        for (let y = 0; y < sourceRect.height; y += 1) {
          for (let x = 0; x < sourceRect.width; x += 1) {
            frame[sourceRect.y + y][sourceRect.x + x] = null;
          }
        }
        const nx = sourceRect.x + offsetX;
        const ny = sourceRect.y + offsetY;
        for (let y = 0; y < session.block.height; y += 1) {
          for (let x = 0; x < session.block.width; x += 1) {
            frame[ny + y][nx + x] = session.block.pixels[y][x];
          }
        }
        this.document.setSelection({ x: nx, y: ny, width: sourceRect.width, height: sourceRect.height });
        this.selectionPasteOrigin = { x: nx, y: ny };
      }
      const after = this.captureHistoryState();
      if (this.historySignature(session.before) !== this.historySignature(after)) {
        this.pushHistoryEntry({ label: "Selection Move", before: session.before, after });
      }
      this.selectionMoveSession = null;
    }

    nudgeSelection(dx, dy, step) {
      if (!this.canEditActiveLayer(true)) return false;
      return this.executeWithHistory(`Selection Nudge ${step}`, () => this.moveSelectionBy(dx, dy));
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
        "6": "brush.size_6",
        "7": "brush.size_7",
        "8": "brush.size_8",
        "9": "brush.size_9",
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
        "ctrl+p": "system.commandPalette",
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
        "backspace": "system.cancelInteraction",
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
        { id: "system.commandPalette", label: "System: Toggle Command Palette", category: "System", keywords: ["command", "search"], aliases: ["command palette", "open command search", "toggle command palette"] },
        { id: "system.closeSurface", label: "System: Close Surface", category: "System", keywords: ["close", "menu", "palette", "overlay"], aliases: ["close menu", "close palette", "close overlay"] },
        { id: "system.cancelInteraction", label: "System: Cancel Interaction", category: "System", keywords: ["cancel", "interaction", "brush", "drag", "pan"], aliases: ["cancel interaction", "cancel drag", "cancel drawing"] }
      ];
      const list = this.getPaletteLibrary();
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

    applyNamedPalette(paletteName) {
      return this.executeWithHistory(`Apply Palette: ${paletteName}`, () => {
        const paletteLibrary = this.getPaletteLibrary();
        if (!paletteLibrary || !Array.isArray(paletteLibrary[paletteName])) return false;
        const next = paletteLibrary[paletteName]
          .map((entry) => entry && entry.hex)
          .filter((hex) => typeof hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(hex));
        if (!next.length) return false;
        this.document.palette = next;
        this.paletteSidebarScroll = 0;
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
        if (this.controlSurface.commandPaletteOpen) {
          this.controlSurface.closeCommandPalette();
          this.showMessage("Command palette closed.");
        } else {
          this.openCommandPalette();
        }
        return true;
      }
      if (action === "system.closeSurface") {
        return this.handleCloseSurfaceAction();
      }
      if (action === "system.saveLocal") { this.saveLocal(); return true; }
      if (action === "system.loadLocal") { this.loadLocal(); return true; }
      if (action === "system.importJson") { this.openImport(); return true; }
      if (action === "system.undo") return this.undoHistory();
      if (action === "system.redo") return this.redoHistory();
      if (action === "system.cancelInteraction") {
        const canceled = this.cancelActiveInteraction();
        if (canceled) {
          this.showMessage(canceled);
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

    toggleDensityMode() {
      this.uiDensityMode = "pro";
      this.uiDensityEffectiveMode = "pro";
      this.showMessage("Mode locked to Pro.");
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
    colorHexToHsl(hex) {
      if (typeof hex !== "string" || !/^#[0-9a-fA-F]{6,8}$/.test(hex)) return { h: 0, s: 0, l: 0 };
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d) + (g < b ? 6 : 0); break;
          case g: h = ((b - r) / d) + 2; break;
          default: h = ((r - g) / d) + 4; break;
        }
        h /= 6;
      }
      return { h, s, l };
    }
    getPaletteDisplayEntries() {
      const palette = Array.isArray(this.document.palette) ? this.document.palette : [];
      const paletteLibrary = this.getPaletteLibrary();
      const presetEntries = (paletteLibrary && this.currentPalettePreset && Array.isArray(paletteLibrary[this.currentPalettePreset]))
        ? paletteLibrary[this.currentPalettePreset]
        : null;
      const entries = palette.map((hex, index) => {
        const presetEntry = presetEntries && presetEntries[index] ? presetEntries[index] : null;
        const name = presetEntry && typeof presetEntry.name === "string" && presetEntry.name.trim() ? presetEntry.name.trim() : hex;
        const hsl = this.colorHexToHsl(hex);
        return { hex, index, name, h: hsl.h, s: hsl.s, l: hsl.l };
      });
      const mode = this.paletteSortMode || "name";
      const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
      entries.sort((a, b) => {
        if (mode === "name") {
          const cmp = collator.compare(a.name, b.name);
          if (cmp !== 0) return cmp;
        } else if (mode === "hue") {
          if (a.h !== b.h) return a.h - b.h;
          if (a.s !== b.s) return a.s - b.s;
          if (a.l !== b.l) return a.l - b.l;
        } else if (mode === "saturation") {
          if (a.s !== b.s) return a.s - b.s;
          if (a.h !== b.h) return a.h - b.h;
          if (a.l !== b.l) return a.l - b.l;
        } else if (mode === "lightness") {
          if (a.l !== b.l) return a.l - b.l;
          if (a.h !== b.h) return a.h - b.h;
          if (a.s !== b.s) return a.s - b.s;
        }
        return a.index - b.index;
      });
      return entries;
    }
    getCurrentColorDisplayText() {
      const currentHex = String(this.document.currentColor || "").toUpperCase();
      let name = "";
      const paletteLibrary = this.getPaletteLibrary();
      if (paletteLibrary && this.currentPalettePreset && Array.isArray(paletteLibrary[this.currentPalettePreset])) {
        const presetEntries = paletteLibrary[this.currentPalettePreset];
        const match = presetEntries.find((entry) => entry && String(entry.hex || "").toUpperCase() === currentHex && typeof entry.name === "string" && entry.name.trim());
        if (match) name = match.name.trim();
      }
      return `Current: ${currentHex}  ■   Named: ${name || "Unnamed"}`;
    }
    setCurrentColor(c) { this.document.currentColor = c; this.showMessage("Color selected."); }
    setPaletteSortMode(mode) {
      if (!["name", "hue", "saturation", "lightness"].includes(mode)) return false;
      if (this.paletteSortMode === mode) return false;
      this.paletteSortMode = mode;
      this.paletteSidebarScroll = 0;
      this.showMessage(`Palette sort: ${mode[0].toUpperCase()}${mode.slice(1)}.`);
      this.renderAll();
      return true;
    }
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
    getExportModeLabel() {
      if (this.exportMode === "current_frame") return "Current Frame";
      if (this.exportMode === "selected_range") return "Selected Range";
      return "All Frames";
    }
    setExportMode(mode) {
      if (!["all_frames", "current_frame", "selected_range"].includes(mode)) {
        this.showMessage("Export mode unavailable.");
        return false;
      }
      this.exportMode = mode;
      this.showMessage(`Export mode: ${this.getExportModeLabel()}`);
      this.renderAll();
      return true;
    }
    getExportFrameIndices(mode = this.exportMode) {
      this.normalizeEditorState();
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
      const validIndices = indices.filter((index) => Number.isInteger(index) && index >= 0 && index < this.document.frames.length);
      if (!validIndices.length) return null;
      const frames = validIndices.map((index, order) => {
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
        indices: validIndices,
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
    toggleMirror() { this.mirror = !this.mirror; this.showMessage(this.mirror ? "Mirror on." : "Mirror off."); this.renderAll(); }
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

    showMessage(m) { this.statusMessage = m; this.flashMessageUntil = performance.now() + 1800; }
}

installSpriteEditorPopupMethods(SpriteEditorApp);
installSpriteEditorMenuMethods(SpriteEditorApp);
installSpriteEditorRenderMethods(SpriteEditorApp);
installSpriteEditorActionMethods(SpriteEditorApp);
installSpriteEditorIOMethods(SpriteEditorApp);
installSpriteEditorInputMethods(SpriteEditorApp);

export { SpriteEditorApp };
