/*
Toolbox Aid
David Quesenberry
03/21/2026
PolishedPlayableSliceScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { renderByLayers, renderSpriteReadyEntities } from '../../../engine/render/index.js';
import { GameModeState } from '../../../engine/game/index.js';
import { resolveInteraction } from '../../../engine/interaction/index.js';
import { updatePatrolEntity, isWithinDetectionRange } from '../../../engine/ai/index.js';
import { spawnProjectile, updateProjectiles } from '../../../engine/systems/index.js';
import { createPlayerPrefab, createEnemyPrefab } from '../../../engine/prefabs/index.js';

const theme = new Theme(ThemeTokens);

export default class PolishedPlayableSliceScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.mode = new GameModeState('title');
    this.player = createPlayerPrefab({ x: 100, y: 300, label: 'player' });
    this.enemy = createEnemyPrefab({ x: 500, y: 292, minX: 430, maxX: 760, label: 'enemy' });
    this.switchObj = { id: 'switch', x: 240, y: 280, width: 40, height: 60, color: '#8888ff', label: 'switch', active: false };
    this.goal = { x: 820, y: 270, width: 40, height: 80, color: '#64748b', label: 'goal', unlocked: false };
    this.projectiles = [];
    this.message = 'Press Enter to start.';
    this.lastEnter = false;
    this.lastInteractPressed = false;
    this.lastFirePressed = false;
  }

  resetPlay() {
    this.player.x = 100;
    this.player.y = 300;
    this.enemy.x = 500;
    this.enemy.y = 292;
    this.enemy.alive = true;
    this.enemy.patrol.direction = 1;
    this.switchObj.active = false;
    this.goal.unlocked = false;
    this.goal.color = '#64748b';
    this.projectiles = [];
    this.message = 'Flip the switch and reach the goal.';
    this.mode.setMode('play');
  }

  update(dt, engine) {
    const enterPressed = engine.input.isDown('Enter');
    if (enterPressed && !this.lastEnter) {
      if (this.mode.is('title') || this.mode.is('win') || this.mode.is('lose')) {
        this.resetPlay();
      }
    }
    this.lastEnter = enterPressed;

    if (!this.mode.is('play')) {
      return;
    }

    const move = this.player.speed * dt;
    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    if (this.enemy.alive) {
      updatePatrolEntity({ transform: this.enemy, size: this.enemy, patrol: this.enemy.patrol }, dt);
    }

    const interactPressed = engine.input.isDown('KeyE');
    if (interactPressed && !this.lastInteractPressed) {
      resolveInteraction(this.player, [this.switchObj], (target) => {
        target.active = !target.active;
        this.goal.unlocked = target.active;
        this.goal.color = target.active ? '#fbbf24' : '#64748b';
        this.message = target.active ? 'Goal unlocked.' : 'Goal locked.';
      }, 70);
    }
    this.lastInteractPressed = interactPressed;

    const firePressed = engine.input.isDown('Space');
    if (firePressed && !this.lastFirePressed) {
      spawnProjectile(this.projectiles, {
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2 - 6,
        velocityX: 420,
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
          p.x < this.enemy.x + this.enemy.width &&
          p.x + p.width > this.enemy.x &&
          p.y < this.enemy.y + this.enemy.height &&
          p.y + p.height > this.enemy.y;

        if (hit) {
          this.enemy.alive = false;
          this.projectiles.splice(i, 1);
          this.message = 'Enemy disabled.';
          break;
        }
      }
    }

    if (this.enemy.alive) {
      const detected = isWithinDetectionRange(this.player, this.enemy, this.enemy.detectionRange);
      const overlap =
        this.player.x < this.enemy.x + this.enemy.width &&
        this.player.x + this.player.width > this.enemy.x &&
        this.player.y < this.enemy.y + this.enemy.height &&
        this.player.y + this.player.height > this.enemy.y;

      if (detected && overlap) {
        this.mode.setMode('lose');
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
      this.mode.setMode('win');
      this.message = 'Goal reached.';
    }
  }

  render(renderer) {
    const mode = this.mode.getMode();

    drawFrame(renderer, theme, [
      'Engine Sample42',
      'Combines prefabs, layered rendering, projectiles, interaction, and game modes',
      'Enter starts, Arrow keys move, KeyE interacts, Space fires',
      `Mode: ${mode}`,
      'This sample is a cleaner polished slice built on the evolved engine',
    ]);

    renderByLayers(renderer, [
      {
        z: 0,
        render: (r) => {
          r.drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#0f172a');
          r.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);
        },
      },
      {
        z: 10,
        render: (r) => {
          renderSpriteReadyEntities(r, [
            { ...this.switchObj, spriteColor: this.switchObj.active ? '#34d399' : '#8888ff' },
            { ...this.goal, spriteColor: this.goal.color },
          ], { label: true, labelOffsetY: -8 });
        },
      },
      {
        z: 20,
        render: (r) => {
          const actors = [{ ...this.player, spriteColor: theme.getColor('actorFill') }];
          if (this.enemy.alive) {
            const enemyColor = isWithinDetectionRange(this.player, this.enemy, this.enemy.detectionRange) ? '#f87171' : '#8888ff';
            actors.push({ ...this.enemy, spriteColor: enemyColor });
          }
          renderSpriteReadyEntities(r, actors, { label: true, labelOffsetY: -8 });
        },
      },
      {
        z: 30,
        render: (r) => {
          renderSpriteReadyEntities(r, this.projectiles.map((p) => ({ ...p, spriteColor: p.color })));
        },
      },
      {
        z: 40,
        render: (r) => {
          drawPanel(r, 600, 178, 320, 132, 'Playable Slice', [
            this.message,
            `Switch: ${this.switchObj.active ? 'on' : 'off'}`,
            `Goal: ${this.goal.unlocked ? 'unlocked' : 'locked'}`,
            `Enemy: ${this.enemy.alive ? 'active' : 'disabled'}`,
          ]);
        },
      },
    ]);
  }
}
