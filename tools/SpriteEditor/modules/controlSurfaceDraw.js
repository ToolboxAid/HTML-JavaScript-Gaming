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
    ctx.fillStyle = performance.now() < this.app.flashMessageUntil ? "#4cc9f0" : "#91a3b6";
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
    const inLeftSidebar = this.layout && this.layout.leftPanel && c.x >= this.layout.leftPanel.x && c.x < (this.layout.leftPanel.x + this.layout.leftPanel.width);
    if (c.kind === "label") {
      if (c.id === "palette-current") {
        const currentHex = String(this.app.document.currentColor || "").toUpperCase();
        let name = "Unnamed";
        const presetEntries = typeof this.app.getActivePresetEntries === "function" ? this.app.getActivePresetEntries() : null;
        if (Array.isArray(presetEntries)) {
          const match = presetEntries.find((entry) => entry && String(entry.hex || "").toUpperCase() === currentHex && typeof entry.name === "string" && entry.name.trim());
          if (match) name = match.name.trim();
        }
        const baseY = c.y + c.h / 2;
        ctx.fillStyle = "#91a3b6";
        ctx.font = "bold 12px Arial";
        const leftText = `Current: ${currentHex}  ■   Named: ${name}`;
        ctx.fillText(leftText, c.x, baseY);
        const leftWidth = ctx.measureText(`Current: ${currentHex} `).width;
        const sw = 12;
        const sh = 12;
        const swatchX = c.x + leftWidth + 4;
        const swatchY = Math.floor(baseY - sh * 0.75);
        ctx.fillStyle = currentHex;
        ctx.fillRect(swatchX, swatchY, sw, sh);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(swatchX + 0.5, swatchY + 0.5, sw - 1, sh - 1);
        return;
      }
      ctx.fillStyle = "#91a3b6";
      ctx.font = "bold 12px Arial";
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
      return;
    }
    if (c.kind === "palette") {
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      const current = this.app.document.currentColor === c.color;
      ctx.strokeStyle = current ? "#4cc9f0" : "rgba(255,255,255,0.2)";
      ctx.lineWidth = current ? 3 : 1;
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
      if (this.app.paletteWorkflow.source === c.color) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(c.x + 2, c.y + 2, 8, 8);
      }
      if (this.app.paletteWorkflow.target === c.color) {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(c.x + c.w - 10, c.y + 2, 8, 8);
      }
      ctx.lineWidth = 1;
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
    if (dragTarget) ctx.fillStyle = "#305c4a";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = (toolActive || activeFrame || activeLayerItem || dragTarget || sortModeActive) ? "#4cc9f0" : "rgba(255,255,255,0.15)";
    if (c.isCommandRow && c.selected) ctx.strokeStyle = "#4cc9f0";
    ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
    if (c.layerVisibilityToggle) {
      ctx.fillStyle = c.layerHidden ? "#8fa0b2" : "#edf2f7";
      ctx.font = "bold 12px Arial";
      ctx.fillText(c.layerHidden ? "Show" : "Hide", c.x + 9, c.y + c.h / 2);
    } else if (typeof c.layerIndex === "number") {
      ctx.fillStyle = "#edf2f7";
      ctx.font = "bold 13px Arial";
      const opacityText = c.layerOpacityText || "";
      const activeBadgeText = activeLayerItem ? "ACTIVE" : "";
      const activeBadgeWidth = activeBadgeText ? ctx.measureText(activeBadgeText).width : 0;
      const opacityWidth = opacityText ? ctx.measureText(opacityText).width : 0;
      const maxNameWidth = Math.max(32, c.w - opacityWidth - activeBadgeWidth - 38);
      const fullName = c.layerName || c.text;
      let displayName = fullName;
      if (ctx.measureText(displayName).width > maxNameWidth) {
        displayName = fullName;
        while (displayName.length > 1 && ctx.measureText(`${displayName}...`).width > maxNameWidth) {
          displayName = displayName.slice(0, -1);
        }
        displayName = `${displayName}...`;
      }
      ctx.fillText(displayName, c.x + 10, c.y + 13);
      ctx.fillStyle = "#9fb8cf";
      ctx.font = "11px Arial";
      ctx.fillText(c.layerStateText || "", c.x + 10, c.y + c.h - 11);
      if (opacityText) {
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "bold 11px Arial";
        ctx.fillText(opacityText, c.x + c.w - opacityWidth - activeBadgeWidth - 18, c.y + 13);
      }
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
    }
    if (activeLayerItem) {
      ctx.fillStyle = "#4cc9f0";
      ctx.fillRect(c.x + 2, c.y + 2, 4, c.h - 4);
      if (!c.layerVisibilityToggle) {
        ctx.font = "bold 10px Arial";
        const badge = "ACTIVE";
        const badgeWidth = ctx.measureText(badge).width;
        ctx.fillText(badge, c.x + c.w - badgeWidth - 12, c.y + 13);
      }
    }
    if (c.layerLocked) {
      ctx.strokeStyle = "#f59e0b";
      ctx.strokeRect(c.x + c.w - 24.5, c.y + c.h - 19.5, 14, 14);
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
