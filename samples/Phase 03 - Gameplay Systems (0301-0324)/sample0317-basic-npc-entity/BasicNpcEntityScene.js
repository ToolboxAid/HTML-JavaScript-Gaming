/*
Toolbox Aid
David Quesenberry
03/21/2026
BasicNpcEntityScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget } from '/src/engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  moveAgainstSolids,
  overlap,
} from '../../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);


export default class BasicNpcEntityScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({ viewportWidth: 860, viewportHeight: 300, worldWidth: this.world.width, worldHeight: this.world.height });
    this.player = { x: 120, y: 320, width: 28, height: 40, vx: 0, vy: 0, gravity: 1100, moveSpeed: 2100, jumpSpeed: 430, maxVx: 320, maxVy: 760, onGround: false };
    this.solids = [{ x: 0, y: 380, width: 1280, height: 48, label: 'floor' }];
    this.npc = { x: 520, y: 332, width: 26, height: 48, minX: 440, maxX: 660, speed: 60, facing: 'right', bubble: 'Hello there.' };
    this.message = 'Walk near the NPC.';
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

    this.npc.x += (this.npc.facing === 'right' ? 1 : -1) * this.npc.speed * dt;
    if (this.npc.x <= this.npc.minX) this.npc.facing = 'right';
    if (this.npc.x + this.npc.width >= this.npc.maxX) this.npc.facing = 'left';

    const dx = (this.player.x + this.player.width * 0.5) - (this.npc.x + this.npc.width * 0.5);
    const close = Math.abs(dx) < 120;
    this.message = close ? this.npc.bubble : 'Walk near the NPC.';
    if (close) {
      this.npc.facing = dx >= 0 ? 'right' : 'left';
    }

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0317',
      'Introduces a basic NPC entity.',
      'The NPC patrols in a small range and faces the player when close.',
      this.message,
      `NPC facing: ${this.npc.facing}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
    }
    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');
    drawWorldRect(renderer, this.camera, this.npc, this.screen, '#f59e0b');
    drawWorldLabel(renderer, this.camera, this.npc, this.screen, `npc ${this.npc.facing}`);
    if (this.message === this.npc.bubble) {
      const bubble = { x: this.npc.x - 12, y: this.npc.y - 46, width: 120, height: 28 };
      drawWorldRect(renderer, this.camera, bubble, this.screen, '#111827');
      drawWorldLabel(renderer, this.camera, bubble, this.screen, this.npc.bubble, '#e5e7eb');
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Basic NPC', [
      `NPC X: ${this.npc.x.toFixed(1)}`,
      `NPC facing: ${this.npc.facing}`,
      this.message,
      'This is the first dedicated non-player entity sample',
    ]);
  }
}
