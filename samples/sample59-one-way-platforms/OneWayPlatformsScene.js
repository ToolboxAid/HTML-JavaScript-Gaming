/*
Toolbox Aid
David Quesenberry
03/21/2026
OneWayPlatformsScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Camera2D, followCameraTarget } from '../../engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  moveAgainstSolids,
} from '../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);

export default class OneWayPlatformsScene extends Scene {
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
      gravity: 1100,
      moveSpeed: 860,
      jumpSpeed: 430,
      maxVx: 220,
      maxVy: 760,
      onGround: false,
      dropThroughTimer: 0,
    };

    this.solids = [
      { x: 0, y: 360, width: 1280, height: 48, label: 'floor' },
    ];
    this.oneWays = [
      { x: 320, y: 280, width: 160, height: 12, label: 'one-way' },
      { x: 620, y: 220, width: 160, height: 12, label: 'one-way' },
    ];
    this.lastJump = false;
  }

  resolveOneWayLanding(previousBottom) {
    const currentBottom = this.player.y + this.player.height;
    for (const platform of this.oneWays) {
      const horizontalOverlap =
        this.player.x < platform.x + platform.width &&
        this.player.x + this.player.width > platform.x;
      const crossedTop =
        previousBottom <= platform.y &&
        currentBottom >= platform.y;

      if (horizontalOverlap && crossedTop) {
        this.player.y = platform.y - this.player.height;
        this.player.vy = 0;
        this.player.onGround = true;
        return true;
      }
    }

    return false;
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const down = engine.input.isActionDown('move_down');
    const jump = engine.input.isActionDown('jump');
    const axisX = (right ? 1 : 0) - (left ? 1 : 0);

    if (jump && !this.lastJump && down && this.player.onGround) {
      this.player.dropThroughTimer = 0.22;
      this.player.onGround = false;
    } else if (jump && !this.lastJump && this.player.onGround) {
      this.player.vy = -this.player.jumpSpeed;
      this.player.onGround = false;
    }
    this.lastJump = jump;

    this.player.vx += axisX * this.player.moveSpeed * dt;
    if (axisX === 0) this.player.vx *= 0.82;
    this.player.vx = clamp(this.player.vx, -this.player.maxVx, this.player.maxVx);
    this.player.vy = clamp(this.player.vy + this.player.gravity * dt, -this.player.maxVy, this.player.maxVy);

    moveAgainstSolids(this.player, this.player.vx * dt, 0, this.solids);

    const previousBottom = this.player.y + this.player.height;
    this.player.onGround = false;
    moveAgainstSolids(this.player, 0, this.player.vy * dt, this.solids);

    if (this.player.dropThroughTimer > 0) {
      this.player.dropThroughTimer -= dt;
    } else {
      this.resolveOneWayLanding(previousBottom);
    }

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample59',
      'Introduces one-way platforms: land from above, jump through from below, and optionally drop down.',
      'Press Down + Space while standing on a one-way platform to drop through.',
      'Orange platforms should not block upward travel.',
      `Drop-through timer: ${this.player.dropThroughTimer.toFixed(2)}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      if (solid.label) drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }
    for (const platform of this.oneWays) {
      drawWorldRect(renderer, this.camera, platform, this.screen, '#fb923c');
      drawWorldLabel(renderer, this.camera, platform, this.screen, platform.label);
    }

    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'One-Way Platforms', [
      `Player: ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`,
      `Grounded: ${this.player.onGround}`,
      `Drop timer: ${this.player.dropThroughTimer.toFixed(2)}`,
      'Orange platforms only collide from above',
    ]);
  }
}
