/*
Toolbox Aid
David Quesenberry
03/21/2026
StateMachineScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { StateMachine } from '/src/engine/state/index.js';

const theme = new Theme(ThemeTokens);

export default class StateMachineScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.block = { x: 500, y: 260, width: 150, height: 80 };
    this.player = { x: 150, y: 290, width: 52, height: 52, speed: 250 };
    this.blocked = false;
    this.machine = new StateMachine({
      initial: 'idle',
      states: {
        idle: {
          update: ({ moving, blocked }) => blocked ? 'blocked' : (moving ? 'move' : null),
        },
        move: {
          update: ({ moving, blocked }) => blocked ? 'blocked' : (!moving ? 'idle' : null),
        },
        blocked: {
          update: ({ blocked, moving }) => !blocked ? (moving ? 'move' : 'idle') : null,
        },
      },
    });
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    let moving = false;
    const prev = { x: this.player.x, y: this.player.y };

    if (engine.input.isDown('ArrowLeft')) { this.player.x -= move; moving = true; }
    if (engine.input.isDown('ArrowRight')) { this.player.x += move; moving = true; }
    if (engine.input.isDown('ArrowUp')) { this.player.y -= move; moving = true; }
    if (engine.input.isDown('ArrowDown')) { this.player.y += move; moving = true; }

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    this.blocked =
      this.player.x < this.block.x + this.block.width &&
      this.player.x + this.player.width > this.block.x &&
      this.player.y < this.block.y + this.block.height &&
      this.player.y + this.player.height > this.block.y;

    if (this.blocked) {
      this.player.x = prev.x;
      this.player.y = prev.y;
    }

    this.machine.update({ moving, blocked: this.blocked });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0208',
      'Demonstrates state-driven behavior with a reusable state machine',
      'Use Arrow keys to move and run into the block to enter blocked state',
      `Current state: ${this.machine.getState()}`,
      'This sample draws a clean line between state logic and scene composition',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
    renderer.drawRect(this.block.x, this.block.y, this.block.width, this.block.height, '#8888ff');
    renderer.strokeRect(this.block.x, this.block.y, this.block.width, this.block.height, '#ffffff', 1);

    const colorMap = { idle: '#7dd3fc', move: '#34d399', blocked: '#f87171' };
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, colorMap[this.machine.getState()] || theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 640, 184, 280, 126, 'State Machine', [
      `State: ${this.machine.getState()}`,
      `Blocked: ${this.blocked ? 'yes' : 'no'}`,
      'idle -> move',
      'move -> blocked',
    ]);
  }
}
