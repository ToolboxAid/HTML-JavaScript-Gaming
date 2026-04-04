import { installControlSurfaceBuild } from "./controlSurfaceBuild.js";
import { installControlSurfaceBottomPanel } from "./controlSurfaceBottomPanel.js";
import { installControlSurfaceCommandPalette } from "./controlSurfaceCommandPalette.js";
import { installControlSurfaceDraw } from "./controlSurfaceDraw.js";
import { installControlSurfaceInput } from "./controlSurfaceInput.js";
import { installControlSurfaceLayout } from "./controlSurfaceLayout.js";
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
}

installControlSurfaceBuild(SpriteEditorCanvasControlSurface);
installControlSurfaceBottomPanel(SpriteEditorCanvasControlSurface);
installControlSurfaceCommandPalette(SpriteEditorCanvasControlSurface);
installControlSurfaceDraw(SpriteEditorCanvasControlSurface);
installControlSurfaceInput(SpriteEditorCanvasControlSurface);
installControlSurfaceLayout(SpriteEditorCanvasControlSurface);
installControlSurfaceMenus(SpriteEditorCanvasControlSurface);

export { SpriteEditorCanvasControlSurface };
