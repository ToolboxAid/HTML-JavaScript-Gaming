function installControlSurfaceRightPanel(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.buildRightPanel = function buildRightPanel(d) {
    const right = this.layout.rightPanel;
    let x = right.x + d.padding;
    let y = right.y + d.padding;
    const rw = right.width - (d.padding * 2);
    this.add("label", "lbl-palette", x, y, rw, d.labelHeight, `PALETTE: ${String(this.app.currentPalettePreset || "default").toUpperCase()}`, null);
    y += d.labelHeight + d.spacing;
    this.add("label", "palette-current", x, y, rw, 18, this.app.getCurrentColorDisplayText(), null);
    y += 20;

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
      this.add("palette", `palette-${entry.index}`, drawX, drawY, sw, sh, "", () => this.app.setCurrentColor(entry.hex), { color: entry.hex });
    });

    this.add("label", "palette-sort-label", x, sortTop, rw, 18, "SORT", null);
    this.add("button", "palette-sort-name", x, sortTop + 20, sortButtonW, sortButtonH, "Name", () => this.app.setPaletteSortMode("name"), { paletteSortMode: "name" });
    this.add("button", "palette-sort-hue", x + sortButtonW + sortButtonGap, sortTop + 20, sortButtonW, sortButtonH, "Hue", () => this.app.setPaletteSortMode("hue"), { paletteSortMode: "hue" });
    this.add("button", "palette-sort-saturation", x, sortTop + 20 + sortButtonH + sortButtonGap, sortButtonW, sortButtonH, "Saturation", () => this.app.setPaletteSortMode("saturation"), { paletteSortMode: "saturation" });
    this.add("button", "palette-sort-lightness", x + sortButtonW + sortButtonGap, sortTop + 20 + sortButtonH + sortButtonGap, sortButtonW, sortButtonH, "Lightness", () => this.app.setPaletteSortMode("lightness"), { paletteSortMode: "lightness" });
  };
}

export { installControlSurfaceRightPanel };
