/*
Toolbox Aid
David Quesenberry
03/21/2026
DoorsGatesScene.js
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
} from '../../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);


export default class DoorsGatesScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({ viewportWidth: 860, viewportHeight: 300, worldWidth: this.world.width, worldHeight: this.world.height });
    this.player = { x: 120, y: 320, width: 28, height: 40, vx: 0, vy: 0, gravity: 1100, moveSpeed: 2100, jumpSpeed: 430, maxVx: 320, maxVy: 760, onGround: false };
    this.staticSolids = [
      { x: 0, y: 380, width: 1280, height: 48, label: 'floor' },
      { x: 520, y: 260, width: 24, height: 120, label: 'left wall' },
      { x: 736, y: 260, width: 24, height: 120, label: 'right wall' },
    ];
    this.button = { x: 260, y: 360, width: 60, height: 20, color: '#ef4444', label: 'open gate' };
    this.gate = { x: 616, y: 284, width: 48, height: 96, color: '#e11d48', label: 'gate', open: false };
    this.message = 'Step on the button to open the gate.';
    this.lastJump = false;
  }

  getSolids() {
    return this.gate.open ? this.staticSolids : [...this.staticSolids, this.gate];
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

    this.gate.open = overlap(this.player, this.button);
    this.message = this.gate.open ? 'Gate is open.' : 'Gate is closed.';

    const solids = this.getSolids();
    moveAgainstSolids(this.player, this.player.vx * dt, 0, solids);
    this.player.onGround = false;
    moveAgainstSolids(this.player, 0, this.player.vy * dt, solids);

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0316',
      'Introduces linked doors and gates.',
      'The red button controls the center gate.',
      this.message,
      `Gate open: ${this.gate.open}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    for (const solid of this.staticSolids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
    }
    if (!this.gate.open) {
      drawWorldRect(renderer, this.camera, this.gate, this.screen, this.gate.color);
      drawWorldLabel(renderer, this.camera, this.gate, this.screen, 'gate');
    } else {
      drawWorldRect(renderer, this.camera, this.gate, this.screen, '#9ca3af');
      drawWorldLabel(renderer, this.camera, this.gate, this.screen, 'open');
    }
    drawWorldRect(renderer, this.camera, this.button, this.screen, this.gate.open ? '#fca5a5' : this.button.color);
    drawWorldLabel(renderer, this.camera, this.button, this.screen, 'button');
    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Doors / Gates', [
      `Gate open: ${this.gate.open}`,
      this.message,
      'Gate becomes non-solid when open',
      'This links trigger state to collision state',
    ]);
  }
}
