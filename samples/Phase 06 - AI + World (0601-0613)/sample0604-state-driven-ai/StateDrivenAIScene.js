/*
Toolbox Aid
David Quesenberry
03/22/2026
StateDrivenAIScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { advancePatrolRoute, AIStateController, stepChaseBehavior } from '../../../src/engine/ai/index.js';

const theme = new Theme(ThemeTokens);

export default class StateDrivenAIScene extends Scene {
  constructor() {
    super();
    this.player = { x: 160, y: 280, width: 34, height: 34 };
    this.enemy = { x: 620, y: 260, width: 34, height: 34, speed: 120 };
    this.route = [{ x: 560, y: 220 }, { x: 760, y: 220 }, { x: 760, y: 340 }, { x: 560, y: 340 }];
    this.controller = new AIStateController({
      initial: 'patrol',
      states: {
        patrol: {
          act: ({ enemy, route, dt }) => advancePatrolRoute(enemy, route, dt, { speed: enemy.speed, tolerance: 4, loop: true }),
          transition: ({ distanceToPlayer }) => (distanceToPlayer < 180 ? 'chase' : null),
        },
        chase: {
          act: ({ enemy, player, dt }) => stepChaseBehavior(enemy, player, dt, { speed: 135, stopDistance: 12 }),
          transition: ({ distanceToPlayer }) => (distanceToPlayer > 240 ? 'patrol' : null),
        },
      },
    });
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    if (engine.input.isActionDown('move_up')) this.player.y -= move;
    if (engine.input.isActionDown('move_down')) this.player.y += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));
    this.player.y = Math.max(140, Math.min(460, this.player.y));

    const distanceToPlayer = Math.hypot(this.player.x - this.enemy.x, this.player.y - this.enemy.y);
    this.controller.update({
      dt,
      enemy: this.enemy,
      player: this.player,
      route: this.route,
      distanceToPlayer,
    });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0604',
      'A reusable AI state controller switches between patrol and chase behavior through data-driven conditions.',
      'Move near the orange actor to trigger chase.',
    ]);

    this.route.forEach((point) => {
      renderer.drawCircle(point.x + 17, point.y + 17, 6, '#60a5fa');
    });
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, '#f97316');

    drawPanel(renderer, 620, 34, 300, 126, 'State-Driven AI', [
      `AI state: ${this.controller.getState()}`,
      `Enemy x: ${this.enemy.x.toFixed(1)}`,
      `Player x: ${this.player.x.toFixed(1)}`,
      'Patrol -> Chase -> Patrol',
    ]);
  }
}
