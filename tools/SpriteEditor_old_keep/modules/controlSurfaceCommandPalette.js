import { LOGICAL_H, LOGICAL_W } from "./constants.js";
import { xyInRect } from "../../../src/engine/utils/index.js";

function installControlSurfaceCommandPalette(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.toggleFavoriteAt = function toggleFavoriteAt(x, y) {
    if (!this.commandPaletteOpen) return false;
    for (let i = 0; i < this.commandPaletteRowControls.length; i += 1) {
      const c = this.commandPaletteRowControls[i];
      if (!c.isCommandRow || !c.favoriteToggleRect) continue;
      if (xyInRect(x, y, c.favoriteToggleRect)) {
        this.app.toggleFavoriteAction(c.commandId);
        this.rebuildCommandPaletteRows();
        return true;
      }
    }
    return false;
  };

  SpriteEditorCanvasControlSurface.prototype.openCommandPalette = function openCommandPalette(items) {
    this.commandPaletteItems = Array.isArray(items) ? items.slice() : [];
    this.commandPaletteQuery = "";
    this.commandPaletteOpen = true;
    this.commandPaletteSelectedIndex = 0;
    this.rebuildCommandPaletteRows();
  };

  SpriteEditorCanvasControlSurface.prototype.closeCommandPalette = function closeCommandPalette() {
    this.commandPaletteOpen = false;
    this.commandPaletteBounds = null;
    this.commandPaletteRowControls = [];
    this.commandPaletteFiltered = [];
    this.commandPaletteQuery = "";
    this.commandPaletteSelectedIndex = 0;
  };

  SpriteEditorCanvasControlSurface.prototype.setCommandPaletteQuery = function setCommandPaletteQuery(query) {
    this.commandPaletteQuery = query;
    this.commandPaletteSelectedIndex = 0;
    this.rebuildCommandPaletteRows();
  };

  SpriteEditorCanvasControlSurface.prototype.moveCommandPaletteSelection = function moveCommandPaletteSelection(delta) {
    if (!this.commandPaletteOpen || !this.commandPaletteFiltered.length) return;
    const next = this.commandPaletteSelectedIndex + delta;
    const max = this.commandPaletteFiltered.length - 1;
    this.commandPaletteSelectedIndex = Math.max(0, Math.min(max, next));
    this.rebuildCommandPaletteRows();
  };

  SpriteEditorCanvasControlSurface.prototype.activateCommandPaletteSelection = function activateCommandPaletteSelection() {
    if (!this.commandPaletteOpen || !this.commandPaletteFiltered.length) return false;
    const selected = this.commandPaletteFiltered[this.commandPaletteSelectedIndex];
    if (!selected || typeof selected.action !== "function") return false;
    selected.action();
    this.closeCommandPalette();
    return true;
  };

  SpriteEditorCanvasControlSurface.prototype.rebuildCommandPaletteRows = function rebuildCommandPaletteRows() {
    if (!this.commandPaletteOpen) return;
    const frame = this.layout.appFrame;
    const panelW = Math.min(760, frame.width - 160);
    const topBiasY = frame.y + Math.floor(frame.height * 0.16);
    const panelX = frame.x + Math.floor((frame.width - panelW) * 0.5);
    const rowH = 36;
    const headerH = 64;
    const footerH = 20;
    const maxRows = 10;
    this.commandPaletteFiltered = this.app.getRankedCommandPaletteItems(this.commandPaletteItems, this.commandPaletteQuery);
    const rowCount = Math.min(maxRows, Math.max(1, this.commandPaletteFiltered.length));
    const panelH = headerH + footerH + rowCount * rowH + 16;
    const panelY = Math.max(frame.y + 12, Math.min(topBiasY, frame.y + frame.height - panelH - 12));
    this.commandPaletteBounds = { x: panelX, y: panelY, w: panelW, h: panelH, rowH, headerH, footerH, rowCount };
    this.commandPaletteSelectedIndex = Math.max(0, Math.min(this.commandPaletteSelectedIndex, Math.max(0, this.commandPaletteFiltered.length - 1)));
    this.commandPaletteRowControls = [];
    const visible = this.commandPaletteFiltered.slice(0, maxRows);
    visible.forEach((item, idx) => {
      this.commandPaletteRowControls.push({
        kind: "button",
        id: `cmd-row-${idx}`,
        x: panelX + 12,
        y: panelY + headerH + (idx * rowH),
        w: panelW - 24,
        h: rowH - 4,
        text: item.label,
        action: item.action,
        isCommandRow: true,
        selected: idx === this.commandPaletteSelectedIndex,
        shortcut: item.shortcut || "",
        category: item.category || "",
        score: item.score || 0,
        commandId: item.id,
        favorite: !!item.favorite,
        favoriteToggleRect: null
      });
    });
  };

  SpriteEditorCanvasControlSurface.prototype.drawCommandPalette = function drawCommandPalette(ctx) {
    if (!this.commandPaletteOpen || !this.commandPaletteBounds) return;
    const p = this.commandPaletteBounds;
    ctx.fillStyle = "rgba(2, 6, 12, 0.58)";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.fillStyle = "#162435";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = "#4cc9f0";
    ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
    ctx.fillStyle = "#dbe7f3";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Command Palette", p.x + 14, p.y + 20);
    ctx.font = "13px Arial";
    const q = this.commandPaletteQuery ? this.commandPaletteQuery : "(type to search)";
    ctx.fillStyle = this.commandPaletteQuery ? "#e6f2ff" : "#91a3b6";
    ctx.fillText(`> ${q}`, p.x + 14, p.y + 44);
    if (!this.commandPaletteFiltered.length) {
      ctx.fillStyle = "#91a3b6";
      ctx.fillText("No matching commands.", p.x + 14, p.y + p.headerH + 20);
    } else {
      this.commandPaletteRowControls.forEach((c) => this.drawControl(ctx, c));
    }
    ctx.fillStyle = "#91a3b6";
    ctx.font = "12px Arial";
    ctx.fillText("Up/Down navigate  Enter execute", p.x + 14, p.y + p.h - 10);
  };
}

export { installControlSurfaceCommandPalette };
