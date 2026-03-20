
import Scene from "../../../engine/v2/scenes/Scene.js";
import { Theme, ThemeTokens } from "../../../engine/v2/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class KeyboardMoveScene extends Scene {
  constructor() {
    super();
    this.bounds = {
      x: 180,
      y: 160,
      width: 600,
      height: 260,
    };

    this.box = {
      x: this.bounds.x + this.bounds.width / 2 - 20,
      y: this.bounds.y + this.bounds.height / 2 - 20,
      width: 40,
      height: 40,
      speed: 240,
    };

    this.textStartX = 40;
    this.textStartY = 50;
    this.textLineHeight = 24;
  }

  update(deltaTime, services = {}) {
    const input = services.input ?? services;
    if (!input || typeof input.isDown !== "function") {
      return;
    }

    const distance = this.box.speed * deltaTime;

    if (input.isDown("ArrowLeft")) {
      this.box.x -= distance;
    }

    if (input.isDown("ArrowRight")) {
      this.box.x += distance;
    }

    if (input.isDown("ArrowUp")) {
      this.box.y -= distance;
    }

    if (input.isDown("ArrowDown")) {
      this.box.y += distance;
    }

    this.clampBoxToBounds();
  }

  render(ctx, surface = {}) {
    const width = surface.width ?? ctx.canvas.width;
    const height = surface.height ?? ctx.canvas.height;

    ctx.fillStyle = theme.getColor("canvasBackground");
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#d8d5ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

    ctx.fillStyle = theme.getColor("actorFill");
    ctx.fillRect(this.box.x, this.box.y, this.box.width, this.box.height);

    ctx.fillStyle = theme.getColor("textCanvs");
    ctx.font = "16px monospace";
    ctx.fillText("Engine V2 Sample02", this.textStartX, this.textStartY);

    ctx.font = "16px monospace";
    const lines = [
      "Demonstrates the keyboard input boundary",
      "Use Arrow keys to move the box in four directions",
      "Observe movement driven by input state, not DOM events in the scene",
      "This sample reads InputService through a clean scene boundary",
    ];

    lines.forEach((line, index) => {
      ctx.fillText(line, this.textStartX, this.textStartY + this.textLineHeight * (index + 1));
    });
  }

  clampBoxToBounds() {
    const minX = this.bounds.x;
    const minY = this.bounds.y;
    const maxX = this.bounds.x + this.bounds.width - this.box.width;
    const maxY = this.bounds.y + this.bounds.height - this.box.height;

    this.box.x = Math.max(minX, Math.min(this.box.x, maxX));
    this.box.y = Math.max(minY, Math.min(this.box.y, maxY));
  }
}
