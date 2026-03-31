/*
Toolbox Aid
David Quesenberry
03/21/2026
LaddersClimbZonesScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, followCameraTarget } from '../../../engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  moveAgainstSolids,
  overlap,
} from '../../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);

export default class LaddersClimbZonesScene extends Scene {
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
      moveSpeed: 840,
      climbSpeed: 150,
      jumpSpeed: 420,
      maxVx: 220,
      maxVy: 760,
      onGround: false,
      onLadder: false,
    };

    this.solids = [
      { x: 0, y: 360, width: 1280, height: 48, label: 'floor' },
    ];
    this.platforms = [
      { x: 320, y: 264, width: 224, height: 16, label: 'upper floor' },
      { x: 760, y: 216, width: 160, height: 16, label: 'high platform' },
    ];
    this.ladders = [
      { x: 404, y: 264, width: 56, height: 96, label: 'ladder' },
      { x: 820, y: 216, width: 40, height: 144, label: 'ladder' },
    ];
    this.lastJump = false;
  }

  resolveVerticalMotion(dy) {
    if (dy === 0) {
      return;
    }

    const previousBottom = this.player.y + this.player.height;
    this.player.y += dy;
    this.player.onGround = false;

    if (dy > 0) {
      const surfaces = [...this.platforms, ...this.solids];
      for (const surface of surfaces) {
        const horizontalOverlap =
          this.player.x < surface.x + surface.width &&
          this.player.x + this.player.width > surface.x;
        const crossedTop =
          previousBottom <= surface.y &&
          this.player.y + this.player.height >= surface.y;
        if (horizontalOverlap && crossedTop) {
          this.player.y = surface.y - this.player.height;
          this.player.vy = 0;
          this.player.onGround = true;
          return;
        }
      }
    }
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const up = engine.input.isActionDown('move_up');
    const down = engine.input.isActionDown('move_down');
    const jump = engine.input.isActionDown('jump');
    const axisX = (right ? 1 : 0) - (left ? 1 : 0);
    const axisY = (down ? 1 : 0) - (up ? 1 : 0);

    this.player.onLadder = this.ladders.some((ladder) => overlap(this.player, ladder));

    if (this.player.onLadder) {
      this.player.vx = axisX * 120;
      this.player.vy = axisY !== 0 ? axisY * this.player.climbSpeed : 0;
    } else {
      this.player.vx += axisX * this.player.moveSpeed * dt;
      if (axisX === 0) this.player.vx *= 0.82;
      this.player.vy = clamp(this.player.vy + this.player.gravity * dt, -this.player.maxVy, this.player.maxVy);
    }

    if (jump && !this.lastJump && this.player.onGround && !this.player.onLadder) {
      this.player.vy = -this.player.jumpSpeed;
      this.player.onGround = false;
    }
    this.lastJump = jump;

    this.player.vx = clamp(this.player.vx, -this.player.maxVx, this.player.maxVx);
    moveAgainstSolids(this.player, this.player.vx * dt, 0, this.solids);
    this.resolveVerticalMotion(this.player.vy * dt);

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample57',
      'Introduces ladders and climb zones that suspend normal gravity while the actor is inside a ladder volume.',
      'Climb with W/S or Up/Down while overlapping a yellow ladder.',
      'Move horizontally to enter or leave the ladder volume.',
      `On ladder: ${this.player.onLadder}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      if (solid.label) drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }

    for (const platform of this.platforms) {
      drawWorldRect(renderer, this.camera, platform, this.screen, '#6366f1');
      if (platform.label) drawWorldLabel(renderer, this.camera, platform, this.screen, platform.label);
    }

    for (const ladder of this.ladders) {
      drawWorldRect(renderer, this.camera, ladder, this.screen, '#eab308');
      drawWorldLabel(renderer, this.camera, ladder, this.screen, ladder.label);
    }

    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Ladders / Climb Zones', [
      `Player: ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`,
      `Velocity: ${this.player.vx.toFixed(1)}, ${this.player.vy.toFixed(1)}`,
      `On ladder: ${this.player.onLadder}`,
      'Yellow zones disable falling while climbing',
    ]);
  }
}
