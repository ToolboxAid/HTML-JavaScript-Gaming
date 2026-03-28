function installSpriteEditorInputMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    onPointerMove(e) {
      const p = this.logicalPointFromEvent(e);
      if (!p) return;
      if (this.timelineInteraction) {
        const idx = this.getTimelineIndexAt(p);
        if (idx !== null) {
          if (this.timelineInteraction.mode === "scrub") {
            this.selectFrame(idx);
          } else if (this.timelineInteraction.mode === "reorder") {
            this.timelineInteraction.targetIndex = idx;
            this.controlSurface.dragFeedbackText = `Timeline reorder ${this.timelineInteraction.startIndex + 1} -> ${idx + 1}`;
          }
        }
        this.renderAll();
        return;
      }
      this.timelineHoverIndex = this.getTimelineIndexAt(p);
      this.controlSurface.updateHover(p.x, p.y);
      const cell = this.getGridCellAtLogical(p.x, p.y);
      this.hoveredGridCell = cell;

      if (this.isPanning && this.panStart) {
        this.pan.x = this.panStart.baseX + (p.x - this.panStart.x);
        this.pan.y = this.panStart.baseY + (p.y - this.panStart.y);
        this.gridRect = this.computeGridRect();
        this.renderAll();
        return;
      }

      if (this.isPointerDown) {
        if (this.shapePreview && cell) {
          this.shapePreview.current = { x: cell.x, y: cell.y };
          this.renderAll();
          return;
        }
        if (this.selectionMoveSession && cell) {
          const dx = cell.x - this.selectionMoveSession.lastCell.x;
          const dy = cell.y - this.selectionMoveSession.lastCell.y;
          if (dx || dy) {
            this.moveSelectionBy(dx, dy);
            this.selectionMoveSession.lastCell = { x: cell.x, y: cell.y };
          }
          this.renderAll();
          return;
        }
        if (this.activeTool === "select" && this.selectionStart && cell) {
          this.setSelectionFromTwoCells(this.selectionStart, cell);
          this.renderAll();
          return;
        }
        if (cell && this.activeTool !== "select") {
          if (this.activeTool === "brush" || this.activeTool === "erase") {
            const erase = e.buttons === 2 || this.activeTool === "erase";
            this.applyStrokeSegment(this.strokeLastCell || cell, cell, erase);
            this.strokeLastCell = { x: cell.x, y: cell.y };
          } else {
            this.applyGridTool(cell.x, cell.y, e.buttons === 2);
          }
          this.renderAll();
        }
      } else {
        this.renderAll();
      }
    },

    onPointerDown(e) {
      if (this.isPaletteConfigurationBlocked()) {
        this.renderAll();
        return;
      }
      const p = this.logicalPointFromEvent(e);
      if (!p) return;
      if (this.helpDetailPopup.open) {
        const consumed = this.handleHelpDetailPointer(p);
        if (consumed) return;
      }
      if (this.aboutPopup.open) {
        const consumed = this.handleAboutPopupPointer(p);
        if (consumed) return;
      }
      if (this.palettePresetPopup.open) {
        const consumed = this.handlePalettePresetPopupPointer(p);
        if (consumed) return;
      }
      if (e.button === 2) {
        const canceled = this.cancelActiveInteraction();
        if (canceled) {
          this.showMessage(canceled);
          this.renderAll();
          return;
        }
      }
      if (this.isLayerRenameOpen()) {
        this.handleLayerRenamePointer(p);
        return;
      }
      if (this.replaceGuard.open) {
        this.handleReplaceGuardPointer(p);
        return;
      }
      const timelineControl = this.getTimelineControlAt(p);
      if (timelineControl) {
        if (timelineControl === "play_pause") this.togglePlayback();
        else if (timelineControl === "stop") this.stopPlayback();
        else if (timelineControl === "loop") this.togglePlaybackLoop();
        else if (timelineControl === "fps_down") this.adjustPlaybackFps(-1);
        else if (timelineControl === "fps_up") this.adjustPlaybackFps(1);
        this.renderAll();
        return;
      }
      const timelineIndex = this.getTimelineIndexAt(p);
      if (timelineIndex !== null) {
        if (e.shiftKey && e.altKey) {
          this.timelineInteraction = { mode: "reorder", startIndex: timelineIndex, targetIndex: timelineIndex };
          this.controlSurface.dragFeedbackText = `Timeline reorder ${timelineIndex + 1}`;
        } else if (e.shiftKey) {
          const anchor = this.frameRangeSelection ? this.frameRangeSelection.anchor : this.document.activeFrameIndex;
          this.setFrameRangeSelection(anchor, timelineIndex, anchor);
          this.selectFrame(timelineIndex);
          this.showMessage(`Frame range: ${Math.min(anchor, timelineIndex) + 1}-${Math.max(anchor, timelineIndex) + 1}`);
        } else {
          this.setFrameRangeSelection(timelineIndex, timelineIndex, timelineIndex);
          this.timelineInteraction = { mode: "scrub", startIndex: timelineIndex, targetIndex: timelineIndex };
          this.selectFrame(timelineIndex);
        }
        this.isPointerDown = true;
        this.renderAll();
        return;
      }

      if (e.button === 1 || e.shiftKey) {
        this.isPanning = true;
        this.panStart = { x: p.x, y: p.y, baseX: this.pan.x, baseY: this.pan.y };
        return;
      }

      const control = this.controlSurface.pointerDown(p.x, p.y);
      if (control) {
        this.renderAll();
        return;
      }

      const cell = this.getGridCellAtLogical(p.x, p.y);
      if (!cell) return;
      if (!this.ensurePaletteSelectedForEdit(false)) {
        this.showMessage("Select palette first.");
        this.renderAll();
        return;
      }
      this.isPointerDown = true;
      this.hoveredGridCell = cell;

      if (this.activeTool === "select") {
        if (this.beginSelectionMove(cell)) {
          this.isPointerDown = true;
          this.renderAll();
          return;
        }
        this.selectionStart = cell;
        this.setSelectionFromTwoCells(cell, cell);
        this.renderAll();
        return;
      }

      if (this.activeTool === "line" || this.activeTool === "rect" || this.activeTool === "fillrect") {
        if (!this.canEditActiveLayer(true)) return;
        this.shapePreview = {
          tool: this.activeTool,
          start: { x: cell.x, y: cell.y },
          current: { x: cell.x, y: cell.y },
          erase: e.button === 2
        };
        this.renderAll();
        return;
      }

      this.beginStrokeHistory(this.activeTool === "erase" || e.button === 2 ? "Erase Stroke" : "Draw Stroke");
      this.strokeLastCell = { x: cell.x, y: cell.y };
      this.applyGridTool(cell.x, cell.y, e.button === 2);
      this.renderAll();
    },

    onPointerUp(e) {
      const p = this.logicalPointFromEvent(e);
      if (this.timelineInteraction) {
        if (this.timelineInteraction.mode === "reorder") {
          const from = this.timelineInteraction.startIndex;
          const to = this.timelineInteraction.targetIndex;
          if (typeof to === "number" && from !== to) this.reorderFrame(from, to);
          else this.showMessage("Timeline reorder canceled.");
        }
        this.timelineInteraction = null;
        this.controlSurface.dragFeedbackText = "";
        this.isPointerDown = false;
        this.renderAll();
        return;
      }
      if (p && this.controlSurface.pointerUp(p.x, p.y)) this.renderAll();
      if (this.shapePreview) {
        this.commitShapePreview();
        this.shapePreview = null;
      }
      this.commitStrokeHistory();
      this.commitSelectionMove();
      this.isPointerDown = false;
      this.selectionStart = null;
      this.strokeLastCell = null;
      this.isPanning = false;
      this.panStart = null;
      if (!p || this.getTimelineIndexAt(p) === null) this.timelineHoverIndex = null;
      this.renderAll();
    },

    onWheel(e) {
      if (this.isPaletteConfigurationBlocked()) {
        e.preventDefault();
        this.renderAll();
        return;
      }
      e.preventDefault();
      const p = this.logicalPointFromEvent(e);
      const paletteRect = this.paletteSidebarMetrics;
      if (
        p &&
        paletteRect &&
        p.x >= paletteRect.x &&
        p.y >= paletteRect.y &&
        p.x <= paletteRect.x + paletteRect.w &&
        p.y <= paletteRect.y + paletteRect.h &&
        paletteRect.maxScroll > 0
      ) {
        const next = Math.max(0, Math.min(paletteRect.maxScroll, this.paletteSidebarScroll + Math.sign(e.deltaY) * Math.max(18, paletteRect.sh + paletteRect.gap)));
        if (next !== this.paletteSidebarScroll) {
          this.paletteSidebarScroll = next;
          this.renderAll();
        }
        return;
      }
      if (e.deltaY < 0) this.adjustZoom(0.25);
      else this.adjustZoom(-0.25);
    },

    onKeyDown(e) {
      if (this.isPaletteConfigurationBlocked()) {
        e.preventDefault();
        this.renderAll();
        return;
      }
      const k = (e.key || "").toLowerCase();
      if (this.isLayerRenameOpen()) {
        if (k === "enter") {
          this.confirmLayerRename();
          e.preventDefault();
          return;
        }
        if (k === "backspace") {
          this.layerRenamePrompt.text = this.layerRenamePrompt.text.slice(0, -1);
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (this.layerRenamePrompt.text.length < 40) this.layerRenamePrompt.text += e.key;
          e.preventDefault();
          this.renderAll();
          return;
        }
      }
      if (!this.isTypingTarget(e.target) && k === "backspace") {
        const canceled = this.cancelActiveInteraction();
        if (canceled) {
          this.showMessage(canceled);
          e.preventDefault();
          this.renderAll();
          return;
        }
      }
      if (this.isTypingTarget(e.target)) return;
      if (this.controlSurface.commandPaletteOpen) {
        if (k === "arrowdown") {
          this.controlSurface.moveCommandPaletteSelection(1);
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (k === "arrowup") {
          this.controlSurface.moveCommandPaletteSelection(-1);
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (k === "enter") {
          if (this.controlSurface.activateCommandPaletteSelection()) {
            e.preventDefault();
            this.renderAll();
            return;
          }
        }
        if (k === "backspace") {
          this.controlSurface.setCommandPaletteQuery(this.controlSurface.commandPaletteQuery.slice(0, -1));
          e.preventDefault();
          this.renderAll();
          return;
        }
        if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.controlSurface.setCommandPaletteQuery(this.controlSurface.commandPaletteQuery + e.key);
          e.preventDefault();
          this.renderAll();
          return;
        }
      }
      const gesture = this.getKeyGesture(e);
      const action = this.keybindings[gesture];
      if (!action) return;
      const handled = this.dispatchKeybinding(action);
      if (!handled) return;
      this.trackRecentAction(action);
      e.preventDefault();
      this.renderAll();
    }
  });
}

export { installSpriteEditorInputMethods };
