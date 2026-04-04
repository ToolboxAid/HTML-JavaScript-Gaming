function installControlSurfaceMenus(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.closeOverflowPanel = function closeOverflowPanel() {
    this.overflowPanelOpen = false;
    this.overflowPanelBounds = null;
    this.overflowPanelControls = [];
    this.overflowAnchorControl = null;
    this.menuItems = [];
    this.topMenuSource = null;
  };

  SpriteEditorCanvasControlSurface.prototype.getMenuAnchorId = function getMenuAnchorId() {
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
  };

  SpriteEditorCanvasControlSurface.prototype.getOpenPanelItems = function getOpenPanelItems() {
    if (this.topMenuSource === "overflow") {
      return Array.isArray(this.hiddenTopControls) ? this.hiddenTopControls : [];
    }
    return Array.isArray(this.menuItems) ? this.menuItems : [];
  };

  SpriteEditorCanvasControlSurface.prototype.rebuildOverflowPanel = function rebuildOverflowPanel() {
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
    const rowDefs = itemsForMeasure.map((item, index) => {
      if (item && item.divider) {
        return {
          kind: "divider",
          id: item.id || `overflow-divider-${index}`,
          h: 8
        };
      }
      const measureText = item.shortcut ? `${item.text}   [${item.shortcut}]` : item.text;
      maxW = Math.max(maxW, this.measureButtonWidth(this.app.ctx, measureText, minBtn, padX));
      const row = {
        kind: "button",
        id: item.id || `overflow-item-${index}`,
        text: item.text,
        action: item.action,
        shortcut: item.shortcut || "",
        h: rowH
      };
      if (Object.prototype.hasOwnProperty.call(item, "menuSwatchColor")) {
        row.menuSwatchColor = String(item.menuSwatchColor || "");
      }
      return row;
    });
    const panelW = Math.max(160, maxW + panelPad * 2);
    const contentH = rowDefs.reduce((sum, row) => sum + (row.h || rowH), 0) + (Math.max(0, rowDefs.length - 1) * gap);
    const panelH = Math.max(rowH + panelPad * 2, panelPad * 2 + contentH);
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
    rowDefs.forEach((row, index) => {
      if (row.kind === "divider") {
        this.overflowPanelControls.push({
          kind: "divider",
          id: row.id || `overflow-divider-${index}`,
          x: panelX + panelPad,
          y,
          w: panelW - panelPad * 2,
          h: row.h || 8
        });
        y += (row.h || 8) + gap;
        return;
      }
      const control = {
        kind: "button",
        id: `overflow-item-${index}`,
        x: panelX + panelPad,
        y,
        w: panelW - panelPad * 2,
        h: row.h || rowH,
        text: row.text,
        action: row.action,
        shortcut: row.shortcut || ""
      };
      if (Object.prototype.hasOwnProperty.call(row, "menuSwatchColor")) {
        control.menuSwatchColor = String(row.menuSwatchColor || "");
      }
      this.overflowPanelControls.push(control);
      y += (row.h || rowH) + gap;
    });
    this.app.ctx.font = prevFont;
  };

  SpriteEditorCanvasControlSurface.prototype.toggleOverflowPanel = function toggleOverflowPanel() {
    if (this.overflowPanelOpen) {
      this.closeOverflowPanel();
      return;
    }
    if (!this.hiddenTopControls.length) return;
    this.menuItems = [];
    this.topMenuSource = "overflow";
    this.overflowPanelOpen = true;
    this.rebuildOverflowPanel();
  };

  SpriteEditorCanvasControlSurface.prototype.toggleTopMenu = function toggleTopMenu(source, items) {
    if (this.overflowPanelOpen && this.topMenuSource === source) {
      this.closeOverflowPanel();
      return;
    }
    this.menuItems = Array.isArray(items) ? items.slice() : [];
    this.topMenuSource = source || "menu";
    this.overflowPanelOpen = true;
    this.rebuildOverflowPanel();
  };

  SpriteEditorCanvasControlSurface.prototype.drawOverflowPanel = function drawOverflowPanel(ctx) {
    if (!this.overflowPanelOpen || !this.overflowPanelBounds) return;
    const p = this.overflowPanelBounds;
    ctx.fillStyle = "rgba(7, 12, 18, 0.86)";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#182432";
    ctx.fillRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
    ctx.strokeStyle = "#4cc9f0";
    ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
    this.overflowPanelControls.forEach((c) => this.drawControl(ctx, c));
  };
}

export { installControlSurfaceMenus };
