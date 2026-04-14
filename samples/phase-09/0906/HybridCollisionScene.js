/*
Toolbox Aid
David Quesenberry
03/22/2026
HybridCollisionScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { transformPoints, drawVectorShape } from '/src/engine/rendering/index.js';
import {
  createRasterMask,
  runHybridCollision,
  getCollisionBoundsFromPolygon,
} from '/src/engine/collision/index.js';

const theme = new Theme(ThemeTokens);
const ship = [{ x: 0, y: -18 }, { x: 18, y: 18 }, { x: -18, y: 18 }];
const shipMask = createRasterMask([
  [0, 1, 0],
  [1, 1, 1],
  [1, 1, 1],
], { cellSize: 12 });

export default class HybridCollisionScene extends Scene {
  constructor() {
    super();
    this.offsetX = -120;
  }

  update(dtSeconds) {
    this.offsetX += 100 * dtSeconds;
    if (this.offsetX > 120) {
      this.offsetX = -120;
    }
  }

  render(renderer) {
    const polyA = transformPoints(ship, { x: 280, y: 300, rotation: 0.1, scale: 2 });
    const polyB = transformPoints(ship, { x: 380 + this.offsetX, y: 300, rotation: -0.25, scale: 2 });
    const result = runHybridCollision({
      boundsA: getCollisionBoundsFromPolygon(polyA),
      boundsB: getCollisionBoundsFromPolygon(polyB),
      polygonA: polyA,
      polygonB: polyB,
      maskA: shipMask,
      maskB: shipMask,
      maskAX: 274,
      maskAY: 294,
      maskBX: 374 + this.offsetX,
      maskBY: 294,
    });

    drawFrame(renderer, theme, [
      'Engine sample 0906',
      'Hybrid collision stages bounds, shape, and pixel checks in order.',
      result.collided ? 'Hybrid collision: true' : 'Hybrid collision: false',
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawVectorShape(renderer, polyA, { strokeColor: '#f59e0b', lineWidth: 3 });
    drawVectorShape(renderer, polyB, { strokeColor: result.collided ? '#ef4444' : '#34d399', lineWidth: 3 });

    drawPanel(renderer, 620, 34, 300, 180, 'Hybrid Collision', [
      `Bounds: ${result.bounds}`,
      `Shape: ${result.shape}`,
      `Pixel: ${result.pixel}`,
      `Final: ${result.collided}`,
      'Broad phase rejects early, narrow phase confirms accurately.',
    ]);
  }
}
