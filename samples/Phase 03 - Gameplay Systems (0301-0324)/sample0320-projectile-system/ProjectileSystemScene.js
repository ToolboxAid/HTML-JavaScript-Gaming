/*
Toolbox Aid
David Quesenberry
03/21/2026
ProjectileSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

function overlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export default class ProjectileSystemScene extends Scene {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.player = { x: 130, y: 250, width: 34, height: 34, speed: 220, facing: 1 };
    this.target = { x: 740, y: 230, width: 48, height: 64 };
    this.projectiles = [];
    this.cooldown = 0;
    this.hits = 0;
    this.message = 'Press F to fire.';
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    if (engine.input.isActionDown('move_left')) { this.player.x -= move; this.player.facing = -1; }
    if (engine.input.isActionDown('move_right')) { this.player.x += move; this.player.facing = 1; }
    if (engine.input.isActionDown('move_up')) this.player.y -= move;
    if (engine.input.isActionDown('move_down')) this.player.y += move;
    this.player.x = Math.max(40, Math.min(880, this.player.x));
    this.player.y = Math.max(120, Math.min(470, this.player.y));

    if (engine.input.isActionDown('reset')) this.reset();

    this.cooldown -= dt;
    if (engine.input.isActionDown('fire') && this.cooldown <= 0) {
      this.cooldown = 0.22;
      this.projectiles.push({
        x: this.player.facing > 0 ? this.player.x + this.player.width : this.player.x - 12,
        y: this.player.y + 12,
        width: 12,
        height: 8,
        vx: this.player.facing * 420,
        life: 1.6,
      });
      this.message = 'Projectile spawned.';
    }

    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.life -= dt;
      if (overlap(projectile, this.target)) {
        projectile.life = 0;
        this.hits += 1;
        this.message = 'Projectile hit target.';
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.life > 0 && p.x > -20 && p.x < 980);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample68',
      'Introduces projectile spawn, travel, hit, and cleanup.',
      'Press F to fire. Press R to reset.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.target.x, this.target.y, this.target.width, this.target.height, '#ef4444');
    for (const projectile of this.projectiles) {
      renderer.drawRect(projectile.x, projectile.y, projectile.width, projectile.height, '#fbbf24');
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Projectile Debug', [
      `Projectiles: ${this.projectiles.length}`,
      `Hits: ${this.hits}`,
      `Facing: ${this.player.facing > 0 ? 'right' : 'left'}`,
    ]);
  }
}
