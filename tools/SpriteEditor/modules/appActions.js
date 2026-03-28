function installSpriteEditorActionMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    runHistoryResultAction(label, mutator, successMessage, failureMessage) {
      this.executeWithHistory(label, () => {
        const ok = mutator();
        this.showMessage(ok ? successMessage : failureMessage);
        return ok;
      });
      this.renderAll();
    },

    runHistoryMessageAction(label, mutator) {
      this.executeWithHistory(label, mutator);
      this.renderAll();
    },

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
        this.showMessageAndRender(scope === "selected_range" && !this.getFrameRangeSelection().explicit ? "Select a frame range first." : "No matching pixels to replace.");
        return false;
      }
      this.showMessageAndRender(`Replaced ${replacementCount} pixels.`);
      return true;
    },

    handleSelectionAction(id) {
      const isMutating = id === "sel-cut" || id === "sel-paste" || id === "sel-fliph" || id === "sel-flipv";
      if (isMutating && !this.canEditActiveLayer(true)) {
        this.renderAll();
        return;
      }
      let ok = false;
      const run = () => {
        if (id === "sel-copy") ok = this.document.copySelection();
        else if (id === "sel-cut") ok = this.document.cutSelection();
        else if (id === "sel-paste") ok = this.document.pasteSelection(this.selectionPasteOrigin.x, this.selectionPasteOrigin.y);
        else if (id === "sel-fliph") ok = this.document.flipSelection(true);
        else if (id === "sel-flipv") ok = this.document.flipSelection(false);
        else if (id === "sel-clear") ok = this.clearSelection(false);
        return ok;
      };
      if (isMutating) this.executeWithHistory("Selection Edit", run);
      else run();
      this.showMessageAndRender(ok ? "Selection updated." : "No active selection.");
    },

    clearSelection(showMessage = true) {
      if (!this.document.selection && !this.selectionMoveSession) {
        if (showMessage) this.showMessage("No active selection.");
        return false;
      }
      this.document.clearSelection();
      this.selectionMoveSession = null;
      if (showMessage) this.showMessage("Selection cleared.");
      return true;
    },

    addFrame() {
      this.runHistoryResultAction("Frame Add", () => {
        this.document.addFrame();
        return true;
      }, "Frame added.", "Frame add failed.");
    },

    duplicateFrame() {
      this.runHistoryResultAction("Frame Duplicate", () => {
        this.document.duplicateFrame();
        return true;
      }, "Frame duplicated.", "Frame duplicate failed.");
    },

    deleteFrame() {
      this.runHistoryResultAction("Frame Delete", () => this.document.deleteFrame(), "Frame deleted.", "Cannot delete last frame.");
    },

    reorderFrame(from, to) {
      this.runHistoryResultAction("Frame Reorder", () => this.document.moveFrame(from, to), "Frame reordered.", "Frame reorder failed.");
    },

    duplicateSelectedFrameRange() {
      this.runHistoryMessageAction("Frame Range Duplicate", () => {
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
    },

    deleteSelectedFrameRange() {
      this.runHistoryMessageAction("Frame Range Delete", () => {
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
    },

    shiftSelectedFrameRange(direction) {
      this.runHistoryMessageAction(direction < 0 ? "Frame Range Shift Left" : "Frame Range Shift Right", () => {
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
    },

    addLayer() {
      this.runHistoryResultAction("Layer Add", () => this.document.addLayer(), "Layer added.", "Layer add failed.");
    },

    duplicateLayer() {
      this.runHistoryResultAction("Layer Duplicate", () => this.document.duplicateLayer(), "Layer duplicated.", "Layer duplicate failed.");
    },

    deleteLayer() {
      this.runHistoryResultAction("Layer Delete", () => this.document.deleteLayer(), "Layer deleted.", "Cannot delete last layer.");
    },

    toggleLayerVisibility() {
      this.runHistoryMessageAction("Layer Visibility", () => {
        const ok = this.document.toggleLayerVisibility();
        this.showMessage(ok ? (this.document.activeLayer.visible === false ? "Layer hidden." : "Layer visible.") : "Layer visibility failed.");
        return ok;
      });
    },

    toggleLayerLock() {
      this.runHistoryMessageAction("Layer Lock", () => {
        const ok = this.document.toggleLayerLock();
        this.showMessage(ok ? (this.document.activeLayer.locked ? "Layer locked." : "Layer unlocked.") : "Layer lock failed.");
        return ok;
      });
    },

    adjustLayerOpacity(delta) {
      this.runHistoryMessageAction("Layer Opacity", () => {
        const ok = this.document.adjustActiveLayerOpacity(delta);
        if (ok) this.showMessage(`Layer opacity: ${Math.round(this.document.activeLayer.opacity * 100)}%`);
        else this.showMessage("Layer opacity unchanged.");
        return ok;
      });
    },

    resetLayerOpacity() {
      this.runHistoryMessageAction("Layer Opacity Reset", () => {
        const ok = this.document.resetActiveLayerOpacity();
        if (ok) this.showMessage("Layer opacity: 100%");
        else this.showMessage("Layer opacity already 100%.");
        return ok;
      });
    },

    toggleBlendPreview() {
      const mode = this.document.toggleBlendPreviewMode();
      this.showMessageAndRender(mode === "boost" ? "Blend preview: Boost" : "Blend preview: Normal");
    },

    mergeLayerDown() {
      this.runHistoryMessageAction("Layer Merge Down", () => {
        const ok = this.document.mergeLayerDown();
        this.showMessage(ok ? "Merged layer down." : "Merge down unavailable.");
        return ok;
      });
    },

    requestFlattenFrame() {
      this.requestReplaceGuard("Flatten Frame", "Flatten all layers in current frame into one layer?", () => {
        this.runHistoryMessageAction("Layer Flatten Frame", () => {
          const ok = this.document.flattenActiveFrame();
          this.showMessage(ok ? "Frame flattened." : "Flatten produced no changes.");
          return ok;
        });
      }, true);
      this.renderAll();
    }
  });
}

export { installSpriteEditorActionMethods };
