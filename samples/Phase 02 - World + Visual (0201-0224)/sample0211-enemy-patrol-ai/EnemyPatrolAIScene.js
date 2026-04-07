/*
Toolbox Aid
David Quesenberry
03/21/2026
EnemyPatrolAIScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { updatePatrolEntity, isWithinDetectionRange } from '../../../engine/ai/index.js';

const theme = new Theme(ThemeTokens);

export default class EnemyPatrolAIScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 120, y: 300, width: 46, height: 46, speed: 250 };
    this.enemy = {
      transform: { x: 520, y: 290 },
      size: { width: 52, height: 52 },
      patrol: { minX: 420, maxX: 760, speed: 160, direction: 1 },
      detectionRange: 180,
    };
    this.detected = false;
  }

  update(dt, engine) {
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    updatePatrolEntity(this.enemy, dt);
    this.detected = isWithinDetectionRange(this.player, {
      x: this.enemy.transform.x,
      y: this.enemy.transform.y,
      width: this.enemy.size.width,
      height: this.enemy.size.height,
    }, this.enemy.detectionRange);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 0211',
      'Demonstrates patrol behavior and player detection using engine AI helpers',
      'Use Arrow keys to move near the patrolling enemy',
      `Detection state: ${this.detected ? 'player detected' : 'patrolling'}`,
      'This sample establishes a simple reusable enemy behavior pattern',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
    renderer.strokeRect(this.enemy.patrol.minX, 260, this.enemy.patrol.maxX - this.enemy.patrol.minX + this.enemy.size.width, 120, '#666666', 1);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    const enemyColor = this.detected ? '#f87171' : '#8888ff';
    renderer.drawRect(this.enemy.transform.x, this.enemy.transform.y, this.enemy.size.width, this.enemy.size.height, enemyColor);
    renderer.strokeRect(this.enemy.transform.x, this.enemy.transform.y, this.enemy.size.width, this.enemy.size.height, '#ffffff', 1);

    drawPanel(renderer, 620, 184, 300, 126, 'Enemy Patrol', [
      `Enemy x: ${this.enemy.transform.x.toFixed(1)}`,
      `Direction: ${this.enemy.patrol.direction > 0 ? 'right' : 'left'}`,
      `Detected: ${this.detected ? 'yes' : 'no'}`,
      'Enemy turns red when player enters range',
    ]);
  }
}
