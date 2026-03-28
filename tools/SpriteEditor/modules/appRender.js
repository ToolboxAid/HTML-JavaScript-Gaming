import { drawCanvasCheckerboard } from "../../../engine/ui/index.js";

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
    },

    drawPreviewPanel() {
      const p = this.controlSurface.layout.bottomPanel;
      const x = p.x + 18;
      const y = p.y + 8;
      const w = 210;
      const h = 108;
      this.ctx.fillStyle = "#1a2733";
      this.ctx.fillRect(x, y, w, h);
      this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
      this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 12px Arial";
      this.ctx.fillText("ANIMATION PREVIEW", x + 12, y + 16);
      const previewIndex = this.playback.isPlaying
        ? this.playback.previewFrameIndex
        : (this.timelineHoverIndex !== null ? this.timelineHoverIndex : this.document.activeFrameIndex);
      const f = this.document.frames[Math.max(0, Math.min(previewIndex, this.document.frames.length - 1))];
      this.drawMiniPixels(this.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), x + 12, y + 24, 72, 72);
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`Frame ${previewIndex + 1} / ${this.document.frames.length}`, x + 96, y + 36);
    },

    drawSheetPanel() {
      const p = this.controlSurface.layout.bottomPanel;
      const x = p.x + 242;
      const y = p.y + 6;
      const w = Math.max(240, (this.timelineStripRect ? this.timelineStripRect.x : (p.x + p.width - 18)) - (p.x + 242) - 18);
      const h = 112;
      this.drawSheetPreview(this.ctx, { x, y, width: w, height: h }, true);
    },

    drawSheetPreview(ctx, rect, withChrome) {
      const plc = this.document.computeSheetPlacement();
      const titleH = withChrome ? 18 : 0;
      const footerH = 0;
      const innerPad = withChrome ? 5 : 0;
      const order = this.document.frames.length <= 8
        ? this.document.frames.map((_, i) => i + 1).join(", ")
        : `1..${this.document.frames.length}`;
      if (withChrome) {
        ctx.fillStyle = "#1a2733";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "bold 12px Arial";
        ctx.fillText("SHEET PREVIEW", rect.x + 12, rect.y + 16);
      }
      const cx = rect.x + innerPad;
      const cy = rect.y + innerPad + titleH;
      const cw = rect.width - innerPad * 2;
      const ch = rect.height - innerPad * 2 - titleH - footerH;
      const infoW = withChrome ? Math.min(132, Math.max(110, Math.floor(cw * 0.26))) : 0;
      const previewW = Math.max(24, cw - infoW - (withChrome ? 8 : 0));
      const previewX = cx;
      const infoX = previewX + previewW + 8;
      const scale = Math.max(1, Math.floor(Math.min(previewW / plc.width, ch / plc.height)));
      const drawW = plc.width * scale;
      const drawH = plc.height * scale;
      const drawX = previewX + Math.floor((previewW - drawW) * 0.5);
      const drawY = cy + Math.floor((ch - drawH) * 0.5);
      if (this.document.sheet.transparent) drawCanvasCheckerboard(ctx, { x: drawX, y: drawY, w: drawW, h: drawH }, Math.max(4, scale));
      else {
        ctx.fillStyle = this.document.sheet.backgroundColor;
        ctx.fillRect(drawX, drawY, drawW, drawH);
      }
      this.document.frames.forEach((f, i) => {
        const e = plc.entries[i];
        const cpx = this.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" });
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            const v = cpx[y][x];
            if (!v) continue;
            ctx.fillStyle = v;
            ctx.fillRect(drawX + (e.x + x) * scale, drawY + (e.y + y) * scale, scale, scale);
          }
        }
      });
      if (withChrome) {
        ctx.font = "11px Arial";
        ctx.fillStyle = "#e6f2ff";
        ctx.fillText(`Frames: ${this.document.frames.length}`, infoX, cy + 18);
        ctx.fillStyle = "#b9c8d8";
        ctx.fillText("Order:", infoX, cy + 38);
        ctx.fillText(order.length > 18 ? `${order.slice(0, 18)}...` : order, infoX, cy + 54);
      }
    },

    drawMiniPixels(pixels, x, y, w, h) {
      const cols = this.document.cols;
      const rows = this.document.rows;
      const pw = Math.max(1, Math.floor(w / cols));
      const ph = Math.max(1, Math.floor(h / rows));
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(x, y, w, h);
      for (let py = 0; py < rows; py += 1) {
        for (let px = 0; px < cols; px += 1) {
          const v = pixels[py][px];
          if (!v) continue;
          this.ctx.fillStyle = v;
          this.ctx.fillRect(x + px * pw, y + py * ph, pw, ph);
        }
      }
      this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
      this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    },

  });
}

export { installSpriteEditorRenderMethods };
