/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraDeadZoneScene.js
*/
import Scene from "../../engine/scenes/Scene.js";
import { Theme, ThemeTokens } from "../../engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class CameraDeadZoneScene extends Scene {
  constructor() {
    super();
    this.bounds = {
      x: 60,
      y: 180,
      width: 815,
      height: 280,
    };

    this.world = {
      width: 900,
      height: 500,
    };

    this.actor = {
      x: 180,
      y: 220,
      width: 34,
      height: 34,
      speed: 180,
      velocityX: 1,
      velocityY: 0,
    };

    this.camera = {
      x: 0,
      y: 170,
      width: 620,
      height: 150,
    };

    this.followMarginLeft = 200;
    this.followMarginRight = 200;

    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
    this.note = "The camera waits until the actor leaves the yellow dead zone.";
  }

  update(dtSeconds) {
    this.actor.x += this.actor.velocityX * this.actor.speed * dtSeconds;
    const minX = 40;
    const maxX = this.world.width - this.actor.width - 40;

    if (this.actor.x <= minX) {
      this.actor.x = minX;
      this.actor.velocityX = 1;
    }

    if (this.actor.x >= maxX) {
      this.actor.x = maxX;
      this.actor.velocityX = -1;
    }

    const deadZoneLeft = this.camera.x + this.followMarginLeft;
    const deadZoneRight = this.camera.x + this.camera.width - this.followMarginRight - this.actor.width;

    if (this.actor.x < deadZoneLeft) {
      this.camera.x = Math.max(0, this.actor.x - this.followMarginLeft);
    } else if (this.actor.x > deadZoneRight) {
      this.camera.x = Math.min(
        this.world.width - this.camera.width,
        this.actor.x + this.actor.width + this.followMarginRight - this.camera.width
      );
    }

    this.camera.x = Math.max(0, Math.min(this.camera.x, this.world.width - this.camera.width));
    this.camera.y = 170;
  }

  drawWorld(renderer) {
    const ctx = renderer.ctx;
    ctx.fillStyle = '#1b1245';
    ctx.fillRect(0, 0, this.world.width, this.world.height);

    for (let x = 0; x <= this.world.width; x += 40) {
      ctx.strokeStyle = 'rgba(221, 221, 221, 0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.world.height);
      ctx.stroke();
    }

    for (let y = 0; y <= this.world.height; y += 40) {
      ctx.strokeStyle = 'rgba(221, 221, 221, 0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.world.width, y);
      ctx.stroke();
    }

    renderer.drawRect(80, 380, 180, 18, '#22c55e');
    renderer.drawRect(360, 300, 140, 18, '#60a5fa');
    renderer.drawRect(580, 220, 160, 18, '#fbbf24');
    renderer.drawRect(900, 350, 200, 18, '#ef4444');
    renderer.drawRect(1320, 260, 180, 18, '#f97316');
    renderer.drawRect(1780, 330, 150, 18, '#22c55e');
    renderer.strokeRect(300, 160, 220, 120, 'rgba(221, 221, 221, 0.18)', 2);
    renderer.strokeRect(740, 140, 160, 100, 'rgba(251, 191, 36, 0.28)', 2);
    renderer.strokeRect(1520, 120, 180, 130, 'rgba(96, 165, 250, 0.24)', 2);
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();
    const canvasBackground = theme.getColor('canvasBackground');
    const panel = theme.getColor('panelFill');
    const border = theme.getColor('panelBorder');
    const text = theme.getColor('textCanvs');
    const actorFill = theme.getColor('actorFill');
    const ctx = renderer.ctx;
    const view = {
      x: this.bounds.x + 80,
      y: this.bounds.y + 34,
      width: this.bounds.width - 160,
      height: this.bounds.height - 88,
    };

    
    const zone = {
      x: view.x + this.followMarginLeft,
      y: view.y + 28,
      width: view.width - this.followMarginLeft - this.followMarginRight - this.actor.width,
      height: view.height - 56 - this.actor.height,
    };

    renderer.clear(canvasBackground);
    renderer.strokeRect(10, 10, width - 20, height - 20, "#dddddd", 2);
    renderer.drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, panel);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, border, 3);

    renderer.strokeRect(this.bounds.x + 14, this.bounds.y + 18, this.bounds.width - 28, this.bounds.height - 36, '#dddddd', 2);
    renderer.drawRect(view.x, view.y, view.width, view.height, 'rgba(32, 18, 69, 0.92)');
    renderer.strokeRect(view.x, view.y, view.width, view.height, '#60a5fa', 4);

    ctx.save();
    ctx.beginPath();
    ctx.rect(view.x, view.y, view.width, view.height);
    ctx.clip();
    ctx.translate(view.x - this.camera.x, view.y - this.camera.y);
    this.drawWorld(renderer);
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, actorFill);
    ctx.restore();

    renderer.strokeRect(zone.x, zone.y, zone.width, zone.height, '#fbbf24', 4);
    renderer.drawRect(zone.x, zone.y, zone.width, zone.height, 'rgba(251, 191, 36, 0.16)');

    renderer.drawRect(view.x + 16, view.y + 16, 14, 14, '#22c55e');
    renderer.drawRect(view.x + view.width - 30, view.y + view.height - 30, 14, 14, '#ef4444');

    const lines = [
      "Sample73 - Camera Dead Zone",
      this.note,
      "The blue box is the camera. Yellow marks the follow margin.",
      "The world scrolls only after the actor leaves the yellow zone.",
    ];

    for (let i = 0; i < lines.length; i += 1) {
      renderer.drawText(lines[i], this.textStartX, this.textStartY + (i * this.textLineHeight), {
        color: text,
        font: "16px monospace",
      });
    }
  }
}
