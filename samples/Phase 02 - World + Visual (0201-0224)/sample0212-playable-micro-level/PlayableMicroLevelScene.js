/*
Toolbox Aid
David Quesenberry
03/21/2026
PlayableMicroLevelScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { resolveInteraction } from '../../../engine/interaction/index.js';
import { updatePatrolEntity, isWithinDetectionRange } from '../../../engine/ai/index.js';
import { spawnProjectile, updateProjectiles } from '../../../engine/systems/index.js';

const theme = new Theme(ThemeTokens);

export default class PlayableMicroLevelScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 100, y: 300, width: 44, height: 44, speed: 250 };
    this.enemy = {
      transform: { x: 480, y: 290 },
      size: { width: 52, height: 52 },
      patrol: { minX: 430, maxX: 760, speed: 150, direction: 1 },
      detectionRange: 150,
      alive: true,
    };
    this.switchObj = { id: 'switch', x: 240, y: 280, width: 40, height: 60, label: 'Switch', active: false };
    this.goal = { x: 820, y: 270, width: 40, height: 80, unlocked: false };
    this.projectiles = [];
    this.message = 'Flip the switch, avoid the enemy, reach the goal.';
    this.lastInteractPressed = false;
    this.lastFirePressed = false;
    this.won = false;
    this.lost = false;
  }

  update(dt, engine) {
    if (this.won || this.lost) {
      return;
    }

    const move = this.player.speed * dt;
    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    updatePatrolEntity(this.enemy, dt);

    const interactPressed = engine.input.isDown('KeyE');
    if (interactPressed && !this.lastInteractPressed) {
      resolveInteraction(this.player, [this.switchObj], (target) => {
        target.active = !target.active;
        this.goal.unlocked = target.active;
        this.message = target.active ? 'Goal unlocked.' : 'Goal locked again.';
      }, 70);
    }
    this.lastInteractPressed = interactPressed;

    const firePressed = engine.input.isDown('Space');
    if (firePressed && !this.lastFirePressed) {
      spawnProjectile(this.projectiles, {
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2 - 6,
        width: 16,
        height: 12,
        velocityX: 420,
        velocityY: 0,
        life: 1.6,
        color: '#ffd166',
      });
    }
    this.lastFirePressed = firePressed;

    updateProjectiles(this.projectiles, dt, this.bounds);

    if (this.enemy.alive) {
      for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
        const p = this.projectiles[i];
        const hit =
          p.x < this.enemy.transform.x + this.enemy.size.width &&
          p.x + p.width > this.enemy.transform.x &&
          p.y < this.enemy.transform.y + this.enemy.size.height &&
          p.y + p.height > this.enemy.transform.y;

        if (hit) {
          this.enemy.alive = false;
          this.projectiles.splice(i, 1);
          this.message = 'Enemy disabled.';
          break;
        }
      }
    }

    if (this.enemy.alive && isWithinDetectionRange(this.player, {
      x: this.enemy.transform.x,
      y: this.enemy.transform.y,
      width: this.enemy.size.width,
      height: this.enemy.size.height,
    }, this.enemy.detectionRange)) {
      const overlap =
        this.player.x < this.enemy.transform.x + this.enemy.size.width &&
        this.player.x + this.player.width > this.enemy.transform.x &&
        this.player.y < this.enemy.transform.y + this.enemy.size.height &&
        this.player.y + this.player.height > this.enemy.transform.y;

      if (overlap) {
        this.lost = true;
        this.message = 'Caught by the enemy.';
      }
    }

    const reachedGoal =
      this.goal.unlocked &&
      this.player.x < this.goal.x + this.goal.width &&
      this.player.x + this.player.width > this.goal.x &&
      this.player.y < this.goal.y + this.goal.height &&
      this.player.y + this.player.height > this.goal.y;

    if (reachedGoal) {
      this.won = true;
      this.message = 'Level complete.';
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample36',
      'Combines interaction, patrol AI, projectiles, and goal logic into a micro-level',
      'Use Arrow keys to move, KeyE to interact, and Space to fire',
      `Status: ${this.won ? 'victory' : this.lost ? 'defeat' : 'in progress'}`,
      'This sample is the first small playable slice built on the hardened engine',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    renderer.drawRect(this.switchObj.x, this.switchObj.y, this.switchObj.width, this.switchObj.height, this.switchObj.active ? '#34d399' : '#8888ff');
    renderer.strokeRect(this.switchObj.x, this.switchObj.y, this.switchObj.width, this.switchObj.height, '#ffffff', 1);
    renderer.drawText('Switch', this.switchObj.x - 4, this.switchObj.y - 10, { color: '#ffffff', font: '14px monospace' });

    renderer.drawRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height, this.goal.unlocked ? '#fbbf24' : '#64748b');
    renderer.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height, '#ffffff', 1);
    renderer.drawText('Goal', this.goal.x - 2, this.goal.y - 10, { color: '#ffffff', font: '14px monospace' });

    if (this.enemy.alive) {
      const enemyColor = isWithinDetectionRange(this.player, {
        x: this.enemy.transform.x,
        y: this.enemy.transform.y,
        width: this.enemy.size.width,
        height: this.enemy.size.height,
      }, this.enemy.detectionRange) ? '#f87171' : '#8888ff';
      renderer.drawRect(this.enemy.transform.x, this.enemy.transform.y, this.enemy.size.width, this.enemy.size.height, enemyColor);
      renderer.strokeRect(this.enemy.transform.x, this.enemy.transform.y, this.enemy.size.width, this.enemy.size.height, '#ffffff', 1);
    }

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    this.projectiles.forEach((p) => {
      renderer.drawRect(p.x, p.y, p.width, p.height, p.color);
      renderer.strokeRect(p.x, p.y, p.width, p.height, '#ffffff', 1);
    });

    drawPanel(renderer, 600, 178, 320, 132, 'Micro-Level', [
      this.message,
      `Switch: ${this.switchObj.active ? 'on' : 'off'}`,
      `Goal: ${this.goal.unlocked ? 'unlocked' : 'locked'}`,
      `Enemy: ${this.enemy.alive ? 'active' : 'disabled'}`,
    ]);
  }
}
