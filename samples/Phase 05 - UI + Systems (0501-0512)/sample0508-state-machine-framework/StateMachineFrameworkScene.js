/*
Toolbox Aid
David Quesenberry
03/22/2026
StateMachineFrameworkScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { StateMachine } from '../../../engine/state/index.js';

const theme = new Theme(ThemeTokens);

export default class StateMachineFrameworkScene extends Scene {
  constructor() {
    super();
    this.actor = { x: 180, y: 280, width: 42, height: 42, velocityX: 0, color: '#7dd3fc' };
    this.enterCount = 0;
    this.exitCount = 0;
    this.message = 'Press Left and Right to transition between idle, move, and charge.';
    this.machine = new StateMachine({
      initial: 'idle',
      states: {
        idle: {
          enter: () => { this.enterCount += 1; this.actor.color = '#7dd3fc'; },
          update: ({ moving, charging }) => (charging ? 'charge' : (moving ? 'move' : null)),
          exit: () => { this.exitCount += 1; },
        },
        move: {
          enter: () => { this.enterCount += 1; this.actor.color = '#34d399'; },
          update: ({ moving, charging }) => (charging ? 'charge' : (!moving ? 'idle' : null)),
          exit: () => { this.exitCount += 1; },
        },
        charge: {
          enter: () => { this.enterCount += 1; this.actor.color = '#f59e0b'; },
          canTransition: ({ next }) => next !== 'idle',
          update: ({ charging, moving }) => (!charging ? (moving ? 'move' : 'move') : null),
          exit: () => { this.exitCount += 1; },
        },
      },
    });
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const moving = left || right;
    const charging = engine.input.isActionDown('charge');
    this.actor.velocityX = left ? -180 : (right ? 180 : 0);
    this.actor.x = Math.max(40, Math.min(878, this.actor.x + this.actor.velocityX * dt));
    this.machine.update({ moving, charging });
    this.message = `Current framework state: ${this.machine.getState()}.`;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample92',
      'Reusable state machine primitives drive transitions, enter hooks, exit hooks, and guards.',
      this.message,
    ]);

    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, this.actor.color);

    drawPanel(renderer, 620, 34, 300, 126, 'State Machine', [
      `State: ${this.machine.getState()}`,
      `Enter count: ${this.enterCount}`,
      `Exit count: ${this.exitCount}`,
      `VelocityX: ${this.actor.velocityX.toFixed(0)}`,
    ]);
  }
}
