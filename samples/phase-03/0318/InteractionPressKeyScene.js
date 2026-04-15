/*
Toolbox Aid
David Quesenberry
03/21/2026
InteractionPressKeyScene.js
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
} from '../../shared/platformerHelpers.js';

const theme = new Theme(ThemeTokens);


export default class InteractionPressKeyScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.world = { width: 1280, height: 720 };
    this.camera = new Camera2D({ viewportWidth: 860, viewportHeight: 300, worldWidth: this.world.width, worldHeight: this.world.height });
    this.player = { x: 120, y: 320, width: 28, height: 40, vx: 0, vy: 0, gravity: 1100, moveSpeed: 2100, jumpSpeed: 430, maxVx: 320, maxVy: 760, onGround: false };
    this.solids = [
      { x: 0, y: 380, width: 1280, height: 48, label: 'floor' },
      { x: 740, y: 300, width: 120, height: 18, label: 'console step' },
    ];
    this.console = { x: 770, y: 252, width: 48, height: 48, active: false, label: 'console' };
    this.prompt = 'Walk to the console.';
    this.lastJump = false;
    this.lastInteract = false;
  }

  getInteractZone() {
    return { x: this.console.x - 28, y: this.console.y - 18, width: this.console.width + 56, height: this.console.height + 36 };
  }

  update(dt, engine) {
    const left = engine.input.isActionDown('move_left');
    const right = engine.input.isActionDown('move_right');
    const jump = engine.input.isActionDown('jump');
    const interact = engine.input.isActionDown('interact');
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

    const nearConsole = overlap(this.player, this.getInteractZone());
    this.prompt = nearConsole ? 'Press E to interact.' : 'Walk to the console.';

    if (nearConsole && interact && !this.lastInteract) {
      this.console.active = !this.console.active;
      this.prompt = `Console turned ${this.console.active ? 'ON' : 'OFF'}.`;
    }
    this.lastInteract = interact;

    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0318',
      'Introduces a generic press-key interaction pattern.',
      'Walk near the console to show the prompt, then press E.',
      this.prompt,
      `Console active: ${this.console.active}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    for (const solid of this.solids) {
      drawWorldRect(renderer, this.camera, solid, this.screen, '#4338ca');
    }
    const zone = this.getInteractZone();
    drawWorldRect(renderer, this.camera, zone, this.screen, '#1f2937');
    drawWorldLabel(renderer, this.camera, zone, this.screen, 'interact range');
    drawWorldRect(renderer, this.camera, this.console, this.screen, this.console.active ? '#22c55e' : '#f59e0b');
    drawWorldLabel(renderer, this.camera, this.console, this.screen, this.console.active ? 'console on' : 'console off');
    drawWorldRect(renderer, this.camera, this.player, this.screen, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'Press Key Interaction', [
      this.prompt,
      `Console active: ${this.console.active}`,
      'Approach target, show prompt, then accept E key',
      'This sample generalizes the interaction pattern',
    ]);
  }
}
