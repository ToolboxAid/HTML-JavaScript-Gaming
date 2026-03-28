import { STORAGE_KEY } from "./constants.js";

function installSpriteEditorIOMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    requestDocumentReplacement(title, message, onReplace) {
      this.requestReplaceGuard(title, message, onReplace);
      this.renderAll();
      return true;
    },

    getStoredDocumentPayload(parsed) {
      if (parsed && parsed.doc) return parsed.doc;
      return parsed;
    },

    resetEditorSessionState() {
      this.activeTool = "brush";
      this.hoveredGridCell = null;
      this.selectionStart = null;
      this.selectionPasteOrigin = { x: 0, y: 0 };
      this.selectionMoveSession = null;
      this.timelineInteraction = null;
      this.timelineHoverIndex = null;
      this.frameRangeSelection = null;
      this.playbackRange = { enabled: false, startFrame: 0, endFrame: 0 };
      this.playback = { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, lastTick: 0 };
      this.strokeLastCell = null;
      this.shapePreview = null;
      this.currentPalettePreset = "default";
      this.paletteWorkflow = { source: null, target: null, scope: "active_layer" };
      this.paletteSidebarScroll = 0;
      this.pan = { x: 0, y: 0 };
      this.zoom = 1;
    },

    finalizeDocumentReplacement(message) {
      this.uiDensityEffectiveMode = "pro";
      this.clearHistoryStacks();
      this.normalizeEditorState();
      this.markCleanBaseline();
      this.showMessage(message);
    },

    importDocumentPayload(payload, successMessage) {
      this.document.importPayload(payload);
      this.finalizeDocumentReplacement(successMessage);
    },

    newDocument() {
      return this.requestDocumentReplacement("New Document", "Replace current document with a new blank sprite?", () => {
        this.document = new this.document.constructor();
        this.resetEditorSessionState();
        this.finalizeDocumentReplacement("New document.");
      });
    },

    saveLocal() {
      if (!this.isDirty) {
        this.showMessage("Nothing to save.");
        return;
      }
      const ok = this.storage.saveJson(STORAGE_KEY, {
        doc: this.document.buildExportPayload()
      });
      if (!ok) {
        this.showMessage("Save unavailable.");
        return false;
      }
      this.markCleanBaseline();
      this.showMessage("Saved locally.");
      return true;
    },

    loadLocal() {
      return this.requestDocumentReplacement("Load Local", "Replace current document with local save?", () => {
        const stored = this.storage.loadJson(STORAGE_KEY, null);
        if (!stored) {
          this.showMessage("No local save.");
          return;
        }
        try {
          this.importDocumentPayload(this.getStoredDocumentPayload(stored), "Loaded local save.");
        } catch (_e) {
          this.showMessage("Load failed.");
        }
      });
    },

    openImport() {
      this.fileInput.click();
    },

    exportJson(pretty) {
      const ok = this.downloads.downloadText(
        "sprite-editor.json",
        JSON.stringify(this.document.buildExportPayload(), null, pretty ? 2 : 0),
        "application/json"
      );
      if (!ok) {
        this.showMessage("JSON export unavailable.");
        return false;
      }
      this.markCleanBaseline();
      this.showMessage("JSON exported.");
      return true;
    },

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
  });
}

export { installSpriteEditorIOMethods };
