import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { clamp } from '../../../engine/v2/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/v2/debug/index.js';
import { spawnProjectile, updateProjectiles } from '../../../engine/v2/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class ProjectileSystemScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 140, y: 300, width: 48, height: 48, speed: 260 };
    this.projectiles = [];
    this.lastFirePressed = false;
    this.totalFired = 0;
  }

  update(dt, engine) {
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    const firePressed = engine.input.isDown('Space');
    if (firePressed && !this.lastFirePressed) {
      spawnProjectile(this.projectiles, {
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2 - 6,
        width: 18,
        height: 12,
        velocityX: 420,
        velocityY: 0,
        life: 2,
        color: '#ffd166',
      });
      this.totalFired += 1;
    }
    this.lastFirePressed = firePressed;

    updateProjectiles(this.projectiles, dt, this.bounds);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample34',
      'Demonstrates projectile spawning and lifecycle updates',
      'Use Arrow keys to move and Space to fire projectiles',
      `Active projectiles: ${this.projectiles.length}`,
      'This sample defines the projectile spawning boundary for gameplay systems',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    this.projectiles.forEach((projectile) => {
      renderer.drawRect(projectile.x, projectile.y, projectile.width, projectile.height, projectile.color);
      renderer.strokeRect(projectile.x, projectile.y, projectile.width, projectile.height, '#ffffff', 1);
    });

    drawPanel(renderer, 620, 184, 300, 126, 'Projectiles', [
      'Fire key: Space',
      `Total fired: ${this.totalFired}`,
      `Active: ${this.projectiles.length}`,
      'Projectiles expire or leave bounds',
    ]);
  }
}
