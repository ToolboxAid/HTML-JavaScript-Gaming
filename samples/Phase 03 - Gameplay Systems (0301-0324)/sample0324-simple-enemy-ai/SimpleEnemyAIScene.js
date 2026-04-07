/*
Toolbox Aid
David Quesenberry
03/21/2026
SimpleEnemyAIScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function overlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export default class SimpleEnemyAIScene extends Scene {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.player = { x: 140, y: 260, width: 34, height: 34, speed: 220, hp: 5 };
    this.enemy = { x: 720, y: 250, width: 40, height: 40, speed: 90, state: 'idle', damageCooldown: 0 };
    this.message = 'Move closer to wake the enemy.';
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    if (engine.input.isActionDown('move_up')) this.player.y -= move;
    if (engine.input.isActionDown('move_down')) this.player.y += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));
    this.player.y = Math.max(120, Math.min(470, this.player.y));
    if (engine.input.isActionDown('reset')) this.reset();

    const dx = this.player.x - this.enemy.x;
    const dy = this.player.y - this.enemy.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 220) {
      this.enemy.state = 'follow';
      const length = Math.max(1, distance);
      this.enemy.x += (dx / length) * this.enemy.speed * dt;
      this.enemy.y += (dy / length) * this.enemy.speed * dt;
      this.message = 'Enemy is following.';
    } else {
      this.enemy.state = 'idle';
      this.message = 'Move closer to wake the enemy.';
    }

    this.enemy.damageCooldown = Math.max(0, this.enemy.damageCooldown - dt);
    if (overlap(this.player, this.enemy) && this.enemy.damageCooldown <= 0) {
      this.player.hp = Math.max(0, this.player.hp - 1);
      this.enemy.damageCooldown = 0.7;
      this.message = this.player.hp <= 0 ? 'Player HP reached zero.' : 'Contact damage applied.';
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 sample 0324',
      'Adds idle/follow enemy behavior with contact damage.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, this.enemy.state === 'follow' ? '#f97316' : '#9ca3af');

    drawPanel(renderer, 620, 34, 300, 126, 'Enemy AI Debug', [
      `Enemy state: ${this.enemy.state}`,
      `Player HP: ${this.player.hp}`,
      `Damage cooldown: ${this.enemy.damageCooldown.toFixed(2)}s`,
    ]);
  }
}
