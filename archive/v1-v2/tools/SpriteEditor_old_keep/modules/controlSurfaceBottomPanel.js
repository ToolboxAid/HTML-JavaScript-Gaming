import { drawCanvasCheckerboard } from "/src/engine/ui/index.js";

function drawPixelPreviewExact(ctx, pixels, rect, options = {}) {
  const cols = Math.max(1, Number(options.cols) || 1);
  const rows = Math.max(1, Number(options.rows) || 1);
  const backgroundFill = Object.prototype.hasOwnProperty.call(options, "backgroundFill") ? options.backgroundFill : "#fff";
  const borderStroke = Object.prototype.hasOwnProperty.call(options, "borderStroke")
    ? options.borderStroke
    : "rgba(0,0,0,0.2)";
  if (backgroundFill) {
    ctx.fillStyle = backgroundFill;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  if (!pixels || !Array.isArray(pixels)) {
    if (borderStroke) {
      ctx.strokeStyle = borderStroke;
      ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
    }
    return;
  }
  for (let py = 0; py < rows; py += 1) {
    const row = pixels[py];
    if (!Array.isArray(row)) continue;
    const y0 = rect.y + Math.floor((py * rect.h) / rows);
    const y1 = rect.y + Math.floor(((py + 1) * rect.h) / rows);
    const h = Math.max(1, y1 - y0);
    for (let px = 0; px < cols; px += 1) {
      const value = row[px];
      if (!value) continue;
      const x0 = rect.x + Math.floor((px * rect.w) / cols);
      const x1 = rect.x + Math.floor(((px + 1) * rect.w) / cols);
      const w = Math.max(1, x1 - x0);
      ctx.fillStyle = value;
      ctx.fillRect(x0, y0, w, h);
    }
  }
  if (borderStroke) {
    ctx.strokeStyle = borderStroke;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
  }
}

function installControlSurfaceBottomPanel(SpriteEditorCanvasControlSurface) {
  const drawSolidBorder = (ctx, x, y, w, h, color) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iw = Math.max(0, Math.floor(w));
    const ih = Math.max(0, Math.floor(h));
    if (iw <= 1 || ih <= 1) return;
    ctx.fillStyle = color;
    ctx.fillRect(ix, iy, iw, 1);
    ctx.fillRect(ix, iy + ih - 1, iw, 1);
    ctx.fillRect(ix, iy, 1, ih);
    ctx.fillRect(ix + iw - 1, iy, 1, ih);
  };

  SpriteEditorCanvasControlSurface.prototype.drawTimelinePanel = function drawTimelinePanel(ctx) {
    const t = this.app.timelineStripRect;
    if (!t) return;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#1a2733";
    ctx.fillRect(t.x, t.y, t.w, t.h);
    drawSolidBorder(ctx, t.x, t.y, t.w, t.h, "rgba(255,255,255,0.15)");
    ctx.fillStyle = "#dbe7f3";
    ctx.font = "bold 12px Arial";
    const timelineTitleX = t.x + 15;
    const timelineTitleY = t.y + 14;
    ctx.fillText("TIMELINE", timelineTitleX, timelineTitleY);
    ctx.fillStyle = "#91a3b6";
    ctx.font = "11px Arial";
    ctx.save();
    ctx.beginPath();
    ctx.rect(t.x + 1, t.y + 1, Math.max(0, t.w - 2), Math.max(0, t.h - 2));
    ctx.clip();
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
      let slotBorderColor = active ? "#4cc9f0" : (inRange ? "#7dd3fc" : "rgba(255,255,255,0.22)");
      if (inPlaybackRange && !active) slotBorderColor = "#fbbf24";
      drawSolidBorder(ctx, slot.x, slot.y, slot.w, slot.h, slotBorderColor);
      const thumbH = slot.h - 18;
      const thumbW = slot.w - 8;
      const thumbRect = { x: slot.x + 4, y: slot.y + 2, w: thumbW, h: thumbH };
      const thumbScale = Math.max(1, Math.floor(Math.min(thumbRect.w / Math.max(1, this.app.document.cols), thumbRect.h / Math.max(1, this.app.document.rows))));
      if (this.app.document.sheet.transparent) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(thumbRect.x, thumbRect.y, thumbRect.w, thumbRect.h);
        ctx.clip();
        drawCanvasCheckerboard(ctx, thumbRect, Math.max(2, thumbScale));
        ctx.restore();
      }
      drawPixelPreviewExact(ctx, this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), thumbRect, {
        cols: this.app.document.cols,
        rows: this.app.document.rows,
        backgroundFill: this.app.document.sheet.transparent ? "rgba(0,0,0,0)" : "#fff",
        borderStroke: null
      });
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "11px Arial";
      ctx.fillText(String(slot.index + 1), slot.x + 4, slot.y + slot.h - 6);
      if (inPlaybackRange) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(slot.x + 2, slot.y + slot.h - 4, slot.w - 4, 2);
      }
    });
    const panelInnerRight = Math.floor(t.x + t.w - 1);
    const rightMostSlotEdge = t.slots.reduce(
      (maxX, slot) => Math.max(maxX, Math.floor(slot.x + slot.w)),
      Math.floor(t.x + 1)
    );
    if (rightMostSlotEdge < panelInnerRight) {
      ctx.fillStyle = "#1a2733";
      ctx.fillRect(rightMostSlotEdge, Math.floor(t.y + 1), panelInnerRight - rightMostSlotEdge, Math.max(0, Math.floor(t.h - 2)));
    }
    ctx.restore();
    drawSolidBorder(ctx, t.x, t.y, t.w, t.h, "rgba(255,255,255,0.15)");
    ctx.restore();
  };

  SpriteEditorCanvasControlSurface.prototype.drawPreviewPanel = function drawPreviewPanel(ctx) {
    const p = this.layout.bottomPanel;
    const x = p.x + 18;
    const y = p.y + 8;
    const w = 236;
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
    const previewSlot = { x: x + 10, y: y + 24, w: 82, h: 82 };
    const cols = Math.max(1, Number(this.app.document.cols) || 1);
    const rows = Math.max(1, Number(this.app.document.rows) || 1);
    const aspect = cols / rows;
    let boxW = previewSlot.w;
    let boxH = previewSlot.h;
    if (aspect > 1) boxH = Math.max(1, Math.floor(previewSlot.w / aspect));
    else if (aspect < 1) boxW = Math.max(1, Math.floor(previewSlot.h * aspect));
    const previewRect = {
      x: previewSlot.x + Math.floor((previewSlot.w - boxW) * 0.5),
      y: previewSlot.y + Math.floor((previewSlot.h - boxH) * 0.5),
      w: boxW,
      h: boxH
    };
    const previewPixels = this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" });
    const previewBackgroundFill = this.app.document.sheet.transparent
      ? "rgba(0,0,0,0)"
      : (this.app.document.sheet && this.app.document.sheet.backgroundColor ? this.app.document.sheet.backgroundColor : "#ffffff");
    drawPixelPreviewExact(ctx, previewPixels, previewRect, {
      cols,
      rows,
      backgroundFill: previewBackgroundFill
    });
    const fitText = (text, maxWidth) => {
      let next = String(text || "");
      if (ctx.measureText(next).width <= maxWidth) return next;
      while (next.length > 1 && ctx.measureText(`${next}...`).width > maxWidth) next = next.slice(0, -1);
      return `${next}...`;
    };
    const transportControls = this.app.timelineStripRect && Array.isArray(this.app.timelineStripRect.transport)
      ? this.app.timelineStripRect.transport
      : [];
    const controlsById = new Map();
    transportControls.forEach((control) => {
      if (!control || !control.id) return;
      controlsById.set(control.id, control);
    });
    const drawTransportControl = (control) => {
      if (!control) return;
      const active = (control.id === "play_pause" && this.app.playback.isPlaying)
        || (control.id === "loop" && this.app.playback.loop);
      ctx.fillStyle = active ? "#244d67" : "#1a2733";
      ctx.fillRect(control.x, control.y, control.w, control.h);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.strokeRect(control.x + 0.5, control.y + 0.5, control.w - 1, control.h - 1);
      let label = "";
      if (control.id === "play_pause") label = this.app.playback.isPlaying ? "Pause" : "Play";
      else if (control.id === "stop") label = "Stop";
      else if (control.id === "loop") label = "Loop";
      else if (control.id === "fps_down") label = "-";
      else if (control.id === "fps_up") label = "+";
      if (!label) return;
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "11px Arial";
      ctx.textBaseline = "middle";
      const textW = ctx.measureText(label).width;
      ctx.fillText(label, control.x + Math.floor((control.w - textW) * 0.5), control.y + Math.floor(control.h * 0.5));
      ctx.textBaseline = "alphabetic";
    };
    ["play_pause", "stop", "loop", "fps_down", "fps_up"].forEach((id) => drawTransportControl(controlsById.get(id)));

    ctx.font = "12px Arial";
    ctx.fillStyle = "#dbe7f3";
    ctx.fillText(`Frame ${previewIndex + 1} / ${this.app.document.frames.length}`, x + 98, y + 34);
    const fpsDown = controlsById.get("fps_down");
    const fpsUp = controlsById.get("fps_up");
    const playbackOrder = this.app.getPlaybackOrderOverride ? this.app.getPlaybackOrderOverride() : { enabled: false };
    const baseOrder = this.app.document.frames.map((_frame, i) => i);
    const effectiveOrder = this.app.getEffectivePlaybackSequence ? this.app.getEffectivePlaybackSequence(baseOrder) : baseOrder;
    const orderText = effectiveOrder.map((i) => i + 1).join(", ");
    const orderLabel = playbackOrder.enabled ? `Playback: ${orderText}` : "Playback: Linear";
    if (fpsDown && fpsUp) {
      ctx.fillStyle = "#91a3b6";
      ctx.font = "11px Arial";
      ctx.textBaseline = "middle";
      const fpsLabelX = fpsUp.x + fpsUp.w + 8;
      const fpsLabelY = fpsDown.y + Math.floor(fpsDown.h * 0.5);
      ctx.fillText(`FPS ${this.app.playback.fps}`, fpsLabelX, fpsLabelY);
      const orderLabelX = Math.max(x + 90, fpsDown.x - 6) + 5;
      const orderLabelY = fpsDown.y + fpsDown.h + 10;
      const orderMaxWidth = Math.max(56, x + w - orderLabelX - 10);
      ctx.fillText(fitText(orderLabel, orderMaxWidth), orderLabelX, orderLabelY);
      ctx.textBaseline = "alphabetic";
    } else {
      ctx.fillStyle = "#91a3b6";
      ctx.font = "11px Arial";
      ctx.textBaseline = "middle";
      const fpsLabelX = x + 98;
      const fpsLabelY = y + 78;
      ctx.fillText(`FPS ${this.app.playback.fps}`, fpsLabelX, fpsLabelY);
      const orderLabelX = x + 95;
      const orderLabelY = fpsLabelY + 16;
      const orderMaxWidth = Math.max(56, x + w - orderLabelX - 12);
      ctx.fillText(fitText(orderLabel, orderMaxWidth), orderLabelX, orderLabelY);
      ctx.textBaseline = "alphabetic";
    }
  };

  SpriteEditorCanvasControlSurface.prototype.drawSheetPanel = function drawSheetPanel(ctx) {
    const p = this.layout.bottomPanel;
    const x = p.x + 266;
    const y = p.y + 6;
    const w = Math.max(216, (this.app.timelineStripRect ? this.app.timelineStripRect.x : (p.x + p.width - 18)) - x - 18);
    const h = 112;
    this.drawSheetPreview(ctx, { x, y, width: w, height: h }, true);
  };

  SpriteEditorCanvasControlSurface.prototype.drawSheetPreview = function drawSheetPreview(ctx, rect, withChrome) {
    const plc = this.app.document.computeSheetPlacement();
    const titleH = withChrome ? 18 : 0;
    const footerH = 0;
    const innerPad = withChrome ? 5 : 0;
    if (withChrome) {
      ctx.fillStyle = "#1a2733";
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 12px Arial";
      ctx.fillText("SHEET PREVIEW", rect.x + 12, rect.y + 16);
      ctx.font = "11px Arial";
      ctx.fillStyle = "#e6f2ff";
      ctx.fillText(`Frames: ${this.app.document.frames.length}`, rect.x + 12, rect.y + 30);
    }
    const cx = rect.x + innerPad;
    const cy = rect.y + innerPad + titleH;
    const cw = rect.width - innerPad * 2;
    const ch = rect.height - innerPad * 2 - titleH - footerH;
    const infoW = withChrome ? Math.min(132, Math.max(110, Math.floor(cw * 0.26))) : 0;
    const previewW = Math.max(24, cw - infoW - (withChrome ? 8 : 0));
    const previewX = cx;
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
  };
}

export { installControlSurfaceBottomPanel };
