import { STORAGE_KEY } from "./constants.js";

function installSpriteEditorIOMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
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
      this.currentPalettePreset = "Custom";
      this.paletteWorkflow = { source: null, target: null, scope: "active_layer" };
      this.paletteSidebarScroll = 0;
      this.pan = { x: 0, y: 0 };
      this.zoom = 1;
    },

    finalizeDocumentReplacement(message) {
      this.uiDensityMode = "pro";
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
      this.requestReplaceGuard("New Document", "Replace current document with a new blank sprite?", () => {
        this.document = new this.document.constructor();
        this.resetEditorSessionState();
        this.finalizeDocumentReplacement("New document.");
        this.renderAll();
      });
      return true;
    },

    saveLocal() {
      if (!this.isDirty) {
        this.showMessage("Nothing to save.");
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        doc: this.document.buildExportPayload(),
        uiDensityMode: "pro"
      }));
      this.markCleanBaseline();
      this.showMessage("Saved locally.");
    },

    loadLocal() {
      this.requestReplaceGuard("Load Local", "Replace current document with local save?", () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          this.showMessage("No local save.");
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.doc) {
            this.importDocumentPayload(parsed.doc, "Loaded local save.");
          } else {
            this.importDocumentPayload(parsed, "Loaded local save.");
          }
        } catch (_e) {
          this.showMessage("Load failed.");
        }
      });
      this.renderAll();
    },

    openImport() {
      this.fileInput.click();
    },

    exportJson(pretty) {
      this.downloadBlob("sprite-editor.json", JSON.stringify(this.document.buildExportPayload(), null, pretty ? 2 : 0), "application/json");
      this.markCleanBaseline();
      this.showMessage("JSON exported.");
    },

    downloadBlob(name, text, mime) {
      const blob = new Blob([text], { type: mime });
      const url = URL.createObjectURL(blob);
      this.downloadLink.download = name;
      this.downloadLink.href = url;
      this.downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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
