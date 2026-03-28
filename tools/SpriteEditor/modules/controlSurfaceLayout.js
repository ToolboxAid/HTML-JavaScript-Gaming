import { LOGICAL_H, LOGICAL_W } from "./constants.js";

function installControlSurfaceLayout(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.getDensityPresets = function getDensityPresets() {
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
  };

  SpriteEditorCanvasControlSurface.prototype.resolveDensity = function resolveDensity() {
    const presets = this.getDensityPresets();
    const effectiveMode = "pro";
    return { effectiveMode, config: presets[effectiveMode] };
  };

  SpriteEditorCanvasControlSurface.prototype.rebuildLayout = function rebuildLayout() {
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
  };
}

export { installControlSurfaceLayout };
