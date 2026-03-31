/*
Toolbox Aid
David Quesenberry
03/21/2026
TriggerZonesScene.js
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


export default class TriggerZonesScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({ viewportWidth: 860, viewportHeight: 300, worldWidth: this.world.width, worldHeight: this.world.height });
    this.player = { x: 120, y: 320, width: 28, height: 40, vx: 0, vy: 0, gravity: 1100, moveSpeed: 2100, jumpSpeed: 430, maxVx: 320, maxVy: 760, onGround: false };
    this.solids = [
      { x: 0, y: 380, width: 1280, height: 48, label: 'floor' },
      { x: 260, y: 300, width: 120, height: 18, label: 'ledge' },
      { x: 620, y: 260, width: 120, height: 18, label: 'ledge' },
    ];
    this.zones = [
      { id: 'alpha', x: 220, y: 260, width: 160, height: 120, color: '#0891b2', label: 'alpha' },
      { id: 'beta', x: 560, y: 220, width: 180, height: 160, color: '#16a34a', label: 'beta' },
      { id: 'gamma', x: 860, y: 180, width: 180, height: 200, color: '#f97316', label: 'gamma' },
    ];
    this.activeZoneIds = new Set();
    this.message = 'Walk through a colored zone.';
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

    for (const zone of this.zones) {
      const isInside = overlap(this.player, zone);
      const wasInside = this.activeZoneIds.has(zone.id);
      if (isInside && !wasInside) {
        this.activeZoneIds.add(zone.id);
        this.message = `ENTER ${zone.label.toUpperCase()}`;
      } else if (!isInside && wasInside) {
        this.activeZoneIds.delete(zone.id);
        this.message = `EXIT ${zone.label.toUpperCase()}`;
      }
    }

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample61',
      'Introduces enter / exit trigger zones.',
      'Trigger regions are not solid; they only report overlap state changes.',
      this.message,
      `Active zones: ${Array.from(this.activeZoneIds).join(', ') || 'none'}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    for (const zone of this.zones) {
      drawWorldRect(renderer, this.camera, zone, this.screen, zone.color);
      drawWorldLabel(renderer, this.camera, zone, this.screen, zone.label);
    }
    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
      drawWorldLabel(renderer, this.camera, solid, this.screen, solid.label);
    }
    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Trigger Zones', [
      this.message,
      `Active zones: ${Array.from(this.activeZoneIds).join(', ') || 'none'}`,
      'Colored regions are overlap-only triggers',
      'Enter and exit are detected from state transitions',
    ]);
  }
}
