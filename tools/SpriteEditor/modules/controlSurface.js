import { LOGICAL_H, LOGICAL_W } from "./constants.js";
import { installControlSurfaceCommandPalette } from "./controlSurfaceCommandPalette.js";
import { installControlSurfaceDraw } from "./controlSurfaceDraw.js";
import { installControlSurfaceInput } from "./controlSurfaceInput.js";
import { installControlSurfaceMenus } from "./controlSurfaceMenus.js";

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
      const effectiveMode = "pro";
      return { effectiveMode, config: presets[effectiveMode] };
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

    getTopControlPolicy(effectiveMode) {
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

    build() {
      const density = this.resolveDensity();
      const d = density.config;
      const effectiveMode = density.effectiveMode;
      const top = this.layout.topPanel, left = this.layout.leftPanel, right = this.layout.rightPanel, bottom = this.layout.bottomPanel;
      let x = top.x + d.padding;
      let y = top.y + Math.floor((top.height - d.topButtonHeight) / 2);
      const h = d.topButtonHeight;
      const policy = this.getTopControlPolicy(effectiveMode);
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

}

installControlSurfaceCommandPalette(SpriteEditorCanvasControlSurface);
installControlSurfaceDraw(SpriteEditorCanvasControlSurface);
installControlSurfaceInput(SpriteEditorCanvasControlSurface);
installControlSurfaceMenus(SpriteEditorCanvasControlSurface);

export { SpriteEditorCanvasControlSurface };
