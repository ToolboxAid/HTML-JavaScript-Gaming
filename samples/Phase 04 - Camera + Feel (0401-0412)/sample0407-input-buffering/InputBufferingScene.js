/*
Toolbox Aid
David Quesenberry
03/22/2026
InputBufferingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class InputBufferingScene extends Scene {
  constructor() {
    super();
    this.jumpBufferSeconds = 0.18;
    this.screen = { x: 60, y: 180, width: 860, height: 300 };
    this.floorY = this.screen.y + 224;
    this.bufferBand = {
      x: this.screen.x + 70,
      y: this.floorY - 76,
      width: this.screen.width - 140,
      height: 76,
    };
    this.successes = 0;
    this.failures = 0;
    this.reset();
  }

  reset() {
    this.player = {
      x: this.screen.x + 170,
      y: this.screen.y + 18,
      width: 30,
      height: 40,
      vy: 0,
      gravity: 1250,
      jumpSpeed: 520,
      onGround: false,
      bufferedJumpFired: false,
    };
    this.resetTimer = 0;
    this.message = 'Press Space just before landing.';
  }

  triggerBufferedJump(engine) {
    this.player.vy = -this.player.jumpSpeed;
    this.player.onGround = false;
    this.player.bufferedJumpFired = true;
    engine.input.consumeActionBuffer('jump');
    this.successes += 1;
    this.message = 'Buffered jump executed on landing.';
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    if (this.resetTimer > 0) {
      this.resetTimer -= dt;
      if (this.resetTimer <= 0) {
        this.reset();
      }
      return;
    }

    const wasOnGround = this.player.onGround;

    this.player.vy += this.player.gravity * dt;
    this.player.y += this.player.vy * dt;

    if (this.player.y + this.player.height >= this.floorY) {
      this.player.y = this.floorY - this.player.height;
      this.player.vy = 0;
      this.player.onGround = true;
    } else {
      this.player.onGround = false;
    }

    const landedThisFrame = !wasOnGround && this.player.onGround;

    if (landedThisFrame && !this.player.bufferedJumpFired) {
      if (engine.input.isActionBuffered('jump')) {
        this.triggerBufferedJump(engine);
        return;
      }

      this.failures += 1;
      this.message = 'No buffered jump was waiting. Resetting...';
      this.resetTimer = 0.9;
      return;
    }

    if (this.player.onGround && this.player.bufferedJumpFired) {
      this.message = 'Buffered jump complete. Resetting...';
      this.resetTimer = 1.0;
    }
  }

  render(renderer, engine) {
    const bufferTime = engine.input.getActionBufferTime('jump');

    drawFrame(renderer, theme, [
      'Engine Sample79',
      'Press Space a little before landing to queue the jump.',
      this.message,
    ]);

    renderer.drawRect(this.screen.x, this.screen.y, this.screen.width, this.screen.height, 'rgba(20, 24, 38, 0.92)');
    renderer.strokeRect(this.screen.x, this.screen.y, this.screen.width, this.screen.height, '#d8d5ff', 2);

    renderer.drawRect(this.bufferBand.x, this.bufferBand.y, this.bufferBand.width, this.bufferBand.height, 'rgba(251, 191, 36, 0.12)');
    renderer.strokeRect(this.bufferBand.x, this.bufferBand.y, this.bufferBand.width, this.bufferBand.height, '#fbbf24', 2);
    renderer.drawText('Buffer timing window', this.bufferBand.x + 12, this.bufferBand.y + 22, {
      color: '#fef3c7',
      font: '14px monospace',
    });

    for (let x = this.screen.x; x <= this.screen.x + this.screen.width; x += 40) {
      renderer.strokeRect(x, this.screen.y, 1, this.screen.height, 'rgba(221, 221, 221, 0.06)', 1);
    }

    renderer.drawRect(this.screen.x + 40, this.floorY, this.screen.width - 80, 22, '#60a5fa');
    renderer.drawRect(this.screen.x + 90, this.screen.y + 86, 160, 16, '#22c55e');
    renderer.drawRect(this.screen.x + 560, this.screen.y + 110, 180, 16, '#ef4444');

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x - 4, this.player.y - 4, this.player.width + 8, this.player.height + 8, 'rgba(237, 151, 0, 0.28)', 2);

    drawPanel(renderer, 620, 34, 300, 146, 'Input Buffer Debug', [
      `Jump buffer: ${(this.jumpBufferSeconds * 1000).toFixed(0)}ms`,
      `Buffered now: ${engine.input.isActionBuffered('jump')}`,
      `Buffer time: ${(bufferTime * 1000).toFixed(0)}ms`,
      `Successes: ${this.successes}`,
      `Failures: ${this.failures}`,
    ]);
  }
}
