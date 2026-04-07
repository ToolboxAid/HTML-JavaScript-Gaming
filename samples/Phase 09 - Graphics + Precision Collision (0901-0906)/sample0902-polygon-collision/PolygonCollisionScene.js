/*
Toolbox Aid
David Quesenberry
03/22/2026
PolygonCollisionScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { transformPoints, drawVectorShape } from '../../../engine/vector/index.js';
import { arePolygonsColliding } from '../../../engine/collision/index.js';

const theme = new Theme(ThemeTokens);
const triangle = [{ x: 0, y: -26 }, { x: 24, y: 20 }, { x: -24, y: 20 }];

export default class PolygonCollisionScene extends Scene {
  constructor() {
    super();
    this.moverX = 180;
    this.rotation = 0;
  }

  update(dtSeconds) {
    this.moverX += 120 * dtSeconds;
    if (this.moverX > 420) {
      this.moverX = 180;
    }
    this.rotation += dtSeconds;
  }

  render(renderer) {
    const staticPoly = transformPoints(triangle, { x: 380, y: 300, rotation: 0.3, scale: 2 });
    const movingPoly = transformPoints(triangle, { x: this.moverX, y: 300, rotation: this.rotation, scale: 2 });
    const hit = arePolygonsColliding(staticPoly, movingPoly);

    drawFrame(renderer, theme, [
      'Engine sample 0902',
      'Polygon-vs-polygon collision comes from an engine-owned SAT check.',
      hit ? 'Collision: true' : 'Collision: false',
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawVectorShape(renderer, staticPoly, { strokeColor: '#f59e0b', lineWidth: 3 });
    drawVectorShape(renderer, movingPoly, { strokeColor: hit ? '#ef4444' : '#34d399', lineWidth: 3 });

    drawPanel(renderer, 620, 34, 300, 140, 'Polygon Collision', [
      `Collision: ${hit}`,
      `Mover X: ${this.moverX.toFixed(0)}`,
      'Broad boxes would be looser than this shape test.',
    ]);
  }
}
