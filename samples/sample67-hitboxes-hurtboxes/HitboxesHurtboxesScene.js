/*
Toolbox Aid
David Quesenberry
03/21/2026
HitboxesHurtboxesScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function overlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export default class HitboxesHurtboxesScene extends Scene {
  constructor() {
    super();
    this.player = { x: 150, y: 250, width: 34, height: 34, speed: 220, facing: 1 };
    this.enemy = { x: 620, y: 240, width: 46, height: 56 };
    this.enemyHurtbox = { x: 628, y: 248, width: 30, height: 40 };
    this.attackHitbox = null;
    this.attackTimer = 0;
    this.message = 'Press Space near the enemy.';
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    let dx = 0;
    let dy = 0;
    if (engine.input.isActionDown('move_left')) { dx -= move; this.player.facing = -1; }
    if (engine.input.isActionDown('move_right')) { dx += move; this.player.facing = 1; }
    if (engine.input.isActionDown('move_up')) dy -= move;
    if (engine.input.isActionDown('move_down')) dy += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x + dx));
    this.player.y = Math.max(120, Math.min(470, this.player.y + dy));

    if (engine.input.isActionDown('attack') && this.attackTimer <= 0) {
      this.attackTimer = 0.18;
      this.attackHitbox = {
        x: this.player.facing > 0 ? this.player.x + this.player.width : this.player.x - 28,
        y: this.player.y + 6,
        width: 28,
        height: 22,
      };
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackHitbox) {
        this.attackHitbox.x = this.player.facing > 0 ? this.player.x + this.player.width : this.player.x - this.attackHitbox.width;
        this.attackHitbox.y = this.player.y + 6;
      }
      if (this.attackHitbox && overlap(this.attackHitbox, this.enemyHurtbox)) {
        this.message = 'Hitbox overlapped hurtbox.';
      } else {
        this.message = 'Attack active: no hurtbox overlap.';
      }
      if (this.attackTimer <= 0) {
        this.attackHitbox = null;
        this.message = 'Press Space near the enemy.';
      }
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample67',
      'Separates attack hitbox from enemy hurtbox.',
      'Gray body = entity body, red = hurtbox, yellow = active hitbox.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, '#9ca3af');
    renderer.strokeRect(this.enemyHurtbox.x, this.enemyHurtbox.y, this.enemyHurtbox.width, this.enemyHurtbox.height, '#ef4444', 2);
    if (this.attackHitbox) {
      renderer.drawRect(this.attackHitbox.x, this.attackHitbox.y, this.attackHitbox.width, this.attackHitbox.height, '#fbbf24');
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Combat Debug', [
      `Attack active: ${Boolean(this.attackHitbox)}`,
      `Overlap: ${Boolean(this.attackHitbox && overlap(this.attackHitbox, this.enemyHurtbox))}`,
      'Player body does not equal attack hitbox',
    ]);
  }
}
