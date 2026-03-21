/*
Toolbox Aid
David Quesenberry
03/21/2026
InputActionMappingScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class InputActionMappingScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 180, y: 290, width: 46, height: 46, speed: 260 };
    this.lastAction = 'none';
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    this.lastAction = 'none';

    if (engine.input.isActionDown('move_left')) { this.player.x -= move; this.lastAction = 'move_left'; }
    if (engine.input.isActionDown('move_right')) { this.player.x += move; this.lastAction = 'move_right'; }
    if (engine.input.isActionDown('move_up')) { this.player.y -= move; this.lastAction = 'move_up'; }
    if (engine.input.isActionDown('move_down')) { this.player.y += move; this.lastAction = 'move_down'; }

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample46',
      'Demonstrates action-based input mapping independent of raw keys',
      'Use Arrow keys or WASD to move the actor through actions',
      `Last action: ${this.lastAction}`,
      'This sample locks gameplay against action names instead of key codes',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 620, 184, 300, 126, 'Action Mapping', [
      'move_left = ArrowLeft / KeyA',
      'move_right = ArrowRight / KeyD',
      'move_up = ArrowUp / KeyW',
      'move_down = ArrowDown / KeyS',
    ]);
  }
}
