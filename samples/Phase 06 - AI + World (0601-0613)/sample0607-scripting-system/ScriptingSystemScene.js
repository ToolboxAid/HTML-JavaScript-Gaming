/*
Toolbox Aid
David Quesenberry
03/22/2026
ScriptingSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { EventScriptSystem } from '../../../engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class ScriptingSystemScene extends Scene {
  constructor() {
    super();
    this.button = { x: 220, y: 286, width: 42, height: 24 };
    this.door = { x: 620, y: 240, width: 60, height: 100, open: false };
    this.player = { x: 120, y: 280, width: 34, height: 34 };
    this.message = 'Press Space on the button to fire a scripted event.';
  }

  enter(engine) {
    this.scriptSystem = new EventScriptSystem({
      bus: engine.events,
      scripts: [{
        event: 'button_pressed',
        actions: [
          () => {
            this.door.open = true;
            this.message = 'Scripted event opened the door.';
          },
        ],
      }],
    });
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));

    const overlap = this.player.x < this.button.x + this.button.width && this.player.x + this.player.width > this.button.x;
    if (overlap && engine.input.isActionPressed('interact')) {
      engine.events.emit('button_pressed', { source: 'buttonA' });
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0607',
      'Event-driven scripting reacts to published events without hardcoding the outcome in scene branches.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.button.x, this.button.y, this.button.width, this.button.height, '#fbbf24');
    renderer.drawRect(this.door.x, this.door.y, this.door.width, this.door.height, this.door.open ? '#22c55e' : '#ef4444');

    drawPanel(renderer, 620, 34, 300, 126, 'Scripting System', [
      `Door open: ${this.door.open}`,
      `Listeners: scripted via EventScriptSystem`,
      'Button publishes an event.',
      'Script actions react to it.',
    ]);
  }

  exit() {
    this.scriptSystem?.dispose();
  }
}
