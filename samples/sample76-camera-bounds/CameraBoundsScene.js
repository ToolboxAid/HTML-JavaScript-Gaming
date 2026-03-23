/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraBoundsScene.js
*/
import { Scene } from "../../engine/scenes/index.js";
import { Theme, ThemeTokens } from "../../engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class CameraBoundsScene extends Scene {
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
    this.note = "The camera window is clamped inside the blue world frame.";
    this.camera = {
      x: 0,
      y: 0,
      width: 260,
      height: 160,
      speedX: 1,
      speedY: 0.75,
    };
  }

  update(dtSeconds) {
    this.camera.x += this.camera.speedX * 180 * dtSeconds;
    this.camera.y += this.camera.speedY * 120 * dtSeconds;

    const minX = this.bounds.x + 30;
    const maxX = this.bounds.x + this.bounds.width - this.camera.width - 30;
    const minY = this.bounds.y + 30;
    const maxY = this.bounds.y + this.bounds.height - this.camera.height - 30;

    if (this.camera.x <= minX) {
      this.camera.x = minX;
      this.camera.speedX = 1;
    }

    if (this.camera.x >= maxX) {
      this.camera.x = maxX;
      this.camera.speedX = -1;
    }

    if (this.camera.y <= minY) {
      this.camera.y = minY;
      this.camera.speedY = 0.75;
    }

    if (this.camera.y >= maxY) {
      this.camera.y = maxY;
      this.camera.speedY = -0.75;
    }
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

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#60a5fa', 4);
    renderer.strokeRect(this.camera.x, this.camera.y, this.camera.width, this.camera.height, 'rgba(96, 165, 250, 0.45)', 4);
    renderer.strokeRect(this.camera.x + 24, this.camera.y + 24, this.camera.width - 48, this.camera.height - 48, 'rgba(251, 191, 36, 0.45)', 3);

    renderer.drawRect(this.camera.x + 18, this.camera.y + 20, 18, 18, '#22c55e');
    renderer.drawRect(this.camera.x + this.camera.width - 36, this.camera.y + this.camera.height - 38, 18, 18, '#ef4444');

    const lines = [
      "Sample76 - Camera Bounds",
      this.note,
      "The blue frame is the world boundary.",
      "The light-blue box is the camera window moving inside it.",
    ];

    for (let i = 0; i < lines.length; i += 1) {
      renderer.drawText(lines[i], this.textStartX, this.textStartY + (i * this.textLineHeight), {
        color: text,
        font: "16px monospace",
      });
    }
  }
}
