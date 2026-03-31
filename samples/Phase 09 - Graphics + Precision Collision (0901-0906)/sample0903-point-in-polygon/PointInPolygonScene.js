/*
Toolbox Aid
David Quesenberry
03/22/2026
PointInPolygonScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { drawVectorShape } from '../../../engine/vector/index.js';
import { isPointInPolygon } from '../../../engine/collision/index.js';

const theme = new Theme(ThemeTokens);

const polygon = [
  { x: 180, y: 240 },
  { x: 460, y: 250 },
  { x: 520, y: 340 },
  { x: 320, y: 390 },
  { x: 160, y: 330 },
];

export default class PointInPolygonScene extends Scene {
  constructor() {
    super();
    this.probe = { x: 150, y: 300 };
    this.direction = 1;
  }

  update(dtSeconds) {
    this.probe.x += this.direction * 140 * dtSeconds;
    if (this.probe.x > 520) {
      this.direction = -1;
    } else if (this.probe.x < 140) {
      this.direction = 1;
    }
  }

  render(renderer) {
    const inside = isPointInPolygon(this.probe, polygon);

    drawFrame(renderer, theme, [
      'Engine Sample134',
      'Inside-shape testing stays reusable through point-in-polygon checks.',
      inside ? 'Probe is inside.' : 'Probe is outside.',
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    drawVectorShape(renderer, polygon, { strokeColor: '#a78bfa', fillColor: 'rgba(167,139,250,0.18)', lineWidth: 3 });
    renderer.drawCircle(this.probe.x, this.probe.y, 10, inside ? '#22c55e' : '#ef4444');

    drawPanel(renderer, 620, 34, 300, 140, 'Point In Polygon', [
      `Inside: ${inside}`,
      `Probe X: ${this.probe.x.toFixed(0)}`,
      'A point probe can use the true interior, not only bounds.',
    ]);
  }
}
