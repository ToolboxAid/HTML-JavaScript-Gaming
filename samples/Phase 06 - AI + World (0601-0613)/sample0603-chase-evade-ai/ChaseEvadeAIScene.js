/*
Toolbox Aid
David Quesenberry
03/22/2026
ChaseEvadeAIScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { stepChaseBehavior, stepEvadeBehavior } from '../../../src/engine/ai/index.js';

const theme = new Theme(ThemeTokens);

export default class ChaseEvadeAIScene extends Scene {
  constructor() {
    super();
    this.target = { x: 180, y: 280, width: 34, height: 34 };
    this.chaser = { x: 720, y: 220, width: 34, height: 34 };
    this.evader = { x: 720, y: 340, width: 34, height: 34 };
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.target.x -= move;
    if (engine.input.isActionDown('move_right')) this.target.x += move;
    if (engine.input.isActionDown('move_up')) this.target.y -= move;
    if (engine.input.isActionDown('move_down')) this.target.y += move;
    this.target.x = Math.max(40, Math.min(880, this.target.x));
    this.target.y = Math.max(140, Math.min(460, this.target.y));

    stepChaseBehavior(this.chaser, this.target, dt, { speed: 110, stopDistance: 18 });
    stepEvadeBehavior(this.evader, this.target, dt, { speed: 120, desiredDistance: 220 });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0603',
      'Chase and evade use reusable engine steering behaviors against the same target.',
      'Move the green target with Arrow keys.',
    ]);

    renderer.drawRect(this.target.x, this.target.y, this.target.width, this.target.height, '#34d399');
    renderer.drawRect(this.chaser.x, this.chaser.y, this.chaser.width, this.chaser.height, '#f97316');
    renderer.drawRect(this.evader.x, this.evader.y, this.evader.width, this.evader.height, '#60a5fa');

    drawPanel(renderer, 620, 34, 300, 126, 'Chase / Evade', [
      `Chaser x: ${this.chaser.x.toFixed(1)}`,
      `Evader x: ${this.evader.x.toFixed(1)}`,
      `Target x: ${this.target.x.toFixed(1)}`,
      'Orange seeks. Blue flees.',
    ]);
  }
}
