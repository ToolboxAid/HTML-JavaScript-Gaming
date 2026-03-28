import { drawCanvasCheckerboard, drawCanvasPixelPreview } from "../../../engine/ui/index.js";

function installControlSurfaceBottomPanel(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.drawTimelinePanel = function drawTimelinePanel(ctx) {
    const t = this.app.timelineStripRect;
    if (!t) return;
    ctx.fillStyle = "#1a2733";
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1);
    ctx.fillStyle = "#dbe7f3";
    ctx.font = "bold 12px Arial";
    ctx.fillText("TIMELINE", t.x + 78, t.y + 14);
    (t.transport || []).forEach((c) => {
      ctx.fillStyle = "#1a2733";
      if (c.id === "play_pause" && this.app.playback.isPlaying) ctx.fillStyle = "#244d67";
      if (c.id === "loop" && this.app.playback.loop) ctx.fillStyle = "#244d67";
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "11px Arial";
      if (c.id === "play_pause") ctx.fillText(this.app.playback.isPlaying ? "Pause" : "Play", c.x + 8, c.y + 12);
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
    ctx.fillText(`FPS ${this.app.playback.fps}`, t.x + t.w - 62, fpsY);
    t.slots.forEach((slot) => {
      const f = this.app.document.frames[slot.index];
      const active = slot.index === this.app.document.activeFrameIndex;
      const inRange = this.app.isFrameInSelectedRange(slot.index);
      const inPlaybackRange = this.app.isFrameInPlaybackRange(slot.index);
      const hoverPreview = this.app.timelineHoverIndex === slot.index;
      const reorderTarget = this.app.timelineInteraction && this.app.timelineInteraction.mode === "reorder" && slot.index === this.app.timelineInteraction.targetIndex;
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
      drawCanvasPixelPreview(ctx, this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), { x: slot.x + 4, y: slot.y + 2, w: thumbW, h: thumbH }, {
        cols: this.app.document.cols,
        rows: this.app.document.rows
      });
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "11px Arial";
      ctx.fillText(String(slot.index + 1), slot.x + 4, slot.y + slot.h - 6);
      if (inPlaybackRange) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(slot.x + 2, slot.y + slot.h - 4, slot.w - 4, 2);
      }
    });
  };

  SpriteEditorCanvasControlSurface.prototype.drawPreviewPanel = function drawPreviewPanel(ctx) {
    const p = this.layout.bottomPanel;
    const x = p.x + 18;
    const y = p.y + 8;
    const w = 210;
    const h = 108;
    ctx.fillStyle = "#1a2733";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.fillStyle = "#dbe7f3";
    ctx.font = "bold 12px Arial";
    ctx.fillText("ANIMATION PREVIEW", x + 12, y + 16);
    const previewIndex = this.app.playback.isPlaying
      ? this.app.playback.previewFrameIndex
      : (this.app.timelineHoverIndex !== null ? this.app.timelineHoverIndex : this.app.document.activeFrameIndex);
    const f = this.app.document.frames[Math.max(0, Math.min(previewIndex, this.app.document.frames.length - 1))];
    drawCanvasPixelPreview(ctx, this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), { x: x + 12, y: y + 24, w: 72, h: 72 }, {
      cols: this.app.document.cols,
      rows: this.app.document.rows
    });
    ctx.font = "12px Arial";
    ctx.fillText(`Frame ${previewIndex + 1} / ${this.app.document.frames.length}`, x + 96, y + 36);
  };

  SpriteEditorCanvasControlSurface.prototype.drawSheetPanel = function drawSheetPanel(ctx) {
    const p = this.layout.bottomPanel;
    const x = p.x + 242;
    const y = p.y + 6;
    const w = Math.max(240, (this.app.timelineStripRect ? this.app.timelineStripRect.x : (p.x + p.width - 18)) - (p.x + 242) - 18);
    const h = 112;
    this.drawSheetPreview(ctx, { x, y, width: w, height: h }, true);
  };

  SpriteEditorCanvasControlSurface.prototype.drawSheetPreview = function drawSheetPreview(ctx, rect, withChrome) {
    const plc = this.app.document.computeSheetPlacement();
    const titleH = withChrome ? 18 : 0;
    const footerH = 0;
    const innerPad = withChrome ? 5 : 0;
    const order = this.app.document.frames.length <= 8
      ? this.app.document.frames.map((_, i) => i + 1).join(", ")
      : `1..${this.app.document.frames.length}`;
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
    if (this.app.document.sheet.transparent) drawCanvasCheckerboard(ctx, { x: drawX, y: drawY, w: drawW, h: drawH }, Math.max(4, scale));
    else {
      ctx.fillStyle = this.app.document.sheet.backgroundColor;
      ctx.fillRect(drawX, drawY, drawW, drawH);
    }
    this.app.document.frames.forEach((f, i) => {
      const e = plc.entries[i];
      const cpx = this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" });
      for (let y = 0; y < this.app.document.rows; y += 1) {
        for (let x = 0; x < this.app.document.cols; x += 1) {
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
      ctx.fillText(`Frames: ${this.app.document.frames.length}`, infoX, cy + 18);
      ctx.fillStyle = "#b9c8d8";
      ctx.fillText("Order:", infoX, cy + 38);
      ctx.fillText(order.length > 18 ? `${order.slice(0, 18)}...` : order, infoX, cy + 54);
    }
  };
}

export { installControlSurfaceBottomPanel };
