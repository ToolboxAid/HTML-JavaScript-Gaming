function installSpriteEditorLayerMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    isLayerVisibleEffective(frame, layerIndex) {
      const resolvedFrame = this.document.ensureFrameLayers(frame || this.document.activeFrame);
      const layer = resolvedFrame.layers[layerIndex];
      if (!layer) return false;
      const solo = this.document.soloState;
      if (solo && solo.frameId === resolvedFrame.id) return solo.layerIndex === layerIndex;
      return layer.visible !== false;
    },

    canEditActiveLayer(showFeedback = true) {
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
      this.executeWithHistory("Layer Reorder Up", () => {
        const activeFrame = this.document.ensureFrameLayers(this.document.activeFrame);
        const from = activeFrame.activeLayerIndex;
        const ok = this.document.moveLayer(from, from + 1);
        this.showMessage(ok ? "Layer moved up." : "Layer already at top.");
        return ok;
      });
      this.renderAll();
    },

    moveLayerDown() {
      this.executeWithHistory("Layer Reorder Down", () => {
        const activeFrame = this.document.ensureFrameLayers(this.document.activeFrame);
        const from = activeFrame.activeLayerIndex;
        const ok = this.document.moveLayer(from, from - 1);
        this.showMessage(ok ? "Layer moved down." : "Layer already at bottom.");
        return ok;
      });
      this.renderAll();
    },

    selectLayer(index) {
      this.document.selectLayer(index);
      this.showMessage(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`);
      this.renderAll();
    },

    selectNextLayer() {
      this.document.selectNextLayer();
      this.showMessage(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`);
      this.renderAll();
    },

    selectPrevLayer() {
      this.document.selectPrevLayer();
      this.showMessage(`Layer ${this.document.activeFrame.activeLayerIndex + 1} selected.`);
      this.renderAll();
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
      this.showMessage("Frame copied.");
      this.renderAll();
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
