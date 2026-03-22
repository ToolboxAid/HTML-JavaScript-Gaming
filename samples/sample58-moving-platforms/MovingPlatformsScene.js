/*
Toolbox Aid
David Quesenberry
03/21/2026
MovingPlatformsScene.js
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
  carryWithPlatform,
} from '../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);

export default class MovingPlatformsScene extends Scene {
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
      jumpSpeed: 420,
      maxVx: 220,
      maxVy: 760,
      onGround: false,
    };

    this.staticSolids = [
      { x: 0, y: 360, width: 1280, height: 48, label: 'floor' },
    ];

    this.platforms = [
      { x: 320, y: 280, width: 120, height: 16, baseX: 320, baseY: 280, range: 120, axis: 'x', speed: 1.1, label: 'move X', deltaX: 0, deltaY: 0 },
      { x: 720, y: 240, width: 120, height: 16, baseX: 720, baseY: 240, range: 84, axis: 'y', speed: 1.4, label: 'move Y', deltaX: 0, deltaY: 0 },
    ];
    this.time = 0;
    this.lastJump = false;
  }

  updatePlatforms(dt) {
    this.time += dt;
    for (const platform of this.platforms) {
      const previousX = platform.x;
      const previousY = platform.y;
      if (platform.axis === 'x') {
        platform.x = platform.baseX + Math.sin(this.time * platform.speed) * platform.range;
      } else {
        platform.y = platform.baseY + Math.sin(this.time * platform.speed) * platform.range;
      }
      platform.deltaX = platform.x - previousX;
      platform.deltaY = platform.y - previousY;
      platform.previousY = previousY;
    }
  }

  update(dt, engine) {
    this.updatePlatforms(dt);

    for (const platform of this.platforms) {
      carryWithPlatform(this.player, platform, platform.previousY);
    }

    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const jump = engine.input.isActionDown('jump');
    const axisX = (right ? 1 : 0) - (left ? 1 : 0);

    this.player.vx += axisX * this.player.moveSpeed * dt;
    if (axisX === 0) this.player.vx *= 0.82;
    this.player.vx = clamp(this.player.vx, -this.player.maxVx, this.player.maxVx);
    this.player.vy = clamp(this.player.vy + this.player.gravity * dt, -this.player.maxVy, this.player.maxVy);

    if (jump && !this.lastJump && this.player.onGround) {
      this.player.vy = -this.player.jumpSpeed;
      this.player.onGround = false;
    }
    this.lastJump = jump;

    const solids = [...this.staticSolids, ...this.platforms];
    moveAgainstSolids(this.player, this.player.vx * dt, 0, solids);
    this.player.onGround = false;
    moveAgainstSolids(this.player, 0, this.player.vy * dt, solids);

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample58',
      'Introduces moving platforms and actor carry behavior.',
      'Stand on the cyan platforms and verify that the actor rides with them.',
      'Use A/D or Left/Right. Press Space to jump.',
      'Horizontal and vertical platform motion are both demonstrated.',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    for (const solid of this.staticSolids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      if (solid.label) drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }
    for (const platform of this.platforms) {
      drawWorldRect(renderer, this.camera, platform, this.screen, '#06b6d4');
      drawWorldLabel(renderer, this.camera, platform, this.screen, platform.label);
    }

    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Moving Platforms', [
      `Player: ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`,
      `Grounded: ${this.player.onGround}`,
      `Platform A: ${this.platforms[0].x.toFixed(1)}, ${this.platforms[0].y.toFixed(1)}`,
      `Platform B: ${this.platforms[1].x.toFixed(1)}, ${this.platforms[1].y.toFixed(1)}`,
    ]);
  }
}
