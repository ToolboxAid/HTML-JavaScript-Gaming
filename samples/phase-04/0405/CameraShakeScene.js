/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraShakeScene.js
*/
import { Scene } from "/src/engine/scenes/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class CameraShakeScene extends Scene {
  constructor() {
    super();
    this.bounds = {
      x: 60,
      y: 180,
      width: 840,
      height: 280,
    };

    this.world = {
      width: 1600,
      height: 800,
    };

    this.actor = {
      x: 180,
      y: 320,
      width: 34,
      height: 34,
      speed: 240,
      velocityX: 1,
      velocityY: 0,
    };

    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
    this.note = "The inner playfield jitters to simulate camera shake.";
    this.time = 0;
    this.shakeTime = 0;
    this.shakeDuration = 0;
    this.shakeStrength = 0;
  }

  update(dtSeconds) {
    this.time += dtSeconds;
    this.actor.x += this.actor.velocityX * this.actor.speed * dtSeconds;
    this.actor.y += this.actor.velocityY * this.actor.speed * dtSeconds;

    const minX = this.bounds.x + 20;
    const maxX = this.bounds.x + this.bounds.width - this.actor.width - 20;
    const minY = this.bounds.y + 20;
    const maxY = this.bounds.y + this.bounds.height - this.actor.height - 20;

    if (this.actor.x <= minX) {
      this.actor.x = minX;
      this.actor.velocityX = 1;
      this.shakeDuration = 0.18;
      this.shakeStrength = 6;
    }

    if (this.actor.x >= maxX) {
      this.actor.x = maxX;
      this.actor.velocityX = -1;
      this.shakeDuration = 0.18;
      this.shakeStrength = 6;
    }

    if (this.actor.y <= minY) {
      this.actor.y = minY;
      this.actor.velocityY = 1;
      this.shakeDuration = 0.18;
      this.shakeStrength = 6;
    }

    if (this.actor.y >= maxY) {
      this.actor.y = maxY;
      this.actor.velocityY = -1;
      this.shakeDuration = 0.18;
      this.shakeStrength = 6;
    }

    if (this.shakeDuration > 0) {
      this.shakeDuration -= dtSeconds;
      this.shakeTime += dtSeconds;
    } else {
      this.shakeStrength = 0;
    }
  }

  drawWorld(renderer, actorFill) {
    renderer.drawRect(84, 224, 120, 20, '#22c55e');
    renderer.drawRect(238, 332, 180, 20, '#60a5fa');
    renderer.drawRect(470, 272, 110, 20, '#fbbf24');
    renderer.drawRect(640, 388, 150, 20, '#ef4444');

    renderer.strokeRect(154, 248, 150, 112, 'rgba(221, 221, 221, 0.18)', 2);
    renderer.strokeRect(488, 222, 100, 84, 'rgba(251, 191, 36, 0.28)', 2);

    renderer.drawCircle(this.actor.x + 17, this.actor.y + 17, 18, 'rgba(237, 151, 0, 0.20)');
    renderer.drawRect(this.actor.x - 6, this.actor.y - 6, this.actor.width + 12, this.actor.height + 12, 'rgba(237, 151, 0, 0.14)');
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, actorFill);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();
    const canvasBackground = theme.getColor('canvasBackground');
    const panel = theme.getColor('panelFill');
    const border = theme.getColor('panelBorder');
    const text = theme.getColor('textCanvs');
    const actorFill = theme.getColor('actorFill');
    const shakeX = this.shakeStrength > 0 ? Math.round(Math.sin(this.shakeTime * 32) * this.shakeStrength) : 0;
    const shakeY = this.shakeStrength > 0 ? Math.round(Math.cos(this.shakeTime * 27) * (this.shakeStrength * 0.7)) : 0;
    const ctx = renderer.ctx;

    renderer.clear(canvasBackground);
    renderer.strokeRect(10, 10, width - 20, height - 20, "#dddddd", 2);
    renderer.drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, panel);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, border, 3);

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.bounds.x + 10, this.bounds.y + 10, this.bounds.width - 20, this.bounds.height - 20);
    ctx.clip();
    ctx.translate(shakeX, shakeY);
    this.drawWorld(renderer, actorFill);
    ctx.restore();

    renderer.strokeRect(this.bounds.x + 10, this.bounds.y + 10, this.bounds.width - 20, this.bounds.height - 20, '#dddddd', 2);
    renderer.drawRect(this.bounds.x + 26, this.bounds.y + 28, 12, 12, '#ef4444');
    renderer.drawRect(this.bounds.x + this.bounds.width - 38, this.bounds.y + 28, 12, 12, '#ef4444');
    renderer.drawRect(this.bounds.x + 26, this.bounds.y + this.bounds.height - 38, 12, 12, '#ef4444');
    renderer.drawRect(this.bounds.x + this.bounds.width - 38, this.bounds.y + this.bounds.height - 38, 12, 12, '#ef4444');

    const lines = [
      "sample 0327 - Camera Shake",
      this.note,
      "The camera window jitters, while the outer frame stays still.",
      `Impact shake offset: ${shakeX}, ${shakeY}`,
    ];

    for (let i = 0; i < lines.length; i += 1) {
      renderer.drawText(lines[i], this.textStartX, this.textStartY + (i * this.textLineHeight), {
        color: text,
        font: "16px monospace",
      });
    }
  }
}
