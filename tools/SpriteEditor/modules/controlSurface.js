import { LOGICAL_H, LOGICAL_W } from "./constants.js";

class SpriteEditorCanvasControlSurface {
    constructor(app) {
      this.app = app;
      this.controls = [];
      this.overflowPanelOpen = false;
      this.overflowPanelBounds = null;
      this.overflowPanelControls = [];
      this.overflowAnchorControl = null;
      this.hiddenTopControls = [];
      this.menuItems = [];
      this.topMenuSource = null;
      this.commandPaletteOpen = false;
      this.commandPaletteQuery = "";
      this.commandPaletteItems = [];
      this.commandPaletteFiltered = [];
      this.commandPaletteSelectedIndex = 0;
      this.commandPaletteBounds = null;
      this.commandPaletteRowControls = [];
      this.hovered = null;
      this.pressed = null;
      this.dragFrameIndex = null;
      this.dragOverFrameIndex = null;
      this.layout = null;
      this.dragFeedbackText = "";
    }

    getDensityPresets() {
      return {
        pro: {
          topButtonHeight: 36,
          sideButtonHeight: 32,
          spacing: 6,
          padding: 14,
          frameThumbHeight: 50,
          labelHeight: 20,
          topPanelHeight: 74,
          bottomPanelHeight: 122,
          leftPanelWidth: 214,
          rightPanelWidth: 292
        },
        standard: {
          topButtonHeight: 42,
          sideButtonHeight: 38,
          spacing: 8,
          padding: 18,
          frameThumbHeight: 58,
          labelHeight: 24,
          topPanelHeight: 82,
          bottomPanelHeight: 138,
          leftPanelWidth: 230,
          rightPanelWidth: 310
        }
      };
    }

    resolveDensity() {
      const presets = this.getDensityPresets();
      const selectedMode = "pro";
      const effectiveMode = "pro";
      return { selectedMode, effectiveMode, config: presets[effectiveMode] };
    }

    rebuildLayout() {
      const density = this.resolveDensity();
      const d = density.config;
      const frame = { x: 18, y: 18, width: LOGICAL_W - 36, height: LOGICAL_H - 36 };
      const top = d.topPanelHeight;
      const bottom = d.bottomPanelHeight;
      const left = d.leftPanelWidth;
      const right = d.rightPanelWidth;
      const pad = d.padding;
      this.layout = {
        appFrame: frame,
        topPanel: { x: frame.x, y: frame.y, width: frame.width, height: top },
        leftPanel: { x: frame.x, y: frame.y + top, width: left, height: frame.height - top - bottom },
        rightPanel: { x: frame.x + frame.width - right, y: frame.y + top, width: right, height: frame.height - top - bottom },
        bottomPanel: { x: frame.x, y: frame.y + frame.height - bottom, width: frame.width, height: bottom },
        gridArea: { x: frame.x + left + pad, y: frame.y + top + pad, width: frame.width - left - right - pad * 2, height: frame.height - top - bottom - pad * 2 }
      };
      this.app.uiDensityEffectiveMode = density.effectiveMode;
      const openMenuItems = this.menuItems.slice();
      this.controls = [];
      this.hiddenTopControls = [];
      if (this.overflowPanelOpen) {
        this.menuItems = openMenuItems;
        this.rebuildOverflowPanel();
      }
      this.build();
    }

    add(kind, id, x, y, w, h, text, action, extra = {}) { this.controls.push({ kind, id, x, y, w, h, text, action, ...extra }); }

    getTopControlPolicy(effectiveMode, selectedMode) {
      const fileMenuItems = [
        { id: "file-new", text: "New", action: () => this.app.newDocument() },
        { id: "file-open", text: "Open", action: () => this.app.loadLocal() },
        { id: "file-save", text: "Save", action: () => this.app.saveLocal() },
        { id: "file-import-editor", text: "Import Editor JSON", action: () => this.app.openImport() },
        { id: "file-export-editor", text: "Export Editor JSON", action: () => this.app.exportJson(true) },
        { id: "file-export-menu", text: "Export", action: () => this.app.openExportMenu() }
      ];
      const defs = [
        {
          id: "top-file",
          tier: 1,
          overflowEligible: false,
          labels: effectiveMode === "pro" ? ["Files", "Files", "F"] : ["Files", "Files", "F"],
          action: () => this.app.openFileMenu(fileMenuItems)
        },
        {
          id: "top-edit",
          tier: 1,
          overflowEligible: false,
          labels: ["Edit", "Edit", "E"],
          action: () => this.app.openEditMenu()
        },
        {
          id: "top-tools",
          tier: 1,
          overflowEligible: false,
          labels: ["Tools", "Tools", "T"],
          action: () => this.app.openToolsMenu()
        },
        {
          id: "top-frame",
          tier: 1,
          overflowEligible: false,
          labels: ["Frame", "Frame", "Fr"],
          action: () => this.app.openFrameMenu()
        },
        {
          id: "top-layer",
          tier: 1,
          overflowEligible: false,
          labels: ["Layer", "Layer", "L"],
          action: () => this.app.openLayerMenu()
        },
        {
          id: "top-palette",
          tier: 1,
          overflowEligible: false,
          labels: ["Palette", "Palette", "P"],
          action: () => this.app.openPaletteWorkflowMenu()
        },
        {
          id: "top-help",
          tier: 1,
          overflowEligible: false,
          labels: ["Help", "Help", "H"],
          action: () => this.app.openHelpMenu()
        },
        {
          id: "top-about",
          tier: 1,
          overflowEligible: false,
          labels: ["About", "About", "A"],
          action: () => this.app.openAboutPopup()
        }
      ];
      return {
        pixel: { id: "top-pixel", labels: this.app.viewport.pixelPerfect ? ["Pixel: On", "Pixel", "Px"] : ["Pixel: Off", "Pixel", "Px"], action: () => this.app.togglePixelPerfect() },
        zoom: {
          out: { id: "top-zoom-out", label: "Zoom -" },
          in: { id: "top-zoom-in", label: "Zoom +" },
          reset: { id: "top-zoom-reset", labels: ["Reset", "Reset", "R"] }
        },
        controls: defs
      };
    }

    measureButtonWidth(ctx, text, minWidth, padX) {
      return Math.max(minWidth, Math.ceil(ctx.measureText(text).width + padX * 2));
    }

    closeOverflowPanel() {
      this.overflowPanelOpen = false;
      this.overflowPanelBounds = null;
      this.overflowPanelControls = [];
      this.overflowAnchorControl = null;
      this.menuItems = [];
      this.topMenuSource = null;
    }
    getMenuAnchorId() {
      if (this.topMenuSource === "tools") return "top-tools";
      if (this.topMenuSource === "file") return "top-file";
      if (this.topMenuSource === "file-export") return "top-file";
      if (this.topMenuSource === "edit") return "top-edit";
      if (this.topMenuSource === "frame") return "top-frame";
      if (this.topMenuSource === "layer") return "top-layer";
      if (this.topMenuSource === "palette") return "top-palette";
      if (this.topMenuSource === "palette-presets") return "top-palette";
      if (this.topMenuSource === "help") return "top-help";
      if (this.topMenuSource === "overflow") return "top-overflow";
      return this.topMenuSource;
    }

    pointInRect(x, y, r) {
      return !!r && x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h;
    }

    getOpenPanelItems() {
      if (this.topMenuSource === "overflow") {
        return Array.isArray(this.hiddenTopControls) ? this.hiddenTopControls : [];
      }
      return Array.isArray(this.menuItems) ? this.menuItems : [];
    }

    toggleFavoriteAt(x, y) {
      if (!this.commandPaletteOpen) return false;
      for (let i = 0; i < this.commandPaletteRowControls.length; i += 1) {
        const c = this.commandPaletteRowControls[i];
        if (!c.isCommandRow || !c.favoriteToggleRect) continue;
        if (this.pointInRect(x, y, c.favoriteToggleRect)) {
          this.app.toggleFavoriteAction(c.commandId);
          this.rebuildCommandPaletteRows();
          return true;
        }
      }
      return false;
    }

    openCommandPalette(items) {
      this.commandPaletteItems = Array.isArray(items) ? items.slice() : [];
      this.commandPaletteQuery = "";
      this.commandPaletteOpen = true;
      this.commandPaletteSelectedIndex = 0;
      this.rebuildCommandPaletteRows();
    }

    closeCommandPalette() {
      this.commandPaletteOpen = false;
      this.commandPaletteBounds = null;
      this.commandPaletteRowControls = [];
      this.commandPaletteFiltered = [];
      this.commandPaletteQuery = "";
      this.commandPaletteSelectedIndex = 0;
    }

    setCommandPaletteQuery(query) {
      this.commandPaletteQuery = query;
      this.commandPaletteSelectedIndex = 0;
      this.rebuildCommandPaletteRows();
    }

    moveCommandPaletteSelection(delta) {
      if (!this.commandPaletteOpen || !this.commandPaletteFiltered.length) return;
      const next = this.commandPaletteSelectedIndex + delta;
      const max = this.commandPaletteFiltered.length - 1;
      this.commandPaletteSelectedIndex = Math.max(0, Math.min(max, next));
      this.rebuildCommandPaletteRows();
    }

    activateCommandPaletteSelection() {
      if (!this.commandPaletteOpen || !this.commandPaletteFiltered.length) return false;
      const selected = this.commandPaletteFiltered[this.commandPaletteSelectedIndex];
      if (!selected || typeof selected.action !== "function") return false;
      selected.action();
      this.closeCommandPalette();
      return true;
    }

    rebuildCommandPaletteRows() {
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
    }

    rebuildOverflowPanel() {
      const panelItems = this.getOpenPanelItems();
      const hasItems = panelItems.length > 0;
      if (!this.overflowPanelOpen) {
        this.closeOverflowPanel();
        return;
      }
      const anchorId = this.getMenuAnchorId();
      const anchor = this.controls.find((c) => c.id === anchorId) || this.overflowAnchorControl;
      if (!anchor) {
        this.closeOverflowPanel();
        return;
      }
      this.overflowAnchorControl = anchor;
      const d = this.resolveDensity().config;
      const panelPad = 8;
      const rowH = d.topButtonHeight;
      const gap = Math.max(4, d.spacing - 2);
      const minBtn = this.app.uiDensityEffectiveMode === "pro" ? 52 : 58;
      const padX = this.app.uiDensityEffectiveMode === "pro" ? 10 : 12;
      const prevFont = this.app.ctx.font;
      this.app.ctx.font = "13px Arial";
      let maxW = 0;
      const itemsForMeasure = hasItems ? panelItems : [{ text: "No menu items (ERROR)" }];
      itemsForMeasure.forEach((item) => {
        const measureText = item.shortcut ? `${item.text}   [${item.shortcut}]` : item.text;
        maxW = Math.max(maxW, this.measureButtonWidth(this.app.ctx, measureText, minBtn, padX));
      });
      const visibleItems = hasItems ? panelItems : [{ id: "menu-error-empty", text: "No menu items (ERROR)", action: null }];
      const panelW = Math.max(160, maxW + panelPad * 2);
      const panelH = Math.max(rowH + panelPad * 2, panelPad * 2 + (visibleItems.length * rowH) + (Math.max(0, visibleItems.length - 1) * gap));
      const frame = this.layout.appFrame;
      let panelX = anchor.x + anchor.w - panelW;
      panelX = Math.max(frame.x + 8, Math.min(panelX, frame.x + frame.width - panelW - 8));
      let panelY = anchor.y + anchor.h + 8;
      if (panelY + panelH > frame.y + frame.height - 8) {
        panelY = anchor.y - panelH - 8;
      }
      panelY = Math.max(frame.y + 8, Math.min(panelY, frame.y + frame.height - panelH - 8));
      this.overflowPanelBounds = { x: panelX, y: panelY, w: panelW, h: panelH };
      this.overflowPanelControls = [];
      let y = panelY + panelPad;
      visibleItems.forEach((item, index) => {
        this.overflowPanelControls.push({
          kind: "button",
          id: `overflow-item-${index}`,
          x: panelX + panelPad,
          y,
          w: panelW - panelPad * 2,
          h: rowH,
          text: item.text,
          action: item.action,
          shortcut: item.shortcut || ""
        });
        y += rowH + gap;
      });
      this.app.ctx.font = prevFont;
    }

    toggleOverflowPanel() {
      if (this.overflowPanelOpen) {
        this.closeOverflowPanel();
        return;
      }
      if (!this.hiddenTopControls.length) return;
      this.menuItems = [];
      this.topMenuSource = "overflow";
      this.overflowPanelOpen = true;
      this.rebuildOverflowPanel();
    }

    toggleTopMenu(source, items) {
      if (this.overflowPanelOpen && this.topMenuSource === source) {
        this.closeOverflowPanel();
        return;
      }
      this.menuItems = Array.isArray(items) ? items.slice() : [];
      this.topMenuSource = source || "menu";
      this.overflowPanelOpen = true;
      this.rebuildOverflowPanel();
    }

    build() {
      const density = this.resolveDensity();
      const d = density.config;
      const selectedMode = density.selectedMode;
      const effectiveMode = density.effectiveMode;
      const top = this.layout.topPanel, left = this.layout.leftPanel, right = this.layout.rightPanel, bottom = this.layout.bottomPanel;
      let x = top.x + d.padding;
      let y = top.y + Math.floor((top.height - d.topButtonHeight) / 2);
      const h = d.topButtonHeight;
      const policy = this.getTopControlPolicy(effectiveMode, selectedMode);
      const prevFont = this.app.ctx.font;
      this.app.ctx.font = "13px Arial";
      const minBtn = effectiveMode === "pro" ? 52 : 58;
      const padX = effectiveMode === "pro" ? 10 : 12;
      const spacingBase = d.spacing;
      const spacing = Math.max(4, spacingBase - (effectiveMode === "pro" ? 1 : 0));

      const fullscreenLabel = this.app.isFullscreen() ? "Exit Full" : "Full Screen";
      const fullscreenShort = this.app.isFullscreen() ? "Exit" : "Full";
      const fullscreenWLong = this.measureButtonWidth(this.app.ctx, fullscreenLabel, minBtn, padX);
      const fullscreenWShort = this.measureButtonWidth(this.app.ctx, fullscreenShort, minBtn, padX);
      const zoomBtnW = this.measureButtonWidth(this.app.ctx, "Zoom +", minBtn, padX - 2);
      const zoomResetW = this.measureButtonWidth(this.app.ctx, policy.zoom.reset.labels[0], minBtn, padX - 2);
      const pixelW = this.measureButtonWidth(this.app.ctx, policy.pixel.labels[0], minBtn, padX);

      let level = 0;
      let hidden = [];
      const computeLayout = (fitLevel) => {
        const tryShortFullscreen = fitLevel >= 1;
        const fsLabel = tryShortFullscreen ? fullscreenShort : fullscreenLabel;
        const fsW = tryShortFullscreen ? fullscreenWShort : fullscreenWLong;
        const pixelText = policy.pixel.labels[Math.min(fitLevel, 2)];
        const pixelWidth = this.measureButtonWidth(this.app.ctx, pixelText, minBtn, padX);
        const showZoom = fitLevel <= 2;
        const zoomW = showZoom ? (zoomBtnW * 2 + zoomResetW + pixelWidth + spacing * 3) : 0;
        const overflowSlots = fitLevel >= 2 ? 1 : 0;
        const overflowW = overflowSlots ? this.measureButtonWidth(this.app.ctx, "More", minBtn, padX) : 0;
        const rightReserve = fsW + (showZoom ? (spacing + zoomW) : 0) + (overflowSlots ? (spacing + overflowW) : 0);
        const rightStart = top.x + top.width - d.padding - rightReserve;
        const availableRight = rightStart - spacing;
        const leftControls = [];
        hidden = [];
        let leftX = x;
        const visibleMaxTier = fitLevel >= 3 ? 1 : (fitLevel >= 2 ? 2 : 3);
        for (const c of policy.controls) {
          if (c.tier > visibleMaxTier && c.overflowEligible) {
            hidden.push(c);
            continue;
          }
          const label = c.labels[Math.min(fitLevel, 2)];
          const w = this.measureButtonWidth(this.app.ctx, label, minBtn, padX);
          if ((leftX + w) > availableRight) {
            if (c.overflowEligible) hidden.push(c);
            continue;
          }
          leftControls.push({ ...c, text: label, w, x: leftX });
          leftX += w + spacing;
        }
        return {
          fsLabel, fsW, pixelText, pixelWidth, showZoom, overflowSlots, overflowW, rightStart, leftControls
        };
      };

      let topLayout = computeLayout(level);
      while (level < 3 && topLayout.rightStart <= x) {
        level += 1;
        topLayout = computeLayout(level);
      }

      topLayout.leftControls.forEach((c) => this.add("button", c.id, c.x, y, c.w, h, c.text, c.action));

      let rightX = topLayout.rightStart;
      const addRight = (id, w, text, action, extra = {}) => {
        this.add("button", id, rightX, y, w, h, text, action, extra);
        rightX += w + spacing;
      };

      if (topLayout.showZoom) {
        addRight(policy.zoom.out.id, zoomBtnW, policy.zoom.out.label, () => this.app.adjustZoom(-0.25));
        addRight(policy.zoom.in.id, zoomBtnW, policy.zoom.in.label, () => this.app.adjustZoom(0.25));
        addRight(policy.zoom.reset.id, zoomResetW, policy.zoom.reset.labels[Math.min(level, 2)], () => this.app.resetZoom());
        addRight(policy.pixel.id, topLayout.pixelWidth || pixelW, topLayout.pixelText || policy.pixel.labels[Math.min(level, 2)], policy.pixel.action);
      }
      if (topLayout.overflowSlots && hidden.length) {
        const overflowText = `More (${hidden.length})`;
        const overflowW = this.measureButtonWidth(this.app.ctx, overflowText, minBtn, padX);
        if (this.topMenuSource === "overflow") {
          this.hiddenTopControls = hidden.map((c) => ({ id: c.id, text: c.labels[0], action: c.action }));
        }
        addRight("top-overflow", overflowW, overflowText, () => this.toggleOverflowPanel(), { overflowItems: hidden.map((c) => c.id) });
      } else {
        if (this.topMenuSource === "overflow") {
          this.hiddenTopControls = [];
          if (this.overflowPanelOpen) this.closeOverflowPanel();
        }
      }
      addRight("fullscreen", topLayout.fsW, topLayout.fsLabel, () => this.app.toggleFullscreen());
      this.app.ctx.font = prevFont;

      x = left.x + d.padding;
      y = left.y + d.padding;
      const bw = left.width - (d.padding * 2);
      const bh = d.sideButtonHeight;
      const halfW = Math.floor((bw - d.spacing) / 2);
      this.add("label","lbl-grid",x,y,bw,d.labelHeight,"GRID",null); y += d.labelHeight + d.spacing;
      y += 5;
      this.add("button","grid-add-row",x,y,halfW,bh,"Add Row",()=>this.app.adjustGridRows(1));
      this.add("button","grid-remove-row",x + halfW + d.spacing,y,bw - halfW - d.spacing,bh,"Sub Row",()=>this.app.adjustGridRows(-1));
      y += bh + d.spacing;
      this.add("button","grid-add-column",x,y,halfW,bh,"Add Col",()=>this.app.adjustGridCols(1));
      this.add("button","grid-remove-column",x + halfW + d.spacing,y,bw - halfW - d.spacing,bh,"Sub Col",()=>this.app.adjustGridCols(-1));
      y += bh + d.spacing;
      y += 5;
      this.add("label","grid-size-readout",x,y,bw,bh,`${this.app.document.cols} cols x ${this.app.document.rows} rows`,null); y += bh + d.spacing;
      y += d.spacing;
      const activeToolLabel = this.app.getToolLabel(this.app.activeTool);
      const toolDescription = this.app.getActiveToolDescription();
      this.add("label","lbl-tools",x,y,bw,d.labelHeight,"ACTIVE TOOL",null); y += d.labelHeight + d.spacing;
      this.add("button","tool-active-readout",x,y,bw,bh,activeToolLabel,null,{tool:this.app.activeTool}); y += bh + d.spacing;
      this.add("label","tool-desc-1",x,y,bw,bh,toolDescription.primary,null); y += bh + d.spacing;
      this.add("label","tool-desc-2",x,y,bw,bh,toolDescription.secondary,null); y += bh + d.spacing;
      const brushToolActive = this.app.activeTool === "brush" || this.app.activeTool === "erase";
      const shapeToolActive = this.app.activeTool === "line" || this.app.activeTool === "rect" || this.app.activeTool === "fillrect";
      if (brushToolActive) {
        y += d.spacing;
        this.add("label","lbl-brush",x,y,bw,d.labelHeight,"BRUSH",null); y += d.labelHeight + d.spacing;
        const brushGap = d.spacing;
        const brushBtnW = Math.floor((bw - brushGap * 2) / 3);
        const brushReadoutW = bw - brushBtnW * 2 - brushGap * 2;
        this.add("button","brush-size-down",x,y,brushBtnW,bh,"Size -",()=>this.app.adjustBrushSize(-1));
        this.add("button","brush-size-readout",x + brushBtnW + brushGap,y,brushReadoutW,bh,String(this.app.brush.size),null,{ centerText: true });
        this.add("button","brush-size-up",x + brushBtnW + brushGap + brushReadoutW + brushGap,y,brushBtnW,bh,"Size +",()=>this.app.adjustBrushSize(1));
        y += bh + d.spacing;
        this.add("button","brush-shape-toggle",x,y,bw,bh,`Shape: ${this.app.brush.shape}`,()=>this.app.toggleBrushShape());
        y += bh + d.spacing;
      } else if (shapeToolActive) {
        y += d.spacing;
        this.add("label","lbl-shape",x,y,bw,d.labelHeight,"SHAPE",null); y += d.labelHeight + d.spacing;
        this.add("label","shape-help",x,y,bw,bh,"Drag on canvas to preview",null);
        y += bh + d.spacing;
      }
      this.add("button","mirror-toggle",x,y,bw,bh,this.app.mirror ? "Mirror: On" : "Mirror: Off",()=>this.app.toggleMirror()); y += bh + d.spacing;
      y += d.spacing;
      this.add("label","lbl-sel",x,y,bw,d.labelHeight,"SELECTION",null); y += d.labelHeight + d.spacing;
      const hasSelection = !!this.app.document.selection;
      const hasClipboard = !!this.app.document.selectionClipboard;
      if (hasSelection) {
        const selectionText = `${this.app.document.selection.width}x${this.app.document.selection.height} ready`;
        this.add("label","sel-state",x,y,bw,bh,selectionText,null); y += bh + d.spacing;
        this.add("label","sel-hint-actions",x,y,bw,bh,"Edit menu for copy/cut/paste",null); y += bh + d.spacing;
      } else if (hasClipboard) {
        this.add("label","sel-hint-paste",x,y,bw,bh,"Clipboard ready",null); y += bh + d.spacing;
        this.add("label","sel-hint-actions",x,y,bw,bh,"Edit menu to paste",null); y += bh + d.spacing;
      } else {
        this.add("label","sel-hint",x,y,bw,bh,"No selection",null); y += bh + d.spacing;
        this.add("label","sel-hint-2",x,y,bw,bh,"Use Select tool to create one",null); y += bh + d.spacing;
      }
      y += d.spacing;
      this.add("label","lbl-layers",x,y,bw,d.labelHeight,"LAYERS",null); y += d.labelHeight + d.spacing;
      const af = this.app.document.ensureFrameLayers(this.app.document.activeFrame);
      const layers = af.layers || [];
      for (let visualIndex = layers.length - 1; visualIndex >= 0; visualIndex -= 1) {
        const l = layers[visualIndex];
        const i = visualIndex;
        const hidden = !this.app.isLayerVisibleEffective(af, i);
        const opacityPct = `${Math.round(((typeof l.opacity === "number" ? l.opacity : 1) * 100))}%`;
        const rowHeight = 40;
        const visWidth = 56;
        const rowGap = 8;
        const rowWidth = bw - visWidth - rowGap;
        const stateParts = [hidden ? "Hidden" : "Visible"];
        if (l.locked) stateParts.push("Locked");
        const stateText = stateParts.join(" | ");
        this.add("button", "layer-vis-" + i, x, y, visWidth, rowHeight, hidden ? "Show" : "Hide", () => {
          this.app.selectLayer(i);
          this.app.toggleLayerVisibility();
        }, {
          layerIndex: i,
          layerVisibilityToggle: true,
          layerHidden: hidden
        });
        this.add("button", "layer-item-" + i, x + visWidth + rowGap, y, rowWidth, rowHeight, l.name, () => this.app.selectLayer(i), {
          layerIndex: i,
          layerName: l.name,
          layerStateText: stateText,
          layerOpacityText: opacityPct,
          layerHidden: hidden,
          layerLocked: l.locked === true
        });
        y += rowHeight + d.spacing;
      }

      x = right.x + d.padding;
      y = right.y + d.padding;
      const rw = right.width - (d.padding * 2);
      this.add("label","lbl-palette",x,y,rw,d.labelHeight,`PALETTE: ${String(this.app.currentPalettePreset || "Custom").toUpperCase()}`,null); y += d.labelHeight + d.spacing;
      this.add("label","palette-current",x,y,rw,18,this.app.getCurrentColorDisplayText(),null); y += 20;
      const sortTop = right.y + right.height - d.padding - 64;
      const sortButtonGap = 6;
      const sortButtonH = 24;
      const sortButtonW = Math.floor((rw - sortButtonGap) / 2);
      const paletteViewportBottom = Math.max(y + 24, sortTop - 10);
      const gap = 4;
      const targetSwatch = this.app.uiDensityEffectiveMode === "pro" ? 20 : 22;
      const scrollbarW = 10;
      const paletteGridW = Math.max(24, rw - scrollbarW - gap);
      const cols = Math.max(1, Math.floor((paletteGridW + gap) / (targetSwatch + gap)));
      const sw = Math.max(18, Math.min(24, Math.floor((paletteGridW - gap * (cols - 1)) / cols)));
      const sh = sw;
      const viewportHeight = Math.max(sh, paletteViewportBottom - y);
      const rowStride = sh + gap;
      const paletteEntries = this.app.getPaletteDisplayEntries();
      const totalRows = Math.max(1, Math.ceil(paletteEntries.length / cols));
      const contentHeight = totalRows * rowStride - gap;
      const maxScroll = Math.max(0, contentHeight - viewportHeight);
      this.app.paletteSidebarScroll = Math.max(0, Math.min(maxScroll, this.app.paletteSidebarScroll || 0));
      const startRow = Math.max(0, Math.floor(this.app.paletteSidebarScroll / rowStride));
      const endRow = Math.min(totalRows - 1, Math.floor((this.app.paletteSidebarScroll + viewportHeight - 1) / rowStride));
      const visibleStart = startRow * cols;
      const visibleEnd = Math.min(paletteEntries.length, ((endRow + 1) * cols));
      this.app.paletteSidebarMetrics = {
        x,
        y,
        w: paletteGridW,
        h: viewportHeight,
        sw,
        sh,
        gap,
        cols,
        rowStride,
        totalRows,
        contentHeight,
        maxScroll,
        scrollbarX: x + paletteGridW + gap,
        scrollbarW
      };
      paletteEntries.slice(visibleStart, visibleEnd).forEach((entry, offset) => {
        const i = visibleStart + offset;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const drawX = x + col * (sw + gap);
        const drawY = y + row * rowStride - this.app.paletteSidebarScroll;
        if (drawY + sh <= y || drawY >= y + viewportHeight) return;
        this.add("palette","palette-"+entry.index,drawX,drawY,sw,sh,"",()=>this.app.setCurrentColor(entry.hex),{color:entry.hex});
      });
      this.add("label","palette-sort-label",x,sortTop,rw,18,"SORT",null);
      this.add("button","palette-sort-name",x,sortTop + 20,sortButtonW,sortButtonH,"Name",()=>this.app.setPaletteSortMode("name"),{ paletteSortMode: "name" });
      this.add("button","palette-sort-hue",x + sortButtonW + sortButtonGap,sortTop + 20,sortButtonW,sortButtonH,"Hue",()=>this.app.setPaletteSortMode("hue"),{ paletteSortMode: "hue" });
      this.add("button","palette-sort-saturation",x,sortTop + 20 + sortButtonH + sortButtonGap,sortButtonW,sortButtonH,"Saturation",()=>this.app.setPaletteSortMode("saturation"),{ paletteSortMode: "saturation" });
      this.add("button","palette-sort-lightness",x + sortButtonW + sortButtonGap,sortTop + 20 + sortButtonH + sortButtonGap,sortButtonW,sortButtonH,"Lightness",()=>this.app.setPaletteSortMode("lightness"),{ paletteSortMode: "lightness" });
    }

    getControlAt(x,y) {
      if (this.commandPaletteOpen) {
        for (let i = this.commandPaletteRowControls.length - 1; i >= 0; i -= 1) {
          const c = this.commandPaletteRowControls[i];
          if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
        }
      }
      if (this.overflowPanelOpen) {
        for (let i = this.overflowPanelControls.length - 1; i >= 0; i -= 1) {
          const c = this.overflowPanelControls[i];
          if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
        }
      }
      for (let i = this.controls.length - 1; i >= 0; i -= 1) {
        const c = this.controls[i];
        if (c.kind === "label") continue;
        if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
      }
      return null;
    }
    updateHover(x,y) {
      const c = this.getControlAt(x,y);
      this.hovered = c ? c.id : null;
      if (this.dragFrameIndex !== null) this.dragOverFrameIndex = c && c.kind === "frame" ? c.frameIndex : null;
    }
    pointerDown(x,y) {
      if (this.commandPaletteOpen) {
        if (!this.pointInRect(x, y, this.commandPaletteBounds)) {
          this.closeCommandPalette();
          this.pressed = null;
          return { id: "command-palette-dismiss", kind: "button" };
        }
        if (this.toggleFavoriteAt(x, y)) {
          this.pressed = null;
          return { id: "command-palette-favorite", kind: "button" };
        }
      }
      if (this.overflowPanelOpen) {
        const inPanel = this.overflowPanelBounds &&
          x >= this.overflowPanelBounds.x && y >= this.overflowPanelBounds.y &&
          x <= this.overflowPanelBounds.x + this.overflowPanelBounds.w &&
          y <= this.overflowPanelBounds.y + this.overflowPanelBounds.h;
        const anchorId = this.getMenuAnchorId();
        const anchorButton = this.controls.find((c) => c.id === anchorId);
        const inAnchorButton = anchorButton &&
          x >= anchorButton.x && y >= anchorButton.y &&
          x <= anchorButton.x + anchorButton.w && y <= anchorButton.y + anchorButton.h;
        if (!inPanel && !inAnchorButton) {
          this.closeOverflowPanel();
          this.pressed = null;
          return { id: "overflow-dismiss", kind: "button" };
        }
      }
      const c = this.getControlAt(x,y);
      this.pressed = c ? c.id : null;
      if (c && c.kind === "frame") {
        this.dragFrameIndex = c.frameIndex;
        this.dragOverFrameIndex = c.frameIndex;
        this.dragFeedbackText = "Dragging frame " + (c.frameIndex + 1);
      }
      return c;
    }
    pointerUp(x,y) {
      const c = this.getControlAt(x,y);
      const from = this.dragFrameIndex, to = this.dragOverFrameIndex;
      this.dragFrameIndex = null; this.dragOverFrameIndex = null;
      this.dragFeedbackText = "";
      if (from !== null && to !== null && from !== to) { this.pressed = null; this.app.reorderFrame(from,to); return true; }
      const ok = c && c.id === this.pressed;
      this.pressed = null;
      if (!ok) return false;
      if (typeof c.action === "function") {
        const previousMenuSource = this.topMenuSource;
        c.action();
        if (c.isCommandRow) this.closeCommandPalette();
        if (c.id.indexOf("overflow-item-") === 0 && this.topMenuSource === previousMenuSource) {
          this.closeOverflowPanel();
        }
        return true;
      }
      return false;
    }

    draw(ctx) {
      const L = this.layout, F = L.appFrame;
      ctx.fillStyle = "#0c1118"; ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);
      ctx.fillStyle = "#121b25"; ctx.fillRect(F.x,F.y,F.width,F.height);
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.strokeRect(F.x+0.5,F.y+0.5,F.width-1,F.height-1);
      [L.topPanel,L.leftPanel,L.rightPanel,L.bottomPanel].forEach((p) => {
        ctx.fillStyle = "#16202b"; ctx.fillRect(p.x,p.y,p.width,p.height);
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.strokeRect(p.x+0.5,p.y+0.5,p.width-1,p.height-1);
      });
      ctx.font = "13px Arial"; ctx.textBaseline = "middle";
      this.controls.forEach((c) => this.drawControl(ctx,c));
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
    }

    wrapSidebarText(ctx, text, maxWidth) {
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
    }

    drawControl(ctx,c) {
      const inLeftSidebar = this.layout && this.layout.leftPanel && c.x >= this.layout.leftPanel.x && c.x < (this.layout.leftPanel.x + this.layout.leftPanel.width);
      if (c.kind === "label") {
        if (c.id === "palette-current") {
          const currentHex = String(this.app.document.currentColor || "").toUpperCase();
          let name = "Unnamed";
          if (typeof palettesList === "object" && palettesList && this.app.currentPalettePreset && Array.isArray(palettesList[this.app.currentPalettePreset])) {
            const presetEntries = palettesList[this.app.currentPalettePreset];
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
          ctx.fillText(c.text,c.x,c.y+c.h/2);
        }
        return;
      }
      if (c.kind === "palette") {
        ctx.fillStyle = c.color; ctx.fillRect(c.x,c.y,c.w,c.h);
        const current = this.app.document.currentColor === c.color;
        ctx.strokeStyle = current ? "#4cc9f0" : "rgba(255,255,255,0.2)";
        ctx.lineWidth = current ? 3 : 1;
        ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1);
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
      const hovered = this.hovered === c.id, pressed = this.pressed === c.id, activeFrame = c.kind === "frame" && this.app.document.activeFrameIndex === c.frameIndex, activeLayerItem = typeof c.layerIndex === "number" && this.app.document.activeFrame.activeLayerIndex === c.layerIndex, dragTarget = c.kind === "frame" && this.dragOverFrameIndex === c.frameIndex && this.dragFrameIndex !== null, toolActive = c.tool && this.app.activeTool === c.tool, sortModeActive = c.paletteSortMode && this.app.paletteSortMode === c.paletteSortMode;
      ctx.fillStyle = pressed ? "#27435a" : (hovered ? "#223444" : "#1a2733");
      if (c.isCommandRow && c.selected) ctx.fillStyle = "#2d5169";
      if (toolActive || activeFrame || activeLayerItem || sortModeActive) ctx.fillStyle = "#244d67";
      if (dragTarget) ctx.fillStyle = "#305c4a";
      ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = (toolActive || activeFrame || activeLayerItem || dragTarget || sortModeActive) ? "#4cc9f0" : "rgba(255,255,255,0.15)";
      if (c.isCommandRow && c.selected) ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1);
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
          ctx.fillText(c.text,c.x+10,c.y+c.h/2);
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
        this.drawMiniFrame(ctx, this.app.document.getCompositedPixels(f, { respectSolo: false, blendMode: "normal" }), c.x+c.w-54, c.y+8, 46, c.h-16);
      }
    }

    drawMiniFrame(ctx,pixels,x,y,w,h) {
      const cols = this.app.document.cols, rows = this.app.document.rows, pw = Math.max(1, Math.floor(w/cols)), ph = Math.max(1, Math.floor(h/rows));
      ctx.fillStyle = "#fff"; ctx.fillRect(x,y,w,h);
      for (let py=0; py<rows; py+=1) for (let px=0; px<cols; px+=1) {
        const v = pixels[py][px];
        if (!v) continue;
        ctx.fillStyle = v; ctx.fillRect(x+px*pw, y+py*ph, pw, ph);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
    }

    drawOverflowPanel(ctx) {
      if (!this.overflowPanelOpen || !this.overflowPanelBounds) return;
      const p = this.overflowPanelBounds;
      ctx.fillStyle = "rgba(7, 12, 18, 0.86)";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#182432";
      ctx.fillRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
      ctx.strokeStyle = "#4cc9f0";
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
      this.overflowPanelControls.forEach((c) => this.drawControl(ctx, c));
    }

    drawCommandPalette(ctx) {
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
    }

    drawPaletteSidebarScrollbar(ctx) {
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
    }
}

export { SpriteEditorCanvasControlSurface };
