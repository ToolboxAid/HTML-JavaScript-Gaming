/*
Toolbox Aid
David Quesenberry
03/22/2026
ControllerSupportScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class ControllerSupportScene extends Scene {
  constructor() {
    super();
    this.actor = { x: 180, y: 280, width: 34, height: 34 };
  }

  update(dt, engine) {
    if (engine.input.isActionDown('move_left')) this.actor.x -= 220 * dt;
    if (engine.input.isActionDown('move_right')) this.actor.x += 220 * dt;
    this.actor.x = Math.max(40, Math.min(880, this.actor.x));
  }

  render(renderer, engine) {
    drawFrame(renderer, theme, [
      'Engine sample 0702',
      'Controller bindings flow through the same action-input abstraction as keyboard controls.',
      'Keyboard A/D or Pad0 Button0/Button1 can drive the same actions.',
    ]);
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, '#34d399');
    drawPanel(renderer, 620, 34, 300, 126, 'Controller Support', [
      `move_left: ${engine.input.actionMap.getKeys('move_left').join(', ')}`,
      `move_right: ${engine.input.actionMap.getKeys('move_right').join(', ')}`,
      `Pads seen: ${engine.input.gamepads.getGamepads().length}`,
      'Actions remain abstracted.',
    ]);
  }
}
