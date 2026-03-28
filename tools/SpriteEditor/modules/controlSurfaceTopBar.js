function installControlSurfaceTopBar(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.getTopControlPolicy = function getTopControlPolicy(effectiveMode) {
    const fileMenuItems = [
      { id: "file-new", text: "New Project", action: () => this.app.newDocument() },
      { id: "file-open", text: "Open Project (Local)", action: () => this.app.loadLocal() },
      { id: "file-save", text: "Save Project (Local)", action: () => this.app.saveLocal() },
      { id: "file-import-editor", text: "Import Project JSON", action: () => this.app.openImport() },
      { id: "file-export-editor", text: "Export Project JSON", action: () => this.app.exportJson(true) },
      { id: "file-export-sprite", text: "Export Sprite", action: () => this.app.downloadSpriteSheetPng("all_frames") },
      { id: "file-export-gif", text: "Export GIF", action: () => this.app.exportGif("all_frames") },
      { id: "file-load-reference", text: "Load Reference Image", action: () => this.app.loadReferenceImage() },
      { id: "file-fit-reference", text: "Fit Reference To Grid", action: () => this.app.fitReferenceImageToGrid() },
      { id: "file-reset-reference", text: "Reset Reference Alignment", action: () => this.app.resetReferenceAlignment() }
    ];
    const defs = [
      { id: "top-file", tier: 1, overflowEligible: false, labels: effectiveMode === "pro" ? ["Files", "Files", "F"] : ["Files", "Files", "F"], action: () => this.app.openFileMenu(fileMenuItems) },
      { id: "top-edit", tier: 1, overflowEligible: false, labels: ["Edit", "Edit", "E"], action: () => this.app.openEditMenu() },
      { id: "top-tools", tier: 1, overflowEligible: false, labels: ["Tools", "Tools", "T"], action: () => this.app.openToolsMenu() },
      { id: "top-frame", tier: 1, overflowEligible: false, labels: ["Frame", "Frame", "Fr"], action: () => this.app.openFrameMenu() },
      { id: "top-layer", tier: 1, overflowEligible: false, labels: ["Layer", "Layer", "L"], action: () => this.app.openLayerMenu() },
      { id: "top-palette", tier: 1, overflowEligible: false, labels: ["Palette", "Palette", "P"], action: () => this.app.openPaletteWorkflowMenu() },
      { id: "top-help", tier: 1, overflowEligible: false, labels: ["Help", "Help", "H"], action: () => this.app.openHelpMenu() },
      { id: "top-about", tier: 1, overflowEligible: false, labels: ["About", "About", "A"], action: () => this.app.openAboutPopup() }
    ];
    return {
      pixel: {
        id: "top-pixel",
        labels: this.app.viewport.pixelPerfect ? ["Pixel: On", "Pixel", "Px"] : ["Pixel: Off", "Pixel", "Px"],
        action: () => this.app.togglePixelPerfect()
      },
      zoom: {
        out: { id: "top-zoom-out", label: "Zoom -" },
        in: { id: "top-zoom-in", label: "Zoom +" },
        reset: { id: "top-zoom-reset", labels: ["Reset", "Reset", "R"] }
      },
      controls: defs
    };
  };

  SpriteEditorCanvasControlSurface.prototype.measureButtonWidth = function measureButtonWidth(ctx, text, minWidth, padX) {
    return Math.max(minWidth, Math.ceil(ctx.measureText(text).width + padX * 2));
  };

  SpriteEditorCanvasControlSurface.prototype.buildTopBar = function buildTopBar(d, effectiveMode) {
    const top = this.layout.topPanel;
    const h = d.topButtonHeight;
    const y = top.y + Math.floor((top.height - d.topButtonHeight) / 2);
    const policy = this.getTopControlPolicy(effectiveMode);
    const prevFont = this.app.ctx.font;
    this.app.ctx.font = "13px Arial";
    const minBtn = effectiveMode === "pro" ? 52 : 58;
    const padX = effectiveMode === "pro" ? 10 : 12;
    const spacingBase = d.spacing;
    const spacing = Math.max(4, spacingBase - (effectiveMode === "pro" ? 1 : 0));
    const leftStartX = top.x + d.padding;

    const fullscreenLabel = this.app.isFullscreen() ? "Exit Full" : "Full Screen";
    const fullscreenShort = this.app.isFullscreen() ? "Exit" : "Full";
    const fullscreenWLong = this.measureButtonWidth(this.app.ctx, fullscreenLabel, minBtn, padX);
    const fullscreenWShort = this.measureButtonWidth(this.app.ctx, fullscreenShort, minBtn, padX);
    const zoomBtnW = this.measureButtonWidth(this.app.ctx, "Zoom +", minBtn, padX - 2);
    const zoomResetW = this.measureButtonWidth(this.app.ctx, policy.zoom.reset.labels[0], minBtn, padX - 2);
    const pixelW = this.measureButtonWidth(this.app.ctx, policy.pixel.labels[0], minBtn, padX);

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
      let leftX = leftStartX;
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
      return { fsLabel, fsW, pixelText, pixelWidth, showZoom, overflowSlots, rightStart, leftControls };
    };

    let level = 0;
    let topLayout = computeLayout(level);
    while (level < 3 && topLayout.rightStart <= leftStartX) {
      level += 1;
      topLayout = computeLayout(level);
    }

    topLayout.leftControls.forEach((c) => this.add("button", c.id, c.x, y, c.w, h, c.text, c.action));

    let rightX = topLayout.rightStart;
    const addRight = (id, width, text, action, extra = {}) => {
      this.add("button", id, rightX, y, width, h, text, action, extra);
      rightX += width + spacing;
    };

    if (topLayout.showZoom) {
      addRight(policy.zoom.out.id, zoomBtnW, policy.zoom.out.label, () => this.app.adjustZoom(-0.25));
      addRight(policy.zoom.in.id, zoomBtnW, policy.zoom.in.label, () => this.app.adjustZoom(0.25));
      addRight(policy.zoom.reset.id, zoomResetW, policy.zoom.reset.labels[Math.min(level, 2)], () => this.app.resetZoom());
      addRight(policy.pixel.id, topLayout.pixelWidth || pixelW, topLayout.pixelText || policy.pixel.labels[Math.min(level, 2)], policy.pixel.action);
    }
    if (topLayout.overflowSlots && hidden.length) {
      const overflowText = `More (${hidden.length})`;
      const overflowWidth = this.measureButtonWidth(this.app.ctx, overflowText, minBtn, padX);
      if (this.topMenuSource === "overflow") {
        this.hiddenTopControls = hidden.map((c) => ({ id: c.id, text: c.labels[0], action: c.action }));
      }
      addRight("top-overflow", overflowWidth, overflowText, () => this.toggleOverflowPanel(), { overflowItems: hidden.map((c) => c.id) });
    } else if (this.topMenuSource === "overflow") {
      this.hiddenTopControls = [];
      if (this.overflowPanelOpen) this.closeOverflowPanel();
    }
    addRight("fullscreen", topLayout.fsW, topLayout.fsLabel, () => this.app.toggleFullscreen());
    this.app.ctx.font = prevFont;
  };
}

export { installControlSurfaceTopBar };
