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

  drawLine(x1, y1, x2, y2, color = '#000000', lineWidth = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawPolygon(points, options = {}) {
    if (!Array.isArray(points) || points.length < 2) {
      return;
    }

    const {
      fillColor = null,
      strokeColor = '#000000',
      lineWidth = 1,
      closePath = true,
    } = options;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      this.ctx.lineTo(points[index].x, points[index].y);
    }
    if (closePath) {
      this.ctx.closePath();
    }

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }

    if (strokeColor && lineWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
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

  drawImageFrame(image, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!image) {
      return;
    }

    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  getCanvasSize() {
    return {
      width: this.ctx.canvas.width,
      height: this.ctx.canvas.height,
    };
  }
}
