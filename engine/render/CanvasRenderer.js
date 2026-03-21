/*
Toolbox Aid
David Quesenberry
03/21/2026
CanvasRenderer.js
*/
import Renderer from './Renderer.js';

export default class CanvasRenderer extends Renderer {
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }

  clear(color) {
    const { width, height } = this.getCanvasSize();
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, width, height);
      return;
    }

    this.ctx.clearRect(0, 0, width, height);
  }

  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  strokeRect(x, y, width, height, color = '#000000', lineWidth = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x, y, width, height);
  }

  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawText(text, x, y, options = {}) {
    const {
      color = '#000000',
      font = '16px monospace',
      textAlign = 'start',
      textBaseline = 'alphabetic',
    } = options;

    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = textBaseline;
    this.ctx.fillText(text, x, y);

    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'alphabetic';
  }

  getCanvasSize() {
    return {
      width: this.ctx.canvas.width,
      height: this.ctx.canvas.height,
    };
  }
}
