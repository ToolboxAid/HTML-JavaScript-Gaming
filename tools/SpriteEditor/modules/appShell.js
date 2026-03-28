import {
  FAVORITE_ACTIONS_KEY,
  MACRO_DEFINITIONS_KEY,
  RECENT_ACTIONS_KEY,
} from "./constants.js";
import { pointInRect } from "../../../engine/utils/index.js";

function installSpriteEditorShellMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    loadRecentActions() {
      const parsed = this.storage.loadJson(RECENT_ACTIONS_KEY, []);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 40) : [];
    },

    saveRecentActions() {
      this.storage.saveJson(RECENT_ACTIONS_KEY, this.recentActions.slice(0, 40));
    },

    trackRecentAction(actionId) {
      if (!actionId || actionId === "system.commandPalette") return;
      const next = [actionId].concat(this.recentActions.filter((x) => x !== actionId));
      this.recentActions = next.slice(0, 40);
      this.saveRecentActions();
    },

    isPointInRect(point, rect) {
      return pointInRect(point, rect);
    },

    clearHoverPreviewState() {
      this.timelineHoverIndex = null;
      this.hoveredGridCell = null;
      this.controlSurface.hovered = null;
    },

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
    },

    normalizeExportMode() {
      if (!["all_frames", "current_frame", "selected_range"].includes(this.exportMode)) {
        this.exportMode = "all_frames";
      }
    },

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
    },

    loadFavoriteActions() {
      const parsed = this.storage.loadJson(FAVORITE_ACTIONS_KEY, []);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 80) : [];
    },

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
    },

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
    },

    loadMacroDefinitions() {
      const builtIns = this.getBuiltInMacros().map((m) => this.normalizeMacroDefinition(m)).filter(Boolean);
      const parsed = this.storage.loadJson(MACRO_DEFINITIONS_KEY, []);
      if (!Array.isArray(parsed)) return builtIns;
      const custom = parsed.map((m) => this.normalizeMacroDefinition(m)).filter(Boolean);
      const byId = new Map();
      builtIns.forEach((m) => byId.set(m.id, m));
      custom.forEach((m) => byId.set(m.id, m));
      return Array.from(byId.values());
    },

    saveFavoriteActions() {
      this.storage.saveJson(FAVORITE_ACTIONS_KEY, this.favoriteActions.slice(0, 80));
    },

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
    },

    bindEvents() {
      if (this.fullscreen && typeof this.fullscreen.attach === "function") {
        this.fullscreen.attach(this.getFullscreenStage());
      }
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
          this.requestDocumentReplacement("Import JSON", "Replace current document with imported JSON?", () => {
            this.importDocumentPayload(payload, "Imported sprite JSON.");
          });
        } catch (_error) {
          this.showMessage("Import failed.");
        }
        this.fileInput.value = "";
      });
    },

    resize() {
      this.viewport.updateFromCanvasElement();
      this.controlSurface.rebuildLayout();
      this.gridRect = this.computeGridRect();
    },

    getFullscreenStage() {
      return this.canvas.closest(".sprite-editor-shell");
    },

    isFullscreen() {
      if (!this.fullscreen) return false;
      return !!this.fullscreen.getState().active;
    },

    async toggleFullscreen() {
      if (!this.fullscreen) {
        this.showMessage("Full screen unavailable.");
        this.renderAll();
        return;
      }
      this.fullscreen.setTarget(this.getFullscreenStage());
      const ok = this.isFullscreen()
        ? await this.fullscreen.exit()
        : await this.fullscreen.request();
      if (!ok) this.showMessage(this.fullscreen.getState().lastError || "Full screen unavailable.");
      this.renderAll();
    },

    isTypingTarget(target) {
      if (!target) return false;
      const tag = (target.tagName || "").toLowerCase();
      if (target.isContentEditable) return true;
      return tag === "input" || tag === "textarea" || tag === "select";
    },

    getKeyGesture(event) {
      const parts = [];
      if (event.ctrlKey || event.metaKey) parts.push("ctrl");
      if (event.shiftKey) parts.push("shift");
      if (event.altKey) parts.push("alt");
      parts.push((event.key || "").toLowerCase());
      return parts.join("+");
    },
  });
}

export { installSpriteEditorShellMethods };
