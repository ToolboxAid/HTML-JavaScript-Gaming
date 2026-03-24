/*
Toolbox Aid
David Quesenberry
03/21/2026
DamageKnockbackScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function overlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export default class DamageKnockbackScene extends Scene {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.player = { x: 190, y: 260, width: 34, height: 34, speed: 220, facing: 1 };
    this.enemy = { x: 620, y: 250, width: 44, height: 44, vx: 0, flash: 0 };
    this.lastAttack = false;
    this.message = 'Press Space near the dummy.';
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    if (engine.input.isActionDown('move_left')) { this.player.x -= move; this.player.facing = -1; }
    if (engine.input.isActionDown('move_right')) { this.player.x += move; this.player.facing = 1; }
    if (engine.input.isActionDown('move_up')) this.player.y -= move;
    if (engine.input.isActionDown('move_down')) this.player.y += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));
    this.player.y = Math.max(120, Math.min(470, this.player.y));

    const attackDown = engine.input.isActionDown('attack');
    if (attackDown && !this.lastAttack) {
      const attackBox = {
        x: this.player.facing > 0 ? this.player.x + this.player.width : this.player.x - 28,
        y: this.player.y + 6,
        width: 28,
        height: 22,
      };
      if (overlap(attackBox, this.enemy)) {
        this.enemy.vx = this.player.facing * 260;
        this.enemy.flash = 0.14;
        this.message = 'Hit applied with knockback.';
      }
    }
    this.lastAttack = attackDown;
    if (engine.input.isActionDown('reset')) this.reset();

    this.enemy.x += this.enemy.vx * dt;
    this.enemy.vx *= 0.88;
    if (Math.abs(this.enemy.vx) < 4) this.enemy.vx = 0;
    this.enemy.x = Math.max(420, Math.min(850, this.enemy.x));
    this.enemy.flash = Math.max(0, this.enemy.flash - dt);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample70',
      'Applies directional knockback when damage lands.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, this.enemy.flash > 0 ? '#fbbf24' : '#ef4444');

    drawPanel(renderer, 620, 34, 300, 126, 'Knockback Debug', [
      `Enemy vx: ${this.enemy.vx.toFixed(1)}`,
      `Player facing: ${this.player.facing > 0 ? 'right' : 'left'}`,
      'Target should slide away from the hit.',
    ]);
  }
}
