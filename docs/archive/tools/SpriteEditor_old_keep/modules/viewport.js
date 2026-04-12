import { LOGICAL_H, LOGICAL_W } from "./constants.js";

class SpriteEditorViewport {
    constructor(canvas) {
      this.canvas = canvas;
      this.logicalWidth = LOGICAL_W;
      this.logicalHeight = LOGICAL_H;
      this.displayRect = { x: 0, y: 0, width: LOGICAL_W, height: LOGICAL_H, scale: 1 };
      this.pixelPerfect = true;
    }

    updateFromCanvasElement() {
      const rect = this.canvas.getBoundingClientRect();
      const scale = rect.width / this.logicalWidth;
      const width = rect.width;
      const height = rect.height;
      this.displayRect = {
        x: 0,
        y: 0,
        width,
        height,
        scale
      };
      this.canvas.width = this.logicalWidth;
      this.canvas.height = this.logicalHeight;
    }

    screenToLogical(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const dr = this.displayRect;
      if (localX < dr.x || localY < dr.y || localX > dr.x + dr.width || localY > dr.y + dr.height) return null;
      const nx = (localX - dr.x) / dr.width;
      const ny = (localY - dr.y) / dr.height;
      return {
        x: nx * this.logicalWidth,
        y: ny * this.logicalHeight
      };
    }

    togglePixelPerfect() {
      this.pixelPerfect = !this.pixelPerfect;
      this.canvas.style.imageRendering = this.pixelPerfect ? "pixelated" : "auto";
    }
}

export { SpriteEditorViewport };
