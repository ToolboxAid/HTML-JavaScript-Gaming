function installControlSurfaceRightPanel(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.buildRightPanel = function buildRightPanel(d) {
    const right = this.layout.rightPanel;
    let x = right.x + d.padding;
    let y = right.y + d.padding;
    const rw = right.width - (d.padding * 2);
    const actionRequired = this.app.isPaletteSelectionRequired && this.app.isPaletteSelectionRequired();
    const titleH = 23;
    const presetH = 22;
    const cloneH = 22;
    const messageH = 22;
    this.add("label", "lbl-palette", x, y, rw, titleH, `PALETTE: ${this.app.getPaletteStatusLabel()}`, null, { paletteHeaderBox: true, paletteActionRequired: actionRequired });
    y += titleH + d.spacing;
    const presetLabel = `Preset: ${this.app.currentPalettePreset || this.app.document.palettePresetName || "default"}`;
    this.add("button", "palette-preset-picker", x, y, rw, presetH, presetLabel, () => this.app.openPalettePresetsMenu());
    y += presetH + d.spacing;
    const customClones = this.app.getCustomPaletteNames ? this.app.getCustomPaletteNames() : [];
    const cloneName = customClones.length
      ? (customClones.indexOf(this.app.currentPalettePreset) >= 0 ? this.app.currentPalettePreset : customClones[0])
      : "None";
    const cloneLabel = actionRequired ? "Clone: Select preset first" : `Clone: ${cloneName}`;
    const cloneAction = actionRequired ? () => this.app.showMessage("Select a palette preset first.") : () => this.app.openPaletteCloneMenu();
    this.add("button", "palette-clone-picker", x, y, rw, cloneH, cloneLabel, cloneAction);
    y += cloneH + d.spacing;
    this.add("label", "palette-current", x, y, rw, messageH, this.app.getCurrentColorDisplayText(), null, { paletteHeaderBox: true, paletteActionRequired: actionRequired });
    y += messageH + d.spacing;
    const usedColors = this.app.getUsedColorEntries ? this.app.getUsedColorEntries() : [];
    const usedHeaderH = 16;
    const usedGap = 4;
    const usedSwatchSize = this.app.uiDensityEffectiveMode === "pro" ? 16 : 18;
    const usedCols = Math.max(1, Math.floor((rw + usedGap) / (usedSwatchSize + usedGap)));
    const visibleUsedCount = Math.min(usedColors.length, usedCols);
    this.add("label", "palette-used-label", x, y, rw, usedHeaderH, `USED COLORS (${usedColors.length})`, null);
    y += usedHeaderH + 2;
    for (let index = 0; index < visibleUsedCount; index += 1) {
      const drawX = x + index * (usedSwatchSize + usedGap);
      this.add(
        "palette",
        `palette-used-${index}`,
        drawX,
        y,
        usedSwatchSize,
        usedSwatchSize,
        "",
        () => this.app.setCurrentColor(usedColors[index], "used colors"),
        { color: usedColors[index], paletteUsed: true }
      );
    }
    if (usedColors.length > visibleUsedCount) {
      this.add("label", "palette-used-overflow", x + (visibleUsedCount * (usedSwatchSize + usedGap)), y, rw, usedSwatchSize, `+${usedColors.length - visibleUsedCount}`, null);
    }
    y += usedSwatchSize + d.spacing;

    const sortTop = right.y + right.height - d.padding - 64;
    const sortButtonGap = 6;
    const sortButtonH = 24;
    const sortButtonW = Math.floor((rw - sortButtonGap) / 2);
    const paletteViewportBottom = Math.max(y + 24, sortTop - 10);
    const gap = 4;
    const targetSwatch = this.app.uiDensityEffectiveMode === "pro" ? 28 : 30;
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
    const visibleEnd = Math.min(paletteEntries.length, (endRow + 1) * cols);
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
      this.add("palette", `palette-${entry.index}`, drawX, drawY, sw, sh, "", () => this.app.setCurrentColor(entry.hex, "palette"), { color: entry.hex });
    });

    this.add("label", "palette-sort-label", x, sortTop, rw, 18, "SORT", null);
    this.add("button", "palette-sort-name", x, sortTop + 20, sortButtonW, sortButtonH, "Name", () => this.app.setPaletteSortMode("name"), { paletteSortMode: "name" });
    this.add("button", "palette-sort-hue", x + sortButtonW + sortButtonGap, sortTop + 20, sortButtonW, sortButtonH, "Hue", () => this.app.setPaletteSortMode("hue"), { paletteSortMode: "hue" });
    this.add("button", "palette-sort-saturation", x, sortTop + 20 + sortButtonH + sortButtonGap, sortButtonW, sortButtonH, "Saturation", () => this.app.setPaletteSortMode("saturation"), { paletteSortMode: "saturation" });
    this.add("button", "palette-sort-lightness", x + sortButtonW + sortButtonGap, sortTop + 20 + sortButtonH + sortButtonGap, sortButtonW, sortButtonH, "Lightness", () => this.app.setPaletteSortMode("lightness"), { paletteSortMode: "lightness" });
  };
}

export { installControlSurfaceRightPanel };
