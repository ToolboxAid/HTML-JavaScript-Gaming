import { installControlSurfaceLeftPanel } from "./controlSurfaceLeftPanel.js";
import { installControlSurfaceRightPanel } from "./controlSurfaceRightPanel.js";
import { installControlSurfaceTopBar } from "./controlSurfaceTopBar.js";

function installControlSurfaceBuild(SpriteEditorCanvasControlSurface) {
  installControlSurfaceLeftPanel(SpriteEditorCanvasControlSurface);
  installControlSurfaceRightPanel(SpriteEditorCanvasControlSurface);
  installControlSurfaceTopBar(SpriteEditorCanvasControlSurface);

  SpriteEditorCanvasControlSurface.prototype.add = function add(kind, id, x, y, w, h, text, action, extra = {}) {
    this.controls.push({ kind, id, x, y, w, h, text, action, ...extra });
  };

  SpriteEditorCanvasControlSurface.prototype.build = function build() {
    const density = this.resolveDensity();
    const d = density.config;
    const effectiveMode = density.effectiveMode;
    this.buildTopBar(d, effectiveMode);
    this.buildLeftPanel(d);
    this.buildRightPanel(d);
  };
}

export { installControlSurfaceBuild };
