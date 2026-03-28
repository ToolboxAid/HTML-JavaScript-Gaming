function installSpriteEditorHistoryMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    cloneGridData(grid) {
      if (!Array.isArray(grid)) return null;
      return grid.map((row) => Array.isArray(row) ? row.slice() : row);
    },

    cloneFrameClipboardData(clip) {
      if (!clip || !Array.isArray(clip.layers)) return null;
      return {
        activeLayerIndex: clip.activeLayerIndex || 0,
        layers: clip.layers.map((layer, i) => ({
          name: layer.name || `Layer ${i + 1}`,
          visible: layer.visible !== false,
          locked: layer.locked === true,
          opacity: typeof layer.opacity === "number" ? layer.opacity : 1,
          pixels: this.cloneGridData(layer.pixels || this.document.makeGrid())
        }))
      };
    },

    captureHistoryState() {
      const selection = this.document.selection ? { ...this.document.selection } : null;
      const selectionClipboard = this.document.selectionClipboard ? {
        width: this.document.selectionClipboard.width,
        height: this.document.selectionClipboard.height,
        pixels: this.cloneGridData(this.document.selectionClipboard.pixels)
      } : null;
      return {
        doc: this.document.buildExportPayload(),
        activeFrameIndex: this.document.activeFrameIndex,
        selection,
        selectionClipboard,
        frameClipboard: this.cloneFrameClipboardData(this.document.frameClipboard),
        soloState: this.document.soloState ? { ...this.document.soloState } : null,
        frameRangeSelection: this.frameRangeSelection ? { ...this.frameRangeSelection } : null
      };
    },

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
    },

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
    },

    pushHistoryEntry(entry) {
      if (!entry || !entry.before || !entry.after) return;
      this.history.undo.push(entry);
      if (this.history.undo.length > this.history.maxEntries) this.history.undo.shift();
      this.history.redo = [];
      this.updateDirtyState();
    },

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
    },

    beginStrokeHistory(label) {
      if (this.activeStrokeHistory) return;
      this.activeStrokeHistory = { label, before: this.captureHistoryState() };
    },

    commitStrokeHistory() {
      if (!this.activeStrokeHistory) return;
      const after = this.captureHistoryState();
      if (this.historySignature(this.activeStrokeHistory.before) !== this.historySignature(after)) {
        this.pushHistoryEntry({ label: this.activeStrokeHistory.label, before: this.activeStrokeHistory.before, after });
      }
      this.activeStrokeHistory = null;
    },

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
    },

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
    },

    updateDirtyState() {
      this.isDirty = this.historySignature(this.captureHistoryState()) !== this.dirtyBaselineSignature;
    },

    markCleanBaseline() {
      this.dirtyBaselineSignature = this.historySignature(this.captureHistoryState());
      this.updateDirtyState();
    },

    clearHistoryStacks() {
      this.history.undo = [];
      this.history.redo = [];
    },

    isCellInsideSelection(cell) {
      const selection = this.document.selection;
      if (!selection || !cell) return false;
      return cell.x >= selection.x && cell.y >= selection.y && cell.x < selection.x + selection.width && cell.y < selection.y + selection.height;
    },

    moveSelectionBy(dx, dy) {
      const session = this.selectionMoveSession;
      const sourceRect = session && session.sourceRect ? session.sourceRect : this.document.selection;
      if (!sourceRect || (!dx && !dy)) return false;
      const nextOffsetX = (session ? session.offsetX : 0) + dx;
      const nextOffsetY = (session ? session.offsetY : 0) + dy;
      const maxLeft = -sourceRect.x;
      const maxRight = this.document.cols - (sourceRect.x + sourceRect.width);
      const maxUp = -sourceRect.y;
      const maxDown = this.document.rows - (sourceRect.y + sourceRect.height);
      const clampedOffsetX = Math.max(maxLeft, Math.min(maxRight, nextOffsetX));
      const clampedOffsetY = Math.max(maxUp, Math.min(maxDown, nextOffsetY));
      if (session) {
        if (clampedOffsetX === session.offsetX && clampedOffsetY === session.offsetY) return false;
        session.offsetX = clampedOffsetX;
        session.offsetY = clampedOffsetY;
        return true;
      }
      return false;
    },

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
    },

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
    },

    nudgeSelection(dx, dy, step) {
      if (!this.canEditActiveLayer(true)) return false;
      return this.executeWithHistory(`Selection Nudge ${step}`, () => this.moveSelectionBy(dx, dy));
    }
  });
}

export { installSpriteEditorHistoryMethods };
