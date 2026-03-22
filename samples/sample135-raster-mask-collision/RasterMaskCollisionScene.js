/*
Toolbox Aid
David Quesenberry
03/22/2026
RasterMaskCollisionScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { createRasterMask, areMasksColliding, isColliding, getMaskBounds } from '../../engine/collision/index.js';

const theme = new Theme(ThemeTokens);

const plusMask = createRasterMask([
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
], { cellSize: 24 });

const lMask = createRasterMask([
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 1],
], { cellSize: 24 });

function drawMask(renderer, mask, originX, originY, color) {
  for (let row = 0; row < mask.height; row += 1) {
    for (let col = 0; col < mask.width; col += 1) {
      if (mask.rows[row][col] !== 1) {
        continue;
      }
      renderer.drawRect(originX + col * 24, originY + row * 24, 22, 22, color);
    }
  }
}

export default class RasterMaskCollisionScene extends Scene {
  constructor() {
    super();
    this.offsetX = 0;
    this.direction = 1;
  }

  update(dtSeconds) {
    this.offsetX += this.direction * 90 * dtSeconds;
    if (this.offsetX > 96) this.direction = -1;
    if (this.offsetX < -36) this.direction = 1;
  }

  render(renderer) {
    const ax = 220;
    const ay = 270;
    const bx = 300 + this.offsetX;
    const by = 270;
    const boundsHit = isColliding(getMaskBounds(plusMask, ax, ay), getMaskBounds(lMask, bx, by));
    const maskHit = areMasksColliding(plusMask, ax, ay, lMask, bx, by);

    drawFrame(renderer, theme, [
      'Engine Sample135',
      'Raster mask collision checks occupied cells instead of only loose bounds.',
      maskHit ? 'Mask collision: true' : 'Mask collision: false',
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawMask(renderer, plusMask, ax, ay, '#38bdf8');
    drawMask(renderer, lMask, bx, by, maskHit ? '#ef4444' : '#34d399');
    renderer.strokeRect(ax, ay, plusMask.width * 24, plusMask.height * 24, '#64748b', 1);
    renderer.strokeRect(bx, by, lMask.width * 24, lMask.height * 24, '#64748b', 1);

    drawPanel(renderer, 620, 34, 300, 160, 'Raster Mask Collision', [
      `Bounds Hit: ${boundsHit}`,
      `Mask Hit: ${maskHit}`,
      'Mask occupancy can disagree with coarse bounds overlap.',
    ]);
  }
}
