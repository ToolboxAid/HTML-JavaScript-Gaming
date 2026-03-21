/*
Toolbox Aid
David Quesenberry
03/21/2026
Renderer.js
*/
export default class Renderer {
  clear(color) {
    throw new Error('Renderer.clear must be implemented by a concrete renderer.');
  }

  drawRect(x, y, width, height, color) {
    throw new Error('Renderer.drawRect must be implemented by a concrete renderer.');
  }

  strokeRect(x, y, width, height, color = '#000000', lineWidth = 1) {
    throw new Error('Renderer.strokeRect must be implemented by a concrete renderer.');
  }

  drawCircle(x, y, radius, color) {
    throw new Error('Renderer.drawCircle must be implemented by a concrete renderer.');
  }

  drawText(text, x, y, options = {}) {
    throw new Error('Renderer.drawText must be implemented by a concrete renderer.');
  }

  getCanvasSize() {
    throw new Error('Renderer.getCanvasSize must be implemented by a concrete renderer.');
  }
}
