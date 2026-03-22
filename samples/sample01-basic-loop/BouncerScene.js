/*
Toolbox Aid
David Quesenberry
03/21/2026
BouncerScene.js
*/
import Scene from "../../engine/scenes/Scene.js";
import { Theme, ThemeTokens } from "../../engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class BouncerScene extends Scene {
  constructor() {
    super();
    this.radius = 18;

    this.bounds = {
      x: 60,
      y: 180,
      width: 840,
      height: 280,
    };

    this.x = this.bounds.x + 80;
    this.y = this.bounds.y + 70;
    this.velocityX = 220;
    this.velocityY = 160;

    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
  }

  update(dtSeconds) {
    this.x += this.velocityX * dtSeconds;
    this.y += this.velocityY * dtSeconds;

    const minX = this.bounds.x + this.radius;
    const maxX = this.bounds.x + this.bounds.width - this.radius;
    const minY = this.bounds.y + this.radius;
    const maxY = this.bounds.y + this.bounds.height - this.radius;

    if (this.x <= minX) {
      this.x = minX;
      this.velocityX *= -1;
    }

    if (this.x >= maxX) {
      this.x = maxX;
      this.velocityX *= -1;
    }

    if (this.y <= minY) {
      this.y = minY;
      this.velocityY *= -1;
    }

    if (this.y >= maxY) {
      this.y = maxY;
      this.velocityY *= -1;
    }
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();

    renderer.clear(theme.getColor("canvasBackground"));

    const pad = 10;
    renderer.strokeRect(pad, pad, width - pad * 2, height - pad * 2, "#dddddd", 2);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, "#d8d5ff", 3);

    renderer.drawCircle(this.x, this.y, this.radius, theme.getColor("actorFill"));

    const lines = [
      "Engine Sample01",
      "Demonstrates the core engine loop and bounded motion",
      "The ball updates every frame and bounces inside the rectangle",
      "Observe edge response inside the play area",
      "This sample now matches the shared themed sample style",
    ];

    lines.forEach((line, index) => {
      renderer.drawText(line, this.textStartX, this.textStartY + this.textLineHeight * index, {
        color: theme.getColor("textCanvs"),
        font: "16px monospace",
      });
    });
  }
}
