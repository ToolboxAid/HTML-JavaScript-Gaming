import { drawCanvasCheckerboard } from "../../../engine/ui/index.js";

function installSpriteEditorExportMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    getExportModeLabel() {
      if (this.exportMode === "current_frame") return "Current Frame";
      if (this.exportMode === "selected_range") return "Selected Range";
      return "All Frames";
    },

    setExportMode(mode) {
      if (!["all_frames", "current_frame", "selected_range"].includes(mode)) {
        this.showMessage("Export mode unavailable.");
        return false;
      }
      this.exportMode = mode;
      this.showMessage(`Export mode: ${this.getExportModeLabel()}`);
      this.renderAll();
      return true;
    },

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
    },

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
        palettePreset: this.currentPalettePreset || "default",
        palette: (this.document.palette || []).slice(),
        layerExport: "composited_visible_only",
        soloIgnored: true
      };
    },

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
    },

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
    },

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
      if (this.document.sheet.transparent) drawCanvasCheckerboard(ctx, { x: 0, y: 0, w: plc.width, h: plc.height }, 4);
      else {
        ctx.fillStyle = this.document.sheet.backgroundColor;
        ctx.fillRect(0, 0, plc.width, plc.height);
      }
      context.frames.forEach((frame, i) => {
        const entry = plc.entries[i];
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            const value = frame.pixels[y][x];
            if (!value) continue;
            ctx.fillStyle = value;
            ctx.fillRect(entry.x + x, entry.y + y, 1, 1);
          }
        }
      });
      this.downloadLink.download = `sprite-sheet-${mode}.png`;
      this.downloadLink.href = temp.toDataURL("image/png");
      this.downloadLink.click();
      this.showMessage(`Sprite sheet exported (${context.modeLabel}).`);
      return true;
    },

    exportAnimationJson(mode = this.exportMode) {
      const data = this.buildAnimationExportData(mode);
      if (!data) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Animation export unavailable.");
        return false;
      }
      const ok = this.downloads.downloadText(`animation-${mode}.json`, JSON.stringify(data, null, 2), "application/json");
      if (!ok) {
        this.showMessage("Animation export unavailable.");
        return false;
      }
      this.showMessage(`Animation JSON exported (${data.frameCount} frames).`);
      return true;
    },

    exportPackageJson(mode = this.exportMode) {
      const data = this.buildExportPackageData(mode);
      if (!data) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Export package unavailable.");
        return false;
      }
      const ok = this.downloads.downloadText(`export-package-${mode}.json`, JSON.stringify(data, null, 2), "application/json");
      if (!ok) {
        this.showMessage("Export package unavailable.");
        return false;
      }
      this.showMessage(`Export package saved (${data.exportMode}).`);
      return true;
    }
  });
}

export { installSpriteEditorExportMethods };
