import { clamp } from '../utils/math.js';

export default class Camera2D {
  constructor({ viewportWidth = 960, viewportHeight = 540, worldWidth = 960, worldHeight = 540 } = {}) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.x = 0;
    this.y = 0;
  }

  setWorldSize(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  followRect(rect) {
    this.x = rect.x + rect.width / 2 - this.viewportWidth / 2;
    this.y = rect.y + rect.height / 2 - this.viewportHeight / 2;
  }

  clampToWorld() {
    this.x = clamp(this.x, 0, Math.max(0, this.worldWidth - this.viewportWidth));
    this.y = clamp(this.y, 0, Math.max(0, this.worldHeight - this.viewportHeight));
  }

  getOffset(screenX = 0, screenY = 0) {
    return {
      x: screenX - this.x,
      y: screenY - this.y,
    };
  }

  worldToScreen(worldX, worldY, screenX = 0, screenY = 0) {
    return {
      x: worldX + screenX - this.x,
      y: worldY + screenY - this.y,
    };
  }
}
