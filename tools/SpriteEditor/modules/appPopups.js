import { getCenteredRect } from "../../../engine/utils/index.js";
import {
  createCanvasPopupState,
  dismissCanvasPopup,
  drawCanvasDialogButton,
  drawCanvasModalFrame,
  handleCanvasPopupDismissPointer,
  openCanvasTransientSurface,
  resetCanvasPopupState
} from "../../../engine/ui/index.js";

function installSpriteEditorPopupMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    requestReplaceGuard(title, message, onConfirm, forcePrompt = false) {
      if (!forcePrompt && !this.isDirty) {
        if (typeof onConfirm === "function") onConfirm();
        return;
      }
      this.controlSurface.closeOverflowPanel();
      this.controlSurface.closeCommandPalette();
      this.closeLayerRenamePrompt();
      this.replaceGuard = createCanvasPopupState({
        open: true,
        title,
        message,
        onConfirm,
        confirmRect: null,
        cancelRect: null
      });
      this.showMessage("Unsaved changes. Confirm or cancel.");
    },

    closeReplaceGuard() {
      resetCanvasPopupState(this.replaceGuard, { title: "", message: "", onConfirm: null, confirmRect: null, cancelRect: null });
    },

    handleReplaceGuardPointer(p) {
      if (!this.replaceGuard.open || !p) return false;
      if (this.isPointInRect(p, this.replaceGuard.confirmRect)) {
        const fn = this.replaceGuard.onConfirm;
        this.closeReplaceGuard();
        if (typeof fn === "function") fn();
        this.renderAll();
        return true;
      }
      if (this.isPointInRect(p, this.replaceGuard.cancelRect)) {
        return dismissCanvasPopup({
          close: () => this.closeReplaceGuard(),
          showMessage: (message) => this.showMessage(message),
          render: () => this.renderAll(),
          message: "Replace canceled."
        });
      }
      return true;
    },

    isLayerRenameOpen() {
      return !!(this.layerRenamePrompt && this.layerRenamePrompt.open);
    },

    canOpenTransientSurface() {
      if (this.replaceGuard.open) {
        this.showMessage("Finish current confirm/cancel first.");
        return false;
      }
      if (this.isLayerRenameOpen()) {
        this.showMessage("Finish layer rename first.");
        return false;
      }
      return true;
    },

    closeMenuLikeSurfaces() {
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.closePalettePresetPopup();
      this.controlSurface.closeOverflowPanel();
      this.controlSurface.closeCommandPalette();
    },

    openLayerRenamePrompt() {
      return openCanvasTransientSurface({
        canOpen: () => this.canOpenTransientSurface(),
        closeOthers: () => this.closeMenuLikeSurfaces(),
        open: () => {
          const af = this.document.ensureFrameLayers(this.document.activeFrame);
          const active = af.layers[af.activeLayerIndex];
          this.layerRenamePrompt.open = true;
          this.layerRenamePrompt.text = active && active.name ? active.name : `Layer ${af.activeLayerIndex + 1}`;
        },
        showMessage: (message) => this.showMessage(message),
        render: () => this.renderAll(),
        message: "Rename layer: type, Enter apply, Backspace edits."
      });
    },

    closeAboutPopup() {
      resetCanvasPopupState(this.aboutPopup);
    },

    closePalettePresetPopup() {
      resetCanvasPopupState(this.palettePresetPopup, { backRect: null, rowRects: [] });
    },

    openPaletteLockPopup(message = "Palette is locked for this sprite/project.") {
      if (this.palettePresetPopup && this.palettePresetPopup.open) this.closePalettePresetPopup();
      this.paletteLockPopup.open = true;
      this.paletteLockPopup.message = message;
      this.paletteLockPopup.closeRect = null;
      this.renderAll();
      return true;
    },

    closePaletteLockPopup() {
      resetCanvasPopupState(this.paletteLockPopup, { message: "", closeRect: null });
    },

    closeHelpDetailPopup() {
      resetCanvasPopupState(this.helpDetailPopup, { section: "" });
    },

    getHelpSections() {
      return {
        file: {
          title: "Files",
          description: "Save, load, import, and export sprite work without leaving the canvas-first workflow.",
          howToUse: "Open Files from the top bar, then choose the storage or export action you want.",
          options: [
            "New / Open / Save: main document flow for starting, restoring, and saving work.",
            "Open uses the existing local browser save for fast restore.",
            "Import Editor JSON / Export Editor JSON: move full editor documents in and out.",
            "Export Sprite / Export GIF: direct asset exports without extra submenus."
          ]
        },
        edit: {
          title: "Edit",
          description: "Quick access to undo/redo and selection-driven edit actions.",
          howToUse: "Open Edit when you want command-style editing instead of direct canvas gestures.",
          options: [
            "Undo / Redo: step backward or forward through history.",
            "Copy / Cut / Paste: act on the current selection or stored clipboard data.",
            "Clear Selection: removes the current selection box.",
            "Duplicate Frame / Delete Frame: manage the active frame from one place."
          ]
        },
        tools: {
          title: "Tools",
          description: "Choose the active drawing or selection tool used on the main canvas.",
          howToUse: "Open Tools, select the tool you want, then draw or manipulate pixels in the grid.",
          options: [
            "Brush / Erase / Fill: core paint operations.",
            "Line / Rectangle / Fill Rectangle: pixel-perfect shape tools.",
            "Eyedropper: sample the active color from artwork.",
            "Select: create and move rectangular selections.",
            "Reference Image: open left-panel controls for Load, Fit Ref To Grid, and Reset Alignment."
          ]
        },
        frame: {
          title: "Frame",
          description: "Manage animation frames, ranges, and playback-ready frame ordering.",
          howToUse: "Open Frame for single-frame actions or range actions tied to the timeline selection.",
          options: [
            "Add / Duplicate / Delete / Copy / Paste Frame: standard frame operations.",
            "Duplicate Range / Delete Range / Shift Range: batch operations on contiguous selections.",
            "Clear Range Selection: return to a single-frame focus.",
            "Playback Range actions: set or clear the active preview/export segment."
          ]
        },
        layer: {
          title: "Layer",
          description: "Control layer structure, ordering, visibility, lock state, and compositing behavior.",
          howToUse: "Open Layer when you need to organize artwork beyond the active layer row controls.",
          options: [
            "Add / Duplicate / Delete / Rename: maintain the layer stack.",
            "Move Up / Move Down: reorder the active layer.",
            "Visibility / Lock: control what is seen and what is editable.",
            "Merge Down / Flatten / Opacity / Blend Preview: compositing tools for finishing work."
          ]
        },
        palette: {
          title: "Palette",
          description: "Choose colors, presets, sorting, and replace-color scope from the sidebar and top Palette menu.",
          howToUse: "Use Palette -> Palettes for preset lists, click sidebar swatches to choose colors, and use the sort buttons to reorganize the sidebar.",
          options: [
            "Palette -> Palettes: open the preset chooser.",
            "Sidebar swatches: select the current color, including large palettes with scrolling.",
            "Sort controls: reorder by Name, Hue, Saturation, or Lightness.",
            "Set Src From Current: marks source color, then status confirms source was set.",
            "Set Dst From Current: marks destination color, then status confirms destination was set.",
            "Scope Active Layer: replace affects active layer only, status shows Scope: Layer.",
            "Scope Current Frame: replace affects all layers in current frame, status shows Scope: Frame.",
            "Scope Selected Range: replace affects selected timeline range, status shows Scope: Range.",
            "Middle mouse or Shift-drag pan: move the zoomed canvas viewport."
          ]
        },
        help: {
          title: "Help",
          description: "A quick reference menu for understanding each major top-level area of the editor.",
          howToUse: "Open Help, choose the section you want, and read the focused detail popup.",
          options: [
            "Files / Edit / Tools / Frame / Layer: each entry explains its area and main actions.",
            "Help: describes how the reference system works.",
            "About: points to editor identity and quick orientation details."
          ]
        },
        about: {
          title: "About",
          description: "Overview of the Sprite Editor, its workflow intent, and where it fits in the toolset.",
          howToUse: "Use About for high-level orientation, then return to Help or the working menus for specifics.",
          options: [
            "Version and identity: confirms which editor surface you are using.",
            "Workflow summary: reinforces the canvas-native, game-ready editing approach.",
            "Shortcut reminders: points you to command palette and close-surface controls."
          ]
        }
      };
    },

    openHelpDetailPopup(section) {
      const sections = this.getHelpSections();
      if (!sections[section]) return false;
      return openCanvasTransientSurface({
        canOpen: () => this.canOpenTransientSurface(),
        closeOthers: () => this.closeMenuLikeSurfaces(),
        open: () => {
          this.helpDetailPopup.open = true;
          this.helpDetailPopup.section = section;
        },
        render: () => this.renderAll()
      });
    },

    handleHelpDetailPointer(p) {
      if (!this.helpDetailPopup.open || !p) return false;
      const dismissResult = handleCanvasPopupDismissPointer({
        point: p,
        popup: this.helpDetailPopup,
        containsPoint: (point, rect) => this.isPointInRect(point, rect),
        close: () => this.closeHelpDetailPopup(),
        showMessage: (message) => this.showMessage(message),
        render: () => this.renderAll(),
        closeMessage: "Help closed."
      });
      if (dismissResult !== null) return dismissResult;
      return true;
    },

    openAboutPopup() {
      return openCanvasTransientSurface({
        canOpen: () => this.canOpenTransientSurface(),
        closeOthers: () => this.closeMenuLikeSurfaces(),
        open: () => {
          this.aboutPopup.open = true;
        },
        render: () => this.renderAll()
      });
    },

    handleAboutPopupPointer(p) {
      if (!this.aboutPopup.open || !p) return false;
      const dismissResult = handleCanvasPopupDismissPointer({
        point: p,
        popup: this.aboutPopup,
        containsPoint: (point, rect) => this.isPointInRect(point, rect),
        close: () => this.closeAboutPopup(),
        showMessage: (message) => this.showMessage(message),
        render: () => this.renderAll(),
        closeMessage: "About closed."
      });
      if (dismissResult !== null) return dismissResult;
      return true;
    },

    handlePalettePresetPopupPointer(p) {
      if (!this.palettePresetPopup.open || !p) return false;
      const dismissResult = handleCanvasPopupDismissPointer({
        point: p,
        popup: this.palettePresetPopup,
        containsPoint: (point, rect) => this.isPointInRect(point, rect),
        close: () => this.closePalettePresetPopup(),
        showMessage: (message) => this.showMessage(message),
        render: () => this.renderAll(),
        closeMessage: "Palette presets closed."
      });
      if (dismissResult !== null) return dismissResult;
      if (this.isPointInRect(p, this.palettePresetPopup.backRect)) {
        this.closePalettePresetPopup();
        this.openPaletteWorkflowMenu();
        return true;
      }
      for (let i = 0; i < this.palettePresetPopup.rowRects.length; i += 1) {
        const row = this.palettePresetPopup.rowRects[i];
        if (!this.isPointInRect(p, row.rect)) continue;
        const ok = this.applyNamedPalette(row.name);
        if (ok) {
          dismissCanvasPopup({
            close: () => this.closePalettePresetPopup(),
            render: () => this.renderAll()
          });
        }
        return true;
      }
      return true;
    },

    handlePaletteLockPopupPointer(p) {
      if (!this.paletteLockPopup.open || !p) return false;
      if (this.isPointInRect(p, this.paletteLockPopup.closeRect)) {
        this.closePaletteLockPopup();
        this.renderAll();
        return true;
      }
      if (this.paletteLockPopup.panelRect && !this.isPointInRect(p, this.paletteLockPopup.panelRect)) {
        this.closePaletteLockPopup();
        this.renderAll();
        return true;
      }
      return true;
    },

    closeLayerRenamePrompt() {
      resetCanvasPopupState(this.layerRenamePrompt, { text: "", title: "Rename Layer", confirmRect: null, cancelRect: null });
    },

    confirmLayerRename() {
      if (!this.isLayerRenameOpen()) return false;
      const nextName = String(this.layerRenamePrompt.text || "").trim();
      const ok = this.executeWithHistory("Layer Rename", () => {
        const done = this.document.renameActiveLayer(nextName);
        if (done) this.showMessage(`Layer renamed: ${this.document.activeLayer.name}`);
        return done;
      });
      this.closeLayerRenamePrompt();
      if (ok) this.renderAll();
      else this.showMessageAndRender("Layer rename canceled.");
      return !!ok;
    },

    handleLayerRenamePointer(p) {
      if (!this.isLayerRenameOpen() || !p) return false;
      if (this.isPointInRect(p, this.layerRenamePrompt.confirmRect)) {
        this.confirmLayerRename();
        return true;
      }
      if (this.isPointInRect(p, this.layerRenamePrompt.cancelRect)) {
        return dismissCanvasPopup({
          close: () => this.closeLayerRenamePrompt(),
          showMessage: (message) => this.showMessage(message),
          render: () => this.renderAll(),
          message: "Layer rename canceled."
        });
      }
      if (this.layerRenamePrompt.panelRect && !this.isPointInRect(p, this.layerRenamePrompt.panelRect)) {
        return dismissCanvasPopup({
          close: () => this.closeLayerRenamePrompt(),
          showMessage: (message) => this.showMessage(message),
          render: () => this.renderAll(),
          message: "Layer rename canceled."
        });
      }
      return true;
    },

    drawHelpDetailPopup() {
      if (!this.helpDetailPopup.open) return;
      const section = this.getHelpSections()[this.helpDetailPopup.section];
      if (!section) {
        this.closeHelpDetailPopup();
        return;
      }
      const frame = this.controlSurface.layout.appFrame;
      this.helpDetailPopup.panelRect = getCenteredRect(frame, 620, 330);
      const { x, y, w: panelW, h: panelH } = this.helpDetailPopup.panelRect;
      drawCanvasModalFrame(this.ctx, { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight }, this.helpDetailPopup.panelRect);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 20px Arial";
      this.ctx.fillText(section.title, x + 20, y + 30);
      this.ctx.font = "13px Arial";
      this.ctx.fillStyle = "#9fb8cf";
      this.ctx.fillText("Short description", x + 20, y + 58);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.fillText(section.description, x + 20, y + 78);
      this.ctx.fillStyle = "#9fb8cf";
      this.ctx.fillText("How to use", x + 20, y + 108);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.fillText(section.howToUse, x + 20, y + 128);
      this.ctx.fillStyle = "#9fb8cf";
      this.ctx.fillText("Options", x + 20, y + 158);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "12px Arial";
      section.options.forEach((line, index) => {
        this.ctx.fillText(`- ${line}`, x + 20, y + 182 + index * 24);
      });
      const closeRect = { x: x + panelW - 116, y: y + panelH - 50, w: 96, h: 32 };
      this.helpDetailPopup.closeRect = closeRect;
      drawCanvasDialogButton(this.ctx, closeRect, "Close");
    },

    drawAboutPopup() {
      if (!this.aboutPopup.open) return;
      const frame = this.controlSurface.layout.appFrame;
      this.aboutPopup.panelRect = getCenteredRect(frame, 520, 216);
      const { x, y, w: panelW, h: panelH } = this.aboutPopup.panelRect;
      drawCanvasModalFrame(this.ctx, { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight }, this.aboutPopup.panelRect, "rgba(2, 6, 12, 0.62)");
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 18px Arial";
      this.ctx.fillText("About Sprite Editor", x + 18, y + 28);
      this.ctx.font = "13px Arial";
      this.ctx.fillStyle = "#b9c8d8";
      this.ctx.fillText("Sprite Editor v2.2", x + 18, y + 64);
      this.ctx.fillText("Canvas-native pixel editor for game-ready sprite workflows.", x + 18, y + 88);
      this.ctx.fillText("Top bar: Files, Edit, Tools, Frame, Layer, Palette, Help, About", x + 18, y + 112);
      this.ctx.fillText("toolboxaid.com", x + 18, y + 142);
      this.ctx.fillText("github.com/ToolboxAid/HTML-JavaScript-Gaming", x + 18, y + 166);
      const closeRect = { x: x + panelW - 116, y: y + panelH - 50, w: 96, h: 32 };
      this.aboutPopup.closeRect = closeRect;
      drawCanvasDialogButton(this.ctx, closeRect, "Close", { textOffsetX: 29 });
    },

    drawPalettePresetPopup() {
      if (!this.palettePresetPopup.open) return;
      const paletteLibrary = this.getProjectPaletteLibrary ? this.getProjectPaletteLibrary() : this.getPaletteLibrary();
      const rawList = paletteLibrary ? Object.keys(paletteLibrary) : [];
      const list = rawList.indexOf("default") >= 0 ? rawList.slice() : ["default"].concat(rawList);
      const frame = this.controlSurface.layout.appFrame;
      const panelW = Math.min(560, frame.width - 64);
      const rowH = 36;
      const headerH = 92;
      const footerH = 56;
      const panelH = Math.min(frame.height - 32, headerH + footerH + Math.max(1, list.length) * rowH + 16);
      const x = Math.max(frame.x + 12, Math.floor(frame.x + (frame.width - panelW) * 0.5));
      const y = Math.max(frame.y + 12, Math.floor(frame.y + (frame.height - panelH) * 0.5));
      const innerX = x + 18;
      const innerW = panelW - 36;
      this.palettePresetPopup.panelRect = { x, y, w: panelW, h: panelH };
      this.palettePresetPopup.rowRects = [];

      drawCanvasModalFrame(this.ctx, { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight }, this.palettePresetPopup.panelRect, "rgba(2, 6, 12, 0.72)");

      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 18px Arial";
      this.ctx.fillText("Palette Presets", x + 18, y + 28);
      this.ctx.font = "13px Arial";
      this.ctx.fillStyle = "#9fb8cf";
      this.ctx.fillText("Palette -> Palettes now opens a dedicated preset chooser.", x + 18, y + 52);
      this.ctx.fillText(`Current preset: ${this.currentPalettePreset || "default"}`, x + 18, y + 74);

      if (!list.length) {
        this.ctx.fillStyle = "#b9c8d8";
        this.ctx.font = "13px Arial";
        this.ctx.fillText("No palette presets available.", innerX, y + headerH + 18);
      } else {
        list.forEach((name, index) => {
          const isCurrent = String(this.currentPalettePreset || "").toLowerCase() === String(name).toLowerCase();
          const rowRect = { x: innerX, y: y + headerH + (index * rowH), w: innerW, h: rowH - 4 };
          this.palettePresetPopup.rowRects.push({ name, rect: rowRect });
          this.ctx.fillStyle = isCurrent ? "#244d67" : "#1a2733";
          this.ctx.fillRect(rowRect.x, rowRect.y, rowRect.w, rowRect.h);
          this.ctx.strokeStyle = isCurrent ? "#4cc9f0" : "rgba(255,255,255,0.22)";
          this.ctx.strokeRect(rowRect.x + 0.5, rowRect.y + 0.5, rowRect.w - 1, rowRect.h - 1);
          this.ctx.fillStyle = isCurrent ? "#fbbf24" : "#e6f2ff";
          this.ctx.font = "bold 13px Arial";
          this.ctx.fillText(name, rowRect.x + 14, rowRect.y + 13);
          this.ctx.font = "11px Arial";
          this.ctx.fillStyle = "#9fb8cf";
          this.ctx.fillText(isCurrent ? "Current preset" : "Click to apply preset", rowRect.x + 14, rowRect.y + 27);
          if (isCurrent) {
            const badge = "ACTIVE";
            this.ctx.fillStyle = "#4cc9f0";
            this.ctx.font = "bold 11px Arial";
            const badgeW = this.ctx.measureText(badge).width;
            this.ctx.fillText(badge, rowRect.x + rowRect.w - badgeW - 14, rowRect.y + 13);
          }
        });
      }

      const backRect = { x: x + 18, y: y + panelH - 38, w: 132, h: 24 };
      const closeRect = { x: x + panelW - 110, y: y + panelH - 38, w: 92, h: 24 };
      this.palettePresetPopup.backRect = backRect;
      this.palettePresetPopup.closeRect = closeRect;

      /* Only the fields passed here override the engine defaults for
       canvas dialog buttons.
       */
      drawCanvasDialogButton(this.ctx, backRect, "Back To Palette", {
        fillStyle: "#1a2733",
        strokeStyle: "rgba(255,255,255,0.22)",
        textStyle: "#edf2f7",
        textOffsetX: 15,
        textOffsetY: 14,
        font: "12px Arial"
      });
      /* Unspecified button fields still come from the engine
       default button style.
       */
      drawCanvasDialogButton(this.ctx, closeRect, "Close", {
        textOffsetX: 27,
        textOffsetY: 14,
        font: "12px Arial"
      });
    },

    drawReplaceGuard() {
      if (!this.replaceGuard.open) return;
      const ctx = this.ctx;
      const panelRect = {
        x: Math.floor((this.viewport.logicalWidth - 560) * 0.5),
        y: Math.floor((this.viewport.logicalHeight - 190) * 0.28),
        w: 560,
        h: 190
      };
      const { x, y, w, h } = panelRect;
      drawCanvasModalFrame(this.ctx, { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight }, panelRect, "rgba(2, 6, 12, 0.62)");
      ctx.fillStyle = "#dbe7f3";
      ctx.font = "bold 18px Arial";
      ctx.fillText(this.replaceGuard.title || "Confirm Replace", x + 18, y + 28);
      ctx.font = "13px Arial";
      ctx.fillStyle = "#b9c8d8";
      ctx.fillText(this.replaceGuard.message || "Unsaved changes will be lost.", x + 18, y + 64);
      ctx.fillText("This action replaces the current editor state.", x + 18, y + 86);
      const cancelRect = { x: x + w - 230, y: y + h - 56, w: 96, h: 34 };
      const confirmRect = { x: x + w - 122, y: y + h - 56, w: 104, h: 34 };
      this.replaceGuard.cancelRect = cancelRect;
      this.replaceGuard.confirmRect = confirmRect;
      drawCanvasDialogButton(this.ctx, cancelRect, "Cancel", {
        fillStyle: "#1a2733",
        strokeStyle: "rgba(255,255,255,0.2)",
        textStyle: "#edf2f7",
        textOffsetX: 22,
        textOffsetY: 22
      });
      drawCanvasDialogButton(this.ctx, confirmRect, "Replace", {
        textOffsetX: 24,
        textOffsetY: 22
      });
    },

    drawLayerRenamePrompt() {
      if (!this.isLayerRenameOpen()) return;
      const frame = this.controlSurface.layout.appFrame;
      this.layerRenamePrompt.panelRect = getCenteredRect(frame, 480, 154, 0.24);
      const { x, y, w: panelW, h: panelH } = this.layerRenamePrompt.panelRect;
      drawCanvasModalFrame(this.ctx, { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight }, this.layerRenamePrompt.panelRect, "rgba(2, 6, 12, 0.58)");
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 16px Arial";
      this.ctx.fillText("Rename Layer", x + 16, y + 24);
      this.ctx.font = "12px Arial";
      this.ctx.fillStyle = "#91a3b6";
      this.ctx.fillText("Enter apply  Backspace edits", x + 16, y + 44);
      this.ctx.fillStyle = "#101a24";
      this.ctx.fillRect(x + 16, y + 56, panelW - 32, 36);
      this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
      this.ctx.strokeRect(x + 16.5, y + 56.5, panelW - 33, 35);
      this.ctx.fillStyle = "#e6f2ff";
      this.ctx.font = "13px Arial";
      const renameText = (this.layerRenamePrompt.text || "").slice(0, 40) || "Layer";
      this.ctx.fillText(renameText, x + 24, y + 74);
      const btnW = 120;
      const btnH = 30;
      const gap = 10;
      const by = y + panelH - btnH - 14;
      this.layerRenamePrompt.confirmRect = { x: x + panelW - btnW * 2 - gap - 16, y: by, w: btnW, h: btnH };
      this.layerRenamePrompt.cancelRect = { x: x + panelW - btnW - 16, y: by, w: btnW, h: btnH };
      drawCanvasDialogButton(this.ctx, this.layerRenamePrompt.confirmRect, "Apply", {
        fillStyle: "#244d67",
        textStyle: "#edf2f7",
        textOffsetX: 43,
        textOffsetY: 19
      });
      drawCanvasDialogButton(this.ctx, this.layerRenamePrompt.cancelRect, "Cancel", {
        fillStyle: "#1a2733",
        strokeStyle: "rgba(255,255,255,0.2)",
        textStyle: "#edf2f7",
        textOffsetX: 38,
        textOffsetY: 19
      });
    },

    drawPaletteLockPopup() {
      if (!this.paletteLockPopup.open) return;
      const frame = this.controlSurface.layout.appFrame;
      const panelRect = getCenteredRect(frame, 520, 168, 0.24);
      const { x, y, w, h } = panelRect;
      drawCanvasModalFrame(this.ctx, { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight }, panelRect, "rgba(2, 6, 12, 0.70)");
      this.ctx.fillStyle = "#ef4444";
      this.ctx.font = "bold 18px Arial";
      this.ctx.fillText("Palette Locked", x + 18, y + 30);
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "13px Arial";
      this.ctx.fillText(this.paletteLockPopup.message || "Palette is locked for this sprite/project.", x + 18, y + 62);
      this.ctx.fillText("Palette cannot be changed after grid edits start.", x + 18, y + 86);
      const closeRect = { x: x + w - 112, y: y + h - 42, w: 92, h: 24 };
      this.paletteLockPopup.closeRect = closeRect;
      drawCanvasDialogButton(this.ctx, closeRect, "Close", { textOffsetX: 27, textOffsetY: 14, font: "12px Arial" });
    },

    drawPaletteConfigurationBlocker() {
      if (!this.isPaletteConfigurationBlocked()) return;
      const frame = this.controlSurface.layout.appFrame;
      const panelRect = getCenteredRect(frame, 680, 300, 0.24);
      const { x, y, w, h } = panelRect;
      drawCanvasModalFrame(
        this.ctx,
        { width: this.viewport.logicalWidth, height: this.viewport.logicalHeight },
        panelRect,
        "rgba(2, 6, 12, 0.78)"
      );
      this.ctx.fillStyle = "#dbe7f3";
      this.ctx.font = "bold 18px Arial";
      this.ctx.fillText("Palette Configuration Required", x + 20, y + 30);
      this.ctx.font = "13px Arial";
      this.ctx.fillStyle = "#fca5a5";
      this.ctx.fillText(this.paletteConfigBlockMessage || "Invalid palette configuration.", x + 20, y + 58);
      this.ctx.fillStyle = "#b9c8d8";
      this.ctx.fillText("How to fix:", x + 20, y + 88);
      this.ctx.fillText("1. Open engine/paletteList.js", x + 20, y + 112);
      this.ctx.fillText("2. Note: built-in default palette is allowed from document.getDefaultPalette().", x + 20, y + 136);
      this.ctx.fillText("3. Example preset format:", x + 20, y + 160);
      this.ctx.fillStyle = "#e2e8f0";
      this.ctx.font = "12px Consolas";
      this.ctx.fillText("myPreset: [{ hex: '#000000', name: 'Black' }, ...]", x + 30, y + 184);
      this.ctx.font = "13px Arial";
      this.ctx.fillStyle = "#b9c8d8";
      this.ctx.fillText("4. For non-default palettes, add a matching preset, then reload.", x + 20, y + 210);
      this.ctx.fillStyle = "#fbbf24";
      this.ctx.fillText("This popup is blocking by design until fixed.", x + 20, y + h - 18);
    }
  });
}

export { installSpriteEditorPopupMethods };
