/*
Toolbox Aid
David Quesenberry
03/21/2026
SwitchesButtonsScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { Camera2D, followCameraTarget } from '../../../src/engine/camera/index.js';
import {
  clamp,
  drawWorldRect,
  drawWorldLabel,
  moveAgainstSolids,
  overlap,
} from '../../_shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);


export default class SwitchesButtonsScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({ viewportWidth: 860, viewportHeight: 300, worldWidth: this.world.width, worldHeight: this.world.height });
    this.player = { x: 120, y: 320, width: 28, height: 40, vx: 0, vy: 0, gravity: 1100, moveSpeed: 2100, jumpSpeed: 430, maxVx: 320, maxVy: 760, onGround: false };
    this.floor = { x: 0, y: 380, width: 1280, height: 48, label: 'floor' };
    this.column = { x: 660, y: 308, width: 24, height: 72, label: 'column' };
    this.floorButton = { x: 300, y: 360, width: 60, height: 20, color: '#ef4444', label: 'button', pressed: false };
    this.wallSwitch = { x: 720, y: 300, width: 24, height: 60, color: '#fbbf24', label: 'switch', on: false };
    this.message = 'Step on the button or press E at the switch.';
    this.lastJump = false;
    this.lastInteract = false;
  }

  getActiveSolids() {
    return [
      this.floor,
      ...(this.wallSwitch.on ? [] : [this.column]),
    ];
  }

  getSwitchZone() {
    return {
      x: this.wallSwitch.x - 36,
      y: this.wallSwitch.y - 14,
      width: this.wallSwitch.width + 72,
      height: this.wallSwitch.height + 28,
    };
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const jump = engine.input.isActionDown('jump');
    const interact = engine.input.isDown('KeyE');
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

    moveAgainstSolids(this.player, this.player.vx * dt, 0, this.getActiveSolids());
    this.player.onGround = false;
    moveAgainstSolids(this.player, 0, this.player.vy * dt, this.getActiveSolids());

    this.floorButton.pressed = false;
    this.floorButton.pressed = overlap(this.player, this.floorButton);
    if (this.floorButton.pressed) {
      this.message = 'Floor button is pressed.';
    }

    const interactRange = this.getSwitchZone();
    if (interact && !this.lastInteract && overlap(this.player, interactRange)) {
      this.wallSwitch.on = !this.wallSwitch.on;
      this.message = `Wall switch turned ${this.wallSwitch.on ? 'ON' : 'OFF'}.`;
    }
    this.lastInteract = interact;

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0315',
      'Introduces switches and buttons.',
      'Red floor button activates by contact. Yellow switch toggles with E.',
      this.message,
      `Button: ${this.floorButton.pressed} / Switch: ${this.wallSwitch.on}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    drawWorldRect(renderer, this.camera, this.floor, this.screen, '#4338ca');
    drawWorldLabel(renderer, this.camera, this.floor, this.screen, this.floor.label);
    drawWorldRect(renderer, this.camera, this.getSwitchZone(), this.screen, '#1f2937');
    drawWorldLabel(renderer, this.camera, this.getSwitchZone(), this.screen, 'switch zone', '#cbd5e1');
    drawWorldRect(renderer, this.camera, this.column, this.screen, this.wallSwitch.on ? '#94a3b8' : '#4338ca');
    drawWorldLabel(renderer, this.camera, this.column, this.screen, this.wallSwitch.on ? 'column retracted' : this.column.label);
    drawWorldRect(renderer, this.camera, this.floorButton, this.screen, this.floorButton.pressed ? '#fca5a5' : this.floorButton.color);
    drawWorldLabel(renderer, this.camera, this.floorButton, this.screen, 'floor button');
    drawWorldRect(renderer, this.camera, this.wallSwitch, this.screen, this.wallSwitch.on ? '#fde047' : this.wallSwitch.color);
    drawWorldLabel(renderer, this.camera, this.wallSwitch, this.screen, 'wall switch');
    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Switches / Buttons', [
      `Floor button: ${this.floorButton.pressed}`,
      `Wall switch: ${this.wallSwitch.on}`,
      this.message,
      'Contact = button / E key = switch',
    ]);
  }
}
