/*
Toolbox Aid
David Quesenberry
03/22/2026
PixelPerfectCollisionScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { createRasterMask, areMasksColliding, isColliding, getMaskBounds } from '/src/engine/collision/index.js';

const theme = new Theme(ThemeTokens);

const ringMask = createRasterMask([
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
], { cellSize: 18 });

const fillMask = createRasterMask([
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
], { cellSize: 18 });

function drawMask(renderer, mask, originX, originY, color) {
  for (let row = 0; row < mask.height; row += 1) {
    for (let col = 0; col < mask.width; col += 1) {
      if (mask.rows[row][col] !== 1) {
        continue;
      }
      renderer.drawRect(originX + col * 18, originY + row * 18, 16, 16, color);
    }
  }
}

export default class PixelPerfectCollisionScene extends Scene {
  constructor() {
    super();
    this.offsetX = -80;
  }

  update(dtSeconds) {
    this.offsetX += 80 * dtSeconds;
    if (this.offsetX > 110) {
      this.offsetX = -80;
    }
  }

  render(renderer) {
    const ax = 240;
    const ay = 250;
    const bx = 258 + this.offsetX;
    const by = 268;
    const boundsHit = isColliding(getMaskBounds(ringMask, ax, ay), getMaskBounds(fillMask, bx, by));
    const pixelHit = areMasksColliding(ringMask, ax, ay, fillMask, bx, by);

    drawFrame(renderer, theme, [
      'Engine sample 0905',
      'Pixel-perfect overlap resolves at occupied-cell precision.',
      pixelHit ? 'Pixel overlap: true' : 'Pixel overlap: false',
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawMask(renderer, ringMask, ax, ay, '#a78bfa');
    drawMask(renderer, fillMask, bx, by, pixelHit ? '#ef4444' : '#22c55e');

    drawPanel(renderer, 620, 34, 300, 170, 'Pixel Perfect Collision', [
      `Bounds Hit: ${boundsHit}`,
      `Pixel Hit: ${pixelHit}`,
      'The small block can enter the ring bounds without touching filled cells.',
    ]);
  }
}
