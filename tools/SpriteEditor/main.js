import { SpriteEditorApp } from "./modules/app.js";

const canvas = document.getElementById("spriteEditorCanvas");
const fileInput = document.getElementById("spriteEditorFileInput");
const downloadLink = document.getElementById("spriteEditorDownloadLink");

const app = new SpriteEditorApp(canvas, fileInput, downloadLink);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function truncateText(ctx, text, maxWidth) {
  let next = String(text || "");
  if (ctx.measureText(next).width <= maxWidth) return next;
  while (next.length > 1 && ctx.measureText(`${next}...`).width > maxWidth) {
    next = next.slice(0, -1);
  }
  return `${next}...`;
}

function installV72InteractionStabilization(targetApp) {
  const surface = targetApp.controlSurface;

  delete targetApp.keybindings["ctrl+w"];
  delete targetApp.keybindings["ctrl+shift+w"];
  delete targetApp.keybindings["backspace"];

  targetApp.moveLayerUp = function moveLayerUpPatched() {
    this.reorderActiveLayer(1, "Layer Reorder Up", "Layer moved up.", "Layer already at top.");
  };

  targetApp.moveLayerDown = function moveLayerDownPatched() {
    this.reorderActiveLayer(-1, "Layer Reorder Down", "Layer moved down.", "Layer already at bottom.");
  };

  targetApp.commitSelectionMove = function commitSelectionMovePatched() {
    if (!this.selectionMoveSession) return;
    const session = this.selectionMoveSession;
    const sourceRect = session.sourceRect;
    if (!sourceRect || !this.document.activeLayer || !Array.isArray(this.document.activeLayer.pixels)) {
      this.selectionMoveSession = null;
      return;
    }
    const maxLeft = -sourceRect.x;
    const maxRight = this.document.cols - (sourceRect.x + sourceRect.width);
    const maxUp = -sourceRect.y;
    const maxDown = this.document.rows - (sourceRect.y + sourceRect.height);
    const offsetX = clamp(Math.trunc(session.offsetX || 0), maxLeft, maxRight);
    const offsetY = clamp(Math.trunc(session.offsetY || 0), maxUp, maxDown);
    if (offsetX || offsetY) {
      const frame = this.document.activeLayer.pixels;
      for (let y = 0; y < sourceRect.height; y += 1) {
        const sy = sourceRect.y + y;
        if (!frame[sy]) continue;
        for (let x = 0; x < sourceRect.width; x += 1) {
          const sx = sourceRect.x + x;
          if (sx < 0 || sx >= this.document.cols) continue;
          frame[sy][sx] = null;
        }
      }
      const nx = sourceRect.x + offsetX;
      const ny = sourceRect.y + offsetY;
      const block = session.block && Array.isArray(session.block.pixels)
        ? session.block.pixels
        : [];
      for (let y = 0; y < sourceRect.height; y += 1) {
        const dy = ny + y;
        if (!frame[dy]) continue;
        for (let x = 0; x < sourceRect.width; x += 1) {
          const dx = nx + x;
          if (dx < 0 || dx >= this.document.cols) continue;
          const row = block[y];
          const value = Array.isArray(row) ? row[x] : null;
          frame[dy][dx] = value;
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
  };

  const baseOnWheel = targetApp.onWheel.bind(targetApp);
  targetApp.onWheel = function onWheelPatched(e) {
    const point = this.logicalPointFromEvent(e);
    const metrics = this.paletteSidebarMetrics;
    if (
      point &&
      metrics &&
      point.x >= metrics.x &&
      point.y >= metrics.y &&
      point.x <= metrics.scrollbarX + metrics.scrollbarW &&
      point.y <= metrics.y + metrics.h &&
      metrics.maxScroll > 0
    ) {
      e.preventDefault();
      const stride = Math.max(1, metrics.rowStride || ((metrics.sh || 18) + (metrics.gap || 0)));
      const direction = Math.sign(e.deltaY);
      if (!direction) return;
      const next = clamp((this.paletteSidebarScroll || 0) + direction * stride, 0, metrics.maxScroll);
      this.paletteSidebarScroll = next < 1 ? 0 : (metrics.maxScroll - next < 1 ? metrics.maxScroll : next);
      this.renderAll();
      return;
    }
    baseOnWheel(e);
  };

  const baseOnKeyDown = targetApp.onKeyDown.bind(targetApp);
  targetApp.onKeyDown = function onKeyDownPatched(e) {
    const key = String(e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === "w") return;
    if (this.controlSurface.commandPaletteOpen && key === "escape") {
      e.preventDefault();
      return;
    }
    if (!this.isTypingTarget(e.target) && key === "backspace" && !this.controlSurface.commandPaletteOpen) {
      const canceled = this.cancelActiveInteraction();
      if (canceled) {
        this.showMessage(canceled);
        this.renderAll();
      }
      e.preventDefault();
      return;
    }
    baseOnKeyDown(e);
  };

  targetApp.tick = function tickPatched(ts) {
    if (this.playback.isPlaying) {
      const frameDuration = 1000 / this.playback.fps;
      if (ts - this.playback.lastTick >= frameDuration) {
        this.playback.lastTick = ts;
        const range = this.getPlaybackRange();
        const start = range.enabled ? range.startFrame : 0;
        const end = range.enabled ? range.endFrame : Math.max(0, this.document.frames.length - 1);
        let next = this.playback.previewFrameIndex;
        if (next < start || next > end) {
          next = start;
        } else if (next < end) {
          next += 1;
        } else if (this.playback.loop) {
          next = start;
        } else {
          this.playback.isPlaying = false;
          next = end;
        }
        this.playback.previewFrameIndex = next;
        this.document.activeFrameIndex = next;
        this.renderAll();
      }
    }
    requestAnimationFrame((t) => this.tick(t));
  };

  const baseGetHelpSections = targetApp.getHelpSections.bind(targetApp);
  targetApp.getHelpSections = function getHelpSectionsPatched() {
    const sections = baseGetHelpSections();
    if (!sections.palette) {
      sections.palette = {
        title: "Palette",
        description: "Choose and sort colors used for painting.",
        howToUse: "Pick colors in the right sidebar, then use Palette menu actions for presets and replace workflows.",
        options: [
          "Scroll the swatch list to reach the full palette.",
          "Sort by Name, Hue, Saturation, or Lightness.",
          "Set source/target colors, then apply replace scope."
        ]
      };
    }
    return sections;
  };

  targetApp.drawAboutPopup = function drawAboutPopupPatched() {
    if (!this.aboutPopup.open) return;
    const frame = this.controlSurface.layout.appFrame;
    const panelW = 520;
    const panelH = 212;
    const x = Math.floor(frame.x + (frame.width - panelW) * 0.5);
    const y = Math.floor(frame.y + (frame.height - panelH) * 0.26);
    const ctx = this.ctx;
    this.aboutPopup.panelRect = { x, y, w: panelW, h: panelH };
    ctx.fillStyle = "rgba(2, 6, 12, 0.62)";
    ctx.fillRect(0, 0, this.viewport.logicalWidth, this.viewport.logicalHeight);
    ctx.fillStyle = "#162435";
    ctx.fillRect(x, y, panelW, panelH);
    ctx.strokeStyle = "#4cc9f0";
    ctx.strokeRect(x + 0.5, y + 0.5, panelW - 1, panelH - 1);
    ctx.fillStyle = "#dbe7f3";
    ctx.font = "bold 18px Arial";
    ctx.fillText("About Sprite Editor", x + 18, y + 28);
    ctx.font = "13px Arial";
    ctx.fillStyle = "#b9c8d8";
    ctx.fillText("Sprite Editor v2.2", x + 18, y + 58);
    ctx.fillText("Canvas-native pixel editor for game-ready sprite workflows.", x + 18, y + 82);
    ctx.fillText("toolboxaid.com", x + 18, y + 116);
    ctx.fillText("github.com/ToolboxAid/HTML-JavaScript-Gaming", x + 18, y + 140);
    const closeRect = { x: x + panelW - 116, y: y + panelH - 50, w: 96, h: 32 };
    this.aboutPopup.closeRect = closeRect;
    ctx.fillStyle = "#244d67";
    ctx.fillRect(closeRect.x, closeRect.y, closeRect.w, closeRect.h);
    ctx.strokeStyle = "#4cc9f0";
    ctx.strokeRect(closeRect.x + 0.5, closeRect.y + 0.5, closeRect.w - 1, closeRect.h - 1);
    ctx.fillStyle = "#edf2f7";
    ctx.font = "12px Arial";
    ctx.fillText("Close", closeRect.x + 31, closeRect.y + 19);
  };

  const baseDrawControl = surface.drawControl.bind(surface);
  surface.drawControl = function drawControlPatched(ctx, control) {
    if (control && control.isCommandRow) {
      const hovered = this.hovered === control.id;
      const selected = !!control.selected;
      ctx.fillStyle = selected ? "#2d5169" : (hovered ? "#223444" : "#1a2733");
      ctx.fillRect(control.x, control.y, control.w, control.h);
      ctx.strokeStyle = selected ? "#4cc9f0" : "rgba(255,255,255,0.18)";
      ctx.strokeRect(control.x + 0.5, control.y + 0.5, control.w - 1, control.h - 1);
      ctx.fillStyle = "#edf2f7";
      ctx.font = "13px Arial";
      const shortcut = control.shortcut ? `[${control.shortcut}]` : "";
      const shortcutWidth = shortcut ? ctx.measureText(shortcut).width : 0;
      const maxTextW = Math.max(30, control.w - shortcutWidth - 30);
      const label = truncateText(ctx, control.text, maxTextW);
      ctx.fillText(label, control.x + 10, control.y + (control.h * 0.5));
      if (shortcut) {
        ctx.fillStyle = "#91a3b6";
        ctx.fillText(shortcut, control.x + control.w - shortcutWidth - 10, control.y + (control.h * 0.5));
      }
      return;
    }
    if (control && typeof control.layerIndex === "number" && !control.layerVisibilityToggle) {
      const hovered = this.hovered === control.id;
      const pressed = this.pressed === control.id;
      const activeLayer = this.app.document.activeFrame.activeLayerIndex === control.layerIndex;
      ctx.fillStyle = pressed ? "#27435a" : (hovered ? "#223444" : "#1a2733");
      if (activeLayer) ctx.fillStyle = "#244d67";
      ctx.fillRect(control.x, control.y, control.w, control.h);
      ctx.strokeStyle = activeLayer ? "#4cc9f0" : "rgba(255,255,255,0.15)";
      ctx.strokeRect(control.x + 0.5, control.y + 0.5, control.w - 1, control.h - 1);
      const opacityText = String(control.layerOpacityText || "");
      ctx.font = "bold 11px Arial";
      const opacityW = opacityText ? ctx.measureText(opacityText).width : 0;
      const nameMaxW = Math.max(38, control.w - opacityW - 24);
      ctx.fillStyle = "#edf2f7";
      ctx.font = "bold 13px Arial";
      ctx.fillText(truncateText(ctx, control.layerName || control.text, nameMaxW), control.x + 10, control.y + 13);
      if (opacityText) {
        ctx.fillStyle = "#dbe7f3";
        ctx.font = "bold 11px Arial";
        ctx.fillText(opacityText, control.x + control.w - opacityW - 10, control.y + 13);
      }
      ctx.fillStyle = "#9fb8cf";
      ctx.font = "11px Arial";
      ctx.fillText(truncateText(ctx, control.layerStateText || "", control.w - 20), control.x + 10, control.y + control.h - 11);
      if (activeLayer) {
        ctx.fillStyle = "#4cc9f0";
        ctx.fillRect(control.x + 2, control.y + 2, 4, control.h - 4);
      }
      if (control.layerLocked) {
        ctx.strokeStyle = "#f59e0b";
        ctx.strokeRect(control.x + control.w - 24.5, control.y + control.h - 19.5, 14, 14);
      }
      return;
    }
    baseDrawControl(ctx, control);
  };

  const baseRebuildCommandPaletteRows = surface.rebuildCommandPaletteRows.bind(surface);
  surface.rebuildCommandPaletteRows = function rebuildCommandPaletteRowsPatched() {
    baseRebuildCommandPaletteRows();
    if (!this.commandPaletteOpen) return;
    this.commandPaletteRowControls.forEach((row) => {
      row.category = "";
      row.favoriteToggleRect = null;
    });
  };
}

installV72InteractionStabilization(app);
