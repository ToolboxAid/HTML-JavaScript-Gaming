/*
Toolbox Aid
David Quesenberry
03/22/2026
InputRemappingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class InputRemappingScene extends Scene {
  constructor() {
    super();
    this.actor = { x: 180, y: 280, width: 34, height: 34 };
    this.message = 'Press R to remap move_right from D to L.';
    this.remapped = false;
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('remap') && !this.remapped) {
      engine.input.remapAction('move_right', ['KeyL']);
      this.remapped = true;
      this.message = 'move_right is now mapped to L.';
    }

    if (engine.input.isActionDown('move_left')) this.actor.x -= 220 * dt;
    if (engine.input.isActionDown('move_right')) this.actor.x += 220 * dt;
    this.actor.x = Math.max(40, Math.min(880, this.actor.x));
  }

  render(renderer, engine) {
    drawFrame(renderer, theme, [
      'Engine Sample109',
      'Input remapping updates engine-owned action bindings without changing scene logic.',
      this.message,
    ]);
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, '#34d399');
    drawPanel(renderer, 620, 34, 300, 126, 'Input Remapping', [
      `Remapped: ${this.remapped}`,
      `move_right: ${engine.input.actionMap.getKeys('move_right').join(', ')}`,
      'Movement still uses action names.',
      'Scene never reads raw keys.',
    ]);
  }
}
