import { clamp } from '../utils/math.js';

export default class Camera2D {
  constructor({ x = 0, y = 0, viewportWidth = 960, viewportHeight = 540 } = {}) {
    this.x = x;
    this.y = y;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  setViewportSize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  followRect(rect) {
    this.x = rect.x + rect.width / 2 - this.viewportWidth / 2;
    this.y = rect.y + rect.height / 2 - this.viewportHeight / 2;
  }

  clampToWorld(worldWidth, worldHeight) {
    this.x = clamp(this.x, 0, Math.max(0, worldWidth - this.viewportWidth));
    this.y = clamp(this.y, 0, Math.max(0, worldHeight - this.viewportHeight));
  }

  getOffset(screenX = 0, screenY = 0) {
    return {
      x: screenX - this.x,
      y: screenY - this.y,
    };
  }
}
