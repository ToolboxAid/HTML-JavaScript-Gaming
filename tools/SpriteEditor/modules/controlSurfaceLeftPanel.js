function installControlSurfaceLeftPanel(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.buildLeftPanel = function buildLeftPanel(d) {
    const left = this.layout.leftPanel;
    const x = left.x + d.padding;
    let y = left.y + d.padding;
    const bw = left.width - (d.padding * 2);
    const bh = d.sideButtonHeight;
    const sectionHeaderH = 24;
    const gap = 4;
    const maxY = left.y + left.height - d.padding;
    const openSection = ["brush", "reference", "select", "grid", "layer"].indexOf(this.app.leftPanelOpenSection) >= 0
      ? this.app.leftPanelOpenSection
      : "brush";

    const activeToolLabel = this.app.getToolLabel(this.app.activeTool);
    const toolDescription = this.app.getActiveToolDescription();
    this.add("label", "lbl-tools", x, y, bw, d.labelHeight, "ACTIVE TOOL", null, { clipRect: left });
    y += d.labelHeight + 5;
    if (y + bh > maxY) return;
    this.add("button", "tool-active-readout", x, y, bw, bh, activeToolLabel, null, { tool: this.app.activeTool, clipRect: left });
    y += bh + 5;
    if (y + bh > maxY) return;
    this.add("label", "tool-summary", x, y, bw, bh, toolDescription.primary, null, { clipRect: left });
    y += bh + 10;

    const addSectionHeader = (id, title) => {
      if (y + sectionHeaderH > maxY) return false;
      this.add("button", `accordion-${id}-header`, x, y, bw, sectionHeaderH, title, () => this.app.setLeftPanelSection(id), {
        accordionHeader: true,
        accordionOpen: openSection === id,
        clipRect: left
      });
      y += sectionHeaderH;
      return true;
    };

    const addButtonRow = (id, rowY, leftLabel, leftAction, rightLabel, rightAction) => {
      const halfW = Math.floor((bw - gap) / 2);
      this.add("button", `${id}-left`, x, rowY, halfW, bh, leftLabel, leftAction, { clipRect: left });
      this.add("button", `${id}-right`, x + halfW + gap, rowY, bw - halfW - gap, bh, rightLabel, rightAction, { clipRect: left });
    };

    const addSectionTopGap = () => { y += 5; };
    const addSectionBottomGap = () => { y += 10; };

    if (!addSectionHeader("brush", "Brush")) return;
    if (openSection === "brush") {
      addSectionTopGap();
      const usesBrushSize = this.app.activeTool === "brush" || this.app.activeTool === "erase";
      if (usesBrushSize) {
        if (y + bh > maxY) return;
        const minusW = 36;
        const plusW = 36;
        const readoutW = bw - minusW - plusW - gap * 2;
        this.add("button", "brush-size-down", x, y, minusW, bh, "-", () => this.app.adjustBrushSize(-1), { centerText: true, clipRect: left });
        this.add("button", "brush-size-readout", x + minusW + gap, y, readoutW, bh, String(this.app.brush.size), null, { centerText: true, clipRect: left });
        this.add("button", "brush-size-up", x + minusW + gap + readoutW + gap, y, plusW, bh, "+", () => this.app.adjustBrushSize(1), { centerText: true, clipRect: left });
        y += bh + gap;
        if (y + bh <= maxY) {
          this.add("button", "brush-shape-toggle", x, y, bw, bh, `Shape: ${this.app.brush.shape}`, () => this.app.toggleBrushShape(), { clipRect: left });
          y += bh;
        }
      } else if (y + bh <= maxY) {
        this.add("label", "brush-no-options", x, y, bw, bh, "No brush options for this tool.", null, { clipRect: left });
        y += bh;
      }
      addSectionBottomGap();
    }

    if (!addSectionHeader("reference", "Reference")) return;
    if (openSection === "reference") {
      addSectionTopGap();
      const manual = this.app.ensureReferenceManualSplitState ? this.app.ensureReferenceManualSplitState() : { width: "", height: "", frames: "" };
      if (y + bh > maxY) return;
      this.add("button", "reference-import", x, y, bw, bh, "Import Image", () => this.app.loadReferenceImage(), { clipRect: left });
      y += bh + gap;
      if (y + bh > maxY) return;
      const refVisible = this.app.document && this.app.document.referenceImage && this.app.document.referenceImage.visible === true;
      this.add("button", "reference-overlay-toggle", x, y, bw, bh, refVisible ? "Hide Overlay" : "Show Overlay", () => this.app.toggleReferenceOverlayVisibility(), { clipRect: left });
      y += bh + gap;
      if (y + bh > maxY) return;
      addButtonRow("reference-scale", y, "Scale -", () => this.app.scaleReferenceImage(-1), "Scale +", () => this.app.scaleReferenceImage(1));
      y += bh + gap;
      if (y + bh > maxY) return;
      addButtonRow("reference-move-h", y, "Left", () => this.app.nudgeReferenceImage(-1, 0), "Right", () => this.app.nudgeReferenceImage(1, 0));
      y += bh + gap;
      if (y + bh > maxY) return;
      addButtonRow("reference-move-v", y, "Up", () => this.app.nudgeReferenceImage(0, -1), "Down", () => this.app.nudgeReferenceImage(0, 1));
      y += bh + gap;
      if (y + bh <= maxY) {
        this.add("button", "reference-autofit", x, y, bw, bh, "Auto Fit", () => this.app.autoFitReferenceImage(), { clipRect: left });
        y += bh;
      }
      y += gap;
      const halfW = Math.floor((bw - gap) / 2);
      if (y + d.labelHeight <= maxY) {
        this.add("label", "reference-manual-width-label", x, y, halfW, d.labelHeight, "Width", null, { clipRect: left });
        this.add("label", "reference-manual-height-label", x + halfW + gap, y, bw - halfW - gap, d.labelHeight, "Height", null, { clipRect: left });
        y += d.labelHeight;
      }
      if (y + bh <= maxY) {
        this.add("button", "reference-manual-width", x, y, halfW, bh, manual.width || String(this.app.document.cols), () => this.app.promptReferenceManualSplitField("width", "Width", 1, 256), { centerText: true, clipRect: left });
        this.add("button", "reference-manual-height", x + halfW + gap, y, bw - halfW - gap, bh, manual.height || String(this.app.document.rows), () => this.app.promptReferenceManualSplitField("height", "Height", 1, 256), { centerText: true, clipRect: left });
        y += bh + gap;
      }
      if (y + d.labelHeight <= maxY) {
        this.add("label", "reference-manual-frames-label", x, y, halfW, d.labelHeight, "Frames", null, { clipRect: left });
        this.add("label", "reference-manual-apply-label", x + halfW + gap, y, bw - halfW - gap, d.labelHeight, "Apply", null, { clipRect: left });
        y += d.labelHeight;
      }
      if (y + bh <= maxY) {
        this.add("button", "reference-manual-frames", x, y, halfW, bh, manual.frames || String(this.app.document.frames.length), () => this.app.promptReferenceManualSplitField("frames", "Frames", 1, 512), { centerText: true, clipRect: left });
        this.add("button", "reference-manual-apply", x + halfW + gap, y, bw - halfW - gap, bh, "Apply Manual", () => this.app.applyManualReferenceSplit(), { clipRect: left });
        y += bh;
      }
      addSectionBottomGap();
    }

    if (this.app.activeTool !== "reference") {
      if (!addSectionHeader("select", "Select")) return;
      if (openSection === "select") {
        addSectionTopGap();
        if (y + bh > maxY) return;
        const hasSelection = !!this.app.document.selection;
        const hasClipboard = !!this.app.document.selectionClipboard;
        const selectionText = hasSelection
          ? `${this.app.document.selection.width}x${this.app.document.selection.height} selected`
          : (hasClipboard ? "Clipboard ready" : "No active selection");
        this.add("label", "select-status", x, y, bw, bh, selectionText, null, { clipRect: left });
        y += bh + gap;
        if (y + bh > maxY) return;
        addButtonRow("select-row1", y, "Copy", () => this.app.handleSelectionAction("sel-copy"), "Paste", () => this.app.handleSelectionAction("sel-paste"));
        y += bh + gap;
        if (y + bh > maxY) return;
        addButtonRow("select-row2", y, "Clear", () => this.app.clearSelection(), "Cut", () => this.app.handleSelectionAction("sel-cut"));
        y += bh + gap;
        if (y + bh > maxY) return;
        addButtonRow("select-move1", y, "Move Left", () => this.app.nudgeSelection(-1, 0, "Left"), "Move Right", () => this.app.nudgeSelection(1, 0, "Right"));
        y += bh + gap;
        if (y + bh <= maxY) {
          addButtonRow("select-move2", y, "Move Up", () => this.app.nudgeSelection(0, -1, "Up"), "Move Down", () => this.app.nudgeSelection(0, 1, "Down"));
          y += bh;
        }
        y += gap;
        if (y + bh <= maxY) {
          this.add("button", "select-move-complete", x, y, bw, bh, "Move Complete", () => {
            if (this.app.selectionMoveSession) {
              this.app.commitSelectionMove();
              this.app.showMessageAndRender("Selection move committed.");
              return;
            }
            this.app.showMessageAndRender("No move to commit.");
          }, { clipRect: left });
          y += bh;
        }
        addSectionBottomGap();
      }
    }

    if (!addSectionHeader("grid", "Grid")) return;
    if (openSection === "grid") {
      addSectionTopGap();
      if (y + bh > maxY) return;
      addButtonRow("grid-row", y, "Add Row", () => this.app.adjustGridRows(1), "Sub Row", () => this.app.adjustGridRows(-1));
      y += bh + gap;
      if (y + bh > maxY) return;
      addButtonRow("grid-col", y, "Add Col", () => this.app.adjustGridCols(1), "Sub Col", () => this.app.adjustGridCols(-1));
      y += bh + gap;
      if (y + bh <= maxY) {
        this.add("label", "grid-size-readout", x, y, bw, bh, `${this.app.document.cols} cols x ${this.app.document.rows} rows`, null, { clipRect: left });
        y += bh;
      }
      addSectionBottomGap();
    }

    if (!addSectionHeader("layer", "Layer")) return;
    if (openSection === "layer") {
      addSectionTopGap();
      const frame = this.app.document.ensureFrameLayers(this.app.document.activeFrame);
      const layer = frame.layers[frame.activeLayerIndex];
      const visibleText = layer && layer.visible !== false ? "Visible" : "Hidden";
      const opacityPct = `${Math.round(((layer && typeof layer.opacity === "number" ? layer.opacity : 1) * 100))}%`;
      if (y + bh > maxY) return;
      this.add("label", "layer-active-status", x, y, bw, bh, `Active: ${layer ? layer.name : "Layer"} | ${visibleText}`, null, { clipRect: left });
      y += bh + gap;
      if (y + bh > maxY) return;
      addButtonRow(
        "layer-actions",
        y,
        "Rename",
        () => this.app.openLayerRenamePrompt(),
        layer && layer.visible !== false ? "Hide" : "Show",
        () => this.app.toggleLayerVisibility()
      );
      y += bh + gap;
      if (y + bh > maxY) return;
      const minusW = 36;
      const plusW = 36;
      const readoutW = bw - minusW - plusW - gap * 2;
      this.add("button", "layer-opacity-down-active", x, y, minusW, bh, "-", () => this.app.adjustLayerOpacity(-0.1), { centerText: true, clipRect: left });
      this.add("button", "layer-opacity-readout-active", x + minusW + gap, y, readoutW, bh, opacityPct, null, { centerText: true, clipRect: left });
      this.add("button", "layer-opacity-up-active", x + minusW + gap + readoutW + gap, y, plusW, bh, "+", () => this.app.adjustLayerOpacity(0.1), { centerText: true, clipRect: left });
      y += bh;
    }
  };
}

export { installControlSurfaceLeftPanel };
