import { LOGICAL_H, LOGICAL_W } from "./constants.js";
import { drawCanvasPixelPreview } from "../../../engine/ui/index.js";

function installControlSurfaceDraw(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.draw = function draw(ctx) {
    const L = this.layout;
    const F = L.appFrame;
    ctx.fillStyle = "#0c1118";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.fillStyle = "#121b25";
    ctx.fillRect(F.x, F.y, F.width, F.height);
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.strokeRect(F.x + 0.5, F.y + 0.5, F.width - 1, F.height - 1);
    [L.topPanel, L.leftPanel, L.rightPanel, L.bottomPanel].forEach((p) => {
      ctx.fillStyle = "#16202b";
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.width - 1, p.height - 1);
    });
    ctx.font = "13px Arial";
    ctx.textBaseline = "middle";
    this.controls.forEach((c) => this.drawControl(ctx, c));
    this.drawPaletteSidebarScrollbar(ctx);
    ctx.fillStyle = "#dbe7f3";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sprite Editor v2.2", L.topPanel.x + (L.topPanel.width * 0.5), L.topPanel.y + 35);
    ctx.font = "12px Arial";
    if (performance.now() < (this.app.errorMessageUntil || 0)) ctx.fillStyle = "#ef4444";
    else ctx.fillStyle = performance.now() < this.app.flashMessageUntil ? "#4cc9f0" : "#91a3b6";
    ctx.fillText(this.app.statusMessage || "Ready.", L.topPanel.x + (L.topPanel.width * 0.5), L.topPanel.y + 53);
    ctx.textAlign = "left";
    if (this.dragFrameIndex !== null && this.dragOverFrameIndex !== null) {
      const from = this.dragFrameIndex + 1;
      const to = this.dragOverFrameIndex + 1;
      ctx.fillStyle = "#4cc9f0";
      ctx.font = "12px Arial";
      ctx.fillText(`Reorder: ${from} -> ${to}`, L.rightPanel.x + 18, L.rightPanel.y + L.rightPanel.height - 14);
    }
  };

  SpriteEditorCanvasControlSurface.prototype.wrapSidebarText = function wrapSidebarText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  };

  SpriteEditorCanvasControlSurface.prototype.drawControl = function drawControl(ctx, c) {
    let clipped = false;
    if (c && c.clipRect) {
      clipped = true;
      ctx.save();
      ctx.beginPath();
      ctx.rect(c.clipRect.x, c.clipRect.y, c.clipRect.width, c.clipRect.height);
      ctx.clip();
    }
    const inLeftSidebar = this.layout && this.layout.leftPanel && c.x >= this.layout.leftPanel.x && c.x < (this.layout.leftPanel.x + this.layout.leftPanel.width);
    const paletteTextOffsetX = 8;
    if (c.kind === "label") {
      if (c.id === "palette-current") {
        const currentHex = String(this.app.document.currentColor || "").toUpperCase();
        let name = "Unnamed";
        const presetEntries = typeof this.app.getActivePresetEntries === "function" ? this.app.getActivePresetEntries() : null;
        if (Array.isArray(presetEntries)) {
          const match = presetEntries.find((entry) => entry && String(entry.hex || "").toUpperCase() === currentHex && typeof entry.name === "string" && entry.name.trim());
          if (match) name = match.name.trim();
        }
        const textY = c.y + 5;
        if (c.paletteHeaderBox) {
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(c.x, c.y, c.w, c.h);
          ctx.strokeStyle = "rgba(255,255,255,0.16)";
          ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(c.x + 2, c.y + 2, Math.max(0, c.w - 4), Math.max(0, c.h - 4));
        ctx.clip();
        ctx.fillStyle = c.paletteActionRequired ? "#ef4444" : "#91a3b6";
        ctx.font = "bold 12px Arial";
        const leftText = `Current: ${currentHex}   Named: ${name}`;
        ctx.textBaseline = "top";
        if (this.app.isPaletteSelectionRequired && this.app.isPaletteSelectionRequired()) {
          ctx.fillText(this.app.getCurrentColorDisplayText(), c.x + paletteTextOffsetX, textY);
          ctx.textBaseline = "middle";
          ctx.restore();
          if (clipped) ctx.restore();
          return;
        }
        const prefix = `Current: ${currentHex}`;
        ctx.fillText(prefix, c.x + paletteTextOffsetX, textY);
        const prefixWidth = ctx.measureText(prefix).width;
        const sw = 12;
        const sh = 12;
        const swatchX = c.x + paletteTextOffsetX + prefixWidth + 8;
        const swatchY = c.y + 5;
        ctx.fillStyle = currentHex;
        ctx.fillRect(swatchX, swatchY, sw, sh);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(swatchX + 0.5, swatchY + 0.5, sw - 1, sh - 1);
        const namedX = swatchX + sw + 12;
        ctx.fillStyle = c.paletteActionRequired ? "#ef4444" : "#91a3b6";
        ctx.fillText(`Named: ${name}`, namedX, textY);
        ctx.restore();
        ctx.textBaseline = "middle";
        if (clipped) ctx.restore();
        return;
      }
      if (c.paletteHeaderBox) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
      }
      ctx.fillStyle = c.paletteActionRequired ? "#ef4444" : "#91a3b6";
      ctx.font = c.id === "lbl-palette" ? "bold 13px Arial" : "bold 12px Arial";
      if (c.paletteHeaderBox) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(c.x + 2, c.y + 2, Math.max(0, c.w - 4), Math.max(0, c.h - 4));
        ctx.clip();
        ctx.textBaseline = "top";
        ctx.fillText(c.text, c.x + paletteTextOffsetX, c.y + 5);
        ctx.textBaseline = "middle";
        ctx.restore();
        if (clipped) ctx.restore();
        return;
      }
      if (inLeftSidebar && c.text && c.text.length > 16) {
        const lines = this.wrapSidebarText(ctx, c.text, Math.max(24, c.w - 16));
        const lineH = 12;
        const baseY = c.y + Math.max(10, Math.floor((c.h - Math.min(lines.length, 3) * lineH) * 0.5)) + 2;
        lines.slice(0, 3).forEach((line, index) => {
          ctx.fillText(line, c.x + (index === 0 ? 0 : 12), baseY + index * lineH);
        });
      } else {
        ctx.fillText(c.text, c.x, c.y + c.h / 2);
      }
      if (clipped) ctx.restore();
      return;
    }
    if (c.kind === "palette") {
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      const current = this.app.document.currentColor === c.color;
      ctx.strokeStyle = current ? "#ffffff" : "rgba(255,255,255,0.2)";
      ctx.lineWidth = current ? 3 : 1;
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
      if (c.paletteUsed === true && !current) {
        ctx.strokeStyle = "rgba(148,163,184,0.85)";
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3);
      }
      if (current) {
        const dash = Math.max(2, Math.floor(c.w / 5));
        const offset = -Math.floor(performance.now() / 80);
        ctx.save();
        ctx.setLineDash([dash, 2]);
        ctx.lineDashOffset = offset;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.25;
        ctx.strokeRect(c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3);
        ctx.lineDashOffset = offset + dash;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3.25;
        ctx.strokeRect(c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3);
        ctx.restore();
      }
      if (this.app.paletteWorkflow.source === c.color) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(c.x + 2, c.y + 2, 8, 8);
      }
      if (this.app.paletteWorkflow.target === c.color) {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(c.x + c.w - 10, c.y + 2, 8, 8);
      }
      ctx.lineWidth = 1;
      if (clipped) ctx.restore();
      return;
    }
    if (c.kind === "divider") {
      const lineY = c.y + Math.floor(c.h * 0.5) + 0.5;
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(c.x + 2, lineY);
      ctx.lineTo(c.x + c.w - 2, lineY);
      ctx.stroke();
      if (clipped) ctx.restore();
      return;
    }
    const hovered = this.hovered === c.id;
    const pressed = this.pressed === c.id;
    const activeFrame = c.kind === "frame" && this.app.document.activeFrameIndex === c.frameIndex;
    const activeLayerItem = typeof c.layerIndex === "number" && this.app.document.activeFrame.activeLayerIndex === c.layerIndex;
    const dragTarget = c.kind === "frame" && this.dragOverFrameIndex === c.frameIndex && this.dragFrameIndex !== null;
    const toolActive = c.tool && this.app.activeTool === c.tool;
    const sortModeActive = c.paletteSortMode && this.app.paletteSortMode === c.paletteSortMode;
    ctx.fillStyle = pressed ? "#27435a" : (hovered ? "#223444" : "#1a2733");
    if (c.isCommandRow && c.selected) ctx.fillStyle = "#2d5169";
    if (toolActive || activeFrame || activeLayerItem || sortModeActive) ctx.fillStyle = "#244d67";
    if (c.accordionHeader) ctx.fillStyle = c.accordionOpen ? "#244d67" : (hovered ? "#223444" : "#1a2733");
    if (dragTarget) ctx.fillStyle = "#305c4a";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = (toolActive || activeFrame || activeLayerItem || dragTarget || sortModeActive) ? "#4cc9f0" : "rgba(255,255,255,0.15)";
    if (c.isCommandRow && c.selected) ctx.strokeStyle = "#4cc9f0";
    if (c.accordionHeader) ctx.strokeStyle = c.accordionOpen ? "#4cc9f0" : "rgba(255,255,255,0.18)";
    ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
    if (c.layerVisibilityToggle) {
      ctx.fillStyle = c.layerHidden ? "#8fa0b2" : "#edf2f7";
      ctx.font = "bold 12px Arial";
      ctx.fillText(c.layerHidden ? "Show" : "Hide", c.x + 9, c.y + c.h / 2);
    } else if (typeof c.layerIndex === "number") {
      const iconSize = 12;
      const iconGap = 6;
      const previewSize = Math.max(18, Math.min(28, c.h - 10));
      const previewX = c.x + c.w - previewSize - 6;
      const previewY = c.y + Math.floor((c.h - previewSize) * 0.5);
      drawCanvasPixelPreview(
        ctx,
        c.layerPixels,
        { x: previewX, y: previewY, w: previewSize, h: previewSize },
        {
          cols: this.app.document.cols,
          rows: this.app.document.rows,
          backgroundFill: this.app.document.sheet && this.app.document.sheet.transparent ? "rgba(0,0,0,0)" : "#ffffff",
          borderStroke: "rgba(255,255,255,0.25)"
        }
      );
      const drawVisibilityIcon = (ix, iy, size, visible) => {
        ctx.save();
        ctx.strokeStyle = visible ? "#dbe7f3" : "#8fa0b2";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(ix, iy + size * 0.5);
        ctx.quadraticCurveTo(ix + size * 0.5, iy - 1, ix + size, iy + size * 0.5);
        ctx.quadraticCurveTo(ix + size * 0.5, iy + size + 1, ix, iy + size * 0.5);
        ctx.stroke();
        if (visible) {
          ctx.fillStyle = "#dbe7f3";
          ctx.beginPath();
          ctx.arc(ix + size * 0.5, iy + size * 0.5, Math.max(1.6, size * 0.18), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(ix + 1, iy + size - 1);
          ctx.lineTo(ix + size - 1, iy + 1);
          ctx.stroke();
        }
        ctx.restore();
      };
      const drawLockIcon = (ix, iy, size, locked) => {
        ctx.save();
        ctx.strokeStyle = locked ? "#f59e0b" : "#8fa0b2";
        ctx.fillStyle = locked ? "rgba(245,158,11,0.12)" : "rgba(143,160,178,0.10)";
        ctx.lineWidth = 1.25;
        const bodyY = iy + size * 0.45;
        const bodyH = size * 0.5;
        ctx.fillRect(ix + 1, bodyY, size - 2, bodyH);
        ctx.strokeRect(ix + 1.5, bodyY + 0.5, size - 3, bodyH - 1);
        ctx.beginPath();
        if (locked) {
          ctx.arc(ix + size * 0.5, iy + size * 0.42, size * 0.22, Math.PI, 0, false);
        } else {
          ctx.arc(ix + size * 0.42, iy + size * 0.42, size * 0.22, Math.PI * 0.9, Math.PI * 1.95, false);
        }
        ctx.stroke();
        ctx.restore();
      };
      const drawActiveStateIcon = (ix, iy, size, active) => {
        ctx.save();
        ctx.strokeStyle = active ? "#4cc9f0" : "#8fa0b2";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(ix + size * 0.5, iy + size * 0.5, Math.max(2, size * 0.32), 0, Math.PI * 2);
        ctx.stroke();
        if (active) {
          ctx.fillStyle = "#4cc9f0";
          ctx.beginPath();
          ctx.arc(ix + size * 0.5, iy + size * 0.5, Math.max(1.6, size * 0.18), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };
      const rightPad = 10;
      const nameX = c.x + 10;
      const nameTopY = c.y + 5;
      const bottomY = c.y + c.h - 8;
      const iconY = bottomY - Math.floor(iconSize * 0.5);
      const opacityText = c.layerOpacityText || "";
      const fullName = c.layerName || c.text;
      let displayName = fullName;
      ctx.fillStyle = "#edf2f7";
      ctx.font = "bold 13px Arial";
      ctx.textBaseline = "top";
      const maxNameWidth = Math.max(32, previewX - nameX - 8);
      if (ctx.measureText(displayName).width > maxNameWidth) {
        displayName = fullName;
        while (displayName.length > 1 && ctx.measureText(`${displayName}...`).width > maxNameWidth) {
          displayName = displayName.slice(0, -1);
        }
        displayName = `${displayName}...`;
      }
      ctx.fillText(displayName, nameX, nameTopY);
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 11px Arial";
      let statusX = c.x + 10;
      drawActiveStateIcon(statusX, iconY, iconSize, activeLayerItem);
      statusX += iconSize + iconGap;
      if (opacityText) {
        ctx.fillText(opacityText, statusX, bottomY);
        statusX += Math.ceil(ctx.measureText(opacityText).width) + iconGap;
      }
      drawVisibilityIcon(statusX, iconY, iconSize, c.layerHidden !== true);
      statusX += iconSize + iconGap;
      drawLockIcon(statusX, iconY, iconSize, c.layerLocked === true);
    } else {
      ctx.fillStyle = c.layerHidden ? "#8fa0b2" : "#edf2f7";
      ctx.font = c.kind === "frame" ? "12px Arial" : "13px Arial";
      if (c.centerText) {
        const textW = ctx.measureText(c.text).width;
        ctx.fillText(c.text, c.x + Math.max(8, Math.floor((c.w - textW) * 0.5)), c.y + c.h / 2);
      } else if (inLeftSidebar && c.text && c.text.length > 12 && !c.shortcut) {
        const lines = this.wrapSidebarText(ctx, c.text, Math.max(24, c.w - 20));
        const lineH = 12;
        const baseY = c.y + Math.max(10, Math.floor((c.h - Math.min(lines.length, 3) * lineH) * 0.5)) + 2;
        lines.slice(0, 3).forEach((line, index) => {
          ctx.fillText(line, c.x + 10 + (index === 0 ? 0 : 12), baseY + index * lineH);
        });
      } else {
        ctx.fillText(c.text, c.x + 10, c.y + c.h / 2);
      }
      if (c.accordionHeader) {
        const arrow = c.accordionOpen ? "-" : "+";
        const arrowW = ctx.measureText(arrow).width;
        ctx.fillText(arrow, c.x + c.w - arrowW - 10, c.y + c.h / 2);
      }
      if (Object.prototype.hasOwnProperty.call(c, "menuSwatchColor")) {
        const swatchW = 14;
        const swatchH = 12;
        const shortcutW = c.shortcut ? ctx.measureText(`[${c.shortcut}]`).width + 14 : 0;
        const swatchX = c.x + c.w - swatchW - 10 - shortcutW;
        const swatchY = c.y + Math.floor((c.h - swatchH) * 0.5);
        const colorToken = String(c.menuSwatchColor || "").trim();
        const hasColor = colorToken.length > 0;
        if (hasColor) {
          ctx.fillStyle = colorToken;
          ctx.fillRect(swatchX + 1, swatchY + 1, swatchW - 2, swatchH - 2);
        } else {
          ctx.fillStyle = "#2a3948";
          ctx.fillRect(swatchX + 1, swatchY + 1, swatchW - 2, swatchH - 2);
          ctx.strokeStyle = "#8fa0b2";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(swatchX + 2, swatchY + swatchH - 2);
          ctx.lineTo(swatchX + swatchW - 2, swatchY + 2);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1;
        ctx.strokeRect(swatchX + 0.5, swatchY + 0.5, swatchW - 1, swatchH - 1);
      }
    }
    if (activeLayerItem) {
      ctx.fillStyle = "#4cc9f0";
      ctx.fillRect(c.x + 2, c.y + 2, 4, c.h - 4);
      if (!c.layerVisibilityToggle && !c.layerInlineState) {
        ctx.font = "bold 10px Arial";
        const badge = "ACTIVE";
        const badgeWidth = ctx.measureText(badge).width;
        ctx.fillText(badge, c.x + c.w - badgeWidth - 12, c.y + 8);
      }
    }
    if (c.marqueeSelected) {
      const dash = Math.max(2, Math.floor(Math.min(c.w, c.h) / 5));
      const offset = -Math.floor(performance.now() / 80);
      ctx.save();
      ctx.setLineDash([dash, 2]);
      ctx.lineDashOffset = offset;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.25;
      ctx.strokeRect(c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3);
      ctx.lineDashOffset = offset + dash;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3.25;
      ctx.strokeRect(c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3);
      ctx.restore();
      ctx.lineWidth = 1;
    }
    if (c.isCommandRow && c.category) {
      ctx.fillStyle = "#91a3b6";
      ctx.font = "11px Arial";
      ctx.fillText(String(c.category).slice(0, 12), c.x + 10, c.y + 11);
      ctx.fillStyle = "#edf2f7";
      ctx.font = "13px Arial";
    }
    if (c.shortcut) {
      ctx.fillStyle = "#91a3b6";
      const t = `[${c.shortcut}]`;
      const w = ctx.measureText(t).width;
      ctx.fillText(t, c.x + c.w - w - 10, c.y + c.h / 2);
    }
    if (c.kind === "frame") {
      const f = this.app.document.frames[c.frameIndex];
      drawCanvasPixelPreview(ctx, this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), { x: c.x + c.w - 54, y: c.y + 8, w: 46, h: c.h - 16 }, {
        cols: this.app.document.cols,
        rows: this.app.document.rows
      });
    }
    if (clipped) ctx.restore();
  };

  SpriteEditorCanvasControlSurface.prototype.drawPaletteSidebarScrollbar = function drawPaletteSidebarScrollbar(ctx) {
    const metrics = this.app.paletteSidebarMetrics;
    if (!metrics || metrics.maxScroll <= 0) return;
    const trackX = metrics.scrollbarX;
    const trackY = metrics.y;
    const trackH = metrics.h;
    const trackW = metrics.scrollbarW;
    const thumbH = Math.max(28, Math.floor((trackH / metrics.contentHeight) * trackH));
    const thumbTravel = Math.max(0, trackH - thumbH);
    const thumbY = trackY + Math.floor((this.app.paletteSidebarScroll / metrics.maxScroll) * thumbTravel);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(trackX, trackY, trackW, trackH);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.strokeRect(trackX + 0.5, trackY + 0.5, trackW - 1, trackH - 1);
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(trackX + 1, thumbY + 1, trackW - 2, Math.max(12, thumbH - 2));
  };
}

export { installControlSurfaceDraw };
