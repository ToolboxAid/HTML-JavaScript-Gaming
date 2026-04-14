/*
Toolbox Aid
David Quesenberry
03/21/2026
HealthSystemScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function overlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function applyDamage(entity, amount) {
  entity.hp = Math.max(0, entity.hp - amount);
  entity.dead = entity.hp === 0;
}

export default class HealthSystemScene extends Scene {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.player = { x: 160, y: 260, width: 34, height: 34, speed: 220, hp: 5, dead: false };
    this.enemy = { x: 600, y: 250, width: 44, height: 44, hp: 4, dead: false };
    this.message = 'Space damages enemy in range. F damages player.';
    this.lastAttack = false;
    this.lastFire = false;
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

    const attackDown = engine.input.isActionDown('attack');
    const fireDown = engine.input.isActionDown('fire');

    if (attackDown && !this.lastAttack && !this.enemy.dead) {
      const attackBox = { x: this.player.x + this.player.width, y: this.player.y + 6, width: 28, height: 22 };
      if (overlap(attackBox, this.enemy)) {
        applyDamage(this.enemy, 1);
        this.message = this.enemy.dead ? 'Enemy defeated.' : 'Enemy took 1 damage.';
      }
    }

    if (fireDown && !this.lastFire && !this.player.dead) {
      applyDamage(this.player, 1);
      this.message = this.player.dead ? 'Player HP reached zero.' : 'Player took 1 damage.';
    }

    this.lastAttack = attackDown;
    this.lastFire = fireDown;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine  sample 0321',
      'Introduces HP, death state, and reset flow.',
      this.message,
    ]);

    if (!this.player.dead) renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    if (!this.enemy.dead) renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, '#ef4444');

    drawPanel(renderer, 620, 34, 300, 126, 'Health Debug', [
      `Player HP: ${this.player.hp}`,
      `Enemy HP: ${this.enemy.hp}`,
      `Player dead: ${this.player.dead}`,
      `Enemy dead: ${this.enemy.dead}`,
    ]);
  }
}
