/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraSmoothingScene.js
*/
import { Scene } from "/src/engine/scene/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class CameraSmoothingScene extends Scene {
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
    this.note = "The camera box follows the actor with visible lag.";
    this.camera = {
      x: 120,
      y: 250,
      width: 260,
      height: 170,
      targetX: 120,
      targetY: 250,
    };
  }

  update(dtSeconds) {
    this.actor.x += this.actor.velocityX * this.actor.speed * dtSeconds;
    this.actor.y += this.actor.velocityY * this.actor.speed * dtSeconds;

    const minX = this.bounds.x + 20;
    const maxX = this.bounds.x + this.bounds.width - this.actor.width - 20;
    const minY = this.bounds.y + 20;
    const maxY = this.bounds.y + this.bounds.height - this.actor.height - 20;

    if (this.actor.x <= minX) {
      this.actor.x = minX;
      this.actor.velocityX = 1;
    }

    if (this.actor.x >= maxX) {
      this.actor.x = maxX;
      this.actor.velocityX = -1;
    }

    if (this.actor.y <= minY) {
      this.actor.y = minY;
      this.actor.velocityY = 1;
    }

    if (this.actor.y >= maxY) {
      this.actor.y = maxY;
      this.actor.velocityY = -1;
    }

    const targetX = this.actor.x - 110;
    const targetY = this.actor.y - 70;
    const smoothing = 1 - Math.pow(0.012, dtSeconds);
    this.camera.x += (targetX - this.camera.x) * smoothing;
    this.camera.y += (targetY - this.camera.y) * smoothing;
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();
    const canvasBackground = theme.getColor('canvasBackground');
    const panel = theme.getColor('panelFill');
    const border = theme.getColor('panelBorder');
    const text = theme.getColor('textCanvs');
    const actorFill = theme.getColor('actorFill');

    renderer.clear(canvasBackground);
    renderer.strokeRect(10, 10, width - 20, height - 20, "#dddddd", 2);
    renderer.drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, panel);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, border, 3);

    renderer.strokeRect(this.bounds.x + 20, this.bounds.y + 20, this.bounds.width - 40, this.bounds.height - 40, '#dddddd', 2);
    renderer.strokeRect(this.camera.x, this.camera.y, 72, 48, '#60a5fa', 4);
    renderer.strokeRect(this.camera.x + 10, this.camera.y + 10, 52, 28, 'rgba(96, 165, 250, 0.45)', 2);

    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, actorFill);
    renderer.drawRect(this.actor.x + 54, this.actor.y + 14, 12, 12, '#fbbf24');

    const lines = [
      "sample 0327 - Camera Smoothing",
      this.note,
      "The orange box is the actor target.",
      "The blue box follows behind it and smooths the movement.",
    ];

    for (let i = 0; i < lines.length; i += 1) {
      renderer.drawText(lines[i], this.textStartX, this.textStartY + (i * this.textLineHeight), {
        color: text,
        font: "16px monospace",
      });
    }
  }
}
