function installControlSurfaceLeftPanel(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.buildLeftPanel = function buildLeftPanel(d) {
    const left = this.layout.leftPanel;
    let x = left.x + d.padding;
    let y = left.y + d.padding + 10;
    const bw = left.width - (d.padding * 2);
    const bh = d.sideButtonHeight;
    const halfW = Math.floor((bw - d.spacing) / 2);
    const headerTop = 10;
    const textTop = 5;
    const drawingToolActive = ["brush", "erase", "fill", "line", "rect", "fillrect"].indexOf(this.app.activeTool) >= 0;

    this.add("label", "lbl-grid", x, y, bw, d.labelHeight, "GRID", null);
    y += d.labelHeight;
    this.add("button", "grid-add-row", x, y, halfW, bh, "Add Row", () => this.app.adjustGridRows(1));
    this.add("button", "grid-remove-row", x + halfW + d.spacing, y, bw - halfW - d.spacing, bh, "Sub Row", () => this.app.adjustGridRows(-1));
    y += bh;
    this.add("button", "grid-add-column", x, y, halfW, bh, "Add Col", () => this.app.adjustGridCols(1));
    this.add("button", "grid-remove-column", x + halfW + d.spacing, y, bw - halfW - d.spacing, bh, "Sub Col", () => this.app.adjustGridCols(-1));
    y += bh + textTop;
    this.add("label", "grid-size-readout", x, y, bw, bh, `${this.app.document.cols} cols x ${this.app.document.rows} rows`, null);
    y += bh + headerTop;

    const activeToolLabel = this.app.getToolLabel(this.app.activeTool);
    const toolDescription = this.app.getActiveToolDescription();
    this.add("label", "lbl-tools", x, y, bw, d.labelHeight, "ACTIVE TOOL", null);
    y += d.labelHeight;
    this.add("button", "tool-active-readout", x, y, bw, bh, activeToolLabel, null, { tool: this.app.activeTool });
    y += bh + textTop;
    this.add("label", "tool-desc-1", x, y, bw, bh, toolDescription.primary, null);
    y += bh + textTop;
    this.add("label", "tool-desc-2", x, y, bw, bh, toolDescription.secondary, null);
    y += bh;

    const brushToolActive = this.app.activeTool === "brush" || this.app.activeTool === "erase";
    const shapeToolActive = this.app.activeTool === "line" || this.app.activeTool === "rect" || this.app.activeTool === "fillrect";
    if (brushToolActive) {
      y += headerTop;
      this.add("label", "lbl-brush", x, y, bw, d.labelHeight, "BRUSH", null);
      y += d.labelHeight;
      const brushGap = d.spacing;
      const brushBtnW = Math.floor((bw - brushGap * 2) / 3);
      const brushReadoutW = bw - brushBtnW * 2 - brushGap * 2;
      this.add("button", "brush-size-down", x, y, brushBtnW, bh, "Size -", () => this.app.adjustBrushSize(-1));
      this.add("button", "brush-size-readout", x + brushBtnW + brushGap, y, brushReadoutW, bh, String(this.app.brush.size), null, { centerText: true });
      this.add("button", "brush-size-up", x + brushBtnW + brushGap + brushReadoutW + brushGap, y, brushBtnW, bh, "Size +", () => this.app.adjustBrushSize(1));
      y += bh;
      this.add("button", "brush-shape-toggle", x, y, bw, bh, `Shape: ${this.app.brush.shape}`, () => this.app.toggleBrushShape());
      y += bh;
    } else if (shapeToolActive) {
      y += headerTop;
      this.add("label", "lbl-shape", x, y, bw, d.labelHeight, "SHAPE", null);
      y += d.labelHeight + textTop;
      this.add("label", "shape-help", x, y, bw, bh, "Drag on canvas to preview", null);
      y += bh;
    } else if (this.app.activeTool === "reference") {
      y += headerTop;
      this.add("label", "lbl-reference", x, y, bw, d.labelHeight, "REFERENCE IMAGE", null);
      y += d.labelHeight;
      this.add("button", "reference-load", x, y, bw, bh, "Load Reference", () => this.app.loadReferenceImage());
      y += bh;
      this.add("button", "reference-fit", x, y, bw, bh, "Fit Ref To Grid", () => this.app.fitReferenceImageToGrid());
      y += bh;
      this.add("button", "reference-reset", x, y, bw, bh, "Reset Alignment", () => this.app.resetReferenceAlignment());
      y += bh;
    }

    if (drawingToolActive) {
      this.add("button", "mirror-toggle", x, y, bw, bh, this.app.mirror ? "Mirror: On" : "Mirror: Off", () => this.app.toggleMirror());
      y += bh;
    }
    y += headerTop;
    this.add("label", "lbl-sel", x, y, bw, d.labelHeight, "SELECTION", null);
    y += d.labelHeight + textTop;
    const hasSelection = !!this.app.document.selection;
    const hasClipboard = !!this.app.document.selectionClipboard;
    if (hasSelection) {
      const selectionText = `${this.app.document.selection.width}x${this.app.document.selection.height} ready`;
      this.add("label", "sel-state", x, y, bw, bh, selectionText, null);
      y += bh + textTop;
      this.add("label", "sel-hint-actions", x, y, bw, bh, "Edit menu for copy/cut/paste", null);
      y += bh;
    } else if (hasClipboard) {
      this.add("label", "sel-hint-paste", x, y, bw, bh, "Clipboard ready", null);
      y += bh + textTop;
      this.add("label", "sel-hint-actions", x, y, bw, bh, "Edit menu to paste", null);
      y += bh;
    } else {
      this.add("label", "sel-hint", x, y, bw, bh, "No selection", null);
      y += bh + textTop;
      this.add("label", "sel-hint-2", x, y, bw, bh, "Use Select tool to create one", null);
      y += bh;
    }

    y += headerTop;
    this.add("label", "lbl-layers", x, y, bw, d.labelHeight, "LAYERS", null);
    y += d.labelHeight;
    const af = this.app.document.ensureFrameLayers(this.app.document.activeFrame);
    const layers = af.layers || [];
    for (let visualIndex = layers.length - 1; visualIndex >= 0; visualIndex -= 1) {
      const l = layers[visualIndex];
      const i = visualIndex;
      const hidden = !this.app.isLayerVisibleEffective(af, i);
      const opacityPct = `${Math.round(((typeof l.opacity === "number" ? l.opacity : 1) * 100))}%`;
      const rowHeight = 64;
      const visWidth = 56;
      const rowGap = 8;
      const rowWidth = bw - visWidth - rowGap;
      const stateParts = [hidden ? "Hidden" : "Visible"];
      if (l.locked) stateParts.push("Locked");
      const stateText = stateParts.join(" | ");
      this.add("button", `layer-vis-${i}`, x, y, visWidth, rowHeight, hidden ? "Show" : "Hide", () => {
        this.app.selectLayer(i);
        this.app.toggleLayerVisibility();
      }, {
        layerIndex: i,
        layerVisibilityToggle: true,
        layerHidden: hidden
      });
      this.add("button", `layer-item-${i}`, x + visWidth + rowGap, y, rowWidth, rowHeight, l.name, () => this.app.selectLayer(i), {
        layerIndex: i,
        layerName: l.name,
        layerStateText: stateText,
        layerOpacityText: "",
        layerHidden: hidden,
        layerLocked: l.locked === true
      });
      const opacityY = y + rowHeight - 23;
      const minusW = 26;
      const plusW = 26;
      const opacityReadoutW = 64;
      const opacityGap = 6;
      const opacityX = x + visWidth + rowGap + 10;
      this.add("button", `layer-opacity-down-${i}`, opacityX, opacityY, minusW, 18, "-", () => {
        this.app.selectLayer(i);
        this.app.adjustLayerOpacity(-0.1);
      }, { centerText: true });
      this.add("button", `layer-opacity-value-${i}`, opacityX + minusW + opacityGap, opacityY, opacityReadoutW, 18, opacityPct, () => this.app.selectLayer(i), { centerText: true });
      this.add("button", `layer-opacity-up-${i}`, opacityX + minusW + opacityGap + opacityReadoutW + opacityGap, opacityY, plusW, 18, "+", () => {
        this.app.selectLayer(i);
        this.app.adjustLayerOpacity(0.1);
      }, { centerText: true });
      y += rowHeight;
    }
  };
}

export { installControlSurfaceLeftPanel };
