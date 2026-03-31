/*
Toolbox Aid
David Quesenberry
03/21/2026
FrictionSurfacesScene.js
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
  getSurfaceUnderPlayer,
} from '../../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);

export default class FrictionSurfacesScene extends Scene {
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
      moveSpeed: 2080,
      jumpSpeed: 430,
      maxVx: 340,
      maxVy: 760,
      onGround: false,
    };

    this.solids = [
      { x: 0, y: 360, width: 1280, height: 48, label: 'floor' },
    ];

    this.surfaces = [
      { x: 260, y: 312, width: 220, height: 48, drag: 0.985, accelScale: 0.55, color: '#60a5fa', label: 'ice' },
      { x: 640, y: 312, width: 220, height: 48, drag: 0.45, accelScale: 1.4, color: '#92400e', label: 'mud' },
    ];
    this.activeSurface = 'default';
    this.lastJump = false;
  }

  update(dt, engine) {
    const surface = getSurfaceUnderPlayer(this.player, this.surfaces);
    this.activeSurface = surface ? surface.label : 'default';
    const drag = surface ? surface.drag : 0.82;
    const accelScale = surface ? surface.accelScale : 1;

    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const jump = engine.input.isActionDown('jump');
    const axisX = (right ? 1 : 0) - (left ? 1 : 0);

    this.player.vx += axisX * this.player.moveSpeed * accelScale * dt;
    this.player.vx *= drag;
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

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample60',
      'Introduces authored friction surfaces such as ice and mud.',
      'Blue ice keeps momentum. Brown mud slows movement and increases traction.',
      'Move left/right across each surface and compare the feel.',
      `Active surface: ${this.activeSurface}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      if (solid.label) drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }
    for (const surface of this.surfaces) {
      drawWorldRect(renderer, this.camera, surface, this.screen, surface.color);
      drawWorldLabel(renderer, this.camera, surface, this.screen, surface.label);
    }

    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Friction Surfaces', [
      `Velocity X: ${this.player.vx.toFixed(1)}`,
      `Active surface: ${this.activeSurface}`,
      'Blue = ice / Brown = mud',
      'Surface data changes drag + horizontal acceleration scale',
    ]);
  }
}
