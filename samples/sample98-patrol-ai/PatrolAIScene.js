/*
Toolbox Aid
David Quesenberry
03/22/2026
PatrolAIScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { advancePatrolRoute } from '../../engine/ai/index.js';

const theme = new Theme(ThemeTokens);

export default class PatrolAIScene extends Scene {
  constructor() {
    super();
    this.route = [
      { x: 180, y: 280 },
      { x: 320, y: 220 },
      { x: 520, y: 300 },
      { x: 760, y: 220 },
    ];
    this.guard = { x: 180, y: 280, width: 34, height: 34, speed: 140 };
  }

  update(dt) {
    advancePatrolRoute(this.guard, this.route, dt, { speed: this.guard.speed, tolerance: 6, loop: true });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample98',
      'Patrol movement follows reusable engine route logic instead of scene-owned branches.',
      'The guard cycles through data-driven patrol points.',
    ]);

    this.route.forEach((point, index) => {
      renderer.drawCircle(point.x + 17, point.y + 17, 8, index === this.guard.routeIndex ? '#fbbf24' : '#60a5fa');
    });
    renderer.drawRect(this.guard.x, this.guard.y, this.guard.width, this.guard.height, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Patrol AI', [
      `Current waypoint: ${this.guard.routeIndex ?? 0}`,
      `Speed: ${this.guard.speed}`,
      `Guard x: ${this.guard.x.toFixed(1)}`,
      'Route order is reusable data.',
    ]);
  }
}
