/*
Toolbox Aid
David Quesenberry
03/21/2026
PickupsCollectiblesScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget } from '/src/engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  moveAgainstSolids,
  overlap,
} from '../../shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);


export default class PickupsCollectiblesScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({ viewportWidth: 860, viewportHeight: 300, worldWidth: this.world.width, worldHeight: this.world.height });
    this.player = { x: 120, y: 320, width: 28, height: 40, vx: 0, vy: 0, gravity: 1100, moveSpeed: 2100, jumpSpeed: 430, maxVx: 320, maxVy: 760, onGround: false };
    this.solids = [
      { x: 0, y: 380, width: 1280, height: 48, label: 'floor' },
      { x: 280, y: 300, width: 190, height: 18, label: 'step' },
      { x: 540, y: 240, width: 190, height: 18, label: 'step' },
      { x: 840, y: 180, width: 190, height: 18, label: 'step' },
    ];
    this.pickups = [
      { id: 'coin-a', x: 180, y: 336, width: 18, height: 18, color: '#fbbf24', label: 'coin' },
      { id: 'coin-b', x: 332, y: 256, width: 18, height: 18, color: '#f59e0b', label: 'coin' },
      { id: 'coin-c', x: 592, y: 196, width: 18, height: 18, color: '#f97316', label: 'coin' },
      { id: 'gem', x: 900, y: 136, width: 20, height: 20, color: '#22d3ee', label: 'gem' },
    ];
    this.collected = new Set();
    this.score = 0;
    this.message = 'Collect every item.';
    this.lastJump = false;
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const jump = engine.input.isActionDown('jump');
    const axisX = (right ? 1 : 0) - (left ? 1 : 0);

    this.player.vx += axisX * this.player.moveSpeed * dt;
    this.player.vx *= 0.82;
    this.player.vx = clamp(this.player.vx, -this.player.maxVx, this.player.maxVx);
    this.player.vy = clamp(this.player.vy + this.player.gravity * dt, -this.player.maxVy, this.player.maxVy);

    if (jump && !this.lastJump && this.player.onGround) {
      this.player.vy = -this.player.jumpSpeed;
      this.player.onGround = false;
    }
    this.lastJump = jump;

    moveAgainstSolids(this.player, this.player.vx * dt, 0, this.solids);
    this.player.onGround = false;
    moveAgainstSolids(this.player, 0, this.player.vy * dt, this.solids);

    for (const pickup of this.pickups) {
      if (this.collected.has(pickup.id)) continue;
      if (overlap(this.player, pickup)) {
        this.collected.add(pickup.id);
        this.score += pickup.label === 'gem' ? 5 : 1;
        this.message = `Collected ${pickup.label}. Score ${this.score}`;
      }
    }
    if (this.collected.size === this.pickups.length) {
      this.message = 'All collectibles gathered.';
    }

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0314',
      'Introduces pickups and collectibles.',
      'Items disappear when touched and add to score.',
      this.message,
      `Collected: ${this.collected.size}/${this.pickups.length}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }
    for (const pickup of this.pickups) {
      if (this.collected.has(pickup.id)) continue;
      drawWorldRect(renderer, this.camera, pickup, this.screen, pickup.color);
      drawWorldLabel(renderer, this.camera, pickup, this.screen, pickup.label);
    }
    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Collectibles', [
      `Score: ${this.score}`,
      `Collected: ${this.collected.size}/${this.pickups.length}`,
      this.message,
      'Orange = coins / Cyan = gem',
    ]);
  }
}
