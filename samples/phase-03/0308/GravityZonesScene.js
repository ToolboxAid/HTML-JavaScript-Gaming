/*
Toolbox Aid
David Quesenberry
03/21/2026
GravityZonesScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget } from '/src/engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  overlap,
} from '../../shared/platformerHelpers.js';
import { applyMinimalJump } from './minimalJump.js';

const theme = new Theme(ThemeTokens);

export default class GravityZonesScene extends Scene {
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
      y: 240,
      width: 28,
      height: 40,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      moveSpeed: 720,
      gravityStrength: 1050,
      jumpStrength: 420,
      maxVx: 240,
      maxVy: 760,
      onGround: false,
    };

    this.solids = [
      { x: 0, y: 360, width: 1280, height: 48, label: 'floor' },
      { x: 0, y: 0, width: 32, height: 720 },
      { x: 1248, y: 0, width: 32, height: 720 },
      { x: 320, y: 280, width: 96, height: 24, label: 'jump block' },
      { x: 512, y: 120, width: 32, height: 240, label: 'wall' },
      { x: 640, y: 240, width: 96, height: 24, label: 'jump block' },
      { x: 736, y: 0, width: 32, height: 240, label: 'ceiling' },
      { x: 920, y: 300, width: 120, height: 24, label: 'jump block' },
    ];

    this.zones = [
      { x: 260, y: 168, width: 160, height: 144, gx: 0, gy: -1, color: '#0891b2', label: 'up' },
      { x: 576, y: 168, width: 128, height: 144, gx: 1, gy: 0, color: '#f97316', label: 'right' },
      { x: 864, y: 168, width: 160, height: 144, gx: 0, gy: 1, color: '#22c55e', label: 'down' },
    ];
    this.activeZone = 'default down';
    this.lastJumpDown = false;
  }

  getActiveZone() {
    return this.zones.find((zone) => overlap(this.player, zone)) || null;
  }

  moveAndCollide(dx, dy, gravity) {
    if (dx !== 0) {
      this.player.x += dx;
      for (const solid of this.solids) {
        if (!overlap(this.player, solid)) continue;
        if (dx > 0) {
          this.player.x = solid.x - this.player.width;
        } else {
          this.player.x = solid.x + solid.width;
        }
        this.player.vx = 0;
      }
    }

    if (dy !== 0) {
      this.player.y += dy;
      for (const solid of this.solids) {
        if (!overlap(this.player, solid)) continue;
        if (dy > 0) {
          this.player.y = solid.y - this.player.height;
        } else {
          this.player.y = solid.y + solid.height;
        }
        this.player.vy = 0;
      }
    }

    this.player.onGround = false;
    const probe = 2;

    if (gravity.y > 0) {
      const test = { ...this.player, y: this.player.y + probe };
      this.player.onGround = this.solids.some((solid) => overlap(test, solid));
    } else if (gravity.y < 0) {
      const test = { ...this.player, y: this.player.y - probe };
      this.player.onGround = this.solids.some((solid) => overlap(test, solid));
    } else if (gravity.x > 0) {
      const test = { ...this.player, x: this.player.x + probe };
      this.player.onGround = this.solids.some((solid) => overlap(test, solid));
    } else if (gravity.x < 0) {
      const test = { ...this.player, x: this.player.x - probe };
      this.player.onGround = this.solids.some((solid) => overlap(test, solid));
    }
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const up = engine.input.isActionDown('move_up');
    const down = engine.input.isActionDown('move_down');
    const jumpDown = engine.input.isActionDown('jump');
    const jumpPressed = jumpDown && !this.lastJumpDown;

    let gravity = { x: 0, y: 1 };
    const zone = this.getActiveZone();
    if (zone) {
      gravity = { x: zone.gx, y: zone.gy };
      this.activeZone = zone.label;
    } else {
      this.activeZone = 'default down';
    }

    const axisX = (right ? 1 : 0) - (left ? 1 : 0);
    const axisY = (down ? 1 : 0) - (up ? 1 : 0);

    this.player.ax = axisX * this.player.moveSpeed;
    this.player.ay = axisY * this.player.moveSpeed;

    applyMinimalJump(this.player, jumpPressed, gravity, this.player.jumpStrength);

    this.player.vx += (this.player.ax + gravity.x * this.player.gravityStrength) * dt;
    this.player.vy += (this.player.ay + gravity.y * this.player.gravityStrength) * dt;

    this.player.vx = clamp(this.player.vx, -this.player.maxVx, this.player.maxVx);
    this.player.vy = clamp(this.player.vy, -this.player.maxVy, this.player.maxVy);

    this.moveAndCollide(this.player.vx * dt, this.player.vy * dt, gravity);

    this.player.vx *= 0.992;
    this.player.vy *= 0.992;

    this.lastJumpDown = jumpDown;
    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0308',
      'Introduces gravity zones that change the pull direction inside colored areas.',
      'Space applies a simple jump opposite the active gravity direction.',
      'Use jump blocks to verify that the sample can reach raised platforms.',
      `Active zone: ${this.activeZone}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      if (solid.label) drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }

    for (const zone of this.zones) {
      drawWorldRect(renderer, this.camera, zone, this.screen, zone.color);
      drawWorldLabel(renderer, this.camera, zone, this.screen, `gravity ${zone.label}`);
    }

    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Gravity Zones', [
      `Velocity: ${this.player.vx.toFixed(1)}, ${this.player.vy.toFixed(1)}`,
      `On ground: ${this.player.onGround}`,
      `Active zone: ${this.activeZone}`,
      'Blue = up, Orange = right, Green = down',
      'Space = minimal jump',
    ]);
  }
}
