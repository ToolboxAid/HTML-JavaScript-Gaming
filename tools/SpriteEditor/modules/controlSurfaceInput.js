import { xyInRect } from "../../../engine/utils/index.js";

function installControlSurfaceInput(SpriteEditorCanvasControlSurface) {
  SpriteEditorCanvasControlSurface.prototype.getControlAt = function getControlAt(x, y) {
    if (this.commandPaletteOpen) {
      for (let i = this.commandPaletteRowControls.length - 1; i >= 0; i -= 1) {
        const c = this.commandPaletteRowControls[i];
        if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
      }
    }
    if (this.overflowPanelOpen) {
      for (let i = this.overflowPanelControls.length - 1; i >= 0; i -= 1) {
        const c = this.overflowPanelControls[i];
        if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
      }
    }
    for (let i = this.controls.length - 1; i >= 0; i -= 1) {
      const c = this.controls[i];
      if (c.kind === "label") continue;
      if (x >= c.x && y >= c.y && x <= c.x + c.w && y <= c.y + c.h) return c;
    }
    return null;
  };

  SpriteEditorCanvasControlSurface.prototype.updateHover = function updateHover(x, y) {
    const c = this.getControlAt(x, y);
    this.hovered = c ? c.id : null;
    if (this.dragFrameIndex !== null) {
      this.dragOverFrameIndex = c && c.kind === "frame" ? c.frameIndex : null;
    }
  };

  SpriteEditorCanvasControlSurface.prototype.pointerDown = function pointerDown(x, y) {
    if (this.commandPaletteOpen) {
      if (!xyInRect(x, y, this.commandPaletteBounds)) {
        this.closeCommandPalette();
        this.pressed = null;
        return { id: "command-palette-dismiss", kind: "button" };
      }
      if (this.toggleFavoriteAt(x, y)) {
        this.pressed = null;
        return { id: "command-palette-favorite", kind: "button" };
      }
    }
    if (this.overflowPanelOpen) {
      const inPanel = this.overflowPanelBounds &&
        x >= this.overflowPanelBounds.x && y >= this.overflowPanelBounds.y &&
        x <= this.overflowPanelBounds.x + this.overflowPanelBounds.w &&
        y <= this.overflowPanelBounds.y + this.overflowPanelBounds.h;
      const anchorId = this.getMenuAnchorId();
      const anchorButton = this.controls.find((c) => c.id === anchorId);
      const inAnchorButton = anchorButton &&
        x >= anchorButton.x && y >= anchorButton.y &&
        x <= anchorButton.x + anchorButton.w && y <= anchorButton.y + anchorButton.h;
      if (!inPanel && !inAnchorButton) {
        this.closeOverflowPanel();
        this.pressed = null;
        return { id: "overflow-dismiss", kind: "button" };
      }
    }
    const c = this.getControlAt(x, y);
    this.pressed = c ? c.id : null;
    if (c && c.kind === "frame") {
      this.dragFrameIndex = c.frameIndex;
      this.dragOverFrameIndex = c.frameIndex;
      this.dragFeedbackText = "Dragging frame " + (c.frameIndex + 1);
    }
    return c;
  };

  SpriteEditorCanvasControlSurface.prototype.pointerUp = function pointerUp(x, y) {
    const c = this.getControlAt(x, y);
    const from = this.dragFrameIndex;
    const to = this.dragOverFrameIndex;
    this.dragFrameIndex = null;
    this.dragOverFrameIndex = null;
    this.dragFeedbackText = "";
    if (from !== null && to !== null && from !== to) {
      this.pressed = null;
      this.app.reorderFrame(from, to);
      return true;
    }
    const ok = c && c.id === this.pressed;
    this.pressed = null;
    if (!ok) return false;
    if (typeof c.action === "function") {
      const previousMenuSource = this.topMenuSource;
      c.action();
      if (c.isCommandRow) this.closeCommandPalette();
      if (c.id.indexOf("overflow-item-") === 0 && this.topMenuSource === previousMenuSource) {
        this.closeOverflowPanel();
      }
      return true;
    }
    return false;
  };
}

export { installControlSurfaceInput };
