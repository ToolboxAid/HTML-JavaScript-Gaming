/*
Toolbox Aid
David Quesenberry
03/22/2026
ConfigSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class ConfigSystemScene extends Scene {
  constructor(config) {
    super();
    this.config = config;
    this.player = { x: 150, y: 290, width: 36, height: 36 };
    this.goal = {
      x: config.get('goal.x'),
      y: config.get('goal.y'),
      width: config.get('goal.width'),
      height: config.get('goal.height'),
      color: config.get('goal.color'),
    };
    this.message = 'Movement speed, colors, and goal placement are coming from JSON-driven config.';
  }

  update(dt, engine) {
    const move = this.config.get('player.speed', 220) * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample93',
      'A reusable config store loads JSON text and exposes settings through engine-owned access paths.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, this.config.get('player.color'));
    renderer.drawRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height, this.goal.color);

    drawPanel(renderer, 620, 34, 300, 126, 'Config Store', [
      `Title: ${this.config.get('title')}`,
      `Player speed: ${this.config.get('player.speed')}`,
      `Goal x: ${this.config.get('goal.x')}`,
      `Goal color: ${this.config.get('goal.color')}`,
    ]);
  }
}
