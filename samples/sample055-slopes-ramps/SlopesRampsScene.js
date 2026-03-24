/*
Toolbox Aid
David Quesenberry
03/21/2026
SlopesRampsScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Camera2D, followCameraTarget } from '../../engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  moveAgainstSolids,
  snapToRamp,
} from '../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);

export default class SlopesRampsScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({
      viewportWidth: 860,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });

    this.player = {
      x: 120,
      y: 220,
      width: 28,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 860,
      jumpSpeed: 430,
      gravity: 1200,
      maxVx: 220,
      maxVy: 760,
      onGround: false,
    };

    this.solids = [
      { x: 0, y: 360, width: 1280, height: 48, label: 'ground' },
      { x: 640, y: 264+26, width: 120, height: 96-26, label: 'block' },
    ];
    this.ramps = [
      { x: 320, y: 264, width: 160, height: 96, direction: 'up-right', label: 'ramp ↑' },
      { x: 800, y: 264, width: 160, height: 96, direction: 'up-left', label: 'ramp ←' },
    ];
    this.note = 'Walk onto each ramp. The actor should climb smoothly instead of stopping.';
    this.lastJump = false;
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const jump = engine.input.isActionDown('jump');

    const axis = (right ? 1 : 0) - (left ? 1 : 0);
    this.player.vx += axis * this.player.speed * dt;

    if (axis === 0) {
      this.player.vx *= this.player.onGround ? 0.82 : 0.96;
    }

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

    let onRamp = false;
    for (const ramp of this.ramps) {
      if (snapToRamp(this.player, ramp)) {
        onRamp = true;
      }
    }

    if (onRamp) {
      this.note = 'Ramp snap active. Horizontal motion is preserved while vertical position follows the slope.';
    } else {
      this.note = 'Walk onto each ramp. The actor should climb smoothly instead of stopping.';
    }

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample55',
      'Introduces slope and ramp surfaces as a first pass for platformer terrain.',
      'AABB walls still block normally. Ramp surfaces compute a floor height from the actor position.',
      'Use A/D or Left/Right. Press Space to jump.',
      this.note,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      if (solid.label) drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }

    for (const ramp of this.ramps) {
      drawWorldRect(renderer, this.camera, ramp, this.screen, '#a855f7');
      drawWorldLabel(renderer, this.camera, ramp, this.screen, ramp.label);
    }

    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Slopes / Ramps', [
      `Player: ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`,
      `Velocity: ${this.player.vx.toFixed(1)}, ${this.player.vy.toFixed(1)}`,
      `Grounded: ${this.player.onGround}`,
      'Purple surfaces are ramp floors',
    ]);
  }
}
