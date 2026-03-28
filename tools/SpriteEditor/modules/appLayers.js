function installSpriteEditorLayerMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    reorderActiveLayer(delta, actionLabel, successMessage, failureMessage) {
      this.executeWithHistory(actionLabel, () => {
        const activeFrame = this.document.ensureFrameLayers(this.document.activeFrame);
        const from = activeFrame.activeLayerIndex;
        const ok = this.document.moveLayer(from, from + delta);
        this.showMessage(ok ? successMessage : failureMessage);
        return ok;
      });
      this.renderAll();
    },

    announceActiveLayerSelection() {
      this.showMessageAndRender(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`);
    },

    isLayerVisibleEffective(frame, layerIndex) {
      const resolvedFrame = this.document.ensureFrameLayers(frame || this.document.activeFrame);
      const layer = resolvedFrame.layers[layerIndex];
      if (!layer) return false;
      const solo = this.document.soloState;
      if (solo && solo.frameId === resolvedFrame.id) return solo.layerIndex === layerIndex;
      return layer.visible !== false;
    },

    canEditActiveLayer(showFeedback = true) {
      if (!this.ensurePaletteSelectedForEdit(showFeedback)) return false;
      const layer = this.document.activeLayer;
      if (layer && layer.locked) {
        if (showFeedback) this.showMessage(`Layer locked: ${layer.name}`);
        return false;
      }
      return true;
    },

    sanitizeSoloState() {
      const solo = this.document.soloState;
      if (!solo) return;
      const frame = this.document.frames.find((entry) => entry.id === solo.frameId);
      if (!frame) {
        this.document.soloState = null;
        return;
      }
      const normalizedFrame = this.document.ensureFrameLayers(frame);
      if (solo.layerIndex < 0 || solo.layerIndex >= normalizedFrame.layers.length) {
        this.document.soloState = null;
      }
    },

    moveLayerUp() {
      this.reorderActiveLayer(1, "Layer Reorder Up", "Layer moved up.", "Layer already at top.");
    },

    moveLayerDown() {
      this.reorderActiveLayer(-1, "Layer Reorder Down", "Layer moved down.", "Layer already at bottom.");
    },

    selectLayer(index) {
      this.document.selectLayer(index);
      this.announceActiveLayerSelection();
    },

    selectNextLayer() {
      this.document.selectNextLayer();
      this.announceActiveLayerSelection();
    },

    selectPrevLayer() {
      this.document.selectPrevLayer();
      this.announceActiveLayerSelection();
    },

    selectFrame(index) {
      this.document.activeFrameIndex = Math.max(0, Math.min(index, this.document.frames.length - 1));
      this.document.ensureFrameLayers(this.document.activeFrame);
      this.playback.previewFrameIndex = this.document.activeFrameIndex;
      this.document.clearSelection();
      this.renderAll();
    },

    copyFrame() {
      this.document.copyFrame();
      this.showMessageAndRender("Frame copied.");
    },

    pasteFrame() {
      this.executeWithHistory("Frame Paste", () => {
        const ok = this.document.pasteFrame();
        this.showMessage(ok ? "Frame pasted." : "No copied frame.");
        return ok;
      });
      this.renderAll();
    }
  });
}

export { installSpriteEditorLayerMethods };
