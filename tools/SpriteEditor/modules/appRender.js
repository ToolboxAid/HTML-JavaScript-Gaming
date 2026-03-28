function installSpriteEditorRenderMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    renderAll() {
      this.normalizeEditorState();
      this.syncCurrentPalettePreset();
      this.updateDirtyState();
      this.controlSurface.rebuildLayout();
      this.gridRect = this.computeGridRect();
      this.timelineStripRect = this.computeTimelineLayout();
      this.controlSurface.draw(this.ctx);
      this.drawMainGrid();
      this.drawTimelinePanel();
      this.drawPreviewPanel();
      this.drawSheetPanel();
      this.controlSurface.drawOverflowPanel(this.ctx);
      this.controlSurface.drawCommandPalette(this.ctx);
      this.drawHelpDetailPopup();
      this.drawAboutPopup();
      this.drawPalettePresetPopup();
      this.drawReplaceGuard();
      this.drawLayerRenamePrompt();
    },

    drawTimelinePanel() {
      const t = this.timelineStripRect;
      if (!t) return;
      const ctx = this.ctx;
      ctx.fillStyle = "#1a2733";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 12px Arial";
      ctx.fillText("TIMELINE", t.x + 78, t.y + 14);
      (t.transport || []).forEach((c) => {
        ctx.fillStyle = "#1a2733";
        if (c.id === "play_pause" && this.playback.isPlaying) ctx.fillStyle = "#244d67";
        if (c.id === "loop" && this.playback.loop) ctx.fillStyle = "#244d67";
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "11px Arial";
        if (c.id === "play_pause") ctx.fillText(this.playback.isPlaying ? "Pause" : "Play", c.x + 8, c.y + 12);
        else if (c.id === "stop") ctx.fillText("Stop", c.x + 8, c.y + 12);
        else if (c.id === "loop") ctx.fillText("Loop", c.x + 9, c.y + 12);
        else if (c.id === "fps_down") {
          const textW = ctx.measureText("-").width;
          ctx.fillText("-", c.x + Math.floor((c.w - textW) * 0.5), c.y + c.h / 2);
        } else if (c.id === "fps_up") {
          const textW = ctx.measureText("+").width;
          ctx.fillText("+", c.x + Math.floor((c.w - textW) * 0.5), c.y + c.h / 2);
        }
      });
      ctx.fillStyle = "#91a3b6";
      ctx.font = "11px Arial";
      const fpsControl = (t.transport || []).find((c) => c.id === "fps_down");
      const fpsY = fpsControl ? (fpsControl.y + fpsControl.h / 2) : (t.y + 14);
      ctx.fillText(`FPS ${this.playback.fps}`, t.x + t.w - 62, fpsY);
      t.slots.forEach((slot) => {
        const f = this.document.frames[slot.index];
        const active = slot.index === this.document.activeFrameIndex;
        const inRange = this.isFrameInSelectedRange(slot.index);
        const inPlaybackRange = this.isFrameInPlaybackRange(slot.index);
        const hoverPreview = this.timelineHoverIndex === slot.index;
        const reorderTarget = this.timelineInteraction && this.timelineInteraction.mode === "reorder" && slot.index === this.timelineInteraction.targetIndex;
        ctx.fillStyle = inRange ? "#1d3950" : "#101a24";
        if (inPlaybackRange) ctx.fillStyle = "#28344f";
        if (active) ctx.fillStyle = "#244d67";
        if (hoverPreview && !active) ctx.fillStyle = "#2f4858";
        if (reorderTarget) ctx.fillStyle = "#305c4a";
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.strokeStyle = active ? "#4cc9f0" : (inRange ? "#7dd3fc" : "rgba(255,255,255,0.22)");
        if (inPlaybackRange && !active) ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(slot.x + 0.5, slot.y + 0.5, slot.w - 1, slot.h - 1);
        const thumbH = slot.h - 18;
        const thumbW = slot.w - 8;
        this.drawMiniPixels(this.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), slot.x + 4, slot.y + 2, thumbW, thumbH);
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "11px Arial";
        ctx.fillText(String(slot.index + 1), slot.x + 4, slot.y + slot.h - 6);
        if (inPlaybackRange) {
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(slot.x + 2, slot.y + slot.h - 4, slot.w - 4, 2);
        }
      });
    },

    drawMainGrid() {
      const r = this.gridRect;
      const ctx = this.ctx;
      const pixels = this.document.getCompositedPixels(this.document.activeFrame);
      const viewport = this.controlSurface.layout.gridArea;
      const prevFrame = this.document.frames[this.document.activeFrameIndex - 1];
      const nextFrame = this.document.frames[this.document.activeFrameIndex + 1];
      const prevPixels = prevFrame ? this.document.getCompositedPixels(prevFrame) : null;
      const nextPixels = nextFrame ? this.document.getCompositedPixels(nextFrame) : null;
      ctx.save();
      ctx.beginPath();
      ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
      ctx.clip();
      ctx.fillStyle = "#fff";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      for (let y = 0; y < this.document.rows; y += 1) {
        for (let x = 0; x < this.document.cols; x += 1) {
          ctx.fillStyle = ((x + y) % 2 === 0) ? "#f8fafc" : "#e2e8f0";
          ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      if (this.onionSkin.prev && prevPixels) {
        ctx.fillStyle = "rgba(80, 180, 255, 0.20)";
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            if (!prevPixels[y][x]) continue;
            ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      if (this.onionSkin.next && nextPixels) {
        ctx.fillStyle = "rgba(255, 170, 80, 0.18)";
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            if (!nextPixels[y][x]) continue;
            ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      for (let y = 0; y < this.document.rows; y += 1) {
        for (let x = 0; x < this.document.cols; x += 1) {
          const v = pixels[y][x];
          if (!v) continue;
          ctx.fillStyle = v;
          ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      if (this.selectionMoveSession && this.selectionMoveSession.block && this.selectionMoveSession.sourceRect) {
        const previewX = this.selectionMoveSession.sourceRect.x + (this.selectionMoveSession.offsetX || 0);
        const previewY = this.selectionMoveSession.sourceRect.y + (this.selectionMoveSession.offsetY || 0);
        for (let y = 0; y < this.selectionMoveSession.block.height; y += 1) {
          for (let x = 0; x < this.selectionMoveSession.block.width; x += 1) {
            const v = this.selectionMoveSession.block.pixels[y][x];
            if (!v) continue;
            ctx.fillStyle = v;
            ctx.fillRect(r.x + (previewX + x) * r.pixelSize, r.y + (previewY + y) * r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      for (let x = 0; x <= this.document.cols; x += 1) {
        ctx.beginPath();
        ctx.moveTo(r.x + x * r.pixelSize + 0.5, r.y);
        ctx.lineTo(r.x + x * r.pixelSize + 0.5, r.y + r.height);
        ctx.stroke();
      }
      for (let y = 0; y <= this.document.rows; y += 1) {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + y * r.pixelSize + 0.5);
        ctx.lineTo(r.x + r.width, r.y + y * r.pixelSize + 0.5);
        ctx.stroke();
      }
      if (this.hoveredGridCell) {
        ctx.strokeStyle = "#4cc9f0";
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x + this.hoveredGridCell.x * r.pixelSize + 1, r.y + this.hoveredGridCell.y * r.pixelSize + 1, r.pixelSize - 2, r.pixelSize - 2);
      }
      if (this.document.selection) {
        const selectionRect = this.selectionMoveSession && this.selectionMoveSession.sourceRect
          ? {
              x: this.selectionMoveSession.sourceRect.x + (this.selectionMoveSession.offsetX || 0),
              y: this.selectionMoveSession.sourceRect.y + (this.selectionMoveSession.offsetY || 0),
              width: this.selectionMoveSession.sourceRect.width,
              height: this.selectionMoveSession.sourceRect.height
            }
          : this.document.selection;
        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 3;
        ctx.strokeRect(r.x + selectionRect.x * r.pixelSize + 1, r.y + selectionRect.y * r.pixelSize + 1, selectionRect.width * r.pixelSize - 2, selectionRect.height * r.pixelSize - 2);
      }
      if (this.shapePreview && this.shapePreview.start && this.shapePreview.current) {
        const previewCells = this.getShapeCells(this.shapePreview.start, this.shapePreview.current, this.shapePreview.tool);
        ctx.fillStyle = this.shapePreview.erase ? "rgba(239,68,68,0.35)" : "rgba(76,201,240,0.35)";
        previewCells.forEach((cell) => {
          if (cell.x < 0 || cell.y < 0 || cell.x >= this.document.cols || cell.y >= this.document.rows) return;
          ctx.fillRect(r.x + cell.x * r.pixelSize, r.y + cell.y * r.pixelSize, r.pixelSize, r.pixelSize);
        });
      }
      ctx.restore();
    }
  });
}

export { installSpriteEditorRenderMethods };
